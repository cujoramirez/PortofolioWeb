/**
 * Scroll setup, navbar and the scenes in order. The hero is static HTML already in index.html
 * (HeroScene only attaches its choreography); every later scene loads on approach.
 */
import { useEffect } from 'react';

import Backdrop from './components/Backdrop';
import Nav from './components/Nav';
import SceneSlot, { type SceneDef } from './components/SceneSlot';
import HeroScene from './scenes/HeroScene';
import { OWNER } from './content/site';
import { startAnalytics } from './lib/analytics';
import { fontsReady } from './lib/fonts';
import { ScrollTrigger } from './lib/gsap';
import { fragmentId, jumpTo, loadAllScenes } from './lib/jump';
import { motionAllowed } from './lib/motion';
import { installOutbound, openOutbound } from './lib/outbound';
import { initScroll, refreshSoon, scrollToTarget } from './lib/scroll';

const SCENES: SceneDef[] = [
  { id: 'about', load: () => import('./scenes/AboutScene'), estimate: '360vh' },
  { id: 'disciplines', load: () => import('./scenes/DisciplinesScene'), estimate: '210vh' },
  { id: 'toolbox', load: () => import('./scenes/ToolboxScene'), estimate: '160vh' },
  { id: 'projects', load: () => import('./scenes/ProjectsScene'), estimate: '560vh' },
  { id: 'experience', load: () => import('./scenes/ExperienceScene'), estimate: '380vh' },
  { id: 'papers', load: () => import('./scenes/PapersScene'), estimate: '250vh' },
  { id: 'certificates', load: () => import('./scenes/CertificatesScene'), estimate: '110vh' },
  { id: 'contact', load: () => import('./scenes/ContactScene'), estimate: '200vh' },
];

/** Overlay hashes (useHashDialog) and the section whose scene opens each overlay. */
const OVERLAY_HOME: Record<string, string> = { 'all-projects': 'projects', 'all-certificates': 'certificates' };

/** Every in-page anchor (including the static hero's) goes through jumpTo. */
function useAnchorJumps() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = anchor?.getAttribute('href') ?? '';
      if (hash.length < 2) return;
      const id = fragmentId(hash);
      // "Skip to content": to the start of the content, wherever the page is. Focusing the first
      // heading where it stood failed deep in the page, where the hero is hidden.
      if (id === 'main') {
        event.preventDefault();
        void jumpTo('hero', { immediate: true });
        return;
      }
      if (!document.getElementById(id)) return;
      event.preventDefault();
      void jumpTo(id);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export default function App() {
  useAnchorJumps();
  useEffect(() => installOutbound(), []);
  useEffect(startAnalytics, []);

  useEffect(() => {
    const stop = initScroll();
    void fontsReady().then(() => refreshSoon());
    const onLoad = () => refreshSoon();
    window.addEventListener('load', onLoad);
    const hash = fragmentId(location.hash);
    // An overlay link opens from a lazy scene, which a cold load never mounted: mount the scenes
    // and stand on the overlay's section, leaving the hash for useHashDialog.
    if (OVERLAY_HOME[hash]) void jumpTo(OVERLAY_HOME[hash], { immediate: true, url: false });
    else if (hash && document.getElementById(hash)) void jumpTo(hash, { immediate: true });
    // A hash typed into the address bar scrolls natively, to the section's first pixel and past
    // scenes that have not mounted: land it where a jump would.
    const onHash = () => {
      const id = fragmentId(location.hash);
      if (!OVERLAY_HOME[id] && document.getElementById(id)?.matches('section')) void jumpTo(id, { immediate: true, url: false });
    };
    window.addEventListener('hashchange', onHash);
    // dev only: ?at=papers_350 opens the page scrolled to a scene (the iOS Simulator cannot scroll),
    // and ?out=<address> opens the portal on an address (it cannot tap either)
    if (import.meta.env.DEV) {
      const out = new URLSearchParams(location.search).get('out');
      if (out) window.setTimeout(() => openOutbound(out, ''), 2500);
      const at = /^([a-z]+)(?:_(-?\d+))?$/.exec(new URLSearchParams(location.search).get('at') ?? '');
      if (at) {
        window.setTimeout(() => {
          void loadAllScenes().then(() => {
            ScrollTrigger.refresh();
            const el = document.getElementById(at[1]);
            if (el) scrollToTarget(el.getBoundingClientRect().top + window.scrollY + Number(at[2] ?? 0), { immediate: true });
          });
        }, 1200);
      }
    }
    // easter eggs: off the critical path, once the page is idle
    let undoEggs: (() => void) | undefined;
    let live = true;
    const whenIdle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    whenIdle(() => {
      void import('./lib/eggs').then(
        (eggs) => {
          if (live) undoEggs = eggs.installEggs();
        },
        // extras: the page is whole without them
        () => {},
      );
    });
    // The cursor label waits for a mouse to move: nothing needs a label before the pointer is
    // somewhere, and a phone, which fetched it and ran none of it, never asks.
    let undoCursor: (() => void) | undefined;
    const onMouse = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      window.removeEventListener('pointermove', onMouse);
      void import('./lib/cursor').then(
        (cursor) => {
          if (live) undoCursor = cursor.installCursorLabel();
        },
        () => {},
      );
    };
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && motionAllowed()) window.addEventListener('pointermove', onMouse, { passive: true });
    return () => {
      live = false;
      undoEggs?.();
      undoCursor?.();
      window.removeEventListener('pointermove', onMouse);
      stop();
      window.removeEventListener('load', onLoad);
      window.removeEventListener('hashchange', onHash);
      ScrollTrigger.killAll();
    };
  }, []);

  return (
    <>
      <Backdrop />
      <Nav />
      <HeroScene />
      {SCENES.map((scene) => (
        <SceneSlot key={scene.id} {...scene} />
      ))}
      <footer className="footer wrap">
        <p className="mono">
          © {new Date().getFullYear()} {OWNER}
        </p>
      </footer>
    </>
  );
}
