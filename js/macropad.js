// ============================================================
// Phone macropad (≤ 767px) — key presses, settle-on-touch, pause
// when off-screen. Actions come from keyboard.js (window.heroKeys)
// so every key behaves exactly like its desktop twin.
// ============================================================

(() => {
  const pad = document.getElementById('macropad');
  if (!pad) return;

  // ── Keys: press feedback + action ──
  pad.querySelectorAll('.macropad__key').forEach((key) => {
    const release = () => key.classList.remove('is-pressed');
    key.addEventListener('pointerdown', () => {
      key.classList.add('is-pressed');
      if (window.heroKeys) window.heroKeys.sound(key.dataset.name);
    });
    key.addEventListener('pointerup', release);
    key.addEventListener('pointerleave', release);
    key.addEventListener('pointercancel', release);
    key.addEventListener('click', () => {
      if (!window.heroKeys) return;
      if (key.dataset.name === 'LOUD_MODE_capslock') {
        // The macropad has its own Figma bolts beside the key; keyboard.js
        // shows and hides them (.macropad__bolts.is-on) as Loud Mode flips
        window.heroKeys.trigger(key.dataset.name, null);
      } else {
        window.heroKeys.trigger(key.dataset.name, key);
      }
    });
  });

  // ── Plain keys painted into the pad: 3 / Q float their character
  // up out of the key, ↑ / ← shoot off in their own direction, Enter
  // thunks the whole pad. Press feedback matches the desktop keys. ──
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stageEl = pad.querySelector('.macropad__stage');
  const MAX_FLYING = 8;
  const ARROWS = {
    up:   { glyph: '↑', dx: 0,    dy: -130, cls: 'macropad__fly--up' },
    left: { glyph: '←', dx: -130, dy: 0,    cls: 'macropad__fly--left' },
  };

  function fly(fromKey, glyph, { dx, dy, r = 0, cls = '' }) {
    const flying = stageEl.querySelectorAll('.macropad__fly');
    if (flying.length >= MAX_FLYING) flying[0].remove();
    const k = fromKey.getBoundingClientRect();
    const s = stageEl.getBoundingClientRect();
    const el = document.createElement('span');
    el.className = ('macropad__fly ' + cls).trim();
    el.textContent = glyph;
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--x0', k.left + k.width / 2 - s.left + 'px');
    el.style.setProperty('--y0', k.top + k.height / 2 - s.top + 'px');
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');
    el.style.setProperty('--r', r + 'deg');
    stageEl.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  function thunk() {
    pad.classList.remove('is-thunk');
    void pad.offsetWidth; // restart the animation on rapid taps
    pad.classList.add('is-thunk');
  }
  pad.addEventListener('animationend', (e) => {
    if (e.animationName === 'macropad-thunk') pad.classList.remove('is-thunk');
  });

  pad.querySelectorAll('.macropad__plain').forEach((key) => {
    const release = () => key.classList.remove('is-pressed');
    const isEnter = 'enter' in key.dataset;
    // Same physical key the desktop board uses for this painted key
    const soundCode = isEnter ? 'Enter'
      : key.dataset.arrow === 'up' ? 'ArrowUp'
      : key.dataset.arrow === 'left' ? 'ArrowLeft'
      : /^[0-9]$/.test(key.dataset.char) ? 'Digit' + key.dataset.char
      : 'Key' + (key.dataset.char || '').toUpperCase();
    key.addEventListener('pointerdown', () => {
      key.classList.add('is-pressed');
      if (window.keySounds) window.keySounds.play(soundCode);
      // Enter bounces the moment the finger lands, so the press feels attached
      if (isEnter && !reducedMotion.matches) thunk();
    });
    key.addEventListener('pointerup', release);
    key.addEventListener('pointerleave', release);
    key.addEventListener('pointercancel', release);
    key.addEventListener('click', (e) => {
      if (reducedMotion.matches) return;
      // Pointer taps already bounced on pointerdown; e.detail is 0 only
      // for keyboard activation (Tab to it + Enter/Space)
      if (isEnter && e.detail !== 0) return;
      if (key.dataset.char) {
        fly(key, key.dataset.char, {
          dx: Math.random() * 60 - 30,
          dy: -110 - Math.random() * 40,
          r: Math.random() * 30 - 15,
        });
      } else if (key.dataset.arrow) {
        const a = ARROWS[key.dataset.arrow];
        fly(key, a.glyph, a);
      } else if ('enter' in key.dataset) {
        thunk();
      }
    });
  });

  // ── Settle: the pad "lands" while a finger is on it ──
  const stage = pad.querySelector('.macropad__stage');
  // (not on Enter: its own bounce replaces the settle, and the two
  // fighting over the pad's position caused a jump on the first press)
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('[data-enter]')) return;
    pad.classList.add('is-touched');
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) =>
    stage.addEventListener(type, () => pad.classList.remove('is-touched')));

  // ── Pause the float while the pad is off-screen ──
  new IntersectionObserver(([entry]) => {
    pad.classList.toggle('is-offscreen', !entry.isIntersecting);
  }).observe(pad);
})();
