/**
 * Streamly — light/dark theme.
 * The pre-paint bootstrap in <head> already applied the stored theme; this
 * module wires the button, persists the choice, syncs the browser-chrome
 * colour, and — where the View Transitions API exists — plays a circular
 * wipe from the button instead of an instant swap.
 */
import { $, reduceMotion } from './util.js'

const THEME_COLOR = { dark: '#08080e', light: '#fbfbfe' }

export function initTheme() {
  const toggle = $('#theme-toggle')
  if (!toggle) return

  const sync = () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    toggle.setAttribute('aria-pressed', String(theme === 'light'))
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  }

  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'

    const apply = () => {
      document.documentElement.dataset.theme = next
      sync()
      try {
        localStorage.setItem('streamly-theme', next)
      } catch {
        /* storage blocked (private window) — the theme still applies for this visit */
      }
    }

    if (document.startViewTransition && !reduceMotion.matches) {
      const rect = toggle.getBoundingClientRect()
      document.documentElement.style.setProperty(
        '--vt-x',
        `${Math.round(rect.left + rect.width / 2)}px`,
      )
      document.documentElement.style.setProperty(
        '--vt-y',
        `${Math.round(rect.top + rect.height / 2)}px`,
      )
      document.startViewTransition(apply)
    } else {
      apply()
    }
  })

  sync()
}
