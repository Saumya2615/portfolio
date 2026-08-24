# Build Steps — Hand This to Claude Code

**How to use this doc:** Give Claude Code this file **together with** `portfolio-brief.md` (the full context/reference doc) at the start of your session. Work through the steps below **one at a time, in order**. After each step, stop, look at what was built, and only say "approved, commit and move on" once you're happy — don't let Claude Code chain multiple steps together unprompted.

**Important instruction for Claude Code:** At the start of each step, first ask Saumya for anything you need for that specific step (assets, clarifications, missing decisions) before starting to build it — don't assume, guess, or substitute placeholder content silently when something is actually needed. Wait for her response, then proceed.

**Note on providing images:** Saumya can drag-and-drop image files directly into this terminal (it inserts the file path automatically), paste an image from clipboard if her terminal supports it, or just point you to a file path already saved in the project folder. Ask for images in whichever way is easiest for her when a step needs one.

Each step tells you:
- **What Claude Code should build**
- **What you should check before approving**
- **Branch:** whether to build this on `main` directly, or on a feature branch (and when to merge)

---

## PNGs / assets you'll need to have ready
Gather these before starting, so you're not blocked mid-step:
- [ ] **Halftone keyboard image(s)** from Figma (the ones you mentioned exporting) — needed by Step 5
- [ ] **4 main project visuals** (phone mockups / covers for Answer Engine Optimization, Creek.UI, Alum Connect, Medisync) — needed by Step 8
- [ ] **4 secondary project visuals** ("A few more" grid — replace Flour Pot placeholders with real 4 projects) — needed by Step 9
- [ ] **About Me photo** (polaroid-style shot) + the "SUMO" sticker graphic + "GAME 1" tag graphic — needed by Step 11
- [ ] Any small doodle/decorative graphics (the leaf squiggle, footer heart) — nice to have by Step 12, not blocking earlier steps
- [ ] Favicon (small square logo/icon for the browser tab) — not urgent, can be added anytime

You don't need all of these on day one — each step below tells you exactly when a given asset becomes necessary.

---

## Step 1 — Project scaffold
**Branch: `main`**

Claude Code should:
- Set up a basic project structure (plain HTML/CSS/JS to start — confirm with Claude Code if it recommends a framework, but a static build is likely simplest for this project's needs)
- Set up a clean folder structure (e.g. `/assets`, `/css`, `/js`, `/data`)
- Confirm Git is already initialized and connected (it is, from earlier setup)

**You check:** Folder structure makes sense, project runs locally without errors (even if blank).

**Approve & commit:** `"scaffold project structure"`

---

## Step 2 — Plain structure, no styling
**Branch: `main`**

Claude Code should:
- Build out all sections as plain, unstyled HTML blocks, in this order: Nav → Hero → Keyboard visual placeholder → My Works → A Few More → About Me → Footer/Let's Connect
- No colors, fonts, or layout polish yet — just correct structure and placeholder text/content

**You check:** Every section from the final design exists, in the right order, even if it looks ugly right now.

**Approve & commit:** `"add plain page structure"`

---

## Step 3 — Design system setup
**Branch: `main`**

Claude Code should:
- Pull exact colors, fonts, spacing, and border-radius values from the Figma file / final screenshot (hand Claude Code the Figma link + screenshot again here if needed)
- Set these up as reusable variables (CSS custom properties or a config file) — not hardcoded repeatedly
- Apply base typography and color palette site-wide, but not detailed layout yet

**You check:** Colors and fonts match your design. Ask yourself: "does this already feel like my brand, even without full layout?"

**Approve & commit:** `"set up design system (colors, type, spacing)"`

---

## Step 4 — Nav bar + Hero section styling
**Branch: `main`**

Claude Code should:
- Style the nav bar ("Saumya :)" + Work/About/Resume/Playground links)
- Style the hero text ("I'm Saumya!" + subline with "feel" emphasized)
- Match spacing/alignment to Figma

**You check:** Compare directly against your Figma hero frame — font sizes, spacing, emphasis on "feel."

**Approve & commit:** `"style nav and hero section"`

---

## Step 5 — Keyboard visual placement (static, no interaction yet)
**Branch: `main`**
**Needs: halftone keyboard PNG(s)**

Claude Code should:
- Place your halftone keyboard image in the hero area, sized/positioned to match Figma
- Add the caption ("This is the keyboard I build everything on. Try typing!")
- No click/keypress functionality yet — just correct static placement

**You check:** Keyboard image is crisp (not blurry/stretched), positioned correctly, caption reads right.

**Approve & commit:** `"place keyboard hero visual"`

---

## Step 6 — Data-driven project setup (the "dynamic variables" piece)
**Branch: `main`**

Claude Code should:
- Create a structured data file (e.g. `data/projects.json`) containing all project info: title, description, tags, image path, link — for all 8 projects (4 main + 4 secondary)
- Build the Work section template to **read from this file** and generate cards automatically, rather than hardcoding each project's HTML
- Use placeholder images for now if your real project visuals aren't ready yet

**You check:** Confirm you understand the data file — open it, see that editing a title/tag there actually changes what shows on the page. This is the piece that solves your "updating projects again and again" problem, so make sure it clicks for you now.

**Approve & commit:** `"set up data-driven project cards"`

---

## Step 7 — Style Work section (main + secondary project grids)
**Branch: `main`**
**Needs: real project visuals if ready (Step 6 assets), otherwise continue with placeholders**

Claude Code should:
- Style the 4 main project cards (large, with tag pills, scattered dot accents) per Figma
- Style the "A few more >>" secondary 2x2 grid
- Add the section headers and sublines ("My Works >>", "A few more >>" / "Different shapes, same amount of feeling.")

**You check:** Compare against Figma — card proportions, tag pill styling, dot accent placement, spacing between cards.

**Approve & commit:** `"style work section and project cards"`

---

## Step 8 — Real project visuals swapped in
**Branch: `main`**
**Needs: your 4 main + 4 secondary project images, compressed as WebP**

Claude Code should:
- Replace placeholder images with your real project visuals in the data file (from Step 6)
- Add `loading="lazy"` to images below the fold
- Confirm image sizes/aspect ratios look correct in the cards

**You check:** All 8 projects show your real work, images aren't stretched/cropped oddly, page still loads reasonably fast.

**Approve & commit:** `"add real project images"`

---

## Step 9 — About Me section
**Branch: `main`**
**Needs: About photo, SUMO sticker, GAME 1 tag graphic**

Claude Code should:
- Build out the About Me section with your real copy, photo (polaroid-style framing), and sticker graphics
- Match scattered dot accents and layout from Figma

**You check:** Copy reads right, photo/stickers positioned naturally, feels consistent with rest of site.

**Approve & commit:** `"add about me section"`

---

## Step 10 — Footer / "Let's Connect!"
**Branch: `main`**

Claude Code should:
- Build the footer on the warm yellow/cream background block
- Add "That's a Wrap (For Now)" + "Let's Connect!" heading
- Add the keyboard-shortcut-styled nav column (`[W] Work`, `[M] About`, `[;] Resume`, `[␣] Playground`) — **note:** finalize this key list against Step 11's key map so they match exactly
- Add Email / LinkedIn / Behance links with arrow icons
- Add the credit line and heart graphic

**You check:** Links actually work/point to the right places, keycap icons look right, background color matches Figma's warm tone.

**Approve & commit:** `"build footer section"`

---

## Step 11 — Keyboard interactions (functional keys only)
**Branch: `feature/keyboard-interactions`** — this is a good branching point since it's a self-contained, riskier chunk of logic. Merge into `main` only once it fully works.

Claude Code should:
- Wire up real keydown listeners for: `R` (Resume), `M` (About), `W` (Work), `C` (Contact — **confirm this is still correct, or should match footer's simpler set**)
- Confirm Up/Down arrow keys are left alone (native scroll, no override)
- Add the "first press primes/highlights, second press navigates" behavior discussed earlier
- Add hover tooltips with personality-driven copy on each key
- **Do NOT build:** Delete/Backspace glitch-effect (deferred), Space→game trigger rules (handle in Step 12), Escape zoom-out (handle in Step 13)

**You check:** Test every key yourself. Does pressing W actually take you to Work? Does a stray key not do anything unexpected? Try it a few times to make sure it feels intentional, not jumpy.

**Approve & commit (on the branch):** `"wire up functional keyboard navigation"`
**Then merge to main once confirmed working:** `git checkout main` → `git merge feature/keyboard-interactions`

---

## Step 12 — Basketball spacebar game
**Branch: `feature/basketball-game`** — self-contained, isolate this in case the physics/timing needs several iterations.

Claude Code should:
- Build the hold-to-charge, release-to-shoot mechanic (vector/CSS or canvas-based, no heavy assets)
- Add score counter, basic hoop, ball arc physics
- **Decide and document the trigger rule** (the "later decision" flagged earlier): e.g. Space only triggers the game when Playground is open, or only when no text input is focused — pick one now with Claude Code's input on what's simplest to build reliably
- Add optional streak celebration + swish sound (keep file size small)
- Add the personal caption line

**You check:** Play it several times — does charging/releasing feel satisfying? Does Space ever accidentally trigger it somewhere it shouldn't (e.g. while scrolling normally)?

**Approve & commit (on the branch):** `"add basketball spacebar game"`
**Merge once confirmed working:** back to `main`

---

## Step 13 — Escape key easter egg
**Branch: `feature/keyboard-interactions`** (reopen this branch, or a new small one like `feature/escape-animation`) — small and isolated, low risk either way.

Claude Code should:
- Build the dramatic zoom-out + wink-of-text effect on Escape, then snap back
- Keep it snappy — this should feel like a fun aside, not a jarring delay

**You check:** Trigger it a few times, make sure the zoom-out/snap-back timing feels good, not glitchy.

**Approve & commit, then merge:** `"add escape key easter egg"`

---

## Step 14 — Responsive/mobile base pass
**Branch: `feature/mobile-responsive`**

Claude Code should:
- Ensure all sections reflow sensibly on narrow viewports (text wraps, cards stack, nothing overlaps or overflows)
- Replace keyboard interaction entirely with simple tap-based nav on mobile (per your earlier decision) — buttons/menu, no keyboard metaphor
- Simplify or hide Playground entry point appropriately for mobile (e.g. a single tappable "🎮 Playground" link instead of key-based access)

**You check:** Open the site on your actual phone (or browser dev tools' mobile view) and click through every section — nothing should look broken or require horizontal scrolling.

**Approve & commit, then merge:** `"add responsive/mobile layout"`

---

## Step 15 — Final QA pass
**Branch: `main`**

Claude Code should:
- Check all links work (nav, footer, project cards)
- Confirm all images have alt text (accessibility)
- Run a basic performance check (image sizes, load time)
- Double check no leftover placeholder text/lorem ipsum remains

**You check:** Click through the entire site top to bottom, on both desktop and mobile, one final time as if you were Yoda seeing it for the first time.

**Approve & commit:** `"final QA and polish pass"`

---

## After this
Once all steps are merged into `main`, you're ready to deploy (e.g. Vercel or Netlify, connected to your GitHub repo for auto-deploy on push) — that's a separate short conversation whenever you're ready for it.

---

## Build Progress Log

### Session 1 — 2026-08-24

**Step 1 — Project scaffold** ✅ `committed: "scaffold project structure"`
- Created folder structure: `/assets`, `/css`, `/js`, `/data`
- Entry files: `index.html`, `css/reset.css`, `css/variables.css`, `css/main.css`, `js/main.js`
- Set up `data/projects.json` with 4 main + 4 secondary project slots ready to fill

**Step 2 — Plain structure** ✅ `committed: "add plain page structure"`
- All 6 sections written as plain HTML in correct order: Nav → Hero → Keyboard → My Works → A Few More → About Me → Footer
- `js/projects.js` created — reads from `data/projects.json` and renders cards dynamically
- `playground.html` stub created so nav link doesn't 404

**Step 3 — Design system** ✅ `committed: "set up design system (colors, type, spacing)"`
- Google Fonts loaded: Space Grotesk (headings) + DM Sans (body) — exact Figma fonts
- All color tokens set from Figma: `#f54900` orange, `#ffd230` yellow, `#fef3c6` footer cream, `#0c0a09` text, `#57534d` muted
- Font sizes, letter-spacing, border-radius, spacing all pulled from Figma node 142:152
- Tag pill + dot accent utility classes ready to use

**Step 4 — Nav + Hero styling** ✅ `committed: "style nav and hero section"`
- Fixed nav with backdrop blur, "Saumya :)" left / links right, active link highlights on scroll
- Hero: "I'm Saumya!" Space Grotesk 500, subline DM Sans with *feel* in orange italic
- First real visual checkpoint — open `index.html` in browser to review

**Step 5 — Keyboard visual placement** ✅ `committed: "place keyboard hero visual"`
- Placed halftone keyboard image (`assets/images/Keyboard.webp`) in hero area with caption
- Also added `udaipur.webp` and `yes-keys.webp` to `assets/images/` (+ raw PNG exports in `assets/raw-exports/`) for later steps
- Fixed centering bug: `#keyboard` was using `align-items: flex-start`, left-aligning the image instead of centering it; switched to `align-items: center` and gave `.keyboard-inner` a `max-width: 1284px` so caption + image share consistent edges
- Side margins set to 80px (`--keyboard-margin-x`), added a tablet breakpoint (≤1024px) for tighter padding, image now scales responsively at all widths

### Session 2 — 2026-08-25

**Currently on: Step 6** — data-driven project setup, about to start
