# Portfolio Design Overhaul (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation layer onto an adaptive (light/dark) HIG-style token system, compress 8 stacked sections to 6 dense ones, and retire heavy decorative components — without changing any content in `src/constants/index.js`.

**Architecture:** A semantic CSS-variable token layer (MUI v7 `colorSchemes` + `index.css` vars) is the single source of truth for color, type, spacing, radius, and shadow. Every section component reads tokens, never hardcoded hex. Sections become content-height (no `100vh`) with capped width and consistent rhythm. Per-section *visual* design is deferred to Phase 2 (driven by user 21st.dev references); Phase 1 ships coherent dense defaults.

**Tech Stack:** React 18 + TypeScript, Vite, MUI v7 (CSS-vars theme), Tailwind v3, Framer Motion, Lenis.

**Verification model:** This project has no test runner. "Verify" for every task means: `npm run typecheck` clean, `npm run lint` clean, `npm run build` succeeds, and visual confirmation at http://localhost:5173/. The dev server hot-reloads.

---

### Task 0: Version control + safety net

**Files:** repo root

- [ ] **Step 1: Initialize git (not currently a repo)**

Run: `git init && git add -A && git commit -m "chore: snapshot before design overhaul"`
Expected: a baseline commit so every later task is revertable.

- [ ] **Step 2: Confirm dev server is up**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`
Expected: `200`. If not, `npm run dev` in background.

---

### Task 1: Semantic token foundation (theme)

**Files:**
- Modify: `src/theme/muiTheme.js` (full rewrite to `colorSchemes` light+dark)
- Modify: `src/index.css` (replace ad-hoc `:root` color vars with semantic tokens + scheme overrides)

- [ ] **Step 1: Rewrite `muiTheme.js` to an adaptive CSS-vars theme**

Use `createTheme` with `cssVariables: { colorSchemeSelector: 'data' }` and `colorSchemes: { light: {...}, dark: {...} }`. Define semantic palette keys in BOTH schemes. Keep `typography` (move to fluid `clamp()` sizes), `shape.borderRadius: 12`, `spacing: 8`, existing `breakpoints`. Replace the 25-entry `shadows` array with ~5 real shadows (rest `'none'`-ish duplicates of the last meaningful one is NOT allowed — set unused high indices to a subtle elevation). Concretely:

```js
import { createTheme } from '@mui/material/styles';

const fonts = {
  display: '"Sora", system-ui, sans-serif',
  body: '"DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const muiTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data', cssVarPrefix: 'app' },
  colorSchemes: {
    dark: {
      palette: {
        mode: 'dark',
        primary: { main: '#3b82f6', light: '#60a5fa', dark: '#1e40af', contrastText: '#fff' },
        secondary: { main: '#22d3ee', light: '#67e8f9', dark: '#0891b2', contrastText: '#0a0a0a' },
        background: { default: '#0a0b0d', paper: '#141518' },
        text: { primary: 'rgba(255,255,255,0.95)', secondary: 'rgba(255,255,255,0.62)', disabled: 'rgba(255,255,255,0.30)' },
        divider: 'rgba(255,255,255,0.10)',
        // custom semantic tokens
        bg: { base: '#0a0b0d', elevated: '#141518', sunken: '#060708' },
        label: { primary: 'rgba(255,255,255,0.95)', secondary: 'rgba(255,255,255,0.62)', tertiary: 'rgba(255,255,255,0.38)', quaternary: 'rgba(255,255,255,0.20)' },
      },
    },
    light: {
      palette: {
        mode: 'light',
        primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#fff' },
        secondary: { main: '#0891b2', light: '#06b6d4', dark: '#0e7490', contrastText: '#fff' },
        background: { default: '#fbfbfd', paper: '#ffffff' },
        text: { primary: 'rgba(0,0,0,0.92)', secondary: 'rgba(0,0,0,0.58)', disabled: 'rgba(0,0,0,0.30)' },
        divider: 'rgba(0,0,0,0.10)',
        bg: { base: '#fbfbfd', elevated: '#ffffff', sunken: '#f1f1f4' },
        label: { primary: 'rgba(0,0,0,0.92)', secondary: 'rgba(0,0,0,0.58)', tertiary: 'rgba(0,0,0,0.40)', quaternary: 'rgba(0,0,0,0.22)' },
      },
    },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 16px 48px rgba(0,0,0,0.18)',
    ...Array(20).fill('0 16px 48px rgba(0,0,0,0.18)'),
  ],
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw + 1rem, 4rem)', lineHeight: 1.08, letterSpacing: '-0.03em' },
    h2: { fontFamily: fonts.display, fontWeight: 700, fontSize: 'clamp(2rem, 3vw + 0.75rem, 2.75rem)', lineHeight: 1.14, letterSpacing: '-0.025em' },
    h3: { fontFamily: fonts.display, fontWeight: 600, fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2rem)', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h4: { fontFamily: fonts.display, fontWeight: 600, fontSize: 'clamp(1.25rem, 1.5vw + 0.5rem, 1.6rem)', lineHeight: 1.3 },
    h5: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
    h6: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.65, letterSpacing: '0.005em' },
    body2: { fontSize: '0.9rem', lineHeight: 1.6 },
    overline: { fontFamily: fonts.mono, fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', backgroundColor: 'var(--app-palette-bg-elevated)', border: '1px solid var(--app-palette-divider)', borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, boxShadow: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
  },
});
```

Note: declaring custom `bg`/`label` palette nodes auto-generates `--app-palette-bg-base`, `--app-palette-label-secondary`, etc. Components consume these via `var(...)` or `theme.vars.palette.label.secondary`.

- [ ] **Step 2: Replace color vars in `src/index.css`**

Remove the `--primary-*`, `--secondary-*`, `--gradient-*`, `--shadow-glow*`, `--shadow-enterprise` blocks. Keep `--font-display/-body/-mono` and `--vh`. Add spacing/rhythm tokens used by sections:

```css
:root {
  --font-display: "Sora", system-ui, sans-serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --section-py: clamp(3.5rem, 8vw, 6rem);
  --content-max: 1180px;
  --gutter: clamp(1rem, 4vw, 2.5rem);
  --vh: 1vh;
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all clean. Visual: site still renders (sections not yet refactored — acceptable). Note any component throwing on a removed CSS var and fix in its task.

- [ ] **Step 4: Commit**

Run: `git add -A && git commit -m "feat(theme): adaptive light/dark semantic token system"`

---

### Task 2: App shell — structure, background, dividers, theme toggle wiring

**Files:**
- Modify: `src/ModernApp.tsx`
- Modify: `src/main.tsx` (ensure default color scheme attribute)

- [ ] **Step 1: Strip heavy chrome from `ModernApp.tsx`**

Remove imports/usage of `GradualBlur`, the noise-texture `Box`, the fixed radial background `Box`, and all `SectionDivider` instances. Background now comes from theme `background.default`. Reduce sections to the 6-section structure (Hero, About+Tech, Research, Projects, Experience+Certs, Contact) — keep `Suspense` + lazy + error boundary pattern. Update `<section id=...>` anchors to: `hero`, `about`, `research`, `projects`, `experience`, `contact`.

- [ ] **Step 2: Provide default scheme + vertical rhythm wrapper**

Wrap section stack so each `<section>` gets `py: 'var(--section-py)'` and inner content is capped at `var(--content-max)` centered with `var(--gutter)` padding. Keep `ThemeProvider`, `CssBaseline`, `MotionConfig`, `LenisProvider`, analytics.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run build`. Visual: page scroll length already shorter; no blur/divider/noise artifacts; no console errors for missing components (the retired files still exist; they're just unused — deletion is Task 9).

- [ ] **Step 4: Commit**

Run: `git add -A && git commit -m "refactor(shell): 6-section structure, remove decorative chrome"`

---

### Task 3: Navbar simplification + light/dark toggle

**Files:**
- Modify: `src/components/ModernNavbar.tsx`, `src/components/ModernNavbar.css`

- [ ] **Step 1: Reduce nav items to 6 anchors** matching Task 2 ids (Home/Hero, About, Research, Projects, Experience, Contact).

- [ ] **Step 2: Add a scheme toggle** using MUI `useColorScheme()` — a single icon button (sun/moon from `react-icons`) that flips `mode` between `'light'`/`'dark'`. Default `mode` follows system. Style with token vars, not hardcoded hex.

- [ ] **Step 3: Verify** `npm run typecheck && npm run build`; visual: toggle flips entire site light/dark, nav has 6 working anchors, smooth-scroll still works.

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat(nav): 6-item nav + light/dark toggle"`

---

### Task 4: Hero rebuild (retire WebGL orb)

**Files:**
- Modify: `src/components/ModernHero.tsx` and `src/components/LandingPage.tsx`
- Data: `HERO_CONTENT`

- [ ] **Step 1:** Remove all OGL/WebGL code and `WebGLErrorBoundary` usage from the hero. Replace background with a token-based CSS radial/linear gradient (tint at low alpha over `bg-base`). Keep `RotatingText` only if it renders without WebGL; otherwise replace its content with static styled text.

- [ ] **Step 2:** Lay out hero as one viewport max: name/role headline (h1, the ONE place gradient text is allowed), `HERO_CONTENT` as a `label-secondary` lede (max ~60ch), and two actions (primary → `#projects`, text → `#contact`). Mobile single column, desktop two-column optional.

- [ ] **Step 3: Verify** `npm run typecheck && npm run build`; visual: hero is one screen, no WebGL, readable in both schemes (check contrast).

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat(hero): lightweight token-based hero, retire WebGL orb"`

---

### Task 5: About + Technologies merged section

**Files:**
- Modify: `src/components/ModernAbout.tsx` (becomes the merged section)
- Reuse: `src/components/techData.ts`
- Data: `ABOUT_TEXT`, `ABOUT_QUOTES`, `technologies`

- [ ] **Step 1:** Render `ABOUT_TEXT` paragraphs in a capped measure (~68ch) using `label-primary`/`secondary`. Add an "at a glance" strip (e.g., focus areas / current role pulled from existing copy — no new facts). Fold the tech stack in as a dense skills band: small token-styled chips/icons grouped by `category` from `technologies`, replacing the old animated `Technologies.tsx` grid.

- [ ] **Step 2:** Move `ABOUT_QUOTES` into a compact rotating or static quote line (lightweight, no heavy component).

- [ ] **Step 3: Verify** `npm run typecheck && npm run build`; visual: one cohesive section, tech visible without its own full-height block.

- [ ] **Step 4: Commit** `git add -A && git commit -m "feat(about): merge About + Technologies into dense section"`

---

### Task 6: Research compact cards

**Files:** Modify `src/components/ModernResearch.tsx`. Data: `RESEARCH_PAPERS`.

- [ ] **Step 1:** Render papers as a dense grid/list of token `Card`s: title, venue/status, `keywords` as small chips, `isFirstAuthor` badge, citations. Long abstracts behind progressive disclosure ("show more"). No per-card heavy effects.
- [ ] **Step 2: Verify** `npm run typecheck && npm run build`; visual: all 5 papers scannable, equal visual weight with Projects.
- [ ] **Step 3: Commit** `git add -A && git commit -m "feat(research): compact paper cards"`

---

### Task 7: Projects dense grid

**Files:** Modify `src/components/ModernProjects.tsx`. Data: `PROJECTS`.

- [ ] **Step 1:** Responsive token `Card` grid (1 col mobile / 2–3 desktop) with image (`OptimizedImage`/`ImageSkeleton` kept), title, summary, tech chips, links. Cap visible count with a "show more" if the list is long.
- [ ] **Step 2: Verify** `npm run typecheck && npm run build`; visual: dense, aligned grid, lazy images still work.
- [ ] **Step 3: Commit** `git add -A && git commit -m "feat(projects): dense responsive project grid"`

---

### Task 8: Experience + Certifications merged section

**Files:** Modify `src/components/ModernExperience.tsx` (host); fold in `src/components/OptimizedCertifications.tsx` content. Data: `EXPERIENCES`, `CERTIFICATIONS`.

- [ ] **Step 1:** `EXPERIENCES` as a compact vertical timeline (role, org, dates, bullets). Below it, `CERTIFICATIONS` as a compact credential strip/grid of small token cards; full detail (image/credential id) in an MUI `Dialog` on click.
- [ ] **Step 2: Verify** `npm run typecheck && npm run build`; visual: two related groups in one section, far shorter than two full sections.
- [ ] **Step 3: Commit** `git add -A && git commit -m "feat(experience): merge Experience + Certifications"`

---

### Task 9: Contact condense + delete retired components

**Files:**
- Modify: `src/components/OptimizedModernContact.tsx`
- Delete: `GradualBlur.tsx`, `GlassSurface.tsx`, `StarBorder.tsx`, `ProfileCard.tsx` + `ProfileCard.css`, `SectionDivider.tsx`, `RotatingText.tsx` (if unused after Task 4), `Technologies.tsx` (if unused after Task 5), `WebGLErrorBoundary.tsx` (if unused after Task 4), and OGL-only helpers. Remove `ogl`/`maath` imports.

- [ ] **Step 1:** Condense contact to a single token-styled section: short heading + `CONTACT` links + the existing react-hook-form/Zod/EmailJS form in a capped-width card. Remove heavy decoration.
- [ ] **Step 2:** Grep for each retired component to confirm zero imports remain, then delete the files:

Run: `grep -rn "GradualBlur\|GlassSurface\|StarBorder\|ProfileCard\|SectionDivider\|WebGLErrorBoundary" src/ --include=*.tsx --include=*.ts | grep import`
Expected: no results before deleting. Then `git rm` the unused files.

- [ ] **Step 3:** Optionally drop `ogl` and `maath` from `package.json` if no remaining imports (`grep -rn "from 'ogl'\|from \"ogl\"\|maath" src/`). Update Vite `ogl-vendors` chunk only if the dep is removed.
- [ ] **Step 4: Verify** `npm run typecheck && npm run lint && npm run build`; visual: full site top-to-bottom in both schemes; confirm scroll length materially reduced and no broken imports.
- [ ] **Step 5: Commit** `git add -A && git commit -m "feat(contact): condense; remove retired decorative components"`

---

### Task 10: Final pass — CLAUDE.md + cleanup

**Files:** Modify `CLAUDE.md`; trim `src/styles/*.css`.

- [ ] **Step 1:** Trim `enterprise.css`/`performance*.css` to rules the new system still uses; remove dead selectors referencing deleted components.
- [ ] **Step 2:** Update CLAUDE.md architecture notes: 6 sections (not 8), adaptive token theme + light/dark toggle, decorative components retired, OGL removed (if removed). Keep the data-layer and chunking notes.
- [ ] **Step 3: Verify** `npm run typecheck && npm run lint && npm run build` clean; bundle smaller (`npm run build:analyze` optional).
- [ ] **Step 4: Commit** `git add -A && git commit -m "chore: trim styles, update CLAUDE.md for Phase 1"`

---

## Phase 2 (later, per section)

For each section, user supplies a 21st.dev reference. Adapt that section's layout to match, expressed entirely through the Phase 1 token system (no hardcoded hex, no reintroduced heavy decoration unless intentional). One section per iteration, verify + commit each.
