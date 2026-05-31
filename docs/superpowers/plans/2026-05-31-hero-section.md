# Hero Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the hero as a Balanced Split with a frameless "Shape Breakout" transparent-cutout portrait, the integrated research+builder one-liner replacing the rotating line, and a "Compose" first-load animation, all on the Phase 1 token system.

**Architecture:** Single-component rewrite of `ModernHero.tsx` (layout + copy + portrait treatment + Framer Motion choreography), a small easing harmonization in `ModernNavbar.tsx` so the existing nav entrance matches the hero, and deletion of the now-unused `RotatingText.tsx`. No data, theme, or `index.html` changes.

**Tech Stack:** React 18 + TypeScript, Vite, MUI v7 (CSS-vars theme), Tailwind v3, Framer Motion 10, Lenis.

**Verification model:** This repo has **no test runner**. "Verify" for every task means `npm run typecheck` clean, `npm run lint` clean (no new `src` errors — pre-existing errors exist only in vendored `.claude/skills/*.umd.js`), `npm run build` succeeds, and visual confirmation in both schemes at `http://localhost:5173/`.

**Spec:** `docs/superpowers/specs/2026-05-31-hero-section-design.md`

---

## Files

- **Modify (full rewrite):** `src/components/ModernHero.tsx` — Balanced Split layout, Shape Breakout portrait, Compose motion, copy.
- **Modify (3 small edits):** `src/components/ModernNavbar.tsx` — align the three first-load entrance `transition` easings to the reveal signature `[0.22, 1, 0.36, 1]`.
- **Delete:** `src/components/RotatingText.tsx` — unused after the hero drops it.
- **Unchanged:** `src/constants/index.js`, `src/theme/muiTheme.js`, `index.html` (preload already correct), `LandingPage.tsx`.

---

### Task 0: Pre-flight

**Files:** none (verification only)

- [ ] **Step 1: Confirm branch**

Run: `git branch --show-current`
Expected: `design-overhaul-phase1` (a feature branch; do not branch off further).

- [ ] **Step 2: Confirm dev server is serving**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/`
Expected: `200`. If not, start it: `npm run dev` (background) and re-check.

---

### Task 1: Confirm the portrait asset is actually transparent

The whole Shape Breakout treatment assumes `GadingAdityaPerdana.webp` carries an alpha channel. `sharp` is already a devDependency, so verify before building on it.

**Files:** none (verification only)

- [ ] **Step 1: Read the asset's metadata**

Run:
```bash
node -e "import('sharp').then(s=>s.default('src/assets/GadingAdityaPerdana.webp').metadata()).then(m=>console.log(JSON.stringify({format:m.format,hasAlpha:m.hasAlpha,channels:m.channels,width:m.width,height:m.height})))"
```
Expected: `hasAlpha: true` and `channels: 4` (e.g. `{"format":"webp","hasAlpha":true,"channels":4,"width":...,"height":...}`).

- [ ] **Step 2: Decide**

If `hasAlpha` is `true`: proceed to Task 2. **If `hasAlpha` is `false`:** stop and report to the user — the file is not a cutout, so Shape Breakout would render as a floating opaque rectangle. Note the reported `width`/`height` (aspect ratio) for tuning the panel in Task 2.

---

### Task 2: Rewrite `ModernHero.tsx` (Balanced Split + Shape Breakout + Compose)

**Files:**
- Modify (replace entire file): `src/components/ModernHero.tsx`

- [ ] **Step 1: Replace the file with the implementation below**

```tsx
import type { ComponentProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  SvgIcon,
} from '@mui/material';
import { GitHub, LinkedIn, Email, ArrowDownward } from '@mui/icons-material';
import heroImg from '../assets/GadingAdityaPerdana.webp';
import { HERO_CONTENT } from '../constants/index';

// Custom Google Scholar icon
const GoogleScholarIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
  </SvgIcon>
);

// New hero one-liner (component-level presentation copy; constants stay frozen).
// Research and building as peers, per the approved spec.
const HERO_ONELINER =
  'I publish AI research, and I design and build software that stands on its own.';

const SOCIAL_LINKS = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: GoogleScholarIcon, url: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', label: 'Google Scholar' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const ModernHero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersReducedMotion = useReducedMotion();

  // Mobile gets a lighter (smaller) rise; reduced-motion zeroes it.
  const rise = prefersReducedMotion ? 0 : isMobile ? 12 : 20;

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.09, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: rise },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  // Signature headline reveal: a left-to-right clip wipe (fade only under reduced-motion).
  const nameVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }
    : {
        hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.85, ease } },
      };

  const panelVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
  };

  const cutoutVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease, delay: 0.1 } },
  };

  return (
    <Box
      component="div"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: { xs: 'auto', md: '100svh' },
        // No section-specific background — inherits the shared body surface.
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={container}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left column — content */}
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            {/* Eyebrow */}
            <Box component={motion.div} variants={item}>
              <Typography
                variant="overline"
                sx={{
                  color: 'var(--app-palette-primary-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  '&::before': {
                    content: '""',
                    width: 28,
                    height: '1px',
                    bgcolor: 'currentColor',
                    opacity: 0.6,
                  },
                }}
              >
                AI Researcher
              </Typography>
            </Box>

            {/* Headline — the one allowed gradient-text accent on the site */}
            <Box component={motion.div} variants={nameVariants}>
              <Typography
                variant="h1"
                sx={{
                  mb: 2.5,
                  background:
                    'linear-gradient(120deg, var(--app-palette-text-primary) 0%, var(--app-palette-text-primary) 45%, var(--app-palette-primary-main) 80%, var(--app-palette-secondary-main) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Gading Aditya Perdana
              </Typography>
            </Box>

            {/* One-liner — replaces the retired rotating line */}
            <Box component={motion.div} variants={item}>
              <Typography
                component="p"
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(1.15rem, 1.2vw + 0.9rem, 1.5rem)',
                  lineHeight: 1.4,
                  color: 'var(--app-palette-label-primary)',
                  maxWidth: '46ch',
                  mb: 3,
                }}
              >
                {HERO_ONELINER}
              </Typography>
            </Box>

            {/* Frozen research paragraph */}
            <Box component={motion.div} variants={item}>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--app-palette-label-secondary)',
                  maxWidth: '60ch',
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.75,
                  mb: 4,
                }}
              >
                {HERO_CONTENT}
              </Typography>
            </Box>

            {/* Actions */}
            <Box
              component={motion.div}
              variants={item}
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
            >
              <Button variant="contained" size="large" href="#projects" sx={{ px: 3.5, py: 1.25 }}>
                View Projects
              </Button>
              <Button
                variant="text"
                size="large"
                href="#contact"
                endIcon={<ArrowDownward fontSize="small" />}
                sx={{ px: 2, py: 1.25, color: 'var(--app-palette-text-primary)' }}
              >
                Get in Touch
              </Button>

              <Box sx={{ display: 'flex', gap: 0.5, ml: { xs: 0, sm: 1 } }}>
                {SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <IconButton
                      key={social.label}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      aria-label={social.label}
                      sx={{
                        color: 'var(--app-palette-label-tertiary)',
                        transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        '&:hover': { color: 'var(--app-palette-primary-main)' },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Right column — Shape Breakout portrait */}
          <Box sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: 'min(300px, 78vw)', md: 'min(380px, 34vw)' },
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Tinted panel behind the cutout — adapts light/dark via color-mix over bg-elevated.
                  `top` controls how far the head/shoulders break above the panel; tune to the
                  cutout's framing (Task 1 reported the asset's aspect ratio). */}
              <Box
                component={motion.div}
                variants={panelVariants}
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: '15% 0 0 0',
                  borderRadius: '24px',
                  border: '1px solid var(--app-palette-divider)',
                  background:
                    'linear-gradient(165deg, color-mix(in srgb, var(--app-palette-primary-main) 14%, var(--app-palette-bg-elevated)) 0%, color-mix(in srgb, var(--app-palette-secondary-main) 10%, var(--app-palette-bg-elevated)) 100%)',
                  transformOrigin: 'bottom center',
                  zIndex: 0,
                }}
              />
              {/* Transparent cutout in front; drop-shadow lifts the dark suit off the panel */}
              <Box component={motion.div} variants={cutoutVariants} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Box
                  component="img"
                  src={heroImg}
                  alt="Gading Aditya Perdana"
                  loading="eager"
                  fetchPriority="high"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.35))',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no new errors in `src/` (pre-existing errors only in `.claude/skills/*.umd.js`).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Visual verification (both schemes)**

Open `http://localhost:5173/`. Confirm:
- Desktop: hero is ~one viewport; text left, portrait right; the cutout's head/shoulders break **above** the tinted panel; the dark suit reads clearly against the background (figure-ground). If the head does not clearly break the panel, tune the panel `inset` top percentage (try `12%`–`20%`).
- Toggle light/dark in the navbar: the panel re-tints and stays subtle; all text passes contrast in both schemes.
- On load the Compose plays: text staggers up, the name wipes left-to-right, the panel scales from its base, the cutout rises.
- Reduced-motion: DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload — content appears with a soft fade only (no wipe/rise/stagger).
- Mobile (narrow the window < 900px): portrait stacks on top, content below; motion is lighter but present.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModernHero.tsx
git commit -m "feat(hero): Balanced Split + Shape Breakout cutout, one-liner, Compose load animation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Harmonize the navbar first-load easing with the hero

The navbar already animates in on load; align its three entrance easings to the hero's reveal signature `[0.22, 1, 0.36, 1]` so the first load feels like one orchestrated moment. (Per-item nav stagger is intentionally not added — it would conflict with the existing magnification springs.)

**Files:**
- Modify: `src/components/ModernNavbar.tsx` (logo ~line 634, desktop nav ~line 786, theme toggle ~line 962)

- [ ] **Step 1: Logo entrance easing**

Replace:
```tsx
						transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
```
with:
```tsx
						transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
```

- [ ] **Step 2: Desktop nav entrance easing**

Replace:
```tsx
							transition={{ duration: 0.7, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
```
with:
```tsx
							transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
```

- [ ] **Step 3: Theme toggle entrance easing**

Replace:
```tsx
						transition={{ duration: 0.6, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
```
with:
```tsx
						transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
```

- [ ] **Step 4: Typecheck + build**

Run: `npm run typecheck && npm run build`
Expected: both clean.

- [ ] **Step 5: Visual verification**

Reload `http://localhost:5173/`. On first load the navbar (logo, nav group, toggle) eases in alongside the hero Compose, feeling like one sequence. No regression to scroll behavior, the liquid indicator, or magnification on hover.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModernNavbar.tsx
git commit -m "feat(nav): align first-load entrance easing with hero reveal curve

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Delete the now-unused `RotatingText` and final verification

**Files:**
- Delete: `src/components/RotatingText.tsx`

- [ ] **Step 1: Confirm no imports remain**

Run: `grep -rn "RotatingText" src/ --include=*.tsx --include=*.ts | grep import`
Expected: no output (the hero rewrite in Task 2 removed the only importer).

- [ ] **Step 2: Delete the file**

Run: `git rm src/components/RotatingText.tsx`

- [ ] **Step 3: Typecheck + lint + build**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all clean; no "cannot find module RotatingText" errors.

- [ ] **Step 4: Full-site visual pass**

Open `http://localhost:5173/`. Scroll the whole page in both light and dark: the hero looks correct, no console errors, scroll/nav still work, and no other section references the removed component.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(hero): remove unused RotatingText component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-review

- **Spec coverage:** Balanced Split + content stack (Task 2 JSX); one-liner replacing the rotating line (Task 2 `HERO_ONELINER`); Shape Breakout frameless cutout + tinted adaptive panel + breakout + drop-shadow, no status dot, no badge (Task 2 right column); Compose load animation with name wipe, panel scale, cutout rise, stagger (Task 2 variants); navbar first-load harmonized (Task 3); reduced-motion + mobile-lighter (Task 2 `prefersReducedMotion`/`isMobile` branching); colorblind/contrast and token-only colors (Task 2 `var(--app-palette-*)`, verified in Step 5); asset transparency risk (Task 1); RotatingText cleanup (Task 4). Frozen `HERO_CONTENT` rendered unchanged; `index.html` preload already correct (no task needed).
- **Placeholder scan:** none — full file in Task 2, exact edit strings in Task 3, exact commands throughout. Tunable values (panel `inset` top %, drop-shadow) are flagged as visual-tuning, not placeholders.
- **Type/name consistency:** `HERO_ONELINER`, `ease`, `container`/`item`/`nameVariants`/`panelVariants`/`cutoutVariants` are all defined and used within Task 2. Imports match usage (`useReducedMotion`, `useMediaQuery`, `useTheme`, `ComponentProps`); removed `useSystemProfile`, `RotatingText`, `useInView`, `useRef`, `RefObject` are no longer referenced.
