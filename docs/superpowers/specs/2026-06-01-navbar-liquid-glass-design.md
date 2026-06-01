# Navbar Liquid Glass — Phase 2 Design Spec

**Date:** 2026-06-01
**Status:** Approved (design) + mobile control fixes folded in from review; ready for implementation plan
**Scope:** The navigation chrome only — `src/components/ModernNavbar.tsx`, `src/components/StaggeredMenu.tsx`, `src/components/ModernNavbar.css`, plus new shared glass primitives. No section/content changes. This is a navbar-only detour before the About section.

## Goal

Adopt the ReactBits **FluidGlass** *look* — an Apple-style "liquid glass" — across every navbar surface, **optimized** for the project's constraints rather than ported literally. The bar and its controls should read as floating, refractive glass that bends the page (and the animated `ColorBends` background) behind them, adapts to light/dark, stays smooth on every device, and idles when nothing is moving.

The literal r3f snippet (`@react-three/fiber` + `drei` + `maath` + GLB) was **rejected**: it would add a second always-on WebGL context next to `ColorBends`, never idle (continuous `useFrame`), refract a *synthetic* scene instead of the real page, and add three heavy deps — all in conflict with the project's performance rules. We recreate the material with CSS `backdrop-filter` + a progressive SVG refraction filter instead.

## Decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Rendering technique | **CSS/SVG liquid glass** — `backdrop-filter` frost + token tint + edge-light + pointer specular, with a **progressive SVG `feDisplacementMap` edge-refraction** where supported. No WebGL, no new deps. |
| Surfaces in scope | **All** — top bar, nav pills + the spring "liquid" active indicator, theme toggle + "G" brand chip, mobile `StaggeredMenu` panel + toggle, back-to-top FAB. |
| Default intensity | **Bold & alive** — 18px frost, visible edge-refraction where supported, active pointer-reactive specular. Still idles when static; degrades cleanly. Exact values tuned live. |
| Active indicator | Re-skinned as a **moving glass lozenge** (keeps all scroll-spy/interpolation behavior). |
| Back-to-top (from review) | **Remove the duplicate.** Mobile showed two (blue FAB bottom-left in `ModernNavbar` + glass Fab bottom-right in `BackToTop.tsx`). Keep the single glass `BackToTop` (bottom-right); delete the `ModernNavbar` FAB. |
| Mobile toggle + menu (from review) | Theme toggle and `StaggeredMenu` button unified into one Gestalt cluster: **equal size (44px) + equal radius + matching glass material**, high-contrast icons (visible in light, refined in dark), **symmetric spacing**. |

## Hard constraints (carried from the Phase 2 handover)

- **Frozen data.** No edits to `src/constants/index.js`. This work is presentation-only; `NAV_ITEMS` and nav labels are unchanged.
- **Colors adapt light/dark via tokens only.** Tint/border/shadow expressed with `color-mix(... var(--app-palette-...) ...)` over `--app-palette-*`; scheme-specific specular/rim colors keyed off `[data-mui-color-scheme="light"]` (the existing pattern in `StaggeredMenu`). The navbar keeps its documented active-scheme `pal` resolution (`theme.colorSchemes[resolvedMode].palette`) for JS reads — **no `theme.palette.*` from `useTheme()` in `sx`**.
- **One global background only.** No per-surface opaque background that breaks the `ColorBends` layer; glass surfaces are translucent *over* it. No new WebGL context.
- **Motion gated.** All motion behind `useReducedMotion` / `prefers-reduced-motion`. Framer Motion stays the navbar's motion lib; GSAP stays `StaggeredMenu`-only. Signature easing preserved.
- **Performance.** Effects must idle (no rAF loop, no animated SVG turbulence); per-device/per-tier degradation via the existing `useSystemProfile`. Build rules unchanged (no manual `@mui`/`@emotion` chunking; TS strict; `allowJs`).

## Design detail

### Material recipe (layered, token-driven)

A single glass surface composes these layers, bottom to top:

1. **Frost** — `backdrop-filter: blur(18px) saturate(170%)` (+ `-webkit-` prefix). Samples the real page + `ColorBends` behind the surface. Blur capped per device: 18px desktop → 12px tablet → 8px mobile → `none` on `data-perf="low"`.
2. **Tint fill** — `color-mix(in srgb, var(--app-palette-background-paper) ~62%, transparent)`, tuned per scheme so text on the bar stays **AA**. Slightly denser on scroll (reuse the existing `useScrollTrigger` `trigger`).
3. **Edge light** — inset top highlight (`inset 0 1px 0 …`) + 1px hairline border `color-mix(in srgb, var(--app-palette-divider) ~55%, transparent)`.
4. **Elevation** — soft shadow (tinted/`rgba(0,0,0,x)`), intensifying with `trigger`.
5. **Refraction (progressive)** — a static SVG `feTurbulence` → `feDisplacementMap` filter, edge-concentrated, displacement scale ~8–12px, referenced via `backdrop-filter: blur(...) url(#liquid-glass)`. **Static** (no animated `baseFrequency`) so it costs nothing per frame.
6. **Specular (interactive)** — a radial-gradient highlight positioned from CSS vars `--gx/--gy`, updated on `pointermove` only (event-driven → idles at rest). On `bold` surfaces it's a brighter sheen; rest position is a soft top-edge glint.

### Component architecture (new, isolated units)

- **`src/components/LiquidGlass.tsx`** — the one reusable glass surface. The material is defined here once and consumed everywhere.
  - *Interface:* `{ radius?, intensity?: 'bold' | 'subtle', elevation?, interactive?: boolean, component?, sx?, children }`.
  - *Does:* renders the layered frost/tint/edge/specular; attaches the `#liquid-glass` filter when `canRefract`; wires the `pointermove`→CSS-var specular when `interactive && reactiveSpecular`.
  - *Depends on:* `useGlassCapabilities`, the `#liquid-glass` filter from `GlassFilters`, MUI `Box`.
- **`src/components/GlassFilters.tsx`** — a single hidden `<svg aria-hidden>` holding the `<filter>` def(s). Mounted **once** (in `ModernNavbar`). No per-instance SVG.
- **`src/hooks/useGlassCapabilities.ts`** — reads `useSystemProfile` (tier/device), `useReducedMotion`, and `CSS.supports` probes (`backdrop-filter: blur()`, `backdrop-filter: url(#x)`). Returns `{ canBlur, canRefract, reactiveSpecular }`. Single source of truth for degradation.
- Specular pointer logic lives **inside** `LiquidGlass` (no shared rAF; pointer events only). When the pointer leaves, vars ease back to rest via CSS transition, not JS.

### Surface-by-surface application

- **Top bar** (`ModernNavbar.tsx`): replace the near-opaque `background.paper` `Box` (currently `backdropFilter: 'none'`) with `LiquidGlass intensity="bold"`. Keeps the 2px scroll-progress bar and the scroll-triggered intensity bump.
- **Nav pills + active indicator:** hover pills become light glass lozenges; the spring `liquidX/liquidWidth` indicator becomes a **glass lozenge** (`intensity` lighter so labels stay readable). All scroll-spy, interpolation, and `MagnifiedInteractive` behavior preserved.
- **Theme toggle + "G" brand chip:** small glass controls (`interactive` specular on desktop). The toggle keeps the View-Transitions circular-reveal behavior. On mobile/tablet the toggle is paired with the menu button as a matched cluster (see *Mobile control fixes*).
- **Mobile `StaggeredMenu` panel + toggle:** re-skin `.sm-panel-surface` and the toggle to the shared recipe via CSS vars, replacing the bespoke hardcoded-rgba gradients with token-driven glass. Keeps its GSAP open/close, per-device blur tiers, and `[data-mui-color-scheme="light"]` adaptation (upgraded to the unified tokens).
- **Back-to-top:** the single `BackToTop` Fab (bottom-right) becomes the canonical glass back-to-top, aligned to the shared recipe; the duplicate `ModernNavbar` FAB (bottom-left) is **removed** (see *Mobile control fixes*).

### Mobile control fixes (from review)

Screenshots surfaced three issues on mobile/tablet; all fold into this work.

1. **Duplicate back-to-top — remove one.** `BackToTop.tsx` (bottom-right, glass, `scrollY > 500`, all devices) and the `ModernNavbar` FAB (bottom-left, blue, mobile/tablet, `trigger`) both render → two buttons. **Keep `BackToTop`** (already glass + token-driven; aligns to the recipe) and **delete the `ModernNavbar` FAB** and its now-unused `Fab`/`Zoom`/`KeyboardArrowUp` wiring. (The "RESEARCH" caption beneath the blue FAB is the Research section's eyebrow showing through, not a label.)
2. **Theme toggle + menu button: low contrast.** Today the menu button is `rgba(255,255,255,0.04)` with a faint border — invisible on light backgrounds, a muddy outlined square in dark. Both become **glass controls** with a token tint (clearly visible on any backdrop) and **`text.primary` icons** for AA contrast in both schemes.
3. **Theme toggle + menu button: mismatched + asymmetric.** They differ in size (40px toggle vs 48px menu) and radius (10 vs 12), and the toggle clears the menu with a brittle `marginRight: 48` hack.

**Unified treatment (Gestalt + UX):**
- **Similarity:** both controls 44×44 (≥44px touch target), identical radius (12px) and identical glass material → they read as one control set.
- **Proximity / common region:** grouped at top-right with one consistent gap (~10–12px); the toggle's offset is derived from the shared `menuSize + gap` constants, not a magic number, so they can't drift.
- **Symmetry / balance:** the pair's right edge aligns to the same toolbar gutter as the brand on the left (`px` 16 mobile / 32 tablet); both vertically centered in the toolbar height.
- Scope: unification applies to **mobile/tablet** (where the menu button exists). On desktop the toggle stays sized to the nav-pill rhythm.
- `StaggeredMenu` keeps its GSAP plus→close icon animation; only its toggle's size/material/contrast change (it already accepts size/color props).

### Light / dark token mapping (quick reference)

- Frost tint: `color-mix(in srgb, var(--app-palette-background-paper) ~62%, transparent)` (denser on scroll).
- Hairline border: `color-mix(in srgb, var(--app-palette-divider) ~55%, transparent)`.
- Active indicator / pill accents: `color-mix` over `var(--app-palette-primary-main)` (+ `secondary-main` blend), as today.
- Specular/rim color: `--glass-spec` set per scheme — brighter white in dark, a softer tinted highlight in light (light backgrounds make pure-white specular invisible) — via `[data-mui-color-scheme]`.
- Shadows: tinted or `rgba(0,0,0,x)` (allowed).

### Motion / performance / device tiers (non-negotiables)

- **Idles by default:** no rAF loop, no animated turbulence. Specular updates only on `pointermove`; refraction is a static filter.
- **`prefers-reduced-motion`:** no specular tracking, no sheen animation; frost + tint + static glint only. (`StaggeredMenu` open/close already respects its lightweight tier.)
- **Pointer/tier gating:** coarse pointer / touch → no reactive specular (no hover); `data-perf="low"` → frost off, denser solid tint fallback; blur radius capped per breakpoint (see recipe).
- **Single WebGL context preserved** — `ColorBends` remains the only one.
- **Safari clipping:** glass elements that scale under the `MagnifiedInteractive` transform use `clip-path: inset(0 round Npx)` for reliable rounded clipping (the documented hero gotcha — `overflow:hidden` + radius leaks under a transformed ancestor in Safari).

### Accessibility

- Semantics unchanged: nav stays DOM `<a>` links with `aria-current`; focus-visible rings preserved on every glass control.
- Active state is never color-only — keep the existing dot/underline indicators in addition to the glass lozenge.
- Text-on-glass contrast verified **AA** in both schemes by tuning tint density; the `@supports`-off fallback is the current readable near-opaque bar.

### Browser support & fallbacks

| Capability | Chromium | Safari | Firefox | Fallback |
|---|---|---|---|---|
| `backdrop-filter: blur() saturate()` (frost) | ✅ | ✅ (`-webkit-`) | ✅ (103+) | `@supports not (...)` → today's near-opaque paper bar (readable) |
| Pointer specular (CSS vars) | ✅ | ✅ | ✅ | none needed; gated off for coarse pointer / reduced-motion |
| `backdrop-filter: url(#filter)` edge-refraction | ✅ | ❌ (frost only) | ⚠️ limited | silently degrades to frost + specular (still premium) |

Refraction is a **progressive enhancement**, not a requirement. Safari/Firefox get frost + specular and look correct.

## Files affected (preview; detailed steps in the plan)

- **Create:** `src/components/LiquidGlass.tsx`, `src/components/GlassFilters.tsx`, `src/hooks/useGlassCapabilities.ts`, and glass CSS (extend `ModernNavbar.css` or a new `liquidGlass.css`).
- **Modify:** `src/components/ModernNavbar.tsx` (bar surface, pills, indicator, brand chip, mount `GlassFilters`; **remove the FAB** + unused `Fab`/`Zoom`/`KeyboardArrowUp`; unify the mobile/tablet theme toggle to 44px glass), `src/components/StaggeredMenu.tsx` (`.sm-panel-surface` + toggle → shared recipe, 44px), `src/components/BackToTop.tsx` (align the kept back-to-top to the glass recipe), `src/components/ModernNavbar.css` (wire in; remove dead `.navbar-glass-surface` / `.glass-backdrop` / `.navbar-glass-shimmer` rules the TSX no longer uses).
- **No dependencies added.** Existing `three` (ColorBends) untouched.
- **Caution:** `ModernNavbar.css` defines **global** `.MuiChip-root` glass styles that currently affect the About section chips. Leave those untouched (out of scope); only remove the verified-dead navbar-bar classes.

## Out of scope

- Any literal r3f/WebGL FluidGlass port; new deps; GLB assets; the `/assets/demo/*` images.
- The About section and all other content sections (this is a navbar-only detour).
- Edits to `src/constants/index.js`, nav items, or routing.
- The global `.MuiChip-root` rules in `ModernNavbar.css` (used by other sections).

## Verification

- `npm run typecheck` clean, `npm run lint` clean (no new `src` errors), `npm run build` succeeds, `http://localhost:5173/` serves 200.
- Visual, **both schemes**: bar reads as refractive glass over `ColorBends` and over content while scrolling; text stays AA; pills/indicator/toggle/brand/FAB are cohesive glass; mobile `StaggeredMenu` panel + toggle match the language; light/dark toggle (View-Transitions reveal) still works.
- **Device/tier checks:** desktop (refraction + specular), touch/tablet (frost, no specular), `data-perf="low"` (frost off, solid tint), `prefers-reduced-motion` (no sheen). Confirm it **idles** (no busy rAF / steady CPU when the pointer is still).
- Confirm only one WebGL context exists (ColorBends); no second canvas introduced.
- **Mobile control fixes:** exactly **one** back-to-top button on mobile/tablet; theme toggle and menu button are equal-sized, clearly visible and legible in **both** themes, and evenly spaced as a balanced top-right cluster.

## Open risks / notes

- **Re-enabling backdrop on the bar:** the bar was deliberately `backdropFilter: 'none'`; re-enabling refraction over the animated background must be contrast-checked in both schemes (mitigated by tint density + AA verification).
- **Refraction is Chromium-mostly:** Safari/Firefox get frost + specular. Acceptable per the progressive-enhancement decision; the "liquid bend" is a bonus where supported.
- **`StaggeredMenu` is a vendored-style component** (Tailwind + inline `<style>`): re-skinning its surface must preserve the GSAP timelines, `inert`/focus handling, and per-tier blur. Touch only the surface styling.
- **Stacking & `backdrop-filter`:** the filtered element must remain translucent and above content; verify the navbar `zIndex: 1100` over content (`zIndex: 1`) over `ColorBends` (`zIndex: 0`) still composites correctly.
