/**
 * Experience: a corridor. Card i hangs at z = -i * 900, alternating sides, turned toward the
 * aisle. Scrolling walks the camera down the aisle; the card you reach turns flat to be read,
 * cards ahead stay opaque and dim into fog with distance; passed ones fade out past the camera.
 * A floor line with year markers runs down the middle.
 * Phones: a pinned deck, one role at a time, dealt away as you scroll (a flat stack on short phones).
 */
import { useRef } from 'react';
import { experiences, sentences } from '../content/data';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useScene } from '../lib/useScene';
import { snapAllowed } from '../lib/scroll';
import './experience.css';

const GAP = 900; // z distance between roles, px (x k)
const PER_ROLE = 0.45; // viewport heights of scroll per role (x k)
const firstYear = (range: string) => /\d{4}/.exec(range)?.[0] ?? '';

export default function ExperienceScene() {
  const root = useRef<HTMLDivElement>(null);

  useScene(root, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const cards = q('.xp__card') as HTMLElement[];

    if (variant === 'mobile') {
      const deck = phoneDeck();
      if (deck) return deck;
      // Fallback (short phones): a flat stack (after React Bits' ScrollStack). Each card sticks under
      // the nav and settles back as the next slides over it; parallel planes only (a tilt made the
      // cards cut into each other in 3D). Only cards that fit the viewport stick.
      section.classList.add('is-stack');
      const top = 88;
      cards.forEach((card, i) => {
        card.style.setProperty('--i', String(i));
        const fits = card.offsetHeight < window.innerHeight - top - 40;
        card.classList.toggle('is-sticky', fits);
        const next = cards[i + 1];
        if (!fits || !next) return;
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.4,
          ease: 'none',
          transformOrigin: '50% 0%',
          scrollTrigger: { trigger: next, start: 'top 85%', end: `top ${top + 24}px`, scrub: 0.4 },
        });
      });
      return () => {
        section.classList.remove('is-stack');
        cards.forEach((c) => c.classList.remove('is-sticky'));
      };
    }

    /**
     * Phones: a pinned deck. One role at a time, full width, with the next roles' edges showing
     * behind it; scrolling deals the front card up and away (the same grammar as What I do) and snaps
     * to each role. A counter and bars under the heading track the roles. If the tallest card does
     * not fit, a compact card (one sentence, two wins, four chips), then the deck scales (to 0.8);
     * if it still does not fit, null (the stack).
     */
    function phoneDeck(): (() => void) | null {
      const pin = q('.xp__pin')[0] as HTMLElement;
      const head = q('.xp__head')[0] as HTMLElement;
      const list = q('.xp__list')[0] as HTMLElement;
      const count = q('.xp__count')[0] as HTMLElement;
      const bars = q('.xp__meter i') as HTMLElement[];
      section.classList.add('is-xdeck');
      const room = () => window.innerHeight - 82 - head.offsetHeight - 16 - 40;
      // natural card heights (the deck then stretches every card to the tallest)
      const tallest = () => {
        const list0 = list.style.height;
        list.style.height = '';
        section.classList.add('is-sizing');
        const h = Math.max(...cards.map((c) => c.offsetHeight));
        section.classList.remove('is-sizing');
        list.style.height = list0;
        return h;
      };
      if (tallest() > room()) section.classList.add('is-compact');
      const scale = Math.min(1, room() / tallest());
      if (scale < 0.8) {
        section.classList.remove('is-xdeck', 'is-compact');
        return null;
      }
      const world = q('.xp__world')[0] as HTMLElement;
      let sized = '';
      const size = () => {
        const key = `${innerWidth}:${innerHeight}:${document.fonts.status}`;
        if (key === sized) return;
        sized = key;
        const height = tallest();
        const available = room();
        list.style.height = `${height}px`;
        gsap.set(world, { scale: Math.min(1, available / height), transformOrigin: '50% 0%' });
      };
      size();
      ScrollTrigger.addEventListener('refreshInit', size);

      const n = cards.length;
      // The measured 0.30-vh still holds are trimmed by 0.20 timeline units per deal.
      const DEAL = 0.8;
      const HOLD = 0.1;
      const READ = 0.18;
      /** Time at which role i is in front and settled. */
      const at = (i: number) => HOLD + i * DEAL;
      // a card d places behind the front one
      const slot = (d: number) => ({ y: d * 30, z: -d * 46, scale: 1 - d * 0.045, opacity: d > 2 ? 0 : 1 });
      cards.forEach((card, i) => gsap.set(card, { ...slot(i), rotateX: 0, transformOrigin: '50% 100%' }));
      // the deck rises into place as the section scrolls in (it is assembled when the pin starts)
      gsap.fromTo(
        world,
        { y: 150, rotateX: 22, opacity: 0 },
        { y: 0, rotateX: 0, opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 88%', end: 'top 8%', scrub: 0.5 } },
      );
      gsap.set(bars[0], { '--f': 1 });
      let shown = -1;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${(at(n - 1) + 0.2) * 0.8 * window.innerHeight}`,
          pin,
          scrub: 0.5,
          snap: { snapTo: (value: number, self?: ScrollTrigger) => snapAllowed() ? gsap.utils.snap(cards.map((_, i) => at(i) / (at(n - 1) + 0.2)), value) : self?.progress ?? value, duration: { min: 0.2, max: 0.5 }, delay: 0.06, ease: 'power1.inOut' },
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          // the role in front: deals whose midpoint has passed
          const t = tl.time();
          let i = 0;
          while (i < n - 1 && t >= at(i) + READ + 0.25) i++;
          if (i !== shown) {
            shown = i;
            count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
          }
        },
      });
      tl.addLabel('r0', at(0));
      for (let i = 0; i < n - 1; i++) {
        const t = at(i) + READ;
        // the front card is dealt up and toward you, gone before the next one is fully forward
        // (opaque while it tips toward you, covering the next card; it fades once mostly out of the way)
        tl.to(cards[i], { rotateX: -62, y: -150, z: 150, duration: 0.5, ease: 'power2.in' }, t)
          .to(cards[i], { opacity: 0, duration: 0.16, ease: 'power1.in' }, t + 0.34);
        cards.slice(i + 1).forEach((card, d) => tl.to(card, { ...slot(d), duration: 0.45, ease: 'power2.out' }, t + 0.12));
        tl.fromTo(bars[i + 1], { '--f': 0 }, { '--f': 1, duration: 0.4, immediateRender: true }, t + 0.1);
        tl.addLabel(`r${i + 1}`, at(i + 1));
      }
      tl.set({}, {}, at(n - 1) + 0.2);

      return () => {
        ScrollTrigger.removeEventListener('refreshInit', size);
        section.classList.remove('is-xdeck', 'is-compact');
        list.style.removeProperty('height');
        gsap.set(world, { clearProps: 'transform,transformOrigin' });
      };
    }

    const n = cards.length;
    const gap = GAP * k;
    const world = q('.xp__world')[0];
    const markers = q('.xp__marker') as HTMLElement[];
    const side = (i: number) => (i % 2 === 0 ? -1 : 1);

    const head = q('.xp__head')[0] as HTMLElement;
    const pin = q('.xp__pin')[0] as HTMLElement;
    const fogs = cards.map((card) => card.querySelector<HTMLElement>('.xp__fog'));

    const place = () => {
      const x = window.innerWidth * 0.24;
      // The card in front sits between the heading and the bottom edge, measured, so short windows
      // (Safari with its toolbars, small laptops) never put it over the lede; if it cannot fit, it scales.
      const tallest = Math.max(...cards.map((card) => card.offsetHeight));
      const top = head.offsetTop + head.offsetHeight + 24;
      const scale = Math.min(1, (pin.offsetHeight - top - 20) / tallest);
      const originY = (world.offsetParent as HTMLElement).offsetTop + world.offsetTop;
      const y = Math.max(0, top + (tallest * scale) / 2 - originY);
      cards.forEach((card, i) => gsap.set(card, { x: side(i) * x, y, z: -i * gap, scale, xPercent: -50, yPercent: -50 }));
      markers.forEach((m, i) => gsap.set(m, { x: 0, y: 0, z: -i * gap, xPercent: -50 }));
    };

    // Per frame: each card's distance to the camera sets its turn and opacity. A card stays fully
    // readable around the camera and only fades once it is well behind.
    const paint = () => {
      const walked = Number(gsap.getProperty(world, 'z'));
      cards.forEach((card, i) => {
        const d = walked - i * gap; // < 0 ahead of us, 0 reached, > 0 passed
        const ahead = Math.min(1, Math.max(0, -d / (gap * 1.2)));
        const turn = side(i) * -12 * Math.min(1, Math.abs(d) / (gap * 0.55));
        const passed = Math.max(0, d - gap * 0.1);
        // ahead: opaque, dimmed by fog (a far card's text never shows through a nearer one);
        // passed: fades out as it goes by the camera
        const opacity = d > 0 ? Math.max(0, 1 - passed / (gap * 0.22)) : 1;
        gsap.set(card, { rotateY: turn, opacity, visibility: opacity < 0.02 ? 'hidden' : 'visible' });
        const fog = fogs[i];
        if (fog) gsap.set(fog, { opacity: d < 0 ? ahead * 0.82 : 0 });
      });
      markers.forEach((m, i) => {
        const d = walked - i * gap;
        gsap.set(m, { opacity: d > 0 ? Math.max(0, 1 - d / (gap * 0.3)) : 1 - Math.min(1, -d / (gap * 3)) * 0.7 });
      });
    };

    place();
    paint();
    // Walk role to role: each step eases in and out, so every card holds still to be read.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: paint,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${((n - 1) * PER_ROLE + 0.35) * window.innerHeight * k}`,
        pin: q('.xp__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: () => {
          place();
          paint();
        },
      },
    });
    tl.to({}, { duration: 0.2 });
    for (let i = 1; i < n; i++) tl.to(world, { z: i * gap, duration: 1, ease: 'power2.inOut' });
    tl.to({}, { duration: 0.15 });
    return undefined;
  });

  return (
    <div ref={root} className="xp">
      <div className="xp__pin">
        <header className="xp__head wrap">
          <h2 id="experience-title" className="heading">
            Experience
          </h2>
          <p className="lede">Research, industry, teaching and community work, most recent first.</p>
          <p className="xp__meter meter" aria-hidden="true">
            <span className="xp__count meter__count mono">01 / {String(experiences.length).padStart(2, '0')}</span>
            <span className="meter__bars">
              {experiences.map((xp) => (
                <i key={xp.role} />
              ))}
            </span>
          </p>
        </header>
        <div className="xp__persp persp">
          <div className="xp__world stage">
            <div className="xp__floor" aria-hidden="true" />
            <ol className="xp__list">
              {experiences.map((xp) => (
                <li key={xp.role} className="xp__card card">
                  <span className="xp__fog" aria-hidden="true" />
                  <p className="xp__dates mono">{xp.year}</p>
                  <h3 className="xp__role">{xp.role}</h3>
                  <p className="xp__company">{xp.company}</p>
                  <p className="xp__desc">
                    {sentences(xp.description)[0]}
                    {sentences(xp.description)[1] ? <span className="xp__desc-more"> {sentences(xp.description)[1]}</span> : null}
                  </p>
                  <ul className="xp__wins">
                    {xp.achievements.slice(0, 3).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <ul className="chips" aria-label="Technologies and skills">
                    {xp.technologies.map((t) => (
                      <li key={t} className="chip">
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            {experiences.map((xp) => (
              <span key={xp.role} className="xp__marker mono" aria-hidden="true">
                {firstYear(xp.year)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
