import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useSystemProfile } from '../components/useSystemProfile';

export interface GlassCapabilities {
  /** backdrop-filter: blur() is supported and the device tier allows it. */
  canBlur: boolean;
  /** backdrop-filter: url(#…) refraction is supported (Chromium-only today). */
  canRefract: boolean;
  /** Pointer-reactive specular is allowed (fine pointer + motion + not low tier). */
  reactiveSpecular: boolean;
  /** Device-capped blur radius in px (0 when blur is disabled). */
  maxBlur: number;
}

const supportsBackdrop = (): boolean => {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return (
    CSS.supports('backdrop-filter', 'blur(1px)') ||
    CSS.supports('-webkit-backdrop-filter', 'blur(1px)')
  );
};

// backdrop-filter: url(#id) is Chromium-only today; probe directly.
const supportsRefraction = (): boolean => {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('backdrop-filter', 'url(#liquid-glass)');
};

export function useGlassCapabilities(): GlassCapabilities {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier, deviceType } = useSystemProfile();

  // SSR-safe: probe support on the client after mount.
  const [support, setSupport] = useState({ blur: false, refract: false });
  useEffect(() => {
    setSupport({ blur: supportsBackdrop(), refract: supportsRefraction() });
  }, []);

  const lowTier = performanceTier === 'low';
  const midTier = performanceTier === 'mid';

  const canBlur = support.blur && !lowTier;
  const canRefract = canBlur && support.refract;
  const reactiveSpecular = canBlur && deviceType === 'desktop' && !prefersReducedMotion;

  let maxBlur = 0;
  if (canBlur) {
    if (deviceType === 'mobile') maxBlur = 8;
    else if (deviceType === 'tablet' || midTier) maxBlur = 12;
    else maxBlur = 18;
  }

  return { canBlur, canRefract, reactiveSpecular, maxBlur };
}
