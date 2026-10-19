import { readFileSync } from 'node:fs'
import { test, expect } from '@playwright/test'

test.describe('dev server hardening', () => {
  test('404 page escapes HTML in the reflected path', async ({ request }) => {
    const res = await request.get('/%3Cscript%3Ealert(1)%3C%2Fscript%3E')
    expect(res.status()).toBe(404)
    const body = await res.text()
    expect(body).not.toContain('<script>alert')
    expect(body).toContain('&lt;script&gt;')
  })

  test('rejects non-GET methods', async ({ request }) => {
    const res = await request.post('/', { data: 'x' })
    expect(res.status()).toBe(405)
    expect(res.headers().allow).toBe('GET, HEAD')
  })

  test('serves HEAD with headers and no body', async ({ request }) => {
    const res = await request.head('/')
    expect(res.status()).toBe(200)
    expect(Number(res.headers()['content-length'])).toBeGreaterThan(1000)
  })

  test('strips the CSP meta tag in dev but not on disk', async ({ request }) => {
    const res = await request.get('/')
    const body = await res.text()
    expect(body).not.toMatch(/http-equiv="Content-Security-Policy"/)
    expect(body).toContain('CSP meta stripped for local dev')
    expect(body).toContain('__livereload')

    const onDisk = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
    expect(onDisk).toMatch(/http-equiv="Content-Security-Policy"/)
  })
})

test.describe('production file checks', () => {
  test('CSP hash matches the inline bootstrap', async () => {
    const { execFileSync } = await import('node:child_process')
    const out = execFileSync('node', ['tools/csp-hash.mjs', '--check'], { cwd: '.' })
    expect(out.toString()).toContain('✓')
  })
})
