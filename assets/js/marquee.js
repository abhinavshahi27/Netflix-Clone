/**
 * Streamly — velocity-reactive marquee.
 * Replaces the old constant CSS animation: the track's speed and skew now
 * follow scroll velocity (lerp-smoothed), pauses on hover/focus, and wraps
 * seamlessly thanks to the two identical .marquee-group halves.
 * No-ops entirely under prefers-reduced-motion (static, decorative text).
 */
import { $, reduceMotion } from './util.js'

export function initMarquee() {
  const track = $('.marquee-track')
  if (!track || reduceMotion.matches) return

  const BASE_SPEED = 0.6 // px per frame at rest
  const MAX_BOOST = 2.4 // extra px/frame at high scroll velocity
  const MAX_SKEW = 7 // deg

  let pos = 0
  let vel = 0
  let skew = 0
  let lastY = window.scrollY
  let paused = false

  const hoverTargets = [track.parentElement, track]
  hoverTargets.forEach((el) => {
    el?.addEventListener('mouseenter', () => (paused = true))
    el?.addEventListener('mouseleave', () => (paused = false))
  })

  const tick = () => {
    const y = window.scrollY
    vel += (y - lastY - vel) * 0.08
    lastY = y

    const boost = Math.min(Math.abs(vel) * 0.05, MAX_BOOST)
    if (!paused) pos -= BASE_SPEED + boost

    const half = track.scrollWidth / 2
    if (half > 0) {
      if (pos <= -half) pos += half
      if (pos > 0) pos -= half
    }

    skew += (Math.max(-MAX_SKEW, Math.min(MAX_SKEW, vel * 0.3)) - skew) * 0.1
    track.style.transform = `translateX(${pos.toFixed(2)}px) skewX(${skew.toFixed(2)}deg)`

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}
