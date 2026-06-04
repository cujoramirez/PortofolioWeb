import { useCallback, useContext } from 'react';
import { useReducedMotion } from 'framer-motion';
import { LenisContext } from './LenisContext';

// Smooth, Lenis-aware in-page section scrolling.
//
// A native `href="#id"` jump moves the real scroll position out from under Lenis's virtual
// scroll and desyncs its internal state — which freezes the page (you can no longer scroll,
// and later lenis.scrollTo() calls operate on the corrupted instance). Routing every in-page
// jump through lenis.scrollTo() keeps the two in sync and animates the move. Falls back to
// native smooth scrolling when Lenis is disabled (mobile / low-end devices) or the user
// prefers reduced motion. Mirrors the navbar's scrollToSection so every jump behaves the same.
export function useSmoothScroll() {
  const { lenis } = useContext(LenisContext);
  const prefersReducedMotion = useReducedMotion();

  return useCallback(
    (hash: string) => {
      if (typeof document === 'undefined') return;
      const target = document.querySelector(hash);
      if (!(target instanceof HTMLElement)) return;

      if (lenis) {
        lenis.scrollTo(target, {
          duration: prefersReducedMotion ? 0 : 1,
          offset: 0,
          immediate: !!prefersReducedMotion,
        });
      } else {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [lenis, prefersReducedMotion],
  );
}
