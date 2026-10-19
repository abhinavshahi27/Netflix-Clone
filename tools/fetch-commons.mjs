#!/usr/bin/env node
/**
 * fetch-commons.mjs — pulls openly-licensed imagery from Wikimedia Commons.
 *
 * Zero dependencies (global fetch). Searches the Commons API, keeps only
 * files whose licence is "public domain" or "CC0", downloads a sized
 * thumbnail, and records provenance in assets/img/credits.json.
 *
 *   node tools/fetch-commons.mjs
 *
 * Artwork falls back to the next candidate when the first hit isn't
 * openly licensed, so the output set is always usage-safe.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'Streamly-portfolio-site/2.2 (asset fetch; contact via github.com/abhinavshahi27)'

const OPEN_LICENCE = /public domain|cc0|pd/i

const WANTED = [
  {
    dir: 'vault',
    width: 780,
    queries: [
      ['Nosferatu 1922 vampire', 'Nosferatu Schreck', 'Nosferatu film 1922'],
      ['Metropolis 1927 film poster', 'Metropolis Fritz Lang poster'],
      ['Cabinet of Dr Caligari 1920 poster', 'Caligari expressionist film'],
      ['Buster Keaton Sherlock Jr 1924 still', 'Sherlock Jr theater 1924'],
    ],
  },
  {
    dir: 'photos',
    width: 1400,
    queries: [
      ['fog forest valley', 'morning mist forest', 'foggy landscape'],
      ['sand dunes desert', 'desert dunes shadow'],
      ['storm ocean waves dark', 'sea storm waves'],
      ['night street neon signs', 'neon signs night city'],
    ],
  },
]

const headers = { 'User-Agent': UA, Accept: 'application/json' }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(params, attempt = 0) {
  const url = new URL(API)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url, { headers })
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 4) throw new Error(`Commons API ${res.status} (gave up)`)
    await sleep(1500 * (attempt + 1))
    return api(params, attempt + 1)
  }
  if (!res.ok) throw new Error(`Commons API ${res.status}`)
  await sleep(350)
  return res.json()
}

async function searchCandidates(query) {
  const data = await api({
    action: 'query',
    format: 'json',
    list: 'search',
    srsearch: query,
    srnamespace: '6',
    srlimit: '10',
  })
  return (data.query?.search ?? []).map((r) => r.title)
}

async function fileInfo(title) {
  const data = await api({
    action: 'query',
    format: 'json',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|mime|size',
    iiurlwidth: '1600',
  })
  const page = Object.values(data.query?.pages ?? {})[0]
  return page?.imageinfo?.[0] ?? null
}

function slug(title) {
  return path.basename(title.replace(/^(File|Image):/i, '')).replace(/\.[a-z0-9]+$/i, '')
}

const credits = []

const only = process.argv[2] // optional: "vault" or "photos"
const groups = WANTED.filter((g) => !only || g.dir === only)
for (const group of groups) {
  const outDir = path.join(ROOT, 'assets/img', group.dir)
  fs.mkdirSync(outDir, { recursive: true })

  for (const [primary, ...fallbacks] of group.queries) {
    let saved = false
    for (const query of [primary, ...fallbacks]) {
      let titles
      try {
        titles = await searchCandidates(query)
      } catch {
        continue
      }
      for (const title of titles) {
        try {
          const info = await fileInfo(title)
          if (!info) continue
          if (!/^image\/(jpeg|png|webp)$/.test(info.mime)) continue

          const licence = info.extmetadata?.LicenseShortName?.value ?? ''
          if (!OPEN_LICENCE.test(licence)) continue
          if (credits.some((c) => c.title === title)) continue

          const src = info.thumburl ?? info.url
          const res = await fetch(src, { headers })
          if (!res.ok) continue
          const buf = Buffer.from(await res.arrayBuffer())
          if (buf.length < 20_000) continue // skip tiny thumbnails

          const base = `${group.dir}-${slug(title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 40)}`
          const ext = info.mime === 'image/png' ? 'png' : 'jpg'
          const file = path.join(outDir, `${base}.${ext}`)
          fs.writeFileSync(file, buf)

          credits.push({
            file: path.relative(ROOT, file),
            title,
            query,
            licence,
            artist: (info.extmetadata?.Artist?.value ?? '')
              .replace(/<[^>]+>/g, '')
              .trim()
              .slice(0, 120),
            source: info.descriptionurl,
          })
          console.log(`  ok ${path.relative(ROOT, file)} — ${licence}`)
          saved = true
          await sleep(350)
          break
        } catch {
          // try the next candidate
        }
      }
      if (saved) break
    }
    if (!saved) console.warn(`  ! no open-licence hit for "${primary}"`)
  }
}

fs.writeFileSync(path.join(ROOT, 'assets/img/credits.json'), JSON.stringify(credits, null, 2))
console.log(`Done — ${credits.length} files, provenance in assets/img/credits.json`)
