// work-accordion.js — drives the Selected Work accordion (rendered by projects.js).
// One project is open at a time. The section pins (sticky) while the scroll
// steps through the projects, in both directions, until the visitor clicks a
// row. Clicking a closed row opens it.

(function () {
  const NAV_H = 80;       // sticky nav height the pinned stage sits under
  const BUFFER = 40;      // px of slack so a project doesn't flicker on a boundary

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
    const SNAP_WITHIN = 1100;
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

    // The track is one stage tall plus a "step" of pinned scroll per project.
    // The stage pins under the nav; on short screens it pins higher so the
    // whole list stays on screen (the header slides under the nav).
    function layout() {
      const vh = window.innerHeight;
      stage.style.setProperty('--stage-top', Math.min(NAV_H, vh - stage.offsetHeight - 16) + 'px');
      step = Math.max(320, Math.min(vh * 0.55, 520));
      // one full step of pinned scroll per project, so the last one still gets
      // its time on screen before the stage lets go
      track.style.height = (stage.offsetHeight + step * items.length) + 'px';
    }

    let laidOutAt = 0;

    function onScroll() {
      if (!scrollDriven) return;
      if (window.innerHeight !== laidOutAt) { laidOutAt = window.innerHeight; layout(); }
      const pinTop = parseFloat(stage.style.getPropertyValue('--stage-top')) || 0;
      const scrolled = pinTop - track.getBoundingClientRect().top; // 0 when it pins
      // read the step back from the real pinned distance so the two never drift apart
      step = (track.offsetHeight - stage.offsetHeight) / items.length;

      // project c is open while c*step <= scrolled < (c+1)*step; the buffer widens that
      if (current >= 0) {
        const lo = current === 0 ? -Infinity : current * step - BUFFER;
        const hi = current === items.length - 1 ? Infinity : (current + 1) * step + BUFFER;
        if (scrolled >= lo && scrolled < hi) return;
      }
      open(Math.max(0, Math.min(items.length - 1, Math.floor(scrolled / step))));
    }

    grid.addEventListener('click', (e) => {
      const bar = e.target.closest('.work-item__bar');
      if (!bar) return;
      scrollDriven = false; // the visitor took over
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
    layout();
    grid.classList.add('is-instant');
    open(0);
    onScroll();
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
