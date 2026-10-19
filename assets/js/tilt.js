/**
 * Streamly — poster-wall tilt.
 * The whole wall leans a few degrees toward the pointer via --tilt-x/--tilt-y
 * (consumed by the wall's transform in style.css). Pointer-fine only.
 */
import { $, reduceMotion } from './util.js'

export function initTilt() {
  const wall = $('.poster-wall')
  if (!wall || reduceMotion.matches) return
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

  const MAX = 6

  wall.addEventListener('pointermove', (e) => {
    const rect = wall.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    wall.style.setProperty('--tilt-x', `${(-py * MAX).toFixed(2)}deg`)
    wall.style.setProperty('--tilt-y', `${(px * MAX).toFixed(2)}deg`)
  })

  wall.addEventListener('pointerleave', () => {
    wall.style.setProperty('--tilt-x', '0deg')
    wall.style.setProperty('--tilt-y', '0deg')
  })
}
