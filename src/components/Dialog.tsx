/**
 * Native modal <dialog>: focus trap, Escape and top layer come for free. Focus returns to the
 * element that opened it; background scrolling pauses while open. Clicking the backdrop closes.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from './icons';
import { lockScroll } from '../lib/scroll';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Visually hide the title (it still names the dialog). */
  hideTitle?: boolean;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Dialog({ open, onClose, title, hideTitle, full, className, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // The native close event also fires when we close it ourselves; only report user closes.
  const openRef = useRef(open);
  openRef.current = open;
  // A close we trigger ourselves (cleanup, re-open) fires an async close event: ignore it.
  const selfClose = useRef(false);
  // Native overlay transitions keep the closed dialog painted briefly: keep what it last showed.
  // Nothing before the first open, or both archives (400 nodes) would mount with the page.
  const held = useRef<{ children: ReactNode; title: string } | null>(null);
  if (open) held.current = { children, title };

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    if (!open) {
      if (dialog.open) {
        selfClose.current = true;
        dialog.close();
      }
      return undefined;
    }
    opener.current = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    const unlock = lockScroll();
    return () => {
      unlock();
      if (dialog.open) {
        selfClose.current = true;
        dialog.close();
      }
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`dialog${full ? ' dialog--full' : ''}${className ? ` ${className}` : ''}`}
      aria-label={title}
      onClose={() => {
        if (selfClose.current) {
          selfClose.current = false;
          return;
        }
        if (openRef.current) onCloseRef.current();
      }}
      onCancel={(e) => {
        e.preventDefault();
        onCloseRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div className="dialog__head">
        <h2 className={hideTitle ? 'sr-only' : 'dialog__title'}>{open ? title : held.current?.title ?? title}</h2>
        <button type="button" className="icon-btn" aria-label="Close" onClick={() => onCloseRef.current()}>
          <CloseIcon />
        </button>
      </div>
      {open ? children : held.current?.children ?? null}
    </dialog>
  );
}
