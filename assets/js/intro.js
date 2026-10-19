/**
 * Streamly — load-in curtain.
 * The CSS runs the choreography (draw → letters → lift). This module only
 * removes the node afterwards and skips the curtain entirely on repeat
 * visits in the same session or under prefers-reduced-motion.
 */
import { $, reduceMotion } from './util.js'

export function initIntro() {
  const intro = $('#intro')
  if (!intro) return

  let skip = reduceMotion.matches
  try {
    if (sessionStorage.getItem('streamly-intro') === '1') skip = true
  } catch {
    /* session storage blocked — just play it */
  }

  if (skip) {
    intro.remove()
    return
  }

  try {
    sessionStorage.setItem('streamly-intro', '1')
  } catch {
    /* ignore */
  }

  const done = () => intro.remove()
  intro.addEventListener('animationend', (e) => {
    if (e.animationName === 'intro-lift') done()
  })
  setTimeout(done, 2600) // failsafe if animation events never fire
}
