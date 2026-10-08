/**
 * What I do: four disciplines as plates. Desktop/tablet: pinned; the plates start as an exploded
 * isometric stack (one layer per discipline) and assemble into their resting 2 x 2 grid, which is
 * the readable layout. Offsets are measured from the grid (FLIP). Phones: a stack that rises once.
 * Gestalt: one shared plate structure (similarity), each plate a common region, tight spacing
 * inside a plate and wide spacing between plates (proximity).
 */
import { useRef, type ReactNode } from 'react';
import { gsap } from '../lib/gsap';
import { useScene } from '../lib/useScene';
import { DesignMotif, PipelineMotif, ResearchMotif, VitMotif } from './disciplineMotifs';
import './disciplines.css';

interface Discipline {
  title: string;
  line: string;
  skills: string[];
  motif: ReactNode;
}

const DISCIPLINES: Discipline[] = [
  {
    title: 'AI and machine learning',
    line: 'Where I go deepest. Computer vision with vision transformers, detection and medical imaging, from training runs to models that run on the device.',
    skills: ['PyTorch', 'Vision Transformers', 'Object detection', 'Medical imaging', 'CoreML and MLX'],
    motif: <VitMotif />,
  },
  {
    title: 'Software engineering, MLOps and DevOps',
    line: 'I ship what I build: native apps in Swift, Python services, and the work that takes a trained model into a product, from serving to tracking experiments.',
    skills: ['Swift and SwiftUI', 'Python', 'FastAPI', 'Git', 'Weights & Biases'],
    motif: <PipelineMotif />,
  },
  {
    title: 'UI and UX design',
    line: "I design with Apple's Human Interface Guidelines and Gestalt principles, and I justify each decision. FightRoom was built as a worked example.",
    skills: ['Human Interface Guidelines', 'Gestalt principles', 'Accessibility', 'SwiftUI'],
    motif: <DesignMotif />,
  },
  {
    title: 'Research',
    line: 'Five peer-reviewed papers in machine learning, plus field, user and design research for the apps I build at Apple Developer Academy.',
    skills: ['Field research', 'User research', 'Design research', 'Peer-reviewed papers'],
    motif: <ResearchMotif />,
  },
];

export default function DisciplinesScene() {
  const root = useRef<HTMLDivElement>(null);

  useScene(root, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const plates = q('.discipline') as HTMLElement[];

    // Pin only when the assembled grid fits the viewport: first as 2 x 2, then (wide but short
    // windows) as one row of four; otherwise it flows instead.
    const head = q('.disciplines__head')[0] as HTMLElement;
    const gridEl = q('.disciplines__grid')[0] as HTMLElement;
    const navSpace = 76; // nav top offset + bar height + a little air
    const fits = () => head.offsetHeight + gridEl.offsetHeight + navSpace + 16 <= window.innerHeight;
    let tooTall = false;
    if (variant !== 'mobile' && !fits()) {
      if (window.innerWidth >= 1100) section.classList.add('is-row');
      if (!fits()) {
        section.classList.remove('is-row');
        section.classList.add('is-loose');
        tooTall = true;
      }
    }

    // Phones: a pinned deck when a plate fits under the heading. The plates start as an exploded
    // isometric stack, square up into a deck (edges of the cards behind showing), then the front
    // plate is dealt up and away, one discipline at a time.
    if (variant === 'mobile') {
      section.classList.add('is-deck');
      const tallest = Math.max(...plates.map((p) => p.offsetHeight));
      if (navSpace + head.offsetHeight + tallest + 56 <= window.innerHeight) {
        const n = plates.length;
        const deal = 0.8;
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${(0.9 + (n - 1) * deal) * 0.62 * window.innerHeight}`,
            pin: q('.disciplines__pin')[0],
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        // a plate d places behind the front one
        const slot = (d: number) => ({ y: d * 16, z: -d * 70, scale: 1 - d * 0.05, opacity: d > 2 ? 0 : 1 - d * 0.22 });
        const callouts = q('.discipline__tag');
        // the stack starts low and small, clear of the heading, and rises as it squares up
        tl.fromTo(
          gridEl,
          { rotateX: 52, rotateZ: -22, scale: 0.66, y: 70 },
          { rotateX: 0, rotateZ: 0, scale: 1, y: 0, duration: 0.55, ease: 'power2.inOut', immediateRender: true },
          0,
        );
        plates.forEach((plate, i) =>
          tl.fromTo(
            plate,
            { y: 0, z: (n / 2 - 0.5 - i) * 120 + 20, scale: 1, opacity: 1, rotateX: 0 },
            { ...slot(i), duration: 0.55, ease: 'power2.inOut', immediateRender: true },
            0,
          ),
        );
        tl.fromTo(callouts, { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: true }, 0.34);
        for (let i = 0; i < n - 1; i++) {
          const at = 0.9 + i * deal;
          tl.to(plates[i], { rotateX: -64, y: '-=140', z: '+=160', opacity: 0, duration: 0.42, ease: 'power2.in' }, at);
          plates.slice(i + 1).forEach((plate, d) => tl.to(plate, { ...slot(d), duration: 0.42, ease: 'power2.out' }, at + 0.14));
        }
        tl.set({}, {}, 0.9 + (n - 1) * deal);
        return () => section.classList.remove('is-deck');
      }
      section.classList.remove('is-deck');
    }

    if (variant === 'mobile' || tooTall) {
      plates.forEach((plate) =>
        gsap.from(plate, {
          rotateX: 28,
          y: 36,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          transformOrigin: '50% 0%',
          scrollTrigger: { trigger: plate, start: 'top 88%', once: true },
        }),
      );
      return () => section.classList.remove('is-loose');
    }

    const grid = q('.disciplines__grid')[0] as HTMLElement;
    // Offset from each plate's resting cell to the centre of the grid.
    const toCentre = (el: HTMLElement) => ({
      x: grid.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
      y: grid.offsetHeight / 2 - (el.offsetTop + el.offsetHeight / 2),
    });
    const callouts = q('.discipline__tag');

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${0.85 * window.innerHeight * k}`,
        pin: q('.disciplines__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    // exploded: an isometric stack, one layer per discipline, with callouts
    tl.fromTo(
      grid,
      { rotateX: 52, rotateZ: -32, scale: section.classList.contains('is-row') ? 0.58 : 0.72 },
      { rotateX: 0, rotateZ: 0, scale: 1, duration: 0.55, ease: 'power2.inOut', immediateRender: true },
      0.18,
    )
      .fromTo(
        plates,
        { x: (i: number) => toCentre(plates[i]).x, y: (i: number) => toCentre(plates[i]).y, z: (i: number) => (i - 1.5) * 150 * k },
        { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power2.inOut', stagger: 0.05, immediateRender: true },
        0.2,
      )
      .fromTo(callouts, { opacity: 1 }, { opacity: 0, duration: 0.1, immediateRender: true }, 0.16)
      .set({}, {}, 1);
    return () => section.classList.remove('is-row');
  });

  return (
    <div ref={root} className="disciplines">
      <div className="disciplines__pin">
        <header className="disciplines__head wrap">
          <h2 id="disciplines-title" className="heading">
            What I do
          </h2>
          <p className="lede">A generalist across the path from a question to a shipped product, deepest in machine learning and software engineering.</p>
        </header>
        <div className="disciplines__persp persp wrap">
          <ol className="disciplines__grid stage">
            {DISCIPLINES.map((d, i) => (
              <li key={d.title} className="discipline card">
                <div className="discipline__motif">{d.motif}</div>
                <p className="discipline__num mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="discipline__title">{d.title}</h3>
                <p className="discipline__line">{d.line}</p>
                <ul className="chips" aria-label="Skills">
                  {d.skills.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
                <span className="layer-tag discipline__tag" aria-hidden="true">
                  {['AI / ML', 'Engineering', 'Design', 'Research'][i]}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
