/**
 * Streamly — FAQ accordion.
 * Panels animate via grid-template-rows. The close path is guarded with a
 * state token + timeout fallback: without it, a `transitionend` fired by a
 * re-open transition could set `hidden` on a panel that is actually open
 * (rapid double-click race), and a tab hidden mid-close would never fire
 * `transitionend` at all.
 */
import { $$, reduceMotion } from './util.js'

export function initAccordion() {
  $$('.acc-trigger').forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'))
    if (!panel) return

    let closeToken = 0
    let fallbackTimer

    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true'
      trigger.setAttribute('aria-expanded', String(willOpen))

      if (willOpen) {
        closeToken += 1 // invalidate any pending close
        clearTimeout(fallbackTimer)
        panel.hidden = false
        // Let the browser paint the un-hidden row before animating it open.
        requestAnimationFrame(() => panel.classList.add('is-open'))
        return
      }

      panel.classList.remove('is-open')

      if (reduceMotion.matches) {
        panel.hidden = true
        return
      }

      const token = ++closeToken
      const finish = () => {
        if (token !== closeToken) return // superseded by a re-open
        if (trigger.getAttribute('aria-expanded') === 'true') return
        panel.hidden = true
      }

      panel.addEventListener(
        'transitionend',
        (e) => {
          if (e.target === panel && e.propertyName === 'grid-template-rows') finish()
        },
        { once: true },
      )
      fallbackTimer = setTimeout(finish, 500)
    })
  })
}
