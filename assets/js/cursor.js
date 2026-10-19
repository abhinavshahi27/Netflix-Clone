/**
 * Streamly — custom cursor (desktop flex, safely optional).
 * Dot tracks the pointer exactly; ring follows on a lerp and swells over
 * interactive elements. Activates only on pointer-fine devices without
 * reduced-motion; the native cursor stays otherwise.
 */
import { reduceMotion } from './util.js'

export function initCursor() {
  if (reduceMotion.matches) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const root = document.documentElement
  const dot = document.createElement('div')
  const ring = document.createElement('div')
  dot.className = 'cursor-dot'
  dot.setAttribute('aria-hidden', 'true')
  ring.className = 'cursor-ring'
  ring.setAttribute('aria-hidden', 'true')
  document.body.append(dot, ring)

  let x = innerWidth / 2
  let y = innerHeight / 2
  let rx = x
  let ry = y
  let visible = false

  const HOVER_SEL = 'a, button, select, [data-magnetic], .poster, .vault figure'

  document.addEventListener('pointermove', (e) => {
    x = e.clientX
    y = e.clientY
    if (!visible) {
      visible = true
      root.classList.add('cursor-on')
    }
    const hot = e.target.closest?.(HOVER_SEL)
    root.classList.toggle('cursor-hover', Boolean(hot))
  })

  document.addEventListener('pointerdown', () => root.classList.add('cursor-hover'))
  document.addEventListener('pointerup', () => root.classList.remove('cursor-hover'))
  document.documentElement.addEventListener('pointerleave', () => {
    visible = false
    root.classList.remove('cursor-on')
  })

  const tick = () => {
    rx += (x - rx) * 0.18
    ry += (y - ry) * 0.18
    dot.style.transform = `translate(${x}px, ${y}px)`
    ring.style.transform = `translate(${rx}px, ${ry}px)`
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
