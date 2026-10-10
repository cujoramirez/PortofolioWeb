/**
 * Links that would leave the page. A plain click on one opens the portal (components/Portal.tsx)
 * over the page instead of a new tab; a click with a modifier key, a middle click and the
 * context menu keep the browser's own behaviour, and without JavaScript they are ordinary links.
 * Only the click test lives in the first bundle: the portal and its state load when a pointer or
 * the keyboard first reaches such a link.
 */
import { LINKS } from '../content/site';

export interface Outbound {
  href: string;
  /** What the link called itself. */
  label: string;
  /** Where on screen it was opened from: the portal grows out of this point. */
  x: number;
  y: number;
}

const host = () => import('./portal');

/** Another site, or the résumé file. Not the portal's own way out. */
function leaves(a: HTMLAnchorElement): boolean {
  if (a.hasAttribute('data-portal-exit') || a.hasAttribute('download') || !/^https?:$/.test(a.protocol)) return false;
  return a.origin !== location.origin || a.pathname === LINKS.resume;
}

function open(link: Outbound) {
  host().then(
    (m) => m.openPortal(link),
    // the portal could not load: the link still goes somewhere
    () => window.open(link.href, '_blank', 'noopener') ?? location.assign(link.href),
  );
}

/** Open the portal on an address from code (the search palette). */
export function openOutbound(href: string, label: string) {
  open({ href: new URL(href, location.href).href, label, x: innerWidth / 2, y: innerHeight / 2 });
}

export function installOutbound(): () => void {
  const outbound = (target: EventTarget | null) => {
    const a = (target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    return a && leaves(a) ? a : null;
  };
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const a = outbound(event.target);
    if (!a) return;
    event.preventDefault();
    const r = a.getBoundingClientRect();
    open({ href: a.href, label: (a.getAttribute('aria-label') ?? a.textContent ?? '').trim(), x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };
  const warm = (event: Event) => {
    if (!outbound(event.target)) return;
    void host();
    cool();
  };
  const cool = () => {
    document.removeEventListener('pointerover', warm);
    document.removeEventListener('focusin', warm);
  };
  document.addEventListener('click', onClick);
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('focusin', warm);
  return () => {
    cool();
    document.removeEventListener('click', onClick);
  };
}
