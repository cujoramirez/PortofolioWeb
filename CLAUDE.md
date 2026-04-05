# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Type check:** `npm run typecheck`
- **Preview production build:** `npm run preview`

There are no tests configured in this project.

## Architecture

Single-page React 18 + TypeScript portfolio site built with Vite, deployed on Vercel.

**Dual styling system:** MUI v7 (component library + theming via `src/theme/muiTheme.js`) and Tailwind CSS v3. MUI handles layout components (`Box`, `Card`, `Chip`, etc.) and the dark theme. Tailwind is used for utility classes alongside MUI's `sx` prop.

**App structure (`src/ModernApp.tsx`):** No router — all sections render vertically in order: Hero → About → Technologies → Experience → Research → Projects → Certifications → Contact. Heavy sections are lazy-loaded with `React.lazy` + `Suspense`. `SectionDivider` components separate sections visually.

**Data layer (`src/constants/index.js`):** All portfolio content (experiences, projects, research papers, certifications, contact info) lives in this single JS file as exported constants. Components import and render from here.

**Typography:** Three-font system loaded via Google Fonts — "Sora" (headings/display), "DM Sans" (body), "JetBrains Mono" (overlines, chips, monospace accents). Configured in `muiTheme.js` and `index.css` CSS variables (`--font-display`, `--font-body`, `--font-mono`).

**Animation stack:** Framer Motion (section transitions, `MotionConfig` at root), GSAP (complex animations), and OGL (WebGL orb effect in hero via `ModernHero.tsx`). Lenis provides smooth scrolling (`LenisProvider` wraps the app). Consistent easing curve: `[0.22, 1, 0.36, 1]` for reveals, cubic-bezier `(0.25, 0.1, 0.25, 1)` for hover transitions.

**Performance:** Vite config has manual chunk splitting (react-core, animation-vendors, icon-vendors, form-vendors, ogl-vendors, utils-vendors). Gzip + Brotli compression plugins. Do NOT manually chunk `@mui` or `@emotion` — they have initialization order dependencies and must be handled by Rollup automatically.

**Contact form:** Uses react-hook-form + Zod for validation, EmailJS for sending.

## Key Conventions

- Components are in `src/components/` as flat files (no subdirectories), mostly `.tsx`
- The MUI theme uses a blue-cyan gradient color scheme (`#1e40af` → `#3b82f6` → `#06b6d4`)
- Background is dark (`#0a0a0a`) with glassmorphism effects (semi-transparent backgrounds, subtle borders)
- ESLint uses flat config; unused vars prefixed with `_` are allowed; component-name exports (uppercase) are excluded from unused-var checks
- TypeScript strict mode is enabled; `allowJs: true` permits the `.js` constants and theme files
