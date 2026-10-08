/**
 * Projects. Four featured projects as exploded app cards: each enters from the right in 3D,
 * explodes into its layers (Screen, Story, Stack, Actions) mid-segment, reassembles flat, and
 * exits left as the next one enters. Below, the other projects sit on a tilted wall that
 * straightens as it scrolls in, and a full archive opens in a dialog.
 * Phones: a vertical stack; each card has a small exploded moment as it crosses the centre.
 */
import { useEffect, useRef, useState } from 'react';
import Picture, { ladder } from '../components/Picture';
import { featuredProjects, firstSentence, moreWorkProjects, projects, splitTitle, type Project } from '../content/data';
import { FEATURED } from '../content/site';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/useScene';
import ProjectDialog, { ProjectLinks } from './ProjectDialog';
import ProjectsArchive from './ProjectsArchive';
import ProjectWall from './ProjectWall';
import { useHashDialog } from './useHashDialog';
import './projects.css';

const TAGS = ['Screen', 'Story', 'Stack', 'Actions'];
const SEGMENT = 0.62; // viewport heights of scroll per featured project (x k)

function FeaturedCard({ project, index, total, onDetails }: { project: Project; index: number; total: number; onDetails: () => void }) {
  const [name, subtitle] = splitTitle(project.title);
  const meta = FEATURED[name];
  const img = ladder('projects', project.image);
  const id = `project-${index}`;
  const count = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  return (
    <article className="pcard" aria-labelledby={id}>
      <div className="pcard__tilt">
        <div className="pcard__rig">
          <div className="pcard__base" aria-hidden="true" />
          <div className={`pcard__screen plate dots${meta?.fit === 'contain' ? ' is-contain' : ''}`} data-l="0">
            {img ? <Picture img={img} sizes="(min-width: 1024px) 640px, 92vw" alt="" className="pcard__img" /> : null}
            <span className="layer-tag pcard__tag" aria-hidden="true">
              {TAGS[0]}
            </span>
          </div>
          <div className="pcard__story" data-l="1">
            <p className="pcard__meta mono">
              <span className="pcard__count">
                <span className="sr-only">Project </span>
                {count}
              </span>
              {meta ? <span className="pcard__kind">{meta.kind}</span> : null}
            </p>
            <h3 id={id} className="pcard__title">
              {name}
            </h3>
            <p className="pcard__summary">{meta?.summary ?? subtitle ?? firstSentence(project.description)}</p>
            {meta ? (
              <ul className="pcard__highlights">
                {meta.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <span className="layer-tag pcard__tag" aria-hidden="true">
              {TAGS[1]}
            </span>
          </div>
          <div className="pcard__stack" data-l="2">
            <ul className="chips" aria-label="Technologies">
              {project.technologies.slice(0, 5).map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
            <span className="layer-tag pcard__tag" aria-hidden="true">
              {TAGS[2]}
            </span>
          </div>
          <div className="pcard__actions" data-l="3">
            <button type="button" className="btn btn--secondary" onClick={onDetails} aria-label={`Details: ${name}`}>
              Details
            </button>
            <ProjectLinks project={{ ...project, links: [] }} />
            <span className="layer-tag pcard__tag" aria-hidden="true">
              {TAGS[3]}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Add one card's explode-and-reassemble moment to a timeline: a gentle turn, the layers lift in
 * even steps, and each layer's tag appears on its own edge. Scaled down a little while apart so
 * the lifted layers never leave the viewport.
 */
function explode(tl: gsap.core.Timeline, card: HTMLElement, at: number, len: number, depth: number, turn = true) {
  const rig = card.querySelector('.pcard__rig');
  const base = card.querySelector('.pcard__base');
  const layers = card.querySelectorAll('[data-l]');
  const tags = card.querySelectorAll('.pcard__tag');
  const apart = len * 0.36;
  const hold = len - 2 * apart;
  if (turn) tl.to(rig, { rotateX: 8, rotateY: -14, scale: 0.9, duration: apart, ease: 'power1.inOut' }, at);
  else tl.to(rig, { rotateX: 4, duration: apart, ease: 'power1.inOut' }, at);
  tl.to(base, { z: -depth * 0.5, duration: apart, ease: 'power1.inOut' }, at);
  layers.forEach((layer, i) => tl.to(layer, { z: i * depth + i + 1, duration: apart, ease: 'power1.inOut' }, at));
  if (turn) {
    tl.to(tags, { opacity: 1, duration: apart * 0.4, stagger: apart * 0.08 }, at + apart * 0.55);
    tl.to(tags, { opacity: 0, duration: apart * 0.35 }, at + apart + hold - apart * 0.1);
  }
  tl.to(rig, { rotateX: 0, rotateY: 0, scale: 1, duration: apart, ease: 'power1.inOut' }, at + apart + hold);
  // back to the resting 1px steps (base 0, layers 1-4) that keep Safari from z-fighting
  tl.to([base, ...layers], { z: (i: number) => i, duration: apart, ease: 'power1.inOut' }, at + apart + hold);
}

/** Pointer tilt on desktop: follows the pointer 1:1 (a transform, no easing); eases back on leave. */
function tilt(card: HTMLElement): () => void {
  const el = card.querySelector<HTMLElement>('.pcard__tilt');
  if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const move = (e: PointerEvent) => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.set(el, { rotateY: x * 6, rotateX: -y * 5 });
  };
  const leave = () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' });
  card.addEventListener('pointermove', move, { passive: true });
  card.addEventListener('pointerleave', leave);
  return () => {
    card.removeEventListener('pointermove', move);
    card.removeEventListener('pointerleave', leave);
  };
}

export default function ProjectsScene() {
  const root = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<Project | null>(null);
  const archive = useHashDialog('#all-projects');

  // The command palette asks for a project's details by title.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      const p = projects.find((x) => x.title === title);
      if (p) setDetail(p);
    };
    window.addEventListener('open-project', onOpen);
    return () => window.removeEventListener('open-project', onOpen);
  }, []);

  useScene(root, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const cards = q('.pcard') as HTMLElement[];
    const plane = q('.wall__plane')[0];

    if (variant === 'mobile') {
      cards.forEach((card) => {
        const rig = card.querySelector('.pcard__rig');
        const base = card.querySelector('.pcard__base');
        const layers = card.querySelectorAll('[data-l]');
        const tags = card.querySelectorAll('.pcard__tag');
        const tiltEl = card.querySelector('.pcard__tilt');
        // arrives exploded and turned, its layers named, and assembles as it rises to be read
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 28%', scrub: 0.6 } })
          .fromTo(rig, { rotateX: 16, rotateY: -24, scale: 0.86 }, { rotateX: 0, rotateY: 0, scale: 1, duration: 1, ease: 'power2.out', immediateRender: true }, 0)
          .fromTo(base, { z: -36 }, { z: 0, duration: 1, ease: 'power2.out', immediateRender: true }, 0)
          .fromTo(layers, { z: (i: number) => (i + 1) * 48 }, { z: (i: number) => i + 1, duration: 1, ease: 'power2.out', immediateRender: true }, 0)
          .fromTo(tags, { opacity: 1 }, { opacity: 0, duration: 0.25, immediateRender: true }, 0.62);
        // tips back and recedes as it leaves the top
        gsap.fromTo(
          tiltEl,
          { rotateX: 0, z: 0, opacity: 1 },
          {
            rotateX: 26,
            z: -150,
            opacity: 0.25,
            ease: 'power1.in',
            transformOrigin: '50% 100%',
            immediateRender: false,
            scrollTrigger: { trigger: card, start: 'bottom 42%', end: 'bottom top', scrub: 0.6 },
          },
        );
      });
      gsap.fromTo(plane, { rotateX: 16, y: 40 }, { rotateX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: plane, start: 'top bottom', end: 'top 50%', scrub: 0.6 } });
      return undefined;
    }

    const n = cards.length;
    const x = () => window.innerWidth * 0.6;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: q('.projects__seq')[0],
        start: 'top top',
        end: () => `+=${(n - 0.15) * SEGMENT * window.innerHeight * k}`,
        pin: q('.projects__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    cards.forEach((card, i) => {
      if (i > 0) {
        tl.fromTo(
          card,
          { x, rotateY: -55, z: -400 * k, autoAlpha: 0 },
          { x: 0, rotateY: 0, z: 0, autoAlpha: 1, duration: 0.24, ease: 'power2.out', immediateRender: true },
          i - 0.15,
        );
      }
      explode(tl, card, i + 0.22, 0.4, 70 * k);
      if (i < n - 1) {
        tl.to(card, { x: () => -x(), rotateY: 45, z: -200 * k, autoAlpha: 0, duration: 0.24, ease: 'power2.in' }, i + 0.8);
      }
    });

    // Pad to the full pin so one timeline unit is exactly one segment of scroll.
    tl.set({}, {}, n - 0.15);
    const untilt = cards.map(tilt);

    gsap.fromTo(
      plane,
      { rotateX: 24, z: -200 * k },
      { rotateX: 0, z: 0, ease: 'none', scrollTrigger: { trigger: plane, start: 'top bottom', end: 'top 30%', scrub: 0.6 } },
    );
    return () => untilt.forEach((fn) => fn());
  });

  return (
    <div ref={root} className="projects">
      <header className="projects__head wrap">
        <h2 id="projects-title" className="heading">
          Projects
        </h2>
        <p className="lede">Four projects that show the range: native apps for iOS and macOS, on-device medical imaging, and a vision backbone trained from scratch.</p>
      </header>

      <div className="projects__seq">
        <div className="projects__pin">
          <div className="projects__persp persp">
            <div className="projects__stage stage">
              {featuredProjects.map((p, i) => (
                <FeaturedCard key={p.title} project={p} index={i} total={featuredProjects.length} onDetails={() => setDetail(p)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProjectWall projects={moreWorkProjects} total={projects.length} onOpen={setDetail} onArchive={archive.show} />
      <ProjectDialog project={detail} onClose={() => setDetail(null)} />
      <ProjectsArchive open={archive.open} onClose={archive.hide} projects={projects} />
    </div>
  );
}
