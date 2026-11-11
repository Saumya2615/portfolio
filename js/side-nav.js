// side-nav.js — the case study side nav: collapse / expand, the TL;DR / Full
// switch, and the stops that jump to a slide.
//
// Collapse: the toggle at the top of the rail adds/removes `side-nav-collapsed`
// on <html> (css/side-nav.css turns the rail into a 45px strip and the slides
// widen). The choice is saved in localStorage under "side-nav" so it follows the
// visitor from one case study to the next; each page's <head> reads it before
// first paint so a collapsed rail never flashes open.
//
// TL;DR / Full: <body data-view="full|tldr"> decides which version of the page
// shows. The choice is mirrored in the URL hash (#tldr) so the short version can
// be linked to and the back button works.

(function () {
  const body = document.body;
  const root = document.documentElement;
  const rail = document.querySelector('.side-nav');
  const toggle = document.querySelector('.side-nav__toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const isCollapsed = () => root.classList.contains('side-nav-collapsed');

  // Last resort for very short windows: scale the rail down so the
  // switch and next-case-study card are never pushed out of view.
  function fit() {
    if (!rail) return;
    rail.style.zoom = '';
    rail.style.removeProperty('--side-nav-zoom');
    if (isCollapsed()) return; // just the toggle is showing
    const need = rail.scrollHeight;
    if (need > rail.clientHeight) {
      const z = Math.max(0.6, rail.clientHeight / need);
      rail.style.zoom = String(z);
      rail.style.setProperty('--side-nav-zoom', String(z)); // the CSS widens the rail by 1/z so it still measures 236px on screen
    }
  }

  // While the rail slides, the slides re-flow (they widen or narrow). Keep the
  // spot the reader is looking at put: remember which element sits at the
  // reading line and how far down it, and nudge the scroll each frame so that
  // point stays where it was.
  function keepPlace(duration) {
    const x = Math.round(window.innerWidth * 0.6);
    const y = Math.round(window.innerHeight * 0.35);
    const el = document.elementFromPoint(x, y);
    if (!el || el === body || el === root) return;
    const r0 = el.getBoundingClientRect();
    if (!r0.height) return;
    const frac = (y - r0.top) / r0.height;
    const start = performance.now();
    root.style.overflowAnchor = 'none'; // we do the anchoring; don't let the browser do it twice
    (function frame(now) {
      const r = el.getBoundingClientRect();
      const delta = r.top + frac * r.height - y;
      if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: 'instant' });
      if (now - start < duration) requestAnimationFrame(frame);
      else root.style.overflowAnchor = '';
    })(start);
  }

  function setCollapsed(collapsed, save) {
    if (isCollapsed() === collapsed) return;
    if (!reduced.matches) keepPlace(340);
    root.classList.toggle('side-nav-collapsed', collapsed);
    syncToggle();
    if (save) {
      try { localStorage.setItem('side-nav', collapsed ? 'collapsed' : 'open'); } catch (e) { /* private mode: just don't remember */ }
    }
    fit();
  }

  function syncToggle() {
    if (!toggle) return;
    const label = isCollapsed() ? 'Expand side navigation' : 'Collapse side navigation';
    toggle.setAttribute('aria-expanded', String(!isCollapsed()));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }

  if (toggle) {
    toggle.addEventListener('click', () => setCollapsed(!isCollapsed(), true));
    syncToggle();
  }

  const buttons = Array.from(document.querySelectorAll('[data-view-set]'));
  if (!buttons.length) { window.addEventListener('resize', fit); fit(); return; }

  function setView(view, push) {
    body.dataset.view = view;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.viewSet === view)));
    if (push) history.pushState(null, '', view === 'tldr' ? '#tldr' : location.pathname + location.search);
    window.scrollTo(0, 0);
  }

  buttons.forEach((b) => b.addEventListener('click', () => {
    if (body.dataset.view !== b.dataset.viewSet) setView(b.dataset.viewSet, true);
  }));

  window.addEventListener('popstate', () => setView(location.hash === '#tldr' ? 'tldr' : 'full', false));

  window.addEventListener('resize', fit);
  window.addEventListener('load', fit); // web fonts can change the height
  fit();

  // Stages that point at a spot in the case study: <a href="#id">. Clicking
  // scrolls there (no hash change, so it can't clash with #tldr), and the
  // stage whose spot has reached the upper part of the window is marked current.
  const links = Array.from(document.querySelectorAll('.side-nav__stage a[href^="#"], .side-nav__item a[href^="#"]'));
  const spots = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));

  function markCurrent() {
    if (!links.length || body.dataset.view !== 'full') return;
    let current = 0;
    spots.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = i;
    });
    links.forEach((a, i) => {
      const on = i === current;
      a.parentElement.classList.toggle('is-current', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (!spots[i]) return;
    e.preventDefault();
    if (body.dataset.view !== 'full') setView('full', true);
    spots[i].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  }));

  window.addEventListener('scroll', markCurrent, { passive: true });
  window.addEventListener('resize', markCurrent);

  setView(location.hash === '#tldr' ? 'tldr' : 'full', false);
  markCurrent();
})();
