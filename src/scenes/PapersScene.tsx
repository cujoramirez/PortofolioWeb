/**
 * Papers: a deck that deals out. The five papers start stacked at the centre, fan out
 * (rotateZ -10..10), then settle into their resting grid, which is the readable layout.
 * Offsets are measured from the resting grid (FLIP), so the end state is exact.
 * Phones: a drum of papers turning around a horizontal axis (see below).
 */
import { useEffect, useRef } from 'react';
import { ArrowUpRight } from '../components/icons';
import { firstSentence, papers, scholarUrl } from '../content/data';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { spotlight } from '../lib/micro';
import { showOnFocus } from '../lib/focusStep';
import { landAt } from '../lib/jump';
import { useScene } from '../lib/useScene';
import { snapAllowed } from '../lib/scroll';
import './papers.css';

export default function PapersScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const undo = [...el.querySelectorAll<HTMLElement>('.paper--link')].map(spotlight);
    return () => undo.forEach((fn) => fn());
  }, []);

  useScene(root, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const cards = q('.paper') as HTMLElement[];

    if (variant === 'mobile') {
      // A picker wheel: the papers sit around a horizontal cylinder under the heading, the one before
      // and the one after visible dimmed above and below, each with its gist and keywords. The wheel
      // has a detent on every paper (see below). Pinned when a paper fits; otherwise a stack that rises.
      const head = q('.papers__head')[0] as HTMLElement;
      const grid = q('.papers__grid')[0] as HTMLElement;
      const count = q('.papers__count')[0] as HTMLElement;
      const bars = q('.papers__meter i') as HTMLElement[];
      // measured in flow (before the drum stacks the papers absolutely), with the drum's content
      grid.classList.add('is-measuring');
      const tallest = Math.max(...cards.map((c) => c.offsetHeight));
      grid.classList.remove('is-measuring');
      section.classList.add('is-drum');
      // (the heading's meter only shows in the drum: about 30 px more)
      if (82 + head.offsetHeight + 30 + tallest + 90 <= window.innerHeight) {
        const n = cards.length;
        const step = 30; // degrees between papers on the drum
        grid.style.height = `${tallest}px`;
        // the drum's axis sits behind the front paper, far enough that neighbours just clear it
        const R = tallest / 2 / Math.tan(((step / 2) * Math.PI) / 180) + 16;
        /*
         * Detents. A paper sits square in front and readable for the whole of its stretch of
         * scroll. The scroll pulls the wheel off it 1:1 but only GIVE of the way, so it answers
         * the finger; past half way the wheel lets go and clicks round to the next paper on a
         * spring. Turning in proportion to the scroll, it rested between two papers.
         */
        const GIVE = 0.28;
        /** `aim`: where the scroll puts the wheel. `slip`: what a click still has to travel. */
        const wheel = { at: 0, aim: 0, slip: 0, p: 0 };
        let shown = -1;
        let u = 0;
        /** The paper a snap is carrying the scroll to: the wheel clicks to it as the snap starts. */
        let held: number | null = null;
        let goal = 0;
        // plain CSS here: a native 3D transform-origin (the axis R behind each paper) is exact
        cards.forEach((card) => (card.style.transformOrigin = `50% 50% ${-R.toFixed(1)}px`));
        const paint = () => {
          wheel.p = wheel.aim - wheel.slip;
          cards.forEach((card, i) => {
            const a = (i - wheel.p) * step;
            const off = Math.abs(a);
            card.style.transform = `rotateX(${(-a).toFixed(2)}deg)`;
            // Full strength within the detent's give; the neighbours stay in view, dimmed, like a
            // picker wheel.
            const dim = Math.max(0, off / step - GIVE / 2) / (1 - GIVE / 2);
            card.style.opacity = off > 58 ? '0' : Math.max(0, 1 - dim * 0.72).toFixed(3);
            card.style.visibility = off > 58 ? 'hidden' : 'visible';
            card.style.pointerEvents = off < step / 2 ? 'auto' : 'none';
          });
          bars.forEach((bar, b) => bar.style.setProperty('--f', Math.min(1, Math.max(0, wheel.p - b + 1)).toFixed(3)));
        };
        /** Put the wheel where `u` (0 to n - 1, from the scroll) says. `click` springs to a new paper. */
        const follow = (click: boolean) => {
          const at = held ?? Math.round(u);
          const aim = at + GIVE * (u - at);
          // one paper at a time is a scroll; more at once is a jump, which just arrives
          if (click && Math.abs(at - wheel.at) === 1) {
            // carry on from where the wheel is drawn, and spring the rest of the way
            wheel.slip += aim - wheel.aim;
            gsap.to(wheel, { slip: 0, duration: 0.45, ease: 'back.out(1.7)', overwrite: true, onUpdate: paint });
          } else if (at !== wheel.at || !click) {
            gsap.killTweensOf(wheel);
            wheel.slip = 0;
          }
          if (at !== shown) {
            shown = at;
            count.textContent = `${String(at + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
          }
          wheel.at = at;
          wheel.aim = aim;
          paint();
        };
        follow(false);
        const hold = (paper: number | null) => {
          held = paper;
          follow(true);
        };
        const page = 1 / (n - 1);
        const turn = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${(n - 1) * 0.5 * window.innerHeight}`,
          pin: q('.papers__pin')[0],
          onUpdate: (self) => {
            u = self.progress * (n - 1);
            follow(true);
          },
          // a refresh restores progress without onUpdate: repaint from the restored state
          onRefresh: (self) => {
            u = self.progress * (n - 1);
            held = null;
            follow(false);
          },
          snap: {
            // Paging: a scroll that has carried a paper 30 % of the way goes on to the next one in
            // its direction; less than that, or a scroll that turned back, settles on the nearest.
            snapTo: (value: number, self?: ScrollTrigger) => {
              if (!snapAllowed()) return self?.progress ?? value;
              const near = gsap.utils.snap(page, value);
              const off = (value - near) / page;
              const dir = self?.direction ?? 0;
              return (goal = Math.abs(off) < 0.3 || off * dir <= 0 ? near : Math.min(1, Math.max(0, near + dir * page)));
            },
            onStart: () => hold(Math.round(goal / page)),
            onComplete: () => hold(null),
            onInterrupt: () => hold(null),
            duration: { min: 0.14, max: 0.3 },
            delay: 0.03,
            ease: 'power2.out',
          },
        });
        // Tab to a paper turns the drum to it
        const unfocus = showOnFocus(section, () => turn, (el) => {
          const i = cards.findIndex((card) => card.contains(el));
          return i < 0 ? null : i / (n - 1);
        });
        return () => {
          unfocus();
          gsap.killTweensOf(wheel);
          section.classList.remove('is-drum');
          grid.style.removeProperty('height');
          cards.forEach((card) => {
            for (const prop of ['transform', 'transform-origin', 'opacity', 'visibility', 'pointer-events']) card.style.removeProperty(prop);
          });
          bars.forEach((bar) => bar.style.removeProperty('--f'));
        };
      }
      section.classList.remove('is-drum');
      grid.style.removeProperty('height');
      cards.forEach((card) =>
        gsap.from(card, {
          rotateX: 28,
          y: 36,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          transformOrigin: '50% 0%',
          scrollTrigger: { trigger: card, start: 'top 90%', once: true },
        }),
      );
      return undefined;
    }

    const grid = q('.papers__grid')[0] as HTMLElement;
    const n = cards.length;
    const mid = (n - 1) / 2;
    // Offset from each card's resting spot to the centre of the grid.
    const toCentre = (card: HTMLElement) => ({
      x: grid.offsetWidth / 2 - (card.offsetLeft + card.offsetWidth / 2),
      y: grid.offsetHeight / 2 - (card.offsetTop + card.offsetHeight / 2),
    });
    const spread = () => Math.min(window.innerWidth * 0.15, 220);

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${0.92 * window.innerHeight * k}`,
        pin: q('.papers__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      cards,
      {
        x: (i: number) => toCentre(cards[i]).x + (i - mid) * 3,
        y: (i: number) => toCentre(cards[i]).y - i * 4,
        z: (i: number) => i * 2,
        rotateZ: (i: number) => (i - mid) * 1.6,
      },
      {
        // the fan: spread across the centre, tilted -10..10 degrees on a slight arc
        x: (i: number) => toCentre(cards[i]).x + (i - mid) * spread(),
        y: (i: number) => toCentre(cards[i]).y + Math.abs(i - mid) * 22,
        z: 0,
        rotateZ: (i: number) => ((i - mid) / mid) * 10,
        duration: 0.4,
        ease: 'power2.out',
        immediateRender: true,
      },
      0.12,
    ).to(
      cards,
      { x: 0, y: 0, rotateZ: 0, duration: 0.4, ease: 'power2.inOut', stagger: 0.03 },
      0.6,
    );
    tl.from(q('.papers__foot'), { opacity: 0, y: 16, duration: 0.15 }, 0.88);
    // until the grid has landed the papers are a stacked deck: Tab to one goes to the grid, and so does a jump
    const unfocus = showOnFocus(section, () => tl.scrollTrigger, () => 1);
    const unland = landAt(section.id, () => tl.scrollTrigger, 1);
    return () => { unfocus(); unland(); };
  });

  return (
    <div ref={root} className="papers">
      <div className="papers__pin">
        <header className="papers__head wrap">
          <h2 id="papers-title" className="heading">
            Papers
          </h2>
          <p className="lede">Five peer-reviewed papers from 2025, four as first author, published in IEEE ISRITI and Procedia Computer Science.</p>
          <p className="papers__meter meter" aria-hidden="true">
            <span className="papers__count meter__count mono">01 / {String(papers.length).padStart(2, '0')}</span>
            <span className="meter__bars">
              {papers.map((p) => (
                <i key={p.title} />
              ))}
            </span>
          </p>
        </header>
        <div className="papers__persp persp wrap">
          <ol className="papers__grid stage">
            {papers.map((paper) => (
              <li key={paper.title} className={`paper card${paper.doi ? ' paper--link has-spot' : ''}`} data-cursor={paper.doi ? 'DOI' : undefined}>
                <p className="paper__meta">
                  <span className="mono">{paper.year}</span>
                  <span className="paper__badges">
                    {paper.scopusIndexed ? <span className="paper__badge mono">Scopus {paper.scopusIndexed}</span> : null}
                    {paper.isFirstAuthor ? <span className="paper__badge paper__badge--strong mono">First author</span> : null}
                  </span>
                </p>
                <h3 className="paper__title">
                  {paper.doi ? (
                    <a className="paper__link" href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
                      {paper.title}
                    </a>
                  ) : (
                    paper.title
                  )}
                </h3>
                <p className="paper__venue">
                  {paper.venue}
                  {paper.doi ? <span className="paper__doi mono"> · DOI</span> : null}
                </p>
                <div className="paper__more">
                  <p className="paper__gist">{firstSentence(paper.description)}</p>
                  <ul className="chips" aria-label="Keywords">
                    {paper.keywords.slice(0, 3).map((kw) => (
                      <li key={kw} className="chip">
                        {kw}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="papers__foot wrap">
          <a className="text-link" href={scholarUrl} target="_blank" rel="noopener noreferrer">
            Google Scholar profile <ArrowUpRight />
          </a>
        </p>
      </div>
    </div>
  );
}
