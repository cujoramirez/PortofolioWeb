/**
 * Scroll setup, navbar and the scenes in order. The hero is static HTML already in index.html
 * (HeroScene only attaches its choreography); every later scene loads on approach.
 */
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

import Backdrop from './components/Backdrop';
import Nav from './components/Nav';
import SceneSlot, { type SceneDef } from './components/SceneSlot';
import HeroScene from './scenes/HeroScene';
import { OWNER } from './content/site';
import { ScrollTrigger } from './lib/gsap';
import { focusHeading, jumpTo, loadAllScenes } from './lib/jump';
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

/** Every in-page anchor (including the static hero's) goes through jumpTo. */
function useAnchorJumps() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href^="#"]');
      const hash = anchor?.getAttribute('href') ?? '';
      if (hash.length < 2) return;
      const id = decodeURIComponent(hash.slice(1));
      if (id === 'main') {
        event.preventDefault();
        const main = document.getElementById('main');
        if (main) focusHeading(main);
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

  useEffect(() => {
    const stop = initScroll();
    void document.fonts?.ready.then(() => refreshSoon());
    const onLoad = () => refreshSoon();
    window.addEventListener('load', onLoad);
    const hash = decodeURIComponent(location.hash.slice(1));
    if (hash && document.getElementById(hash)) void jumpTo(hash, { immediate: true });
    // dev only: ?at=papers_350 opens the page scrolled to a scene (the iOS Simulator cannot scroll)
    if (import.meta.env.DEV) {
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
      void Promise.all([import('./lib/eggs'), import('./lib/cursor')]).then(([eggs, cursor]) => {
        if (!live) return;
        const undo = [eggs.installEggs(), cursor.installCursorLabel()];
        undoEggs = () => undo.forEach((fn) => fn());
      });
    });
    return () => {
      live = false;
      undoEggs?.();
      stop();
      window.removeEventListener('load', onLoad);
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
      <Analytics />
      <SpeedInsights />
    </>
  );
}
