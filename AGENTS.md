# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (for local verification prefer `npx vite build --outDir /tmp/pf-dist`, then `npx vite preview --outDir /tmp/pf-dist --port 4173`)
- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`
- **Images:** `npm run images` (AVIF/WebP ladders into `public/img` + manifest `src/data/images.json`; content-hashed, incremental)
- **Vision data:** `npm run vision` (macOS: runs Apple's Vision framework on the hero portrait, see below)
- **App footage:** `npm run sequences` (requires ffmpeg; leaves an empty manifest when no clips exist)

There are no tests configured in this project.

**Utility scripts (`scripts/`, run with `node`):**
- `build-images.mjs` — responsive image ladders (hero portrait keeps its alpha channel)
- `generate-og.mjs` — social preview `public/og-image.jpg` (`--favicons` also rebuilds icons)
- `generate-project-covers.mjs` — schematic cover illustrations (`src/assets/projects/cover-*.jpg`) for
  projects whose screenshots were lost; the detail dialog labels them "Illustration". Run `npm run images` after.
- `vision/analyze.swift` + `vision/build-vision.mjs` — Apple Vision on the hero portrait: face box + 75
  landmarks, upper-body person box, person segmentation mask (+ contour). Writes `src/data/vision.json` and
  `public/img/vision-*.webp`. The site draws these real outputs as returned (confidences included).
- `build-tech-icons.mjs` — Toolbox logos: Simple Icons (CC0) marks, drawn glyphs for tools without one
  (Apple frameworks, C#, GradCAM, W&B) → `src/data/tech-icons.json`.
- `build-sequences.mjs` — AVIF/WebP frame sets from real app recordings, within a byte budget, with an
  incremental manifest (see App footage).
- `find-unused-modules.mjs` — trace imports from the entry point; `--delete` removes unreferenced files
- `devtools/` — headless Chrome tools over raw CDP, all launched through `chrome-guard.mjs` (see its README).
  `cdp.mjs` is the shared launcher; it turns on focus emulation, because after a CDP Escape key press a
  headless page reports `hidden`, produces no frames, and every idle check then reads a false 0.
  `shot.mjs` (screenshots at scroll offsets; add `?tier=high`, headless counts as a low-tier device;
  `--gpu` draws on the Mac's GPU), `shot-webkit.mjs` (same, in Playwright's WebKit: layout and text
  only, it flattens preserve-3d), `shot-safari.mjs` (real Safari via safaridriver: the only true check
  of Safari's 3D; setup in the README; it corrects the viewport after navigation, when Safari applies
  the saved site zoom), `film.mjs` (captures frames after an action; dev builds expose `window.__gsap`
  to slow time), `perf.mjs` (LCP, CLS, bytes, idle rAF on a slow-4G phone or `--desktop`; `--actions`:
  idle frames, timers, running animations and INP after each input; `--scroll`: frame pacing and long
  animation frames over a full-page scroll), `idle-scroll.mjs` (rAF 1 s after scrolling settles),
  `cls.mjs` (layout-shift sources, `--desktop`), `budget.mjs` (gzip sizes of the first load, each lazy
  chunk and the HTML against limits; `--sum 'effects=^(gl|heroRelief|aboutRelief|displacement|sequence)-:8'`
  budgets a group), `pins.mjs` (pin length per scene; `--dead` scans for stretches where nothing
  changes), `contrast.mjs` (WCAG contrast of every text line over the real pixels behind it;
  `--reduced` audits the posters; a phone needs `--w 390 --h 844 --mobile`).
  Run INP, scroll and contrast checks on the Mac's GPU, one at a time: under SwiftShader a dialog's
  backdrop blur alone takes about 500 ms to present. Measure only while the Mac is awake: on battery
  it idle-sleeps after a minute, and a run that spans a dark wake times out or reports nonsense
  (`caffeinate -i` for the session, released afterwards).
  Check Safari-sensitive work in Safari too: the owner browses in Safari, often in short windows at
  115 % zoom (about 1190 x 680 CSS px), so every pinned scene must measure its fit rather than assume
  900 px of height. For real iOS Safari use the Xcode simulator: `xcrun simctl boot <iPhone>`,
  `xcrun simctl openurl <udid> "http://localhost:5173/?tier=high&at=papers_350"` (dev-only
  `?at=section_offset` scrolls there), then `xcrun simctl io <udid> screenshot out.png`; shut it down
  afterwards. After any run, `pgrep -fl "Google Chrome.*--headless"` must print nothing (other apps on
  this Mac also match `remote-debugging-port`; they are not leaks). The Claude in Chrome connection
  seen here was a remote browser that cannot reach this Mac's localhost.

## Architecture

Single-page React 18 + TypeScript (strict) portfolio, built with Vite, deployed on Vercel. A 2.5D
"built in layers" scroll story: every scene is flat DOM planes in CSS 3D space, choreographed by
GSAP ScrollTrigger. No UI library, no CSS framework.

**Entry and hero shell.** `index.html` has `<!--hero-shell-->`, `#nav-root` and `#root`. The Vite plugin
`vite-plugins/heroShell.ts` renders the hero from `src/content/heroMarkup.ts` into `index.html` (dev and
build), adds the pre-paint theme script and the AVIF preload for the LCP portrait, and at build inlines
the entry CSS. So the hero paints before any JS; `src/scenes/HeroScene.tsx` only attaches choreography to
that static DOM. `src/main.tsx` mounts `<App/>` (`src/App.tsx`), which portals `<Nav/>` into `#nav-root`.
The shell also emits the remaining sections as semantic text in `<noscript>`. Fonts are self-hosted
Latin WOFF2 subsets; the build gates their CSS until the portrait loads so they do not compete for LCP
bandwidth. Splits wait for `fontsReady()`, which accounts for that gate. Explicit section jumps replace
the URL hash; archive dialogs retain their push/pop history. The active theme updates `theme-color`.

**Scenes (`src/scenes/`), in order:** Hero → About → What I do → Toolbox → Projects → Experience →
Papers → Certificates → Contact (section ids `#hero #about #disciplines #toolbox #projects #experience
#papers #certificates #contact`). Each below-the-fold scene is a lazy chunk mounted by `components/SceneSlot.tsx` when its
stable `<section>` comes within one viewport; `lib/jump.ts` mounts all of them before a far jump
(nav links, `g` + letter shortcuts, deep-link hashes), then refreshes ScrollTrigger and scrolls.
- Hero: four layers (plate, name, portrait, interface) explode in z, hold, then disperse; layer tags name
  them, each pinned to the visible edge of its own layer's content (their offsets read `--portrait-h`
  and `--head-x`, which therefore live on `.hero__stage`). The plate's right third holds an index of
  the sections with their counts (`content/heroIndex.ts`: every count is an array length), part of the
  interface layer and hidden below 1100 px or where it would overlap. In the exploded view the stage
  turns 24 degrees and tilts 12, then drifts to 18 and 9 through the hold; the name and interface slide
  by `(z - Z[2]) * tan(angle)` so whole words stay clear of the head. The portrait carries the Apple Vision overlay (segmentation, person/face boxes, landmarks; no
  caption, the owner removed it): a scan beam (`.cv-scan`) sweeps the portrait, segmentation first, then
  boxes and landmarks as it passes; also shown under a 1:1 pointer lens on hover (three taps on the
  portrait pin it, an easter egg).
  The name is fitted to the plate's width and to the height above the intro block, from measured glyphs,
  and the head placed between "Perdana" and "Aditya" (after fonts load, so nothing shifts). On first
  paint a CSS-only intro assembles the poster (individual `scale`/`translate` properties, backwards
  fill, so nothing lingers to fight GSAP; the LCP portrait is visible from frame one). The pin's spacer
  (`.hero__spacer`) is prerendered and passed as `pinSpacer`: letting ScrollTrigger wrap the pin would
  re-insert the LCP image and push mobile LCP from 1.8 s to 2.6 s.
  Hand-off to About (desktop/tablet): the portrait flies to the About card still wearing its Vision
  overlay while the card's frame draws itself; on landing the café photo appears *inside the portrait's
  segmentation silhouette* (same mask and contour, `--handoff` crossfade), then the silhouette grows
  from the face (masked layer scaled up, content counter-scaled: transforms only) until the photo fills
  the card. About pins *under* the pinned hero (negative margin `--hero-overlap`) so the card is
  stationary during the hand-off (`scenes/handoff.ts`).
  Phones ("the show", same pin length as About's phone pin, 0.9): the poster turns into an isometric
  exploded stack while the interface rises as a solid card in front (readable, live); the stack orbits
  while the scan runs; the card lifts away and the stack takes the screen; then it swings back, the
  name scatters and the portrait flies into the pinned About card (same hand-off). One state object
  drives the rigid stack: shared hinge per element, layers offset along the *tilted plane's normal*
  (a plain z offset only shrinks them). The phone stack is drawn without perspective
  (`perspective: none`) and fitted by projecting its real corners: iOS passes `perspective` only
  through an element that has a transform of its own, so a perspective-based fit clipped there. Name split
  as `words,chars` (unbreakable `.hero__word`), else min-content wraps per letter. Short phones get a
  lighter exploded view. The plate's fade is set from progress in `sync()`: a GSAP opacity tween wrote
  the plate's mid-intro opacity (0) at build time and left it invisible. For the same reason the
  index's first-paint intro sits on its `<ol>`, not on the element GSAP fades.
  `--handoff` sits on the portrait and on About's `.about__swap`, `--hero-overlap` on the About section.
- About: turning card (café photo `GadingAdityaPerdana2.jpg` / fact sheet) + three chapters. A chapter
  reads as one paragraph: each sentence rises as its words (inline-block `.about__word` spans, all
  driven by one `--rise` per sentence; a tween per word was 213 targets). A scrim behind each chapter
  (`--scrim`) keeps its text at 4.5:1 over the brightest band of the backdrop. Quotes fly through the
  text column between chapters. The card flip swaps faces at 90° (WebKit
  renders `backface-visibility` mirrored). The card is sized in px by the scene and every face layer is
  pinned with insets: Safari 27 does not resolve percentage heights inside an aspect-ratio box (the
  photo stopped short of the card). Phones: pinned (`.is-pinned`) when a photo card ≥ 200 px tall fits
  above the longest chapter: the card is full width and as tall as that space allows (no dead band),
  the chapter number and title sit on the photo over a scrim, three bars track the chapters, the text
  is below; else it flows and the reveal plays as the card scrolls in. iOS WebKit lessons from this:
  never leave a layer scaled up (the reveal resets to identity once open; at 7x it was ~185 MB on a 3x
  iPhone and iOS silently dropped other layers), no `will-change` on large scaled layers, keep the card
  a few px behind coplanar text (`translateZ(-4px)`), and give an overlay above a masked layer its own
  layer (`translateZ(0)`). Then "At a glance" (`Metrics.tsx`): six figures from the data
  with digit strips that roll into place (transforms only).
- What I do (`DisciplinesScene`): four discipline plates (AI/ML, software engineering with MLOps/DevOps,
  UI/UX, research) with schematic SVG motifs; an isometric stack assembles into a 2 × 2 grid. Pins
  only when the grid fits the viewport, measured: 2 × 2, else one row of four (`.is-row`, ≥ 1100 wide),
  else it flows (`.is-loose`). Phones: a pinned deck (`.is-deck`): the isometric stack squares up into
  a deck and the front plate is dealt up and away, one discipline at a time.
- Toolbox: a globe of logos (Fibonacci sphere, DOM items billboarded) that scroll turns and pointer
  drag spins (1:1, short glide after release; `touch-action: pan-y` so vertical swipes still scroll).
  Names show on the near side only (phones: the front-most few), nearest first: a name gives way where
  a nearer logo or name already sits (a collision pass at render, from widths measured once per
  refresh). Grouped chips with logos otherwise.
- Projects: 4 featured exploded cards in one pin (type, summary and highlights from `FEATURED` in
  `content/site.ts`; layer tags; 1:1 pointer tilt), "More work" wall, detail dialog, `#all-projects` archive.
  Phones: each card arrives exploded and turned with its layers tagged, assembles as it rises to be
  read, then tips back and recedes as it leaves.
- Experience: corridor (cards at z = −i·900); the front card is placed (and if needed scaled) between the
  heading and the bottom edge from measurements; cards ahead stay opaque and dim through a `.xp__fog`
  layer (translucent cards let far text show through); passed cards fade out fast. Phones: a pinned deck
  (`.is-xdeck`): one role at a time, all cards as tall as the tallest so only edges peek behind, dealt up
  and away (opaque until mostly gone, so texts never overlap), snapping to each role, a shared `.meter`
  ("02 / 05" + bars) under the heading. Short phones get `.is-compact` (one sentence, two wins, four
  chips) and a scale down to 0.8; below that a flat sticky stack (never tilt stacked cards: two tilted
  planes cut into each other in 3D). Papers: deck → fan → grid (FLIP from the resting grid); its pin
  centres with auto margins so a short window never slides the heading under the nav. Phones: a picker
  wheel (`.is-drum`): heading on top, papers on a horizontal cylinder filling the rest (masked edges,
  dimmed neighbours), each with its gist (3 lines) and two keywords, snapping per paper; measured in
  flow *before* the drum stacks them (plain CSS transforms: GSAP's origin smoothing broke a z origin).
  Size phone layouts for real iPhone Safari viewports (~390-402 × 740-760), not only 440 × 956.
- Certificates: tiles flip in; `#all-certificates` archive. Contact (all variants): plates converge under one card;
  copy-email button (sparks + check); links as a Dock (`components/Dock.tsx`). The footer overlays the
  pinned contact scene's bottom (net height 0) so the page ends where the pin ends.

**Motion policy (`lib/motion.ts`, `lib/useScene.ts`).** Every scene calls `useScene(ref, build)`, which uses
`gsap.matchMedia` for variants `desktop` (≥1024 wide, ≥620 tall), `tablet` (768–1023; pins and z × 0.7 via `k`)
and `mobile` (z × 0.5; scenes pin only after measuring that their content fits the phone, else they flow
with one-time rises). Reduced motion or a low device tier (`lib/tier.ts`, `?tier=` override; core
counts alone never mean low, iOS under-reports them) gets no timeline: the CSS rest state is the
finished "poster". ScrollTrigger restores progress on refresh *without* `onUpdate`, so any state painted
from a proxy object (drum, reveal growth, `--handoff`) must also repaint in `onRefresh`. The section gets `is-motion is-<variant>`
classes before `build` runs, and CSS switches to the choreographed layout only under `.is-motion`.
Resting DOM = readable layout; timelines animate away from and back to it.

**Background (`lib/bends.ts`, `components/Backdrop.tsx`).** The original "ColorBends" shader, ported from
three.js to ~1.7 KB of raw WebGL and rendered on demand: a frame only on scroll (scroll sets the phase),
pointer move (1:1), resize or theme change. Static frame for reduced motion / low tier; a CSS tint in
`.bends` (index.html) paints first and is the no-WebGL fallback. Canvas opacity 0.23 dark / 0.26 light
keeps every text line at 4.5:1 or better in `contrast.mjs` (at 0.34 secondary text over the brightest
band measured 3.66:1 on a real GPU).

**Depth and image effects (`lib/gl.ts`, `scenes/heroRelief.ts`, `scenes/aboutRelief.ts`,
`lib/displacement.ts`).** `npm run vision` also runs `scripts/vision/depth.swift` with Depth Anything
V2 Small F16 (Core ML; Apache-2.0 per its model card, the repository has no licence file), on the CPU
so the outputs hash the same on every run. The model stays in `~/Library/Caches/pf-models/`. The bake normalises
the two maps, extends the portrait foreground at the segmentation edge, blurs lightly, and samples
all landmarks and box centres. `vision.json` records the model, source, ranges and samples; hashed
WebP maps in `public/img` are about 4 KB each. Do not regenerate unchanged assets.
`gl.ts` loads known-size premultiplied textures through ImageBitmap, caps DPR, coalesces draws, and
restores textures after context loss. Destroy releases the context. Hero relief waits until after
load and the first turn, preserving the LCP image at rest. It draws depth-shifted landmarks on a second
canvas, shifts SVG boxes by centre depth, and bends the scan without changing portrait alpha. It hides
before the hand-off; the lens and pinned detections retain their SVG. About relief waits for the reveal
and image to reach identity, then follows the chapter turn; it hides before the face swaps. Both
canvases cap DPR at 2 and fall back to their images. A single project displacement canvas starts on
first use, moves into the hovered wall thumbnail, and shares raw pointer coordinates with the spotlight.
It settles within 600 ms, also on scrolling or touch release. Reduced motion and low tier fetch none
of these effects or maps. `lib/idle.ts` cancels delayed setup when a scene rebuilds.

**App footage (`scripts/build-sequences.mjs`, `lib/sequence.ts`).** Put real six to ten second clips
for FightRoom, 67Cam and DALX in `src/assets/footage/` as `.mov` or `.mp4`, then `npm run sequences`
(requires ffmpeg and ffprobe). The incremental builder writes 60 desktop frames (long side 960 px) and
36 phone frames (long side 640 px), AVIF plus WebP, into hashed `public/seq` folders and records them
in `src/data/sequences.json`. It lowers quality until the heavier of the two formats fits 1.2 MB
desktop or 500 KB phone, and fails if none does. The manifest is empty until footage is supplied, and
then every card keeps its still. The player draws only changed indices, caches encoded blobs, decodes
up to 17 nearby frames with a 32 MB cap, and releases bitmaps when the card leaves. Desktop frames
follow each featured segment; phone frames follow viewport travel. The footage sits on its own
rounded plate over the still and under the layer tag (the screen is a 3D layer and cannot clip). A
tall recording stands in a plain outline on that plate; where the outline would be under 120 px wide
(phones) the still stays. Save-Data, low tier and reduced motion keep the still. Checked with
synthetic clips only; test clips stay outside the repository and production output.

**Pinned keyboard access and dialogs.** `lib/focusStep.ts` brings focused controls to their visible
step (hero, featured projects, papers and contact). `lib/skipScene.ts` inserts a focused-only skip
before each pinned section, outside the stacking context so About's link clears the overlapping hero.
`scrollToTarget` briefly suppresses the Experience and Papers snap functions during explicit jumps.
The phone Experience deck trims measured still holds; its pin is now 2.80 viewport heights instead
of 3.56. Other pin lengths stay the same. Focused controls reserve space below the fixed nav and above
the viewport bottom. A jump to the top retries its focus as the page arrives: the hero hides once it
has handed over to About, and a hidden heading takes no focus. Dialogs retain their last content for
CSS exit transitions using `@starting-style`, discrete `display` and `overlay` where supported, and
render nothing before their first open. Scroll lock and native close handling remain counted.
`lib/projectTransition.ts` morphs a wall image and title into its dialog in Chromium, with shared names
cleared on completion; other engines and featured 3D cards retain the ordinary dialog animation.
Palette opens have no source. Theme and project transitions ignore overlapping input.

**Performance notes.** `heroShell` leaves an empty entry CSS asset because Vite's lazy preload tables
may still reference it; deleting it caused WebKit stylesheet MIME errors. The styles remain inlined,
with font faces gated behind the portrait (inlined `@font-face` rules otherwise start three downloads
that compete with the LCP image on slow 4G: 1.82 s became 1.94 s; a font preload was worse). Local
Vercel analytics endpoints return 404. Each lazy scene with a pin makes GSAP queue a full refresh, the
longest frame of a phone scroll, so its cost is what to watch: `refreshSoon` skips a duplicate and
waits out active scrolling and native smooth scrolls (a refresh restores the scroll position it
started from and stopped a phone's first jump 38 px down); hero, About and the phone Experience deck
reuse geometry while viewport and font state are unchanged; and a custom property a scene writes sits
on the element that reads it, never on `<html>`, where every write restyles the whole document
(`--handoff` and `--hero-overlap` there cost two 1900-element recalcs per refresh; phone scroll
blocking was 85 to 102 ms with them and 49 to 68 ms without). Hero relief reuses its canvas size and
does no layout reads after its strength reaches zero. The lighter hero stack also runs in wide
windows below 620 px tall; its portrait belongs beside the intro there, sized from the fitted name and
anchored right so it does not cover the text.

2026-10-10 measured state (production build, this Mac): slow-4G phone LCP 1.73 s (baseline 1.82),
CLS 0.000 phone / 0.002 desktop, first-load JS 112.9 KB gzip (122.4 KB transferred, limit 125), HTML
15.0 KB, fonts 69.0 KB, new canvas code 7.0 KB of 8, depth maps 4.4 and 3.6 KB. Idle frames, timers and
running animations are zero after load, scroll and every scripted input. Worst INP at CPU x4: 88 ms
desktop, 56 ms phone. Phone full-scroll blockingDuration 49 to 68 ms over eight runs (limit 100),
desktop 0. Posters meet AA in both themes at 1440 x 900, 1190 x 680 and 390 x 844. Pins: unchanged
except the phone Experience deck (3.56 to 2.80 viewport heights). Not verified: real Safari after the
first dark hero check, iOS flick-through and address-bar resizing, Firefox, and playback of real
footage. Owner inputs still open: the three clips, and approval of the index label and skip strings.

**Menu below 900 px (`components/MenuSheet.tsx`).** A full-screen dialog staged in 3D: a veil irises out of
the menu button over a grid "stage floor", rows swing down out of depth (hinged, staggered) while the
button's bars fold into an X, rows lean toward a pressing finger 1:1; picking a row flies it at the
viewer, jumps behind the veil and collapses the veil into the row. Its four link icons come from
`SocialIcon.tsx` (not TechIcon, whose full logo set would bloat the first bundle).

**Cursor label (`lib/cursor.ts`, desktop mouse only).** Elements with `data-cursor="Drag|Open|DOI|Copy|View"`
get a small label that follows the pointer 1:1 and fades out in place.

**Command palette (`components/CommandPalette.tsx`, lazy).** ⌘K / Ctrl+K or the nav's Search: sections,
projects (opens details via an `open-project` event), papers (DOI), links, copy email, résumé, theme.

**Micro-interactions (`lib/micro.ts`, after React Bits).** `magnet` (buttons, 1:1, settles on leave),
`spotlight` (fill + rim glow on clickable cards only: `.has-spot`), `decrypt`/`decryptOnView` (mono labels
resolve once), `spark` (one-shot burst), `revealHeading` (section headings rise word by word, scrubbed;
applied by `SceneSlot`; headings inside pins pass `pinnedContainer`). Buttons get a glare sweep on hover.
None loops; pointer effects are skipped on touch, everything under reduced motion.

**Easter eggs (`lib/eggs.ts`, loaded when idle; `lib/toast.ts`).** Console hello; Konami code or
"hierarchy" in ⌘K: a view-hierarchy wireframe (`html.is-hierarchy`, Esc leaves); three taps on the hero
portrait pin the Vision detections (`.hero.show-cv`); six theme flips in 4 s: back to system; ⌘K also
answers "sudo hire" (mail) and "rm -rf". The help dialog says a few things are hidden. Listeners only.

**Liquid glass (`styles/glass.css`, `lib/glass.ts`).** Per HIG, glass is the controls layer only: navbar
(Chromium edge refraction via a static SVG filter + pointer-tracked specular), secondary buttons, dialogs,
the menu sheet. Never content cards. Inside a 3D `.stage` buttons drop the blur. Honours Reduce
Transparency; `prefers-contrast: more` strengthens ink and hairlines and dims the background.

**Idle = zero frames (heat requirement).** `lib/gsap.ts` registers plugins while swallowing ScrollTrigger's
perpetual empty rAF loop, pushes its 250 ms sync poll out, and sets `autoSleep: 10`. `lib/scroll.ts` runs
Lenis only while it is smoothing (`lib/lenisLoop.ts`, kicked by wheel/touch/keys/`scrollTo`) and bridges
`lenis.on('scroll', ScrollTrigger.update)`. Never add Lenis to `gsap.ticker`, never add looping or
auto-playing animation, and re-measure with `perf.mjs` + `idle-scroll.mjs` (both must report 0).

**Data (`src/constants/index.js`).** All facts (experiences, projects, papers, certificates, about text, quotes)
are frozen content; edit presentation, not copy. The curation lists (`FEATURED_*`, `MORE_WORK_TITLES`) may change. Image fields are keys into
`src/data/images.json`. Typed views and helpers live in `src/content/data.ts`; UI strings and links in
`src/content/site.ts` (shared with the hero shell). Tech names for the Toolbox: `components/techData.ts`.

**Design tokens (`src/styles/tokens.css`).** The original site's palette: dark default (`#0a0b0d` bg, `#141518`
elevated, `#060708` sunken), light (`#fbfbfd` / `#fff` / `#f1f1f4`); ink tiers 95/62/50 % (dark) and
92/62/55 % (light); hairline 10 %. Accent blue `#3b82f6` (dark) / `#2563eb` (light) for lines, active states
and small accent text; filled buttons use `--accent-fill` `#2563eb` (white text 5.17:1); secondary cyan
`#22d3ee` / `#0891b2`. Small accent text that sits straight on the backdrop uses `--accent-text`
(`#60a5fa` dark, `#1d4ed8` light): `--accent` drops to 2.4:1 over the brightest band. The nav bar's
glass is denser than other controls' (labels over a white certificate measured 2.54:1 at the shared
tint). The only gradient text is the hero name (ink → blue → cyan; per-character slices
once split). `[data-theme]` is set pre-paint; choosing the OS scheme stores nothing (= system).
Type: Sora (display 600–800), DM Sans (body), JetBrains Mono 500 (dates, labels), with metric-matched local
fallbacks ('Sora Fallback', 'DM Sans Fallback') so the font swap does not shift layout. Hero name
`clamp(3.5rem, 10vw, 10rem)`; its gradient sits on each `.hero__line` (WebKit ignores background-clip text
through block children).
Depth grammar: `.persp` (1400/1200/1000 px, origin 50% 40%) around one `.stage` (preserve-3d); layers step
120–240 px in z; readable planes end flat; shadows near/mid/far; never blur for depth.

## Key Conventions

- Animate only `transform` and `opacity` (a custom property may carry the value when CSS turns it into
  one of those two). `will-change` only on the active scene (`.scene.is-active`).
- CSS 3D pitfalls: `overflow`, `opacity < 1`, `filter`, `clip-path` on a preserve-3d element flatten it (and
  `transform-style: preserve-3d` makes an element the containing block for absolute children). Keep 1 px z
  between coplanar layers (Safari). GSAP resets CSS `translate`/`scale`/`rotate`, so offsets that GSAP will
  animate must not live in those properties. `html { overflow-x: clip }`, never `hidden`.
- A transformed child inside a preserve-3d layer is coplanar with its parent, and Chrome sends its
  clicks to the parent (the hero's buttons were dead to a mouse): a layer that holds controls ends
  flat (`.hero__ui, .hero__index { transform-style: flat }`).
- A first-paint CSS intro and a GSAP tween never share an element: GSAP records the mid-intro value
  as its start. Put the intro on a child.
- Drive a group from one value: one tween per sentence or card with CSS deriving each child's
  transform, not a tween per child. Scene-written custom properties sit on their consumer.
- Dialogs are native `<dialog>` via `components/Dialog.tsx` (explicit `margin: auto`, focus returns, scroll lock;
  it ignores the close events it causes itself). `lockScroll` is reference-counted: dialogs overlap (the
  menu hands over to the palette, which opens only after the menu has closed); a saved/restored
  `overflow` per lock once left the page frozen after a mobile search.
- Anything measured inside a choreographed scene must use layout offsets (`offsetWithin`), never
  `getBoundingClientRect`: ScrollTrigger refreshes (a fast scroll mounts lazy scenes) run measurements
  mid-animation, and transformed boxes once cut the hero name's letters out of their gradient.
- Exploded stacks name their layers with `.layer-tag` chips pinned to each layer, not floating leader lines.
- Anything interactive gets a hover state; nothing else does. Touch targets ≥ 44 px.
- Copy is modest and factual; no em dashes in UI copy. Photos: the cutout headshot (`GadingAdityaPerdana.png`)
  in the hero, the café photo (`GadingAdityaPerdana2.jpg`) only in the About card.
- Apply HIG and Gestalt deliberately: hierarchy through type scale and weight, similarity (one card
  grammar per group), proximity (tight inside a group, wide between), common region (cards), active states
  never colour-only.
- Components are flat files in `src/components/` and `src/scenes/` (scene CSS next to its scene).
- ESLint flat config; unused vars prefixed with `_` are allowed.
- Product context in `PRODUCT.md`.

## Content integrity (carried over from the retired design docs)

- Never show fabricated model outputs: no hand-placed detection boxes, confidence scores or heatmaps
  presented as inference. Illustrations must read as illustrations.
- An intended venue is not a claim: no "CVPR"-style chips on unsubmitted work.
- Keep the site consistent with the CV (titles, dates, numbers); every rendered number needs a source in
  `src/constants/index.js` or the résumé.
- OccamViT figures are from a manuscript in preparation; check with the owner before adding more of them.
