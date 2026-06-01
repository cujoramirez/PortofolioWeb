# About Section "Model Card" Dossier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the About section as an ML "model card" glass dossier — frozen bio as OVERVIEW, at-a-glance facts as mono-labeled detection-framed spec rows, skills as STACK, rotating quote footer — with a one-shot CV "scan" reveal echoing the hero.

**Architecture:** Rewrite `ModernAbout.tsx` to render the dossier inside a reused `LiquidGlass` card; add one isolated `DetectionFrame.tsx` accent (corner brackets + confidence tag + optional one-shot scanline). Motion is Framer Motion gated by `useReducedMotion` + `useInView({ once })`; all color via tokens; frozen data rendered verbatim.

**Tech Stack:** React 18 + TypeScript, MUI v7 (`cssVariables`, prefix `app`), Framer Motion v10, the existing `LiquidGlass` + `useGlassCapabilities`. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-01-about-section-design.md`

**Project verification (no test runner):** each task verifies with `npm run typecheck` (0 errors), targeted `npx eslint <changed files>` (no new errors — whole-repo `npm run lint` trips on pre-existing vendored `.claude/skills/*.umd.js`), `npm run build` (succeeds), plus visual at `http://localhost:5173/` in **both** themes. Commit after each task with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

**Token rules (do not violate):** No edits to `src/constants/index.js`. No `theme.palette.*` from `useTheme()` in `sx` — use `var(--app-palette-*)` / `color-mix` / `sx` string tokens (`text.primary`, `primary.main`, `divider`, `background.paper`). Mono = `var(--font-mono)`. Gradient text stays hero-only. Black shadows `rgba(0,0,0,x)` allowed. `ModernAbout` adds no `<section>`/max-width/`py` (the `ModernApp` `#about` `ContentColumn` owns those).

---

## File Structure

**Create:**
- `src/components/DetectionFrame.tsx` — reusable CV accent: corner brackets + optional confidence `tag` + optional one-shot `scan` line. One clear responsibility (the detection motif), so `ModernAbout` stays focused on content/layout.

**Rewrite:**
- `src/components/ModernAbout.tsx` — the model-card dossier (section header + `LiquidGlass` card holding header bar → OVERVIEW + spec sheet → STACK → quote footer), with the scroll-in reveal.

**Reuse unchanged:** `src/components/LiquidGlass.tsx`, `src/hooks/useGlassCapabilities.ts`, `src/components/techData.ts`, `src/constants/index.js`.

---

## Task 1: `DetectionFrame` accent component

**Files:**
- Create: `src/components/DetectionFrame.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/DetectionFrame.tsx`:

```tsx
import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface DetectionFrameProps {
  children?: ReactNode;
  /** Render a one-shot scanline sweep (top -> bottom) when `active` flips true. */
  scan?: boolean;
  /** Drives the scanline (e.g. from useInView). */
  active?: boolean;
  /** Small mono confidence-style tag (e.g. "0.98"), pinned top-right. Decorative. */
  tag?: string;
  /** Corner bracket arm length in px. */
  bracket?: number;
  sx?: SxProps<Theme>;
}

const STROKE = 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)';

const DetectionFrame = memo(function DetectionFrame({
  children,
  scan = false,
  active = false,
  tag,
  bracket = 14,
  sx,
}: DetectionFrameProps) {
  const prefersReducedMotion = useReducedMotion();
  const showScan = scan && active && !prefersReducedMotion;

  // Shared corner styling; each corner enables two of its four borders.
  const cornerBase = {
    position: 'absolute' as const,
    width: bracket,
    height: bracket,
    borderColor: STROKE,
    borderStyle: 'solid',
    borderWidth: 0,
    pointerEvents: 'none' as const,
  };

  return (
    <Box sx={[{ position: 'relative' }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}

      {/* Detection corner brackets */}
      <Box aria-hidden sx={{ ...cornerBase, top: -1, left: -1, borderTopWidth: 1.5, borderLeftWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, top: -1, right: -1, borderTopWidth: 1.5, borderRightWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, bottom: -1, left: -1, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, bottom: -1, right: -1, borderBottomWidth: 1.5, borderRightWidth: 1.5 }} />

      {/* Confidence tag */}
      {tag && (
        <Box
          aria-hidden
          component="span"
          sx={{
            position: 'absolute',
            top: -8,
            right: 8,
            px: 0.5,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            lineHeight: 1.5,
            letterSpacing: '0.05em',
            color: 'color-mix(in srgb, var(--app-palette-primary-main) 85%, var(--app-palette-text-primary))',
            bgcolor: 'var(--app-palette-bg-elevated)',
            borderRadius: '3px',
          }}
        >
          {tag}
        </Box>
      )}

      {/* One-shot scanline */}
      {showScan && (
        <motion.div
          aria-hidden
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--app-palette-secondary-main) 80%, transparent), transparent)',
            boxShadow: '0 0 12px color-mix(in srgb, var(--app-palette-secondary-main) 55%, transparent)',
          }}
        />
      )}
    </Box>
  );
});

export default DetectionFrame;
```

- [ ] **Step 2: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npx eslint src/components/DetectionFrame.tsx && npm run build 2>&1 | tail -2`
Expected: 0 type errors; lint clean; build succeeds. (No visual change yet — not imported.)

- [ ] **Step 3: Commit**

```bash
git add src/components/DetectionFrame.tsx
git commit -m "feat(about): add DetectionFrame accent (corner brackets + scan + tag)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Rewrite `ModernAbout` as the model-card dossier

**Files:**
- Rewrite: `src/components/ModernAbout.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `src/components/ModernAbout.tsx` with:

```tsx
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Chip, Typography, alpha } from '@mui/material';

import { ABOUT_TEXT, ABOUT_QUOTES } from '../constants/index';
import { technologies, type TechnologyCategory } from './techData';
import LiquidGlass from './LiquidGlass';
import DetectionFrame from './DetectionFrame';

// Order the skill groups for a stable, scannable layout
const CATEGORY_ORDER: TechnologyCategory[] = ['AI/ML', 'Backend', 'Frontend', 'Other'];

// Spec-sheet rows — presentation labels over facts already in the data layer
// (HERO_CONTENT, RESEARCH_PAPERS, the prior GLANCE_FACTS). No data is invented.
const SPEC_FIELDS: { label: string; value: string; detail?: string; tag: string }[] = [
  {
    label: 'FOCUS',
    value: 'Computer Vision · Deep Learning',
    detail: 'Vision Transformers · Ensemble Learning · Model Calibration',
    tag: '0.99',
  },
  { label: 'PUBLICATIONS', value: '5 · 4 first-author', tag: '0.98' },
  { label: 'EDUCATION', value: 'BINUS University · Computer Science', tag: '0.97' },
  { label: 'PROGRAM', value: 'Apple Developer Academy Scholar (2026)', tag: '0.96' },
];

const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'text.secondary',
} as const;

const ModernAbout = () => {
  const paragraphs = useMemo(
    () => ABOUT_TEXT.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    [],
  );

  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((category) => ({
        category,
        items: technologies.filter((t) => t.category === category),
      })).filter((g) => g.items.length > 0),
    [],
  );

  const prefersReducedMotion = useReducedMotion();
  const reduce = !!prefersReducedMotion;

  // One-shot reveal when the card scrolls into view.
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, margin: '-15% 0px' });

  // Per-section reveal props (static when reduced motion).
  const reveal = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  });

  // Rotating quote (single visible; paused for reduced motion).
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    if (reduce || ABOUT_QUOTES.length <= 1) return;
    const id = setInterval(() => {
      setQuoteIndex((idx) => (idx + 1) % ABOUT_QUOTES.length);
    }, 6000);
    return () => clearInterval(id);
  }, [reduce]);
  const quote = ABOUT_QUOTES[quoteIndex];

  return (
    <Box ref={rootRef}>
      {/* Section header (outside the card) */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          Get to know me
        </Typography>
        <Typography variant="h2" sx={{ color: 'text.primary' }}>
          About
        </Typography>
      </Box>

      {/* The dossier card */}
      <LiquidGlass component="div" intensity="subtle" blur={12} radius={20} sx={{ p: { xs: 2.5, md: 4 } }}>
        <DetectionFrame scan active={inView}>
          {/* Header bar */}
          <motion.div {...reveal(0)}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 2,
                flexWrap: 'wrap',
                pb: 1.5,
                mb: { xs: 3, md: 4 },
                borderBottom: '1px solid var(--app-palette-divider)',
              }}
            >
              <Box aria-hidden component="span" sx={{ ...MONO_LABEL }}>
                // model card
              </Box>
              <Box component="span" sx={{ ...MONO_LABEL, letterSpacing: '0.1em' }}>
                AI Researcher · Computer Vision
              </Box>
            </Box>
          </motion.div>

          {/* Body: OVERVIEW + spec sheet */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 22rem)' },
              gap: { xs: 4, md: 6 },
              alignItems: 'start',
            }}
          >
            {/* OVERVIEW */}
            <motion.div {...reveal(1)}>
              <Typography component="div" sx={{ ...MONO_LABEL, mb: 1.5 }}>
                OVERVIEW
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '68ch' }}>
                {paragraphs.map((p, i) => (
                  <Typography
                    key={i}
                    variant={i === 0 ? 'body1' : 'body2'}
                    sx={{ color: i === 0 ? 'text.primary' : 'text.secondary', lineHeight: 1.75 }}
                  >
                    {p}
                  </Typography>
                ))}
              </Box>
            </motion.div>

            {/* Spec sheet */}
            <motion.div {...reveal(2)}>
              <Box component="dl" sx={{ m: 0, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
                {SPEC_FIELDS.map((f) => (
                  <DetectionFrame key={f.label} tag={f.tag} sx={{ px: 1.5, py: 1.25 }}>
                    <Typography component="dt" sx={{ ...MONO_LABEL, fontSize: '0.65rem', letterSpacing: '0.18em' }}>
                      {f.label}
                    </Typography>
                    <Typography component="dd" sx={{ m: 0, mt: 0.5, color: 'text.primary', fontWeight: 600, fontSize: '0.9rem' }}>
                      {f.value}
                    </Typography>
                    {f.detail && (
                      <Typography component="dd" sx={{ m: 0, mt: 0.25, color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
                        {f.detail}
                      </Typography>
                    )}
                  </DetectionFrame>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* STACK */}
          <motion.div {...reveal(3)}>
            <Box sx={{ mt: { xs: 4, md: 5 }, pt: 3, borderTop: '1px solid var(--app-palette-divider)' }}>
              <Typography component="div" sx={{ ...MONO_LABEL, mb: 2.5 }}>
                STACK
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {grouped.map(({ category, items }) => (
                  <Box
                    key={category}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '110px 1fr' },
                      gap: { xs: 1, sm: 2 },
                      alignItems: 'start',
                    }}
                  >
                    <Typography sx={{ ...MONO_LABEL, fontSize: '0.7rem', letterSpacing: '0.12em', pt: { sm: 0.75 } }}>
                      {category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {items.map((tech) => {
                        const Icon = tech.icon;
                        return (
                          <Chip
                            key={tech.name}
                            icon={<Box component={Icon} aria-hidden sx={{ color: `${tech.color} !important`, fontSize: '1rem' }} />}
                            label={tech.name}
                            variant="outlined"
                            sx={{
                              borderColor: 'color-mix(in srgb, var(--app-palette-divider) 40%, transparent)',
                              bgcolor: 'background.paper',
                              color: 'text.primary',
                              fontWeight: 500,
                              '& .MuiChip-icon': { ml: 1 },
                              transition: 'border-color 0.2s ease, background-color 0.2s ease',
                              '&:hover': { borderColor: alpha(tech.color, 0.6), bgcolor: alpha(tech.color, 0.06) },
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Quote footer */}
          <motion.div {...reveal(4)}>
            <Box
              component="blockquote"
              sx={{
                m: 0,
                mt: { xs: 4, md: 5 },
                pt: 3,
                borderTop: '1px solid var(--app-palette-divider)',
                display: 'flex',
                gap: 1.5,
                alignItems: 'flex-start',
              }}
            >
              <Box aria-hidden component="span" sx={{ ...MONO_LABEL, color: 'color-mix(in srgb, var(--app-palette-primary-main) 70%, transparent)', mt: 0.4 }}>
                // note
              </Box>
              <Box sx={{ flex: 1, minHeight: 64 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Typography variant="body1" sx={{ color: 'text.primary', fontStyle: 'italic', lineHeight: 1.6 }}>
                      &ldquo;{quote.text}&rdquo;
                    </Typography>
                    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                      — {quote.author}
                    </Typography>
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>
        </DetectionFrame>
      </LiquidGlass>
    </Box>
  );
};

export default memo(ModernAbout);
```

- [ ] **Step 2: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npx eslint src/components/ModernAbout.tsx && npm run build 2>&1 | tail -2`
Expected: 0 type errors; lint clean; build succeeds.

- [ ] **Step 3: Visual check (both themes)**

At `http://localhost:5173/#about`: the section reads as a glass "model card" — header bar (`// model card` + role), OVERVIEW (the 3 frozen paragraphs) beside a spec sheet of 4 detection-framed rows with confidence tags, a STACK band of grouped brand-icon chips, and the rotating quote footer. On first scroll-in the scanline sweeps once and sections fade up; afterward static. Legible + AA in **dark and light**; card adapts; chips/quote intact.

- [ ] **Step 4: Commit**

```bash
git add src/components/ModernAbout.tsx
git commit -m "feat(about): model-card dossier (glass card + detection motif + scan reveal)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Final verification + live tuning

**Files:** none expected (tuning only if an issue is found)

- [ ] **Step 1: Reduced-motion + responsive + perf pass**

- Toggle OS "Reduce motion" (or DevTools rendering emulation): the scanline and fade-ups must NOT play — everything renders static; the quote stops rotating.
- Narrow to mobile width: the 2-up collapses to a single column (OVERVIEW above spec sheet), chips wrap, brackets/tags stay legible.
- Scroll through About with DevTools Performance while ColorBends animates behind the card: confirm no sustained jank from the card's `backdrop-filter`. If janky on mobile, drop the card to tint-only by passing the no-blur path — change `<LiquidGlass ... blur={12} ...>` to `blur={0}` (the component then renders the `--no-blur` tint) and re-verify. Record the choice.

- [ ] **Step 2: Both-theme contrast pass**

In light and dark: mono labels/tags are visible-but-secondary, OVERVIEW + spec values are AA, detection brackets read as accents (not noise). If brackets are too loud, lower the `STROKE` mix in `DetectionFrame.tsx` (e.g. `45%`); if tags clash, reduce their color mix. Re-verify.

- [ ] **Step 3: Full build gate**

Run: `npm run typecheck && npx eslint src/components/DetectionFrame.tsx src/components/ModernAbout.tsx && npm run build 2>&1 | tail -3`
Expected: 0 type errors; lint clean; build succeeds.

- [ ] **Step 4: Commit any tuning**

```bash
git add -A
git commit -m "polish(about): tune dossier glass/brackets after review" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
(Skip if no changes were needed.)

---

## Self-Review (completed during planning)

**Spec coverage:** concept/model-card framing → Task 2 layout; surface = LiquidGlass card → Task 2 (`<LiquidGlass intensity="subtle" blur={12}>`); structure (header bar → OVERVIEW + spec → STACK → quote) → Task 2; content mapping (OVERVIEW/FOCUS/PUBLICATIONS/EDUCATION/PROGRAM/STACK/quote) → `SPEC_FIELDS` + render in Task 2; CV motif (brackets + tags + one-shot scan) → Task 1 `DetectionFrame` + Task 2 usage; motion one-shot + reduced-motion-static → `reveal()` + `useInView({once})` + `showScan` gate; glass/tokens/perf (device-tiered blur, tint fallback) → reuse `LiquidGlass`/`useGlassCapabilities` + Task 3 fallback; component architecture (rewrite + isolated DetectionFrame) → Tasks 1–2; a11y (`h2`, `<dl>`, aria-hidden decoration) → Task 2; responsive collapse + verification → Task 3. No gaps.

**Placeholder scan:** no TBD/TODO; both files are complete; every step has full code or an exact command + expected result.

**Type/name consistency:** `DetectionFrameProps` (`children`/`scan`/`active`/`tag`/`bracket`/`sx`) defined in Task 1 and used in Task 2 (`scan active={inView}`, `tag={f.tag}`); `SPEC_FIELDS` item shape (`label`/`value`/`detail?`/`tag`) matches its render; `reveal(i)` returns `initial`/`animate`/`transition` spread onto `motion.div`/`motion.dl`; `LiquidGlass` props (`component`/`intensity`/`blur`/`radius`/`sx`) match its definition; `MONO_LABEL` reused consistently.

## Notes / risks
- **Large `backdrop-filter` over animated ColorBends:** mitigated by device-tiered blur + the `blur={0}` tint-only fallback (Task 3).
- **Bracket/tag busyness:** card + 4 spec rows each carry brackets; keep `STROKE`/tag colors low-emphasis (Task 3 lever).
- **Frozen-data discipline:** `SPEC_FIELDS` values restate facts in the data layer; if any value can't be traced there, drop it rather than invent.
- **Dev-server gotcha:** no new dep here, but if `node_modules/.vite` goes stale → stop dev, `rm -rf node_modules/.vite`, restart.
```
