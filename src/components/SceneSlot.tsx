/**
 * A stable <section> for a below-the-fold scene. The scene's code loads when the section comes
 * within one viewport (or when a far jump asks for every scene); until then the section holds
 * an estimated height so anchors and progress stay roughly right.
 */
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { registerSceneLoader } from '../lib/jump';
import { revealHeading } from '../lib/micro';
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
  const mounted = useRef<(() => void) | null>(null);
  const unregister = useRef<(() => void) | null>(null);

  useEffect(() => {
    let pending: Promise<void> | null = null;
    const start = () =>
      (pending ??= new Promise<void>((resolve) => {
        mounted.current = resolve;
        void load().then((m) => setScene(() => m.default));
      }));
    unregister.current = registerSceneLoader(id, start);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void start();
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
  }, [Scene]);

  return (
    <section
      id={id}
      ref={ref}
      className={`scene scene--${id}`}
      aria-labelledby={`${id}-title`}
      style={Scene ? undefined : { minHeight: estimate }}
    >
      {Scene ? <Scene /> : null}
    </section>
  );
}
