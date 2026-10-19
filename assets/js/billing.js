/**
 * Streamly — monthly/annual pricing switch.
 * Prices tween between values (easeOutCubic, like the hero counters) and
 * the figure gets a brief pop, so the change reads as an event instead of
 * an instant swap.
 */
import { $, $$ } from './util.js'
import { toast } from './toast.js'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

function tweenNumber(el, from, to, duration = 400) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from === to) {
    el.textContent = String(to)
    return
  }
  const start = performance.now()
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1)
    el.textContent = String(Math.round(from + (to - from) * easeOutCubic(t)))
    if (t < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

export function initBilling() {
  const sw = $('#billing-switch')
  if (!sw) return

  const labels = { month: $('#bill-month'), year: $('#bill-year') }

  sw.addEventListener('click', () => {
    const annual = sw.getAttribute('aria-checked') !== 'true'
    sw.setAttribute('aria-checked', String(annual))

    labels.month?.classList.toggle('is-active', !annual)
    labels.year?.classList.toggle('is-active', annual)

    $$('.price .amount').forEach((el) => {
      const from = Number(el.textContent.replace(/[^\d]/g, ''))
      const to = Number(annual ? el.dataset.year : el.dataset.month)
      if (!Number.isFinite(to)) return
      tweenNumber(el, from, to)

      const price = el.closest('.price')
      if (price) {
        price.classList.remove('is-swapping')
        void price.offsetWidth
        price.classList.add('is-swapping')
      }
    })

    toast(
      annual
        ? 'Annual billing — prices shown per month, billed yearly.'
        : 'Monthly billing — cancel any time.',
    )
  })
}
