/**
 * Streamly — sticky header state.
 * A zero-height sentinel above the header flips `is-stuck` once the page
 * scrolls past it, without a scroll listener.
 */
import { $ } from './util.js'

export function initHeader() {
  const header = $('#site-header')
  if (!header) return

  const sentinel = document.createElement('div')
  sentinel.setAttribute('aria-hidden', 'true')
  header.before(sentinel)

  if (!('IntersectionObserver' in window)) return

  new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting),
    { threshold: 0 },
  ).observe(sentinel)
}
