// work-cursor.js — over an open project panel the pointer becomes the
// backspace-key eyes; after a short pause a flat yellow "View case study"
// label slides out beside them (Figma: "Cursor / Project hover v2").
// Mouse/trackpad only. The eyes trail the pointer slightly and lean into the
// direction it moves; a click or Enter blinks them. Pressing Enter opens the
// hovered project.

(function () {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const grid = document.getElementById('main-projects-grid');
  if (!grid) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LABEL_DELAY = 250; // ms the eyes go it alone before the label slides out

  const cursor = document.createElement('div');
  cursor.className = 'work-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML =
    '<div class="work-cursor__pill">' +
    '<img class="work-cursor__eyes" src="assets/images/work-eyes.svg" alt="" draggable="false" />' +
    '<span class="work-cursor__label">View case study</span>' +
    '</div>';
  document.body.appendChild(cursor);
  const eyes = cursor.querySelector('.work-cursor__eyes');

  let tx = 0, ty = 0;      // where the pointer is
  let x = 0, y = 0;        // where the eyes are (they trail a little)
  let visible = false;
  let hovered = null;
  let raf = 0;
  let labelTimer = 0;

  // The native cursor is only hidden (css) once this script is running
  document.documentElement.classList.add('work-cursor-on');

  const panelAt = (el) => (el && el.closest ? el.closest('.work-item.is-open .work-panel') : null);

  function frame() {
    const ease = reduced ? 1 : 0.38;
    const dx = tx - x;
    x += dx * ease;
    y += (ty - y) * ease;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    // lean into the direction of travel (a few degrees at most)
    eyes.style.rotate = reduced ? '0deg' : `${Math.max(-7, Math.min(7, dx * 0.25))}deg`;
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  function show() {
    if (visible) return;
    visible = true;
    x = tx; y = ty;
    cursor.classList.add('is-visible');
    clearTimeout(labelTimer);
    labelTimer = setTimeout(() => cursor.classList.add('has-label'), reduced ? 0 : LABEL_DELAY);
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function hide() {
    if (!visible) return;
    visible = false;
    hovered = null;
    clearTimeout(labelTimer);
    cursor.classList.remove('is-visible', 'has-label', 'is-blink', 'is-pressed');
  }

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    const panel = panelAt(e.target);
    if (panel) { hovered = panel; show(); } else hide();
  }, { passive: true });

  document.addEventListener('mouseleave', hide);
  // the open project can change under a still pointer (scroll-driven); the
  // next mouse move brings the cursor back over whichever panel is there now
  window.addEventListener('scroll', hide, { passive: true });
  window.addEventListener('pageshow', hide);

  document.addEventListener('mousedown', () => {
    if (!visible) return;
    cursor.classList.add('is-blink', 'is-pressed');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('is-blink', 'is-pressed');
  });

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
    if (!visible || !hovered || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    const href = hovered.href;
    cursor.classList.add('is-blink', 'is-pressed');
    setTimeout(() => { window.location.href = href; }, 140); // let the press read first
  });
})();
