/**
 * One scroll choreography per scene, rebuilt per media variant via gsap.matchMedia.
 * Reduced motion and the low tier get no timeline: the CSS rest state is the finished poster.
 * The build callback runs with the section already carrying `is-motion` and `is-<variant>`,
 * so variant layouts are in place before ScrollTrigger measures.
 */
import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap, ScrollTrigger } from './gsap';
import { DEPTH, MQ, lowTier, variantFor, type Variant } from './motion';
import { refreshSoon } from './scroll';
import { skipScene } from './skipScene';

export interface SceneApi {
  variant: Variant;
  /** 1 on desktop, 0.7 on tablet: multiply pin lengths and z steps by it. */
  k: number;
  section: HTMLElement;
  root: HTMLElement;
}

export function useScene(
  rootRef: RefObject<HTMLElement | null>,
  build: (api: SceneApi) => void | (() => void),
  { section: sectionOverride }: { section?: () => HTMLElement | null } = {},
) {
  const buildRef = useRef(build);
  buildRef.current = build;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const section = sectionOverride?.() ?? (root.closest('section') as HTMLElement | null) ?? root;
    const mm = gsap.matchMedia();
    mm.add(
      { wide: MQ.wide, mid: MQ.mid, reduce: MQ.reduce, any: MQ.any },
      (ctx) => {
        const c = ctx.conditions as Record<string, boolean>;
        if (c.reduce || lowTier()) return undefined;
        const variant = variantFor(c);
        section.classList.add('is-motion', `is-${variant}`);
        ScrollTrigger.create({
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          toggleClass: { targets: section, className: 'is-active' },
        });
        const cleanup = buildRef.current({ variant, k: DEPTH[variant], section, root });
        const unskip = section.querySelector('.pin-spacer, .hero__spacer') ? skipScene(section) : () => {};
        refreshSoon();
        return () => {
          cleanup?.();
          unskip();
          section.classList.remove('is-motion', `is-${variant}`, 'is-active');
        };
      },
      root,
    );
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
