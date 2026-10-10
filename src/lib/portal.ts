/**
 * Mounts the portal on first use, in a root of its own, so none of it is in the first bundle
 * (lib/outbound.ts loads this).
 */
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import PortalHost from '../components/PortalHost';
import type { Outbound } from './outbound';

let deliver: ((link: Outbound) => void) | null = null;
let waiting: Outbound | null = null;
let mounted = false;

export function openPortal(link: Outbound) {
  if (deliver) return deliver(link);
  waiting = link;
  if (mounted) return;
  mounted = true;
  const el = document.createElement('div');
  document.body.append(el);
  const ready = (show: ((link: Outbound) => void) | null) => {
    deliver = show;
    if (show && waiting) show(waiting);
    if (show) waiting = null;
  };
  createRoot(el).render(createElement(PortalHost, { ready }));
}
