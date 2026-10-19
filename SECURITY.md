# Security Policy

## Overview

Streamly is a static front-end portfolio page. It collects, stores and
transmits **no user data** — there are no forms, no analytics, no cookies,
no external requests at runtime.

## Reporting a Vulnerability

Please report suspected issues privately via
[GitHub security advisories](https://github.com/abhinavshahi27/Netflix-Clone/security/advisories/new).
You will get a response within a few days. Please avoid opening public issues
for security reports.

## Hardening in place

- **Content Security Policy** — `default-src 'none'` with a script allow-list
  of our own modules plus one hash-pinned inline bootstrap (`tools/csp-hash.mjs --check`
  fails CI if they drift apart).
- **No external origins** — styles, scripts, icons and fonts are all same-origin
  (or system-provided). Nothing to inject, nothing to leak to.
- **Dev server** binds to `127.0.0.1` by default, serves `GET`/`HEAD` only,
  escapes reflected paths, and refuses paths outside the project root.
- **Dependency surface** — zero runtime dependencies; dev tooling is pinned in
  `package-lock.json` and monitored by Dependabot; CodeQL runs on every push.

## Notes

GitHub Pages cannot set HTTP response headers. The `<meta>` CSP covers
everything a meta CSP can; `frame-ancestors` and friends live in `_headers`
for hosts that support it (Netlify, Cloudflare Pages).
