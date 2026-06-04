import { useContext, useEffect } from 'react';
import { LenisContext } from './LenisContext';

// Locks background scroll while an overlay is open and restores the exact position on close.
//
// The branch is on POINTER, not Lenis: touch browsers (iOS Safari, iPadOS) ignore
// `overflow: hidden` for scroll locking — the page scroll-chains and drifts while the overlay's
// own list scrolls, then "teleports" to wherever it drifted on close. iPad in particular runs
// Lenis yet still needs the iOS-safe lock, so a Lenis-only branch missed it.
//
// Touch: pin the body at its current offset with position:fixed (truly stops the drift) and
// restore the precise position with scrollTo on close (after a forced reflow). Mouse/desktop:
// overflow:hidden is reliable. Lenis, when present, is paused either way and re-synced on close.
export function useScrollLock(locked: boolean) {
  const { lenis, stop, start } = useContext(LenisContext);

  useEffect(() => {
    if (!locked || typeof document === 'undefined') return undefined;
    const body = document.body;
    const scrollY = window.scrollY;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    if (lenis) stop();

    if (!isTouch) {
      const prevOverflow = body.style.overflow;
      body.style.overflow = 'hidden';
      return () => {
        body.style.overflow = prevOverflow;
        if (lenis) start();
      };
    }

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      // Force a reflow so the document is scrollable again before we restore the scroll position
      // (otherwise scrollTo can be clamped against the still-locked height and land at the top).
      void body.offsetHeight;
      window.scrollTo(0, scrollY);
      if (lenis) {
        start();
        lenis.scrollTo(scrollY, { immediate: true });
      }
    };
  }, [locked, lenis, stop, start]);
}
