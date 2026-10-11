/**
 * In-page navigation. Below-the-fold scenes mount lazily, and each one adds pin spacing when it
 * does, so a far jump first mounts every scene and re-measures, then scrolls, then moves focus
 * to the target's heading (without a second scroll).
 */
import { ScrollTrigger } from './gsap';
import { scrollToTarget, unlocked } from './scroll';

type Loader = () => Promise<void>;
const loaders = new Map<string, Loader>();

export function registerSceneLoader(id: string, load: Loader): () => void {
  loaders.set(id, load);
  return () => {
    loaders.delete(id);
  };
}

/**
 * Where a jump to a section lands. A pinned scene starts on a transitional state (About mid
 * hand-off, Contact's empty card, What I do still stacked): it names the place in its own scroll
 * range where it first reads complete.
 */
const landings = new Map<string, () => number | null>();

export function landAt(id: string, trigger: () => ScrollTrigger | undefined, progress: number): () => void {
  const at = () => {
    const st = trigger();
    return st ? st.start + (st.end - st.start) * progress : null;
  };
  landings.set(id, at);
  return () => {
    if (landings.get(id) === at) landings.delete(id);
  };
}

/**
 * The id a URL fragment names, or '' for none and for one that is not valid percent-encoding:
 * `#%` makes decodeURIComponent throw, and thrown at startup that left the page without its app.
 */
export function fragmentId(hash: string): string {
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return '';
  }
}

export async function loadAllScenes() {
  await Promise.all([...loaders.values()].map((load) => load()));
}

export function focusHeading(target: HTMLElement) {
  const heading = target.matches('h1, h2, h3') ? target : (target.querySelector<HTMLElement>('h1, h2') ?? target);
  if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
  const from = document.activeElement;
  heading.focus({ preventScroll: true });
  if (document.activeElement === heading) return;
  // The hero hides once it has handed over to About, and a hidden heading takes no focus ("Skip to
  // the top" left it at the foot of the page). Retry as the page arrives, unless focus has moved.
  let tries = 12;
  const retry = () => {
    if (document.activeElement !== from) return;
    heading.focus({ preventScroll: true });
    if (document.activeElement !== heading && --tries > 0) window.setTimeout(retry, 200);
  };
  window.setTimeout(retry, 200);
}

/** Mount every scene and measure, so that a jump after this scrolls in the same turn. */
export async function readyToJump() {
  if (!loaders.size) return;
  await loadAllScenes();
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

/**
 * After an instant jump, every scrubbed scene takes up its new place in this turn. Left to their
 * scrub, the scenes between the two places all catch up at once for half a second: a quarter of
 * the frame rate while the warp plays over them.
 */
export function landNow() {
  ScrollTrigger.update();
  ScrollTrigger.getAll().forEach((st) => {
    const scrub = st.getTween();
    if (scrub) scrub.progress(1);
  });
}

export async function jumpTo(id: string, { immediate = false, url = true } = {}) {
  // an animated scroll cannot start under a dialog (the menu's jump is instant, behind its veil)
  if (!immediate) await unlocked();
  await readyToJump();
  const target = document.getElementById(id);
  if (!target) return;
  // An explicit jump is a link you can copy: the URL names the section, and the top clears it.
  // Replaced, not pushed, so Back still leaves the page. Scrolling never writes the hash.
  if (url) history.replaceState(null, '', id === 'hero' ? location.pathname + location.search : `#${id}`);
  // Without a landing of its own, a section can still ask to start a little past its top (a flowing
  // About waits out the hero's hand-off).
  const offset = Number(target.dataset.jumpOffset ?? 0);
  const top = id === 'hero' ? 0 : landings.get(id)?.() ?? target.getBoundingClientRect().top + window.scrollY + offset;
  scrollToTarget(top, { immediate });
  focusHeading(target);
}
