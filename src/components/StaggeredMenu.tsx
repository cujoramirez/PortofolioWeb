import { useCallback, useLayoutEffect, useRef, useState, useEffect, type FC, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { useSystemProfile } from './useSystemProfile';

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right';
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  logoUrl?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  isFixed?: boolean;
  changeMenuColorOnOpen?: boolean;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  onItemClick?: (link: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  zIndex?: number;
  toolbarHeight?: number;
  toolbarPadding?: number;
}

export const StaggeredMenu: FC<StaggeredMenuProps> = ({
  position = 'right',
  colors = ['#60a5fa', '#1e40af'],
  items = [],
  displayItemNumbering = true,
  className,
  menuButtonColor = '#fff',
  openMenuButtonColor = '#fff',
  changeMenuColorOnOpen = true,
  accentColor = '#3b82f6',
  isFixed = false,
  onMenuOpen,
  onMenuClose,
  onItemClick,
  open,
  onOpenChange,
  zIndex,
  toolbarHeight,
  toolbarPadding
}) => {
  const { performanceTier, deviceType } = useSystemProfile();
  const prefersLightweightMenu = performanceTier === 'low' && deviceType !== 'mobile';
  const enablePreLayers = performanceTier === 'high';

  const resolvedToolbarHeight = toolbarHeight ?? 66;
  const resolvedToolbarPadding = toolbarPadding ?? 16;
  
  const isControlled = typeof open === 'boolean';
  const [internalOpen, setInternalOpen] = useState(open ?? false);
  const menuOpen = isControlled ? (open as boolean) : internalOpen;
  const prevOpenRef = useRef(menuOpen);
  const initialOpenRef = useRef(menuOpen);
  const [panelRendered, setPanelRendered] = useState(menuOpen);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const plusHRef = useRef<HTMLSpanElement | null>(null);
  const plusVRef = useRef<HTMLSpanElement | null>(null);
  const iconRef = useRef<HTMLSpanElement | null>(null);



  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const spinTweenRef = useRef<gsap.core.Timeline | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);

  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const busyRef = useRef(false);

  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  const requestOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }

      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;

      if (!panel || !plusH || !plusV || !icon) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer && enablePreLayers) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer')) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set(panel, {
        xPercent: initialOpenRef.current ? 0 : offscreen,
        autoAlpha: initialOpenRef.current ? 1 : 0,
        display: initialOpenRef.current ? 'flex' : 'none'
      });

      if (preLayers.length) {
        gsap.set(preLayers, {
          xPercent: initialOpenRef.current ? 0 : offscreen,
          autoAlpha: initialOpenRef.current ? 1 : 0,
          display: initialOpenRef.current ? 'block' : 'none'
        });
      }

      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: menuOpen ? 45 : 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: menuOpen ? -45 : 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });

      if (toggleBtnRef.current) {
        const color = menuOpen && changeMenuColorOnOpen ? openMenuButtonColor : menuButtonColor;
        gsap.set(toggleBtnRef.current, { color });
      }
    });
    return () => ctx.revert();
  }, [menuButtonColor, openMenuButtonColor, changeMenuColorOnOpen, position, enablePreLayers, panelRendered, menuOpen]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
  const layers = enablePreLayers ? preLayerElsRef.current : [];
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
    ) as HTMLElement[];

    const layerStates = layers.map((el) => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });

    const tl = gsap.timeline({ paused: true });

    // Optimize layer animations for performance
    const layerDuration = prefersLightweightMenu ? 0.35 : 0.5;
    const layerStagger = prefersLightweightMenu ? 0.05 : 0.07;
    const layerEase = prefersLightweightMenu ? 'power2.out' : 'power4.out';

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: layerDuration, ease: layerEase }, i * layerStagger);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * layerStagger : 0;
    const panelInsertTime = lastTime + (layerStates.length ? (prefersLightweightMenu ? 0.04 : 0.08) : 0);
    const panelDuration = prefersLightweightMenu ? 0.45 : 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
      const itemDuration = prefersLightweightMenu ? 0.6 : 1;
      const itemStagger = prefersLightweightMenu ? 0.06 : 0.1;
      const itemEase = prefersLightweightMenu ? 'power2.out' : 'power4.out';

      tl.to(
        itemEls,
        { yPercent: 0, rotate: 0, duration: itemDuration, ease: itemEase, stagger: { each: itemStagger, from: 'start' } },
        itemsStart
      );

      if (numberEls.length) {
        const numDuration = prefersLightweightMenu ? 0.4 : 0.6;
        const numStagger = prefersLightweightMenu ? 0.05 : 0.08;
        tl.to(
          numberEls,
          { duration: numDuration, ease: 'power2.out', ['--sm-num-opacity' as any]: 1, stagger: { each: numStagger, from: 'start' } },
          itemsStart + 0.1
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [prefersLightweightMenu, enablePreLayers]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;

    const startAnimation = () => {
      const tl = buildOpenTimeline();
      if (tl) {
        const panel = panelRef.current;
        const layers = enablePreLayers ? preLayerElsRef.current : [];
        if (panel) {
          gsap.set(panel, { autoAlpha: 1, display: 'flex' });
        }
        if (layers.length) {
          gsap.set(layers, { autoAlpha: 1, display: 'block' });
        }
        tl.eventCallback('onComplete', () => {
          busyRef.current = false;
        });
        tl.play(0);
      } else {
        busyRef.current = false;
      }
    };

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(startAnimation);
    } else {
      startAnimation();
    }
  }, [buildOpenTimeline, enablePreLayers]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = enablePreLayers ? preLayerElsRef.current : [];
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    const offscreen = position === 'left' ? -100 : 100;
    
    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: prefersLightweightMenu ? 0.24 : 0.32,
      ease: prefersLightweightMenu ? 'power2.in' : 'power3.in',
      overwrite: 'auto',
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel')) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { ['--sm-num-opacity' as any]: 0 });

        gsap.set(all, { autoAlpha: 0, display: 'none' });
        setPanelRendered(false);
        busyRef.current = false;
      }
    });
  }, [position, prefersLightweightMenu, enablePreLayers]);

  const animateIcon = useCallback((opening: boolean) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();

    const openDuration = prefersLightweightMenu ? 0.35 : 0.5;
    const closeDuration = prefersLightweightMenu ? 0.25 : 0.35;
    const openEase = prefersLightweightMenu ? 'power2.out' : 'power4.out';
    const closeEase = prefersLightweightMenu ? 'power2.inOut' : 'power3.inOut';

    if (opening) {
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: openEase } })
        .to(h, { rotate: 45, duration: openDuration }, 0)
        .to(v, { rotate: -45, duration: openDuration }, 0);
    } else {
      spinTweenRef.current = gsap
        .timeline({ defaults: { ease: closeEase } })
        .to(h, { rotate: 0, duration: closeDuration }, 0)
        .to(v, { rotate: 90, duration: closeDuration }, 0)
        .to(icon, { rotate: 0, duration: 0.001 }, 0);
    }
  }, [prefersLightweightMenu]);

  const animateColor = useCallback(
    (opening: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  // No text animation needed - we just use the icon
  const animateText = useCallback((_opening: boolean) => {
    // Removed text animation
  }, []);

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      if (typeof document !== 'undefined') {
        const active = document.activeElement as HTMLElement | null;
        if (active && panelRef.current?.contains(active)) {
          active.blur();
        }
      }
      toggleBtnRef.current?.focus({ preventScroll: true });
      requestOpenChange(false);
    } else {
      requestOpenChange(true);
    }
  }, [menuOpen, requestOpenChange]);

  useEffect(() => {
    if (menuOpen) {
      setPanelRendered(true);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      prevOpenRef.current = true;
      if (!panelRendered) {
        return;
      }
      onMenuOpen?.();
      playOpen();
      animateIcon(true);
      animateColor(true);
      animateText(true);
      return;
    }

    if (!prevOpenRef.current) {
      return;
    }

    prevOpenRef.current = false;
    onMenuClose?.();
    playClose();
    animateIcon(false);
    animateColor(false);
    animateText(false);
  }, [menuOpen, panelRendered, onMenuOpen, onMenuClose, playOpen, playClose, animateIcon, animateColor, animateText]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (menuOpen) {
      panel.removeAttribute('inert');
    } else {
      panel.setAttribute('inert', '');
    }
  }, [menuOpen, panelRendered]);

  return (
    <div
      className={`sm-scope ${isFixed ? 'fixed top-0 left-0 w-screen h-screen' : 'w-full h-full'}`}
      style={{ 
        zIndex: zIndex ?? 1400,
        pointerEvents: 'auto',
        overflow: menuOpen ? 'hidden' : 'visible'
      }}
    >
      <div
        className={(className ? className + ' ' : '') + 'staggered-menu-wrapper relative w-full h-full'}
        style={accentColor ? ({ ['--sm-accent' as any]: accentColor } as CSSProperties) : undefined}
        data-position={position}
        data-open={menuOpen || undefined}
      >
        {enablePreLayers && panelRendered && (
          <div
            ref={preLayersRef}
            className="sm-prelayers absolute top-0 right-0 bottom-0 pointer-events-none z-[5]"
            aria-hidden="true"
          >
            {(() => {
              const raw = colors && colors.length ? colors.slice(0, 3) : ['#1e1e22', '#35353c'];
              return raw.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0 will-change-transform"
                  style={{
                    background: c,
                    opacity: i === 0 ? 0.9 : 0.6 - i * 0.15,
                    mixBlendMode: 'screen',
                  }}
                />
              ));
            })()}
          </div>
        )}

        <header
          className="staggered-menu-header fixed top-0 left-0 right-0 bg-transparent pointer-events-none z-[9999]"
          aria-label="Main navigation header"
          style={{
            height: `${resolvedToolbarHeight}px`,
            padding: `0 ${resolvedToolbarPadding}px`,
            mixBlendMode: 'normal'
          }}
        >
          <button
            ref={toggleBtnRef}
            className="sm-toggle relative inline-flex items-center justify-center bg-transparent border-0 cursor-pointer overflow-visible pointer-events-auto transition-all duration-300 text-white w-[48px] h-[48px]"
            style={{
              background: menuOpen ? 'linear-gradient(135deg, rgba(30,64,175,0.22), rgba(59,130,246,0.18))' : 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1.5px solid rgba(148, 163, 184, 0.15)',
              padding: 8,
              boxShadow: menuOpen ? '0 8px 24px rgba(59,130,246,0.12)' : '0 2px 8px rgba(0,0,0,0.08)'
            }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="staggered-menu-panel"
            onClick={toggleMenu}
            type="button"
          >
            <span
              ref={iconRef}
              className="sm-icon relative w-[24px] h-[24px] shrink-0 inline-flex items-center justify-center [will-change:transform]"
              aria-hidden="true"
            >
              <span
                ref={plusHRef}
                className="sm-icon-line absolute left-1/2 top-1/2 w-full h-[2.5px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
              <span
                ref={plusVRef}
                className="sm-icon-line sm-icon-line-v absolute left-1/2 top-1/2 w-full h-[2.5px] bg-current rounded-[2px] -translate-x-1/2 -translate-y-1/2 [will-change:transform]"
              />
            </span>
          </button>
        </header>

        {panelRendered && (
          <aside
            id="staggered-menu-panel"
            ref={panelRef}
            className="staggered-menu-panel absolute top-0 right-0 h-full flex flex-col overflow-y-auto z-10"
            style={{ pointerEvents: menuOpen ? 'auto' : 'none' }}
            aria-hidden={menuOpen ? undefined : true}
          >
            <div
              className={`sm-panel-surface ${prefersLightweightMenu ? 'sm-panel-surface--light' : 'sm-panel-surface--rich'}`}
            >
              <div className="sm-panel-inner flex-1 flex flex-col gap-3 p-[5em_2em_2em_2em] h-full">
                <ul
                  className="sm-panel-list list-none m-0 p-0 flex flex-col gap-2"
                  role="list"
                  data-numbering={displayItemNumbering || undefined}
                >
                  {items && items.length ? (
                    items.map((it, idx) => (
                      <li className="sm-panel-itemWrap relative overflow-hidden leading-none" key={it.label + idx}>
                        <a
                          className="sm-panel-item relative text-white font-semibold text-[3.5rem] cursor-pointer leading-[0.95] tracking-[-1.5px] uppercase transition-[color] duration-200 ease-out inline-block no-underline pr-[1.2em] hover:text-[var(--sm-accent,#3b82f6)]"
                          href={it.link}
                          aria-label={it.ariaLabel}
                          data-index={idx + 1}
                          onClick={(e) => {
                            if (onItemClick) {
                              e.preventDefault();
                              onItemClick(it.link);
                            }
                            if (typeof document !== 'undefined') {
                              const active = document.activeElement as HTMLElement | null;
                              if (active && panelRef.current?.contains(active)) {
                                active.blur();
                              }
                            }
                            toggleBtnRef.current?.focus({ preventScroll: true });
                          }}
                        >
                          <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                            {it.label}
                          </span>
                        </a>
                      </li>
                    ))
                  ) : (
                    <li className="sm-panel-itemWrap relative overflow-hidden leading-none" aria-hidden="true">
                      <span className="sm-panel-item relative text-white font-semibold text-[3.5rem] cursor-pointer leading-[0.95] tracking-[-1.5px] uppercase inline-block no-underline pr-[1.2em]">
                        <span className="sm-panel-itemLabel inline-block [transform-origin:50%_100%] will-change-transform">
                          No items
                        </span>
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </aside>
        )}
      </div>

      <style>{`
.sm-scope .staggered-menu-wrapper { position: relative; width: 100%; height: 100%; z-index: 40; }
.sm-scope .staggered-menu-header { position: fixed; top: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: flex-end; gap: 0.65rem; background: transparent; pointer-events: none; z-index: 9999; }
.sm-scope .staggered-menu-header > * { pointer-events: auto; }
.sm-scope .sm-toggle { position: relative; display: inline-flex; align-items: center; gap: 0.3rem; background: transparent; border: none; cursor: pointer; font-weight: 500; line-height: 1; overflow: visible; font-size: 0.95rem; }
.sm-scope .sm-toggle:focus-visible { outline: 2px solid rgba(59, 130, 246, 0.6); outline-offset: 4px; border-radius: 4px; }
.sm-scope .sm-toggle-textWrap { position: relative; margin-right: 0.5em; display: inline-block; height: 1em; overflow: hidden; white-space: nowrap; width: var(--sm-toggle-width, auto); min-width: var(--sm-toggle-width, auto); }
.sm-scope .sm-toggle-textInner { display: flex; flex-direction: column; line-height: 1; }
.sm-scope .sm-toggle-line { display: block; height: 1em; line-height: 1; }
.sm-scope .sm-icon { position: relative; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; align-items: center; justify-content: center; will-change: transform; }
.sm-scope .sm-panel-itemWrap { position: relative; overflow: hidden; line-height: 1; }
.sm-scope .sm-icon-line { position: absolute; left: 50%; top: 50%; width: 100%; height: 2px; background: currentColor; border-radius: 2px; transform: translate(-50%, -50%); will-change: transform; }
.sm-scope .staggered-menu-panel { position: absolute; top: 0; right: 0; width: clamp(280px, 40vw, 450px); height: 100%; display: flex; flex-direction: column; overflow-y: auto; z-index: 10; }
.sm-scope [data-position='left'] .staggered-menu-panel { right: auto; left: 0; }
.sm-scope .sm-prelayers { position: absolute; top: 0; right: 0; bottom: 0; width: clamp(280px, 40vw, 450px); pointer-events: none; z-index: 5; }
.sm-scope [data-position='left'] .sm-prelayers { right: auto; left: 0; }
.sm-scope .sm-prelayer { position: absolute; top: 0; right: 0; height: 100%; width: 100%; transform: translateX(0); }
.sm-scope .sm-panel-inner { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
.sm-scope .sm-panel-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.sm-scope .sm-panel-itemLabel { display: inline-block; will-change: transform; transform-origin: 50% 100%; }
.sm-scope .sm-panel-list[data-numbering] { counter-reset: smItem; }
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { counter-increment: smItem; content: counter(smItem, decimal-leading-zero); position: absolute; top: 0.15em; right: 0; font-size: 1rem; font-weight: 400; color: rgba(59, 130, 246, 0.7); letter-spacing: 0; pointer-events: none; user-select: none; opacity: var(--sm-num-opacity, 0); transition: opacity 0.3s ease; }
.sm-panel-surface { position: relative; width: 100%; height: 100%; border-radius: 0; overflow: hidden; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(148, 163, 184, 0.16); box-shadow: 0 18px 48px rgba(15, 23, 42, 0.3); background: linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.82)); }
.sm-panel-surface::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 20%, rgba(30, 64, 175, 0.28), transparent 55%), radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.2), transparent 60%); opacity: 0.85; pointer-events: none; }
.sm-panel-surface::after { content: ''; position: absolute; inset: 0; background: linear-gradient(160deg, rgba(148, 163, 184, 0.12), rgba(15, 23, 42, 0.65)); mix-blend-mode: lighten; pointer-events: none; }
.sm-panel-surface--light { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.75)); box-shadow: 0 12px 32px rgba(15, 23, 42, 0.24); }
.sm-panel-surface--light::before { opacity: 0.7; }
.sm-panel-surface--rich { box-shadow: 0 20px 56px rgba(15, 23, 42, 0.38); }
.sm-panel-surface--rich::before { opacity: 0.95; }
@media (max-width: 1024px) { 
  .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } 
  .sm-scope .sm-prelayers { width: 100%; } 
}
@media (max-width: 640px) { 
  .sm-scope .staggered-menu-panel { width: 100%; left: 0; right: 0; } 
  .sm-scope .sm-panel-item { font-size: 2.75rem !important; } 
  .sm-scope .sm-prelayers { width: 100%; } 
  .sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after { font-size: 0.875rem; }
}
      `}</style>
    </div>
  );
};

export default StaggeredMenu;
