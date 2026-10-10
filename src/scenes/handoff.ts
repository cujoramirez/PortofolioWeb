/**
 * Hero -> About hand-off. The About scene pins while the hero is still dispersing (it sits under
 * the pinned hero), so the About card is stationary while the hero portrait flies into it.
 *
 *   hero pin        HERO_PIN viewport heights (x k)
 *   dispersal       the last HERO_DISPERSE of the hero timeline
 *   About lead-in   the same scroll distance: About waits while the portrait lands
 */
export const HERO_PIN = 1.2;
export const HERO_DISPERSE = 0.25;

/** Scroll distance of the dispersal, in px. */
export const leadPx = (k: number) => HERO_PIN * HERO_DISPERSE * window.innerHeight * k;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Layout box of `el` relative to `ancestor` (a positioned element), ignoring transforms. */
export function offsetWithin(el: HTMLElement, ancestor: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top, width: el.offsetWidth, height: el.offsetHeight };
}
