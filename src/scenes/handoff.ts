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

/*
 * Phones: the portrait docks in the About card's frame, the two turn edge-on together, and the
 * photo comes round in their place. The portrait is the hero's and the card is About's, so the
 * turn is split across their two timelines and both read it from here.
 */
/** Hero progress at which the portrait has docked and the turn begins. */
export const TURN_FROM = 0.905;
/** Hero progress at which the card is edge-on: nothing of it shows, and the photo takes over. */
export const TURN_EDGE = 0.985;
/** The lower panel (the hero's interface card, then About's first chapter) turns this far ahead. */
export const SHEET_AHEAD = 0.012;
/** Viewing distance of the turn, in px. */
export const TURN_PERSP = 1600;
/** A moment of the hero's progress in About's timeline units (About's lead-in is the dispersal). */
export const inAbout = (progress: number) => (progress - (1 - HERO_DISPERSE)) * HERO_PIN;

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
