import { useSyncExternalStore, type MouseEvent } from 'react';
import { MoonIcon, SunIcon } from './icons';
import { currentScheme, setScheme, subscribeScheme, type Scheme } from '../lib/theme';
import { motionAllowed } from '../lib/motion';

export function useScheme(): Scheme {
  return useSyncExternalStore(subscribeScheme, currentScheme, () => 'dark');
}

/** Switch schemes with a circular reveal from the control (View Transitions), else instantly. */
export function toggleScheme(event: MouseEvent<HTMLElement>) {
  const next: Scheme = currentScheme() === 'dark' ? 'light' : 'dark';
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || !motionAllowed()) {
    setScheme(next);
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  doc.startViewTransition(() => setScheme(next));
}

export default function ThemeToggle({ withLabel = false }: { withLabel?: boolean }) {
  const scheme = useScheme();
  const label = scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
  if (withLabel) {
    return (
      <button type="button" className="btn btn--secondary" onClick={toggleScheme}>
        {scheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        <span>{scheme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
      </button>
    );
  }
  return (
    <button type="button" className="icon-btn" aria-label={label} title={label} onClick={toggleScheme}>
      {scheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
