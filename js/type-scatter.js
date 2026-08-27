// EXPERIMENTAL — type-scatter
// Anything typed on the physical keyboard appears briefly at a random
// spot in the white hero area above the keyboard graphic. Self-contained
// and easy to rip out: delete this file, css/type-scatter.css, and the
// two <link>/<script> tags for them in index.html.

(function () {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const layer = document.createElement('div');
  layer.id = 'type-scatter-layer';
  hero.appendChild(layer);

  const MAX_CHARS = 40; // safety cap so a held key can't flood the DOM

  // Keep spawned letters out of the headline/subline block - only the
  // white space around it should get them. Re-measured on resize since
  // the text block's size/position shifts across breakpoints.
  let excludeRect = null;
  function measureExcludeRect() {
    const h1 = hero.querySelector('h1');
    const sub = hero.querySelector('.hero-subline');
    const heroRect = hero.getBoundingClientRect();
    if (!h1 || !sub || !heroRect.width || !heroRect.height) {
      excludeRect = null;
      return;
    }
    const h1Rect = h1.getBoundingClientRect();
    const subRect = sub.getBoundingClientRect();
    const pad = 24; // px breathing room around the text block
    excludeRect = {
      top: ((Math.min(h1Rect.top, subRect.top) - pad - heroRect.top) / heroRect.height) * 100,
      bottom: ((Math.max(h1Rect.bottom, subRect.bottom) + pad - heroRect.top) / heroRect.height) * 100,
      left: ((Math.min(h1Rect.left, subRect.left) - pad - heroRect.left) / heroRect.width) * 100,
      right: ((Math.max(h1Rect.right, subRect.right) + pad - heroRect.left) / heroRect.width) * 100,
    };
  }
  measureExcludeRect();
  window.addEventListener('resize', measureExcludeRect);

  function randomSpot() {
    for (let i = 0; i < 12; i++) {
      const x = 3 + Math.random() * 94;
      const y = 3 + Math.random() * 94;
      const inText = excludeRect
        && x > excludeRect.left && x < excludeRect.right
        && y > excludeRect.top && y < excludeRect.bottom;
      if (!inText) return { x, y };
    }
    // Couldn't find a free spot in 12 tries (narrow viewport) - fall
    // back to a side margin, which is safe since the text is centered.
    return { x: Math.random() < 0.5 ? 2 : 96, y: 3 + Math.random() * 94 };
  }

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.key.length !== 1) return; // skip Enter/Shift/Tab/arrows/etc.

    if (layer.childElementCount >= MAX_CHARS) {
      layer.firstElementChild.remove();
    }

    const { x, y } = randomSpot();
    const span = document.createElement('span');
    span.className = 'type-scatter-char';
    span.textContent = e.key;
    span.style.left = x + '%';
    span.style.top = y + '%';
    span.style.setProperty('--r', Math.random() * 30 - 15 + 'deg');
    layer.appendChild(span);

    span.addEventListener('animationend', () => span.remove());
  });
})();
