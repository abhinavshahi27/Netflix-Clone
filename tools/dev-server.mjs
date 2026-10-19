#!/usr/bin/env node
/**
 * Streamly dev server — static files + live reload, zero dependencies.
 *
 *   node tools/dev-server.mjs [port] [--host]
 *
 * - Binds to 127.0.0.1 by default; pass --host to expose it on the LAN.
 * - Serves GET/HEAD only; anything else gets a 405.
 * - Strips the production CSP meta tag from served HTML so the injected
 *   live-reload script (inline) is not blocked while developing. The CSP
 *   stays intact in the file on disk.
 * - Watches the project directory and pushes a reload over Server-Sent
 *   Events whenever a file changes. The client snippet is injected into
 *   HTML responses on the fly, so nothing leaks into the files you deploy.
 */

import http from 'node:http'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const PORT = Number(args.find((a) => /^\d+$/.test(a)) || process.env.PORT || 5173)
const HOST = args.includes('--host') ? '0.0.0.0' : '127.0.0.1'
const MAX_URL = 2048
const IGNORED = /(^|[\\/])(\.git|node_modules|\.DS_Store|test-results|playwright-report)([\\/]|$)/

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

const LIVE_RELOAD = `
<script>
  // injected by tools/dev-server.mjs — not part of the deployed site
  (function () {
    var es = new EventSource('/__livereload');
    es.onmessage = function (e) { if (e.data === 'reload') location.reload(); };
    es.onerror = function () { es.close(); setTimeout(function () { location.reload(); }, 1200); };
  })();
</script>
`

const CSP_META = /[ \t]*<meta\s+http-equiv="Content-Security-Policy"[^>]*>[ \t]*\n?/i
const CSP_DEV_NOTE =
  '<!-- CSP meta stripped for local dev: live reload needs an inline script -->\n'

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** @type {Set<import('node:http').ServerResponse>} */
const clients = new Set()

function broadcast() {
  for (const res of clients) res.write('data: reload\n\n')
}

function notFound(res, rel) {
  const safe = escapeHtml(rel)
  res.writeHead(404, { 'Content-Type': MIME['.html'] })
  res.end(`<!doctype html><meta charset="utf-8">
      <body style="font:16px system-ui;padding:3rem;background:#08080e;color:#f4f4f8">
      <h1>404</h1><p><code>${safe}</code> not found.</p>
      <p><a style="color:#22d3ee" href="/">Back to the site</a></p>${LIVE_RELOAD}`)
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Method not allowed')
    return
  }

  if (req.url && req.url.length > MAX_URL) {
    res.writeHead(414, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('URI too long')
    return
  }

  const url = new URL(req.url, `http://${req.headers.host}`)

  // --- live-reload channel ---
  if (url.pathname === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    })
    res.write('retry: 1000\n\n')
    clients.add(res)
    req.on('close', () => clients.delete(res))
    return
  }

  // --- resolve the file, refusing anything outside the project ---
  let rel = decodeURIComponent(url.pathname)
  if (rel.endsWith('/')) rel += 'index.html'
  const filePath = path.join(ROOT, rel)

  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403).end('Forbidden')
    return
  }

  try {
    const stat = await fsp.stat(filePath)
    const target = stat.isDirectory() ? path.join(filePath, 'index.html') : filePath
    const ext = path.extname(target).toLowerCase()

    if (ext === '.html') {
      let html = await fsp.readFile(target, 'utf8')
      html = html.includes('</body>')
        ? html.replace('</body>', `${LIVE_RELOAD}</body>`)
        : html + LIVE_RELOAD
      const body = html.replace(CSP_META, CSP_DEV_NOTE)
      res.writeHead(200, {
        'Content-Type': MIME['.html'],
        'Cache-Control': 'no-store',
        'Content-Length': Buffer.byteLength(body),
      })
      res.end(req.method === 'HEAD' ? undefined : body)
      return
    }

    const headers = {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'Content-Length': (await fsp.stat(target)).size,
    }
    res.writeHead(200, headers)
    if (req.method === 'HEAD') {
      res.end()
      return
    }
    fs.createReadStream(target).pipe(res)
  } catch {
    if (req.method === 'HEAD') {
      res.writeHead(404, { 'Content-Type': MIME['.html'] })
      res.end()
      return
    }
    notFound(res, rel)
  }
})

// --- watch for changes -------------------------------------------------------
let debounce
try {
  fs.watch(ROOT, { recursive: true }, (_event, filename) => {
    if (filename && IGNORED.test(filename)) return
    clearTimeout(debounce)
    debounce = setTimeout(() => {
      console.log(`  ↻ ${filename ?? 'change'} — reloading`)
      broadcast()
    }, 60)
  })
} catch (err) {
  console.warn('  ! recursive watch unavailable, live reload disabled:', err.message)
}

server.listen(PORT, HOST, () => {
  console.log(`
  Streamly dev server

    Local:   http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}
    Root:    ${ROOT}
    Bound:   ${HOST}${HOST === '0.0.0.0' ? '  (exposed to your network — use 127.0.0.1 unless you mean it)' : ''}

    Live reload is on — save any file and the browser refreshes.
    Press Ctrl+C to stop.
`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`  ! Port ${PORT} is already in use. Try: npm start -- ${PORT + 1}`)
    process.exit(1)
  }
  throw err
})
