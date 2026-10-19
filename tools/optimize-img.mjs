/**
 * optimize-img.mjs — normalises every raster asset to WebP via sharp.
 *
 *   node tools/optimize-img.mjs
 *
 * - vault/*  → 780×1170 (2:3 cover crop)  q80  → vault-<n>.webp
 * - photos/* → 1600w                 q74  → photo-<name>.webp
 * - posters/* (PNG from the Swift generator) → 600×900 q78 → poster-<n>.webp
 *
 * Renames credits.json entries to match. Originals are removed after a
 * successful conversion.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IMG = path.join(ROOT, 'assets/img')
const creditsPath = path.join(IMG, 'credits.json')
const credits = fs.existsSync(creditsPath) ? JSON.parse(fs.readFileSync(creditsPath, 'utf8')) : []

const renameCredit = (fromRel, toRel) => {
  const entry = credits.find((c) => c.file === fromRel)
  if (entry) entry.file = toRel
}

const jobs = [
  {
    dir: 'vault',
    out: (f, i) => `vault-${i + 1}.webp`,
    configure: (s) =>
      s.resize(780, 1170, { fit: 'cover', position: 'attention' }).webp({ quality: 80 }),
  },
  {
    dir: 'photos',
    out: (f) =>
      `photo-${f
        .replace(/^photos-/, '')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 30)}.webp`,
    configure: (s) => s.resize(1600, null, { withoutEnlargement: true }).webp({ quality: 74 }),
  },
  {
    dir: 'posters',
    out: (f) => f.replace(/\.[a-z0-9]+$/i, '.webp').toLowerCase(),
    configure: (s) => s.resize(600, 900, { fit: 'cover' }).webp({ quality: 78 }),
  },
]

let total = 0
for (const job of jobs) {
  const dir = path.join(IMG, job.dir)
  if (!fs.existsSync(dir)) continue
  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f))
  files.sort()
  for (const [i, f] of files.entries()) {
    const fromRel = path.relative(ROOT, path.join(dir, f))
    const toRel = path.relative(ROOT, path.join(dir, job.out(f, i)))
    await job.configure(sharp(path.join(dir, f))).toFile(path.join(ROOT, toRel))
    fs.rmSync(path.join(dir, f))
    renameCredit(fromRel, toRel)
    total += 1
    console.log(`  ok ${toRel} (${Math.round(fs.statSync(path.join(ROOT, toRel)).size / 1024)} KB)`)
  }
}

fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2))
console.log(`Done — ${total} images converted to WebP`)
