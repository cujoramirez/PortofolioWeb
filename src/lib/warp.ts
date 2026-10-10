/**
 * A jump picked in the search palette travels: the view rushes forward into streaks of light and
 * the destination arrives out of them (warp.css). The jump itself is instant, made while the
 * old view is held as a picture. Without View Transitions, or with motion off, it is the
 * ordinary jump.
 */
import { jumpTo, landNow, readyToJump } from './jump';
import { motionAllowed } from './motion';
import { unlocked } from './scroll';
import './warp.css';

const LAYERS = ['warp-rays', 'warp-core'];

export async function warpTo(id: string) {
  // the palette lets go of the page first
  await unlocked();
  const root = document.documentElement;
  const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };
  if (!doc.startViewTransition || !motionAllowed() || root.dataset.vt) return jumpTo(id);
  // The key press that chose the destination gets its own frame first: with the measuring and
  // the picture inside it, the press took up to 216 ms to show at a quarter of the CPU.
  await new Promise<void>((resolve) => requestAnimationFrame(() => window.setTimeout(resolve, 0)));
  // mounted and measured before the picture is taken, so the jump inside lands in the same turn
  await readyToJump();
  if (root.dataset.vt) return jumpTo(id);
  const layers = LAYERS.map((name) => {
    const el = document.createElement('div');
    el.className = 'warp';
    el.setAttribute('aria-hidden', 'true');
    el.style.viewTransitionName = name;
    return el;
  });
  root.dataset.vt = 'warp';
  const done = () => {
    delete root.dataset.vt;
    layers.forEach((el) => el.remove());
  };
  try {
    doc
      .startViewTransition(() => {
        // new with the destination, so they have no picture of their own to animate from
        document.body.append(...layers);
        return jumpTo(id, { immediate: true }).then(landNow);
      })
      .finished.then(done, done);
  } catch {
    done();
    void jumpTo(id, { immediate: true });
  }
}
