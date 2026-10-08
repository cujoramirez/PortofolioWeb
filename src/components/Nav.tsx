/**
 * Fixed glass navbar (the only glass surface): name, section links with progress ticks,
 * theme toggle, résumé, a 2px overall progress line, `g` + letter shortcuts and a `?` help
 * dialog. Below 900 px the links move into a native <dialog> sheet.
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Dialog from './Dialog';
import ThemeToggle from './ThemeToggle';
import { MenuIcon } from './icons';
import { LINKS, NAV, OWNER, type SectionId } from '../content/site';
import { ScrollTrigger } from '../lib/gsap';
import { installGlass, trackSpecular } from '../lib/glass';
import { jumpTo } from '../lib/jump';

// The palette carries every project and paper: load it the first time it opens.
const CommandPalette = lazy(() => import('./CommandPalette'));
// The menu sheet exists only below 900 px. As a lazy chunk its code stays out of the desktop first
// load and its stylesheet out of the HTML (the entry CSS is inlined there).
const loadMenuSheet = () => import('./MenuSheet');
const MenuSheet = lazy(loadMenuSheet);

/** Sections that count toward a nav item's progress and active state. */
const OWNED: Record<string, SectionId[]> = {
  about: ['about', 'disciplines', 'toolbox'],
  projects: ['projects'],
  experience: ['experience'],
  papers: ['papers', 'certificates'],
  contact: ['contact'],
};
const TICKS = 4;

function isEditable(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

export default function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  useEffect(() => {
    if (paletteOpen) setPaletteUsed(true);
  }, [paletteOpen]);
  const [menuUsed, setMenuUsed] = useState(false);
  useEffect(() => {
    if (menuOpen) setMenuUsed(true);
  }, [menuOpen]);
  // Where the menu button shows, fetch the sheet once the page is idle so the first tap opens it at once.
  useEffect(() => {
    if (!window.matchMedia('(max-width: 899px)').matches) return undefined;
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(() => void loadMenuSheet());
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => void loadMenuSheet(), 1500);
    return () => window.clearTimeout(id);
  }, []);
  const progressRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const barRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);

  // Liquid glass: Chromium refraction filter + a pointer-tracked specular on the bar.
  useEffect(() => {
    installGlass();
    return barRef.current ? trackSpecular(barRef.current) : undefined;
  }, []);

  // Overall progress line and per-section progress: ScrollTrigger callbacks, no frame loop.
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const bar = progressRef.current;
    triggers.push(
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        refreshPriority: -10,
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress.toFixed(4)})`;
        },
      }),
    );
    const live = new Set<string>();
    const order = NAV.map((n) => n.id);
    for (const item of NAV) {
      const [first, ...rest] = OWNED[item.id];
      const firstEl = document.getElementById(first);
      const lastEl = document.getElementById(rest.length ? rest[rest.length - 1] : first);
      if (!firstEl || !lastEl) continue;
      triggers.push(
        ScrollTrigger.create({
          trigger: firstEl,
          endTrigger: lastEl,
          start: 'top 55%',
          end: 'bottom 55%',
          refreshPriority: -10,
          onToggle: (self) => {
            if (self.isActive) live.add(item.id);
            else live.delete(item.id);
            const current = order.filter((id) => live.has(id)).pop() ?? null;
            setActive(current);
          },
          onUpdate: (self) => {
            linkRefs.current[item.id]?.style.setProperty('--p', self.progress.toFixed(3));
          },
        }),
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, []);

  // Keyboard: `g` then a letter jumps to a section; `?` lists the shortcuts.
  useEffect(() => {
    let pendingAt = 0;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || isEditable(event.target)) return;
      if (document.querySelector('dialog[open]')) return;
      if (event.key === '?') {
        event.preventDefault();
        setHelpOpen(true);
        return;
      }
      const key = event.key.toLowerCase();
      if (pendingAt && performance.now() - pendingAt < 900) {
        pendingAt = 0;
        const target = key === 'h' ? 'hero' : NAV.find((n) => n.key === key)?.id;
        if (target) {
          event.preventDefault();
          void jumpTo(target);
        }
        return;
      }
      pendingAt = key === 'g' ? performance.now() : 0;
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const closedMenu = useCallback(() => setMenuOpen(false), []);
  const menuButton = useCallback(() => menuBtn.current, []);
  const sectionProgress = useCallback((id: string) => Number(linkRefs.current[id]?.style.getPropertyValue('--p') || 0), []);
  const openPalette = useCallback(() => setPaletteOpen(true), []);

  const links = (onPick?: (id: string) => void) =>
    NAV.map((item) => (
      <li key={item.id}>
        <a
          ref={onPick ? undefined : (el) => void (linkRefs.current[item.id] = el)}
          href={`#${item.id}`}
          aria-current={active === item.id ? 'true' : undefined}
          onClick={
            onPick
              ? (e) => {
                  e.preventDefault();
                  onPick(item.id);
                }
              : undefined
          }
        >
          <span className="nav__label" data-label={item.label}>
            {item.label}
          </span>
          {onPick ? null : (
            <span className="nav__ticks" aria-hidden="true">
              {Array.from({ length: TICKS }, (_, k) => (
                <i key={k} style={{ ['--k' as string]: k }} />
              ))}
            </span>
          )}
        </a>
      </li>
    ));

  const target = document.getElementById('nav-root');
  const ui = (
    <>
      <header className="nav">
        <div ref={barRef} className="nav__bar glass glass--refract">
          <span className="glass__specwrap" aria-hidden="true">
            <span className="glass__spec" />
          </span>
          <a className="nav__brand" href="#hero">
            {OWNER}
          </a>
          <nav className="nav__links" aria-label="Sections">
            <ol>{links()}</ol>
          </nav>
          <div className="nav__tools">
            <button type="button" className="nav__search" aria-label="Search and jump" aria-keyshortcuts="Meta+K Control+K" onClick={() => setPaletteOpen(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <span className="nav__search-label">Search</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="icon-btn nav__help" aria-label="Keyboard shortcuts" onClick={() => setHelpOpen(true)}>
              <span aria-hidden="true">?</span>
            </button>
            <ThemeToggle />
            <a className="btn btn--ghost nav__resume" href={LINKS.resume} target="_blank" rel="noopener">
              Résumé
            </a>
            <button
              ref={menuBtn}
              type="button"
              className="icon-btn nav__menu"
              aria-label="Menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
          <span ref={progressRef} className="nav__progress" aria-hidden="true" />
        </div>
      </header>

      {paletteUsed ? (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={closePalette} />
        </Suspense>
      ) : null}

      <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Keyboard shortcuts" className="help-dialog">
        <table className="help-dialog__keys">
          <tbody>
            <tr>
              <td>
                <kbd>⌘</kbd> <kbd>K</kbd>
              </td>
              <td>Search and jump</td>
            </tr>
            {[{ key: 'h', label: 'Top' }, ...NAV].map((item) => (
              <tr key={item.key}>
                <td>
                  <kbd>g</kbd> <span className="help-dialog__then">then</span> <kbd>{item.key}</kbd>
                </td>
                <td>Go to {item.label}</td>
              </tr>
            ))}
            <tr>
              <td>
                <kbd>?</kbd>
              </td>
              <td>Show this list</td>
            </tr>
          </tbody>
        </table>
        <p className="help-dialog__note">A few things on this page are hidden.</p>
      </Dialog>

      {menuUsed ? (
        <Suspense fallback={null}>
          <MenuSheet
            open={menuOpen}
            active={active}
            progress={sectionProgress}
            button={menuButton}
            onClosed={closedMenu}
            onSearch={openPalette}
          />
        </Suspense>
      ) : null}
    </>
  );
  return target ? createPortal(ui, target) : ui;
}
