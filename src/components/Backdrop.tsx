/**
 * Mounts the color-bends canvas into the static `.bends` layer from index.html, after the page
 * has loaded and the main thread is idle (the shader compile never competes with the hero).
 */
import { useEffect } from 'react';

export default function Backdrop() {
  useEffect(() => {
    const host = document.querySelector<HTMLElement>('.bends');
    if (!host) return undefined;
    let stop: (() => void) | null = null;
    let cancelled = false;
    const canvas = document.createElement('canvas');
    canvas.dataset.ready = 'false';

    const start = () => {
      void import('../lib/bends').then(({ startBends }) => {
        if (cancelled) return;
        host.appendChild(canvas);
        stop = startBends(canvas);
        if (!stop) {
          canvas.remove();
          return;
        }
        // fade in on the next paint (a one-off transition, not a loop)
        window.requestAnimationFrame(() => (canvas.dataset.ready = 'true'));
      });
    };
    const idle = () => {
      if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(start, { timeout: 2500 });
      else setTimeout(start, 600);
    };
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener('load', idle);
      stop?.();
      canvas.remove();
    };
  }, []);
  return null;
}
