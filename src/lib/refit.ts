/**
 * Scenes choose their layout when they build, from what fits the window at that moment: pinned
 * or flowing, grid or row, deck or stack. A build runs again only when the media variant
 * changes, so a window resized within one variant kept a choice that no longer held (a desktop
 * window made 220 px shorter kept a pinned grid taller than itself, while a fresh load at that
 * size flowed). After a resize that can change those choices every scene builds again, in one
 * turn, and the page is put back at the same place in the same section.
 */
import { ScrollTrigger } from './gsap';
import { scrollToTarget } from './scroll';

const rebuilds = new Map<HTMLElement, () => void>();
let built = { w: 0, h: 0 };
let timer = 0;
/**
 * Where the page last came to rest. Read after scrolling, not when the resize begins: by the
 * first resize event everything sized in viewport units has already moved, and ScrollTrigger's
 * own refresh then keeps the pixel offset, which is another place again.
 */
let stood: ReturnType<typeof place> = null;
let resting = 0;

/** Where the page stands: the section across a line a third of the way down, and how far through it. */
function place() {
  const line = window.innerHeight / 3;
  const sections = [...document.querySelectorAll<HTMLElement>('section.scene')];
  const el = sections.filter((s) => s.getBoundingClientRect().top <= line).pop() ?? sections[0];
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { el, part: (line - r.top) / Math.max(1, r.height) };
}

function refit() {
  timer = 0;
  const dw = Math.abs(window.innerWidth - built.w);
  const dh = Math.abs(window.innerHeight - built.h);
  // A phone's address bar changes the height alone, by under a fifth: that is not a new window.
  const touch = window.matchMedia('(pointer: coarse) and (hover: none)').matches;
  if (!dw && dh <= (touch ? built.h * 0.2 : 0)) return;
  // not under a dialog (an on-screen keyboard resizes some browsers): once it has closed
  if (document.querySelector('dialog[open]')) {
    document.addEventListener('close', schedule, { capture: true, once: true });
    return;
  }
  built = { w: window.innerWidth, h: window.innerHeight };
  [...rebuilds.entries()]
    .sort(([a], [b]) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .forEach(([, rebuild]) => rebuild());
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  const at = stood;
  if (!at?.el.isConnected) return;
  const r = at.el.getBoundingClientRect();
  scrollToTarget(Math.max(0, window.scrollY + r.top + at.part * r.height - window.innerHeight / 3), { immediate: true });
}

// after ScrollTrigger's own refresh, which follows the last resize event by 200 ms
function schedule() {
  stood ??= place();
  window.clearTimeout(resting);
  window.clearTimeout(timer);
  timer = window.setTimeout(refit, 260);
}

// one read once scrolling has stopped, never while a resize is being worked out
function rested() {
  window.clearTimeout(resting);
  if (!timer) resting = window.setTimeout(() => (stood = place()), 150);
}

/** Register a scene's rebuild. Returns the function that removes it. */
export function onRefit(section: HTMLElement, rebuild: () => void): () => void {
  if (!rebuilds.size) {
    built = { w: window.innerWidth, h: window.innerHeight };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('scroll', rested, { passive: true });
  }
  rebuilds.set(section, rebuild);
  return () => {
    rebuilds.delete(section);
    if (rebuilds.size) return;
    window.clearTimeout(timer);
    window.clearTimeout(resting);
    timer = 0;
    window.removeEventListener('resize', schedule);
    window.removeEventListener('scroll', rested);
  };
}
