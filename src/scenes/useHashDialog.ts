/**
 * Open state for a full-screen overlay tied to a URL hash (#all-projects), so the back button
 * closes it and the overlay is deep-linkable. Closing from the UI pops our history entry.
 */
import { useCallback, useEffect, useState } from 'react';

export function useHashDialog(hash: string) {
  const [open, setOpen] = useState(() => location.hash === hash);

  useEffect(() => {
    const sync = () => setOpen(location.hash === hash);
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [hash]);

  const show = useCallback(() => {
    if (location.hash !== hash) history.pushState({ overlay: hash }, '', hash);
    setOpen(true);
  }, [hash]);

  const hide = useCallback(() => {
    setOpen(false);
    if (location.hash !== hash) return;
    if ((history.state as { overlay?: string } | null)?.overlay === hash) history.back();
    else history.replaceState(null, '', location.pathname + location.search);
  }, [hash]);

  return { open, show, hide };
}
