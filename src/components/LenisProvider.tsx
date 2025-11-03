import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Lenis from 'lenis';

import { LenisContext } from './LenisContext';

type LenisHandle = InstanceType<typeof Lenis>;

interface LenisProviderProps {
  children: ReactNode;
}

export const LenisProvider = ({ children }: LenisProviderProps) => {
  const lenisRef = useRef<LenisHandle | null>(null);
  const [lenisInstance, setLenisInstance] = useState<LenisHandle | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const isStoppedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
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
  }, []);

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
