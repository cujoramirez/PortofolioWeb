# Hero Section Redesign — Phase 2 Design Spec

**Date:** 2026-05-31
**Status:** Approved (design); ready for implementation plan
**Scope:** The Hero section only (`src/components/ModernHero.tsx`, rendered via `LandingPage.tsx`). First of the Phase 2 per-section refinements. No other section changes.

## Goal

Rebuild the hero so it reads as a senior, Apple-tier opener that frames Gading as a **generalist with a research spine** — a strong AI researcher who *also* designs and builds software that stands on its own — while staying inside the Phase 1 adaptive token system, keeping all frozen data intact, and adding a tasteful first-load "compose" animation (hero + navbar, desktop and mobile).

There is no 21st.dev reference for this section; the direction was derived collaboratively (references drawn from how UI/UX designer portfolios treat a transparent cutout portrait).

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Identity framing | Research and building as **peers** (not building-in-service-of-research), shown via a rotating capability line |
| Hero copy (subhead) | Gooey morphing capability line cycling formal, parallel phrases; the static one-liner was cut as too self-assured |
| Layout | **Balanced Split** — text left, portrait right |
| Portrait treatment | **Shape Breakout** — frameless transparent cutout on a tinted panel, head/shoulders breaking the top edge |
| Rotating "Researching X" line | **Removed**, replaced by the one-liner |
| First-load animation | **Compose** (no greeting overlay; the optional "Halo." beat was declined) |
| Status dot + Academy badge | Removed (decorative/color-only cue; badge content already in the frozen paragraph) |

## Hard constraints (carried from the Phase 2 handover)

- **Frozen data.** `HERO_CONTENT` and all of `src/constants/index.js` are byte-for-byte unchanged. The new one-liner and eyebrow are component-level presentation strings (same pattern as the existing `"AI Researcher"` eyebrow and `SOCIAL_LINKS`); constants are not edited.
- **Colors adapt light/dark via tokens only.** No `theme.palette.*` from `useTheme()` in `sx` (returns the locked dark value). Use `sx` string tokens (`text.primary`, `primary.main`, `divider`), CSS var literals (`var(--app-palette-...)`), or `color-mix(... var(--app-palette-...) ...)` for translucency. Black shadows `rgba(0,0,0,x)` are fine.
- **No per-section background.** The single fixed global tint in `ModernApp.tsx` stays; the hero remains transparent over `bg-base`. The Shape Breakout panel is a *local element behind the portrait*, not a section background.
- **Hero is the height exception.** It self-manages `~100svh`; `#hero` keeps `py:0` on desktop and is the one section not wrapped in `ContentColumn`. The hero keeps its own `Container`.
- **Motion = Framer Motion only**, signature easing `[0.22, 1, 0.36, 1]`, gated by `useReducedMotion` (root `MotionConfig reducedMotion="user"` preserved). GSAP stays StaggeredMenu-only. No WebGL.
- **Gradient text only on the headline.** Typography stays Sora / DM Sans / JetBrains Mono on the fluid `clamp()` scale.
- Build rules unchanged (no manual `@mui`/`@emotion` chunking; TS strict; `allowJs`).

## Design detail

### Composition (Balanced Split)
- **Desktop (`md+`):** two-column grid, text ~58% left / portrait ~42% right, vertically centered, `min-height: 100svh`. Keep the existing `Container`.
- **Mobile (`< md`):** single column. Portrait on top (contained, not full-bleed), content below. Touch targets ≥44px.

### Content stack — left column (top to bottom)
1. **Eyebrow** `AI Researcher` — `overline` (JetBrains Mono), `var(--app-palette-primary-main)`, with the existing leading rule line.
2. **Headline** `Gading Aditya Perdana` — Sora `h1`, fluid clamp, the one sanctioned gradient (text-primary → primary → secondary). Frozen string.
3. **Capability line (gooey morph)** — a `GooeyText` component cycling formal, parallel phrases: "I research computer vision", "I publish peer-reviewed work", "I build software", "I design interfaces". `var(--app-palette-label-primary)`, sized between `h1` and body. Replaces both the old character-rotating line and the rejected static one-liner. Reduced-motion shows the first phrase statically.
4. **Frozen paragraph** `HERO_CONTENT` — `var(--app-palette-label-secondary)`, max ~60ch, visibly smaller than the one-liner. Carries the research specifics + publications/Apple Academy credentials. Unedited.
5. **Actions** — **View Projects** (`contained`, → `#projects`) and **Get in Touch** (`text`, → `#contact`). Distinct intents (portfolio vs contact), no duplicate-intent issue.
6. **Social row** — GitHub, LinkedIn, Google Scholar, Email (`SOCIAL_LINKS`), icon buttons, `label-tertiary` → `primary` on hover.

> Hero text-element count is intentionally one above the lean ideal (eyebrow + headline + one-liner + paragraph). Justified: the frozen research paragraph is the evidence this audience scans for. Type scale and measure keep the hero to ~one viewport.

### Portrait — Shape Breakout (right column)
- Transparent cutout (`src/assets/GadingAdityaPerdana.webp`, already replaced with the alpha version) rendered **frameless**.
- Behind it: a tinted rounded panel, low-alpha blue→cyan over `bg-elevated`, expressed with `color-mix`/CSS-var tints so it re-tints automatically in light mode. The subject's head/shoulders extend past the panel's top edge (depth + figure-ground separation, so the dark suit reads against the dark background — a Gestalt figure/ground move, not decoration).
- **Removed:** the rounded card frame, the green status dot, and the "Apple Developer Academy Scholar" badge (the frozen paragraph already states it).
- **LCP:** portrait stays `loading="eager"` + `fetchPriority="high"`; the existing `index.html` preload still points at the same filename, so no preload change.

### Color & contrast (colorblind-friendly)
- All color via `var(--app-palette-*)`; adapts light/dark; WCAG AA maintained (AA-large only for tertiary meta).
- Accent stays the blue→cyan family (a colorblind-safe hue range). Removing the green dot eliminates a color-only status cue, consistent with `PRODUCT.md`'s contrast-first, no-color-only-meaning principles.

### Motion — Compose (Framer Motion)
On first load, content paints immediately (no overlay), then:
- **Navbar** drops down (`y: -12 → 0`, fade) with nav items staggered.
- **Left column** staggers up (`y: 14 → 0`, fade): eyebrow → headline → one-liner → paragraph → CTAs → social.
- **Headline** does a clip/mask wipe reveal (the signature moment).
- **Right side**: the panel scales in from its base (`scale .9 → 1`, transform-origin bottom), then the cutout rises (`y → 0`, fade).
- Total ≈1.1s, easing `[0.22, 1, 0.36, 1]`.
- **Mobile:** same idea, lighter and faster (smaller offsets, shorter stagger); portrait stacks on top and rises first; navbar becomes the hamburger and fades in (StaggeredMenu open animation untouched). This intentionally replaces the current "disable all motion on mobile" behavior with a lighter-but-present variant.
- **Reduced motion** (`useReducedMotion` / `prefers-reduced-motion`): collapses to a single soft fade or instant render; no wipe, no rise, no stagger.

### Accessibility
- Semantic single `h1` (the name); one-liner and paragraph are supporting text.
- `aria-label` on each social icon button; descriptive `alt` on the portrait.
- Visible keyboard focus; reduced-motion honored; AA contrast in both schemes. Existing skip-link in `ModernApp.tsx` is unaffected.

## Token mapping (quick reference)
- Eyebrow / accents / primary CTA fill: `primary.main` / `var(--app-palette-primary-main)`.
- Headline gradient: `text-primary → primary-main → secondary-main`.
- One-liner: `label-primary`. Paragraph: `label-secondary`. Social idle: `label-tertiary`.
- Panel tint: `color-mix(in srgb, var(--app-palette-primary-main) ~12%, transparent)` blended toward `secondary-main`, over `bg-elevated`.
- Dividers/strokes: `divider`. Shadows: tinted/`rgba(0,0,0,x)`.

## Files affected (preview; detailed steps in the plan)
- **Rewrite:** `src/components/ModernHero.tsx` (layout, copy, Shape Breakout, gooey capability line, Compose motion).
- **Create:** `src/components/GooeyText.tsx` (hardened gooey morph: reduced-motion static, off-screen/hidden-tab pause, rAF cleanup, screen-reader label).
- **Likely touched:** `src/components/ModernNavbar.tsx` (first-load easing), and remove `RotatingText` usage then delete the file (only the hero imported it).
- **Asset:** `src/assets/GadingAdityaPerdana.webp` re-encoded from a PNG-in-`.webp` to true WebP with alpha (492 KB → 58 KB); the `index.html` preload `type="image/webp"` is now correct.
- **Unchanged:** `LandingPage.tsx`, `src/constants/index.js`, theme tokens.

## Out of scope
- All other sections; the optional "Halo." greeting (declined); any edit to `HERO_CONTENT` or other constants; reintroducing a contact form; any new heavy/WebGL decoration.

## Verification
- `npm run typecheck` clean, `npm run lint` clean (no new `src` errors), `npm run build` succeeds, `http://localhost:5173/` serves 200.
- Visual, both schemes: hero fits ~one viewport; cutout reads with clear figure-ground separation in light and dark; Compose plays on load and collapses under reduced motion; mobile stacks cleanly; AA contrast holds.

## Open risks / notes
- **Asset transparency:** RESOLVED — verified `hasAlpha: true` and re-encoded to true WebP with alpha (492 KB → 58 KB, 800×1067).
- **Gooey line cost:** continuous SVG-filter morph; mitigated by reduced-motion static fallback, off-screen/hidden-tab pause, and rAF cleanup on unmount.
- **Mobile motion change:** lighter-but-present motion on mobile is a deliberate departure from the current "fully disabled on mobile" behavior; still fully gated by reduced-motion.
