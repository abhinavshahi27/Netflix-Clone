/**
 * Streamly — small wiring: year stamp, demo actions, language toast,
 * and a tiny easter egg.
 */
import { $, $$ } from './util.js'
import { toast } from './toast.js'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
]

export function initMisc() {
  const year = $('#year')
  if (year) year.textContent = String(new Date().getFullYear())

  $$('[data-demo-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toast('Demo only — Streamly is a fictional brand, so there is nothing to sign up for.')
    })
  })

  $('#lang-select')?.addEventListener('change', (e) => {
    toast(`Language switching is not implemented — "${e.target.value}" is a UI demo.`)
  })

  initKonami()
}

function initKonami() {
  let progress = 0

  document.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) {
      progress = 0
      return
    }
    const expected = KONAMI[progress]
    const pressed = e.key.length === 1 ? e.key.toLowerCase() : e.key
    progress = pressed === expected ? progress + 1 : pressed === KONAMI[0] ? 1 : 0
    if (progress !== KONAMI.length) return

    progress = 0
    const word = $('.brand-word')
    if (!word) return
    word.classList.add('is-rainbow')
    toast('⌨️ Easter egg unlocked — retro vibes engaged.')
    setTimeout(() => word.classList.remove('is-rainbow'), 4000)
  })
}
