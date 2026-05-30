# Portfolio Design Overhaul — Phase 1 Design Spec

**Date:** 2026-05-30
**Status:** Approved for planning
**Scope:** Foundation rebuild only. Per-section visual design (driven by user-supplied 21st.dev references) is explicitly out of scope for Phase 1 and handled later, section by section.

## Goal

Overhaul the portfolio's presentation layer to fix density, scroll length, and adherence to design principles (Gestalt grouping, visual hierarchy, type scaling, color contrast/saturation, Apple HIG). Content and data stay frozen; the visual/structural layer is rebuilt.

## Hard constraints

- **Data is sacred.** All copy and content in `src/constants/index.js` stays byte-for-byte unchanged. No rewording, reordering of facts, or data edits.
- **Components are fully open.** Any component JSX, layout, or styling may be rewritten or deleted to serve the new system.
- **CLAUDE.md constraints honored:** do NOT manually chunk `@mui`/`@emotion` in Vite; keep `allowJs` JS files (`constants`, theme); flat ESLint config; TS strict.
- **No new tests** (project has none configured); verification is via `npm run typecheck`, `npm run lint`, `npm run build`, and visual review.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| What to preserve | Data/copy only; components rebuildable |
| Visual identity | Light + dark **adaptive** system, HIG-aligned semantic tokens |
| IA strategy | Aggressive consolidation, **nothing hidden** (Approach B) |
| Primary goal | Balanced showcase — "researcher who also builds"; research and projects equally prominent |
| Per-section visuals | Deferred to references; Phase 1 ships dense, coherent **defaults** |

## Design system foundation

### Color — semantic adaptive tokens
Replace hardcoded hex in components with semantic roles that resolve per color scheme (light/dark), mirroring Apple's system:
- **Backgrounds (layered):** `bg-base`, `bg-elevated`, `bg-sunken`. Depth via layering, not glassmorphism.
- **Labels (hierarchy via opacity of one ink):** `label-primary`, `label-secondary`, `label-tertiary`, `label-quaternary`.
- **Single tint** (blue retained) = action/accent only, used sparingly. Gradient survives only in the hero.
- **Discipline rules:** WCAG AA enforced (4.5:1 body text, 3:1 large text/UI), accent saturation capped, large fills desaturated.
- Light and dark generated from the **same token names** so components never hardcode and a `/theme` toggle is free.

### Typography — one modular scale
Keep the 3-font system (Sora display / DM Sans body / JetBrains Mono accents) with strict role assignment. Replace ad-hoc sizes with a single fluid scale using `clamp()` (~1.25 ratio), one source of truth for mobile→desktop. Gradient text removed from headings (hero only).

### Spacing & layout — 8pt grid + rhythm
Eliminate `100vh`-per-section. Sections become content-driven height with a consistent vertical-rhythm token, a capped content width (~1100–1200px), and steady gutters. Gestalt enforced structurally: proximity, common region (cards), strict alignment.

### Responsive — two real layouts (HIG)
- **Mobile:** single column, ≥44px touch targets, condensed nav, lighter motion.
- **Desktop:** multi-column dense grids, hover affordances, pointer-precision interactions.
- Driven by existing breakpoints (sm 600, md 900, lg 1200).

### Motion — purposeful, lighter
Keep Framer Motion reveals + signature easing `[0.22, 1, 0.36, 1]`. Cut heaviest decorative effects (see Retired). `reducedMotion="user"` preserved.

## Information architecture: 8 → 6 sections (Approach B)

| # | New section | Source data | Notes |
|---|---|---|---|
| 1 | Hero | `HERO_CONTENT` | One viewport; orb retired → lightweight gradient/CSS. |
| 2 | About + Technologies | `ABOUT_TEXT`, `ABOUT_QUOTES`, tech data | Merged: story + at-a-glance strip + dense skills band. |
| 3 | Research | `RESEARCH_PAPERS` | Compact paper cards, progressive disclosure. |
| 4 | Projects | `PROJECTS` | Dense grid, "show more." |
| 5 | Experience + Certifications | `EXPERIENCES`, `CERTIFICATIONS` | Merged: timeline + credential strip with modal detail. |
| 6 | Contact | `CONTACT` | Condensed; keep react-hook-form + Zod + EmailJS. |

Nav anchors update to the 6 destinations. Density comes from grouping and progressive disclosure, not from hiding content behind tabs.

## Retired / flattened components

Replaced by token-driven equivalents:
- WebGL orb (OGL) in hero → lightweight gradient/CSS treatment
- `GradualBlur`
- `GlassSurface`
- `StarBorder`
- heavy `ProfileCard` tilt/glare → simpler image treatment
- decorative `SectionDivider` variants → rhythm handles separation
- noise-texture overlay
- 25-step shadow array → ~5 token shadows

**Kept:** Lenis smooth scroll, error boundaries, lazy-loading + Suspense, contact form stack, Vercel analytics.

## Theme implementation

- Rebuild `src/theme/muiTheme.js` into an adaptive theme using MUI v7 CSS-vars / `colorSchemes` (light + dark) exposing the semantic tokens as CSS variables.
- Align `src/index.css` CSS variables (`--font-display/-body/-mono` plus new color/space/radius tokens) with the theme.
- Add a `/theme` (light/dark) toggle in the navbar; default follows system preference.
- Trim `src/styles/*.css` (`enterprise.css`, `performance*.css`) to what the new system needs.

## Phase boundary

Phase 1 delivers: adaptive token system + light/dark toggle, the 6-section compressed skeleton with dense default layouts, and retirement of heavy decorations — type-checking, linting, and building clean.

Phase 2+ (per section, later): user supplies a 21st.dev reference per section; that section's layout is refined to match, adapted into the Phase 1 token system so the whole stays coherent.

## Verification

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — succeeds
- Manual: light/dark toggle works; each of the 6 sections renders with frozen data; scroll length materially reduced; no retired component remains imported.
