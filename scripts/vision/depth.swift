// Runs a Core ML depth model (Depth Anything V2 Small) on an image and writes the depth as a
// 16-bit greyscale PNG, near = white, normalised to the range found inside the picture.
// Prints JSON: the model's input size, the raw range, and the output size.
//
//   swift scripts/vision/depth.swift <model.mlpackage> <input image> <depth output .png> [pad colour, rrggbb]
//
// The model takes one fixed, landscape frame. The picture is fitted into it whole (bars of the pad
// colour at the sides of a portrait picture) instead of being squashed to fit, and the bars are
// cropped off the result. Used by scripts/vision/build-vision.mjs; the site shows this output as it is.
import AppKit
import CoreML
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 4, let image = NSImage(contentsOfFile: args[2]),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("usage: depth.swift <model.mlpackage> <image> <depth.png> [rrggbb]\n".data(using: .utf8)!)
  exit(1)
}
func fail(_ message: String) -> Never {
  FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
  exit(1)
}

let compiled = try MLModel.compileModel(at: URL(fileURLWithPath: args[1]))
// CPU only: the GPU and Neural Engine paths return slightly different numbers from run to run,
// and the baked map is content-hashed.
let configuration = MLModelConfiguration()
configuration.computeUnits = .cpuOnly
let model = try MLModel(contentsOf: compiled, configuration: configuration)
guard let input = model.modelDescription.inputDescriptionsByName.values.first(where: { $0.imageConstraint != nil }),
      let frame = input.imageConstraint else { fail("the model has no image input") }
let (W, H) = (frame.pixelsWide, frame.pixelsHigh)

// Fit the picture into the model's frame, centred, on the pad colour.
let pad = args.count > 4 ? (UInt32(args[4], radix: 16) ?? 0x808080) : 0x808080
let scale = min(Double(W) / Double(cg.width), Double(H) / Double(cg.height))
let fitted = CGRect(
  x: ((Double(W) - Double(cg.width) * scale) / 2).rounded(), y: ((Double(H) - Double(cg.height) * scale) / 2).rounded(),
  width: (Double(cg.width) * scale).rounded(), height: (Double(cg.height) * scale).rounded())
guard let canvas = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!,
                             bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { fail("could not create the input frame") }
canvas.setFillColor(CGColor(srgbRed: Double((pad >> 16) & 0xff) / 255, green: Double((pad >> 8) & 0xff) / 255, blue: Double(pad & 0xff) / 255, alpha: 1))
canvas.fill(CGRect(x: 0, y: 0, width: W, height: H))
canvas.interpolationQuality = .high
canvas.draw(cg, in: fitted)
guard let framed = canvas.makeImage() else { fail("could not render the input frame") }

let request = VNCoreMLRequest(model: try VNCoreMLModel(for: model))
request.imageCropAndScaleOption = .scaleFill // the frame is already the model's size
try VNImageRequestHandler(cgImage: framed, options: [:]).perform([request])

// The depth comes back as a one-channel half-float image (or, from some exports, a multi-array).
var values: [Float] = []
var (outW, outH) = (0, 0)
if let observation = request.results?.first as? VNPixelBufferObservation {
  let buffer = observation.pixelBuffer
  CVPixelBufferLockBaseAddress(buffer, .readOnly)
  defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }
  (outW, outH) = (CVPixelBufferGetWidth(buffer), CVPixelBufferGetHeight(buffer))
  guard let base = CVPixelBufferGetBaseAddress(buffer) else { fail("empty depth buffer") }
  let rowBytes = CVPixelBufferGetBytesPerRow(buffer)
  let format = CVPixelBufferGetPixelFormatType(buffer)
  values.reserveCapacity(outW * outH)
  for y in 0..<outH {
    let row = base.advanced(by: y * rowBytes)
    for x in 0..<outW {
      switch format {
      case kCVPixelFormatType_OneComponent16Half: values.append(Float(row.load(fromByteOffset: x * 2, as: Float16.self)))
      case kCVPixelFormatType_OneComponent32Float: values.append(row.load(fromByteOffset: x * 4, as: Float32.self))
      case kCVPixelFormatType_OneComponent8: values.append(Float(row.load(fromByteOffset: x, as: UInt8.self)))
      default: fail("unexpected depth pixel format \(format)")
      }
    }
  }
} else if let observation = request.results?.first as? VNCoreMLFeatureValueObservation, let array = observation.featureValue.multiArrayValue {
  let shape = array.shape.map { $0.intValue }
  (outH, outW) = (shape[shape.count - 2], shape[shape.count - 1])
  values = (0..<(outW * outH)).map { array[$0].floatValue }
} else {
  fail("the model returned no depth image")
}

// Crop the pad bars off (the frame's y axis runs upward, image rows run downward: the fit is
// centred, so the rect is the same either way), then normalise to the picture's own range.
let sx = Double(outW) / Double(W), sy = Double(outH) / Double(H)
let (x0, y0) = (Int((fitted.minX * sx).rounded(.up)), Int((fitted.minY * sy).rounded(.up)))
let (cw, ch) = (Int((fitted.width * sx).rounded(.down)), Int((fitted.height * sy).rounded(.down)))
var (lo, hi) = (Float.greatestFiniteMagnitude, -Float.greatestFiniteMagnitude)
for y in y0..<(y0 + ch) { for x in x0..<(x0 + cw) { let v = values[y * outW + x]; lo = min(lo, v); hi = max(hi, v) } }
guard hi > lo else { fail("the depth is flat") }
// host byte order: NSBitmapImageRep keeps 16-bit samples that way and the PNG encoder reorders them
var pixels = [UInt16](repeating: 0, count: cw * ch)
for y in 0..<ch { for x in 0..<cw { pixels[y * cw + x] = UInt16(((values[(y0 + y) * outW + x0 + x] - lo) / (hi - lo) * 65535).rounded()) } }

let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: cw, pixelsHigh: ch, bitsPerSample: 16, samplesPerPixel: 1, hasAlpha: false, isPlanar: false,
                           colorSpaceName: .calibratedWhite, bytesPerRow: cw * 2, bitsPerPixel: 16)!
pixels.withUnsafeBytes { rep.bitmapData!.update(from: $0.bindMemory(to: UInt8.self).baseAddress!, count: cw * ch * 2) }
guard let png = rep.representation(using: .png, properties: [:]) else { fail("could not encode the depth") }
try png.write(to: URL(fileURLWithPath: args[3]))

let report: [String: Any] = ["input": [W, H], "output": [outW, outH], "size": [cw, ch], "range": [Double(lo), Double(hi)]]
print(String(data: try JSONSerialization.data(withJSONObject: report, options: [.sortedKeys]), encoding: .utf8)!)
