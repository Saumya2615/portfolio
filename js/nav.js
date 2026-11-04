// ============================================================
// Phone menu — the nav's menu button drops a panel down under the
// nav bar and dims the page below it (phones only; the button is
// hidden at ≥ 768px). Tapping the dim, a link, the ✕ or Esc closes
// it — Esc without also firing the keyboard Esc easter egg.
// ============================================================

(() => {
  const btn = document.querySelector('.nav-menu-btn');
  const menu = document.getElementById('nav-menu');
  const scrim = document.querySelector('.nav-menu-scrim');
  if (!btn || !menu) return;

  const CLOSE_MS = 200; // matches the fade in css/nav.css
  const isOpen = () => document.body.classList.contains('nav-open');
  let hideTimer = null;

  function setHidden(hidden) {
    menu.hidden = hidden;
    if (scrim) scrim.hidden = hidden;
  }

  function open() {
    clearTimeout(hideTimer);
    setHidden(false);
    void menu.offsetHeight; // apply the hidden state first so the drop-in transition runs
    document.body.classList.add('nav-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    const first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function close({ restoreFocus = true } = {}) {
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    hideTimer = setTimeout(() => { if (!isOpen()) setHidden(true); }, CLOSE_MS);
    if (restoreFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', () => (isOpen() ? close() : open()));

  // Following a link closes the menu (same-page anchors scroll underneath it)
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close({ restoreFocus: false });
  });

  if (scrim) scrim.addEventListener('click', () => close());

  // Capture phase on window runs before keyboard.js's Escape handler
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      e.stopImmediatePropagation();
      e.preventDefault();
      close();
    }
  }, true);

  // Rotating to / resizing past the tablet breakpoint drops the phone menu
  window.matchMedia('(min-width: 768px)').addEventListener('change', (e) => {
    if (e.matches && isOpen()) close({ restoreFocus: false });
  });
})();
