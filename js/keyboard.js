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
    CapsLock: 'LOUD_MODE_capslock', Escape: 'smiley_personal',
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
    Space_DareToPlay: () => { window.location.href = 'playground.html'; },
    smiley_personal: () => triggerEscapeEffect(),
    LOUD_MODE_capslock: () => triggerLoudMode(),
  };

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Escape easter egg: pull-to-refresh-style bounce + wink of text,
  // then snaps back. Sits on the smiley key (top-left, same physical
  // spot as a real Esc key) as well as the actual Escape keypress.
  // Not a real exit - just a subversive joke (docs/portfolio-brief.md).
  const ESCAPE_HOLD_MS = 550; // pull-down (380ms, see escape.css) + a beat holding at full pull
  const ESCAPE_SNAP_MS = 200; // matches the snap-back transition in escape.css
  let escapeAnimating = false;

  function triggerEscapeEffect() {
    if (escapeAnimating) return;
    escapeAnimating = true;
    const page = document.getElementById('page-content');
    const overlay = document.querySelector('.escape-overlay');
    if (!page || !overlay) { escapeAnimating = false; return; }

    page.classList.add('escape-pull');
    overlay.classList.add('is-visible');

    setTimeout(() => {
      page.classList.remove('escape-pull');
      page.classList.add('escape-snap');
      overlay.classList.remove('is-visible');
    }, ESCAPE_HOLD_MS);

    setTimeout(() => {
      page.classList.remove('escape-snap');
      escapeAnimating = false;
    }, ESCAPE_HOLD_MS + ESCAPE_SNAP_MS);
  }

  // Caps Lock ("LOUD MODE") easter egg: a few lightning bolts pop up
  // around the key itself (same trick as the duck's splash droplets)
  // + the hero headline briefly bigger/bolder and shaking. Personality
  // only, no nav action (per portfolio-brief.md). The bolts themselves
  // are Figma's own art (Desktop - 30, the loose "Vector" shapes sitting
  // left of the Caps Lock key, node ids 172:4314/4315/4316/4317) -
  // exported straight from those layers, same as the duck's droplets.
  const LOUD_MODE_MS = 500; // matches the loud-mode-shake keyframe duration in loud-mode.css
  // left/top are % of the LOUD MODE key's own box (110x59), computed
  // from each vector's Figma position minus the key's own Figma
  // position - all negative/near-zero since the bolts sit to the key's
  // left in the source file. width is % of the key's width, aspect is
  // each SVG's own width/height so it doesn't get stretched.
  const LOUD_MODE_BOLTS = [
    { src: 'assets/images/keyboard-keys/loud-mode-bolt-top.svg', left: -59.75, top: -6.81, width: 54.5, aspect: 60 / 19 },
    { src: 'assets/images/keyboard-keys/loud-mode-bolt-upper.svg', left: -9.75, top: -13.76, width: 35.5, aspect: 39 / 27 },
    { src: 'assets/images/keyboard-keys/loud-mode-bolt-mid.svg', left: -23.49, top: 48.9, width: 28.2, aspect: 31 / 13 },
    { src: 'assets/images/keyboard-keys/loud-mode-bolt-bottom.svg', left: -33.29, top: 74.6, width: 45.5, aspect: 50 / 40 },
  ];
  let loudModeAnimating = false;

  function spawnLoudModeBolts(keyEl) {
    keyEl.classList.add('has-loud-bolts');
    let remaining = LOUD_MODE_BOLTS.length;
    LOUD_MODE_BOLTS.forEach((b) => {
      const bolt = document.createElement('img');
      bolt.className = 'loud-mode-bolt';
      bolt.src = b.src;
      bolt.alt = '';
      bolt.style.left = b.left + '%';
      bolt.style.top = b.top + '%';
      bolt.style.width = b.width + '%';
      bolt.style.aspectRatio = b.aspect;
      keyEl.appendChild(bolt);
      bolt.addEventListener('animationend', () => {
        bolt.remove();
        remaining -= 1;
        if (remaining === 0) keyEl.classList.remove('has-loud-bolts');
      });
    });
  }

  function triggerLoudMode() {
    if (loudModeAnimating) return;
    loudModeAnimating = true;
    const keyEl = hotspotsByName['LOUD_MODE_capslock'];
    const heading = document.querySelector('#hero h1');
    if (keyEl) spawnLoudModeBolts(keyEl);
    if (heading) heading.classList.add('loud-mode-shout');
    setTimeout(() => {
      if (heading) heading.classList.remove('loud-mode-shout');
      loudModeAnimating = false;
    }, LOUD_MODE_MS);
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
  const NO_PRIME_KEYS = new Set([...JUMP_ON_NAVIGATE, 'arrow_down_special_green', 'smiley_personal', 'LOUD_MODE_capslock']);

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

  // ── Eyes emoji: 2-3 eyes peek up from random plain keys ──
  // Personality-only, no nav action. Spawned onto plainKeyEls (the
  // undecorated letter/number/etc. keycaps) rather than the eyes key
  // itself, so it reads as the keyboard watching you back rather than
  // an animation confined to one key.
  const plainKeyEls = [];
  const EYE_POP_MS = 900; // matches the eye-pop keyframe duration in keyboard.css
  const EYE_STAGGER_MAX_MS = 150; // per-eye random delay so they don't pop in lockstep

  function pickRandomKeys(count) {
    const pool = plainKeyEls.slice();
    const picked = [];
    while (picked.length < count && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(i, 1)[0]);
    }
    return picked;
  }

  // Trimmed to just the eye shapes (no yellow keycap background) so the
  // peek reads as eyes emerging from the key itself, not a floating chip.
  const EYES_ICON_SRC = 'assets/images/keyboard-keys/eyes-emoji-peek.svg';

  function spawnEyePeek(keyEl) {
    const wrap = document.createElement('div');
    wrap.className = 'eye-peek';
    const icon = document.createElement('img');
    icon.className = 'eye-peek-icon';
    icon.src = EYES_ICON_SRC;
    icon.alt = '';
    wrap.appendChild(icon);
    keyEl.classList.add('has-eye-peek');
    keyEl.appendChild(wrap);
    wrap.addEventListener('animationend', (e) => {
      if (e.target !== wrap) return; // wait for the wrapper's own pop animation, not the icon's wiggle
      wrap.remove();
      keyEl.classList.remove('has-eye-peek');
    });
  }

  function triggerEyesPeek() {
    const count = Math.random() < 0.5 ? 2 : 3;
    pickRandomKeys(count).forEach((keyEl) => {
      setTimeout(() => spawnEyePeek(keyEl), Math.random() * EYE_STAGGER_MAX_MS);
    });
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
    } else if (key.name !== 'eyes_emoji') {
      // Plain keycap (no custom icon) - eligible spot for an eyes-key
      // peek to pop up on. Excludes eyes_emoji itself, which has no
      // icon either but shouldn't spawn a peek on top of its own key.
      plainKeyEls.push(el);
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

    // Eyes emoji: no navigation action, just the multi-eye peek.
    if (key.name === 'eyes_emoji') {
      el.addEventListener('click', triggerEyesPeek);
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
