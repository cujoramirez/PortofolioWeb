# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`
- **Preview production build:** `npm run preview`
- **Bundle analysis:** `npm run build:analyze` (builds with `--mode analyze`)

There are no tests configured in this project.

**Utility scripts (`scripts/`, run with `node`):**
- `compress-hero.mjs` — resize/recompress the hero image via `sharp`
- `find-unused-modules.mjs` — trace imports from the entry point; `--delete` removes unreferenced files
- `generate-glb-models.mjs` — generate GLB assets for the FluidGlass component

## Architecture

Single-page React 18 + TypeScript portfolio site built with Vite, deployed on Vercel.

Entry point is `src/main.tsx` (referenced from `index.html`).

**Dual styling system:** MUI v7 (component library + theming via `src/theme/muiTheme.js`) and Tailwind CSS v3. MUI handles layout components (`Box`, `Card`, `Chip`, etc.). Tailwind is used for utility classes alongside MUI's `sx` prop, running through PostCSS (`postcss.config.js`) with the v3 CJS config in `tailwind.config.js`.

**Adaptive theme (light + dark):** `src/theme/muiTheme.js` uses MUI v7 `createTheme` with `cssVariables` + `colorSchemes: { light, dark }` (`defaultColorScheme: 'dark'`). The app wraps in `ThemeProvider` (v7, CSS-vars-aware) with `defaultMode="system"`, so the active scheme follows OS preference and is toggled in the navbar via `useColorScheme()`. **Always style with semantic tokens, never hardcoded hex:** background tiers (`bg.base`/`bg.elevated`/`bg.sunken`), opacity-based label tiers (`label.primary`→`quaternary`), and `primary`/`secondary`. Consume as `var(--app-palette-...)` or `theme.palette.*`. A single tint = action; the only gradient-text is the hero headline. Typography is a fluid `clamp()` scale. Spacing/rhythm tokens live in `index.css` (`--section-py`, `--content-max`, `--gutter`).

**App structure (`src/ModernApp.tsx`):** No router — 6 sections render vertically in order: **Hero → About (incl. Technologies) → Research → Projects → Experience (incl. Certifications) → Contact**. Each section is a `<Box component="section" id=...>` with `py: var(--section-py)`; non-hero sections wrap content in a `ContentColumn` (capped at `--content-max`, `--gutter` padding). Heavy sections are lazy-loaded with `React.lazy` + `Suspense`. No section dividers or fixed decorative backgrounds.

**Data layer (`src/constants/index.js`):** All portfolio content (experiences, projects, research papers, certifications, contact info) lives in this single JS file as exported constants. Components import and render from here.

**Typography:** Three-font system loaded via Google Fonts — "Sora" (headings/display), "DM Sans" (body), "JetBrains Mono" (overlines, chips, monospace accents). Configured in `muiTheme.js` and `index.css` CSS variables (`--font-display`, `--font-body`, `--font-mono`).

**Animation stack:** Framer Motion (section reveals, `MotionConfig reducedMotion="user"` at root) and GSAP (used only by `StaggeredMenu`, the mobile nav). Lenis provides smooth scrolling (`LenisProvider` wraps the app). Consistent easing curve: `[0.22, 1, 0.36, 1]` for reveals, cubic-bezier `(0.25, 0.1, 0.25, 1)` for hover transitions. The WebGL/OGL hero orb was retired (the `ogl`/`maath` deps are removed); always gate new motion behind `useReducedMotion`.

**Performance:** Vite config has manual chunk splitting (react-core, animation-vendors, icon-vendors, form-vendors, utils-vendors). Gzip + Brotli compression plugins. Do NOT manually chunk `@mui` or `@emotion` — they have initialization order dependencies and must be handled by Rollup automatically.

**Contact:** Links-based section (email, LinkedIn, GitHub, Google Scholar, location) — there is NO working form/EmailJS integration (none was ever configured; those deps were removed). Don't reintroduce a form without real credentials.

**SEO & static assets:** `index.html` contains JSON-LD structured data plus Open Graph/Twitter meta and LCP image preload — keep these in sync with portfolio content. Static files served as-is live in `public/` (`robots.txt`, `sitemap.xml`, Google site-verification HTML files).

## Key Conventions

- Components are in `src/components/` as flat files (no subdirectories), mostly `.tsx`
- Accent family is blue→cyan, but applied as semantic tokens (see Adaptive theme), not hardcoded — and surfaces must adapt to light/dark
- Data in `src/constants/index.js` is treated as frozen content (the overhaul preserved it byte-for-byte); edit presentation, not copy
- ESLint uses flat config; unused vars prefixed with `_` are allowed; component-name exports (uppercase) are excluded from unused-var checks
- TypeScript strict mode is enabled; `allowJs: true` permits the `.js` constants and theme files
- Design specs/plans for the overhaul live in `docs/superpowers/`; product/design context in `PRODUCT.md`
