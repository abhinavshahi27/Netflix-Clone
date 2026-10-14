# Streamly 🎬

An original streaming-service landing page — **no frameworks, no build step, no images.**
Every illustration is inline SVG and every poster tile is a CSS gradient, so the whole site
ships in about 92 KB.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-0-success?style=flat)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

> **Streamly is a fictional brand.** It was invented for this project to practise front-end
> craft. It is not a real service, it is not affiliated with any existing streaming company,
> and the page collects no data of any kind.

---

## Overview

A full marketing landing page: hero with an animated poster wall, four alternating feature
sections, a pricing table with a monthly/annual toggle, an accessible FAQ accordion, and a
footer — plus a light and a dark theme that both meet WCAG AA contrast.

The point of the project is to show how far plain HTML, CSS and JavaScript go when you use
the modern platform properly: custom properties, `clamp()`, Grid, `color-mix()`,
`IntersectionObserver` and CSS-only accordion animation via `grid-template-rows`.

---

## Features

**Interface**
- Animated hero poster wall — three columns scrolling at different speeds, built entirely from CSS gradients
- Infinite category marquee with a gradient mask
- Scroll-reveal animations driven by `IntersectionObserver`
- Count-up statistics with an `easeOutCubic` curve
- Pricing table with a monthly/annual switch that rewrites the prices live
- Slide-out mobile drawer with a focus trap, `Esc` to close, and a backdrop

**Engineering**
- **Design-token system** — re-skin the entire site by editing one `:root` block
- **Light & dark themes** — follows the OS preference, remembers your override, and sets the theme before first paint so there is no flash
- **Fluid typography** — a `clamp()` type scale; no font-size media queries anywhere
- **Accessible by construction** — landmarks, a skip link, correct `aria-expanded` / `aria-checked` / `role="switch"` state, visible focus rings, and full keyboard operation
- **Respects `prefers-reduced-motion`** — every animation is disabled, not merely shortened
- **Zero dependencies** — no npm packages ship to the browser, and the dev server has no dependencies either
- **Print stylesheet** included

---

## Project structure

```
streamly/
├── index.html              # The entire page
├── assets/
│   ├── css/style.css       # Design tokens + all styling
│   ├── js/main.js          # One ES module: theme, nav, accordion, billing, reveal
│   └── brand/              # Original logo + favicon (SVG)
├── tools/
│   └── dev-server.mjs      # Static server + live reload, zero dependencies
├── package.json
└── LICENSE
```

---

## Getting started

Requires Node 18 or newer — only for the dev server. The site itself needs nothing.

```bash
git clone https://github.com/abhinavshahi27/streamly.git
cd streamly
npm start
```

Then open **http://localhost:5173**. Save any file and the browser reloads itself.

<details>
<summary>Other ways to run it</summary>

```bash
npm start -- 8080          # pick a different port
npm run serve:python       # Python's http.server, no live reload
open index.html            # straight from the filesystem — works fine
```

</details>

---

## Theming

Every colour, size and radius is a custom property at the top of `assets/css/style.css`:

```css
:root {
  --accent:   #8b5cf6;   /* brand gradient, start */
  --accent-2: #22d3ee;   /* brand gradient, end   */
  --bg:       #08080e;
  --text:     #f4f4f8;
  /* …type scale, spacing, radii, easing */
}
```

Change those two accents and the buttons, logo, gradients, SVG illustrations, focus rings and
hero glow all follow. The light theme is a second block that overrides the same names.

---

## Accessibility

- Semantic landmarks (`header` / `nav` / `main` / `footer`) and a working skip link
- The accordion is real `<button>` elements with `aria-expanded` and labelled panel regions
- The billing switch is `role="switch"` with `aria-checked`
- The mobile drawer traps `Tab`, closes on `Esc`, and restores focus to the toggle
- All interactive elements are reachable and operable by keyboard, with visible `:focus-visible` rings
- Light and dark themes both clear WCAG AA contrast
- `prefers-reduced-motion: reduce` disables every animation and transition

---

## Licence

MIT — see [LICENSE](LICENSE). Use it, fork it, re-skin it.

---

## Author

**Abhinav Shahi** · [GitHub](https://github.com/abhinavshahi27)
