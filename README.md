# Streamly 🎬

An original streaming-service landing page — **no frameworks, no build step.**
Original generated poster art, public-domain classic cinema, self-hosted fonts,
and every illustration inline SVG: the whole site still ships well under 1.5 MB.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-0-success?style=flat)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)
[![CI](https://github.com/abhinavshahi27/Netflix-Clone/actions/workflows/ci.yml/badge.svg)](https://github.com/abhinavshahi27/Netflix-Clone/actions/workflows/ci.yml)

> **Streamly is a fictional brand.** It was invented for this project to practise front-end
> craft. It is not a real service, it is not affiliated with any existing streaming company,
> and the page collects no data of any kind.

---

## Overview

A full marketing landing page: hero with an animated poster wall of original artworks,
four alternating feature sections that stack like cards, a public-domain classic-cinema
vault on a scroll-driven rail, a cinematic originals gallery, a pricing table with a
monthly/annual toggle, an accessible FAQ accordion, and a footer — plus light and dark
themes that both meet WCAG AA contrast.

The point of the project is to show how far plain HTML, CSS and JavaScript go when you use
the modern platform properly: custom properties, `clamp()`, Grid, `color-mix()`,
`IntersectionObserver`, scroll-driven animations, the View Transitions API and CSS-only
accordion animation via `grid-template-rows`.

---

## Features

**Interface**

- Load-in curtain: the logo draws itself, the wordmark rises, the curtain lifts (once per session)
- Hero title rises word-by-word out of overflow masks
- Animated hero poster wall — nine **original generated artworks** (see Artwork below), three columns scrolling at different speeds, the whole wall tilting toward your pointer
- **Classic cinema vault** — public-domain silent-era posters on a horizontal rail driven by vertical scroll (native snap-scroll fallback)
- **Originals gallery** — cinematic public-domain photography with hover treatments
- Feature sections pin into a **sticky card stack** on desktop
- Velocity-reactive marquee: speeds up and skews with your scrolling, pauses on hover
- **Odometer** statistics — rolling digit columns with per-place stagger
- Theme toggle wrapped in a **View Transitions circular wipe**; film-grain overlay and ambient aurora glows
- Poster tiles lift with layered shadows and a play glyph on hover (pointer devices only)
- Magnetic CTAs, cursor-tracked sheen on plan cards, gradient hairline card borders, shine-sweep buttons, spring-physics switch and toast
- Custom cursor (dot + lagging ring) on pointer-fine devices

**Engineering**

- **Design-token system** — re-skin the entire site by editing one `:root` block
- **Display typography** — Fraunces variable serif (SIL OFL), self-hosted woff2, sans body stack
- **Light & dark themes** — follows the OS preference, remembers your override, and sets the theme before first paint so there is no flash
- **Fluid typography** — a `clamp()` type scale; no font-size media queries anywhere
- **Modular vanilla JS** — small native ES modules (`assets/js/`) wired from `boot.js`; no bundler
- **Progressive enhancement** — reveal/accordion/counter CSS is gated behind a `js` class the bootstrap adds, so a dead script leaves a fully readable, expanded page
- **Strict CSP** — `default-src 'none'`, scripts limited to our own files plus one hash-pinned inline bootstrap; `tools/csp-hash.mjs --check` fails CI if they drift
- **Performance** — `content-visibility: auto` on below-fold sections, lazy-loaded artwork, self-hosted fonts
- **Accessibility** — landmarks, skip link, correct `aria-expanded` / `aria-checked` / `role="switch"` state, focus rings, `prefers-reduced-motion` kills every animation, `prefers-contrast` and `forced-colors` support
- **Zero runtime dependencies** — no npm packages ship to the browser; dev tooling (lint, tests) is dev-only
- **Tests** — Playwright smoke tests cover theme, accordion (including the rapid-click race), billing, drawer, counters and the no-JS fallback
- **CI** — ESLint + Stylelint + Prettier + html-validate + CSP check + Playwright + Lighthouse budgets + link check on every push
- **Print stylesheet** included

---

## Project structure

```
streamly/
├── index.html              # The entire page
├── 404.html                # Branded 404 for GitHub Pages
├── manifest.webmanifest    # PWA manifest (installable)
├── sitemap.xml / robots.txt
├── assets/
│   ├── css/style.css       # Design tokens + all styling
│   ├── fonts/              # Fraunces variable (SIL OFL), self-hosted
│   ├── img/                # posters/ (generated) · vault/ + photos/ (public domain)
│   ├── js/                 # Native ES modules, wired by boot.js
│   │   ├── boot.js         # starts every behaviour
│   │   ├── intro.js hero.js theme.js nav.js
│   │   ├── accordion.js billing.js reveal.js counters.js
│   │   └── header.js magnetic.js tilt.js marquee.js cursor.js toast.js misc.js util.js
│   └── brand/              # Logo, favicon, PNG icon set, og-image
├── tools/
│   ├── dev-server.mjs      # Static server + live reload, zero dependencies
│   ├── csp-hash.mjs        # Keeps the CSP hash in sync with the bootstrap
│   ├── generate-posters.swift # Draws the nine original posters (macOS)
│   ├── generate-assets.swift  # Icons + og-image (macOS)
│   ├── fetch-commons.mjs   # Pulls PD/CC0 imagery from Wikimedia Commons
│   └── optimize-img.mjs    # sharp pipeline → WebP (dev dependency)
├── tests/                  # Playwright smoke tests
├── .github/workflows/      # CI + CodeQL; dependabot.yml
├── _headers                # Security headers for Netlify/Cloudflare Pages
├── SECURITY.md
├── package.json
└── LICENSE
```

---

## Getting started

Requires Node 18 or newer — only for the dev server and tooling. The site itself needs nothing.

```bash
git clone https://github.com/abhinavshahi27/Netflix-Clone.git
cd Netflix-Clone
npm install        # dev tooling only
npm start
```

Then open **http://127.0.0.1:5173**. Save any file and the browser reloads itself.

<details>
<summary>All commands</summary>

| Command                | What it does                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm start`            | Dev server + live reload on `127.0.0.1:5173` (`--host` to expose)            |
| `npm test`             | Playwright smoke tests (desktop + mobile viewports)                          |
| `npm run lint`         | ESLint + Stylelint + Prettier check                                          |
| `npm run lint:fix`     | Same, with autofixes                                                         |
| `npm run validate`     | html-validate on the HTML                                                    |
| `npm run check:csp`    | Verifies the CSP hash matches the inline bootstrap                           |
| `npm run assets`       | Regenerates the PNG icon/og set (macOS, `swift tools/generate-assets.swift`) |
| `npm run serve:python` | Python's http.server, no live reload                                         |

</details>

---

## Artwork & credits

All imagery is either original or public domain — nothing copyrighted, nothing hotlinked.

- **Hero posters (9)** — original artworks drawn by `tools/generate-posters.swift`
  (layered gradients, geometric motifs, serif titles, grain). Fictional titles.
- **The vault (4)** — public-domain silent-era items from
  [Wikimedia Commons](https://commons.wikimedia.org): a 1920 _Caligari_ poster variant
  by Stahl & Arpke, Boris Bilinski's _Metropolis_ poster, the _Nosferatu_ title card
  (1922), and a _Sherlock Jr._ (1924) still. Per-file provenance: `assets/img/credits.json`.
- **Originals gallery (3)** — public-domain photography from Wikimedia Commons
  (fog valley, Great Sand Dunes, Miami neon).
- **Fraunces** typeface by Undercase Type — SIL Open Font License 1.1, self-hosted
  (`assets/fonts/Fraunces-OFL.txt`).

| File                                 | Source on Commons                                                                                                                                                                                   | Licence       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `assets/img/vault/vault-1.webp`      | [1920 Caligari poster (Stahl & Arpke)](https://commons.wikimedia.org/wiki/File:1920_Erich_Ludwig_Stahl_und_Otto_Arpke_Plakat-Variante_zum_Horrorfilm_%22Das_Cabinet_des_Dr._Caligari%22,_DECLA.jpg) | Public domain |
| `assets/img/vault/vault-2.webp`      | [Metropolis poster (Boris Bilinski)](<https://commons.wikimedia.org/wiki/File:Boris_Bilinski_(1900-1948)_Plakat_f%C3%BCr_den_Film_Metropolis_(1).jpg>)                                              | Public domain |
| `assets/img/vault/vault-3.webp`      | [Nosferatu title card](https://commons.wikimedia.org/wiki/File:Nosferatu_title.jpg)                                                                                                                 | Public domain |
| `assets/img/vault/vault-4.webp`      | [Sherlock Jr. still, 1924](https://commons.wikimedia.org/wiki/File:Silent_film_theater_in_Sherlock_Jr.,_1924,_with_Buster_Keaton.png)                                                               | Public domain |
| `assets/img/photos/photo-fog.webp`   | [Fog Shrouded Valley, Hanmer Springs](https://commons.wikimedia.org/wiki/File:Fog_Shrouded_Valley_North_Of_Hanmer_Springs.jpg)                                                                      | Public domain |
| `assets/img/photos/photo-dunes.webp` | [Mosca Creek, Great Sand Dunes](<https://commons.wikimedia.org/wiki/File:Mosca_Creek,_Great_Sand_Dunes_National_Preserve_(33183095041).jpg>)                                                        | Public domain |
| `assets/img/photos/photo-neon.webp`  | [Boulevard Hotel neon sign, Miami Beach](<https://commons.wikimedia.org/wiki/File:Boulevard_Hotel_(Neon_sign),_Miami_Beach.jpg>)                                                                    | Public domain |

Streamly remains a fictional brand with no affiliation to any real studio — the
classics above appear because they are legally free, not licensed.

---

## Theming

Every colour, size and radius is a custom property at the top of `assets/css/style.css`:

```css
:root {
  --accent: #8b5cf6; /* brand gradient, start */
  --accent-2: #22d3ee; /* brand gradient, end   */
  --bg: #08080e;
  --text: #f4f4f8;
  /* …type scale, spacing, radii, easing */
}
```

Change those two accents and the buttons, logo, gradients, SVG illustrations, focus rings and
hero glow all follow. The light theme is a second block that overrides the same names.

---

## Security

Static page, zero data collection. In place:

- Strict CSP (`default-src 'none'`, hash-pinned bootstrap) enforced by CI
- Dev server binds to loopback only, `GET`/`HEAD` only, escaped 404s, path-traversal guard
- Dependabot + CodeQL on the repository
- `_headers` shipped for hosts that support response headers

See [SECURITY.md](SECURITY.md).

---

## Accessibility

- Semantic landmarks (`header` / `nav` / `main` / `footer`) and a working skip link
- The accordion is real `<button>`s with `aria-expanded` and labelled panel regions; without JavaScript every answer renders expanded
- The billing switch is `role="switch"` with `aria-checked`
- The mobile drawer traps `Tab`, closes on `Esc`, and restores focus to the toggle
- All interactive elements are reachable and operable by keyboard, with visible `:focus-visible` rings
- Light and dark themes both clear WCAG AA contrast; `prefers-contrast: more` gets stronger borders and text
- `forced-colors` (Windows High Contrast) restores solid text where gradients would vanish
- `prefers-reduced-motion: reduce` disables every animation and transition, including the theme wipe

---

## Licence

MIT — see [LICENSE](LICENSE). Use it, fork it, re-skin it.

---

## Author

**Abhinav Shahi** · [GitHub](https://github.com/abhinavshahi27)
