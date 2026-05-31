import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface GooeyTextProps {
  texts: string[];
  /** Seconds each phrase rests before morphing. */
  holdTime?: number;
  /** Seconds for the morph transition. */
  transitionTime?: number;
  /** Force-static (also auto-respects prefers-reduced-motion). */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Morphing capability line. Each phrase cross-dissolves into the next with a
 * short blur + vertical drift, animating ONLY opacity/transform (plus a tiny,
 * transient blur) so it stays on the compositor and never repaints neighbors.
 *
 * This deliberately avoids the SVG `feColorMatrix` "gooey" technique: that
 * filter repaints every frame with a blur radius up to 100px, whose filter
 * region overflows the text and forces re-compositing of nearby layers (it was
 * disturbing the portrait's drop-shadow). Here the morph runs only during the
 * transition, pauses off-screen / when the tab is hidden, and degrades to a
 * single static phrase under reduced motion.
 */
export function GooeyText({
  texts,
  holdTime = 2.6,
  transitionTime = 0.55,
  disabled = false,
  className,
  style,
}: GooeyTextProps) {
  const prefersReduced = useReducedMotion();
  const reduced = disabled || Boolean(prefersReduced) || texts.length <= 1;

  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLSpanElement>(null);
  const visibleRef = useRef(true);

  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), texts[0] ?? '');
  const accessibleSentence =
    texts.length > 1
      ? `${texts.slice(0, -1).join(', ')}, and ${texts[texts.length - 1]}.`
      : texts[0] ?? '';

  useEffect(() => {
    if (reduced) return;

    const cycle = (holdTime + transitionTime) * 1000;
    const id = window.setInterval(() => {
      if (visibleRef.current) setIndex((i) => (i + 1) % texts.length);
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
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {/* In-flow sizer reserves the box so the absolute phrases never shift layout. */}
      <span aria-hidden="true" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {longest}
      </span>
      <AnimatePresence initial={false}>
        <motion.span
          key={index}
          aria-hidden="true"
          initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(5px)' }}
          transition={{ duration: transitionTime, ease: EASE }}
          style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap', color: 'inherit' }}
        >
          {texts[index] ?? ''}
        </motion.span>
      </AnimatePresence>
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
