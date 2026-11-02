// ============================================================
// Mobile menu — opens/closes the full-screen sheet from the nav's
// menu button (phones only; the button is hidden at ≥ 768px).
// Esc closes it without also firing the keyboard Esc easter egg.
// ============================================================

(() => {
  const btn = document.querySelector('.nav-menu-btn');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  const isOpen = () => document.body.classList.contains('nav-open');

  function open() {
    menu.hidden = false;
    // next frame so the fade/slide-in transition runs from the hidden state
    requestAnimationFrame(() => document.body.classList.add('nav-open'));
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    const first = menu.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }

  function close({ restoreFocus = true } = {}) {
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    menu.hidden = true;
    if (restoreFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener('click', () => (isOpen() ? close() : open()));

  // Following a link closes the sheet (same-page anchors scroll underneath it)
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close({ restoreFocus: false });
  });

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
