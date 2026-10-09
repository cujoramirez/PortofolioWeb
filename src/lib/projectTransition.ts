import { flushSync } from 'react-dom';
import { motionAllowed } from './motion';

let running = false;
export const projectTransitionActive = () => running;

/** The wall lives outside the featured 3D rig, so its title and image can travel as flat snapshots. */
export function openProjectTransition(source: HTMLElement | undefined, open: () => void): void {
  if (running || document.documentElement.dataset.vt) return;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  // Other engines retain the ordinary dialog transition until their top-layer snapshots are verified.
  const chromium = /Chrome\//.test(navigator.userAgent) && !/EdgiOS|CriOS/.test(navigator.userAgent);
  if (!source || !doc.startViewTransition || !chromium || !motionAllowed()) { open(); return; }
  const image = source.querySelector<HTMLElement>('.wall__img');
  const title = source.querySelector<HTMLElement>('.wall__title');
  const named: HTMLElement[] = [];
  const name = (el: HTMLElement | null, value: string) => { if (el) { el.style.viewTransitionName = value; named.push(el); } };
  name(image, 'project-image');
  name(title, 'project-title');
  const root = document.documentElement;
  root.dataset.vt = 'project';
  running = true;
  let opened = false;
  const done = () => {
    named.forEach((el) => el.style.removeProperty('view-transition-name'));
    delete root.dataset.vt;
    running = false;
  };
  try {
    doc.startViewTransition(() => {
      named.forEach((el) => el.style.removeProperty('view-transition-name'));
      flushSync(open);
      opened = true;
      name(document.querySelector('.project-dialog[open] .project-dialog__img'), 'project-image');
      name(document.querySelector('.project-dialog[open] .dialog__title'), 'project-title');
    }).finished.then(done, done);
  } catch { done(); if (!opened) open(); }
}
