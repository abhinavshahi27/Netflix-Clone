/**
 * Streamly — odometer statistics.
 * The markup ships the final numbers (no-JS visitors see real stats). With
 * JS each counter becomes rolling digit columns (.od-digit windows over
 * 0–9 strips, see style.css) that slide to the target with a staggered
 * delay per digit place. The original span keeps an aria-label with the
 * final value for assistive tech and tests.
 */
import { $$, reduceMotion } from './util.js'

function buildOdometer(el, target) {
  const label = target.toLocaleString('en-US')
  el.setAttribute('aria-label', label)

  if (reduceMotion.matches || !('IntersectionObserver' in window)) return

  el.classList.add('is-odometer')
  el.replaceChildren()

  label.split('').forEach((ch, idx) => {
    if (/\d/.test(ch)) {
      const digit = document.createElement('span')
      digit.className = 'od-digit'
      digit.setAttribute('aria-hidden', 'true')
      const strip = document.createElement('span')
      strip.className = 'od-strip'
      strip.style.setProperty('--target', ch)
      strip.style.setProperty('--d', `${idx * 90}ms`)
      for (let d = 0; d <= 9; d += 1) {
        const n = document.createElement('span')
        n.textContent = String(d)
        strip.append(n)
      }
      digit.append(strip)
      el.append(digit)
    } else {
      const sep = document.createElement('span')
      sep.className = 'od-sep'
      sep.setAttribute('aria-hidden', 'true')
      sep.textContent = ch
      el.append(sep)
    }
  })
}

export function initCounters() {
  const counters = $$('[data-count-to]')
  if (!counters.length) return

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach((el) => {
      const target = Number(el.dataset.countTo)
      if (Number.isFinite(target)) el.textContent = target.toLocaleString('en-US')
    })
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-counting')
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.6 },
  )

  counters.forEach((el) => {
    const target = Number(el.dataset.countTo)
    if (!Number.isFinite(target)) return // NaN guard: bad data stays untouched
    buildOdometer(el, target)
    io.observe(el)
  })
}
