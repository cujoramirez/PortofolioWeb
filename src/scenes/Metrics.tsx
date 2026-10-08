/**
 * At a glance: six figures from the data, for readers who scan. Each digit is a strip of 0-9
 * that rolls into place as the band scrolls in (a transform, scrubbed); the resting CSS already
 * shows the final digit, and screen readers get the plain number.
 */
import { useEffect, useRef } from 'react';
import { aboutFacts, papers, projects } from '../content/data';
import { gsap } from '../lib/gsap';
import { decryptOnView } from '../lib/micro';
import { useScene } from '../lib/useScene';

const METRICS = [
  { value: String(papers.length), label: 'peer-reviewed papers, all from 2025' },
  { value: String(papers.filter((p) => p.isFirstAuthor).length), label: 'of them as first author' },
  { value: aboutFacts.academy.rate.replace('≈', '~'), label: 'of Apple Developer Academy applicants accepted' },
  { value: String(projects.length), label: 'projects, from native apps to research' },
  { value: '150+', label: 'students reached through lectures and bootcamps' },
  { value: aboutFacts.gpa, label: `GPA out of ${aboutFacts.gpaScale}` },
];

function Roller({ value }: { value: string }) {
  return (
    <span className="metric__value" aria-hidden="true">
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} className="roll" style={{ ['--d' as string]: ch }}>
            <span className="roll__strip">
              {Array.from({ length: 20 }, (_, n) => (
                <span key={n}>{n % 10}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={i} className="metric__sym">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

export default function Metrics() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = root.current?.querySelector<HTMLElement>('.metrics__title');
    return title ? decryptOnView([title]) : undefined;
  }, []);

  useScene(
    root,
    ({ root: band }) => {
      const strips = gsap.utils.toArray<HTMLElement>('.roll__strip', band);
      // roll up one full turn to the final digit (cell 10 + d of 20)
      gsap.fromTo(
        strips,
        // y: 0 because GSAP reads the resting CSS translate as pixels and would add it on top
        { y: 0, yPercent: (i: number) => -Number(strips[i].parentElement?.style.getPropertyValue('--d') ?? 0) * 5 },
        {
          y: 0,
          yPercent: (i: number) => -(10 + Number(strips[i].parentElement?.style.getPropertyValue('--d') ?? 0)) * 5,
          ease: 'power2.out',
          stagger: 0.04,
          immediateRender: true,
          scrollTrigger: { trigger: band, start: 'top 88%', end: 'top 35%', scrub: 0.6 },
        },
      );
      return undefined;
    },
    { section: () => root.current },
  );

  return (
    <div ref={root} className="metrics wrap">
      <h3 className="metrics__title mono">At a glance</h3>
      <ul className="metrics__grid">
        {METRICS.map((m) => (
          <li key={m.label} className="metric">
            <span className="sr-only">{m.value}</span>
            <Roller value={m.value} />
            <span className="metric__label">{m.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
