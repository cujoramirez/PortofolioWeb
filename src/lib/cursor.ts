/**
 * A cursor label for interactive objects that do something beyond a click (drag the globe, open a
 * project, follow a DOI, copy the address). Mouse only; follows the pointer 1:1 with a transform
 * and fades out in place. Targets opt in with `data-cursor="Label"`.
 */
import { motionAllowed } from './motion';
import './cursor.css';

export function installCursorLabel(): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || !motionAllowed()) return () => {};
  const chip = document.createElement('div');
  chip.className = 'cursor-chip mono';
  chip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(chip);
  let label = '';
  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element | null)?.closest?.<HTMLElement>('[data-cursor]');
    const next = el?.dataset.cursor ?? '';
    if (next !== label) {
      label = next;
      if (next) chip.textContent = next;
      chip.dataset.on = next ? '1' : '0';
    }
    if (next) chip.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 18}px, 0)`;
  };
  window.addEventListener('pointermove', move, { passive: true });
  return () => {
    window.removeEventListener('pointermove', move);
    chip.remove();
  };
}
