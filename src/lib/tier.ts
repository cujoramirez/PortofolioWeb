/**
 * Device tier: decides whether scroll choreography runs (low tier gets the static posters).
 * Copied from the 2026-09-25 reference build.
 */
export type Tier = 'high' | 'mid' | 'low';

export interface TierEnv {
  deviceMemory?: number;
  cores?: number;
  saveData: boolean;
  reducedMotion: boolean;
  softwareGL: boolean;
}

export function detectTier(env: TierEnv): Tier {
  if (env.saveData || env.reducedMotion || env.softwareGL) return 'low';
  const mem = env.deviceMemory;
  const cores = env.cores ?? 4;
  if (mem !== undefined && mem <= 2) return 'low';
  // Core counts alone never mean "low": WebKit (iOS especially) may under-report them, and an
  // iPhone that reports 2 cores still runs the choreography smoothly.
  if ((mem !== undefined && mem <= 4) || cores <= 4) return 'mid';
  return 'high';
}

export const DPR_CAP: Record<Tier, number> = { high: 2, mid: 1.5, low: 1 };

/**
 * Browser-only: read the environment. A `?tier=high|mid|low` query overrides for testing.
 * `ignoreReducedMotion` leaves reduced motion out, for callers that track it live.
 */
export function readTier({ ignoreReducedMotion = false } = {}): Tier {
  const forced = new URLSearchParams(location.search).get('tier');
  if (forced === 'high' || forced === 'mid' || forced === 'low') return forced;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return detectTier({
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    saveData: Boolean(nav.connection?.saveData),
    reducedMotion: !ignoreReducedMotion && matchMedia('(prefers-reduced-motion: reduce)').matches,
    softwareGL: softwareRenderer(),
  });
}

function softwareRenderer(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
