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
    key.addEventListener('pointerdown', () => key.classList.add('is-pressed'));
    key.addEventListener('pointerup', release);
    key.addEventListener('pointerleave', release);
    key.addEventListener('pointercancel', release);
    key.addEventListener('click', () => {
      if (window.heroKeys) window.heroKeys.trigger(key.dataset.name, key);
    });
  });

  // ── Settle: the pad "lands" while a finger is on it ──
  const stage = pad.querySelector('.macropad__stage');
  stage.addEventListener('pointerdown', () => pad.classList.add('is-touched'));
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) =>
    stage.addEventListener(type, () => pad.classList.remove('is-touched')));

  // ── Pause the float while the pad is off-screen ──
  new IntersectionObserver(([entry]) => {
    pad.classList.toggle('is-offscreen', !entry.isIntersecting);
  }).observe(pad);
})();
