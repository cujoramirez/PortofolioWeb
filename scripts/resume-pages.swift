// Renders each page of a PDF to a PNG on white, `width` pixels wide: page-1.png, page-2.png, ...
// Used by build-images.mjs for the résumé's pages (the portal shows them where a browser cannot
// show a PDF inside a page). usage: swift resume-pages.swift <file.pdf> <outDir> <width>
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 4, let document = PDFDocument(url: URL(fileURLWithPath: args[1])), let width = Int(args[3]) else {
  FileHandle.standardError.write("usage: resume-pages.swift <file.pdf> <outDir> <width>\n".data(using: .utf8)!)
  exit(2)
}
for index in 0..<document.pageCount {
  guard let page = document.page(at: index) else { continue }
  let box = page.bounds(for: .cropBox)
  let scale = CGFloat(width) / box.width
  let height = Int((box.height * scale).rounded())
  guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpace(name: CGColorSpace.sRGB)!, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { exit(1) }
  context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.scaleBy(x: scale, y: scale)
  context.translateBy(x: -box.minX, y: -box.minY)
  page.draw(with: .cropBox, to: context)
  guard let image = context.makeImage(), let png = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { exit(1) }
  try png.write(to: URL(fileURLWithPath: "\(args[2])/page-\(index + 1).png"))
}
print(document.pageCount)
