# Saumya's Portfolio — Build Brief

## Who this is for
Saumya — UX designer and AI builder. Portfolio is mainly for job hunting (target reader nicknamed "Yoda" = the recruiter/hiring manager).

## Core identity
- Builder first, designer second — someone who *makes* things, not just mocks them up.
- Believes in **emotional design**: not just how things look, but how they make people feel.
- Personality: creative, playful, feels emotions vividly, wants that reflected in the work.
- Tone goal: warm, confident, genuine — NOT forced-humorous, not corporate-speak, not trying too hard.

## Landing page line (locked)
> I'm Saumya. I build how things feel, not just how they look.

Keep this exact line intact — do not rephrase or add a second clause to it.

## Design language
**Source of truth: the Figma file and the final landing page screenshot (see "FINAL DESIGN — ready to build" section below).** The bullets below are early exploratory notes from before the design was finalized — do not treat them as independent guidance. Where they conflict with the Figma file or final screenshot, the Figma/screenshot wins.

Early exploratory notes (for historical context only):
- **Inspiration:** Nothing (tech brand) — "technical warmth": raw/technical elements + human warmth together.
- **Type:** two fonts max — a monospace/dot-matrix style for labels/UI chrome, a warmer humanist sans or serif for actual sentences about her.
- **Color:** mostly neutral (off-white/black) + one accent color (warm coral/amber leaning — avoid generic startup blue/purple gradients).
- **Motion:** small, satisfying, mechanical — clicks, snaps, sweeps. Not floaty/dreamy.
- **Layout:** modular pieces/cards in open space, some free-floating/slightly rotated elements (scrapbook/scattered-widget feel), not rigid grid-locked.
- ~~**Imagery:** real photos where possible (e.g. actual photographed keyboard, not illustrated) for tactile, specific texture — ties to digital-scrapbook feel.~~ **Rejected** — final keyboard is the illustrated/halftone-style graphic from the Figma design, not a real photo. See "FINAL DESIGN" section.

## Site structure
Keep the **main site simple and skimmable** (this is what Yoda uses):
1. Hero (intro line + who she is)
2. Selected Work
3. About
4. Contact

Don't gate any of this behind interaction — normal scroll must always work top to bottom.

## Playground (secondary, optional, desktop-only delight layer)
A separate area/page for fun experiments — this is where the bigger interactive ideas live, so they never block Yoda from the main flow.

### Keyboard interaction (Playground feature)
Real photographed keyboard as a visual anchor. On **desktop**, actual keydown events power the interactions (not just clickable image hotspots). On **mobile**, replace entirely with a simple, clean tap-based nav (no keyboard metaphor) — see Mobile section below.

**Key map:**
| Key | Action |
|---|---|
| R | Open Resume |
| M | About "Me" |
| W | Work |
| C | Contact |
| Arrow keys (Up/Down) | Work as normal scroll |
| Space | Opens/starts the basketball game (see Spacebar mini-game section below). **Open question — later decision:** exact rules for when Space triggers the game vs. does nothing (e.g. only within Playground, or only when no input field is focused, etc.) still need to be defined. |
| Escape | Subversive joke: dramatic zoom-out of the page + a wink of text (e.g. "there's no escaping good design"), then snaps back. Not a real exit. |
| Delete/Backspace | **Deferred — do not build for v1.** Original idea: visually "glitch-deletes" a word on screen character-by-character, then retypes it — self-aware, ties to AI-builder identity. Revisit later; leave this key with no bound action for now. |
| Enter | Confirms/submits playful input if present, or triggers a surprise (e.g. opens a random project) |
| Shift (held) + key | Optional secret/dev-mode reveal for people who explore |

Functional keys (R, M, O, C, arrows) behave exactly as expected — no jokes there. Humor/delight keys (Space, Escape, Delete) are safe to be weird since they're opt-in exploration, not primary navigation.

### Map/village concept — DROPPED
Decided against building a full WASD explorable map/village. Too large a build relative to payoff for a portfolio whose main job is showcasing work. WASD stays functional (simple section shortcuts), not literal movement through a world.

### Keyboard personalization details (locked)
The keyboard must feel like *Saumya's actual keyboard*, not a generic UI skin. Confirmed personalization elements:
- **Real wear, not illustrated** — if using a photo, keep visible signs of actual use (not overly cleaned up).
- **Emoji key** — one key repurposed as a personal/emoji easter egg (specific emoji/detail TBD).
- **Caps Lock → "LOUD MODE"** — relabeled key with personality, in Saumya's voice.
- **Real keyboard sound on keypress** — ideally recorded from her actual keyboard, not a generic mechanical-click sample. Keep file size small.
- **Caption near the keyboard establishing intentionality:**
  > "This is the keyboard I build everything on. Try typing."
- Tooltip/label copy on hover (before a key is pressed) should carry personality, not just say the function plainly (e.g. "D — the boring-but-important one" rather than just "D — Resume").
- Functional keys (W/A/S/D or equivalent nav keys) should **prime/highlight on first press**, and only navigate on a second press or brief confirm delay — avoids jarring auto-scroll-jacking a visitor who didn't mean to fully trigger navigation.

### Spacebar mini-game — Basketball shooter (locked)
Personal detail: Saumya used to play basketball. Game concept, kept intentionally simple for fast load:
- **Mechanic:** Hold spacebar to charge a power meter, release to shoot the ball toward a hoop (fixed or gently moving). Simple arc/parabola physics — no physics engine library needed.
- **Assets:** Keep fully vector/shape-based (CSS/SVG or canvas) — no heavy images required, for fast load.
- **Feedback:** Score counter, optional streak mechanic (e.g. 3-in-a-row triggers a small celebratory pulse/confetti), optional lightweight "swish" sound on a make.
- **Personal caption near the game:**
  > "Used to play. Still pretty good, ngl." (placeholder tone — adjust as needed)
- Intentionally the simplest of all Playground interaction ideas — one input key, no scrolling terrain/obstacles, minimal state to track.

## Mobile / responsive approach (decided)
No attempt to replicate keyboard interactions on mobile. Instead:
- Clean, standard nav (simple buttons/menu: Work / About / Resume / Contact).
- Playground becomes optional and simplified — e.g. a single tappable "🎮 Playground" entry point rather than key-based interaction.
- Desktop keeps the full keyboard/Escape/Delete magic as its distinguishing delight layer.

## Reference sites for tone/structure
- **haridev.live** (built in Framer) — closest structural model: Hero → Work → About → Contact, single scroll, personality carried through *copy* not gimmicks. Calls his experiments area "playground" — validates the main-site-simple + playground-for-fun split.
- **playground.nothing.tech** — visual reference for scattered-widget/bento-adjacent layout, dot-matrix type, tactile "device" object styling.
- **Bruno Simon (bruno-simon.com)** — extreme reference for "portfolio as interactive experience," useful for interaction-design inspiration, not literal structure.

## Build order (recommended)
1. Plain structure first — sections only, no styling.
2. Apply design language — type, color, spacing, layout.
3. Layer in interactions last — keyboard listeners, Escape/Delete animations, Playground.
4. Build responsive/mobile fallback nav explicitly — don't let keyboard events leak into mobile attempts.

## Open decisions still to make
- Exact visual style of the About/hobbies section (image collage format) — partially resolved, see final layout below.
- Full "About" and project case study copy.
- Final wording on a few microcopy lines (game caption, emoji key detail).

---

## FINAL DESIGN — ready to build (as of Figma handoff)

**Figma file (source of truth for all visual detail):**
https://www.figma.com/design/e0hIsjbGClpGzjYPqSzwv4/Portfolio?node-id=142-152
Frames are on Page 1. This is the actual website design — pull exact spacing, colors, type sizes, and asset positions from here rather than guessing. Desktop frame only for now; mobile not yet designed (see Mobile section — build responsive defaults regardless).

### Confirmed final landing page structure (top to bottom)
1. **Nav bar** — "Saumya :)" (logo/wordmark) on left, "Work / About / Resume / Playground" links on right.
2. **Hero** — "I'm Saumya!" headline, subline "I build how things *feel*, not just how they look" (word "feel" styled/emphasized in accent color).
3. **Keyboard hero visual** — full illustrated/photographed keyboard, positioned directly under hero text. Includes labeled/highlighted special keys visible in the design: a smiley key, an eye/emoji-style key, "LOUD MODE" (Caps Lock relabel, yellow highlight), a folder icon key, a "DARE TO PLAY" long key (spacebar — links to the basketball game), a downward arrow key (green highlight), and a small circular photo/avatar key. Caption near the keyboard: *"This is the keyboard I build everything on. Try typing!"*
4. **"My Works >>"** section header, with a small folder emoji/icon next to it and scattered dot accents (orange/yellow squares) as background decoration — consistent scattered-dot motif reappears throughout the page as a spacing/rhythm device between sections.
5. **Main project cards (4 total)** — large cards, each containing:
   - A visual/mockup preview (phone mockups, product screenshots, or a styled case-study cover depending on the project)
   - Project title + one-line description to the left/below
   - Tag pills (e.g. "UI/UX," "Mobile," "B2B SaaS," "Vibe-Coded," "AI-Platform," "System," "Gen UI") — tag values differ per project, pull exact copy from Figma
   - Small orange square accents positioned around each card, alternating sides, as a recurring decorative rhythm
   - Confirmed 4 main projects (placeholder names from Figma, replace with final copy as needed): **Answer Engine Optimization**, **Creek.UI**, **Alum Connect**, **Medisync**
6. **"A few more >>"** section header with subline **"Different shapes, same amount of feeling."** — small icon of scattered keycaps with a lightning-bolt accent next to the heading.
7. **Secondary project grid (4 cards, 2x2)** — smaller/simpler cards than the main four, each with an image, one tag pill ("Visual Branding" etc.), title, and one-line description. Example shown: "The Flour Pot" (repeated as placeholder — replace with 4 distinct smaller projects).
8. **About Me section** — heading "About Me" with subline "(Real Intro)". Body copy (in Saumya's voice, left-aligned) + a photo of Saumya (polaroid/sticker-framed style) with a "SUMO" sticker graphic and a small "GAME 1" tag graphic near the photo — reinforces scrapbook/personal aesthetic. Scattered dot accents continue around this section too.
9. **Footer — "Let's Connect!"** section, on a warm yellow/cream background block (visually distinct from the rest of the white page):
   - Small line above the heading: *"That's a Wrap (For Now)"*
   - Heading: **"Let's Connect!"**
   - Left column: keyboard-shortcut-styled nav — `[W] Work`, `[M] About`, `[;] Resume`, `[␣] Playground` (each key shown in a small bordered keycap icon)
   - Right column: `Email`, `LinkedIn`, `Behance` — each with a small arrow icon (↗) indicating external link
   - Small credit line: *"Made with love with cursor, claude and figma"*
   - A small decorative heart/graphic in the corner

### Visual/decorative motifs to keep consistent site-wide
- **Scattered square dots** (small orange and yellow squares, seemingly randomly placed) appear as connective background texture between nearly every section — treat as a reusable decorative component, not one-off placement.
- **Slight hand-drawn/doodle accents** — e.g. the squiggly leaf/plant doodle near the hero keyboard — used sparingly as personality touches, not structural elements.
- **Rounded card corners throughout**, consistent radius across project cards, keyboard, and footer block.
- **Tag pills** (small rounded-full labels) used consistently for project metadata — reuse the same pill component styling everywhere.

### Case study pages — approach (decided)
Full case studies will be **designed in Figma and exported as images** (PNG/WebP), Behance-style — not hand-coded interactive layouts. This keeps case-study updates simple (swap images) without needing to rebuild page code each time.

**Required build setup for this to stay maintainable:**
- **Image format:** export from Figma as **WebP** (fallback to PNG only if needed) — meaningfully smaller than PNG at equivalent visual quality.
- **Compression:** run exports through a compressor (e.g. Squoosh, TinyPNG) before uploading — do this as a standard step every time, not optional.
- **Lazy-loading:** all case-study images below the fold should use `loading="lazy"` so they don't load until scrolled into view.
- **Data-driven project list (important — ask Claude Code to set this up explicitly):** store each project's info (title, description, tags, image paths, links) in a single structured data file (e.g. `projects.json` or equivalent), and have the Work section template pull from that file rather than hardcoding each project's HTML. This means adding/editing/reordering projects later is a matter of editing one clean data file, not touching page markup — directly solves the "I'll need to update projects again and again" maintenance concern.

### Build process notes (for the actual Claude Code session)
- Build order: plain structure (no styling) → design system (colors/type/spacing pulled from Figma) → interactions last (keyboard listeners, Escape/Delete animation, basketball game).
- Explicitly tell Claude Code to **build responsively from the start** using standard breakpoints, even without final mobile designs yet — text should reflow and sections stack sensibly on narrow viewports. Full custom mobile design/interaction (tap-based nav replacing keyboard) is a known follow-up, not a launch blocker, but the site should never be visually broken on mobile in the meantime.
- Commit to Git frequently in small chunks (e.g. "add hero section," "add keyboard visual," "style project cards") rather than one giant commit — makes it easy to isolate and undo a single broken change later.
- Use feature branches for riskier/experimental pieces (e.g. `feature/keyboard-interactions`, `feature/basketball-game`) and merge into `main` only once each piece works — keeps `main` always in a known-good state.
- Test in an actual browser after each meaningful chunk rather than letting multiple sections get built unchecked.
