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

  setView(location.hash === '#tldr' ? 'tldr' : 'full', false);
})();
