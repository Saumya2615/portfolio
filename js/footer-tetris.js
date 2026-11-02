// footer-tetris.js — "pixels fall from About into the footer" effect
// Each .fly-dot rests in its spot in the About section while you scroll
// (so it never drifts across the intro text). The moment you reach the
// bottom of the page, the squares drop one after another into their
// matching .footer-tab cavities (data-land), like tetris blocks settling.
// Scroll back up a little and they float home again, ready to replay.

(function () {
  const flyDots = Array.from(document.querySelectorAll('.fly-dot'));
  const about = document.getElementById('about');
  const connect = document.getElementById('connect');
  if (!flyDots.length || !about || !connect) return;

  const MOBILE_BREAKPOINT = 767;
  const DURATION_MS = 650;     // one square's trip between About and its slot
  const STAGGER_MS = 70;       // delay between consecutive squares
  const BOTTOM_PX = 100;       // start dropping this close to the bottom (smooth-scroll
                               // momentum makes the last few px arrive late)
  const LEAVE_PX = 260;        // scroll this far back up before they float home
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let pairs = [];
  let active = false;
  let landed = false;          // where the squares are headed: slots (true) or home
  let animStart = 0;
  let rafId = null;

  // Each dot's home in the About markup, so reset() can put it back.
  const homes = flyDots.map(el => ({ parent: el.parentNode, next: el.nextSibling }));

  // Ease-out: moves from the very first frame (no slow wind-up), then
  // decelerates to a standstill so each square settles softly into place.
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Positioned with transform (not left/top): sub-pixel, GPU-composited
  // movement instead of whole-pixel steps that read as choppy.
  function place(el, x, y) {
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function destination(p) {
    return landed ? { x: p.targetX, y: p.targetY } : { x: p.originX, y: p.originY };
  }

  function reset() {
    flyDots.forEach((el, i) => {
      if (el.parentNode === document.body) {
        const { parent, next } = homes[i];
        // Fall back to appending if the saved neighbour isn't there anymore
        parent.insertBefore(el, next && next.parentNode === parent ? next : null);
      }
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.transform = '';
      el.style.willChange = '';
      el.style.zIndex = '';
      el.style.margin = '';
      el.style.pointerEvents = '';
    });
  }

  function measure() {
    active = window.innerWidth > MOBILE_BREAKPOINT;
    if (!active) { reset(); pairs = []; return; }

    // Where each dot currently is, so a re-measure (e.g. when fonts or
    // images finish loading and shift the layout) doesn't snap a dot
    // that's mid-flight.
    const previous = new Map(pairs.map(p => [p.el, p]));
    const animating = rafId !== null;

    reset(); // measure natural (CSS-defined) positions before fixing

    pairs = flyDots.map(el => {
      const index = el.getAttribute('data-fly');
      const target = document.querySelector(`.footer-tab[data-land="${index}"]`);
      const originRect = el.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      return {
        el,
        originX: originRect.left + window.scrollX,
        originY: originRect.top + window.scrollY,
        targetX: targetRect.left + window.scrollX,
        targetY: targetRect.top + window.scrollY,
      };
    });

    // Absolute in page coordinates on <body>, so the squares scroll
    // natively with the page. Moved out of #about since its
    // overflow-x: hidden would clip the fall.
    flyDots.forEach(el => {
      document.body.appendChild(el);
      el.style.position = 'absolute';
      el.style.left = '0';
      el.style.top = '0';
      el.style.willChange = 'transform';
      el.style.margin = '0';
      el.style.zIndex = '50'; // above content, below the fixed nav (100)
      el.style.pointerEvents = 'none';
    });

    pairs.forEach(p => {
      const prev = previous.get(p.el);
      if (animating && prev) {
        // Mid-flight: keep going from where it is, toward the fresh slot
        p.fromX = prev.fromX;
        p.fromY = prev.fromY;
        p.currentX = prev.currentX;
        p.currentY = prev.currentY;
      } else {
        const d = destination(p);
        p.currentX = d.x;
        p.currentY = d.y;
      }
      place(p.el, p.currentX, p.currentY);
    });

    checkScroll();
  }

  function startMove(toLanded) {
    landed = toLanded;
    pairs.forEach(p => { p.fromX = p.currentX; p.fromY = p.currentY; });
    animStart = performance.now();
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!active) { rafId = null; return; }
    const duration = reducedMotion.matches ? 1 : DURATION_MS;
    const stagger = reducedMotion.matches ? 0 : STAGGER_MS;
    let running = false;

    pairs.forEach((p, i) => {
      // Landing goes in order; floating home goes in reverse order
      const slot = landed ? i : pairs.length - 1 - i;
      const t = Math.min(1, Math.max(0, (now - animStart - slot * stagger) / duration));
      if (t < 1) running = true;
      const e = easeOutCubic(t);
      const d = destination(p);
      p.currentX = p.fromX + (d.x - p.fromX) * e;
      p.currentY = p.fromY + (d.y - p.fromY) * e;
      place(p.el, p.currentX, p.currentY);
    });

    rafId = running ? requestAnimationFrame(tick) : null;
  }

  function checkScroll() {
    if (!active) return;
    const fromBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
    if (!landed && fromBottom <= BOTTOM_PX) startMove(true);
    else if (landed && fromBottom > LEAVE_PX) startMove(false);
  }

  window.addEventListener('scroll', checkScroll, { passive: true });

  let resizeTimer;
  function scheduleMeasure() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  }

  // Start/end points are page coordinates, so they go stale whenever the
  // layout above them shifts. On a first (uncached) visit that happens
  // AFTER the initial measure: web fonts swap in (display=swap changes
  // text heights), images load, projects.js renders the project grids.
  // Re-measure on any of those, plus any change in page height.
  window.addEventListener('resize', scheduleMeasure);
  window.addEventListener('load', measure);
  window.addEventListener('projects:rendered', measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ('ResizeObserver' in window) {
    let lastHeight = 0;
    new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (h !== lastHeight) { lastHeight = h; scheduleMeasure(); }
    }).observe(document.body);
  }
  measure();
})();
