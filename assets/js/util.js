/**
 * Streamly — shared helpers.
 */

export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

export const $ = (sel, root = document) => root.querySelector(sel)

export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))
