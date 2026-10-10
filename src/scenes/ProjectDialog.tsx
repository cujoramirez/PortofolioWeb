/** Full detail for one project: image, full description, every technology, and its links. */
import Dialog from '../components/Dialog';
import Picture, { ladder } from '../components/Picture';
import { ArrowUpRight, PlayIcon } from '../components/icons';
import { isIllustration, splitTitle, type Project } from '../content/data';
import { player } from '../lib/youtube';

export function ProjectLinks({ project }: { project: Project }) {
  const extra = project.links.filter((l) => l !== project.demo && l !== project.github);
  if (!project.demo && !project.github && !extra.length) return null;
  // a demo on YouTube plays in the portal; any other link leaves for a new tab
  const plays = Boolean(project.demo && player(project.demo));
  return (
    <p className="project-links">
      {project.demo ? (
        <a className="btn btn--primary" href={project.demo} target="_blank" rel="noopener noreferrer" data-preview={plays ? '' : undefined}>
          Live demo {plays ? <PlayIcon /> : <ArrowUpRight />}
        </a>
      ) : null}
      {project.github ? (
        <a className="btn btn--secondary" href={project.github} target="_blank" rel="noopener noreferrer">
          GitHub <ArrowUpRight />
        </a>
      ) : null}
      {extra.map((href) => (
        <a key={href} className="text-link" href={href} target="_blank" rel="noopener noreferrer">
          {new URL(href).hostname.replace(/^www\./, '')}
        </a>
      ))}
    </p>
  );
}

export default function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [name, subtitle] = project ? splitTitle(project.title) : ['', null];
  const img = project ? ladder('projects', project.image) : undefined;
  return (
    <Dialog open={Boolean(project)} onClose={onClose} title={name} className="project-dialog">
      {project ? (
        <div className="project-dialog__body">
          {img ? (
            <figure className="project-dialog__plate plate dots">
              <Picture img={img} sizes="(min-width: 800px) 720px, 92vw" alt="" className="project-dialog__img" eager />
              {isIllustration(project.image) ? <figcaption className="project-dialog__caption mono">Illustration</figcaption> : null}
            </figure>
          ) : null}
          {subtitle ? <p className="project-dialog__sub">{subtitle}</p> : null}
          <p className="project-dialog__desc">{project.description}</p>
          <ul className="chips" aria-label="Technologies">
            {project.technologies.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
          <ProjectLinks project={project} />
        </div>
      ) : null}
    </Dialog>
  );
}
