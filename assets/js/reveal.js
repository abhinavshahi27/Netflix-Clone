/**
 * Streamly — scroll-reveal with sibling stagger.
 * CSS hides content only under `html.js` (the bootstrap adds that class),
 * so the page is fully readable if JavaScript never runs. Siblings that
 * reveal together cascade in with an 80ms stagger, capped at ~400ms.
 */
import { $$, reduceMotion } from './util.js'

export function initReveal() {
  const items = $$('[data-reveal]')

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'))
    return
  }

  const seen = new Map()
  items.forEach((el) => {
    const parent = el.parentElement
    const index = seen.get(parent) ?? 0
    seen.set(parent, index + 1)
    if (index > 0 && index < 8) el.style.setProperty('--reveal-delay', `${index * 80}ms`)
  })

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-revealed')
        io.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  )

  items.forEach((el) => io.observe(el))
}
