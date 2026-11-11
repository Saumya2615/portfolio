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

  // Opening or closing the rail re-flows the slides (they widen or narrow).
  // Keep the spot the reader is looking at put: before the change, note which
  // element sits at the reading line and how far down it; after the change,
  // scroll so that same point is back on the line. Done once, in one step.
  function noteReadingPlace() {
    const x = Math.round(window.innerWidth * 0.6);
    const y = Math.round(window.innerHeight * 0.35);
    const el = document.elementFromPoint(x, y);
    if (!el || el === body || el === root) return null;
    const r = el.getBoundingClientRect();
    if (!r.height) return null;
    return { el, y, frac: (y - r.top) / r.height };
  }

  function restoreReadingPlace(place) {
    if (!place) return;
    const r = place.el.getBoundingClientRect();
    const delta = r.top + place.frac * r.height - place.y;
    if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: 'instant' });
  }

  // The slide itself is a view transition: the page switches to its new layout
  // at once and the browser slides between a picture of the old state and one
  // of the new, on the GPU. (Animating the rail's width and the page's margin
  // instead re-laid-out the huge slide images on every frame, which was choppy.)
  // Browsers without view transitions, and "reduce motion", switch instantly.
  let transitioning = false;

  function setCollapsed(collapsed, save) {
    if (transitioning || isCollapsed() === collapsed) return;
    const place = noteReadingPlace();
    const apply = () => {
      root.classList.toggle('side-nav-collapsed', collapsed);
      syncToggle();
      fit();
      restoreReadingPlace(place);
    };
    if (save) {
      try { localStorage.setItem('side-nav', collapsed ? 'collapsed' : 'open'); } catch (e) { /* private mode: just don't remember */ }
    }
    if (document.startViewTransition && !reduced.matches && window.innerWidth >= 768) {
      transitioning = true;
      const vt = document.startViewTransition(apply);
      vt.ready.catch(() => {}); // rejects when the browser skips the animation (e.g. a hidden tab); the change still applies
      vt.finished.catch(() => {}).then(() => { transitioning = false; });
    } else {
      apply();
    }
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
