# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build` (for local verification prefer `npx vite build --outDir /tmp/pf-dist`, then `npx vite preview --outDir /tmp/pf-dist --port 4173`)
- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`
- **Images:** `npm run images` (AVIF/WebP ladders into `public/img` + manifest `src/data/images.json`; content-hashed, incremental; on macOS it also renders the résumé PDF's pages, so run it after replacing `public/Gading_Resume.pdf`: until then the build warns and phones open the PDF instead of a preview)
- **Vision data:** `npm run vision` (macOS: runs Apple's Vision framework on the hero portrait, see below)
- **App footage:** `npm run sequences` (requires ffmpeg; leaves an empty manifest when no clips exist)

There are no tests configured in this project.

**Utility scripts (`scripts/`, run with `node`):**
- `build-images.mjs` — responsive image ladders (hero portrait keeps its alpha channel), and the
  résumé's pages as pictures: `resume-pages.swift` (PDFKit) renders each page of
  `public/Gading_Resume.pdf` at 2000 px, named after the PDF's hash so an unchanged PDF renders
  nothing; without Swift the pages in the manifest stay. Its pruning skips `vision-*` and
  `depth-*`, which belong to the vision build: it deleted both depth maps the first time it ran
  after they existed.
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
  only, it flattens preserve-3d, exactly as Safari's view-transition snapshots do, which makes it
  the way to see those), `shot-safari.mjs` (real Safari via safaridriver: the only true check
  of Safari's 3D; setup in the README; it corrects the viewport after navigation, when Safari applies
  the saved site zoom, and prints the frames Safari made in half a second: at 0 the display is
  asleep, nothing animates or observes, and the shots are stale), `film.mjs` (captures frames after an action; dev builds expose `window.__gsap`
  to slow time), `perf.mjs` (LCP, CLS, bytes, idle rAF on a slow-4G phone or `--desktop`; the phone profile has a
  touch screen, without which the page fetched what only a mouse needs; `--actions`:
  idle frames, timers, running animations and INP after each input; `--scroll`: frame pacing and long
  animation frames over a full-page scroll), `idle-scroll.mjs` (rAF 1 s after scrolling settles),
  `cls.mjs` (layout-shift sources, `--desktop`), `budget.mjs` (gzip sizes of the first load, each lazy
  chunk and the HTML against limits; `--sum 'effects=^(gl|heroRelief|aboutRelief|displacement|sequence)-:8'`
  budgets a group), `pins.mjs` (pin length per scene; `--dead` scans for stretches where nothing
  changes), `contrast.mjs` (WCAG contrast of every text line over the real pixels behind it;
  `--reduced` audits the posters; a phone needs `--w 390 --h 844 --mobile`), `deployed.mjs` (a
  Vercel deployment as it is served: every built file present, the headers `vercel.json` asks for,
  the first load's bytes on the wire; `--relay 4188` gives the other tools a loopback copy of a
  protected preview; no Chrome). The relay speaks HTTP/1.1, whose headers add about 0.5 KB to
  each response: count bytes with `perf.mjs <preview url> --token-env .env.local`, which loads the
  preview itself over HTTP/2. `budget.mjs` also sizes the first load and the HTML as Vercel sends
  them (Brotli level 3) and holds both to the limits.
  Run INP, scroll and contrast checks on the Mac's GPU, one at a time: under SwiftShader a dialog's
  backdrop blur alone takes about 500 ms to present. Measure only while the Mac is awake: on battery
  it idle-sleeps after a minute, and a run that spans a dark wake times out or reports nonsense
  (`caffeinate -i` for the session, released afterwards).
  Check Safari-sensitive work in Safari too: the owner browses in Safari, often in short windows at
  115 % zoom (about 1190 x 680 CSS px), so every pinned scene must measure its fit rather than assume
  900 px of height. Real Safari needs the display awake as well as the Mac (`caffeinate -d`).
  WebDriver pointer actions take window points: under the 115 % zoom multiply CSS coordinates by
  window width / innerWidth (a click meant for the theme toggle landed on Search). Safari's plain
  Tab skips links and buttons; Option+Tab visits them. WebDriver pointer actions only arrive
  while the automation window has focus: when another app is in front they vanish without an
  error, while key actions and scripts still work, so a click test "fails" for no reason in the
  page. Check `document.hasFocus()` around each pointer step, bring Safari forward with
  `open -a Safari`, and discard a step that lost focus. After the owner has quit Safari,
  safaridriver starts its own and leaves it running when the session ends. `?tier=low` shows the poster without
  touching the system's reduced-motion setting. Dev builds also take `?out=<address>`, which opens
  the portal on that address (the simulator cannot tap). For real iOS Safari use the Xcode simulator: `xcrun simctl boot <iPhone>`,
  `xcrun simctl openurl <udid> "http://localhost:5173/?tier=high&at=papers_350"` (dev-only
  `?at=section_offset` scrolls there), then `xcrun simctl io <udid> screenshot out.png`; shut it down
  afterwards. After any run, `pgrep -fl "Google Chrome.*--headless"` must print nothing (other apps on
  this Mac also match `remote-debugging-port`; they are not leaks). The Claude in Chrome connection
  seen here was a remote browser that cannot reach this Mac's localhost.

## Architecture

Single-page React 18 + TypeScript (strict) portfolio, built with Vite, deployed on Vercel. A 2.5D
"built in layers" scroll story: every scene is flat DOM planes in CSS 3D space, choreographed by
GSAP ScrollTrigger. No UI library, no CSS framework.

**Deploying (Vercel, gadingap.com).** The owner pushes and deploys; an agent never adds a remote,
pushes or deploys. `vercel.json` sets two things that exist only on a deployment: a year of
immutable browser caching for the hashed files under `/assets`, `/img` and `/seq` (the site
answered `max-age=0` for them before, so every revisit asked again), and `nosniff`, a referrer
policy and `frame-ancestors 'self'` on every response (the résumé's own frame is same-origin; a
`DENY` would break it). No full CSP: the page has generated inline scripts and styles. The build
adds no `.gz`/`.br` copies, since Vercel compresses each response itself. Image names are cached
for a year, so they must never get new contents: `build-images.mjs` has a `SALT` for the day the
encoding changes. The public GitHub repository (`cujoramirez/PortofolioWeb`) holds the old site's
history, which shares no commit with this one (it starts at `4d7609a` on 2026-10-08): a first
push is either a new branch, which Vercel builds as a preview, or a forced replacement of
`main`. Everything tracked becomes public, this file included; `audits/` is ignored. On
2026-10-11 the owner wrote that the repository is private, and GitHub's API answered
`"visibility": "public"` the same day: read it again before a push. Before a
push: `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run images` if the résumé
PDF changed. A clean `npm ci` and build of the committed tree on a case-sensitive volume gave the
same 221 files as the local build (2026-10-11).

A preview sits behind Vercel Authentication. `vercel curl` gets through by creating a permanent
"Protection Bypass for Automation" secret on the project when it has none (CLI 63.1.2): do not
run it unasked. `deployed.mjs` sends the short-lived token that the owner's `vercel` run leaves
in `.env.local` (ignored by git; never print it), to that deployment only. Checked on the first
preview, 2026-10-11: all 221 files there and the page byte for byte the local build; the hashed
files `immutable` for a year; the three headers on every response; the résumé's PDF drawn in its
frame under `frame-ancestors 'self'`; a YouTube demo loaded in the portal; Vercel's two analytics
scripts answer 200. The analytics script sends nothing from an automated browser
(`navigator.webdriver`, or "Headless" in the user agent), so no test run shows a visit: only the
owner's dashboard can confirm one.
Vercel's CDN compresses with Brotli at level 3 (its sizes match a local level 3 to the byte, on
files ten days old as well), which comes out 4 to 5 % larger than gzip at level 9, so every
figure on the wire is larger there than the local ones in this file. Read straight from that
preview over HTTP/2: 129.9 KB of script in a phone load and 132.5 on desktop, against the 125
that had only been met locally (7.1 KB of it Vercel's own two scripts, which are 404s locally;
through the HTTP/1.1 relay the same loads read 134.4 and 137.0), and the page 16.4 KB with its
headers, 15.96 compressed. The live site before this build named 196.4 KB of script in its HTML.

The owner asked for the limit to hold on Vercel ("comply with the limit"). A pre-compressed copy
cannot do it: Vercel compresses such a file again, and Safari fails on the doubled encoding
(Vercel community thread 18744). The page lost weight instead. Speed Insights went: its script
was 4.9 KB there and its wrapper 0.7. Web Analytics stays, started by `lib/analytics.ts` the way
Vercel documents for a plain page; the package's React wrapper was 3.5 KB of source for those
lines, and neither package is a dependency now. `lib/split.ts` replaced GSAP's SplitText, 3.0 KB
on the wire, with the same boxes (the hero name and all seven headings compared byte for byte,
styles included). The cursor label waits for the first mouse move. Sized as Vercel sends it,
that build is 110.8 KB for the three first-load scripts, and adds up to about 120 KB of script
in a phone load and 123 on desktop. Read from the owner's second preview: 120.5 KB on the phone
profile and 123.1 to 123.4 on desktop, as summed. The fixes after it (fonts, the flat stand-in,
the index) add 0.7 KB, so desktop has about 1 KB of room. LCP there read 1.75 to 1.77 s through
the relay and 2.2 to 2.3 s loaded directly, where every request also passes Vercel's sign-in
layer and the tool's interception: neither is the public site's figure, which has to be read
from gadingap.com once it is live. To get Speed Insights back, the room has to come from somewhere
else; smooth scrolling fetched on the first input (5.9 KB) is what is left. The HTML has no
room: 15.9 KB compressed of 16.
The old site's nine `VITE_FIREBASE_*` and `VITE_ENABLE_*` variables were removed from the Vercel
project on 2026-10-11 at the owner's request (a copy, ignored by git, is in
`.vercel/removed-env-2026-10-11/`). The project has no variables, and the build needs none.

**Entry and hero shell.** `index.html` has `<!--hero-shell-->`, `#nav-root` and `#root`. The Vite plugin
`vite-plugins/heroShell.ts` renders the hero from `src/content/heroMarkup.ts` into `index.html` (dev and
build), adds the pre-paint theme script and the AVIF preload for the LCP portrait, and at build inlines
the entry CSS. So the hero paints before any JS; `src/scenes/HeroScene.tsx` only attaches choreography to
that static DOM. `src/main.tsx` mounts `<App/>` (`src/App.tsx`), which portals `<Nav/>` into `#nav-root`.
The shell also emits the remaining sections as semantic text in `<noscript>`. Fonts are self-hosted
Latin WOFF2 subsets; the build gates their CSS until the portrait loads so they do not compete for LCP
bandwidth. Splits wait for `fontsReady()`, which accounts for that gate: it watches the gate
open, then loads every declared face. It must not wait for the font set's `loadingdone` event.
Safari never fires one, so wherever the scripts beat the portrait (any real network, never
localhost) nothing behind that promise ran: the hero name was not split and did not scatter, as
the owner saw on a Vercel preview. Chrome fires one early, for the local fallbacks, and split
the name in the fallback font. Reproduce with the portrait held back 1.5 s in Playwright's
WebKit. Explicit section jumps replace
the URL hash; archive dialogs retain their push/pop history. The active theme updates `theme-color`.

**Scenes (`src/scenes/`), in order:** Hero → About → What I do → Toolbox → Projects → Experience →
Papers → Certificates → Contact (section ids `#hero #about #disciplines #toolbox #projects #experience
#papers #certificates #contact`). Each below-the-fold scene is a lazy chunk mounted by `components/SceneSlot.tsx` when its
stable `<section>` comes within one viewport; `lib/jump.ts` mounts all of them before a far jump
(nav links, `g` + letter shortcuts, deep-link hashes, a hash typed into the address bar), then
refreshes ScrollTrigger and scrolls. A scene whose download fails settles its loader (every jump
waits for every scene: left pending, one failed section stopped all navigation), and its section
shows its title, one line and a reload that returns to it. The way back is a reload because
Chrome keeps a failed dynamic import for the life of the document: importing the same address
again makes no request (measured; a different address does). For the same reason Search and the
menu are fetched with `useOnDemand` in `Nav.tsx`, not `React.lazy`: with no error boundary a
failed lazy chunk removed the whole app. Their failure opens a small dialog. Fragments go
through `fragmentId()`: `#%` is not valid percent-encoding and threw at startup. A pinned scene's first pixel is a transitional state (About
mid hand-off, Contact's empty card, What I do still stacked), so each one names where a jump lands
with `landAt`: About on its first chapter with every line up, What I do on the assembled grid
(phones: the squared deck), Papers on the grid (desktop), Contact on the finished card. The owner
reported the old landings as "the wrong y axis". Scroll anchoring is off (`overflow-anchor: none`):
Chrome answered a phone jump by scrolling 44 px back as the pins behind it changed state. An
instant jump holds its target for a few frames: a pin changing state shortens the page for a
frame, and the browser's clamp left Contact 63 px short on a phone.
- Hero: four layers (plate, name, portrait, interface) explode in z, hold, then disperse; layer tags name
  them, each pinned to the visible edge of its own layer's content (their offsets read `--portrait-h`
  and `--head-x`, which therefore live on `.hero__stage`). The plate's right third holds an index of
  the sections with their counts (`content/heroIndex.ts`: every count is an array length), part of the
  interface layer and hidden below 1100 px or where it would overlap. In the exploded view the stage
  turns 24 degrees and tilts 12, then drifts to 18 and 9 through the hold; the name and interface slide
  by `(z - Z[2]) * tan(angle)` so whole words stay clear of the head. The index is the nearest
  layer and the furthest right, where a px of slide is up to two on screen: part-way into the
  turn a wide window drew it past its right edge (43 px at 1512 x 859, the owner's Safari at
  100 % zoom, with the counts out of sight). Its slide therefore follows the turn in quarters,
  each measured at build and stepped back inside the window; checked from 1100 to 2560 px wide.
  The portrait carries the Apple Vision overlay (segmentation, person/face boxes, landmarks; no
  caption, the owner removed it): a scan beam (`.cv-scan`) sweeps the portrait, segmentation first, then
  boxes and landmarks as it passes; also shown under a 1:1 pointer lens on hover (three taps on the
  portrait pin it, an easter egg).
  The name is fitted to the plate's width and to the height above the intro block, from measured glyphs,
  and the head placed between "Perdana" and "Aditya" (after fonts load, so nothing shifts). After a
  resize the fit waits for ScrollTrigger's `revert` event: the pinned hero keeps the px size of the
  last refresh until then, and a fit on the resize event left the name at the old size until a
  reload. The poster has no pin and refits from a ResizeObserver on the stage. While the fit
  measures, the hero carries `.is-fitting` (no transitions): see Key Conventions. On first
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
  Phones (same pin length as About's phone pin, 0.9): read upright, with no layer stack. One
  picture on top and one text card below, from the first frame to About's first chapter. The name
  sinks back into the plate and fades, the portrait steps forward until it fills the place of the
  pinned About card (the same box, so nothing moves at the hand-off), and the interface rises
  under it as a card, in step with the portrait's foot so it never climbs over the picture. Under
  an About card that card is a bottom sheet taking the rest of the screen (`--pad` on
  `.hero__ui`). The Vision scan then crosses the portrait at full width at the pace of the scroll:
  the segmentation fills in behind the beam (`.cv-seg` is a clip that slides down while its
  content slides back, driven by `--wipe`; it trails the beam by the 0.07 of the height the
  relief can bend it), the face's box and landmarks arrive once the beam has cleared the face,
  and the person's box once it has cleared the person. The depth relief turns the picture by a
  virtual 24 degrees to either side through the scan (the portrait itself stays square), and its
  canvas is drawn for the scaled-up size (`zoom`): at the resting size it was soft. Then About's
  frame draws around the standing portrait, the café photo arrives inside the silhouette as on
  desktop, and the interface sheet slides off the bottom as About's first chapter rises in the
  same half (AboutScene starts that chapter's sentences before the hand-off lands, on phones
  only). The pose comes from About's card, and About sizes that card on `refreshInit` after the
  hero's listener has run: `fit()` is only marked stale there and computed by the first tween
  value that asks for it. Where About does not pin on a phone (or has not mounted) there is no
  card: the portrait fills the plate, and at the end of the pin the hero keeps its last frame and
  scrolls away. Hidden, as it was until then, it left a screen of nothing before About arrived
  (375 x 667). Short phones (no room for the interface card under a 200 px picture) get the same
  reading in a 0.85 pin with the interface in the page flow. The mobile variant also covers wide
  windows under 620 px tall: those keep the wide layout and a lighter exploded stack
  (`shortWide`), drawn without perspective (`perspective: none`: iOS passes `perspective` only
  through an element that has a transform of its own). Phones do not split the name into
  characters (nothing scatters), so CSS gives its lines the one gradient the split paints: each
  line shows its part of a gradient the size of the name's box. The markup has two lines and the
  first wraps into two rows, which the offsets assume. At rest the portrait is 66 % of the plate,
  or less where the name's three rows reach further down: on a 320 px phone the head covered the
  end of "Perdana".
  History, in the owner's words. The first phone hero lifted a card away half-way and left half
  the screen empty twice ("weird"). The two-zone rebuild kept a tilted isometric stack of plate,
  name and portrait ("the transition from hero to about is weird on mobile"). A card turn then
  replaced the silhouette hand-off, which was the wrong part: "NOOOO the previous transition was
  better, what i meant is the hero section as we scroll it's ass on mobile like why is it like
  this? so unnecessary, create a specialized one for mobile". The silhouette hand-off stays, and
  the stack does not come back on phones: fitted to one it was a small tilted thumbnail.
  The plate's fade is set from progress in `sync()`: a GSAP opacity tween wrote
  the plate's mid-intro opacity (0) at build time and left it invisible. For the same reason the
  index's first-paint intro sits on its `<ol>`, not on the element GSAP fades.
  `--handoff` sits on the portrait and on About's `.about__swap`, `--hero-overlap` on the About section.
- About: turning card (café photo `GadingAdityaPerdana2.jpg` / fact sheet) + three chapters. A chapter
  reads as one paragraph: each sentence rises as its words (inline-block `.about__word` spans, all
  driven by one `--rise` per sentence; a tween per word was 213 targets). A chapter's lines are
  paced to be up before it leaves: at a fixed 0.05 apart, the fifth sentence was still at half
  opacity when the exit began. A scrim behind each chapter
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
  planes cut into each other in 3D). Both layouts register a flat stand-in for Safari's
  snapshots (`lib/flat.ts`, see Key Conventions). Papers: deck → fan → grid (FLIP from the resting grid); its pin
  centres with auto margins so a short window never slides the heading under the nav. The pin
  holds only what fits the window, measured as What I do does: the grid of 3 + 2, else one row
  of five (`.is-row`, 1100 px wide or more), else the scene flows and each card rises once
  (`.is-loose`). Before 2026-10-11 it always pinned the grid: at the owner's 1190 x 680 Safari
  window the second row was cut off by the bottom edge for the whole pin, and the Scholar link
  under it lay over the Certificates heading (found in the real-Safari pass). Phones: a picker
  wheel (`.is-drum`): heading on top, papers on a horizontal cylinder filling the rest (masked edges,
  dimmed neighbours), each with its gist (3 lines) and two keywords. The wheel has a detent on every
  paper: the paper in front stays square and at full strength for its whole stretch of scroll, the
  scroll pulls the wheel off it 1:1 but only 28 % of the way (so it answers the finger), and past
  half way the wheel lets go and clicks to the next paper on a spring (`slip`, which keeps the
  drawn position continuous through the click). When the scroll stops it snaps to the nearest
  paper with no guess from the speed (`inertia: false`): short of half way it goes back to the
  paper it left, and as that snap starts the wheel lets go of the scroll and springs home
  (`homing`); from half way, where the wheel has already clicked, it goes on. The owner asked for
  exactly that split ("snap back to it's original position if it's 0-49% ... 50-100% snaps to
  the next paper"); a first version paged forward from 30 %. A jump of more than one paper just
  arrives. Before 2026-10-10 the wheel turned in proportion to the scroll and rested between two
  papers ("make this more tactile and snappy, so it's more readable it snaps!"). The papers are measured in
  flow *before* the drum stacks them (plain CSS transforms: GSAP's origin smoothing broke a z origin).
  Size phone layouts for real iPhone Safari viewports (~390-402 × 740-760), not only 440 × 956.
- Certificates: tiles flip in; `#all-certificates` archive. Contact (all variants): plates converge under one card;
  copy-email button (sparks + check); links as a Dock (`components/Dock.tsx`). The footer overlays the
  pinned contact scene's bottom (net height 0) so the page ends where the pin ends. The pin is
  one screen tall and clips, so it is used only where the finished card fits between the nav and
  the footer, measured (card + 76 + 64 px against the window). Elsewhere the card stays in the
  flow (`.is-loose`) with the footer after it: at 320 x 568 the pinned card was 672 px tall and
  its last three links could not be reached at all. A dock label keeps the pointer (the gap
  under it belongs to it): moving up to read it used to hide it.

**Motion policy (`lib/motion.ts`, `lib/useScene.ts`).** Every scene calls `useScene(ref, build)`, which uses
`gsap.matchMedia` for variants `desktop` (≥1024 wide, ≥620 tall), `tablet` (768–1023; pins and z × 0.7 via `k`)
and `mobile` (z × 0.5; scenes pin only after measuring that their content fits the phone, else they flow
with one-time rises). Reduced motion or a low device tier (`lib/tier.ts`, `?tier=` override; core
counts alone never mean low, iOS under-reports them) gets no timeline: the CSS rest state is the
finished "poster". ScrollTrigger restores progress on refresh *without* `onUpdate`, so any state painted
from a proxy object (drum, reveal growth, `--handoff`) must also repaint in `onRefresh`. A scene
decides what fits when it builds (pinned or flowing, grid or row, deck or stack), and a build ran
again only when the media variant changed: a desktop window made shorter kept a pinned grid
taller than itself. `lib/refit.ts` now builds every scene again, in one turn, after a resize
that can change those decisions: any change with a mouse; on a phone a change of width, or of
more than a fifth of the height (the address bar is not a new window); never under an open
dialog. It then puts the page back in the same section, as far through it as when it last came
to rest. That place is recorded after scrolling stops, not when the resize begins: by the first
resize event everything sized in viewport units has moved, and ScrollTrigger's own refresh then
keeps the pixel offset, which is somewhere else again. A rebuild is the same path as a change
of variant, so a scene's cleanup must leave nothing behind (see Key Conventions). The section gets `is-motion is-<variant>`
classes before `build` runs, and CSS switches to the choreographed layout only under `.is-motion`.
Resting DOM = readable layout; timelines animate away from and back to it.

**Background (`lib/bends.ts`, `components/Backdrop.tsx`).** The original "ColorBends" shader, ported from
three.js to ~1.7 KB of raw WebGL and rendered on demand: a frame only on scroll (scroll sets the phase),
pointer move (1:1), resize or theme change. Static frame for reduced motion / low tier, followed
while the page is open (it used to read the setting once, and went on redrawing after reduced
motion was switched on; `SceneSlot` reapplies the heading reveals on the same change); a CSS tint in
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
desktop or 500 KB phone, and fails if none does. The manifest is empty, so every card keeps its
still and the player chunk is never fetched. On 2026-10-10 the owner said the clips will not come:
the Mac was cleaned and the apps no longer run as built (DALX still runs, in worse shape). The
pipeline stays dormant and takes any subset of the three if a clip ever turns up; do not ask for
the clips again. The player draws only changed indices, caches encoded blobs, decodes
up to 17 nearby frames with a 32 MB cap, and releases bitmaps when the card leaves. Desktop frames
follow each featured segment; phone frames follow viewport travel. The footage sits on its own
rounded plate over the still and under the layer tag (the screen is a 3D layer and cannot clip). A
tall recording stands in a plain outline on that plate; where the outline would be under 120 px wide
(phones) the still stays. Save-Data, low tier and reduced motion keep the still. Checked with
synthetic clips only; test clips stay outside the repository and production output.

**Pinned keyboard access and dialogs.** `lib/focusStep.ts` brings focused controls to their visible
step (hero, featured projects, papers and contact). `lib/skipScene.ts` inserts a focused-only skip
before each pinned section, outside the stacking context so About's link clears the overlapping hero.
"Skip to content" goes to the start of the content (`jumpTo('hero')`, instant): focusing the hero's
heading where it stood did nothing from deep in the page, where the hero is hidden. The single-key
shortcuts (`?`, `g` + letter) can be switched off in the shortcuts dialog (WCAG 2.1.4; kept in
`localStorage` as `single-keys-off`); the nav's ? button and Cmd/Ctrl+K are unaffected.
`scrollToTarget` briefly suppresses the Experience and Papers snap functions during explicit jumps.
The phone Experience deck trims measured still holds; its pin is now 2.80 viewport heights instead
of 3.56. Other pin lengths stay the same. Focused controls reserve space below the fixed nav and above
the viewport bottom. A jump to the top retries its focus as the page arrives: the hero hides once it
has handed over to About, and a hidden heading takes no focus. Dialogs retain their last content for
CSS exit transitions using `@starting-style`, discrete `display` and `overlay` where supported (Chromium; Safari has no `overlay` and closes at
once), and
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
does no layout reads after its strength reaches zero. The lighter hero stack runs only in wide
windows below 620 px tall; its portrait belongs beside the intro there, sized from the fitted name and
anchored right so it does not cover the text.

2026-10-10 measured state (production build, this Mac): slow-4G phone LCP 1.73 to 1.75 s (baseline 1.82),
CLS 0.000 phone / 0.002 desktop, first-load JS 113.1 KB gzip (122.7 KB transferred, limit 125), HTML
15.0 KB, fonts 69.0 KB, new canvas code 7.0 KB of 8, depth maps 4.4 and 3.6 KB. Idle frames, timers and
running animations are zero after load, scroll and every scripted input. Worst INP at CPU x4: 88 ms
desktop, 56 ms phone. Phone full-scroll blockingDuration 49 to 70 ms over twelve runs (limit 100),
desktop 0. Posters meet AA in both themes at 1440 x 900, 1190 x 680 and 390 x 844. Pins: unchanged
except the phone Experience deck (3.56 to 2.80 viewport heights). Real Safari (safaridriver, the
owner's 115 % zoom) at 1191 x 680 and 1440 x 900 in both themes: every scene at its start, middle
and end, both relief canvases and the wall displacement live, real pointer clicks on the hero
buttons, theme toggle, wall cards, dialog close and Search, keyboard open and close with focus back
on the opener, and the first skip link by Option+Tab. Not verified: iOS flick-through and
address-bar resizing, Firefox, and playback of real footage. The owner approved the index label
and the skip strings on 2026-10-10, and decided to keep the pinned share and the dormant footage
code. The three clips are no longer expected (see App footage).

Later on 2026-10-10 (jump landings, phone hero): first-load JS 113.4 KB gzip (122.9 transferred),
HTML 15.0 KB, pins unchanged (phone hero 1.08, About 2.30, 47 % of the page), click-through 48 of
48, Tab walk 95 and 78 stops with none hidden, no dead run on the phone, the phone hero and the
landings seen in the iOS Simulator. LCP, scroll frames and INP were not re-measured cleanly: a
game was running on the Mac. Side by side with the previous build under that load they matched.

Still later on 2026-10-10 (phone hero read upright, silhouette hand-off restored): first-load JS
112.8 KB gzip (122.3 transferred), HTML 15.1 KB, effects 7.0 KB of 8, pins unchanged (48 % of the
page at 440 x 956, the same as the build before), no dead run in the phone hero or About at
440 x 956 and 390 x 844, click-through 48 of 48, Tab walk 95 and 78 stops with none hidden, every
jump landing complete. Desktop, tablet and short wide hero frames are pixel-identical to the
previous build up to the dispersal, whose letter scatter is random. Seen at 440 x 956 (both
themes, down and back up, and at device pixel ratio 3), 390 x 844, 390 x 760, 360 x 740,
375 x 667 (About flows), 375 x 600 and 320 x 568 (short), and in the iOS Simulator (iPhone 17).
The game was still running. Slow-4G phone LCP read 1.73 to 1.75 s in a quieter spell (one run
1.91) and 2.02 to 2.23 s later, against 2.09 to 2.26 s for the previous build in those later
minutes: the 2.0 s budget held only in the quieter spell. Phone scroll blockingDuration was 243
to 264 ms against 281 ms for the previous build, again in the same minutes, so the 100 ms limit
is unverified. CLS 0.000 (one run of twelve read 0.001 and listed no shift source), idle
frames 0.

The same evening (phone Papers wheel with detents, snap fixed): after touch gestures of 80 to 900 px
the wheel came to rest flat on a paper every time at 440 x 956 and 390 x 760, and the page
requested 0 frames in 2.5 s while resting there (150 before, in Papers and in the Experience
deck). The Experience deck's snap to each role, which had not fired on touch, fires too. Pins
unchanged, first-load JS 112.8 KB gzip, click-through 48 of 48, Tab walk 95 and 78 stops with
none hidden, landings complete. In the iOS Simulator the wheel draws its detents correctly; a
real finger flick on iOS is not verified (simctl cannot send touches).

Later that evening, with the game closed, the owed timings (production build with the wheel's
nearest-paper snap): slow-4G phone LCP 1.72 to 1.74 s over five runs, CLS 0.000, no long task;
phone full-scroll blockingDuration 47 to 59 ms over six runs (limit 100), p99 frame interval
16.8 ms; desktop scroll 0 ms; worst INP at CPU x4 56 ms phone and 64 ms desktop; idle frames,
timers and running animations zero after load, scroll and every scripted input, and after
touch gestures in both snapping decks. Touch drags of 21 % and 47 % of a paper came back to
the paper they left, 53 % and 84 % went on, at 440 x 956 and 390 x 760.

Later still (search jumps fixed, hyperdrive warp): after a full-page scroll all six jumps tried
from the palette moved the page on desktop (1440 x 900) and phone (440 x 956), with focus on
the heading and no console error; the phone menu's rows and its Search path work after a deck
has snapped. `perf.mjs --actions` has a search-jump action. The game was running again, so
interaction timings are not comparable: the search jump read 56 to 72 ms on the phone preset and
128 ms on desktop (the key release waiting on the jump's frame) while the other actions read 232
to 336 ms, against 32 to 64 ms an hour earlier with the game closed. 0 frames requested in 2.5 s
after a warp. Frame pacing during the warp could not be measured: headless Chrome delivered a
frame about every 100 ms after the jump with or without the transition. The warp was looked at
slowed down in Chrome (desktop, phone, light theme); in Playwright's WebKit 26.6 the jumps land
and nothing throws, but its screenshots do not show transition frames. Real Safari not run.

Night of 2026-10-10 (the portal), game closed: first-load JS 113.7 KB gzip (123.6 transferred,
limit 125), HTML 15.1 KB, portal chunk 5.8 KB with 2.5 KB of CSS, slow-4G phone LCP 1.74 to 1.76 s,
CLS 0.000. `perf.mjs --actions` opens and closes the portal: INP 48 ms on the phone preset and 56 ms
on desktop at CPU x4, 0 frames afterwards. Click-through 48 of 48, Tab walk 95 and 78 stops with
none hidden, landings complete, search jumps still land. Checked with real pointer and touch
events at 1440 x 900 and 440 x 956: every kind of link, the portal over the project dialog, the
archive, the menu sheet and from search, focus back on the opener each time, Back and Close leaving
the page where it was, a modifier click opening a tab, the pull-down at 120 px (springs back)
and 420 px (closes). Seen in the iOS Simulator (profile, certificate, video, résumé outline) and
in Playwright's WebKit at 1190 x 680, where Safari gives no focus to a clicked link, so focus
returns to the page rather than the link, as with the site's other dialogs. Not verified: real
Safari, a real finger on iOS, whether the YouTube player plays (it was only seen loaded).

Later that night (the portal only where it has something to show): first-load JS 113.5 KB gzip
(123.0 transferred), slow-4G phone LCP 1.74 to 1.76 s, CLS 0.000, portal INP 48 ms at CPU x4 with
0 frames after. With real pointer and touch events at 1440 x 900 and 440 x 956, each link did
what the table above says: previews for the résumé (mouse), a paper, a certificate and a video
demo; one new tab for the profiles, the channel and the phone's résumé. Click-through 48 of 48,
Tab walk 95 and 78 stops with none hidden. The checks listed for the first version (nesting,
focus, Back, the pull-down) were rerun on the previews that remain.

2026-10-11 (the phone sheet, the résumé's pages, zoom): first-load JS 113.5 KB gzip (123.0
transferred), slow-4G phone LCP 1.72 to 1.74 s, CLS 0.000, portal INP 40 ms on both presets at
CPU x4 with 0 frames after. Résumé pages: 60, 110 and 170 KB each in AVIF at 800, 1280 and
2000 px, fetched only when the preview opens. With touch events at 440 x 956 and 390 x 760: the
sheet stands 52 px below the top for the résumé and at its content's height otherwise (a paper
757 px, a certificate 687, a video 468 on the larger phone), the way on 12 px above the bottom
edge; a tap enlarges a page 2.6 times around the tapped point and loads the 2000 px picture; a
slow pull of 110 px springs back and a 90 px flick closes. Click-through 48 of 48, Tab walk 95
and 78 stops with none hidden, the link map as in the table. Seen in the iOS Simulator (iPhone
17) and in Playwright's WebKit, where the timed exit was caught mid-way on desktop. Not
verified: real Safari, a real finger on iOS, pinch. The owner answered "proceed" to the question
of keeping the résumé's page pictures. A copy of the site built with a changed PDF warned and
sent a phone's résumé link to a new tab; the real build previews it.

2026-10-11, real Safari (safaridriver, the owner's 115 % zoom at 1192 x 680 in both themes, and
1440 x 900), on the production build. The search jump runs as a view transition there too: the
`warp` state lasted about 0.9 s, the page was at its destination inside it, the heading took
focus, and the two layers were gone afterwards. With real pointer clicks: a certificate, a
paper, the résumé (the PDF in its frame, 846 px wide) and a video demo over the project dialog
each opened their preview with focus on the way out; a click enlarged the certificate 2.2 times;
the timed exit was caught 110 ms in with the dialog still open and the stage at 0.76 scale;
Back closed the paper's preview with the page where it was (12358 px) and still on the site;
Escape closed the nested video preview and then the project dialog; a profile link opened one
new window and no preview. No page errors. As with the site's other dialogs, Safari gives no
focus to a clicked link, so focus returns to the page rather than to the link. The pass found
the Papers overflow described under Scenes, since fixed and seen fixed in Safari at both
sizes: the five papers and the Scholar link inside the window, nothing over the Certificates
heading. With that change: click-through 48 of 48, Tab walk 95 and 78 stops with none hidden,
landings complete at 1190 x 680 and 1512 x 862, Papers pin still 0.92 viewport heights with no
dead run. Not verified: a real finger on iOS, pinch, Firefox, and how smooth the warp looks
(the driver reads state, not frame pacing).

2026-10-11, the pre-deployment audit. Another agent audited the site (`audits/predeploy-2026-10-11/`,
untracked, 15 findings); the owner passed it on. Each finding was reproduced before it was
touched. Fixed: F01 failed downloads, F02 malformed fragments, F03 Contact clipping (also found
at 375 x 600, which the audit passed), F04 shortcut switch, F05 stale layouts after a resize,
F06 false "Copied" (the portal says "Could not copy" and selects the address; Search falls back
to the mail app as Contact does), F07 live reduced motion (backdrop and headings), F08 skip
link, F09 dock labels, F12 `mainEntity`, F15 link hover colour (`--accent-text`: 5.6:1 where
`--accent` was 4.32:1). The remaining four followed on the owner's go-ahead ("approved and
prepare and optimize for push"): F10 (sharp 0.35.5, source-map-js 1.2.2, typescript-eslint 8.71.1;
`npm audit` reports 0; the refresh was found already applied in the working tree and was
verified and committed), F11 and F13 (`vercel.json`, unverified until a preview exists), F14 (the
compression plugins removed after reading Brotli on the live site).
Checked after the fixes: blocked chunks, three malformed fragments, Contact reachable at
320 x 568, 375 x 600 and 375 x 667, the switch, three clipboard states, the reduced-motion
toggle (8 backdrop draws, then 0, then 8), the dock label, both themes' hover colour; resized
pages against fresh loads at every section (pixel-identical bar the portrait's resampling) for
1440 x 900 -> 1190 x 680 and back, 390 x 844 -> 390 x 568 and a rotated phone; Playwright's
WebKit on the fragment, a blocked chunk, a resize and Contact at 320 x 568. Click-through 48 of
48, Tab walk 95 and 78 with none hidden, landings complete. First-load JS 114.7 KB gzip, 124.3
transferred (limit 125: 0.7 KB of room left), HTML 15.2 KB. A game was running again, so
timings are not clean: phone LCP read 2.04 to 2.29 s and scroll blocking 301 ms, as the builds
before did under that load; idle frames after each action matched the previous build action
for action. The owner approved the new strings on 2026-10-11 (`UNLOADED` in
`content/site.ts`; "Single-key shortcuts", "On", "Off" in `Nav.tsx`; "Could not copy" in
`Portal.tsx`). Seen while testing, not changed: at 375 x 667, where About flows, a jump to About
lands on its photo with the first chapter still below the fold.

2026-10-11, the build prepared for the push (`876ab7b` and the docs after it), with a game client
running lightly: first-load JS 109.6 KB gzip; transferred on the phone profile 119.2 KB (limit
125), on desktop 121.7 KB including Lenis; HTML 15.2 KB; effects 7.0 KB of 8. Slow-4G phone LCP
1.75 to 1.76 s, CLS 0.000, no idle frames. Phone full-scroll blockingDuration 76 to 90 ms over
four runs (limit 100), against 72 to 80 ms for the build before the audit fixes in the same
minutes, from the same frames (lazy scenes refreshing); desktop 0 ms. Worst INP at CPU x4: 72 ms
phone, 64 ms desktop; idle frames, timers and running animations zero after every scripted
action. Click-through 48 of 48, Tab walk 95 and 78 stops with none hidden, landings complete,
search jumps and the resize rebuild as before with Lenis loaded late. Lint 0 errors and
typecheck clean on the refreshed tools; `npm run images` still a no-op.
Later that day the cursor label stopped loading on touch screens: 118.2 KB transferred on the
phone profile, LCP 1.74 to 1.75 s, CLS 0.000, no idle frames; desktop unchanged at 121.7 KB. For
the same build as Vercel serves it, see Deploying.

2026-10-11, the cuts for the limit on Vercel (see Deploying), a game client running: first-load
JS 106.2 KB gzip, 110.8 as Vercel sends it; transferred locally 114.7 KB on the phone profile and
117.2 on desktop; HTML 15.1 KB gzip. Slow-4G phone LCP 1.74 to 1.76 s, CLS 0.000, no idle frames
after load or after scrolling. Phone full-scroll blockingDuration 46 ms against 42 ms for the
build before in the same minutes; worst INP at CPU x4 72 ms on the phone preset, zero frames
after every action. Hero frames up to the hold are pixel-identical to the build before at
1440 x 900; the headings mid-reveal differ by less than the build before differs from itself
(the globe behind them). Click-through 48 of 48, Tab walk 95 and 78 stops with none hidden,
landings complete at 1440 x 900, 1190 x 680 and 390 x 844; the split survives a resize and a
change to the phone layout and back. Not run: real Safari.

**Menu below 900 px (`components/MenuSheet.tsx`).** A full-screen dialog staged in 3D: a veil irises out of
the menu button over a grid "stage floor", rows swing down out of depth (hinged, staggered) while the
button's bars fold into an X, rows lean toward a pressing finger 1:1; picking a row flies it at the
viewer, jumps behind the veil and collapses the veil into the row. Its four link icons come from
`SocialIcon.tsx` (not TechIcon, whose full logo set would bloat the first bundle).

**Cursor label (`lib/cursor.ts`, desktop mouse only).** Elements with `data-cursor="Drag|Open|DOI|Copy|View"`
get a small label that follows the pointer 1:1 and fades out in place.
`App.tsx` fetches the chunk on the first mouse move, where a mouse exists and motion may run: a
phone downloaded 2.4 KB it never ran, and nothing needs a label before the pointer is somewhere.

**Command palette (`components/CommandPalette.tsx`, lazy).** ⌘K / Ctrl+K or the nav's Search: sections,
projects (opens details via an `open-project` event), papers (DOI), links, copy email, résumé, theme.
A section picked here travels (`lib/warp.ts`, `lib/warp.css`, in the palette's chunk): a jump to
hyperspace. The view rushes forward past the viewer (scale up, fade) while light streaks out
from the middle of the screen, then the destination arrives from a point ahead and stops. It is a
root View Transition scoped by `data-vt='warp'`, like the theme reveal: the jump itself is
instant, made while the old view is held as a picture. The streaks and the glow are the
`::view-transition-group`s of two empty elements added with the new state, ordered around the
page's pictures with `z-index`. Nothing rotates: a first version twisted the page into a black
hole and the owner wrote "i was hoping more of a hyper drive warp zoom in and out like space
travel instead of this goofy rotation". Inside the transition `landNow()` puts every scrubbed
scene at its new place in one turn, and the key press that chose the destination gets a frame of
its own first (with the picture taken inside it, the press took up to 216 ms to show at a quarter
of the CPU). Without View Transitions, with motion off, or while another transition runs, it is
the ordinary jump.
A jump must not start its scroll under a dialog: `jumpTo` waits for `unlocked()` unless it is
instant (the menu's jump is, behind its veil). Started under the palette, the scroll died as the
dialog let go (Lenis resets when it restarts; on touch the root's overflow changes), leaving a
new URL over an unmoved page. It only ever worked on the first jump of a visit, where loading
the lazy scenes waited the dialog out; the owner found it after scrolling the whole page ("it
doesn't teleport or move me there until i refresh"). And `pauseSnaps` must test the snap tween
before killing it: ScrollTrigger reports a finished one as 0, and `0?.kill()` threw, which
stopped every jump on a phone once a deck had snapped.

**Portal: a preview over the page for some links (`lib/outbound.ts`, `lib/portal.ts`,
`components/PortalHost.tsx`, `components/Portal.tsx`, `lib/youtube.ts`, `lib/qr.ts`).** The owner
asked that links keep the visitor on the page instead of opening new tabs. A first version put
every outside link behind a window; for a profile or a channel that window only repeated what the
page already said, and the owner asked "why would u click twice to go to a channel?". The rule
since: **the portal opens only where it has the destination itself to show, or more of it than
the link's surroundings say. Every other link leaves for a new tab in one click.**
| Link | A plain click |
|---|---|
| Résumé, with a mouse | portal: the PDF itself in a frame |
| Résumé, on a phone | portal: its pages as pictures (`images.resume`), since no phone can show a PDF in a frame (Android shows nothing, iOS draws page one at full size over its neighbours). The pictures carry the PDF's hash in their names; `vite.config.ts` compares the two and sets `__RESUME_PAGES__`, and when the PDF is newer than its pictures the link opens the PDF in a new tab rather than show old pages |
| Paper title | portal: authors, the whole description, every keyword, Copy citation |
| Certificate tile | portal: the certificate at full size |
| Project demo that is a YouTube video or playlist | portal: the player (`youtube-nocookie.com`, loaded once the visitor opens it) |
| Project demo that is a channel, LinkedIn, GitHub, Google Scholar | new tab |
A link that opens the portal carries `data-preview` (the résumé is recognised by its path); the
test is synchronous in the click handler, so every other link is left to the browser and
`target="_blank"` works as written. The icon says which is which:
`ArrowUpRight` leaves, `PlayIcon` plays here, `ExpandIcon` opens here larger. A channel's
uploads could be embedded but were not: the newest upload led the lecture series' demo with a
conference talk. A playlist address would play (`lib/youtube.ts`). LinkedIn, GitHub, Scholar,
doi.org and the certificate issuers refuse to be displayed inside another page, which is why a
paper or a certificate shows this site's own material with the way on stated. Every portal has
the address, Copy link, Open in a new tab, and on mouse devices a QR code of the address to
carry on with a phone (`lib/qr.ts`: byte mode, level M, versions 1 to 10; all 28 addresses on
the site and one string at each version's limit decoded correctly with Apple Vision).
On a phone the portal is a sheet, not the desktop window made small (the owner asked what the
best move for mobile was; the case for a preview is stronger there, where a new tab costs a trip
through the tab switcher and a YouTube link jumps to its app). It rises from the bottom edge with
a little spring, is as tall as what it holds and never the whole screen, so the page stays in
sight above it, and keeps the way on under the thumb. The bar is a handle: the sheet follows the
finger down 1:1 while the dimming lifts, closes past a third of its height or on a flick
(0.6 px/ms), and springs back short of that. A certificate and the résumé's pages are too small
to read at a phone's width, so a tap enlarges them around the tapped point and they scroll
natively (`Zoomable`: the layout changes size at once and a transform plays from the old size).
The exit is timed in script (`.is-leaving`, 240 ms, then the dialog closes) and the dimming sits
on `.portal__space` rather than `::backdrop`: Safari cannot transition a closing dialog, and
this way the window leaves the same in every engine.
Motion, all one-shot on transform and opacity: the window scales out of the link's position with
a little overshoot while streaks fall in behind it and stay as a still field; one light runs once
round its rim (a conic gradient turned behind a border-wide mask, hidden without
`mask-composite`); the dossier's lines stand up in turn; the address resolves out of scrambled
glyphs; the QR code prints from the top under a scan line (a clip sliding against its content).
The window leans toward a mouse 1:1 and a light follows the pointer; a window that holds a frame
stays flat. Open in a new tab is a real link (it keeps `target="_blank"`), and the window flies
at the viewer as the tab opens.
Rules it keeps: a click with a modifier key, a middle click and the context menu do what the
browser does, and without JavaScript the links are ordinary ones (`target="_blank"` stays in the
markup). Only the click test is in the first bundle (0.6 KB gzip); the rest is a 5.9 KB chunk
fetched when a pointer or the keyboard first reaches such a link, mounted in a React root of its
own. The portal has a history entry, so Back closes it, as Back would have left the new tab.
Three things that entry taught: stepping back makes the browser scroll to the section the
address names (2600 px away in a test) and can drop focus, so the host puts both back
(`settle`); `popstate` also fires for a hash typed into the address bar, so the host only acts on
its own step; and Escape can reach `close` twice (the dialog's cancel, then its close when the
browser overrules the cancel), and a second `history.back()` left the page, so closing is
guarded. Closed, the portal unmounts after its exit: a video in a closed dialog goes on playing.
`dialog.portal` is the whole screen and never transforms: its children are fixed against the
viewport, and a transform on it would carry them. Its strings are in `COPY` in `Portal.tsx`; the
owner approved them on 2026-10-11.
Not in it: live data from other sites (a rendered number needs a source in the constants).

**Micro-interactions (`lib/micro.ts`, after React Bits).** `magnet` (buttons, 1:1, settles on leave),
`spotlight` (fill + rim glow on clickable cards only: `.has-spot`), `decrypt`/`decryptOnView` (mono labels
resolve once), `spark` (one-shot burst), `revealHeading` (section headings rise word by word, scrubbed;
applied by `SceneSlot`; headings inside pins pass `pinnedContainer`). Buttons get a glare sweep on hover.
Text is taken apart by `lib/split.ts` (the hero name's letters on desktop and tablet, the headings'
masked words): inline-block boxes hidden from assistive technology under an `aria-label` that
reads the whole text, and `revert()` puts the original markup back.
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
perpetual empty rAF loop, pushes its 250 ms sync poll out, and sets `autoSleep: 10`. `lib/scroll.ts` fetches
Lenis only on devices with a mouse (a 5.5 KB chunk; phones scroll natively and used to download
it for nothing) and runs it only while it is smoothing (`lib/lenisLoop.ts`, kicked by wheel/touch/keys/`scrollTo`) and bridges
`lenis.on('scroll', ScrollTrigger.update)`. Never add Lenis to `gsap.ticker`, never add looping or
auto-playing animation, and re-measure with `perf.mjs` + `idle-scroll.mjs` (both must report 0).
With the poll gone, ScrollTrigger's velocity samples stop at the last scroll event and go on
reading "still moving" for seconds, and its `snap` waits for stillness, polling on the ticker.
After a touch scroll that stopped inside a snapping deck (phone Papers, phone Experience) the
deck rested between two cards and the page requested 150 frames in 2.5 s. `lib/gsap.ts` now takes
two more readings, 60 and 115 ms after the last scroll event; the snap then fires and the page
goes quiet. `idle-scroll.mjs` never caught this: by default it scrolls 9000 px, which stops short
of the decks. Check a snapping deck with a touch gesture (`Input.synthesizeScrollGesture`).

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
- The same goes for a CSS transition. GSAP reads an element's pose from its computed style the
  first time it touches it: a linked paper eases its transform (its hover), so when the drum's
  cleanup cleared the inline transform, the next build read the angle still easing away as the
  card's resting pose and the paper stayed edge-on. A cleanup that clears a transitioned
  property sets `transition: none` first and forces a layout before restoring it.
- Safari paints 3D flattened inside a view-transition snapshot (the theme reveal, the search
  warp): an element keeps its own turn, loses its depth, and DOM order replaces depth order.
  Most scenes survive that for under a second. The Experience corridor did not: its cards are
  900 px apart in depth and opaque, and the far, dimmed ones were drawn full size over the one
  in front (the owner: "the cards are dark when transitioning"); on a phone the deck showed its
  last card on top. A scene whose picture depends on depth registers a stand-in with
  `onSnapshot` (`lib/flat.ts`): `flatPoses` places each box in 2D where it really appears,
  within 0.1 px, and a `--near` z-index restores the order. `forSnapshot()` wraps both root
  transitions; the warp asks twice, for the view it leaves and the one it reaches. Only where
  `navigator.vendor` is Apple's: Chromium's snapshots keep depth.
- A cleanup leaves nothing behind that the next build would read: attributes on other sections
  (`data-jump-offset` on About outlived the hero that set it) and anything painted from a
  callback, which a trigger being reverted may call once more after the cleanup has run.
- Drive a group from one value: one tween per sentence or card with CSS deriving each child's
  transform, not a tween per child. Scene-written custom properties sit on their consumer.
- Under reduced motion every element has a 0.01 ms transition (base.css), so a layout read straight
  after a style write still sees the old value: the hero's head sat on the "A" of "Aditya" in the
  poster. Code that writes and then measures suspends transitions on that subtree
  (`.hero.is-fitting`).
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
