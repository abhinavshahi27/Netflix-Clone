/**
 * Streamly — toast notifications.
 * A single status pill; re-showing restarts the entrance and the
 * auto-dismiss progress bar.
 */
import { $ } from './util.js'

const toastEl = $('#toast')
let toastTimer

export function toast(message) {
  if (!toastEl) return
  toastEl.textContent = message
  // Restart the entrance + progress-bar animation.
  toastEl.classList.remove('is-visible')
  void toastEl.offsetWidth
  toastEl.classList.add('is-visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200)
}
