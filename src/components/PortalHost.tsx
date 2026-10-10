/**
 * The portal's state: which link it shows, and its place in the browser's history. Mounted by
 * lib/portal.ts, which it hands the function that shows a link.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Portal from './Portal';
import type { Outbound } from '../lib/outbound';
import { scrollToTarget } from '../lib/scroll';

/** Whether the history entry the page is on is the portal's. */
const entry = () => Boolean((history.state as { portal?: boolean } | null)?.portal);

export default function PortalHost({ ready }: { ready: (show: ((link: Outbound) => void) | null) => void }) {
  const [state, setState] = useState<{ link: Outbound | null; open: boolean }>({ link: null, open: false });
  /** Where the page stood when it opened, and whether it is open or on its way back. */
  const step = useRef<{ from: number; standing: boolean; leaving: boolean; opener: HTMLElement | null }>({ from: 0, standing: false, leaving: false, opener: null });
  // Closed, it leaves the document once its exit has played: a video left in a closed dialog
  // would go on playing.
  const shut = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
    window.setTimeout(() => setState((s) => (s.open ? s : { link: null, open: false })), 500);
  }, []);

  useEffect(() => {
    // It stands where a new tab would have: Back closes it, as Back would have left that tab.
    // On the way back the browser scrolls to the section the address names, which can be far
    // from where the visitor was reading (2600 px in a test): the page is put back where it was.
    const show = (link: Outbound) => {
      if (!entry()) {
        step.current.from = window.scrollY;
        step.current.opener = document.activeElement as HTMLElement | null;
        history.pushState({ portal: true }, '');
      }
      step.current = { ...step.current, standing: true, leaving: false };
      setState({ link, open: true });
    };
    // The same step back can also drop the focus the dialog has just returned to its opener.
    const settle = (frames: number) => {
      const { from, opener } = step.current;
      if (Math.abs(window.scrollY - from) > 1) scrollToTarget(from, { immediate: true });
      if (document.activeElement === document.body && opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
      if (frames > 0) requestAnimationFrame(() => settle(frames - 1));
    };
    // only its own step back: a section typed into the address fires this too, and must scroll
    const onPop = () => {
      if (!step.current.standing || entry()) return;
      step.current = { ...step.current, standing: false, leaving: false };
      settle(3);
      shut();
    };
    window.addEventListener('popstate', onPop);
    ready(show);
    return () => {
      ready(null);
      window.removeEventListener('popstate', onPop);
    };
  }, [ready, shut]);

  // Closing it steps back over its history entry, and that is what shuts it (onPop). Once only:
  // Escape can reach here twice (the dialog's cancel, then its close when the browser overrules
  // the cancel), and a second step back left the page.
  const close = useCallback(() => {
    if (step.current.leaving) return;
    if (!entry()) return shut();
    step.current.leaving = true;
    history.back();
  }, [shut]);

  return state.link ? <Portal link={state.link} open={state.open} onClose={close} /> : null;
}
