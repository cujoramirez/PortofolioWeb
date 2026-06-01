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
