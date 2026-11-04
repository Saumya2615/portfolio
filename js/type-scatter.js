// EXPERIMENTAL — type-scatter
// Anything typed on the physical keyboard appears briefly at a random
// spot in the white space around the keyboard graphic: above it and in the
// gutters at its left and right, never over the keys. Self-contained
// and easy to rip out: delete this file, css/type-scatter.css, and the
// two <link>/<script> tags for them in index.html.
//
// The letters live in a fixed layer over the window, not inside the hero,
// and are placed at keypress time in whatever white space is on screen
// right now: below the nav bar, around the keyboard. People scroll the
// keyboard to the middle of the screen before typing, so the hero itself is
// usually scrolled out of view by then.

(function () {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const layer = document.createElement('div');
  layer.id = 'type-scatter-layer';
  document.body.appendChild(layer);

  const MAX_CHARS = 40; // safety cap so a held key can't flood the DOM
  const PAD = 24;       // px kept clear of the nav, the window edge and the text block
  const SIDE_PAD = 8;   // px between a letter and the keyboard / window edge
  const LETTER_W = 24;  // rough size of one letter (28px font), so it stays inside its region
  const LETTER_H = 34;
  const MIN_BAND = 64;  // last resort when nothing fits: this much room under the nav

  // Where letters may appear, as ranges for a letter's top-left corner in
  // window px: the white space above the keyboard and the gutters at its
  // left and right, never over the keys. Measured at each keypress since the
  // scroll position changes.
  function regions() {
    const nav = document.getElementById('nav');
    const keys = document.getElementById('keyboard-hotspot-layer');
    const w = window.innerWidth;
    const top = (nav ? nav.getBoundingClientRect().bottom : 0) + PAD;
    const winBottom = window.innerHeight - PAD;
    const k = keys ? keys.getBoundingClientRect() : null;
    const keysShown = k && k.height && k.top < winBottom && k.bottom > top;
    const list = [{
      l: w * 0.03,
      r: w * 0.97 - LETTER_W,
      t: top,
      b: (keysShown ? k.top - SIDE_PAD : winBottom) - LETTER_H,
    }];
    if (keysShown) {
      const b = winBottom - LETTER_H;
      list.push({ l: SIDE_PAD, r: k.left - SIDE_PAD - LETTER_W, t: top, b });
      list.push({ l: k.right + SIDE_PAD, r: w - SIDE_PAD - LETTER_W, t: top, b });
    }
    const valid = list.filter((g) => g.r > g.l && g.b > g.t);
    // Nothing fits (a short window with the keyboard right under the nav):
    // let letters float over the top edge of the keyboard rather than vanish.
    return valid.length ? valid : [{ l: w * 0.03, r: w * 0.97 - LETTER_W, t: top, b: top + MIN_BAND }];
  }

  // Keep letters out of the headline/subline block while it's on screen.
  function textRect() {
    const h1 = hero.querySelector('h1');
    const sub = hero.querySelector('.hero-subline');
    if (!h1 || !sub) return null;
    const a = h1.getBoundingClientRect();
    const b = sub.getBoundingClientRect();
    return {
      top: Math.min(a.top, b.top) - PAD,
      bottom: Math.max(a.bottom, b.bottom) + PAD,
      left: Math.min(a.left, b.left) - PAD,
      right: Math.max(a.right, b.right) + PAD,
    };
  }

  // Pick a region weighted by its area, so the big white space above the
  // keyboard gets most letters and the thin gutters get a few.
  function pickRegion(list) {
    const areas = list.map((g) => (g.r - g.l) * (g.b - g.t));
    let n = Math.random() * areas.reduce((a, b) => a + b, 0);
    for (let i = 0; i < list.length; i++) {
      n -= areas[i];
      if (n <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function randomSpot() {
    const list = regions();
    const text = textRect();
    let g = pickRegion(list);
    for (let i = 0; i < 12; i++) {
      const x = g.l + Math.random() * (g.r - g.l);
      const y = g.t + Math.random() * (g.b - g.t);
      const inText = text
        && x > text.left - LETTER_W && x < text.right
        && y > text.top - LETTER_H && y < text.bottom;
      if (!inText) return { x, y };
      g = pickRegion(list); // try another region if the headline is in the way
    }
    // Couldn't find a free spot in 12 tries: use the first region's corner
    return { x: list[0].l, y: list[0].t };
  }

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.key.length !== 1) return; // skip Enter/Shift/Tab/arrows/etc.
    spawn(e.key);
  });

  // Clicking a plain key on the hero keyboard (js/keyboard.js) types too
  window.addEventListener('keyboard:char', (e) => spawn(e.detail));

  function spawn(char) {
    if (layer.childElementCount >= MAX_CHARS) {
      layer.firstElementChild.remove();
    }

    const { x, y } = randomSpot();
    const span = document.createElement('span');
    span.className = 'type-scatter-char';
    span.textContent = char;
    span.style.left = x + 'px';
    span.style.top = y + 'px';
    span.style.setProperty('--r', Math.random() * 30 - 15 + 'deg');
    layer.appendChild(span);

    span.addEventListener('animationend', () => span.remove());
  }
})();
