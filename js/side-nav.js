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
    if (document.startViewTransition && !reduced.matches && window.innerWidth >= 1200) {
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

  // ── Top bar (tablet and phone, below 1200px; css/side-nav.css hides it on desktop) ──
  // Built from the rail's own markup, so every page gets it without extra HTML:
  // [logo] [current stop ⌄] [TL;DR | Full], a sheet listing every stop plus the
  // next case study, and the next case study again at the end of the page.
  function el(tag, cls, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    Object.keys(attrs || {}).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  function buildTopNav() {
    if (!rail) return null;
    const stages = Array.from(rail.querySelectorAll('.side-nav__stage'));
    if (!stages.length) return null;
    const logo = document.querySelector('#nav .nav-logo');
    const back = rail.querySelector('.side-nav__back');
    const next = rail.querySelector('.side-nav__next');
    const arrowSrc = (rail.querySelector('.side-nav__next-arrow') || {}).src || '';

    const bar = el('nav', 'topnav', { 'aria-label': 'Case study' });

    if (logo) {
      const a = el('a', 'topnav__logo', { href: logo.getAttribute('href'), 'aria-label': 'Saumya — home' });
      const img = logo.querySelector('img');
      if (img) { const c = img.cloneNode(); c.setAttribute('alt', ''); a.appendChild(c); }
      bar.appendChild(a);
    }

    const current = el('button', 'topnav__current', { type: 'button', 'aria-expanded': 'false', 'aria-controls': 'topnav-sheet', 'aria-haspopup': 'true' });
    const label = el('span', 'topnav__current-label');
    label.textContent = stages[0].textContent.trim();
    current.appendChild(label);
    current.insertAdjacentHTML('beforeend', '<svg class="topnav__chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg>');
    bar.appendChild(current);

    const version = el('div', 'topnav__version', { role: 'group', 'aria-label': 'Version' });
    [['tldr', 'TL;DR'], ['full', 'Full']].forEach(([v, text]) => {
      const b = el('button', '', { type: 'button', 'data-view-set': v, 'aria-pressed': String(v === 'full') });
      b.textContent = text;
      version.appendChild(b);
    });
    bar.appendChild(version);
    bar.appendChild(el('span', 'topnav__progress', { 'aria-hidden': 'true' }));

    const sheet = el('div', 'topnav__sheet', { id: 'topnav-sheet', hidden: '' });
    if (back) {
      const w = el('a', 'topnav__work', { href: back.getAttribute('href') });
      if (arrowSrc) w.appendChild(el('img', '', { src: arrowSrc, alt: '', width: '20', height: '20' }));
      w.appendChild(document.createTextNode(back.textContent.trim()));
      sheet.appendChild(w);
    }
    const list = el('ul', 'topnav__stops');
    const sheetLinks = [];
    stages.forEach((s) => {
      const li = el('li');
      const a = s.querySelector('a');
      if (a) {
        const l = el('a', '', { href: a.getAttribute('href') });
        l.textContent = a.textContent.trim();
        li.appendChild(l);
        sheetLinks.push(l);
      } else {
        const sp = el('span');
        sp.textContent = s.textContent.trim();
        li.appendChild(sp);
      }
      list.appendChild(li);
    });
    sheet.appendChild(list);
    if (next) {
      // one row, not a card: "Next: Alum Connect  →" (Figma 858:2020 / 858:2028)
      const nextTitle = ((next.querySelector('.side-nav__next-title') || {}).textContent || '').trim();
      const wrap = el('div', 'topnav__next-wrap');
      const n = el('a', 'topnav__next', { href: next.getAttribute('href') });
      const t = el('span', 'topnav__next-title'); t.textContent = 'Next: ' + nextTitle;
      n.appendChild(t);
      if (arrowSrc) n.appendChild(el('img', '', { src: arrowSrc, alt: '', width: '20', height: '20' }));
      wrap.appendChild(n);
      sheet.appendChild(wrap);
    }

    const scrim = el('div', 'topnav__scrim', { hidden: '' });
    body.appendChild(bar);
    body.appendChild(scrim);
    body.appendChild(sheet);

    // the end of the page: the next case study as a coloured card (Figma 855:1984).
    // Always coloured, with its picture in place: a phone has no hover to wait for.
    if (next) {
      const m = /side-nav__next--(creek|hyperlocal|alum|cellwars|gwt)\b/.exec(next.className);
      const variant = m ? m[1] : null;
      const imgBase = arrowSrc.replace(/side-nav-arrow\.svg.*$/, '');
      const art = { alum: 'next-alum-goose.webp', creek: 'next-creek-cake.webp', gwt: 'next-gwt-bus.webp', cellwars: 'next-cell-wars.webp', hyperlocal: 'next-hyperlocal-bike.webp' };
      const card = el('a', 'endcard' + (variant ? ' endcard--' + variant : ''), { href: next.getAttribute('href') });
      if (variant && imgBase) {
        // the stage is the picture's 358 x 144 frame from Figma; a tablet scales the whole frame up
        const stage = el('span', 'endcard__stage', { 'aria-hidden': 'true' });
        const pic = el('span', 'endcard__art');
        const inner = el('span');
        inner.appendChild(el('img', '', { src: imgBase + art[variant], alt: '', loading: 'lazy', decoding: 'async' }));
        pic.appendChild(inner);
        stage.appendChild(pic);
        card.appendChild(stage);
      }
      const lab = el('span', 'endcard__label'); lab.textContent = ((next.querySelector('.side-nav__next-label') || {}).textContent || 'Next case study').trim();
      const title = el('span', 'endcard__title'); title.textContent = ((next.querySelector('.side-nav__next-title') || {}).textContent || '').trim();
      card.appendChild(lab); card.appendChild(title);
      if (arrowSrc) card.appendChild(el('img', 'endcard__arrow', { src: arrowSrc, alt: '', width: '32', height: '32' }));
      const end = el('div', 'topnav-next');
      end.appendChild(card);
      const main = document.querySelector('main');
      if (main) main.appendChild(end);
    }

    const api = { bar, label, sheetLinks, current, sheet, scrim };
    function setOpen(open) {
      sheet.hidden = !open;
      scrim.hidden = !open;
      current.setAttribute('aria-expanded', String(open));
      body.classList.toggle('topnav-open', open);
    }
    api.setOpen = setOpen;
    current.addEventListener('click', () => setOpen(sheet.hidden));
    scrim.addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { setOpen(false); current.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1200) setOpen(false); });
    return api;
  }

  const topnav = buildTopNav();

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
    if (topnav) {
      topnav.label.textContent = links[current].textContent.trim();
      topnav.sheetLinks.forEach((a, i) => {
        a.classList.toggle('is-current', i === current);
        if (i === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    }
  }

  function goTo(i) {
    if (!spots[i]) return;
    if (body.dataset.view !== 'full') setView('full', true);
    spots[i].scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
  }

  links.forEach((a, i) => a.addEventListener('click', (e) => {
    if (!spots[i]) return;
    e.preventDefault();
    goTo(i);
  }));

  if (topnav) {
    topnav.sheetLinks.forEach((a, i) => a.addEventListener('click', (e) => {
      e.preventDefault();
      topnav.setOpen(false);
      goTo(i);
    }));
  }

  // reading progress along the bottom of the top bar
  let progressQueued = false;
  function updateProgress() {
    progressQueued = false;
    if (!topnav) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    topnav.bar.style.setProperty('--topnav-progress', max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4) : '0');
  }

  function onScroll() {
    markCurrent();
    if (topnav && !progressQueued) { progressQueued = true; requestAnimationFrame(updateProgress); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { markCurrent(); updateProgress(); });
  updateProgress();

  setView(location.hash === '#tldr' ? 'tldr' : 'full', false);
  markCurrent();
})();
