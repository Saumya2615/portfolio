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

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.key.length !== 1) return; // skip Enter/Shift/Tab/arrows/etc.

    if (layer.childElementCount >= MAX_CHARS) {
      layer.firstElementChild.remove();
    }

    const span = document.createElement('span');
    span.className = 'type-scatter-char';
    span.textContent = e.key;
    span.style.left = 5 + Math.random() * 85 + '%';
    span.style.top = 5 + Math.random() * 80 + '%';
    span.style.setProperty('--r', Math.random() * 30 - 15 + 'deg');
    layer.appendChild(span);

    span.addEventListener('animationend', () => span.remove());
  });
})();
