// game.js — Basketball spacebar mini-game (Step 12)
// State machine: IDLE -> CHARGING -> SHOOTING -> RESULT -> IDLE (loop)
//                                                        -> GAME_OVER (on timer 0)
// Trigger rule: Space/Escape are only bound while this page (Playground) is
// loaded, and only act when no text input is focused — simplest reliable
// rule since the game has this dedicated page to itself.

(function () {
  const frame = document.getElementById('game-frame');
  if (!frame) return; // game markup not present on this page

  const ball = document.getElementById('game-ball');
  const ballImg = ball.querySelector('.game-ball__img');
  const hoop = document.getElementById('game-hoop');
  const chargeMeter = document.getElementById('charge-meter');
  const chargeFill = document.getElementById('charge-meter-fill');
  const scoreEl = document.getElementById('hud-score');
  const timeEl = document.getElementById('hud-time');
  const spaceKey = document.getElementById('key-space');
  const escapeKey = document.getElementById('key-escape');
  const resultFlash = document.getElementById('result-flash');
  const streakPulse = document.getElementById('streak-pulse');
  const exitModal = document.getElementById('exit-modal');
  const exitConfirm = document.getElementById('exit-confirm');
  const exitCancel = document.getElementById('exit-cancel');
  const gameOverModal = document.getElementById('game-over');
  const finalScoreEl = document.getElementById('final-score');
  const playAgainBtn = document.getElementById('play-again');

  const CHARGE_DURATION_MS = 1200; // full 0-100% fill time, loops if held longer
  const MIN_CHARGE_MS = 100; // taps shorter than this don't count as a shot
  const SHOT_DURATION_MS = 650;
  const ROUND_SECONDS = 30;
  const SWEET_SPOT = [60, 80]; // % range that counts as a make

  let state = 'IDLE';
  let score = 0;
  let streak = 0;
  let timeLeft = ROUND_SECONDS;
  let timerId = null;
  let chargeStart = 0;
  let chargeRaf = null;
  let ballBaseTransform = '';

  function pad4(n) {
    return String(n).padStart(4, '0');
  }

  function formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  function updateHud() {
    scoreEl.textContent = pad4(score);
    timeEl.textContent = formatTime(Math.max(timeLeft, 0));
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(() => {
      timeLeft -= 1;
      updateHud();
      if (timeLeft <= 0) {
        endGame();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  // ── Charging ──
  function startCharge() {
    if (state !== 'IDLE') return;
    state = 'CHARGING';
    chargeStart = performance.now();
    ball.classList.add('is-charging');
    chargeMeter.classList.add('is-visible');
    spaceKey.classList.add('is-pressed');
    tickCharge();
  }

  function currentChargePercent(now) {
    const elapsed = now - chargeStart;
    const cycle = (elapsed % (CHARGE_DURATION_MS * 2)) / CHARGE_DURATION_MS;
    // ping-pong 0 -> 1 -> 0 so holding past 100% cycles back down
    const pct = cycle <= 1 ? cycle : 2 - cycle;
    return Math.max(0, Math.min(1, pct)) * 100;
  }

  function tickCharge() {
    if (state !== 'CHARGING') return;
    const pct = currentChargePercent(performance.now());
    chargeFill.style.width = `${pct}%`;
    chargeRaf = requestAnimationFrame(tickCharge);
  }

  function stopChargeVisuals() {
    if (chargeRaf) cancelAnimationFrame(chargeRaf);
    chargeRaf = null;
    ball.classList.remove('is-charging');
    chargeMeter.classList.remove('is-visible');
    chargeFill.style.width = '0%';
    spaceKey.classList.remove('is-pressed');
  }

  function cancelCharge() {
    stopChargeVisuals();
    if (state === 'CHARGING') state = 'IDLE';
  }

  // ── Shooting ──
  function releaseCharge() {
    if (state !== 'CHARGING') return;
    const now = performance.now();
    const held = now - chargeStart;
    const chargePct = currentChargePercent(now);
    stopChargeVisuals();

    if (held < MIN_CHARGE_MS) {
      // too quick to count as a real attempt
      state = 'IDLE';
      return;
    }

    shoot(chargePct);
  }

  function shoot(chargePct) {
    state = 'SHOOTING';

    const frameRect = frame.getBoundingClientRect();
    const ballRect = ball.getBoundingClientRect();
    const hoopRect = hoop.getBoundingClientRect();

    const startX = ballRect.left + ballRect.width / 2 - frameRect.left;
    const startY = ballRect.top + ballRect.height / 2 - frameRect.top;
    // rim opening sits near the top-left of the hoop image (net hangs below/right of it)
    const targetX = hoopRect.left + hoopRect.width * 0.38 - frameRect.left;
    const targetY = hoopRect.top + hoopRect.height * 0.22 - frameRect.top;

    let travelFactor;
    let outcome;
    if (chargePct < SWEET_SPOT[0]) {
      outcome = 'short';
      travelFactor = 0.5 + (chargePct / SWEET_SPOT[0]) * 0.45;
    } else if (chargePct > SWEET_SPOT[1]) {
      outcome = 'long';
      travelFactor = 1.02 + ((chargePct - SWEET_SPOT[1]) / (100 - SWEET_SPOT[1])) * 0.5;
    } else {
      outcome = 'make';
      travelFactor = 1;
    }

    const dx = (targetX - startX) * travelFactor;
    const dy = (targetY - startY) * travelFactor;
    const distance = Math.hypot(dx, dy);
    const arcHeight = Math.max(distance * 0.55, 60);

    const startTime = performance.now();

    function animate(now) {
      const t = Math.min((now - startTime) / SHOT_DURATION_MS, 1);
      const heightFactor = Math.sin(Math.PI * t); // 0 at start/end, 1 at the peak of the arc
      const x = dx * t;
      const y = dy * t - arcHeight * heightFactor;
      const rotate = 360 * t;
      ball.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg)`;

      // shadow drifts further and fades as the ball lifts higher off the "surface"
      const blur = 4 + heightFactor * 14;
      const offset = 6 + heightFactor * 10;
      const opacity = Math.max(0.22 - heightFactor * 0.16, 0.05);
      ballImg.style.filter = `drop-shadow(0 ${offset}px ${blur}px rgba(12, 10, 9, ${opacity}))`;

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        resolveShot(outcome);
      }
    }

    requestAnimationFrame(animate);
  }

  function resolveShot(outcome) {
    state = 'RESULT';

    if (outcome === 'make') {
      score += 1;
      streak += 1;
      updateHud();
      flashResult('SWISH!', 'is-make');
      if (streak > 0 && streak % 3 === 0) {
        pulseStreak();
      }
    } else {
      streak = 0;
      flashResult(outcome === 'short' ? 'SHORT' : 'OFF THE MARK', 'is-miss');
    }

    setTimeout(() => {
      resetBall();
      resultFlash.classList.remove('is-visible');
      if (state !== 'GAME_OVER') state = 'IDLE';
    }, 550);
  }

  function flashResult(text, cls) {
    resultFlash.textContent = text;
    resultFlash.classList.remove('is-make', 'is-miss');
    resultFlash.classList.add(cls);
    // reflow so re-triggering the transition works on repeat makes
    void resultFlash.offsetWidth;
    resultFlash.classList.add('is-visible');
  }

  function pulseStreak() {
    streakPulse.classList.add('is-visible');
    setTimeout(() => streakPulse.classList.remove('is-visible'), 1200);
  }

  function resetBall() {
    ball.style.transition = 'none';
    ball.style.transform = 'translate(0px, 0px) rotate(0deg)';
    ballImg.style.filter = '';
    // force reflow before re-enabling transitions elsewhere
    void ball.offsetWidth;
    ball.style.transition = '';
  }

  // ── Game over / reset ──
  function endGame() {
    if (state === 'CHARGING') cancelCharge();
    stopTimer();
    state = 'GAME_OVER';
    finalScoreEl.textContent = pad4(score);
    gameOverModal.hidden = false;
  }

  function resetGame() {
    score = 0;
    streak = 0;
    timeLeft = ROUND_SECONDS;
    resetBall();
    updateHud();
    gameOverModal.hidden = true;
    state = 'IDLE';
    startTimer();
  }

  // ── Escape / exit modal ──
  function openExitModal() {
    if (state === 'GAME_OVER') return;
    if (state === 'CHARGING') cancelCharge();
    stopTimer();
    exitModal.hidden = false;
  }

  function closeExitModal(shouldExit) {
    exitModal.hidden = true;
    if (shouldExit) {
      window.location.href = 'index.html';
      return;
    }
    if (state !== 'GAME_OVER') startTimer();
  }

  // ── Input ──
  function isTypingTarget(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
  }

  window.addEventListener('keydown', (e) => {
    if (isTypingTarget(document.activeElement)) return;
    if (!exitModal.hidden || !gameOverModal.hidden) {
      if (e.code === 'Escape') {
        e.preventDefault();
        if (!exitModal.hidden) closeExitModal(false);
      }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (!e.repeat) startCharge();
    } else if (e.code === 'Escape') {
      e.preventDefault();
      openExitModal();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (isTypingTarget(document.activeElement)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      releaseCharge();
    }
  });

  // Mouse/touch parity for the on-screen key visuals
  spaceKey.addEventListener('mousedown', startCharge);
  spaceKey.addEventListener('mouseup', releaseCharge);
  spaceKey.addEventListener('mouseleave', () => { if (state === 'CHARGING') releaseCharge(); });
  escapeKey.addEventListener('click', openExitModal);

  exitConfirm.addEventListener('click', () => closeExitModal(true));
  exitCancel.addEventListener('click', () => closeExitModal(false));
  playAgainBtn.addEventListener('click', resetGame);

  // ── Init ──
  updateHud();
  startTimer();
})();
