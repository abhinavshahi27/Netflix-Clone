/**
 * Streamly — page behaviour.
 * One module, no dependencies. Every interaction degrades gracefully
 * if JavaScript fails to load.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------------------------------------------------------------- toast -- */

const toastEl = $('#toast');
let toastTimer;

function toast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3200);
}

/* ---------------------------------------------------------------- theme -- */

function initTheme() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const sync = () => {
    const isLight = document.documentElement.dataset.theme === 'light';
    toggle.setAttribute('aria-pressed', String(isLight));
  };

  toggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    sync();
    try {
      localStorage.setItem('streamly-theme', next);
    } catch (e) {
      /* storage blocked (private window) — the theme still applies for this visit */
    }
  });

  sync();
}

/* ----------------------------------------------------------- mobile nav -- */

function initNav() {
  const toggle = $('#nav-toggle');
  const nav = $('#primary-nav');
  if (!toggle || !nav) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  backdrop.hidden = true;

  const focusable = () =>
    $$('a[href], button:not([disabled]), select, input', nav)
      .filter((el) => el.offsetParent !== null);

  function open() {
    document.body.append(backdrop);
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('is-open'));
    nav.classList.add('is-open');
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    focusable()[0]?.focus();
  }

  function close({ restoreFocus = true } = {}) {
    nav.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    setTimeout(() => backdrop.remove(), 320);
    if (restoreFocus) toggle.focus();
  }

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));
  backdrop.addEventListener('click', () => close());

  // Close after following an in-page link.
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a') && isOpen()) close({ restoreFocus: false });
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') {
      close();
      return;
    }

    // Keep Tab inside the drawer while it is open.
    if (e.key === 'Tab') {
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Returning to desktop width must not leave the drawer stuck open.
  const desktop = window.matchMedia('(min-width: 861px)');
  desktop.addEventListener('change', (e) => {
    if (e.matches && isOpen()) close({ restoreFocus: false });
  });
}

/* ------------------------------------------------------------ accordion -- */

function initAccordion() {
  $$('.acc-trigger').forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', () => {
      const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(willOpen));

      if (willOpen) {
        panel.hidden = false;
        // Let the browser paint the un-hidden row before animating it open.
        requestAnimationFrame(() => panel.classList.add('is-open'));
      } else {
        panel.classList.remove('is-open');
        const done = () => { panel.hidden = true; };
        if (reduceMotion.matches) done();
        else panel.addEventListener('transitionend', done, { once: true });
      }
    });
  });
}

/* --------------------------------------------------------- billing swap -- */

function initBilling() {
  const sw = $('#billing-switch');
  if (!sw) return;

  const labels = { month: $('#bill-month'), year: $('#bill-year') };

  sw.addEventListener('click', () => {
    const annual = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', String(annual));

    labels.month?.classList.toggle('is-active', !annual);
    labels.year?.classList.toggle('is-active', annual);

    $$('.price .amount').forEach((el) => {
      el.textContent = annual ? el.dataset.year : el.dataset.month;
    });

    toast(annual
      ? 'Annual billing — prices shown per month, billed yearly.'
      : 'Monthly billing — cancel any time.');
  });
}

/* -------------------------------------------------------- scroll reveal -- */

function initReveal() {
  const items = $$('[data-reveal]');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------- counters -- */

function initCounters() {
  const counters = $$('[data-count-to]');
  if (!counters.length) return;

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    counters.forEach((el) => { el.textContent = Number(el.dataset.countTo).toLocaleString(); });
    return;
  }

  const run = (el) => {
    const target = Number(el.dataset.countTo);
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);           // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------- header state -- */

function initHeader() {
  const header = $('#site-header');
  if (!header) return;

  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  header.before(sentinel);

  if (!('IntersectionObserver' in window)) return;

  new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-stuck', !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
}

/* ---------------------------------------------------------- misc wiring -- */

function initMisc() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  $$('[data-demo-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toast('Demo only — Streamly is a fictional brand, so there is nothing to sign up for.');
    });
  });

  $('#lang-select')?.addEventListener('change', (e) => {
    toast(`Language switching is not implemented — "${e.target.value}" is a UI demo.`);
  });
}

/* ----------------------------------------------------------------- boot -- */

initTheme();
initNav();
initAccordion();
initBilling();
initReveal();
initCounters();
initHeader();
initMisc();
