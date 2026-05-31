import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface GooeyTextProps {
  texts: string[];
  /** Seconds each phrase rests before morphing. */
  holdTime?: number;
  /** Seconds for the liquid morph. */
  transitionTime?: number;
  /** Peak blur (px) during the morph — higher = more liquid scatter. */
  maxBlur?: number;
  /** Force-static (also auto-respects prefers-reduced-motion). */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Liquid morphing text. Two phrases cross-dissolve while an alpha-threshold
 * filter makes their blurred forms scatter into droplets and merge (metaball
 * effect), then resolve crisp.
 *
 * Performance/containment safeguards (the previous version was laggy and
 * disturbed the neighboring drop-shadow):
 *  - the threshold filter is applied ONLY during the morph; at rest the text is
 *    crisp and unfiltered (the result is cached, zero per-frame cost),
 *  - blur is capped (default 16px, vs the old 100px) and the SVG filter region
 *    is bounded, so the effect cannot bleed into neighboring layers,
 *  - `isolation: isolate` keeps compositing local,
 *  - it pauses off-screen / when the tab is hidden, and renders a single static
 *    phrase under reduced motion.
 */
export function GooeyText({
  texts,
  holdTime = 2.4,
  transitionTime = 0.7,
  maxBlur = 16,
  disabled = false,
  className,
  style,
}: GooeyTextProps) {
  const prefersReduced = useReducedMotion();
  const reduced = disabled || Boolean(prefersReduced) || texts.length <= 1;

  const [index, setIndex] = useState(0);
  const [morphing, setMorphing] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const visibleRef = useRef(true);
  const filterId = `gooey-${useId().replace(/:/g, '')}`;

  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), texts[0] ?? '');
  const accessibleSentence =
    texts.length > 1
      ? `${texts.slice(0, -1).join(', ')}, and ${texts[texts.length - 1]}.`
      : texts[0] ?? '';

  useEffect(() => {
    if (reduced) return;

    const cycle = (holdTime + transitionTime) * 1000;
    let morphTimer = 0;

    const id = window.setInterval(() => {
      if (!visibleRef.current) return;
      setIndex((i) => (i + 1) % texts.length);
      setMorphing(true);
      window.clearTimeout(morphTimer);
      morphTimer = window.setTimeout(() => setMorphing(false), transitionTime * 1000 + 80);
    }, cycle);

    let observer: IntersectionObserver | null = null;
    if (rootRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          visibleRef.current = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0 },
      );
      observer.observe(rootRef.current);
    }

    const onVisibility = () => {
      visibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(morphTimer);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced, texts, holdTime, transitionTime]);

  if (reduced) {
    return (
      <span className={className} style={style}>
        {texts[0] ?? ''}
      </span>
    );
  }

  return (
    <span
      ref={rootRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', isolation: 'isolate', ...style }}
    >
      {/* Bounded threshold filter — turns overlapping blurred text into merging droplets. */}
      <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId} x="-10%" y="-50%" width="120%" height="200%">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -8"
            />
          </filter>
        </defs>
      </svg>

      {/* In-flow sizer reserves the box so the absolute phrases never shift layout. */}
      <span aria-hidden="true" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {longest}
      </span>

      {/* Threshold is applied only while morphing; crisp and uncosted at rest. */}
      <span
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, filter: morphing ? `url(#${filterId})` : 'none' }}
      >
        <AnimatePresence initial={false}>
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6, filter: `blur(${maxBlur}px)` }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: `blur(${maxBlur}px)` }}
            transition={{ duration: transitionTime, ease: EASE }}
            style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap', color: 'inherit' }}
          >
            {texts[index] ?? ''}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* Static, screen-reader-only summary of the rotating phrases. */}
      <span
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {accessibleSentence}
      </span>
    </span>
  );
}
