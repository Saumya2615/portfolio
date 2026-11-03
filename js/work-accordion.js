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

    function open(index) {
      if (index === current) return;
      current = index;
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
    requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.remove('is-instant')));
  }

  // projects.js may have rendered before this script ran
  if (document.querySelector('#main-projects-grid .work-item')) setup();
  else window.addEventListener('projects:rendered', setup, { once: true });
})();
