/**
 * Keyboard access inside a pinned scene. A pinned scene shows its controls over one stretch of
 * its scroll range, and Tab can land on one while the scene is somewhere else: Contact's links at
 * opacity 0 before the card assembles, a paper under the stacked deck, the phone hero's buttons
 * below the fold. When focus arrives from the keyboard, the page moves to a place in the scene
 * where that control shows.
 */
import type { ScrollTrigger } from './gsap';
import { scrollToTarget } from './scroll';

/** Where in the trigger's range (0 to 1) a control shows: one spot, a span, or null for "anywhere". */
export type Shown = number | [number, number] | null;

export function showOnFocus(scope: HTMLElement, trigger: () => ScrollTrigger | undefined, shown: (el: HTMLElement) => Shown): () => void {
  const onFocus = (event: FocusEvent) => {
    const el = event.target as HTMLElement;
    const st = trigger();
    // keyboard focus only: a click or a tap must not move the page under the pointer
    if (!st || !el.matches?.(':focus-visible')) return;
    const span = shown(el);
    if (span === null) return;
    const [from, to] = typeof span === 'number' ? [span, span] : span;
    if (st.progress >= from - 0.01 && st.progress <= to + 0.01) return;
    scrollToTarget(st.start + (st.end - st.start) * (st.progress < from ? from : to), { immediate: true });
  };
  scope.addEventListener('focusin', onFocus);
  return () => scope.removeEventListener('focusin', onFocus);
}
