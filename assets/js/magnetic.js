/**
 * Streamly — pointer effects.
 * - Magnetic: elements marked data-magnetic lean a few pixels toward the
 *   pointer and spring back on leave.
 * - Sheen: plan cards track the pointer position as --mx/--my so a soft
 *   specular highlight can follow it (see .plan-card::after in style.css).
 * Pointer-fine devices only, never under prefers-reduced-motion.
 */
import { $$, reduceMotion } from './util.js'

const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

export function initMagnetic() {
  if (reduceMotion.matches || !finePointer()) return

  const STRENGTH = 7 // px of maximum travel

  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `translate(${x * STRENGTH * 2}px, ${y * STRENGTH * 2}px)`
    })
    el.addEventListener('mouseleave', () => {
      el.style.transform = ''
    })
  })
}

export function initSheen() {
  if (reduceMotion.matches || !finePointer()) return

  $$('.plan-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mx', `${x.toFixed(1)}%`)
      card.style.setProperty('--my', `${y.toFixed(1)}%`)
    })
  })
}
