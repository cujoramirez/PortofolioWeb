import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

declare global {
  interface Window {
    __FRAMER_REDUCED_MOTION_FILTERED__?: boolean;
  }
}

const REDUCED_MOTION_WARNING_MATCH = 'Reduced Motion enabled on your device';
const REDUCED_MOTION_WARNING_SUFFIX = 'Animations may not appear as expected';
const FRAMER_STATIC_POSITION_WARNING = 'Please ensure that the container has a non-static position';
const EXTENSION_BRIDGE_PREFIX = 'Content Script Bridge:';

type ReducedMotionGlobal = {
  __FRAMER_REDUCED_MOTION_FILTERED__?: boolean;
};

(() => {
  if (typeof console === 'undefined') {
    return;
  }

  const globalScope = (typeof window !== 'undefined' ? window : (globalThis as unknown)) as ReducedMotionGlobal;

  if (!globalScope.__FRAMER_REDUCED_MOTION_FILTERED__) {
    const originalWarn = console.warn.bind(console);
    const originalLog = console.log.bind(console);

    console.warn = (...args: unknown[]) => {
      const shouldSuppress = args.some((arg) => {
        if (typeof arg !== 'string') {
          return false;
        }

        if (
          arg.includes(REDUCED_MOTION_WARNING_MATCH) &&
          arg.includes(REDUCED_MOTION_WARNING_SUFFIX)
        ) {
          return true;
        }

        if (arg.includes(FRAMER_STATIC_POSITION_WARNING)) {
          return true;
        }

        return false;
      });

      if (shouldSuppress) {
        return;
      }

      originalWarn(...(args as [unknown, ...unknown[]]));
    };

    console.log = (...args: unknown[]) => {
      const shouldSuppress = args.some(
        (arg) => typeof arg === 'string' && arg.startsWith(EXTENSION_BRIDGE_PREFIX),
      );

      if (shouldSuppress) {
        return;
      }

      originalLog(...(args as [unknown, ...unknown[]]));
    };

    globalScope.__FRAMER_REDUCED_MOTION_FILTERED__ = true;
  }
})();

// Forces animations to stay enabled regardless of OS-level reduced motion settings.
// Still calls Framer's hook so configuration changes do not break hook ordering.
export const useReducedMotionOverride = (): boolean => {
  // Call Framer's hook to keep internal state in sync, but ignore the result.
  useFramerReducedMotion();
  return false;
};
