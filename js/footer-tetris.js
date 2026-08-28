// footer-tetris.js — scroll-driven "pixels fall from About into the footer" effect
// Each .fly-dot (About section) drops into its matching .footer-tab cavity
// (data-land) as the user scrolls from #about to #connect, like tetris blocks
// dropping into place. Fully tied to scroll position — scroll back up and the
// blocks rise back out of the footer.

(function () {
  const flyDots = Array.from(document.querySelectorAll('.fly-dot'));
  const about = document.getElementById('about');
  const connect = document.getElementById('connect');
  if (!flyDots.length || !about || !connect) return;

  const MOBILE_BREAKPOINT = 768;
  const STAGGER = 0.1;   // fraction of the scroll range each dot's start is offset by
  const RUNWAY = 400;    // px of extra scroll before #about's top that the fall spreads across, for a slower feel
  const SMOOTHING = 0.09; // lower = smoother/laggier trailing motion

  let pairs = [];
  let startY = 0;
  let endY = 0;
  let active = false;
  let rafId = null;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function reset() {
    flyDots.forEach(el => {
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.zIndex = '';
      el.style.margin = '';
      el.style.pointerEvents = '';
    });
  }

  function measure() {
    active = window.innerWidth > MOBILE_BREAKPOINT;
    if (!active) { reset(); return; }

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

    flyDots.forEach(el => {
      el.style.position = 'fixed';
      el.style.margin = '0';
      el.style.zIndex = '500';
      el.style.pointerEvents = 'none';
    });

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    startY = about.offsetTop - RUNWAY;
    endY = Math.min(connect.offsetTop, maxScroll);
    if (endY <= startY) endY = startY + 1;

    pairs.forEach(p => {
      p.currentX = p.originX;
      p.currentY = p.originY;
    });

    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    if (!active) { rafId = null; return; }
    const scrollY = window.scrollY;
    const globalT = Math.min(1, Math.max(0, (scrollY - startY) / (endY - startY)));
    const span = 1 - (pairs.length - 1) * STAGGER;

    pairs.forEach((p, i) => {
      const localT = Math.min(1, Math.max(0, (globalT - i * STAGGER) / span));
      const eased = easeInOutCubic(localT);
      const targetPageX = p.originX + (p.targetX - p.originX) * eased;
      const targetPageY = p.originY + (p.targetY - p.originY) * eased;

      p.currentX += (targetPageX - p.currentX) * SMOOTHING;
      p.currentY += (targetPageY - p.currentY) * SMOOTHING;

      p.el.style.left = p.currentX + 'px';
      p.el.style.top = (p.currentY - scrollY) + 'px';
    });

    rafId = requestAnimationFrame(tick);
  }

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('load', measure);
  measure();
})();
