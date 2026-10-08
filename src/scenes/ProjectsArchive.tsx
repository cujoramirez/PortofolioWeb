/** Every project, grouped by kind, each with its full description, stack and links. */
import Dialog from '../components/Dialog';
import { splitTitle, type Project } from '../content/data';
import { ProjectLinks } from './ProjectDialog';

type Kind = 'apps' | 'ai' | 'web' | 'teaching';
const KIND_LABEL: Record<Kind, string> = {
  apps: 'Apps',
  ai: 'AI and computer vision',
  web: 'Web',
  teaching: 'Teaching',
};

export function kindOf(p: Project): Kind {
  const hay = `${p.title} ${p.technologies.join(' ')}`.toLowerCase();
  if (/tutor|lecture|teaching/.test(hay)) return 'teaching';
  if (/\bswift\b|swiftui|music player/.test(hay)) return 'apps';
  if (/laravel|asp\.net/.test(hay)) return 'web';
  return 'ai';
}

export default function ProjectsArchive({ open, onClose, projects }: { open: boolean; onClose: () => void; projects: Project[] }) {
  const groups = (Object.keys(KIND_LABEL) as Kind[])
    .map((kind) => ({ kind, items: projects.filter((p) => kindOf(p) === kind) }))
    .filter((g) => g.items.length);

  return (
    <Dialog open={open} onClose={onClose} title={`All ${projects.length} projects`} full className="archive">
      <div className="archive__body wrap">
        {groups.map((g) => (
          <section key={g.kind} className="archive__group" aria-labelledby={`archive-${g.kind}`}>
            <h3 id={`archive-${g.kind}`} className="archive__kind">
              {KIND_LABEL[g.kind]} <span className="mono">{g.items.length}</span>
            </h3>
            <ul className="archive__grid">
              {g.items.map((p) => {
                const [name, subtitle] = splitTitle(p.title);
                return (
                  <li key={p.title} className="archive__item card">
                    <h4 className="archive__title">{name}</h4>
                    {subtitle ? <p className="archive__sub">{subtitle}</p> : null}
                    <p className="archive__desc">{p.description}</p>
                    <ul className="chips" aria-label="Technologies">
                      {p.technologies.map((t) => (
                        <li key={t} className="chip">
                          {t}
                        </li>
                      ))}
                    </ul>
                    <ProjectLinks project={p} />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  );
}
