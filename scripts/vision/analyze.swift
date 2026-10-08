// Runs Apple's Vision framework on an image and prints the results as JSON (image pixel
// coordinates, origin top-left). Writes the person-segmentation mask as a grayscale PNG.
//
//   swift scripts/vision/analyze.swift <input image> <mask output .png>
//
// Used by scripts/vision/build-vision.mjs; the site shows these outputs as they are.
import AppKit
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 3, let image = NSImage(contentsOfFile: args[1]),
      let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
  FileHandle.standardError.write("usage: analyze.swift <image> <mask.png>\n".data(using: .utf8)!)
  exit(1)
}
let W = Double(cg.width), H = Double(cg.height)

func rect(_ r: CGRect) -> [String: Double] {
  // Vision: normalized, origin bottom-left -> pixels, origin top-left
  ["x": r.minX * W, "y": (1 - r.maxY) * H, "w": r.width * W, "h": r.height * H]
}
func point(_ p: CGPoint) -> [Double] { [p.x * W, (1 - p.y) * H] }

let face = VNDetectFaceLandmarksRequest()
let human = VNDetectHumanRectanglesRequest()
human.upperBodyOnly = true
let pose = VNDetectHumanBodyPoseRequest()
let seg = VNGeneratePersonSegmentationRequest()
seg.qualityLevel = .accurate
seg.outputPixelFormat = kCVPixelFormatType_OneComponent8

let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([face, human, pose, seg])

var out: [String: Any] = ["width": W, "height": H, "framework": "Apple Vision"]

out["faces"] = (face.results ?? []).map { f -> [String: Any] in
  var d: [String: Any] = ["box": rect(f.boundingBox), "confidence": Double(f.confidence)]
  if let lm = f.landmarks {
    // landmark points are normalized to the face box
    func pts(_ region: VNFaceLandmarkRegion2D?) -> [[Double]] {
      guard let region else { return [] }
      return region.normalizedPoints.map { p in
        point(CGPoint(x: f.boundingBox.minX + p.x * f.boundingBox.width, y: f.boundingBox.minY + p.y * f.boundingBox.height))
      }
    }
    d["landmarks"] = [
      "faceContour": pts(lm.faceContour), "leftEye": pts(lm.leftEye), "rightEye": pts(lm.rightEye),
      "leftEyebrow": pts(lm.leftEyebrow), "rightEyebrow": pts(lm.rightEyebrow), "nose": pts(lm.nose),
      "noseCrest": pts(lm.noseCrest), "outerLips": pts(lm.outerLips), "innerLips": pts(lm.innerLips),
    ]
  }
  return d
}
out["people"] = (human.results ?? []).map { ["box": rect($0.boundingBox), "confidence": Double($0.confidence)] }
out["pose"] = (pose.results ?? []).map { obs -> [String: Any] in
  var joints: [String: Any] = [:]
  if let all = try? obs.recognizedPoints(.all) {
    for (name, p) in all where p.confidence > 0.1 {
      joints[name.rawValue.rawValue] = ["x": p.location.x * W, "y": (1 - p.location.y) * H, "confidence": Double(p.confidence)]
    }
  }
  return ["joints": joints, "confidence": Double(obs.confidence)]
}

if let buffer = seg.results?.first?.pixelBuffer {
  let ci = CIImage(cvPixelBuffer: buffer)
  let rep = NSBitmapImageRep(ciImage: ci)
  if let png = rep.representation(using: .png, properties: [:]) {
    try png.write(to: URL(fileURLWithPath: args[2]))
    out["mask"] = ["width": CVPixelBufferGetWidth(buffer), "height": CVPixelBufferGetHeight(buffer)]
  }
}

let json = try JSONSerialization.data(withJSONObject: out, options: [.prettyPrinted, .sortedKeys])
FileHandle.standardOutput.write(json)
