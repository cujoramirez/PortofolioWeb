/**
 * Contact: everything reassembles. Plates in the colours of the page's layers fly in from
 * scattered positions and settle into a stack under one card, then the card's content rises.
 * Phones and reduced motion: the assembled card, static.
 */
import { useEffect, useRef, useState } from 'react';
import Dock from '../components/Dock';
import { CheckIcon, CopyIcon } from '../components/icons';
import { spark } from '../lib/micro';
import { LINKS } from '../content/site';
import { gsap } from '../lib/gsap';
import { showOnFocus } from '../lib/focusStep';
import { landAt } from '../lib/jump';
import { useScene } from '../lib/useScene';
import './contact.css';

const PLATES = ['sunken', 'elevated', 'accent', 'outline'];
/** Scattered start positions: x, y in viewport fractions, z px, rotations deg. */
const SCATTER = [
  { x: -0.42, y: -0.3, z: -500, rx: 30, ry: -40, rz: -18 },
  { x: 0.4, y: -0.26, z: 200, rx: -24, ry: 36, rz: 14 },
  { x: -0.36, y: 0.34, z: 120, rx: 20, ry: 30, rz: 10 },
  { x: 0.38, y: 0.3, z: -380, rx: -30, ry: -30, rz: -12 },
];

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const chip = useRef<HTMLSpanElement>(null);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(LINKS.email);
      const r = chip.current?.getBoundingClientRect();
      if (r) spark(r.left + r.width / 2, r.top + r.height / 2);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1500);
    } catch {
      window.location.href = `mailto:${LINKS.email}`;
    }
  };
  return (
    <button type="button" className="contact__email" onClick={copy} aria-describedby="contact-copy-hint" data-cursor="Copy">
      <span className="contact__address">{LINKS.email}</span>
      <span ref={chip} className={`contact__copy mono${copied ? ' is-copied' : ''}`} aria-live="polite">
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? 'Copied' : 'Copy'}
      </span>
    </button>
  );
}

export default function ContactScene() {
  const root = useRef<HTMLDivElement>(null);

  useScene(root, ({ k, section }) => {
    const q = gsap.utils.selector(section);
    const plates = q('.contact__plate');
    const inner = q('.contact__rise');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${0.7 * window.innerHeight * k}`,
        pin: q('.contact__pin')[0],
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    tl.fromTo(
      plates,
      {
        x: (i: number) => SCATTER[i].x * window.innerWidth,
        y: (i: number) => SCATTER[i].y * window.innerHeight,
        z: (i: number) => SCATTER[i].z * k,
        rotateX: (i: number) => SCATTER[i].rx,
        rotateY: (i: number) => SCATTER[i].ry,
        rotateZ: (i: number) => SCATTER[i].rz,
      },
      // rest a few px apart in z so the stacked plates never z-fight
      { x: 0, y: 0, z: (i: number) => (i - 4) * 2, rotateX: 0, rotateY: 0, rotateZ: 0, duration: 0.55, ease: 'power2.out', stagger: 0.04, immediateRender: true },
      0,
    ).fromTo(
      inner,
      { y: 28, z: -120 * k, rotateX: -30, opacity: 0 },
      { y: 0, z: 0, rotateX: 0, opacity: 1, duration: 0.25, stagger: 0.05, ease: 'power2.out', immediateRender: true },
      0.5,
    );
    tl.set({}, {}, 1);
    // the card's controls exist from the start but show only once it has assembled
    const unfocus = showOnFocus(section, () => tl.scrollTrigger, () => 1);
    const unland = landAt(section.id, () => tl.scrollTrigger, 1);
    return () => { unfocus(); unland(); };
  });

  return (
    <div ref={root} className="contact">
      <div className="contact__pin">
        <div className="contact__persp persp">
          <div className="contact__stage stage">
            {PLATES.map((p, i) => (
              <div key={p} className={`contact__plate contact__plate--${p}`} style={{ ['--i' as string]: i }} aria-hidden="true" />
            ))}
            <div className="contact__card">
              <h2 id="contact-title" className="contact__title contact__rise">
                Get in touch
              </h2>
              <p className="contact__line contact__rise">Email is the fastest way to reach me.</p>
              <div className="contact__rise">
                <CopyEmail />
                <p id="contact-copy-hint" className="contact__hint">
                  <span className="sr-only">Copies the address. </span>
                  <a className="text-link" href={`mailto:${LINKS.email}`}>
                    Or open your mail app
                  </a>
                </p>
              </div>
              <div className="contact__rise">
                <Dock />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
