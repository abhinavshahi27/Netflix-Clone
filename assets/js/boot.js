/**
 * Streamly — boot.
 * Imports and starts every page behaviour. Each module no-ops when its
 * markup is missing, so partial pages keep working.
 */
import { initIntro } from './intro.js'
import { initHero } from './hero.js'
import { initTheme } from './theme.js'
import { initNav } from './nav.js'
import { initAccordion } from './accordion.js'
import { initBilling } from './billing.js'
import { initReveal } from './reveal.js'
import { initCounters } from './counters.js'
import { initHeader } from './header.js'
import { initMagnetic, initSheen } from './magnetic.js'
import { initTilt } from './tilt.js'
import { initMarquee } from './marquee.js'
import { initCursor } from './cursor.js'
import { initMisc } from './misc.js'

initIntro()
initTheme()
initHero()
initNav()
initAccordion()
initBilling()
initReveal()
initCounters()
initHeader()
initMagnetic()
initSheen()
initTilt()
initMarquee()
initCursor()
initMisc()
