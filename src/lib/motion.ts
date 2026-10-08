/**
 * Motion policy. Three choreography variants plus a static "poster" mode:
 *   desktop  >= 1024 px wide (and tall enough to hold a pinned scene)
 *   tablet   768-1023 px: same scenes, pin lengths and z steps x 0.7
 *   mobile   < 768 px (or short screens): no horizontal travel, short one-time rises
 *   static   prefers-reduced-motion or a low device tier: no pins, no scrub, composed layouts
 */
import { readTier } from './tier';

export type Variant = 'desktop' | 'tablet' | 'mobile';

export const MQ = {
  wide: '(min-width: 1024px) and (min-height: 620px)',
  mid: '(min-width: 768px) and (max-width: 1023px) and (min-height: 620px)',
  reduce: '(prefers-reduced-motion: reduce)',
  any: 'all',
} as const;

let low: boolean | null = null;

/** Low device tier (memory, cores, save-data, software GL). Reduced motion is tracked live. */
export function lowTier(): boolean {
  if (low === null) low = readTier({ ignoreReducedMotion: true }) === 'low';
  return low;
}

/** True when choreography may run right now. */
export function motionAllowed(): boolean {
  return !lowTier() && !window.matchMedia(MQ.reduce).matches;
}

export function variantFor(conditions: { wide?: boolean; mid?: boolean }): Variant {
  return conditions.wide ? 'desktop' : conditions.mid ? 'tablet' : 'mobile';
}

/** Scale for pin lengths and z steps. */
export const DEPTH: Record<Variant, number> = { desktop: 1, tablet: 0.7, mobile: 0.5 };
