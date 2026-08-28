# Basketball Game — Logic & Mechanics Spec

Companion doc to `claude-code-build-steps.md` (Step 12) and `keyboard-keys.json`. Hand this to Claude Code when you reach the basketball game step.

## Core concept
Single-input, hold-to-charge, release-to-shoot mechanic. From the Figma "Final" frame: ball sits fixed on the left, hoop is fixed top-right, spacebar is relabeled "PRESS TO SHOOT," and the instruction line reads "Press and hold to aim, release to shoot." 40-second timed round, with a live Score + Time HUD.

**Key design decision (proposed default, confirm with Saumya):** since there's only one input (Space) and both ball and hoop positions are fixed, "aim" is resolved through **charge power alone** — how long you hold Space determines the shot's arc/distance, not left-right movement. This keeps the mechanic genuinely simple to build (matches the "keep it lightweight" goal) while still being skill-based: too short a hold undershoots, too long overshoots, and there's a "sweet spot" range that scores a clean make.

---

## Game states (state machine)

```
IDLE → CHARGING → SHOOTING → RESULT (make/miss) → IDLE (next ball)
                                                  ↘ (if timer hits 0) → GAME OVER
```

**IDLE** — ball sits at rest position, waiting for input. Timer is running (unless this is the very first ball of the round, in which case timer starts on first Space press — confirm with Saumya which behavior is wanted).

**CHARGING** — triggered by `keydown` on Space (and held). A power meter fills from 0% to 100% over a fixed duration (e.g. 1.2 seconds to fill fully) and loops if held longer (so max charge isn't a hard wall — holding past 100% could cycle back down, giving skilled players a rhythm-based "perfect timing" challenge rather than just "hold as long as possible"). Visual: a simple fill bar or a glow/scale pulse on the ball itself.

**SHOOTING** — triggered by `keyup` on Space. The ball launches along a parabolic arc, calculated from the charge % captured at release. Ball animates from its fixed start position toward the hoop over roughly 0.5–0.8 seconds.

**RESULT** — determined the instant the arc calculation resolves:
- **Make:** charge % falls within a defined "sweet spot" range (e.g. 60–80% — exact range tunable once built and playtested) → ball passes through the hoop, net "swish" animation, score increments, optional streak counter increments.
- **Miss (short):** charge % below the sweet spot → ball arcs but falls short, hits the front rim or ground, streak resets.
- **Miss (long/overshoot):** charge % above the sweet spot → ball sails past/over the hoop, streak resets.

**GAME OVER** — triggered when Time hits `00:00`. Freeze input, show final score, offer a "Play Again" prompt (resets timer to 0:40, score to 0000).

---

## Scoring
- **Make = +1 point** (base). Keep it simple — no variable point values unless you want extra depth later.
- **Streak bonus (optional, matches the "3-in-a-row celebration" idea from earlier planning):** 3 makes in a row triggers a small celebratory pulse/confetti moment, doesn't need to add extra points, just a feel-good visual beat.
- Score display updates immediately on each make, formatted to match the HUD's 4-digit style (`0001`, `0002`, etc., per the Figma "0000" placeholder).

## Timer
- Starts at **00:40**, counts down to **00:00**.
- **Open question for Saumya:** does the timer start immediately when the game screen loads, or only on the first Space press? (Immediate start is simpler to build; first-press start is slightly friendlier if there's any loading delay.)
- No pausing — this is a fast, arcade-style round, not a strategy game.

## Input handling
- **Space (`keydown`):** begin charging, **only if** the game is in `IDLE` state (prevents charging again mid-shot-animation).
- **Space (`keyup`):** release/shoot, only valid from `CHARGING` state.
- **Escape (`keydown`):** exit the game at any state, immediately — matches the red "X" recoloring of the Escape key seen in the Figma game screen. **Open question:** should exiting return to the Playground entry point, or straight back to the homepage? (Recommend Playground, since that's where the game was entered from — keeps the user's mental location consistent.)
- All other keys: no effect while the game is active (avoid accidental interference from stray keypresses).

## Trajectory / visual implementation notes
- No physics engine needed — a simple **quadratic Bézier curve or CSS keyframe animation** from ball-start-position to hoop-position is enough, with the curve's peak height/shape varying based on charge % at release.
- Ball, hoop, and net can all be simple SVG or CSS shapes — matches the "keep it lightweight, no heavy assets" goal from earlier planning.
- **Ball start position and hoop target position** need to be pulled as exact coordinates from the Figma "Final" frame (same approach as the keyboard hotspots) — not yet extracted. Let me know if you'd like these pulled next, the same way the keyboard coordinates were.

## Edge cases to handle
- **Minimum charge threshold:** a very quick tap (e.g. under ~100ms) should probably not count as a real shot attempt — either ignore it entirely or treat it as an automatic short-miss, to prevent accidental button-mashing from cheaply racking up misses/makes.
- **Holding through game-over:** if the timer hits 0 while a shot is mid-`CHARGING`, cancel the charge cleanly rather than letting it fire after the round technically ended.
- **Rapid re-press:** don't allow a new charge to start until the previous ball's `RESULT` animation has finished — one ball in play at a time.

---

## Open decisions — resolved
1. **Timer starts on page load** (not on first Space press). ✅ Confirmed.
2. **Escape exit behavior:** exits straight to the **homepage**, but only after a confirmation dialog ("Are you sure you want to exit?") — Yoda must confirm before actually leaving the game. ✅ Confirmed. Build this as a small modal/overlay, not an instant redirect.
3. **Sweet spot range:** will be tuned through playtesting once built, not locked on paper. ✅ Confirmed approach.
4. **Miss visuals:** one generic miss animation for v1, no short-vs-long distinction needed yet. ✅ Confirmed.

## Exact coordinates — pulled from Figma "Final" frame
All values below are relative to the game screen frame (1440 × 1024), same percentage-based approach as the keyboard hotspots, so positioning stays correct as the screen scales responsively. Full data also saved as `game-elements.json` — hand this to Claude Code alongside this doc.

| Element | left% | top% | width% | height% |
|---|---|---|---|---|
| Ball (resting position) | 16.81% | 38.96% | 5.97% | 8.41% |
| Hoop | 64.03% | 12.11% | 25.35% | 35.64% |
| Spacebar / "Press to Shoot" key | 23.96% | 86.23% | 28.82% | 5.86% |
| Escape / red exit (X) button | 6.39% | 52.93% | 4.41% | 6.15% |
| Score label + value (HUD) | 8.82% | 13.96% | 7.43% | ~7.6% combined |
| Time label + value (HUD) | 18.75% | 13.96% | 8.40% | ~7.6% combined |
| Instruction caption ("Press and hold to aim...") | 16.32% | 96.58% | 47.78% | 1.76% |
| Keyboard background image | 4.46% | 47.37% | 92.50% | 47.27% |

**Note:** the instruction caption text will need updating if the charging mechanic is dropped in favor of a simple tap — see open question below.

## Still needed
- Exact pixel coordinates for the ball's resting position and the hoop's target position — ✅ now pulled above, ready for Claude Code to use in trajectory math.

