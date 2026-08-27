// keyboard.js — hero keyboard hotspot system (Step 11)
// Loads data/keyboard-keys.json, builds one positioned hotspot per key,
// and wires up the halftone "press" visual for both mouse/touch and a
// matching physical keydown. Only the confirmed functional keys
// (W/M/C/; ) trigger navigation — everything else is press-feedback only.

(function () {
  const layer = document.getElementById('keyboard-hotspot-layer');
  if (!layer) return;

  // ── Physical key → hotspot name ──────────────────────────────
  // Matched by KeyboardEvent.code (physical position), not .key, so the
  // special icon keys (which sit on top of W/M/C/;) still respond to the
  // real physical key regardless of what character it types.
  const CODE_TO_NAME = {
    F1: 'f1', F2: 'f2', F3: 'f3', F4: 'f4', F5: 'f5', F6: 'f6',
    F7: 'f7', F8: 'f8', F9: 'f9', F10: 'f10', F11: 'f11', F12: 'f12',
    PrintScreen: 'PrtSc', Delete: 'Del', Home: 'Home', End: 'End',
    PageUp: 'Pgup', PageDown: 'Pgdn',
    Backquote: '`', Digit1: '1', Digit2: '2', Digit3: '3', Digit4: '4',
    Digit5: '5', Digit6: '6', Digit7: '7', Digit8: '8', Digit9: '9',
    Digit0: '0', Minus: '-', Equal: '=',
    NumLock: 'numlock', NumpadDivide: 'num/', NumpadMultiply: 'num*',
    NumpadSubtract: 'num-',
    Tab: 'tab', KeyQ: 'q', KeyW: 'W_key_special_folder_icon', KeyE: 'e',
    KeyR: 'r', KeyT: 't', KeyY: 'y', KeyU: 'u', KeyI: 'i', KeyO: 'o',
    KeyP: 'p', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
    KeyA: 'a', KeyS: 's', KeyD: 'd', KeyF: 'f', KeyG: 'g', KeyH: 'h',
    KeyJ: 'j', KeyK: 'k', KeyL: 'l', Quote: "'", Enter: 'Enter',
    Numpad4: 'num4', Numpad5: 'num5', Numpad6: 'num6',
    ShiftLeft: 'Shift_left', KeyZ: 'z', KeyX: 'x',
    KeyC: 'C_key_special_vectorized_icon', KeyV: 'v', KeyB: 'b',
    KeyN: 'n', KeyM: 'M_key_special_hands_icon', Comma: ',',
    Period: '.', Slash: '/_or_shift_right_a', ShiftRight: 'Shift_right_b',
    Numpad8: 'num_up_8', ArrowUp: 'num_up_8',
    Numpad1: 'num1_End', Numpad2: 'num2', Numpad3: 'num3',
    ControlLeft: 'ctrl_left', MetaLeft: 'win', OSLeft: 'win',
    AltLeft: 'alt_left', Space: 'Space_DareToPlay', AltRight: 'AltGr',
    ControlRight: 'ctrl_right', ArrowLeft: 'arrow_left',
    ArrowDown: 'arrow_down_special_green', ArrowRight: 'arrow_right',
    Numpad0: 'num0', NumpadDecimal: 'num_dot', NumpadAdd: 'num_plus',
    NumpadEnter: 'num_enter', Semicolon: 'R_key_special_resume_icon',
    CapsLock: 'LOUD_MODE_capslock',
  };

  // Physical keys we deliberately never touch — native browser/scroll
  // behavior stays untouched (per Appendix A: "leave Up/Down alone").
  const NATIVE_ONLY = new Set(['ArrowUp', 'ArrowDown']);

  // ── Confirmed functional keys → navigation action ────────────
  const ACTIONS = {
    W_key_special_folder_icon: () => scrollToSection('work'),
    M_key_special_hands_icon: () => scrollToSection('about'),
    C_key_special_vectorized_icon: () => scrollToSection('connect'),
    R_key_special_resume_icon: () => window.open('assets/resume.pdf', '_blank', 'noopener'),
    arrow_down_special_green: () => scrollToSection('work'),
  };

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Keys whose icon "jumps" out of frame before the navigation action
  // fires, instead of navigating instantly. These also skip the
  // click-to-prime step below (see buildHotspot) - the slow, visible
  // jump is itself the "are you sure" beat, so a tap goes straight to
  // it instead of needing a preview click first.
  const JUMP_ON_NAVIGATE = new Set([
    'W_key_special_folder_icon',
    'M_key_special_hands_icon',
    'C_key_special_vectorized_icon',
  ]);

  // Keys that skip the click-to-prime step entirely - the jump keys
  // above (their own slow animation is the "are you sure" beat) plus
  // the down-arrow scroll hint, which is low-stakes enough (just a
  // scroll, not a navigate-away) to not need a preview tap either.
  const NO_PRIME_KEYS = new Set([...JUMP_ON_NAVIGATE, 'arrow_down_special_green']);

  const JUMP_DURATION_MS = 750; // matches the .is-jumping keyframe duration in keyboard.css
  // Scroll fires once the icon has visibly cleared the frame, rather
  // than mid-animation, so it reads as "icon leaves -> page follows"
  // instead of an instant cut under a still-playing animation.
  const JUMP_SCROLL_DELAY_MS = 550;

  function triggerAction(name) {
    const action = ACTIONS[name];
    if (!action) return;
    const el = hotspotsByName[name];
    const icon = el && el.querySelector('.key-icon');
    if (icon && JUMP_ON_NAVIGATE.has(name)) {
      icon.classList.add('is-jumping');
      setTimeout(() => icon.classList.remove('is-jumping'), JUMP_DURATION_MS);
      setTimeout(action, JUMP_SCROLL_DELAY_MS);
    } else {
      action();
    }
  }

  // ── Duck: jump-out-of-frame and back, one click ──
  // Frames pulled straight from Figma (floating "Frame 16/17/19-21"
  // library next to the keyboard). animFrames plays the jump-and-land
  // sprite sequence; the duck is "swimming" the rest of the time via
  // the looping water background below.
  const DUCK_FRAME_MS = 90;
  const DUCK_HI_HOLD_MS = 1100; // extra beat on the last frame (the "Hi") before reverting to idle
  const WATER_FRAME_MS = 950; // calm idle ripple, independent of the jump timing
  let duckAnimating = false;

  // Index into animFrames of the splash-landing sprite (frame "16") -
  // the moment the duck hits the water again, per Figma's own splash
  // droplet vectors sitting next to that frame (Vector 22/24/25).
  const DUCK_LANDING_FRAME_INDEX = 3;

  // The three droplet shapes Figma places next to the landing frame
  // (Vector 22/24/25), exported straight from those vector layers,
  // with their exact Figma position/size carried over as % of the
  // 202×63 key box so they land in the same spot as the source file.
  const DROPLETS = [
    { src: 'assets/images/keyboard-keys/duck-anim/droplets/droplet-1.svg', left: 76.75, top: 42.86, width: 9.85, height: 25.35 },
    { src: 'assets/images/keyboard-keys/duck-anim/droplets/droplet-2.svg', left: 72.22, top: 36.86, width: 6.40, height: 19.05 },
    { src: 'assets/images/keyboard-keys/duck-anim/droplets/droplet-3.svg', left: 42.28, top: 64.27, width: 3.52, height: 15.95 },
  ];

  function spawnSplash(el) {
    DROPLETS.forEach((d) => {
      const drop = document.createElement('img');
      drop.className = 'duck-droplet';
      drop.src = d.src;
      drop.alt = '';
      drop.style.left = d.left + '%';
      drop.style.top = d.top + '%';
      drop.style.width = d.width + '%';
      drop.style.height = d.height + '%';
      el.appendChild(drop);
      drop.addEventListener('animationend', () => drop.remove());
    });
  }

  function playDuckAnimation(key, el) {
    if (duckAnimating || !key.animFrames) return;
    duckAnimating = true;
    const icon = el.querySelector('.key-icon');
    el.classList.add('is-jumping');
    el.classList.remove('show-tooltip');

    key.animFrames.forEach((src, i) => {
      setTimeout(() => {
        icon.src = src;
        if (i === DUCK_LANDING_FRAME_INDEX) spawnSplash(el);
      }, i * DUCK_FRAME_MS);
    });

    const totalMs = (key.animFrames.length - 1) * DUCK_FRAME_MS + DUCK_HI_HOLD_MS;
    setTimeout(() => {
      icon.src = key.icon;
      el.classList.remove('is-jumping');
      duckAnimating = false;
    }, totalMs);
  }

  let hotspotsByName = {};
  let primedName = null;
  let primedTimer = null;

  function unprime() {
    if (primedName && hotspotsByName[primedName]) {
      hotspotsByName[primedName].classList.remove('show-tooltip');
    }
    primedName = null;
    clearTimeout(primedTimer);
  }

  function prime(name) {
    unprime();
    primedName = name;
    hotspotsByName[name].classList.add('show-tooltip');
    primedTimer = setTimeout(unprime, 2500);
  }

  function buildHotspot(key) {
    const el = document.createElement('div');
    el.className = 'key-hotspot';
    el.dataset.name = key.name;
    el.style.left = key.percent.left + '%';
    el.style.top = key.percent.top + '%';
    el.style.width = key.percent.width + '%';
    el.style.height = key.percent.height + '%';

    if (key.waterFrames) {
      // Sits behind .key-icon (appended first = painted first) - the
      // duck sprite frames have their pond pixels stripped to
      // transparent specifically so this shows through continuously,
      // idle and mid-jump alike, instead of a flat static backdrop.
      const waterBg = document.createElement('img');
      waterBg.className = 'key-water-bg';
      waterBg.src = key.waterFrames[0];
      waterBg.alt = '';
      el.appendChild(waterBg);
      let waterFrame = 0;
      setInterval(() => {
        waterFrame = (waterFrame + 1) % key.waterFrames.length;
        waterBg.src = key.waterFrames[waterFrame];
      }, WATER_FRAME_MS);
    }

    if (key.icon) {
      el.classList.add('is-colored');
      const icon = document.createElement('img');
      icon.className = 'key-icon';
      icon.src = key.icon;
      icon.alt = '';
      el.appendChild(icon);
    }

    if (key.tooltip) {
      const tip = document.createElement('span');
      tip.className = 'key-tooltip';
      tip.textContent = key.tooltip;
      el.appendChild(tip);
    }

    const action = ACTIONS[key.name];

    // Mouse/touch press visual.
    const press = () => el.classList.add('is-pressed');
    const release = () => el.classList.remove('is-pressed');
    el.addEventListener('pointerdown', press);
    el.addEventListener('pointerup', release);
    el.addEventListener('pointerleave', release);
    el.addEventListener('pointercancel', release);

    // Hover shows the tooltip directly on devices with real hover.
    if (key.tooltip) {
      el.addEventListener('mouseenter', () => el.classList.add('show-tooltip'));
      el.addEventListener('mouseleave', () => {
        if (primedName !== key.name) el.classList.remove('show-tooltip');
      });
    }

    // Duck: no navigation action, just the jump/splash/"Hi" sequence.
    if (key.animFrames) {
      el.addEventListener('click', () => playDuckAnimation(key, el));
    }

    // Click: jump-navigate keys (W/M/C) go straight to their slow,
    // visible jump-out - no priming needed, the animation itself is
    // the warning. Everything else still uses "first click primes/
    // shows tooltip, second click navigates" (e.g. R, which opens the
    // resume in a new tab and benefits from a preview first).
    el.addEventListener('click', () => {
      if (!action) return;
      if (NO_PRIME_KEYS.has(key.name)) {
        unprime();
        triggerAction(key.name);
      } else if (primedName === key.name) {
        unprime();
        triggerAction(key.name);
      } else if (key.tooltip) {
        prime(key.name);
      } else {
        triggerAction(key.name);
      }
    });

    return el;
  }

  fetch('data/keyboard-keys.json')
    .then((r) => r.json())
    .then((data) => {
      data.keys.forEach((key) => {
        const el = buildHotspot(key);
        layer.appendChild(el);
        hotspotsByName[key.name] = el;
      });
    })
    .catch((err) => console.error('keyboard.js: failed to load keyboard-keys.json', err));

  // ── Physical keyboard ─────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const name = CODE_TO_NAME[e.code];
    if (!name) return;
    const el = hotspotsByName[name];
    if (el) el.classList.add('is-pressed');

    if (NATIVE_ONLY.has(e.code)) return; // native scroll, no override

    const action = ACTIONS[name];
    if (action && !e.ctrlKey && !e.metaKey && !e.altKey) {
      triggerAction(name);
    }
  });

  window.addEventListener('keyup', (e) => {
    const name = CODE_TO_NAME[e.code];
    const el = name && hotspotsByName[name];
    if (el) el.classList.remove('is-pressed');
  });
})();
