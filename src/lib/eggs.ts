/**
 * Easter eggs. Each is a hidden trigger on something that already exists; all are event
 * listeners (no frames while idle) and none moves anything under reduced motion.
 *  - The DevTools console says hello and hints at the rest.
 *  - Konami code (↑ ↑ ↓ ↓ ← → ← → B A), or "hierarchy" in ⌘K: a view-hierarchy wireframe of the
 *    page, after Xcode's view debugger. Esc or the code again leaves it.
 *  - Three quick clicks or taps on the hero portrait pin the Apple Vision detections on.
 *  - Six theme switches within a few seconds: back to the system setting.
 *  - ⌘K also knows "sudo hire" and "rm -rf" (see CommandPalette).
 */
import { LINKS } from '../content/site';
import { currentScheme, setScheme, subscribeScheme, systemScheme } from './theme';
import { toast } from './toast';
import './eggs.css';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function toggleHierarchy(force?: boolean): void {
  const on = document.documentElement.classList.toggle('is-hierarchy', force);
  if (on) toast(`View hierarchy: ${document.body.getElementsByTagName('*').length.toLocaleString('en-US')} views. Esc to leave.`);
  else toast('View hierarchy off');
}

function hello() {
  console.log(
    `%cBuilt in layers.%c\nHi. This page is React, GSAP and CSS 3D, and it draws no frames while you are not scrolling.\nA few things are hidden: try ↑ ↑ ↓ ↓ ← → ← → B A, or press ⌘K and type sudo.\n${LINKS.github}`,
    'color:#3b82f6;font:600 14px/1.8 ui-monospace,monospace',
    'font:12px/1.7 ui-monospace,monospace',
  );
}

const typing = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

export function installEggs(): () => void {
  hello();

  let step = 0;
  const onKey = (e: KeyboardEvent) => {
    if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'Escape' && document.documentElement.classList.contains('is-hierarchy')) {
      toggleHierarchy(false);
      return;
    }
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === KONAMI[step]) step += 1;
    else step = key === 'ArrowUp' ? (step === 2 ? 2 : 1) : 0;
    if (step === KONAMI.length) {
      step = 0;
      toggleHierarchy();
    }
  };
  document.addEventListener('keydown', onKey);

  const hero = document.getElementById('hero');
  const portrait = hero?.querySelector<HTMLElement>('.hero__portrait');
  let taps: number[] = [];
  const onTap = () => {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 700).concat(now);
    if (taps.length < 3 || !hero) return;
    taps = [];
    const on = hero.classList.toggle('show-cv');
    toast(on ? 'Detections pinned. Do it again to hide them.' : 'Detections hidden');
  };
  portrait?.addEventListener('click', onTap);

  let flips: number[] = [];
  let last = currentScheme();
  const unsubscribe = subscribeScheme(() => {
    const now = currentScheme();
    if (now === last) return;
    last = now;
    const t = performance.now();
    flips = flips.filter((f) => t - f < 4000).concat(t);
    if (flips.length < 6) return;
    flips = [];
    if (currentScheme() !== systemScheme()) setScheme(systemScheme());
    toast("Can't decide? Back to your system setting.");
  });

  return () => {
    document.removeEventListener('keydown', onKey);
    portrait?.removeEventListener('click', onTap);
    unsubscribe();
  };
}
