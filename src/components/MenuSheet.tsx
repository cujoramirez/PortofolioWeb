/**
 * The menu below 900 px, staged like the rest of the site ("built in layers"):
 *  open   a veil irises out of the menu button; the section rows swing down out of depth, hinged at
 *         their top edge and staggered, while the button's two bars fold into an X;
 *  pick   the chosen row flies toward you as the others fall away; behind the veil the page jumps to
 *         that section, then the veil collapses into the row and the section is simply there;
 *  close  everything folds back up and the veil irises back into the button.
 * Rows tilt toward a pressing finger or pointer (1:1) and settle on release. Native <dialog> (focus
 * trap, Escape, top layer); reduced motion gets a short fade and a plain jump.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import SocialIcon from './SocialIcon';
import ThemeToggle from './ThemeToggle';
import { LINKS, NAV, OWNER } from '../content/site';
import { gsap } from '../lib/gsap';
import { focusHeading, jumpTo } from '../lib/jump';
import { motionAllowed } from '../lib/motion';
import { lockScroll } from '../lib/scroll';
import './menu.css';

interface MenuSheetProps {
  open: boolean;
  active: string | null;
  /** How far through each section the reader is, 0..1. */
  progress: (id: string) => number;
  /** The navbar's menu button: the iris starts and ends there. */
  button: () => HTMLElement | null;
  onClosed: () => void;
  onSearch: () => void;
}

const SOCIAL = [
  { label: 'LinkedIn', icon: 'LinkedIn', href: LINKS.linkedin },
  { label: 'GitHub', icon: 'GitHub', href: LINKS.github },
  { label: 'Google Scholar', icon: 'Google Scholar', href: LINKS.scholar },
  { label: 'Email', icon: 'Email', href: `mailto:${LINKS.email}` },
];

export default function MenuSheet({ open, active, progress, button, onClosed, onSearch }: MenuSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const unlock = useRef<(() => void) | null>(null);
  const busy = useRef(false);

  const q = (sel: string) => [...(ref.current?.querySelectorAll<HTMLElement>(sel) ?? [])];

  /** Centre of the iris and its full radius. */
  const aim = (el: HTMLElement | null) => {
    const d = ref.current;
    const r = el?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : window.innerWidth - 40;
    const cy = r ? r.top + r.height / 2 : 40;
    d?.style.setProperty('--cx', `${cx}px`);
    d?.style.setProperty('--cy', `${cy}px`);
    return Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy)) + 8;
  };

  const finish = useCallback(() => {
    const d = ref.current;
    if (d?.open) d.close();
    unlock.current?.();
    unlock.current = null;
    busy.current = false;
    onClosed();
  }, [onClosed]);

  // open: the top bar sits exactly over the navbar, then the scene plays in
  useLayoutEffect(() => {
    const d = ref.current;
    if (!open || !d) return;
    const bar = document.querySelector<HTMLElement>('.nav__bar')?.getBoundingClientRect();
    if (bar) {
      d.style.setProperty('--bar-l', `${bar.left}px`);
      d.style.setProperty('--bar-t', `${bar.top}px`);
      d.style.setProperty('--bar-w', `${bar.width}px`);
      d.style.setProperty('--bar-h', `${bar.height}px`);
    }
    q('.menu__meter').forEach((m) => m.style.setProperty('--p', String(progress(m.dataset.id ?? ''))));
    gsap.set([d, ...q('.menu__top > *')], { clearProps: 'opacity' });
    if (!d.open) d.showModal();
    unlock.current = lockScroll();
    busy.current = false;
    const R = aim(button());
    const veil = q('.menu__veil');
    const rows = q('.menu__list > li');
    const rest = q('.menu__foot > *');
    const [top, bottom] = q('.menu__bars i');
    const floor = q('.menu__floor');
    gsap.killTweensOf([veil, rows, rest, d, top, bottom, floor]);
    if (!motionAllowed()) {
      gsap.set(veil, { '--r': `${R}px` });
      gsap.set(top, { y: 0, rotate: 45 });
      gsap.set(bottom, { y: 0, rotate: -45 });
      gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.2 });
      return;
    }
    gsap
      .timeline()
      // the two bars of the menu button fold into an X
      .fromTo(top, { y: -4, rotate: 0 }, { y: 0, rotate: 45, duration: 0.5, ease: 'power3.inOut' }, 0.04)
      .fromTo(bottom, { y: 4, rotate: 0 }, { y: 0, rotate: -45, duration: 0.5, ease: 'power3.inOut' }, 0.04)
      .fromTo(veil, { '--r': '0px' }, { '--r': `${R}px`, duration: 0.62, ease: 'power3.inOut' }, 0)
      // the stage floor tips up out of the dark
      .fromTo(
        floor,
        { rotateX: 86, opacity: 0, transformPerspective: 700, transformOrigin: '50% 100%' },
        { rotateX: 64, opacity: 1, duration: 1, ease: 'power3.out' },
        0.08,
      )
      .fromTo(
        rows,
        { rotateX: -96, z: -90, opacity: 0 },
        { rotateX: 0, z: 0, opacity: 1, duration: 0.8, ease: 'power4.out', stagger: 0.065 },
        0.16,
      )
      .fromTo(rest, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.05 }, 0.45);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = useCallback(
    ({ refocus = true, then }: { refocus?: boolean; then?: () => void } = {}) => {
    const d = ref.current;
    if (!d || busy.current) return;
    busy.current = true;
    const done = () => {
      finish();
      if (refocus) button()?.focus({ preventScroll: true });
      then?.();
    };
    if (!motionAllowed()) {
      gsap.to(d, { opacity: 0, duration: 0.15, onComplete: done });
      return;
    }
    aim(button());
    const [top, bottom] = q('.menu__bars i');
    gsap
      .timeline({ onComplete: done })
      .to(top, { y: -4, rotate: 0, duration: 0.45, ease: 'power3.inOut' }, 0)
      .to(bottom, { y: 4, rotate: 0, duration: 0.45, ease: 'power3.inOut' }, 0)
      .to(q('.menu__foot > *'), { y: 16, opacity: 0, duration: 0.22, ease: 'power2.in' }, 0)
      .to(q('.menu__list > li'), { rotateX: -96, z: -90, opacity: 0, duration: 0.36, ease: 'power2.in', stagger: { each: 0.04, from: 'end' } }, 0)
      .to(q('.menu__veil'), { '--r': '0px', duration: 0.5, ease: 'power3.inOut' }, 0.16);
    },
    [button, finish],
  );

  const pick = async (id: string, li: HTMLElement) => {
    const d = ref.current;
    if (!d || busy.current) return;
    busy.current = true;
    const target = document.getElementById(id);
    if (!motionAllowed()) {
      finish();
      await jumpTo(id);
      return;
    }
    const others = q('.menu__list > li').filter((el) => el !== li);
    await gsap
      .timeline()
      .to(q('.menu__foot > *, .menu__top > *'), { opacity: 0, duration: 0.2 }, 0)
      .to(others, { rotateX: 96, z: -70, opacity: 0, duration: 0.38, ease: 'power2.in', stagger: 0.03 }, 0)
      .to(li, { z: 180, opacity: 0, duration: 0.46, ease: 'power2.in' }, 0.06)
      .then();
    // behind the veil: release the scroll lock and land on the section
    unlock.current?.();
    unlock.current = null;
    await jumpTo(id, { immediate: true });
    const R = aim(li);
    gsap.set(q('.menu__veil'), { '--r': `${R}px` });
    await gsap.to(q('.menu__veil'), { '--r': '0px', duration: 0.6, ease: 'power3.inOut' }).then();
    finish();
    if (target) focusHeading(target);
  };

  // Rows lean toward the pressing finger or pointer, 1:1, and settle on release.
  const lean = (e: ReactPointerEvent<HTMLElement>) => {
    if (!motionAllowed() || busy.current) return;
    const li = e.currentTarget;
    const r = li.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.set(li, { rotateY: px * 10, rotateX: -py * 14, z: 14 });
  };
  const settle = (e: ReactPointerEvent<HTMLElement>) => {
    if (busy.current) return;
    gsap.to(e.currentTarget, { rotateY: 0, rotateX: 0, z: 0, duration: 0.45, ease: 'power3.out' });
  };

  // Escape and backdrop close through the same choreography.
  useEffect(() => {
    const d = ref.current;
    if (!d) return undefined;
    const onCancel = (e: Event) => {
      e.preventDefault();
      close();
    };
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === d) close();
    };
    d.addEventListener('cancel', onCancel);
    d.addEventListener('click', onBackdrop);
    return () => {
      d.removeEventListener('cancel', onCancel);
      d.removeEventListener('click', onBackdrop);
    };
  }, [close]);

  // unmounting while open (hot reload, route change) must not leave the page locked
  useEffect(() => () => unlock.current?.(), []);

  return (
    <dialog ref={ref} className="menu" aria-label="Menu">
      <div className="menu__veil" aria-hidden="true">
        <span className="menu__floor" />
      </div>
      <div className="menu__top">
        <span className="menu__brand">{OWNER}</span>
        <ThemeToggle />
        <button type="button" className="icon-btn menu__close" aria-label="Close menu" onClick={() => close()}>
          <span className="menu__bars" aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>
      {open ? (
        <div className="menu__body">
          <nav aria-label="Sections">
            <ol className="menu__list">
              {NAV.map((item, i) => (
                <li
                  key={item.id}
                  onPointerDown={lean}
                  onPointerMove={lean}
                  onPointerLeave={settle}
                  onPointerUp={settle}
                  onPointerCancel={settle}
                >
                  <a
                    className="menu__link"
                    href={`#${item.id}`}
                    aria-current={active === item.id ? 'true' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      void pick(item.id, e.currentTarget.parentElement as HTMLElement);
                    }}
                  >
                    <span className="menu__num mono" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="menu__label">{item.label}</span>
                    <span className="menu__meter" data-id={item.id} aria-hidden="true">
                      <i />
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="menu__foot">
            <div className="menu__actions">
              <button
                type="button"
                className="btn btn--secondary"
                // the palette opens once the menu has closed (never two modal dialogs at once)
                onClick={() => close({ refocus: false, then: onSearch })}
              >
                Search
              </button>
              <a className="btn btn--secondary" href={LINKS.resume} target="_blank" rel="noopener">
                Résumé (PDF)
              </a>
            </div>
            <ul className="menu__social" aria-label="Elsewhere">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    className="icon-btn"
                    href={s.href}
                    aria-label={s.label}
                    {...(/^https?:/.test(s.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <SocialIcon name={s.icon} size={20} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
