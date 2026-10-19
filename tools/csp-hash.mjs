#!/usr/bin/env node
/**
 * CSP hash helper.
 *
 *   node tools/csp-hash.mjs          → prints the sha256-… hash of the
 *                                       inline bootstrap <script> in index.html
 *   node tools/csp-hash.mjs --check  → exits non-zero if the hash in the
 *                                       CSP meta tag does not match
 *
 * The CSP allows exactly one inline script (the theme bootstrap), identified
 * by hash. Editing that script without updating the meta tag bricks the site
 * in production — this script keeps the two in sync and CI enforces it.
 */
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

// The bootstrap is the only attribute-less <script> in the document
// (the boot module has src, the JSON-LD block has a type attribute).
const match = html.match(/<script>([\s\S]*?)<\/script>/)
if (!match) {
  console.error('No inline bootstrap script found in index.html')
  process.exit(1)
}

const actual = `sha256-${createHash('sha256').update(match[1]).digest('base64')}`

if (process.argv.includes('--check')) {
  const meta = html.match(/script-src[^;]*'sha256-([A-Za-z0-9+/=]+)'/)
  if (meta && `sha256-${meta[1]}` === actual) {
    console.log(`✓ CSP hash matches the inline bootstrap script (${actual})`)
    process.exit(0)
  }
  console.error(
    `✗ CSP meta hash (${meta ? `sha256-${meta[1]}` : 'missing'}) does not match the script (${actual}).\n` +
      '  Run: node tools/csp-hash.mjs   and update the meta tag.',
  )
  process.exit(1)
}

console.log(actual)
