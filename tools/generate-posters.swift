// generate-posters.swift — draws the nine original Streamly poster artworks.
// Layered gradients, a distinct geometric motif per title, serif typography,
// film grain and vignette. 100% original output (no external imagery).
//
//   swift tools/generate-posters.swift
// → assets/img/posters/poster-<n>.png (converted to WebP by optimize-img.mjs)

import AppKit

let scriptURL = URL(fileURLWithPath: CommandLine.arguments[0]).resolvingSymlinksInPath()
let root = scriptURL.deletingLastPathComponent().deletingLastPathComponent()
let outDir = root.appendingPathComponent("assets/img/posters")
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

let W = 600.0, H = 900.0

// deterministic grain so regenerating gives identical posters
var lcgState: UInt64 = 0x9E3779B97F4A7C15
func rnd() -> Double {
  lcgState = lcgState &* 6364136223846793005 &+ 1442695040888963407
  return Double((lcgState >> 33) & 0x7FFFFFFF) / Double(0x7FFFFFFF)
}

func color(_ hex: UInt32, _ alpha: CGFloat = 1) -> NSColor {
  NSColor(
    srgbRed: CGFloat((hex >> 16) & 0xFF) / 255,
    green: CGFloat((hex >> 8) & 0xFF) / 255,
    blue: CGFloat(hex & 0xFF) / 255, alpha: alpha)
}

let serifFont: (CGFloat, NSFont.Weight) -> NSFont = { size, weight in
  let base = NSFont.systemFont(ofSize: size, weight: weight)
  let desc = base.fontDescriptor.withDesign(.serif) ?? base.fontDescriptor
  return NSFont(descriptor: desc, size: size) ?? base
}

func makeRep() -> NSBitmapImageRep {
  let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: Int(W), pixelsHigh: Int(H),
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
    colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  rep.size = NSSize(width: W, height: H)
  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
  return rep
}

func save(_ rep: NSBitmapImageRep, _ name: String) {
  NSGraphicsContext.restoreGraphicsState()
  let data = rep.representation(using: .png, properties: [:])!
  try! data.write(to: outDir.appendingPathComponent(name))
  print("  ok \(name)")
}

func bgGradient(_ a: UInt32, _ b: UInt32, angle: CGFloat = -35) {
  NSGradient(starting: color(a), ending: color(b))!
    .draw(in: NSBezierPath(rect: NSRect(x: 0, y: 0, width: W, height: H)), angle: angle)
}

func grain(_ n: Int = 3600) {
  for _ in 0..<n {
    let x = rnd() * W, y = rnd() * H
    let white = rnd() > 0.5
    let alpha = 0.03 + rnd() * 0.05
    (white ? NSColor.white : NSColor.black).withAlphaComponent(alpha).setFill()
    NSBezierPath(rect: NSRect(x: x, y: y, width: 1.2, height: 1.2)).fill()
  }
}

func vignette() {
  if let g = NSGradient(
    starting: NSColor.black.withAlphaComponent(0),
    ending: NSColor.black.withAlphaComponent(0.5)) {
    g.draw(fromCenter: NSPoint(x: W / 2, y: H / 2), radius: H * 0.32,
           toCenter: NSPoint(x: W / 2, y: H / 2), radius: H * 0.75)
  }
}

func microLabel(_ text: String) {
  let attr = NSAttributedString(string: text, attributes: [
    .font: NSFont.systemFont(ofSize: 15, weight: .semibold),
    .foregroundColor: NSColor.white.withAlphaComponent(0.85),
    .kern: 3.2,
  ])
  attr.draw(at: NSPoint(x: 44, y: H - 78))
}

func titleBlock(_ title: String, genre: String) {
  var size: CGFloat = 58
  var attr = NSAttributedString(string: title, attributes: [
    .font: serifFont(size, .semibold),
    .foregroundColor: NSColor.white,
  ])
  while attr.size().width > 480 && size > 34 {
    size -= 2
    attr = NSAttributedString(string: title, attributes: [
      .font: serifFont(size, .semibold),
      .foregroundColor: NSColor.white,
    ])
  }
  attr.draw(at: NSPoint(x: 42, y: 196))

  NSColor.white.withAlphaComponent(0.7).setFill()
  NSBezierPath(roundedRect: NSRect(x: 44, y: 168, width: 46, height: 2.5), xRadius: 1.25, yRadius: 1.25).fill()

  let genreAttr = NSAttributedString(string: genre.uppercased(), attributes: [
    .font: NSFont.systemFont(ofSize: 15, weight: .medium),
    .foregroundColor: NSColor.white.withAlphaComponent(0.72),
    .kern: 2.6,
  ])
  genreAttr.draw(at: NSPoint(x: 44, y: 132))

  // stylised credits block, bottom-right
  let widths: [CGFloat] = [110, 84, 96, 66, 88]
  for (i, w) in widths.enumerated() {
    NSColor.white.withAlphaComponent(0.38).setFill()
    NSBezierPath(roundedRect: NSRect(x: W - 44 - w, y: CGFloat(56 + i * 16), width: w, height: 5), xRadius: 2.5, yRadius: 2.5)
      .fill()
  }
}

func dot(_ x: CGFloat, _ y: CGFloat, _ r: CGFloat, _ alpha: CGFloat, _ c: NSColor = .white) {
  c.withAlphaComponent(alpha).setFill()
  NSBezierPath(ovalIn: NSRect(x: x - r, y: y - r, width: r * 2, height: r * 2)).fill()
}

func strokeEllipse(_ rect: NSRect, _ alpha: CGFloat, _ lw: CGFloat, _ c: NSColor = .white) {
  c.withAlphaComponent(alpha).setStroke()
  let p = NSBezierPath(ovalIn: rect)
  p.lineWidth = lw
  p.stroke()
}

// ─────────────────────────────────────────────── the nine posters ─────────

// 1 · Nightfall — indigo night, crescent moon, stars
do {
  let rep = makeRep()
  bgGradient(0x312e81, 0x0c1445)
  for _ in 0..<70 { dot(CGFloat(rnd()) * W, H * 0.35 + CGFloat(rnd()) * H * 0.6, 0.8 + CGFloat(rnd()) * 1.4, 0.15 + CGFloat(rnd()) * 0.5) }
  dot(452, 610, 84, 0.92)
  color(0x1e1b4b).setFill()
  NSBezierPath(ovalIn: NSRect(x: 418, y: 604, width: 148, height: 148)).fill()
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Nightfall", genre: "A moonlit thriller")
  grain(); vignette()
  save(rep, "poster-1.png")
}

// 2 · Salt & Static — coastal sci-fi, radio arcs
do {
  let rep = makeRep()
  bgGradient(0x0891b2, 0x06403f)
  for i in 1...5 {
    strokeEllipse(NSRect(x: 430 - CGFloat(i) * 95, y: 620 - CGFloat(i) * 95, width: CGFloat(i) * 190, height: CGFloat(i) * 190), 0.22, 2)
  }
  dot(430, 620, 10, 0.9)
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Salt & Static", genre: "Coastal sci-fi")
  grain(); vignette()
  save(rep, "poster-2.png")
}

// 3 · The Long Quiet — western elegy, low sun
do {
  let rep = makeRep()
  bgGradient(0x9f1239, 0x431407)
  dot(300, 430, 120, 0.32, color(0xffd8a8))
  NSColor.black.withAlphaComponent(0.55).setFill()
  NSBezierPath(rect: NSRect(x: 0, y: 0, width: W, height: 250)).fill()
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("The Long Quiet", genre: "A western elegy")
  grain(); vignette()
  save(rep, "poster-3.png")
}

// 4 · Orbit City — retro-futurist, orbital rings
do {
  let rep = makeRep()
  bgGradient(0x4f46e5, 0x155e75)
  strokeEllipse(NSRect(x: 120, y: 320, width: 360, height: 130), 0.3, 2)
  strokeEllipse(NSRect(x: 90, y: 285, width: 420, height: 200), 0.22, 2)
  strokeEllipse(NSRect(x: 60, y: 250, width: 480, height: 270), 0.15, 2)
  dot(300, 470, 56, 0.9)
  dot(476, 398, 8, 0.95)
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Orbit City", genre: "Retro-futurist comedy")
  grain(); vignette()
  save(rep, "poster-4.png")
}

// 5 · Paper Tigers — crime saga, fold stripes
do {
  let rep = makeRep()
  bgGradient(0xc2410c, 0x86198f)
  for i in 0...6 {
    NSColor.white.withAlphaComponent(0.10 + CGFloat(i % 3) * 0.05).setFill()
    let x = CGFloat(i) * 100 - 50
    let p = NSBezierPath()
    p.move(to: NSPoint(x: x, y: 300))
    p.line(to: NSPoint(x: x + 130, y: 300))
    p.line(to: NSPoint(x: x + 40, y: H + 40))
    p.line(to: NSPoint(x: x - 90, y: H + 40))
    p.close()
    p.fill()
  }
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Paper Tigers", genre: "Crime saga")
  grain(); vignette()
  save(rep, "poster-5.png")
}

// 6 · Monsoon Line — monsoon romance, rain streaks
do {
  let rep = makeRep()
  bgGradient(0x0f766e, 0x172554)
  for _ in 0..<90 {
    let x = CGFloat(rnd()) * W
    let y = CGFloat(rnd()) * H * 0.82
    let len = 30 + CGFloat(rnd()) * 70
    NSColor.white.withAlphaComponent(0.05 + CGFloat(rnd()) * 0.13).setStroke()
    let p = NSBezierPath()
    p.move(to: NSPoint(x: x, y: y))
    p.line(to: NSPoint(x: x - 10, y: y + len))
    p.lineWidth = 1.4
    p.stroke()
  }
  NSColor.white.withAlphaComponent(0.75).setFill()
  NSBezierPath(rect: NSRect(x: 448, y: 520, width: 60, height: 44)).fill()
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Monsoon Line", genre: "A monsoon romance")
  grain(); vignette()
  save(rep, "poster-6.png")
}

// 7 · Deep Field — space documentary, star field
do {
  let rep = makeRep()
  bgGradient(0x0b1a3a, 0x020617)
  for _ in 0..<240 {
    dot(CGFloat(rnd()) * W, CGFloat(rnd()) * H * 0.9, 0.6 + CGFloat(rnd()) * 1.8, 0.08 + CGFloat(rnd()) * 0.6)
  }
  dot(180, 560, 26, 0.9, color(0xa5b4fc))
  strokeEllipse(NSRect(x: 128, y: 508, width: 104, height: 104), 0.35, 1.6)
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Deep Field", genre: "Space documentary")
  grain(); vignette()
  save(rep, "poster-7.png")
}

// 8 · Low Tide — slow-burn mystery, layered waves
do {
  let rep = makeRep()
  bgGradient(0x14532d, 0x0f3d46)
  for i in 0...4 {
    NSColor.white.withAlphaComponent(0.12 + CGFloat(i) * 0.04).setStroke()
    let p = NSBezierPath()
    let y = 320.0 + CGFloat(i) * 78
    p.move(to: NSPoint(x: -20, y: y))
    p.curve(
      to: NSPoint(x: W + 20, y: y - 30),
      controlPoint1: NSPoint(x: W * 0.33, y: y + 60),
      controlPoint2: NSPoint(x: W * 0.66, y: y - 90))
    p.lineWidth = 2.4
    p.stroke()
  }
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Low Tide", genre: "Slow-burn mystery")
  grain(); vignette()
  save(rep, "poster-8.png")
}

// 9 · Ember — post-fire drama, rising sparks
do {
  let rep = makeRep()
  bgGradient(0x9a3412, 0x831843)
  for _ in 0..<130 {
    let x = 60 + CGFloat(rnd()) * 480
    let y = 300 + CGFloat(rnd()) * 560
    let drift = CGFloat(rnd()) * 40 - 20
    dot(x, y, 0.8 + CGFloat(rnd()) * 2.4, 0.15 + CGFloat(rnd()) * 0.55,
        rnd() > 0.5 ? color(0xfbbf24) : color(0xfda4af))
    _ = drift
  }
  if let g = NSGradient(starting: color(0xfbbf24, 0.5), ending: color(0xfbbf24, 0)) {
    g.draw(fromCenter: NSPoint(x: 300, y: 280), radius: 0, toCenter: NSPoint(x: 300, y: 280), radius: 200)
  }
  microLabel("A STREAMLY ORIGINAL")
  titleBlock("Ember", genre: "Post-fire drama")
  grain(); vignette()
  save(rep, "poster-9.png")
}

print("Done — 9 posters in assets/img/posters/")
