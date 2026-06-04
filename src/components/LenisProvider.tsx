import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';

import { LenisContext } from './LenisContext';
import { useSystemProfile } from './useSystemProfile';

type LenisHandle = InstanceType<typeof Lenis>;

interface LenisProviderProps {
  children: ReactNode;
}

// Check if this is a mobile/touch-only device (not a laptop with touchscreen)
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  // Check for mobile user agents
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  // Check for coarse pointer (touch) without fine pointer (mouse)
  const isTouchOnly = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
  return isMobileUA || isTouchOnly;
};

export const LenisProvider = ({ children }: LenisProviderProps) => {
  const { performanceTier, deviceType } = useSystemProfile();
  const lenisRef = useRef<LenisHandle | null>(null);
  const [lenisInstance, setLenisInstance] = useState<LenisHandle | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isStoppedRef = useRef(false);
  const disableLenis = performanceTier === 'low' || deviceType === 'mobile';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    // Skip Lenis on mobile devices - use native scrolling
    if (disableLenis || isMobileDevice()) {
      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
      wheelMultiplier: 1.1,
      lerp: 0.12,
      autoResize: true,
      syncTouch: false,
      syncTouchLerp: 0.1,
      touchInertiaMultiplier: 0,
      prevent: (node: HTMLElement) => node?.hasAttribute('data-lenis-prevent') ?? false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    (window as unknown as { lenis?: LenisHandle | null }).lenis = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      rafIdRef.current = window.requestAnimationFrame(raf);
    };

    rafIdRef.current = window.requestAnimationFrame(raf);

    return () => {
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      (window as unknown as { lenis?: LenisHandle | null }).lenis = null;
    };
  }, [disableLenis]);

  const stop = useCallback(() => {
    if (lenisRef.current && !isStoppedRef.current) {
      lenisRef.current.stop();
      isStoppedRef.current = true;
    }
  }, []);

  const start = useCallback(() => {
    if (lenisRef.current && isStoppedRef.current) {
      lenisRef.current.start();
      isStoppedRef.current = false;
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      lenis: lenisInstance,
      stop,
      start,
    }),
    [lenisInstance, stop, start],
  );

  return <LenisContext.Provider value={contextValue}>{children}</LenisContext.Provider>;
};
