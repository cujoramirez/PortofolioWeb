/**
 * A stable <section> for a below-the-fold scene. The scene's code loads when the section comes
 * within one viewport (or when a far jump asks for every scene); until then the section holds
 * an estimated height so anchors and progress stay roughly right.
 */
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { SECTIONS, UNLOADED } from '../content/site';
import { registerSceneLoader } from '../lib/jump';
import { revealHeading } from '../lib/micro';
import { MQ } from '../lib/motion';
import { refreshSoon } from '../lib/scroll';

export interface SceneDef {
  id: string;
  load: () => Promise<{ default: ComponentType }>;
  /** Placeholder height before the scene mounts (CSS length). */
  estimate: string;
}

export default function SceneSlot({ id, load, estimate }: SceneDef) {
  const ref = useRef<HTMLElement>(null);
  const [Scene, setScene] = useState<ComponentType | null>(null);
  /** The scene's code did not download. */
  const [failed, setFailed] = useState(false);
  const mounted = useRef<(() => void) | null>(null);
  const unregister = useRef<(() => void) | null>(null);
  const start = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    let pending: Promise<void> | null = null;
    start.current = () =>
      (pending ??= new Promise<void>((resolve) => {
        mounted.current = resolve;
        load().then(
          (m) => setScene(() => m.default),
          () => {
            // Settled, not left waiting: every jump waits for every scene, so one failed download
            // stopped all navigation. A later jump asks again, for the engines that fetch again.
            pending = null;
            mounted.current = null;
            setFailed(true);
            resolve();
          },
        );
      }));
    unregister.current = registerSceneLoader(id, () => start.current());
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void start.current();
        }
      },
      { rootMargin: '100% 0px' },
    );
    if (ref.current) io.observe(ref.current);
    return () => {
      io.disconnect();
      unregister.current?.();
    };
  }, [id, load]);

  // The heading reveals follow the reduced-motion setting while the page is open, as the scenes do.
  const [calm, setCalm] = useState(() => window.matchMedia(MQ.reduce).matches);
  useEffect(() => {
    const reduce = window.matchMedia(MQ.reduce);
    const onChange = () => setCalm(reduce.matches);
    reduce.addEventListener('change', onChange);
    return () => reduce.removeEventListener('change', onChange);
  }, []);

  // Runs after the scene's own layout effects (its ScrollTriggers exist by now).
  useEffect(() => {
    if (!Scene) return undefined;
    unregister.current?.();
    mounted.current?.();
    // section headings assemble word by word as they enter
    const headings = ref.current ? [...ref.current.querySelectorAll<HTMLElement>('.heading, .contact__title')] : [];
    const undo = headings.map(revealHeading);
    refreshSoon();
    return () => undo.forEach((fn) => fn());
  }, [Scene, calm]);

  // the placeholder's height goes with a failed download: the pins below measure again
  useEffect(() => {
    if (failed) refreshSoon();
  }, [failed]);

  return (
    <section
      id={id}
      ref={ref}
      className={`scene scene--${id}`}
      aria-labelledby={`${id}-title`}
      style={Scene || failed ? undefined : { minHeight: estimate }}
    >
      {Scene ? (
        <Scene />
      ) : failed ? (
        <div className="wrap" style={{ paddingBlock: '16vh' }}>
          <h2 id={`${id}-title`} className="heading">
            {SECTIONS.find((section) => section.id === id)?.title}
          </h2>
          <p className="lede" role="status">
            {UNLOADED.section} {UNLOADED.hint}
          </p>
          <p style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                // back to this section once the page has loaded again
                history.replaceState(null, '', `#${id}`);
                location.reload();
              }}
            >
              {UNLOADED.reload}
            </button>
          </p>
        </div>
      ) : null}
    </section>
  );
}
