# Navbar Liquid Glass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every navbar surface an Apple-style "liquid glass" material (frost + token tint + edge-light + pointer specular, with progressive SVG edge-refraction) and fix three mobile issues (duplicate back-to-top, low-contrast + mismatched theme-toggle/menu buttons).

**Architecture:** A single reusable `LiquidGlass` surface component (driven by a `useGlassCapabilities` hook and a one-time `GlassFilters` SVG) defines the material once; the navbar, mobile menu, controls, and back-to-top all consume it or a lightweight `.glass-sheen` finish. CSS `backdrop-filter` does the frost (real page refraction, no second WebGL context); an SVG `feDisplacementMap` adds edge lensing where supported and silently degrades to frost elsewhere. All token-driven (light/dark), reduced-motion-gated, and per-device-tiered.

**Tech Stack:** React 18 + TypeScript, MUI v7 (`cssVariables`, prefix `app`), Framer Motion v10, CSS `backdrop-filter` + SVG filters. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-01-navbar-liquid-glass-design.md`

**Project verification (no test runner exists):** every task verifies with `npm run typecheck` (0 errors), `npm run lint` (no new `src` errors — pre-existing errors only in vendored `.claude/skills/*.umd.js`), `npm run build` (succeeds), plus a visual check at `http://localhost:5173/` in **both** themes. Commit after each task with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

**Token rules (do not violate):** No edits to `src/constants/index.js`. No `theme.palette.*` from `useTheme()` in `sx`. Use `color-mix(in srgb, var(--app-palette-*) N%, transparent)` for translucency; scheme-specific values via the `[data-mui-color-scheme='light']` selector. Black shadows `rgba(0,0,0,x)` are allowed.

---

## File Structure

**Create:**
- `src/hooks/useGlassCapabilities.ts` — capability/tier detection (blur? refraction? reactive specular? max blur px).
- `src/components/GlassFilters.tsx` — hidden one-time SVG `<filter id="liquid-glass">` defs.
- `src/components/LiquidGlass.tsx` — reusable glass surface component.
- `src/components/liquidGlass.css` — shared material styles (`.liquid-glass`, `.glass-sheen`, fallbacks, reduced-motion).

**Modify:**
- `src/components/ModernNavbar.tsx` — bar surface → `LiquidGlass`; mount `GlassFilters`; pill hover + active indicator → `.glass-sheen`; brand chip → `.glass-sheen`; theme toggle → glass (44px on mobile/tablet); remove the duplicate FAB; symmetric mobile cluster.
- `src/components/StaggeredMenu.tsx` — panel surface + toggle button → shared recipe, 44px toggle.
- `src/components/BackToTop.tsx` — align the kept back-to-top to the glass recipe.
- `src/components/ModernNavbar.css` — remove dead `.navbar-glass-*` rules.

---

## Task 1: Glass foundations (hook + SVG filter + CSS)

**Files:**
- Create: `src/hooks/useGlassCapabilities.ts`
- Create: `src/components/GlassFilters.tsx`
- Create: `src/components/liquidGlass.css`

- [ ] **Step 1: Create the capabilities hook**

Create `src/hooks/useGlassCapabilities.ts`:

```ts
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useSystemProfile } from '../components/useSystemProfile';

export interface GlassCapabilities {
  /** backdrop-filter: blur() is supported and the device tier allows it. */
  canBlur: boolean;
  /** backdrop-filter: url(#…) refraction is supported (Chromium-only today). */
  canRefract: boolean;
  /** Pointer-reactive specular is allowed (fine pointer + motion + not low tier). */
  reactiveSpecular: boolean;
  /** Device-capped blur radius in px (0 when blur is disabled). */
  maxBlur: number;
}

const supportsBackdrop = (): boolean => {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return (
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
};

// backdrop-filter: url(#id) is Chromium-only today; probe directly.
const supportsRefraction = (): boolean => {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('backdrop-filter', 'url(#liquid-glass)');
};

export function useGlassCapabilities(): GlassCapabilities {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier, deviceType } = useSystemProfile();

  // SSR-safe: probe support on the client after mount.
  const [support, setSupport] = useState({ blur: false, refract: false });
  useEffect(() => {
    setSupport({ blur: supportsBackdrop(), refract: supportsRefraction() });
  }, []);

  const lowTier = performanceTier === 'low';
  const midTier = performanceTier === 'mid';

  const canBlur = support.blur && !lowTier;
  const canRefract = canBlur && support.refract;
  const reactiveSpecular = canBlur && deviceType === 'desktop' && !prefersReducedMotion;

  let maxBlur = 0;
  if (canBlur) {
    if (deviceType === 'mobile') maxBlur = 8;
    else if (deviceType === 'tablet' || midTier) maxBlur = 12;
    else maxBlur = 18;
  }

  return { canBlur, canRefract, reactiveSpecular, maxBlur };
}
```

- [ ] **Step 2: Create the SVG filter defs**

Create `src/components/GlassFilters.tsx`:

```tsx
import { memo } from 'react';

/**
 * One-time hidden SVG filter for the liquid-glass edge refraction.
 * feTurbulence -> feDisplacementMap bends the backdrop; STATIC (no animation)
 * so it costs nothing per frame. Referenced via
 * `backdrop-filter: ... url(#liquid-glass)` (Chromium; frost fallback elsewhere).
 * Mount exactly once.
 */
const GlassFilters = memo(() => (
  <svg
    aria-hidden="true"
    focusable="false"
    width="0"
    height="0"
    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
  >
    <defs>
      <filter
        id="liquid-glass"
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={2} seed={7} result="noise" />
        <feGaussianBlur in="noise" stdDeviation={1.2} result="softNoise" />
        <feDisplacementMap in="SourceGraphic" in2="softNoise" scale={10} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  </svg>
));
GlassFilters.displayName = 'GlassFilters';
export default GlassFilters;
```

- [ ] **Step 3: Create the shared material CSS**

Create `src/components/liquidGlass.css`:

```css
/* Liquid-glass material: frost + token tint + edge light + specular + optional refraction.
   Tunables are CSS vars so callers (and live tuning) can override per surface. */

.liquid-glass {
  --lg-blur: 18px;
  --lg-radius: 14px;
  --lg-tint: color-mix(in srgb, var(--app-palette-bg-elevated) 62%, transparent);
  --lg-border: color-mix(in srgb, var(--app-palette-divider) 60%, transparent);
  --lg-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  --lg-rim: rgba(255, 255, 255, 0.5);
  --lg-spec: 0.7;
  --gx: 50%;
  --gy: 0%;

  position: relative;
  isolation: isolate;
  border-radius: var(--lg-radius);
  background-color: var(--lg-tint);
  border: 1px solid var(--lg-border);
  box-shadow: var(--lg-shadow), inset 0 1px 0 var(--lg-rim);
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(170%);
  backdrop-filter: blur(var(--lg-blur)) saturate(170%);
}

/* Static top-edge glint */
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(180deg, var(--lg-rim), transparent 42%);
  opacity: 0.32;
  z-index: 0;
}

/* Reactive specular (follows pointer; idles via CSS transition) */
.liquid-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(60% 80% at var(--gx) var(--gy), var(--lg-rim), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}
.liquid-glass--interactive:hover::after,
.liquid-glass--interactive:focus-within::after {
  opacity: var(--lg-spec);
}

/* Keep real content above the glint layers */
.liquid-glass > * {
  position: relative;
  z-index: 1;
}

/* Chromium-only refraction enhancement */
.liquid-glass--refract {
  backdrop-filter: blur(var(--lg-blur)) saturate(170%) url(#liquid-glass);
}

/* No backdrop-filter support OR low tier -> readable near-solid fallback */
.liquid-glass--no-blur {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  --lg-tint: color-mix(in srgb, var(--app-palette-bg-elevated) 92%, transparent);
}
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .liquid-glass {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --lg-tint: color-mix(in srgb, var(--app-palette-bg-elevated) 92%, transparent);
  }
}

/* Light scheme: white sheen reads faintly; lean on border + shadow, brighten rim slightly */
[data-mui-color-scheme='light'] .liquid-glass,
[data-mui-color-scheme='light'] .glass-sheen {
  --lg-border: color-mix(in srgb, var(--app-palette-divider) 95%, transparent);
  --lg-shadow: 0 8px 28px rgba(0, 0, 0, 0.10);
  --lg-rim: rgba(255, 255, 255, 0.8);
}

/* Solid element with a glass "finish": rim + hover sheen, NO backdrop blur
   (used over the already-frosted bar to avoid nested/costly backdrop-filters). */
.glass-sheen {
  --lg-rim: rgba(255, 255, 255, 0.5);
  --lg-spec: 0.55;
  --gx: 50%;
  --gy: 0%;
  position: relative;
  isolation: isolate;
  box-shadow: inset 0 1px 0 var(--lg-rim);
}
.glass-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(60% 80% at var(--gx) var(--gy), var(--lg-rim), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 0;
}
.glass-sheen--interactive:hover::after,
.glass-sheen--interactive:focus-within::after {
  opacity: var(--lg-spec);
}
.glass-sheen > * {
  position: relative;
  z-index: 1;
}

/* Reduced motion -> no reactive specular */
@media (prefers-reduced-motion: reduce) {
  .liquid-glass::after,
  .glass-sheen::after {
    display: none;
  }
}
```

- [ ] **Step 4: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds. (No visual change yet — nothing imports these files.)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useGlassCapabilities.ts src/components/GlassFilters.tsx src/components/liquidGlass.css
git commit -m "feat(navbar): add liquid-glass foundations (capabilities hook, SVG filter, material CSS)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: `LiquidGlass` surface component

**Files:**
- Create: `src/components/LiquidGlass.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/LiquidGlass.tsx`:

```tsx
import { forwardRef, memo, useCallback, useRef } from 'react';
import type { CSSProperties, ElementType, MutableRefObject, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useGlassCapabilities } from '../hooks/useGlassCapabilities';
import './liquidGlass.css';

export interface LiquidGlassProps {
  children?: ReactNode;
  /** Visual weight: 'bold' = brighter specular, 'subtle' = lighter. */
  intensity?: 'bold' | 'subtle';
  /** Corner radius override (px). */
  radius?: number;
  /** Requested blur (px) before device capping. Defaults to 18. */
  blur?: number;
  /** Enable pointer-reactive specular (auto-gated to desktop + motion). */
  interactive?: boolean;
  component?: ElementType;
  className?: string;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
}

const BOLD_SPEC = 0.85;
const SUBTLE_SPEC = 0.45;

const LiquidGlass = memo(
  forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
    { children, intensity = 'bold', radius, blur, interactive = false, component, className, sx, style },
    ref,
  ) {
    const { canBlur, canRefract, reactiveSpecular, maxBlur } = useGlassCapabilities();
    const elRef = useRef<HTMLElement | null>(null);

    const wantsInteractive = interactive && reactiveSpecular;

    const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--gx', `${x}%`);
      el.style.setProperty('--gy', `${y}%`);
    }, []);

    const handlePointerLeave = useCallback(() => {
      const el = elRef.current;
      if (!el) return;
      el.style.setProperty('--gx', '50%');
      el.style.setProperty('--gy', '0%');
    }, []);

    const effectiveBlur = canBlur ? Math.min(blur ?? 18, maxBlur) : 0;

    const classes = [
      'liquid-glass',
      canRefract ? 'liquid-glass--refract' : '',
      wantsInteractive ? 'liquid-glass--interactive' : '',
      canBlur ? '' : 'liquid-glass--no-blur',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const cssVars = {
      '--lg-spec': intensity === 'bold' ? BOLD_SPEC : SUBTLE_SPEC,
      '--lg-blur': `${effectiveBlur}px`,
      ...(radius != null ? { '--lg-radius': `${radius}px` } : {}),
    } as CSSProperties;

    const setRefs = (node: HTMLElement | null) => {
      elRef.current = node;
      if (typeof ref === 'function') ref(node as HTMLDivElement);
      else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement;
    };

    return (
      <Box
        ref={setRefs}
        component={component}
        className={classes}
        onPointerMove={wantsInteractive ? handlePointerMove : undefined}
        onPointerLeave={wantsInteractive ? handlePointerLeave : undefined}
        style={{ ...cssVars, ...style }}
        sx={sx}
      >
        {children}
      </Box>
    );
  }),
);

LiquidGlass.displayName = 'LiquidGlass';
export default LiquidGlass;
```

- [ ] **Step 2: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds. (Still no visual change — not yet consumed.)

- [ ] **Step 3: Commit**

```bash
git add src/components/LiquidGlass.tsx
git commit -m "feat(navbar): add reusable LiquidGlass surface component" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Apply glass to the top bar + mount the filter

**Files:**
- Modify: `src/components/ModernNavbar.tsx`

The bar today is `src/components/ModernNavbar.tsx:633-643` — a `<Box>` with `backgroundColor: alpha(pal.background.paper, trigger ? 0.95 : 0.9)`, a `borderBottom`, and box-shadows, wrapping the `<Toolbar>` and progress bar.

- [ ] **Step 1: Import `LiquidGlass` and `GlassFilters`**

In the import block near `import './ModernNavbar.css';` and `import { StaggeredMenu } from './StaggeredMenu';` (around line 138-139), add:

```tsx
import LiquidGlass from './LiquidGlass';
import GlassFilters from './GlassFilters';
```

- [ ] **Step 2: Replace the bar surface `<Box>` with `LiquidGlass`**

Find (around lines 633-643):

```tsx
				<Box
					sx={{
						width: '100%',
						backgroundColor: alpha(pal.background.paper, trigger ? 0.95 : 0.9),
						borderBottom: `1px solid ${alpha(pal.divider, 0.8)}`,
						boxShadow: trigger
							? `0 8px 24px ${alpha(pal.common.black, 0.12)}`
							: `0 4px 16px ${alpha(pal.common.black, 0.06)}`,
						transition: 'background-color 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
					}}
				>
```

Replace with (full-width bar: no radius, bottom border only; scroll `trigger` intensifies tint + shadow via inline CSS vars):

```tsx
				<LiquidGlass
					component="div"
					intensity="bold"
					interactive
					style={{
						['--lg-tint' as string]: trigger
							? 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)'
							: 'color-mix(in srgb, var(--app-palette-bg-elevated) 62%, transparent)',
						['--lg-shadow' as string]: trigger
							? '0 8px 24px rgba(0,0,0,0.14)'
							: '0 4px 16px rgba(0,0,0,0.06)',
					}}
					sx={{
						width: '100%',
						borderRadius: 0,
						borderTop: 'none',
						borderLeft: 'none',
						borderRight: 'none',
						borderBottom: '1px solid var(--lg-border)',
						transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
					}}
				>
```

- [ ] **Step 3: Close the new element**

The original closing `</Box>` for that surface is at line 1038 (just after the progress-bar `motion.div`, before `</AppBar>`). Change that closing `</Box>` to `</LiquidGlass>`.

- [ ] **Step 4: Mount `GlassFilters` once**

Immediately after the opening `<>` of the component's returned fragment (line 614, before `<AppBar`), add:

```tsx
			<GlassFilters />
```

- [ ] **Step 5: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 6: Visual check (both themes)**

Start `npm run dev`, open `http://localhost:5173/`. Confirm: the bar now reads as frosted glass over content and the `ColorBends` background; text stays clearly legible (AA) in **dark and light**; the bar tint/shadow deepen slightly when scrolled; in Chrome the rim shows a faint refractive warp; on hover across the bar a soft specular sheen tracks the pointer (desktop). If a 504 "Outdated Optimize Dep" blank page appears, stop dev, `rm -rf node_modules/.vite`, restart.

- [ ] **Step 7: Commit**

```bash
git add src/components/ModernNavbar.tsx
git commit -m "feat(navbar): liquid-glass top bar + mount glass SVG filter" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Nav pills + active indicator → glass finish (desktop)

**Files:**
- Modify: `src/components/ModernNavbar.tsx`

These elements sit on the already-frosted bar, so they use `.glass-sheen` (rim + hover sheen, **no** nested backdrop-filter).

- [ ] **Step 1: Make the active "liquid indicator" a glass lozenge**

Find the indicator `motion.div` (around lines 815-831). Replace its `style` object with a glass-lozenge look (add `className`, keep the spring-driven `left`/`width`/`opacity`):

```tsx
								<motion.div
									className="glass-sheen"
									style={{
										position: 'absolute',
										top: '50%',
										left: springX,
										width: springWidth,
										height: '42px',
										transform: 'translateY(-50%)',
										background: `linear-gradient(135deg, ${alpha(pal.primary.main, 0.18)}, ${alpha(pal.secondary.main, 0.12)})`,
										borderRadius: '11px',
										opacity: springOpacity,
										zIndex: 0,
										boxShadow: `0 0 16px ${alpha(pal.primary.main, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.35)`,
										border: `1px solid ${alpha(pal.primary.main, 0.22)}`,
									}}
									transition={{ type: 'spring', stiffness: 260, damping: 32 }}
								/>
```

(Note: `alpha(pal.*)` here is acceptable — `pal` is the resolved active-scheme palette per the documented pattern, not `useTheme().palette`.)

- [ ] **Step 2: Give hovered pills a glass finish**

Find the pill `content` Box (around lines 854-903). On its `sx`, change the hovered `background`/`boxShadow` and add the `.glass-sheen--interactive` class so hover shows a sheen. Update the `className` from `"nav-btn"` to `"nav-btn glass-sheen glass-sheen--interactive"`, and replace the hovered `background`/`boxShadow` lines:

```tsx
											className="nav-btn glass-sheen glass-sheen--interactive"
```

and within the same `sx`, replace:

```tsx
												background: isHovered
													? alpha(pal.primary.main, 0.08)
													: 'transparent',
												boxShadow: isHovered
													? `0 1px 4px ${alpha(pal.primary.main, 0.12)}`
													: 'none',
```

with:

```tsx
												background: isHovered
													? `color-mix(in srgb, var(--app-palette-primary-main) 10%, transparent)`
													: 'transparent',
												boxShadow: isHovered
													? `0 1px 6px ${alpha(pal.primary.main, 0.14)}, inset 0 1px 0 rgba(255,255,255,0.30)`
													: 'none',
```

- [ ] **Step 3: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 4: Visual check (both themes, desktop width)**

The active-section indicator reads as a translucent glass lozenge that glides between items; hovering a nav item shows a soft glass sheen + crisp rim. Scroll-spy still tracks the active section; the magnification dock still works. Legible in both themes.

- [ ] **Step 5: Commit**

```bash
git add src/components/ModernNavbar.tsx
git commit -m "feat(navbar): glass finish on nav pills + active indicator" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Brand chip glass finish + desktop theme toggle glass

**Files:**
- Modify: `src/components/ModernNavbar.tsx`

There are two brand-chip blocks (the `magnificationDisabled` branch ~688-709 and the magnified branch ~760-781) and the theme-toggle `IconButton` (~993-1019). The brand keeps its solid primary gradient (brand identity) and gains a glass finish; the toggle becomes a real glass control.

- [ ] **Step 1: Add the glass finish to BOTH brand "G" chips**

In each of the two brand chip `<Box>` elements (the one rendering the letter `G`), add `className="glass-sheen glass-sheen--interactive"` and add an inset highlight to its existing `boxShadow`. For the `magnificationDisabled` branch (~689-707), change the chip `<Box>` opening to include:

```tsx
									className="glass-sheen glass-sheen--interactive"
```

and append `, inset 0 1px 0 rgba(255,255,255,0.4)` to its `boxShadow` value (both the base and the `'&:hover'` boxShadow). Do the identical change to the magnified-branch chip `<Box>` (~761-779).

- [ ] **Step 2: Convert the theme toggle to a glass control**

Find the theme-toggle `IconButton` (~993-1019). Wrap it in `LiquidGlass` and strip the button's own border/background so the glass wrapper is the surface. Replace:

```tsx
						<IconButton
							onClick={toggleColorScheme}
							aria-label="Toggle light/dark theme"
							sx={{
								width: 40,
								height: 40,
								borderRadius: '10px',
								color: 'text.secondary',
								border: '1px solid',
								borderColor: 'divider',
								backgroundColor: 'transparent',
								transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
								'&:hover': {
									color: 'primary.light',
									borderColor: 'primary.main',
									backgroundColor: 'action.hover',
								},
							}}
						>
							{/* Before hydration `mode` is undefined; render a stable fallback icon
							    (dark = default scheme) to avoid a flash/crash. */}
							{resolvedMode === 'light' ? (
								<DarkMode sx={{ fontSize: '1.25rem' }} />
							) : (
								<LightMode sx={{ fontSize: '1.25rem' }} />
							)}
						</IconButton>
```

with:

```tsx
						<LiquidGlass
							component="div"
							intensity="bold"
							interactive
							radius={12}
							sx={{ width: CTRL_SIZE, height: CTRL_SIZE, display: 'inline-flex' }}
						>
							<IconButton
								onClick={toggleColorScheme}
								aria-label="Toggle light/dark theme"
								sx={{
									width: '100%',
									height: '100%',
									borderRadius: '12px',
									color: 'text.primary',
									backgroundColor: 'transparent',
									transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
									'&:hover': { color: 'primary.light', backgroundColor: 'transparent' },
								}}
							>
								{/* Before hydration `mode` is undefined; render a stable fallback icon
								    (dark = default scheme) to avoid a flash/crash. */}
								{resolvedMode === 'light' ? (
									<DarkMode sx={{ fontSize: '1.25rem' }} />
								) : (
									<LightMode sx={{ fontSize: '1.25rem' }} />
								)}
							</IconButton>
						</LiquidGlass>
```

- [ ] **Step 3: Define the shared control-size constants**

Near `NAV_ITEMS` (top of file, ~line 154), add module-level constants used by the toggle (this task) and the mobile cluster (Task 8):

```tsx
// Shared sizing for the top-right control cluster (theme toggle + mobile menu button).
const CTRL_SIZE = 44; // px — equal-sized, >=44px touch target
const CTRL_GAP = 12; // px — gap between toggle and menu button on mobile/tablet
```

- [ ] **Step 4: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 5: Visual check (both themes, desktop)**

The "G" chip keeps its blue identity but now has a glossy rim/hover sheen. The theme toggle is a clearly visible 44px glass control in **both** themes (no more faint outline), icon at full contrast, and the dark/light View-Transitions circular reveal still fires on click.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModernNavbar.tsx
git commit -m "feat(navbar): glass finish on brand chip + glass theme toggle" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Remove the duplicate back-to-top + align `BackToTop` to the recipe

**Files:**
- Modify: `src/components/ModernNavbar.tsx`
- Modify: `src/components/BackToTop.tsx`

`ModernApp.tsx` renders `<BackToTop />` (bottom-right glass Fab) AND `ModernNavbar` renders its own FAB (bottom-left, blue) for mobile/tablet → two buttons. Keep `BackToTop`, delete the navbar FAB.

- [ ] **Step 1: Delete the navbar FAB block**

In `src/components/ModernNavbar.tsx`, remove the entire scroll-to-top FAB block (around lines 1070-1097):

```tsx
				{/* Scroll to top FAB for mobile/tablet */}
				{(isMobileDevice || isTabletDevice) && (
					<Zoom in={trigger}>
						<Fab
							onClick={() => scrollToSection('#hero')}
							size="medium"
							aria-label="Scroll to top"
							sx={{
								/* …all FAB sx… */
							}}
						>
							<KeyboardArrowUp />
						</Fab>
					</Zoom>
				)}
```

(Delete the whole block from the `{/* Scroll to top FAB … */}` comment through its closing `)}`.)

- [ ] **Step 2: Remove now-unused imports**

In the MUI import (lines 24-32) remove `Fab` and `Zoom`. In the icons import (lines 34-44) remove `KeyboardArrowUp`. Verify none are used elsewhere in the file first:

Run: `grep -nE "\b(Fab|Zoom|KeyboardArrowUp)\b" src/components/ModernNavbar.tsx`
Expected after deletion: no matches. (If any remain, keep that import.)

- [ ] **Step 3: Align `BackToTop` to the glass recipe**

In `src/components/BackToTop.tsx`, wrap the `<Fab>` in `LiquidGlass` and strip the Fab's own glass styling (the wrapper now provides it). Add the import at the top:

```tsx
import LiquidGlass from './LiquidGlass';
```

Replace the `<Fab …>…</Fab>` (lines 42-77) with:

```tsx
          <LiquidGlass
            component="div"
            intensity="bold"
            interactive
            sx={{ borderRadius: '50%', display: 'inline-flex' }}
          >
            <Fab
              onClick={scrollToTop}
              size="medium"
              aria-label="Scroll to top"
              sx={{
                background: 'transparent',
                boxShadow: 'none',
                color: 'text.primary',
                transition: 'color 0.3s ease, transform 0.3s ease',
                '&:hover': {
                  background: 'transparent',
                  color: 'primary.main',
                  transform: 'translateY(-3px)',
                },
                '&:active': { transform: 'translateY(0)' },
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </LiquidGlass>
```

Then remove the now-unused `reduceEffects` logic if it is no longer referenced:

Run: `grep -n "reduceEffects" src/components/BackToTop.tsx`
Expected after edit: no matches → delete the line `const reduceEffects = performanceTier === 'low';` and the now-unused `useSystemProfile` import + `performanceTier` destructure. (If `performanceTier` is still referenced, keep it.)

- [ ] **Step 4: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 5: Visual check (mobile/tablet width, both themes)**

Scroll down >500px on a narrow viewport: exactly **one** back-to-top button appears (bottom-right), styled as the unified glass control, legible in both themes. The old blue bottom-left FAB is gone.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModernNavbar.tsx src/components/BackToTop.tsx
git commit -m "fix(navbar): remove duplicate back-to-top, unify BackToTop to glass recipe" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: `StaggeredMenu` panel + toggle → shared glass recipe

**Files:**
- Modify: `src/components/StaggeredMenu.tsx`

- [ ] **Step 1: Import the shared CSS**

At the top of `src/components/StaggeredMenu.tsx` (after the existing imports, ~line 3), add:

```tsx
import './liquidGlass.css';
```

- [ ] **Step 2: Resize + glass-skin the toggle button**

The toggle `<button className="sm-toggle …">` is at ~461-477. Change its Tailwind size from `w-[48px] h-[48px]` to `w-[44px] h-[44px]`, add the glass classes, and replace its inline `style`:

Change the className string `… text-white w-[48px] h-[48px]` to `… text-white w-[44px] h-[44px] liquid-glass liquid-glass--interactive` and replace the `style={{ … }}`:

```tsx
            style={{
              ['--lg-radius' as string]: '12px',
              ['--lg-tint' as string]: menuOpen
                ? 'color-mix(in srgb, var(--app-palette-primary-main) 18%, transparent)'
                : 'color-mix(in srgb, var(--app-palette-bg-elevated) 62%, transparent)',
              padding: 8,
            }}
```

(The `.liquid-glass` class now provides the border, blur, shadow, and rim; the icon uses `currentColor`, still driven by GSAP `menuButtonColor`/`openMenuButtonColor`.)

- [ ] **Step 3: Token-ize the panel surface**

In the inline `<style>` block, replace the `.sm-panel-surface` base rule (line ~583) and its accent pseudo-elements (~584-585) with token-driven glass:

```css
.sm-panel-surface { position: relative; width: 100%; height: 100%; border-radius: 0; overflow: hidden; backdrop-filter: blur(18px) saturate(170%); -webkit-backdrop-filter: blur(18px) saturate(170%); border: 1px solid color-mix(in srgb, var(--app-palette-divider) 60%, transparent); box-shadow: 0 18px 48px rgba(0, 0, 0, 0.30); background: color-mix(in srgb, var(--app-palette-bg-elevated) 78%, transparent); }
.sm-panel-surface::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--app-palette-primary-main) 22%, transparent), transparent 55%), radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--app-palette-secondary-main) 16%, transparent), transparent 60%); opacity: 0.85; pointer-events: none; }
.sm-panel-surface::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, color-mix(in srgb, var(--app-palette-text-primary) 10%, transparent), transparent 40%); pointer-events: none; }
```

- [ ] **Step 4: Token-ize the light-scheme overrides; keep item legibility**

Replace the `[data-mui-color-scheme="light"]` surface + item rules (lines ~591-596) with:

```css
[data-mui-color-scheme="light"] .sm-panel-surface,
[data-mui-color-scheme="light"] .sm-panel-surface--light,
[data-mui-color-scheme="light"] .sm-panel-surface--rich { background: color-mix(in srgb, var(--app-palette-bg-elevated) 82%, transparent); border: 1px solid color-mix(in srgb, var(--app-palette-divider) 95%, transparent); box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16); }
[data-mui-color-scheme="light"] .sm-panel-surface::after { background: linear-gradient(180deg, color-mix(in srgb, var(--app-palette-text-primary) 5%, transparent), transparent 40%); }
[data-mui-color-scheme="light"] .sm-panel-item { color: var(--app-palette-label-primary); }
```

(The `.sm-panel-surface--light` / `--rich` blur/box-shadow tiers and the `data-perf`/`data-device` blur overrides further down stay as-is — they still apply.)

- [ ] **Step 5: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 6: Visual check (mobile/tablet, both themes)**

Open the hamburger: the toggle is a 44px glass control (visible in both themes; tints primary when open). The slide-in panel is token-driven glass that adapts light/dark; menu item text is legible in both; GSAP open/close, focus trap, and Escape still work.

- [ ] **Step 7: Commit**

```bash
git add src/components/StaggeredMenu.tsx
git commit -m "feat(navbar): unify mobile menu panel + toggle to liquid-glass recipe" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: Symmetric mobile/tablet control cluster

**Files:**
- Modify: `src/components/ModernNavbar.tsx`

Now both controls are 44px glass; make the theme toggle adopt 44px on mobile/tablet and sit a clean `CTRL_GAP` to the left of the fixed menu button (Gestalt: similarity + proximity + symmetry). `CTRL_SIZE`/`CTRL_GAP` were added in Task 5.

- [ ] **Step 1: Replace the brittle `marginRight: 48` with a derived gap**

Find the theme-toggle wrapper `motion.div` (~984-992):

```tsx
					<motion.div
						initial={{ opacity: 0, scale: 0.85 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
						style={{
							display: 'inline-flex',
							marginRight: (isMobileDevice || isTabletDevice) ? 48 : 0,
						}}
					>
```

Replace the `marginRight` line with a derived offset so the toggle clears the 44px fixed menu button by exactly `CTRL_GAP`:

```tsx
							marginRight: (isMobileDevice || isTabletDevice) ? CTRL_SIZE + CTRL_GAP : 0,
```

- [ ] **Step 2: Keep the toggle 44px across breakpoints**

The toggle `LiquidGlass` wrapper already uses `width: CTRL_SIZE, height: CTRL_SIZE` (Task 5), so it is 44px on every breakpoint — matching the menu button. No change needed beyond confirming the `sx={{ width: CTRL_SIZE, height: CTRL_SIZE, ... }}` from Task 5 is present.

- [ ] **Step 3: Confirm gutters align**

The menu button lives in `StaggeredMenu`'s fixed header with right padding `toolbarPadding` (passed `isTabletDevice ? 32 : 16` at ~1066). The toolbar's right padding is `px: { xs: 2, md: 4 }` (= 16/32px) at ~648. These already match, so the menu button's right edge and the toolbar's content edge share the same gutter; with `marginRight = CTRL_SIZE + CTRL_GAP` the toggle sits exactly `CTRL_GAP` left of the menu button. No change required — verify visually in Step 5.

- [ ] **Step 4: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 5: Visual check (mobile AND tablet widths, both themes)**

Top-right shows the theme toggle and menu button as a matched pair: identical 44px size + radius + glass material (similarity), an even `CTRL_GAP` between them (proximity), both vertically centered and right-aligned to the same gutter as the brand on the left (symmetry/balance). Both clearly visible and legible in dark and light.

- [ ] **Step 6: Commit**

```bash
git add src/components/ModernNavbar.tsx
git commit -m "fix(navbar): symmetric 44px mobile control cluster (toggle + menu)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Remove dead CSS + final verification

**Files:**
- Modify: `src/components/ModernNavbar.css`

- [ ] **Step 1: Confirm the dead classes are still unreferenced**

Run: `for c in navbar-glass-surface glass-backdrop navbar-glass-shimmer navbar-fab-glass navbar-menu-toggle-glass; do echo "== $c =="; grep -rn "$c" src --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' | grep -v 'ModernNavbar.css' || echo "  (dead)"; done`
Expected: all report `(dead)`.

- [ ] **Step 2: Delete the dead rules in `ModernNavbar.css`**

Remove these now-unused rule groups: `.navbar-glass-surface, .navbar-mobile-menu-glass, .navbar-fab-glass, .navbar-menu-toggle-glass` (and their `::before`/`::after`/hover variants), the `.navbar-glass-shimmer` rules + `@keyframes shimmer`, the `.glass-backdrop` `@supports` block, and the mobile/reduced-motion blocks that target only those classes (lines ~9-198, the `@media (max-width: 768px)` `.navbar-glass-*` block ~207-228, and the `.navbar-glass-shimmer` part of the reduced-motion block ~233-235). **Keep** the global `.MuiChip-root` rules (used by other sections), `.nav-btn`, the `* { -webkit-font-smoothing }` rule, and `.MuiFab-root` rules (used by `BackToTop`'s Fab). When unsure whether a rule is referenced, re-run the Step 1 grep for its class before removing.

- [ ] **Step 3: Verify (typecheck + lint + build)**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: 0 type errors; no new `src` lint errors; build succeeds.

- [ ] **Step 4: Full visual + behavior pass (the spec's verification checklist)**

At `http://localhost:5173/`, in **both** themes:
- Bar reads as refractive glass over `ColorBends` and over content while scrolling; text AA-legible.
- Pills, active indicator, brand chip, theme toggle, mobile menu panel + toggle, and back-to-top all read as one cohesive glass language.
- Light/dark toggle (View-Transitions reveal) works.
- Mobile: exactly one back-to-top; toggle + menu are equal-sized, visible, symmetric.
- Device/tier: desktop (refraction + pointer specular), touch/tablet (frost, no specular), and — via DevTools emulation or a low `deviceMemory` device — `data-perf="low"` shows the solid-tint fallback; `prefers-reduced-motion` removes the sheen.
- **Idle check:** with the pointer still, DevTools Performance shows no ongoing scripting/rAF from the glass (event-driven specular only).
- Confirm only one WebGL canvas exists (`ColorBends`); no second canvas was added.

- [ ] **Step 5: Commit**

```bash
git add src/components/ModernNavbar.css
git commit -m "chore(navbar): remove dead glass CSS superseded by LiquidGlass" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (completed during planning)

**Spec coverage:** technique (frost+specular+progressive refraction) → Tasks 1-3; scope — bar (T3), pills+indicator (T4), brand+toggle (T5), mobile menu+toggle (T7), FAB/back-to-top (T6); mobile fixes — duplicate back-to-top (T6), toggle/menu contrast+size+symmetry (T5/T7/T8); light/dark tokens → all tasks via `--app-palette-*` + `[data-mui-color-scheme]`; motion/perf/tiers → hook (T1) + `--no-blur`/maxBlur + reduced-motion CSS; fallbacks → `@supports` (T1); dead-CSS cleanup → T9; verification → per-task + T9. No gaps.

**Placeholder scan:** no TBD/TODO; every code step shows complete code or an exact command with expected output.

**Type/name consistency:** `useGlassCapabilities` returns `{ canBlur, canRefract, reactiveSpecular, maxBlur }` (used consistently in `LiquidGlass`); `LiquidGlassProps` (`intensity`/`radius`/`blur`/`interactive`/`component`/`className`/`sx`/`style`) used consistently; CSS vars `--lg-blur/--lg-radius/--lg-tint/--lg-border/--lg-shadow/--lg-rim/--lg-spec/--gx/--gy` match between `liquidGlass.css`, the component, and the inline overrides; SVG `id="liquid-glass"` matches the `.liquid-glass--refract` `url(#liquid-glass)` and the support probe; `CTRL_SIZE`/`CTRL_GAP` defined in T5, used in T5/T8.

## Notes / risks
- **`backdrop-filter` re-enabled on the bar** (was `none`): verify AA contrast in both schemes (tint density is the lever).
- **Refraction is Chromium-mostly**: Safari/Firefox get frost + specular by design.
- **`StaggeredMenu` is vendored-style**: only its toggle surface + panel CSS change; GSAP timelines, `inert`/focus handling, and per-tier blur are preserved.
- **Dev-server gotcha** (no new dep here, but if `node_modules/.vite` goes stale): stop dev, `rm -rf node_modules/.vite`, restart.
