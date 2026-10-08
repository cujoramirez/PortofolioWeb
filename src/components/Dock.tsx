/**
 * Contact links as a dock (after macOS and React Bits' Dock): on hover-capable screens the icons
 * magnify with distance from the pointer (set 1:1, no easing) and settle on leave; a label rises
 * on hover or keyboard focus. On touch screens the labels simply sit under the icons.
 */
import { useEffect, useRef } from 'react';
import TechIcon from './TechIcon';
import { LINKS } from '../content/site';
import { motionAllowed } from '../lib/motion';

const ITEMS = [
  { label: 'LinkedIn', icon: 'LinkedIn', href: LINKS.linkedin },
  { label: 'GitHub', icon: 'GitHub', href: LINKS.github },
  { label: 'Google Scholar', icon: 'Google Scholar', href: LINKS.scholar },
  { label: 'Email', icon: 'Email', href: `mailto:${LINKS.email}` },
  { label: 'Résumé (PDF)', icon: 'Résumé', href: LINKS.resume },
];
const REACH = 130; // px of pointer distance over which an icon grows
const GROW = 0.32;

export default function Dock() {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const dock = ref.current;
    if (!dock || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || !motionAllowed()) return undefined;
    const icons = [...dock.querySelectorAll<HTMLElement>('.dock__icon')];
    const move = (e: PointerEvent) => {
      dock.classList.remove('is-settling');
      icons.forEach((icon) => {
        const r = icon.getBoundingClientRect();
        const d = Math.abs(e.clientX - (r.left + r.width / 2));
        const s = 1 + GROW * Math.max(0, 1 - d / REACH) ** 1.5;
        icon.style.transform = `translateY(${(-(s - 1) * 22).toFixed(1)}px) scale(${s.toFixed(3)})`;
      });
    };
    const leave = () => {
      dock.classList.add('is-settling');
      icons.forEach((icon) => (icon.style.transform = ''));
    };
    dock.addEventListener('pointermove', move, { passive: true });
    dock.addEventListener('pointerleave', leave);
    return () => {
      dock.removeEventListener('pointermove', move);
      dock.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <ul ref={ref} className="dock" aria-label="Elsewhere">
      {ITEMS.map((item) => {
        const ext = /^https?:/.test(item.href) || item.href.endsWith('.pdf');
        return (
          <li key={item.label}>
            <a className="dock__item" href={item.href} {...(ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              <span className="dock__icon">
                <TechIcon name={item.icon} size={24} />
              </span>
              <span className="dock__label">{item.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
