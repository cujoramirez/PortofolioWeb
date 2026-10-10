/**
 * About: three chapters beside a turning card (portrait front, fact sheet back).
 * Desktop/tablet: pinned. The hand-off from the hero happens in the lead-in:
 *   1. while the hero portrait flies in (still wearing its Apple Vision overlay), the card's
 *      frame draws itself where it will land;
 *   2. on landing, the café photo appears *inside the portrait's segmentation silhouette* (the
 *      same mask and contour as the overlay, so only the person's pixels change);
 *   3. the silhouette grows from the face outward (a masked layer scaled up while its content is
 *      counter-scaled, transforms only), its contour expanding and fading, until the photo fills
 *      the card; the frame gives way to the card's surface and shadow.
 * Then each chapter's sentences rise into place, the outgoing chapter tilts back, and a quote
 * flies through between chapters. The card tilts per chapter and flips to its fact sheet in
 * chapter 3. Phones: not pinned; each block rises once as it enters.
 */
import { Fragment, useRef, type CSSProperties } from 'react';
import Picture, { aboutLadder } from '../components/Picture';
import { aboutChapters, aboutFacts, quotes, sentences } from '../content/data';
import { mask as visionMask, edge as visionEdge } from '../data/vision.json';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { landAt } from '../lib/jump';
import { useScene } from '../lib/useScene';
import { afterLoad } from '../lib/idle';
import type { AboutRelief } from './aboutRelief';
import { HERO_DISPERSE, HERO_PIN } from './handoff';
import Metrics from './Metrics';
import './about.css';

const TITLES = ['Where I started', 'Why computer science', 'How I work'];
/** Quotes that fly through between chapters; the rest sit in a short list at the end. */
const FLY = [quotes[0], quotes[2]];
const REST = [quotes[1], quotes[3]];

const FACTS: [string, string][] = [
  ['Based in', 'Jakarta, Indonesia'],
  ['Studying', 'Computer Science, BINUS University'],
  ['GPA', `${aboutFacts.gpa} / ${aboutFacts.gpaScale}`],
  [
    'Apple Developer Academy',
    `Cohort 2026. About ${aboutFacts.academy.accepted} accepted from ${aboutFacts.academy.applicants} applicants (${aboutFacts.academy.rate}).`,
  ],
];

// Timeline units are viewport heights of scroll (x k). The lead-in matches the hero dispersal.
// Sequence: chapter rises, holds, exits; a quote flies through the text column; next chapter.
const LEAD = HERO_PIN * HERO_DISPERSE;
const CHAPTER = 0.5;
/** How long one line of a chapter takes to rise. */
const RISE = 0.18;
const QUOTE = 0.3;
/** How far the silhouette grows to cover the card (from the face centre every corner is inside). */
const GROW = 7;
/** The reveal plays alone before chapter 1 rises. */
const REVEAL = 0.16;

export default function AboutScene() {
  const root = useRef<HTMLDivElement>(null);

  useScene(root, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const chapters = q('.about__chapter') as HTMLElement[];
    const flyers = q('.about__quote--fly');
    const card = q('.about__card')[0] as HTMLElement;
    const [front] = q('.about__face--front');
    const [back] = q('.about__face--back');
    const col = q('.about__card-col')[0] as HTMLElement;
    const mobile = variant === 'mobile';

    // The card's size in px: set explicitly because Safari 27 does not resolve percentage heights
    // inside an aspect-ratio box, which left the photo short of the card.
    //  - desktop/tablet: 3:4, as tall as fits;
    //  - phones (pinned): full width, and as tall as the space the longest chapter leaves, so the
    //    screen is used top to bottom (the chapter's title sits on the photo).
    let sized = '';
    const size = () => {
      const key = `${innerWidth}:${innerHeight}:${document.fonts.status}`;
      if (key === sized) return;
      sized = key;
      let w: number;
      let h: number;
      if (mobile) {
        const tallest = Math.max(...chapters.map((c) => c.offsetHeight));
        w = Math.round(col.clientWidth);
        h = Math.round(Math.min(w * 1.15, window.innerHeight - (12 + 56 + 14) - 12 - 18 - tallest));
      } else {
        w = Math.round(Math.min(col.clientWidth, Math.min(window.innerHeight * 0.66, 560) * 0.75));
        h = Math.round((w * 4) / 3);
      }
      card.style.width = `${w}px`;
      card.style.height = `${h}px`;
      section.style.setProperty('--card-w', `${w}px`);
      section.style.setProperty('--card-h', `${h}px`);
    };
    const unsize = () => {
      ScrollTrigger.removeEventListener('refreshInit', size);
      card.style.removeProperty('width');
      card.style.removeProperty('height');
      section.style.removeProperty('--card-w');
      section.style.removeProperty('--card-h');
      section.classList.remove('is-pinned');
    };

    // Phones pin too when a photo card of useful size still fits above the longest chapter;
    // otherwise the page flows.
    let pinned = !mobile;
    if (mobile) {
      section.classList.add('is-pinned');
      size();
      pinned = card.offsetHeight >= 200;
      if (!pinned) unsize();
    }
    if (pinned) {
      size();
      ScrollTrigger.addEventListener('refreshInit', size);
    }

    // A ScrollTrigger refresh restores progress without onUpdate: these repaint from the state.
    const repaint: (() => void)[] = [];
    const onRefresh = () => repaint.forEach((fn) => fn());

    /** The reveal (see the header), placed so the silhouette starts growing at `at`. */
    const addReveal = (tl: gsap.core.Timeline, at: number, swapIn: boolean) => {
      // 1: the frame draws itself (on desktop while the portrait is in flight)
      tl.fromTo(q('.about__frame i'), { scale: 0 }, { scale: 1, duration: 0.07, stagger: 0.045, ease: 'power1.inOut', immediateRender: true }, at - 0.27);
      // 2: the café photo inside the silhouette (desktop: CSS, in step with the hero's --handoff)
      if (swapIn) tl.fromTo(q('.about__swap'), { opacity: 0 }, { opacity: 1, duration: 0.07, immediateRender: true }, at - 0.08);
      // 3: the silhouette grows from the face; its content is counter-scaled so the photo stays put
      const [reveal] = q('.about__reveal') as HTMLElement[];
      const [counter] = q('.about__counter') as HTMLElement[];
      const grown = q('.about__tint, .about__edge') as HTMLElement[];
      const grow = { s: 1 };
      const applyGrow = () => {
        // Once open, back to identity (the same picture): a layer left at 7x is ~185 MB on a 3x
        // iPhone, which iOS WebKit will not allocate, and it silently dropped the chapters.
        const open = grow.s > GROW - 0.05;
        const sc = open ? 1 : grow.s;
        gsap.set([reveal, ...grown], { scale: sc });
        gsap.set(counter, { scale: 1 / sc });
        reveal.classList.toggle('is-open', open);
      };
      applyGrow();
      repaint.push(applyGrow);
      tl.to(grow, { s: GROW, duration: 0.32, ease: 'power2.inOut', onUpdate: applyGrow }, at + 0.02)
        .fromTo(q('.about__tint'), { opacity: 1 }, { opacity: 0, duration: 0.14, immediateRender: true }, at + 0.02)
        .fromTo(q('.about__edge'), { opacity: 1 }, { opacity: 0, duration: 0.22, ease: 'power1.in', immediateRender: true }, at + 0.06)
        .fromTo(q('.about__frame'), { opacity: 1 }, { opacity: 0, duration: 0.12, immediateRender: true }, at + 0.2)
        .fromTo(card, { '--solid': 0 }, { '--solid': 1, duration: 0.14, immediateRender: true }, at + 0.18);
      // The photo starts framed like the hero portrait that landed on it (1.3x, heads aligned), then
      // eases out to the full frame. Worked out for any card shape: the portrait lands centred at
      // the card's height (cutout head at 49% / 24% of it); the photo is object-fit: cover at
      // 55% / 35%, its head at about 57% / 41% of the image.
      const Z = 1.3;
      const zoomFrom = () => {
        const W = card.offsetWidth;
        const H = card.offsetHeight;
        const ratio = aboutLadder.width / aboutLadder.height;
        // rendered image size under object-fit: cover
        const ih = Math.max(H, W / ratio);
        const iw = ih * ratio;
        const offX = (W - iw) * 0.55;
        const offY = (H - ih) * 0.35;
        const pw = H * 0.75;
        return { x: (W - pw) / 2 + 0.49 * pw - Z * (offX + 0.57 * iw), y: 0.24 * H - Z * (offY + 0.41 * ih) };
      };
      tl.fromTo(
        q('.about__img'),
        { scale: Z, x: () => zoomFrom().x, y: () => zoomFrom().y, transformOrigin: '0 0' },
        { scale: 1, x: 0, y: 0, duration: 0.34, ease: 'power2.inOut', immediateRender: true },
        at + 0.02,
      );
    };

    if (!pinned) {
      // flowing phone layout: the reveal plays as the card scrolls up into view; blocks rise once
      const reveal = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 20%', scrub: 0.6, onRefresh },
      });
      addReveal(reveal, 0.3, true);
      reveal.set({}, {}, 0.66);
      q('.about__rise')
        .filter((el) => el !== card)
        .forEach((el) => {
          const rise = { duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } };
          // a sentence's words follow its --rise (about.css)
          if (el.classList.contains('about__sentence')) gsap.fromTo(el, { '--rise': 0 }, { '--rise': 1, ...rise });
          else gsap.from(el, { y: 36, rotateX: -35, opacity: 0, ...rise });
        });
      return unsize;
    }

    const n = chapters.length;
    const total = LEAD + REVEAL + n * CHAPTER + (n - 1) * QUOTE;
    // phones read longer per chapter: their pin runs at desktop length, only depth is scaled
    const len = mobile ? 0.9 : k;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${total * window.innerHeight * len}`,
        pin: q('.about__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh,
      },
      onUpdate: () => updateRelief(),
    });

    let relief: AboutRelief | null = null;
    let live = true;
    let reliefReady = false;
    let reliefPending = false;
    const counter = q('.about__counter')[0] as HTMLElement;
    const reveal = q('.about__reveal')[0] as HTMLElement;
    const updateRelief = () => {
      // The growing silhouette allocates a large layer; the canvas waits until identity returns.
      const img = counter.querySelector('.about__img');
      const angle = Number(gsap.getProperty(card, 'rotationY'));
      const visible = reveal.classList.contains('is-open') && Math.abs(Number(gsap.getProperty(img, 'scaleX')) - 1) < 0.001;
      if (reliefReady && !reliefPending && visible && Math.abs(angle) > 0.05 && Math.abs(angle) < 65) startRelief();
      relief?.update(angle, visible);
    };
    repaint.push(() => { relief?.resize(); updateRelief(); });
    const startRelief = () => {
      reliefPending = true;
      void import('./aboutRelief').then((m) => live ? m.mountAboutRelief(counter) : null).then((mounted) => {
        if (!live) return mounted?.destroy();
        relief = mounted;
        updateRelief();
      }).catch(() => {});
    };
    const cancelRelief = afterLoad(() => { reliefReady = true; updateRelief(); });

    // The back face stays hidden until the card is edge-on: the faces swap at 90 degrees
    // instead of relying on backface-visibility, which WebKit renders mirrored.
    gsap.set(back, { visibility: 'hidden' });

    const starts: number[] = [];
    let t = LEAD + REVEAL;
    chapters.forEach((ch, i) => {
      starts.push(t);
      // Phones: the first chapter's sentences rise as the hero's interface card slides off the same
      // half of the screen, and its title lands on the photo with the portrait. Waiting for the
      // reveal left that half empty for a quarter of a screen of scrolling.
      const early = mobile && i === 0;
      const enter = early ? LEAD - 0.06 : t;
      // the scrim behind the chapter (about.css) arrives with its first line
      tl.fromTo(ch, { '--scrim': 0 }, { '--scrim': 1, duration: 0.14, immediateRender: true }, enter + 0.02);
      // Number, title, then one sentence at a time. A sentence is an inline box and takes no
      // transform, so its words rise instead, all from the sentence's one --rise (about.css).
      const lines = [...ch.querySelectorAll<HTMLElement>('.about__rise')];
      const heads = lines.filter((line) => !line.classList.contains('about__sentence')).length;
      const body = early ? LEAD - 0.2 - heads * 0.05 : enter;
      // Every line is up before the chapter leaves: at a fixed 0.05 apart, the fifth sentence of a
      // chapter was still at half opacity when the exit began.
      const step = Math.min(0.05, (t + CHAPTER - 0.12 - body - 0.02 - RISE - 0.05) / Math.max(1, lines.length - 1));
      lines.forEach((line, j) => {
        const sentence = line.classList.contains('about__sentence');
        tl.fromTo(
          line,
          // on a phone these lines sit on the photo: travelling in depth, the silhouette hid them mid-rise
          sentence ? { '--rise': 0 } : { rotateX: -65, z: mobile ? 0 : -120 * k, y: 24, opacity: 0 },
          { ...(sentence ? { '--rise': 1 } : { rotateX: 0, z: 0, y: 0, opacity: 1 }), duration: RISE, ease: 'power2.out', immediateRender: true },
          (sentence ? body : enter) + 0.02 + j * step,
        );
      });
      if (i < n - 1) {
        tl.to(ch, { rotateX: 18, z: -240 * k, opacity: 0, duration: 0.12, ease: 'power1.in' }, t + CHAPTER - 0.12);
        const quote = flyers[i];
        if (quote) {
          const at = t + CHAPTER - 0.02;
          // flies through the viewer: z -900 -> +300, readable around z 0
          tl.fromTo(quote, { z: -900 * k, opacity: 0 }, { z: 300 * k, duration: QUOTE, immediateRender: true }, at)
            .to(quote, { opacity: 1, duration: QUOTE * 0.3 }, at)
            .to(quote, { opacity: 0, duration: QUOTE * 0.3 }, at + QUOTE * 0.68);
        }
        t += CHAPTER + QUOTE;
      } else {
        t += CHAPTER;
      }
    });
    tl.set({}, {}, total);

    // The frame draws during the hero portrait's flight and the silhouette swap follows the hero's
    // --handoff (CSS), on phones too when About pins under the hero.
    addReveal(tl, LEAD, false);

    if (mobile) {
      // phones: the card stays flat (the title sits on it) and its bars track the chapters
      q('.about__progress i').forEach((bar, i) =>
        tl.fromTo(bar, { '--f': 0 }, { '--f': 1, duration: CHAPTER, immediateRender: true }, starts[i] ?? LEAD),
      );
      tl.to(card, { rotateY: -4, duration: 0.25, ease: 'power1.inOut' }, starts[0])
        .to(card, { rotateY: 0, duration: 0.2, ease: 'power1.inOut' }, starts[1])
        .to(card, { rotateY: 4, duration: 0.25, ease: 'power1.inOut' }, starts[2]);
    } else {
      // The card tilts a little per chapter, then turns to the fact sheet in chapter 3.
      tl.fromTo(card, { rotateY: 0 }, { rotateY: -8, duration: 0.25, ease: 'power1.inOut', immediateRender: false }, LEAD + REVEAL)
        .to(card, { rotateY: 0, duration: 0.2, ease: 'power1.inOut' }, starts[1] ?? LEAD)
        .to(card, { rotateY: 8, duration: 0.14, ease: 'power1.inOut' }, (starts[n - 1] ?? LEAD) + 0.04);
      const flip = (starts[n - 1] ?? LEAD) + 0.22;
      tl.to(card, { rotateY: 90, duration: 0.12, ease: 'power2.in' }, flip)
        .set(front, { visibility: 'hidden' }, flip + 0.12)
        .set(back, { visibility: 'visible' }, flip + 0.12)
        .to(card, { rotateY: 180, duration: 0.12, ease: 'power2.out' }, flip + 0.12);
    }

    // A jump lands on the first chapter with every line up, just before it starts to leave. The
    // section's top is the middle of the hero's hand-off.
    const unland = landAt(section.id, () => tl.scrollTrigger, (LEAD + REVEAL + CHAPTER - 0.14) / total);

    return () => { live = false; unland(); cancelRelief(); relief?.destroy(); unsize(); };
  });

  return (
    <div ref={root} className="about">
      <h2 id="about-title" className="sr-only">
        About
      </h2>
      <div className="about__pin">
        <div className="about__persp persp">
          <div className="about__stage stage">
            <div className="about__card-col">
              <div className="about__card layer about__rise">
                <figure
                  className="about__face about__face--front"
                  data-handoff
                  style={{ '--m': `url(${visionMask})`, '--e': `url(${visionEdge})` } as CSSProperties}
                >
                  <span className="about__plate plate" aria-hidden="true" />
                  <div className="about__swap">
                    <div className="about__reveal">
                      <div className="about__counter">
                        <Picture img={aboutLadder} sizes="(min-width: 768px) 32vw, 80vw" alt="Portrait of Gading Aditya Perdana" className="about__img" eager />
                      </div>
                    </div>
                    <span className="about__tint" aria-hidden="true" />
                    <span className="about__edge" aria-hidden="true" />
                  </div>
                  <span className="about__frame" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className="about__progress" aria-hidden="true">
                    {aboutChapters.map((_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                </figure>
                <div className="about__face about__face--back card">
                  <dl className="about__facts">
                    {FACTS.map(([term, value]) => (
                      <div key={term}>
                        <dt className="mono">{term}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>

            <div className="about__chapters">
              {aboutChapters.map((text, i) => (
                <Fragment key={TITLES[i]}>
                  <article className="about__chapter layer" aria-labelledby={`about-ch-${i}`}>
                    <p className="about__num mono about__rise" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <h3 id={`about-ch-${i}`} className="about__title about__rise">
                      {TITLES[i]}
                    </h3>
                    <p className="about__text">
                      {/* Sentences stay inline so the chapter reads as one paragraph. A transform needs a
                          box, so each word is one (inline-block) and a sentence's words rise together. */}
                      {sentences(text).map((s) => (
                        <span key={s} className="about__rise about__sentence">
                          {s.split(' ').map((word, w) => (
                            <Fragment key={w}>
                              <span className="about__word">{word}</span>{' '}
                            </Fragment>
                          ))}
                        </span>
                      ))}
                    </p>
                  </article>
                  {FLY[i] && i < aboutChapters.length - 1 ? (
                    <blockquote className="about__quote about__quote--fly layer">
                      <p>“{FLY[i].text}”</p>
                      <cite className="mono">{FLY[i].author}</cite>
                    </blockquote>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Metrics />

      <ul className="about__more wrap" aria-label="More quotes I keep nearby">
        {REST.map((quote) => (
          <li key={quote.author} className="about__rise">
            <blockquote className="about__quote">
              <p>“{quote.text}”</p>
              <cite className="mono">{quote.author}</cite>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
