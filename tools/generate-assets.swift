// Streamly asset generator — renders the PNG set (og-image, icons) from the
// SVG brand mark. macOS only (AppKit). Run from anywhere:
//   swift tools/generate-assets.swift
// Zero npm dependencies; committed output lives in assets/brand/.

import AppKit

let scriptURL = URL(fileURLWithPath: CommandLine.arguments[0]).resolvingSymlinksInPath()
let root = scriptURL.deletingLastPathComponent().deletingLastPathComponent()
let brand = root.appendingPathComponent("assets/brand")

func rgb(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(
    srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
    green: CGFloat((hex >> 8) & 0xFF) / 255,
    blue: CGFloat(hex & 0xFF) / 255,
    alpha: alpha)
}

let bg = rgb(0x08080e)
let text = rgb(0xf4f4f8)
let dim = rgb(0xa2a2b8)
let accent = rgb(0x8b5cf6)
let accent2 = rgb(0x22d3ee)

let mark = NSImage(contentsOfFile: brand.appendingPathComponent("logo.svg").path)

func makeRep(_ w: Int, _ h: Int) -> NSBitmapImageRep {
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: w, pixelsHigh: h,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  rep.size = NSSize(width: w, height: h)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  return rep
}

func finish(_ rep: NSBitmapImageRep, _ name: String) {
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .png, properties: [:])!
  try! data.write(to: brand.appendingPathComponent(name))
  print("  ok \(name)")
}

func fillBg(_ w: CGFloat, _ h: CGFloat) {
  bg.setFill()
  NSBezierPath(rect: NSRect(x: 0, y: 0, width: w, height: h)).fill()
}

func drawMark(x: CGFloat, y: CGFloat, size: CGFloat) {
  mark?.draw(in: NSRect(x: x, y: y, width: size, height: size))
}

// ---------------------------------------------------------------- icons ----
// Bitmaps start fully transparent, so "transparent background" = no fill.

do {
  let rep = makeRep(512, 512)
  drawMark(x: 51, y: 51, size: 410)
  finish(rep, "icon-512.png")
}

do {
  let rep = makeRep(512, 512)
  fillBg(512, 512)
  drawMark(x: 128, y: 128, size: 256)
  finish(rep, "icon-512-maskable.png")
}

do {
  let rep = makeRep(180, 180)
  fillBg(180, 180)
  drawMark(x: 26, y: 26, size: 128)
  finish(rep, "apple-touch-icon.png")
}

do {
  let rep = makeRep(48, 48)
  drawMark(x: 3, y: 3, size: 42)
  finish(rep, "favicon-48.png")
}

// ------------------------------------------------------------- og-image ----

do {
  let rep = makeRep(1200, 630)

  fillBg(1200, 630)

  if let glow = NSGradient(starting: accent.withAlphaComponent(0.42), ending: accent.withAlphaComponent(0)) {
    glow.draw(fromCenter: NSPoint(x: 260, y: 470), radius: 0.0, toCenter: NSPoint(x: 260, y: 470), radius: 430.0)
  }
  if let glow = NSGradient(starting: accent2.withAlphaComponent(0.34), ending: accent2.withAlphaComponent(0)) {
    glow.draw(fromCenter: NSPoint(x: 980, y: 520), radius: 0.0, toCenter: NSPoint(x: 980, y: 520), radius: 400.0)
  }

  // left: brand block
  drawMark(x: 90, y: 420, size: 96)
  func serif(_ size: CGFloat, _ weight: NSFont.Weight) -> NSFont {
    let base = NSFont.systemFont(ofSize: size, weight: weight)
    let desc = base.fontDescriptor.withDesign(.serif) ?? base.fontDescriptor
    return NSFont(descriptor: desc, size: size) ?? base
  }
  let word = NSAttributedString(string: "Streamly", attributes: [
    .font: serif(96, .bold),
    .foregroundColor: text,
  ])
  word.draw(at: NSPoint(x: 208, y: 430))
  if let underline = NSGradient(starting: accent, ending: accent2) {
    underline.draw(
      in: NSBezierPath(roundedRect: NSRect(x: 212, y: 402, width: 250, height: 8), xRadius: 4, yRadius: 4),
      angle: 0)
  }
  let tagline = NSAttributedString(string: "Stories worth staying in for.", attributes: [
    .font: serif(40, .medium),
    .foregroundColor: dim,
  ])
  tagline.draw(at: NSPoint(x: 212, y: 330))

  // right: three original posters, fanned
  let postersDir = root.appendingPathComponent("assets/img/posters")
  let fan: [(String, CGFloat, CGFloat, CGFloat)] = [
    // (file, center-x, center-y, rotation deg) — y is up, canvas is 630 tall
    ("poster-5.webp", 790, 315, 10),
    ("poster-2.webp", 900, 325, 0),
    ("poster-9.webp", 1010, 315, -10),
  ]
  for (file, cx, cy, angle) in fan {
    guard let art = NSImage(contentsOfFile: postersDir.appendingPathComponent(file).path) else { continue }
    let size = CGSize(width: 250, height: 375)
    NSGraphicsContext.current?.cgContext.saveGState()
    let transform = NSAffineTransform()
    transform.translateX(by: cx, yBy: cy)
    transform.rotate(byDegrees: angle)
    transform.concat()
    let shadow = NSShadow()
    shadow.shadowColor = NSColor.black.withAlphaComponent(0.55)
    shadow.shadowBlurRadius = 26
    shadow.shadowOffset = NSSize(width: 0, height: -10)
    shadow.set()
    art.draw(in: NSRect(x: -size.width / 2, y: -size.height / 2, width: size.width, height: size.height))
    NSGraphicsContext.current?.cgContext.restoreGState()
  }

  let foot = NSAttributedString(
    string: "An original portfolio project — semantic HTML, modern CSS, zero runtime dependencies",
    attributes: [
      .font: NSFont.systemFont(ofSize: 24, weight: .regular),
      .foregroundColor: dim,
    ])
  foot.draw(at: NSPoint(x: 92, y: 30))

  finish(rep, "og-image.png")
}

print("Done — PNGs written to assets/brand/")
