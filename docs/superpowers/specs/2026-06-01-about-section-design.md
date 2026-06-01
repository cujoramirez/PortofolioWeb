# About Section — "Model Card" Dossier — Phase 2 Design Spec

**Date:** 2026-06-01
**Status:** Approved (design); ready for implementation plan
**Scope:** The About section only — `src/components/ModernAbout.tsx` (rendered via `ModernApp.tsx` `#about`), plus one new isolated accent component. No other section changes. Second of the Phase 2 per-section refinements (after Hero and the navbar liquid-glass detour).

## Goal

Rebuild About so it reads as a senior, on-theme **researcher dossier** — framed as an ML **model card** (the documentation artifact every AI/ML practitioner knows) — that blends three things the user asked to mix: a research-credible profile with strong information hierarchy (1), the hero's computer-vision motif (2, detection boxes / scan / mono annotations), and execution at the new design bar with the `LiquidGlass` system + refined typography/rhythm (3). Bold via concept, calm in motion; modest/factual copy preserved for a recruiter / grad-admissions / collaborator audience.

There is no external reference; the direction was chosen collaboratively (model-card dossier over an annotated 2-up and a full detection-scan showpiece).

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Concept | About presented as one cohesive **ML "model card"** glass dossier |
| Surface | A single **`LiquidGlass`** card (non-interactive), not a section background |
| Structure | Section header (eyebrow + `h2` "About") above the card; card holds header bar → 2-up body (OVERVIEW + spec sheet) → STACK → quote footer |
| CV motif | Detection-box corner brackets + mono field labels + confidence-style tags; **one-shot scan reveal** on scroll-in (echoes the hero) |
| Motion | One-shot only (Framer `useInView` `once`), then static/idles; reduced-motion → fully static |
| Data | Frozen — `ABOUT_TEXT`, `ABOUT_QUOTES`, `technologies` rendered as-is; field labels are presentation strings |

## Hard constraints (carried from the Phase 2 handover)

- **Frozen data.** No edits to `src/constants/index.js`. `ABOUT_TEXT` (3 paragraphs), `ABOUT_QUOTES`, and `technologies` (via `techData.ts`) render verbatim. New strings (field labels `OVERVIEW`/`FOCUS`/`PUBLICATIONS`/`EDUCATION`/`PROGRAM`/`STACK`, the `// model card` tag) are component-level presentation, consistent with the existing in-component `GLANCE_FACTS` + eyebrows.
- **Colors adapt light/dark via tokens only.** `var(--app-palette-*)` / `color-mix`; no `theme.palette.*` from `useTheme()` in `sx`. Black shadows `rgba(0,0,0,x)` allowed.
- **One global background.** The card is a contained element over the global ColorBends layer (like the hero's panel) — not a per-section background; no seam.
- **Motion = Framer Motion** (`framer-motion`, v10), signature easing `[0.22, 1, 0.36, 1]`, gated by `useReducedMotion`. No GSAP. No new WebGL.
- **Typography:** Sora / DM Sans / JetBrains Mono (mono for the card tag, field labels, confidence tags). Gradient text stays hero-only.
- **Mount contract.** `ModernAbout` stays inside `ModernApp`'s `#about` `ContentColumn` + `AboutErrorBoundary` + `Suspense`; it adds no `<section>`, max-width, or `py` of its own.
- Build rules unchanged (no manual `@mui`/`@emotion` chunking; TS strict; `allowJs`).

## Design detail

### Layout & structure
- **Section header** (outside the card): eyebrow `Get to know me` (overline, `primary.main`) + `h2` `About` (`text.primary`). Kept for semantics and scan rhythm.
- **The card** — a `LiquidGlass` container (rounded ~16–20px) filling the `ContentColumn`, generous padding (`clamp` ~`24–40px`):
  1. **Header bar:** mono tag `// model card` (left, `label-tertiary`) + role `AI Researcher · Computer Vision` (right, `label-secondary`); hairline `divider` rule beneath.
  2. **Body grid** — `md+`: two columns `minmax(0, 1fr) minmax(0, 22rem)` (~60/40); `xs`: single column (spec sheet below overview).
     - **Left — OVERVIEW:** mono label `OVERVIEW` + the 3 frozen `ABOUT_TEXT` paragraphs (`label-secondary`, first paragraph `label-primary`, measure ≤ ~68ch).
     - **Right — spec sheet:** a `<dl>` of rows, each = mono label (`label-tertiary`) + value (`label-primary`), framed by detection-box corner brackets, each with a small mono confidence tag.
  3. **Divider → STACK:** mono label `STACK` + the skills, keeping AI/ML · Backend · Frontend · Other as mono sub-labels with the existing brand-icon outlined chips (carried from current `ModernAbout`, token borders + hover tint).
  4. **Footer — quote:** the rotating `ABOUT_QUOTES` blockquote as a `// note` annotation (mono prefix, left accent border), still 6s rotation, reduced-motion-paused (as today).

### Content mapping (frozen data → card fields; labels are presentation strings)
- `OVERVIEW` → `ABOUT_TEXT` (all 3 paragraphs, verbatim).
- `FOCUS` → "Computer Vision · Deep Learning" + keywords already in the data (Vision Transformers, Ensemble Learning, Model Calibration — present in `HERO_CONTENT` / `RESEARCH_PAPERS`).
- `PUBLICATIONS` → "5 · 4 first-author" (5 entries in `RESEARCH_PAPERS`, 4 with `isFirstAuthor: true`).
- `EDUCATION` → "BINUS University · Computer Science".
- `PROGRAM` → "Apple Developer Academy Scholar (2026)".
- `STACK` → `technologies` (unchanged). Footer quote → `ABOUT_QUOTES` (unchanged).

These restate facts already in the frozen data layer; no copy is invented or edited.

### CV motif & motion
- **Detection corner brackets:** L-shaped corner marks (CSS borders or tiny SVG) on the card and around each spec row, `color-mix` over `primary`/`secondary`, low-emphasis.
- **Confidence tags:** small JetBrains Mono labels (e.g., `0.98`) on spec rows — decorative homage to the hero's COCO/YOLO boxes; `aria-hidden`.
- **One-shot scan reveal:** on first scroll-into-view (`useInView({ once: true })`):
  - a scanline (token-gradient bar) sweeps the card top→bottom once (~0.9–1.1s, easing `[0.22,1,0.36,1]`),
  - the spec rows' brackets draw + values fade/slide in, staggered,
  - the overview paragraphs fade up.
  - Afterward fully **static** — no loop, no rAF idling cost.
- **Reduced motion:** no scanline, no stagger; everything renders in place immediately. (`useReducedMotion` + the root `MotionConfig reducedMotion="user"`.)

### Glass, tokens, performance
- Card = `LiquidGlass` **without `interactive`** (no pointer specular on a reading surface) — frost + token tint + hairline border + static top glint, with the CV brackets layered on top.
- Blur is **moderate and device-tiered** via the existing `useGlassCapabilities` (cap ~12px desktop on this large surface, 8px mobile, off on low-tier; frost fallback where unsupported). If scroll-time repaint over the animated ColorBends shows jank, fall back to tint-only (no blur) — tune live.
- All color via `var(--app-palette-*)` / `color-mix`; accent primary→secondary; mono = `var(--font-mono)`. AA contrast verified both schemes.

### Component architecture
- **Rewrite `src/components/ModernAbout.tsx`** to render the dossier (header, body grid, spec `<dl>`, STACK, quote footer), consuming `LiquidGlass`, `ABOUT_TEXT`, `ABOUT_QUOTES`, `technologies`.
- **Create `src/components/DetectionFrame.tsx`** — an isolated, reusable accent: corner brackets around its children + an optional one-shot scanline (props: `active`, `scan?`, `tag?`), reduced-motion-aware. Keeps the motif self-contained so `ModernAbout` stays focused on content/layout.
- `techData.ts` consumption unchanged; no constants touched.

### Accessibility & responsive
- Semantic `h2`; bio as real `<p>` paragraphs; spec sheet as `<dl>`/`<dt>`/`<dd>`. Mono tags/brackets/confidence labels are decorative → `aria-hidden`.
- AA contrast in both schemes; scan + rotation respect reduced-motion; 2-up collapses to single column on `xs`; no new interactive controls (no new focus targets beyond existing links, of which About has none).

## Token mapping (quick reference)
- Eyebrow / accents / brackets: `primary.main` / `color-mix(... var(--app-palette-primary-main) ...)`, blended toward `secondary-main`.
- Card tint: `color-mix(in srgb, var(--app-palette-bg-elevated) ~62%, transparent)` (via `LiquidGlass`).
- Field labels / tags: `label-tertiary` (mono). Values / overview lead: `label-primary`. Body: `label-secondary`.
- Dividers/brackets strokes: `divider` / primary `color-mix`. Shadows: tinted / `rgba(0,0,0,x)`.

## Files affected (preview; detailed steps in the plan)
- **Rewrite:** `src/components/ModernAbout.tsx`.
- **Create:** `src/components/DetectionFrame.tsx` (corner brackets + one-shot scanline accent).
- **Reuse (unchanged):** `src/components/LiquidGlass.tsx`, `src/hooks/useGlassCapabilities.ts`, `src/components/techData.ts`.
- **Unchanged:** `src/constants/index.js`, theme tokens, `ModernApp.tsx` mount.

## Out of scope
- Any edit to `ABOUT_TEXT`, `ABOUT_QUOTES`, `technologies`, or other constants.
- Re-listing publications/experience (those belong to the Research / Experience sections — About references counts only).
- A portrait/image (the hero owns the portrait; About stays text + motif).
- Other sections; new deps; new WebGL.

## Verification
- `npm run typecheck` clean, `npm run lint` clean (no new `src` errors; pre-existing only in vendored `.claude/skills/*.umd.js`), `npm run build` succeeds, `http://localhost:5173/` serves 200.
- Visual, **both schemes:** the card reads as a credible model-card dossier; OVERVIEW + spec sheet align; STACK chips + rotating quote intact; detection brackets/confidence tags are legible-but-secondary; AA contrast holds.
- **Motion:** the scan reveal plays once on scroll-in then idles (no looping rAF, steady CPU when still); reduced-motion renders everything static.
- **Perf:** confirm no scroll jank from the card's backdrop-filter over ColorBends on desktop + mobile; low-tier shows the tint-only/no-blur path.

## Open risks / notes
- **Large backdrop-filter over an animated background:** the card is big; blur is capped per device and can drop to tint-only if it janks (decided lever, verified live).
- **"Model card" framing vs. modesty:** the structure is on-theme but the copy stays factual; field labels must read as documentation, not gimmick — keep brackets/tags low-emphasis.
- **Frozen-data discipline:** `FOCUS`/`PUBLICATIONS` values restate existing facts; if any value isn't traceable to the data layer, drop it rather than invent.
