/**
 * Light / dark / system. The pre-paint script in index.html applies the stored choice before
 * first paint (see themeInitScript in src/content/heroMarkup.ts; same key and values).
 * Choosing the scheme the OS already uses stores nothing, which means "follow the system".
 */
import { THEME_COLOR } from '../content/site';

export type Scheme = 'light' | 'dark';

const KEY = 'theme';
const lightQuery = () => window.matchMedia('(prefers-color-scheme: light)');
const listeners = new Set<() => void>();

export const systemScheme = (): Scheme => (lightQuery().matches ? 'light' : 'dark');

function stored(): Scheme | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export const currentScheme = (): Scheme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function apply(scheme: Scheme) {
  document.documentElement.dataset.theme = scheme;
  // The pre-paint script's tag (the one without a media query): a manual toggle has to recolour
  // the mobile browser toolbar too, and the media-keyed tags only follow the OS.
  document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', THEME_COLOR[scheme]);
  listeners.forEach((fn) => fn());
}

export function setScheme(next: Scheme) {
  try {
    if (next === systemScheme()) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* storage unavailable: the choice lasts for this page view */
  }
  apply(next);
}

export function subscribeScheme(fn: () => void): () => void {
  listeners.add(fn);
  const query = lightQuery();
  const onSystem = () => {
    if (!stored()) apply(systemScheme());
  };
  query.addEventListener('change', onSystem);
  return () => {
    listeners.delete(fn);
    query.removeEventListener('change', onSystem);
  };
}
