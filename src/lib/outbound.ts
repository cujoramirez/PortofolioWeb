/**
 * Links that leave the page, and the portal (components/Portal.tsx). The portal opens over the
 * page only where it has the destination itself to show, or more of it than the link's
 * surroundings already say: the résumé, a paper's details, a certificate at full size, a
 * video. Such a link is marked `data-preview`. Every other link leaves for a new tab as an
 * ordinary link does: a window that repeats what is already on screen is only a second click.
 * A click with a modifier key, a middle click and the context menu always keep the browser's
 * own behaviour, and without JavaScript every link is an ordinary one.
 * Only this test lives in the first bundle: the portal loads when a pointer or the keyboard
 * first reaches a link it will open for.
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

/**
 * Whether the résumé's PDF can be shown in a frame. That takes a PDF viewer made for one, and
 * phones have none: Chrome on Android shows nothing, and iOS draws the first page at its full
 * size over whatever is beside the frame. There the portal shows the pages as pictures.
 */
export const showsPdf = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches && (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false;

/** Whether the portal opens for this link. */
function previews(a: HTMLAnchorElement): boolean {
  if (a.hasAttribute('data-portal-exit') || a.hasAttribute('download')) return false;
  if (a.origin === location.origin) return a.pathname === LINKS.resume;
  return a.hasAttribute('data-preview');
}

function open(link: Outbound) {
  host().then(
    (m) => m.openPortal(link),
    // the portal could not load: the link still goes somewhere
    () => window.open(link.href, '_blank', 'noopener') ?? location.assign(link.href),
  );
}

/** Open the portal on an address from code (the search palette, for what a link would preview). */
export function openOutbound(href: string, label: string) {
  open({ href: new URL(href, location.href).href, label, x: innerWidth / 2, y: innerHeight / 2 });
}

export function installOutbound(): () => void {
  const outbound = (target: EventTarget | null) => {
    const a = (target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
    return a && previews(a) ? a : null;
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
