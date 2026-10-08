/**
 * In-page navigation. Below-the-fold scenes mount lazily, and each one adds pin spacing when it
 * does, so a far jump first mounts every scene and re-measures, then scrolls, then moves focus
 * to the target's heading (without a second scroll).
 */
import { ScrollTrigger } from './gsap';
import { scrollToTarget } from './scroll';

type Loader = () => Promise<void>;
const loaders = new Map<string, Loader>();

export function registerSceneLoader(id: string, load: Loader): () => void {
  loaders.set(id, load);
  return () => {
    loaders.delete(id);
  };
}

export async function loadAllScenes() {
  await Promise.all([...loaders.values()].map((load) => load()));
}

export function focusHeading(target: HTMLElement) {
  const heading = target.matches('h1, h2, h3') ? target : (target.querySelector<HTMLElement>('h1, h2') ?? target);
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

export async function jumpTo(id: string, { immediate = false, url = true } = {}) {
  const needsLoad = loaders.size > 0;
  if (needsLoad) {
    await loadAllScenes();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }
  const target = document.getElementById(id);
  if (!target) return;
  // An explicit jump is a link you can copy: the URL names the section, and the top clears it.
  // Replaced, not pushed, so Back still leaves the page. Scrolling never writes the hash.
  if (url) history.replaceState(null, '', id === 'hero' ? location.pathname + location.search : `#${id}`);
  // A scene can ask to land a little past its top (About waits out the hero's hand-off).
  const offset = Number(target.dataset.jumpOffset ?? 0);
  const top = id === 'hero' ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
  scrollToTarget(top, { immediate });
  focusHeading(target);
}
