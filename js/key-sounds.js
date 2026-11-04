// key-sounds.js — keyboard click sounds (Mechvibes pack by w.ktz, see
// assets/sounds/keyboard/CREDITS.txt). One short wav holds every key's click;
// config.json says where each KeyboardEvent.code's slice starts and ends (ms).
// A physical keydown plays its slice, and js/keyboard.js calls
// window.keySounds.play(code) when a key on the hero keyboard is pressed.

(function () {
  const BASE = 'assets/sounds/keyboard/';
  const VOLUME = 0.6;
  const FALLBACK_CODE = 'KeyA'; // keys the pack doesn't list still click

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  let ctx = null;
  let buffer = null;
  let slices = null;
  let gain = null;
  // Off until Loud Mode (the Caps Lock key, js/keyboard.js) turns it on
  let enabled = false;

  // Created up front (suspended) so the wav is decoded by the first press;
  // browsers only let it start after a gesture, see unlock() below.
  function load() {
    ctx = new AudioCtx();
    gain = ctx.createGain();
    gain.gain.value = VOLUME;
    gain.connect(ctx.destination);

    Promise.all([
      fetch(BASE + 'config.json').then((r) => r.json()),
      fetch(BASE + 'keys.wav').then((r) => r.arrayBuffer()),
    ])
      .then(([config, wav]) => {
        slices = config.definitions;
        return ctx.decodeAudioData(wav);
      })
      .then((decoded) => { buffer = decoded; })
      .catch((err) => console.error('key-sounds.js: failed to load the click sounds', err));
  }

  function play(code) {
    if (!enabled || !buffer || !slices) return;
    const def = slices[code] || slices[FALLBACK_CODE];
    if (!def || !def.timing.length) return;
    const [start, end] = def.timing[0];
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(gain);
    src.start(0, start / 1000, (end - start) / 1000);
  }

  function unlock() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);

  window.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey) return;
    play(e.code);
  });

  window.keySounds = {
    play,
    setEnabled(on) { enabled = !!on; },
    isEnabled() { return enabled; },
  };
  load();
})();
