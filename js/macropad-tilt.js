// ============================================================
// Phone tilt for the macropad (pairs with css/macropad-tilt.css).
// Kept separate so it can be removed without touching macropad.js.
// ============================================================

(() => {
  const pad = document.getElementById('macropad');
  if (!pad || !window.DeviceOrientationEvent) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // gamma = left/right tilt in degrees. ±30° maps to -1 … 1, eased so
  // the pad drifts gently rather than snapping to the phone.
  const MAX_TILT_DEG = 30;
  const EASE = 0.08;
  let target = 0;
  let current = 0;
  let ticking = false;

  function step() {
    current += (target - current) * EASE;
    pad.style.setProperty('--tilt-x', current.toFixed(3));
    if (Math.abs(target - current) > 0.002) requestAnimationFrame(step);
    else ticking = false;
  }

  // Listen from the start: Android and desktop browsers send events
  // straight away; on iOS nothing arrives until permission is granted.
  window.addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    target = Math.max(-1, Math.min(1, e.gamma / MAX_TILT_DEG));
    if (!ticking) { ticking = true; requestAnimationFrame(step); }
  });

  // iOS 13+ only asks for motion access from inside a tap — use the
  // first tap on any macropad key.
  const DOE = window.DeviceOrientationEvent;
  if (typeof DOE.requestPermission === 'function') {
    pad.addEventListener('click', (e) => {
      if (e.target.closest('.macropad__key')) DOE.requestPermission().catch(() => {});
    }, { once: true });
  }
})();
