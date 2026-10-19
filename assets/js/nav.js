/**
 * Streamly — slide-out mobile drawer.
 * Focus trap, Esc to close, backdrop click, and auto-close when the
 * viewport grows past the drawer breakpoint.
 */
import { $, $$ } from './util.js'

export function initNav() {
  const toggle = $('#nav-toggle')
  const nav = $('#primary-nav')
  if (!toggle || !nav) return

  const backdrop = document.createElement('div')
  backdrop.className = 'nav-backdrop'
  backdrop.hidden = true

  const focusable = () =>
    $$('a[href], button:not([disabled]), select, input', nav).filter(
      (el) => el.offsetParent !== null,
    )

  function open() {
    document.body.append(backdrop)
    backdrop.hidden = false
    requestAnimationFrame(() => backdrop.classList.add('is-open'))
    nav.classList.add('is-open')
    document.body.classList.add('nav-open')
    toggle.setAttribute('aria-expanded', 'true')
    focusable()[0]?.focus()
  }

  function close({ restoreFocus = true } = {}) {
    nav.classList.remove('is-open')
    backdrop.classList.remove('is-open')
    document.body.classList.remove('nav-open')
    toggle.setAttribute('aria-expanded', 'false')
    setTimeout(() => backdrop.remove(), 320)
    if (restoreFocus) toggle.focus()
  }

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true'

  toggle.addEventListener('click', () => (isOpen() ? close() : open()))
  backdrop.addEventListener('click', () => close())

  // Close after following an in-page link.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a') && isOpen()) close({ restoreFocus: false })
  })

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return

    if (e.key === 'Escape') {
      close()
      return
    }

    // Keep Tab inside the drawer while it is open.
    if (e.key === 'Tab') {
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })

  // Returning to desktop width must not leave the drawer stuck open.
  const desktop = window.matchMedia('(min-width: 861px)')
  desktop.addEventListener('change', (e) => {
    if (e.matches && isOpen()) close({ restoreFocus: false })
  })
}
