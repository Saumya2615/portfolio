// doodle-draw.js — draws hand-drawn pieces into the open work panel, as if a pen
// were tracing them. A piece with data-fx="draw" is a <canvas data-src="x.webp">
// (projects.js); x.t.webp next to it is a grayscale map of *when the pen reaches
// each pixel* (it starts top-left, follows the ink, hops small gaps, then moves
// on to the next separate part). The canvas shows only pixels the pen has reached.
// Each piece sets its own timing: data-delay and data-dur (ms) and data-ease
// (in / out / inout) from panel.motion in data/projects.json.
// work-accordion.js adds .is-landed (and .is-snap to skip the motion) to the open
// item; this watches those classes, so the two stay independent.

(function () {
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LEVELS = 256;        // the map has 256 steps of "when"
  const state = new WeakMap();

  const EASE = {
    in: (p) => p * p,
    out: (p) => 1 - (1 - p) * (1 - p),
    inout: (p) => p * p * (3 - 2 * p)
  };

  function load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  function pixels(img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, c.width, c.height);
  }

  function prepare(cv) {
    let s = state.get(cv);
    if (s) return s;
    s = { raf: 0, level: -1 };
    state.set(cv, s);
    const src = cv.dataset.src;
    s.ready = Promise.all([load(src), load(src.replace(/\.webp$/, '.t.webp'))]).then(([art, map]) => {
      const color = pixels(art);
      const time = pixels(map).data;
      const n = color.width * color.height;
      // bucket the pixels by when the pen reaches them, so each frame only
      // touches the pixels it has just passed
      const count = new Uint32Array(LEVELS + 1);
      for (let i = 0; i < n; i++) if (color.data[i * 4 + 3]) count[time[i * 4] + 1]++;
      for (let l = 0; l < LEVELS; l++) count[l + 1] += count[l];
      const order = new Uint32Array(count[LEVELS]);
      const fill = count.slice();
      for (let i = 0; i < n; i++) if (color.data[i * 4 + 3]) order[fill[time[i * 4]]++] = i;
      s.alpha = new Uint8ClampedArray(n);
      for (let i = 0; i < n; i++) s.alpha[i] = color.data[i * 4 + 3];
      s.start = count;
      s.order = order;
      s.out = new ImageData(new Uint8ClampedArray(color.data), color.width, color.height);
      cv.width = color.width;
      cv.height = color.height;
      s.ctx = cv.getContext('2d');
      blank(s);
    });
    return s;
  }

  function blank(s) {
    const d = s.out.data;
    for (let i = 3; i < d.length; i += 4) d[i] = 0;
    s.level = -1;
    s.ctx.clearRect(0, 0, s.out.width, s.out.height);
  }

  // reveal every pixel the pen has reached by `level` (0 – 255)
  function reveal(s, level) {
    if (level <= s.level) return;
    const d = s.out.data;
    for (let k = s.start[s.level + 1]; k < s.start[level + 1]; k++) {
      const i = s.order[k];
      d[i * 4 + 3] = s.alpha[i];
    }
    s.level = level;
    s.ctx.putImageData(s.out, 0, 0);
  }

  function complete(cv) {
    prepare(cv).ready.then(() => reveal(state.get(cv), LEVELS - 1));
  }

  function clear(cv) {
    const s = state.get(cv);
    if (!s) return;
    cancelAnimationFrame(s.raf);
    s.started = false;
    if (s.ctx) blank(s);
  }

  function play(cv) {
    const s = prepare(cv);
    s.started = true;
    const delay = +cv.dataset.delay || 0;
    const dur = +cv.dataset.dur || 800;
    const ease = EASE[cv.dataset.ease] || EASE.inout;
    s.ready.then(() => {
      if (!s.started) return;
      let t0 = null;
      const tick = (now) => {
        if (!s.started) return;
        if (t0 === null) t0 = now + delay;
        const p = Math.min(1, Math.max(0, (now - t0) / dur));
        if (p > 0) reveal(s, Math.min(LEVELS - 1, Math.floor(ease(p) * LEVELS)));
        if (p < 1) s.raf = requestAnimationFrame(tick);
      };
      s.raf = requestAnimationFrame(tick);
    });
  }

  function sync(item) {
    const landed = item.classList.contains('is-landed');
    const cvs = item.querySelectorAll('canvas[data-fx="draw"]');
    cvs.forEach(prepare);
    if (landed && !item._drawn) {
      item._drawn = true;
      const snap = item.classList.contains('is-snap') || reduced.matches;
      cvs.forEach((cv) => (snap ? complete(cv) : play(cv)));
    } else if (landed) {
      // art swapped at a breakpoint while open: show new pieces finished
      cvs.forEach((cv) => { if (!state.get(cv).started) { state.get(cv).started = true; complete(cv); } });
    } else if (item._drawn) {
      item._drawn = false;
      cvs.forEach(clear);
    }
  }

  const items = () => grid.querySelectorAll('.work-item');
  new MutationObserver(() => items().forEach(sync)).observe(grid, {
    subtree: true, childList: true, attributes: true, attributeFilter: ['class']
  });
  items().forEach(sync);
})();
