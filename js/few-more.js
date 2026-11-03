// few-more.js — "A few more >>" on phones: the four cards sit in a
// swipeable one-at-a-time track; the < > buttons step it and dim at the
// first / last card. At ≥ 768px the track is a plain two-column grid and
// the buttons stay hidden (css/few-more.css), so none of this runs there.

(() => {
  const track = document.getElementById('secondary-projects-grid');
  const arrows = document.querySelector('#more-work .more-arrows');
  if (!track || !arrows) return;

  const prev = arrows.querySelector('[data-dir="-1"]');
  const next = arrows.querySelector('[data-dir="1"]');
  const phone = window.matchMedia('(max-width: 767px)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cards = () => Array.from(track.querySelectorAll('.more-card-link'));

  // The card whose left edge is closest to the track's left edge
  function currentIndex() {
    const list = cards();
    const left = track.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    list.forEach((el, i) => {
      const dist = Math.abs(el.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - left);
      if (dist < bestDist) { best = i; bestDist = dist; }
    });
    return best;
  }

  function update() {
    const last = cards().length - 1;
    const i = currentIndex();
    prev.disabled = i <= 0;
    next.disabled = i >= last;
  }

  function step(dir) {
    const list = cards();
    const target = list[Math.max(0, Math.min(list.length - 1, currentIndex() + dir))];
    if (!target) return;
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    track.scrollTo({
      left: target.offsetLeft - pad,
      behavior: reduceMotion.matches ? 'auto' : 'smooth',
    });
  }

  function sync() {
    arrows.hidden = !phone.matches;
    update();
  }

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  phone.addEventListener('change', sync);
  window.addEventListener('projects:rendered', sync);
  sync();
})();
