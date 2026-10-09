import { motionAllowed } from './motion';

/** Image effects wait behind the LCP and can be cancelled when a scene rebuilds. */
export function afterLoad(start: () => void): () => void {
  let live = true;
  let idle = 0;
  let timer = 0;
  const run = () => { if (live && motionAllowed()) start(); };
  const loaded = () => {
    if (window.requestIdleCallback) idle = window.requestIdleCallback(run, { timeout: 3000 });
    else timer = window.setTimeout(run, 800);
  };
  if (document.readyState === 'complete') loaded();
  else window.addEventListener('load', loaded, { once: true });
  return () => {
    live = false;
    window.removeEventListener('load', loaded);
    if (idle) window.cancelIdleCallback(idle);
    if (timer) window.clearTimeout(timer);
  };
}
