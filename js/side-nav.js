// side-nav.js — the TL;DR / Full switch in the case study side nav.
// <body data-view="full|tldr"> decides which version of the page shows
// (css/side-nav.css). The choice is mirrored in the URL hash (#tldr) so
// the short version can be linked to and the back button works.

(function () {
  const body = document.body;
  const buttons = Array.from(document.querySelectorAll('[data-view-set]'));
  if (!buttons.length) return;

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

  // Last resort for very short windows: scale the rail down so the
  // switch and next-case-study card are never pushed out of view.
  const rail = document.querySelector('.side-nav');
  function fit() {
    if (!rail) return;
    rail.style.zoom = '';
    const need = rail.scrollHeight;
    if (need > rail.clientHeight) rail.style.zoom = String(Math.max(0.6, rail.clientHeight / need));
  }
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit); // web fonts can change the height
  fit();

  // Stages that point at a spot in the case study: <a href="#id">. Clicking
  // scrolls there (no hash change, so it can't clash with #tldr), and the
  // stage whose spot has reached the upper part of the window is marked current.
  const links = Array.from(document.querySelectorAll('.side-nav__stage a[href^="#"], .side-nav__item a[href^="#"]'));
  const spots = links.map((a) => document.getElementById(a.getAttribute('href').slice(1)));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

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
