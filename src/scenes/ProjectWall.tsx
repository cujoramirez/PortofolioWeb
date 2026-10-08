/** "More work": curated projects on a plane that straightens as it scrolls in. */
import { useEffect, useRef } from 'react';
import Picture, { ladder } from '../components/Picture';
import { magnet, spotlight } from '../lib/micro';
import { firstSentence, splitTitle, type Project } from '../content/data';

interface WallProps {
  projects: Project[];
  total: number;
  onOpen: (p: Project) => void;
  onArchive: () => void;
}

export default function ProjectWall({ projects, total, onOpen, onArchive }: WallProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const undo = [
      ...[...el.querySelectorAll<HTMLElement>('.wall__card')].map(spotlight),
      ...[...el.querySelectorAll<HTMLElement>('.wall__foot .btn')].map((b) => magnet(b)),
    ];
    return () => undo.forEach((fn) => fn());
  }, []);
  return (
    <div ref={root} className="wall wrap">
      <h3 className="wall__heading">More work</h3>
      <div className="wall__persp persp">
        <ul className="wall__plane stage">
          {projects.map((p) => {
            const [name] = splitTitle(p.title);
            const img = ladder('projects', p.image);
            return (
              <li key={p.title}>
                <button type="button" className="wall__card card has-spot" onClick={() => onOpen(p)} data-cursor="Open">
                  <span className="wall__thumb">
                    {img ? <Picture img={img} sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw" alt="" className="wall__img" /> : null}
                  </span>
                  <span className="wall__title">{name}</span>
                  <span className="wall__summary">{firstSentence(p.description)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="wall__foot">
        <button type="button" className="btn btn--secondary" onClick={onArchive}>
          View all {total} projects
        </button>
      </div>
    </div>
  );
}
