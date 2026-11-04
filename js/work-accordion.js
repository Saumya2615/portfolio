// work-accordion.js — drives the Selected Work accordion (rendered by projects.js).
// One project is open at a time. The section pins (sticky) while the scroll
// steps through the projects, in both directions, until the visitor clicks a
// row. Clicking a closed row opens it.

(function () {
  const NAV_H = 80;       // sticky nav height the pinned stage sits under
  const BUFFER = 40;      // px of slack so a project doesn't flicker on a boundary
  const LEAD = 0.35;      // each project opens this fraction of a step early
  const MIN_DWELL = 520;  // ms a project stays up before the next one can open (> its landing animation)

  function setup() {
    const grid = document.getElementById('main-projects-grid');
    if (!grid) return;
    const items = Array.from(grid.querySelectorAll('.work-item'));
    if (!items.length) return;
    const track = grid.closest('.work-track');
    const stage = grid.closest('.work-stage');

    let current = -1;
    let scrollDriven = true;
    let step = 400;

    // ── Panel choreography (css/work-motion.css) ──
    // The open panel's pieces land LAND_DELAY after its open begins. Flipping
    // faster than SNAP_WITHIN, or reduced motion, skips straight to the end
    // state. A closed panel's pieces reset once it is hidden, so they replay.
    const LAND_DELAY = 460;
    const SNAP_WITHIN = 450;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const landTimers = new Map();
    const resetTimers = new Map();
    let lastOpenAt = 0;
    let booting = true;

    function land(item, delay, snap) {
      clearTimeout(resetTimers.get(item));
      if (item.classList.contains('is-landed')) return;
      clearTimeout(landTimers.get(item));
      const go = () => item.classList.add('is-landed');
      if (snap || reduced.matches) { item.classList.add('is-snap'); go(); }
      else landTimers.set(item, setTimeout(go, delay));
    }

    function unland(item) {
      clearTimeout(landTimers.get(item));
      clearTimeout(resetTimers.get(item));
      resetTimers.set(item, setTimeout(() => item.classList.remove('is-landed', 'is-snap'), 750));
    }

    function open(index) {
      if (index === current) return;
      const prev = items[current];
      current = index;
      if (!booting) {
        const now = performance.now();
        if (prev) unland(prev);
        land(items[index], LAND_DELAY, lastOpenAt && now - lastOpenAt < SNAP_WITHIN);
        lastOpenAt = now;
      }
      items.forEach((item, i) => {
        const isOpen = i === index;
        item.classList.toggle('is-open', isOpen);
        item.querySelector('.work-item__bar').setAttribute('aria-expanded', String(isOpen));
        item.querySelector('.work-item__bar').tabIndex = isOpen ? -1 : 0;
        item.querySelector('.work-panel').tabIndex = isOpen ? 0 : -1;
      });
    }

    // Phones resize the viewport every time the address bar slides in or out
    // (window.innerHeight jumps ~100px), which would shift the pin mid-scroll.
    // 100svh is the "bars showing" height and stays put, so layout uses that.
    const work = document.getElementById('work');
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const stableVh = () => probe.offsetHeight || window.innerHeight;
    const isPhone = () => window.matchMedia('(max-width: 767px)').matches;

    // where the stage pins: under the nav, or higher on short screens so the
    // whole list stays visible (the header slides under the nav). On phones the
    // open panel is never allowed under the nav though: if the list is still
    // too tall, the closed rows are tightened, and what still doesn't fit is
    // cut off at the bottom instead.
    function pinTop(vh) {
      const listTop = grid.getBoundingClientRect().top - stage.getBoundingClientRect().top;
      const fitTop = vh - stage.offsetHeight - 16;
      if (!isPhone()) return { top: Math.min(NAV_H, fitTop), short: false };
      const minTop = NAV_H - listTop;
      return { top: Math.min(NAV_H, Math.max(fitTop, minTop)), short: fitTop < minTop };
    }

    // The track is one stage tall plus a "step" of pinned scroll per project.
    function layout() {
      const vh = stableVh();
      // measure at natural size without the rows animating to a new height
      grid.classList.add('is-instant');
      work.classList.remove('is-tight');
      let pin = pinTop(vh);
      if (pin.short) { work.classList.add('is-tight'); pin = pinTop(vh); }
      stage.style.setProperty('--stage-top', pin.top + 'px');
      step = Math.max(320, Math.min(vh * 0.55, 520));
      // one full step of pinned scroll per project, so the last one still gets
      // its time on screen before the stage lets go
      track.style.height = (stage.offsetHeight + step * items.length) + 'px';
      laidOutAt = vh;
      if (!booting) requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.remove('is-instant')));
    }

    let laidOutAt = 0;
    let scrolled = 0;           // px scrolled since the stage pinned (0 = just pinned)
    let lastChangeAt = -Infinity;
    let syncTimer = null;

    function readScroll() {
      if (stableVh() !== laidOutAt) layout();
      const pin = parseFloat(stage.style.getPropertyValue('--stage-top')) || 0;
      scrolled = pin - track.getBoundingClientRect().top;
      // read the step back from the real pinned distance so the two never drift apart
      step = (track.offsetHeight - stage.offsetHeight) / items.length;
    }

    // Project c takes over a little BEFORE c whole steps have been scrolled
    // (LEAD of a step early), so the first change comes soon after the section
    // pins instead of after a long empty stretch.
    const boundary = (c) => (c - LEAD) * step;

    // Which project the scroll position asks for. The one that's open keeps a
    // BUFFER of slack either side, so it doesn't flicker on a boundary.
    function targetFor(s) {
      const last = items.length - 1;
      if (current >= 0) {
        const lo = current === 0 ? -Infinity : boundary(current) - BUFFER;
        const hi = current === last ? Infinity : boundary(current + 1) + BUFFER;
        if (s >= lo && s < hi) return current;
      }
      let t = 0;
      for (let c = 1; c <= last; c++) if (s >= boundary(c)) t = c;
      return t;
    }

    // Move toward the project the scroll asks for ONE at a time, each staying
    // up for at least MIN_DWELL — so a fast scroll never skips a project and
    // every panel gets to play its animation, however hard the page is flung.
    function sync() {
      clearTimeout(syncTimer);
      const target = targetFor(scrolled);
      if (target === current) return;
      const dwell = reduced.matches ? 120 : MIN_DWELL;
      const wait = dwell - (performance.now() - lastChangeAt);
      if (wait > 0) { syncTimer = setTimeout(sync, wait); return; }
      open(current + (target > current ? 1 : -1));
      lastChangeAt = performance.now();
      if (current !== targetFor(scrolled)) syncTimer = setTimeout(sync, dwell);
    }

    function onScroll() {
      if (!scrollDriven) return;
      readScroll();
      sync();
    }

    grid.addEventListener('click', (e) => {
      const bar = e.target.closest('.work-item__bar');
      if (!bar) return;
      scrollDriven = false; // the visitor took over
      clearTimeout(syncTimer);
      open(items.indexOf(bar.closest('.work-item')));
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    window.addEventListener('resize', () => { layout(); onScroll(); });

    // Decode every panel image up front so the first time a panel opens it
    // doesn't stall on decoding a big WebP mid-animation.
    grid.querySelectorAll('img').forEach((img) => {
      if (img.decode) img.decode().catch(() => {});
    });

    // First paint: AEO open, or whichever project the scroll position already
    // asks for (page reloaded mid-scroll) — without animating into it.
    grid.classList.add('is-instant');
    open(0);
    layout(); // after a project is open, so the stage is measured at its real height
    readScroll();
    open(targetFor(scrolled)); // reloaded mid-scroll: straight to the right project, no walk-through
    booting = false;
    // Loaded mid-scroll on a later project: show its pieces at once. On AEO,
    // wait until the section is actually on screen, then play them.
    if (current > 0) land(items[current], 0, true);
    else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        if (current === 0) land(items[0], 300, false);
      }, { threshold: 0.35 });
      io.observe(stage);
    } else land(items[0], 0, true);
    requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.remove('is-instant')));
  }

  // projects.js may have rendered before this script ran
  if (document.querySelector('#main-projects-grid .work-item')) setup();
  else window.addEventListener('projects:rendered', setup, { once: true });
})();
