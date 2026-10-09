/**
 * Smooth scroll (Lenis) that renders only while it is actually scrolling, bridged to
 * ScrollTrigger. Native scrolling on touch devices, reduced motion and the low tier.
 * Lenis is deliberately NOT added to gsap.ticker: that would keep a frame loop running forever.
 */
import Lenis from 'lenis';
import { ScrollTrigger } from './gsap';
import { createLenisLoop } from './lenisLoop';
import { motionAllowed } from './motion';

let lenis: Lenis | null = null;

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar']);

export function initScroll(): () => void {
  const touchOnly = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
  if (!motionAllowed() || touchOnly) return () => {};

  const instance = new Lenis({
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    prevent: (node: HTMLElement) => Boolean(node.closest?.('dialog, [data-lenis-prevent]')),
  });
  instance.on('scroll', ScrollTrigger.update);

  // Drive Lenis only while it is smoothing: an idle page requests zero animation frames.
  const loop = createLenisLoop(instance, {
    raf: (cb) => window.requestAnimationFrame(cb),
    caf: (id) => window.cancelAnimationFrame(id),
  });
  const kick = () => loop.kick();
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) kick();
  };
  const scrollTo = instance.scrollTo.bind(instance);
  instance.scrollTo = ((...args: Parameters<typeof scrollTo>) => {
    scrollTo(...args);
    kick();
  }) as typeof instance.scrollTo;

  window.addEventListener('wheel', kick, { passive: true, capture: true });
  window.addEventListener('touchstart', kick, { passive: true, capture: true });
  window.addEventListener('keydown', onKey, { capture: true });
  lenis = instance;

  return () => {
    loop.stop();
    window.removeEventListener('wheel', kick, { capture: true });
    window.removeEventListener('touchstart', kick, { capture: true });
    window.removeEventListener('keydown', onKey, { capture: true });
    instance.destroy();
    lenis = null;
  };
}

/** Scroll to an element or offset, through Lenis when it is running. */
export function scrollToTarget(target: HTMLElement | number, { immediate = false } = {}) {
  pauseSnaps(immediate);
  if (lenis) {
    lenis.scrollTo(target, { immediate, force: true });
    return;
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
  const smooth = !immediate && motionAllowed();
  if (smooth) holdRefreshUntilLanded();
  window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
}

let snapUntil = 0;

export const snapAllowed = () => performance.now() >= snapUntil;

/** A navigation jump must not be pulled back into the deck it just left. */
function pauseSnaps(immediate: boolean) {
  snapUntil = performance.now() + (immediate ? 750 : 2000);
  ScrollTrigger.getAll().filter((st) => st.vars.snap).forEach((st) => st.getTween(true)?.kill());
}

let gliding = false;

/**
 * A native smooth scroll is under way (touch devices, where Lenis does not run). A ScrollTrigger
 * refresh restores the scroll position it started from, which stops such a scroll where it
 * stands: on a phone the first tap on "View my work" mounted the lazy scenes, their refresh
 * fired 80 ms into the scroll, and the page stopped 38 px down. refreshSoon waits while this is
 * set. It clears once the position has stopped changing.
 */
function holdRefreshUntilLanded() {
  gliding = true;
  let last = window.scrollY;
  let still = 0;
  let checks = 0;
  const check = () => {
    const y = window.scrollY;
    still = y === last ? still + 1 : 0;
    last = y;
    // two unchanged readings, or 8 s as a ceiling for a scroll someone interrupted
    if (still >= 2 || ++checks > 66) gliding = false;
    else window.setTimeout(check, 120);
  };
  window.setTimeout(check, 120);
}

let locks = 0;
let unlockedOverflow = '';

/**
 * Pause background scrolling while a dialog is open. Counted: dialogs can overlap (the menu hands
 * over to the search palette), and each release must not restore another dialog's locked state.
 */
export function lockScroll(): () => void {
  const root = document.documentElement;
  if (locks++ === 0) {
    unlockedOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    lenis?.stop();
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks > 0) return;
    root.style.overflow = unlockedOverflow;
    lenis?.start();
  };
}

let refreshTimer = 0;

/** Re-measure every trigger soon (after a scene mounts, fonts load, or layout changes). */
export function refreshSoon(delay = 80) {
  window.clearTimeout(refreshTimer);
  refreshTimer = window.setTimeout(() => {
    if (gliding) {
      refreshSoon(160);
      return;
    }
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, delay);
}
