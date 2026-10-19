/**
 * Streamly — hero title entrance.
 * Wraps each word of the h1 in an overflow mask so the words can rise out
 * of it (see the .w rules in style.css). The <em> keeps its gradient via
 * a per-word clip applied in CSS. Skipped under prefers-reduced-motion,
 * and never runs without JS — the plain title is the fallback.
 */
import { $, reduceMotion } from './util.js'

export function initHero() {
  const title = $('.hero-title')
  if (!title || reduceMotion.matches) return

  const makeWord = (text, index) => {
    const word = document.createElement('span')
    word.className = 'w'
    const inner = document.createElement('i')
    inner.textContent = text
    inner.style.setProperty('--wd', `${index * 90}ms`)
    word.append(inner)
    return word
  }

  const splitInto = (parent, nodes, counter) => {
    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) parent.append(part)
          else parent.append(makeWord(part, counter.i++))
        })
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false) // keep <em>, re-split its children
        splitInto(clone, Array.from(node.childNodes), counter)
        parent.append(clone)
      }
    })
  }

  const counter = { i: 0 }
  const frag = document.createDocumentFragment()
  splitInto(frag, Array.from(title.childNodes), counter)
  title.replaceChildren(frag)
  requestAnimationFrame(() => title.classList.add('is-split'))
}
