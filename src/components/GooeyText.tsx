import { useEffect, useId, useRef, type CSSProperties } from 'react';

interface GooeyTextProps {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  /** When true (e.g. prefers-reduced-motion), render a single static phrase. */
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Gooey morphing text: cross-fades between phrases through an SVG threshold
 * filter so they "melt" into each other. Adapted for this Vite + MUI project
 * (no Next "use client", no Tailwind). Color is inherited (currentColor) so it
 * stays token-driven; the gradient remains headline-only.
 *
 * Hardening over the reference: cancels its rAF on unmount, pauses while
 * off-screen / tab-hidden, degrades to static under reduced motion, and
 * exposes an accessible sentence for screen readers.
 */
export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 2,
  disabled = false,
  className,
  style,
}: GooeyTextProps) {
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const filterId = `gooey-${useId().replace(/:/g, '')}`;

  const longest = texts.reduce((a, b) => (b.length > a.length ? b : a), texts[0] ?? '');
  const accessibleSentence =
    texts.length > 1
      ? `${texts.slice(0, -1).join(', ')}, and ${texts[texts.length - 1]}.`
      : texts[0] ?? '';

  useEffect(() => {
    if (disabled) return;
    const t1 = text1Ref.current;
    const t2 = text2Ref.current;
    if (!t1 || !t2) return;

    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let rafId = 0;
    let visible = true;

    t1.textContent = texts[textIndex % texts.length] ?? '';
    t2.textContent = texts[(textIndex + 1) % texts.length] ?? '';

    const setMorph = (fraction: number) => {
      t2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      const inv = 1 - fraction;
      t1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      t1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      t2.style.filter = '';
      t2.style.opacity = '100%';
      t1.style.filter = '';
      t1.style.opacity = '0%';
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    };

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (!visible) {
        time = new Date();
        return;
      }
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          t1.textContent = texts[textIndex % texts.length] ?? '';
          t2.textContent = texts[(textIndex + 1) % texts.length] ?? '';
        }
        doMorph();
      } else {
        doCooldown();
      }
    };

    animate();

    // Pause the loop while the hero is scrolled out of view, to keep it light.
    let observer: IntersectionObserver | null = null;
    if (rootRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0 },
      );
      observer.observe(rootRef.current);
    }

    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [texts, morphTime, cooldownTime, disabled]);

  if (disabled) {
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
      <svg aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
      {/* In-flow sizer establishes the box so the absolute morphing spans have size. */}
      <span aria-hidden="true" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {longest}
      </span>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, filter: `url(#${filterId})` }}>
        <span ref={text1Ref} style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap', color: 'inherit' }} />
        <span ref={text2Ref} style={{ position: 'absolute', inset: 0, whiteSpace: 'nowrap', color: 'inherit' }} />
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
