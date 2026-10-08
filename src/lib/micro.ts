/**
 * Micro-interactions (after React Bits' Magnet, SpotlightCard/BorderGlow, DecryptedText,
 * ClickSpark and ScrollReveal), rebuilt small and on the house rules:
 *  - anything that follows the pointer does so 1:1 with a transform (no easing, which reads as
 *    lag) and fades or settles in place when the pointer leaves;
 *  - nothing loops: each effect runs on a hover, a click or once on reveal, then stops;
 *  - reduced motion and the low tier get the resting state.
 */
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { motionAllowed } from './motion';

const fine = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Magnetic control: shifts toward the pointer by a fraction of the offset, 1:1; settles on leave. */
export function magnet(el: HTMLElement, strength = 0.3): () => void {
  if (!fine() || !motionAllowed()) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    gsap.set(el, { x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength });
  };
  const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.45, ease: 'power3.out' });
  el.addEventListener('pointermove', move, { passive: true });
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    gsap.set(el, { clearProps: 'x,y' });
  };
}

/**
 * Spotlight + border glow for a clickable card: a soft light under the pointer and a brighter
 * rim where the pointer is near the edge. Both are layers moved with transforms.
 */
export function spotlight(el: HTMLElement): () => void {
  if (!fine()) return () => {};
  const wrap = document.createElement('span');
  wrap.className = 'spot';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = '<span class="spot__fill"><i></i></span><span class="spot__ring"><i></i></span>';
  el.appendChild(wrap);
  const blobs = wrap.querySelectorAll<HTMLElement>('i');
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    const t = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
    blobs.forEach((b) => (b.style.transform = t));
    wrap.dataset.on = '1';
  };
  const leave = () => {
    wrap.dataset.on = '0';
  };
  el.addEventListener('pointermove', move, { passive: true });
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
    wrap.remove();
  };
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#*+=-_';
const running = new WeakMap<HTMLElement, gsap.core.Tween>();

/**
 * Decrypt a short mono label once: characters resolve left to right out of random glyphs.
 * Screen readers get the final text from the start; the scramble layer is hidden from them.
 */
export function decrypt(el: HTMLElement, duration = 0.7): void {
  // idempotent: the real text is kept on the element, so a second call (a re-run effect) never
  // mistakes a half-scrambled label for the final text
  const final = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = final;
  running.get(el)?.kill();
  if (!final.trim() || !motionAllowed()) {
    el.textContent = final;
    return;
  }
  el.innerHTML = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = final;
  const vis = document.createElement('span');
  vis.setAttribute('aria-hidden', 'true');
  el.append(sr, vis);
  const state = { p: 0 };
  const tween = gsap.to(state, {
    p: 1,
    duration,
    ease: 'power1.out',
    onUpdate: () => {
      const shown = Math.floor(state.p * final.length);
      let out = final.slice(0, shown);
      for (let i = shown; i < final.length; i++) out += final[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      vis.textContent = out;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
  running.set(el, tween);
}

/** Decrypt each element once, the first time it scrolls into view. */
export function decryptOnView(els: HTMLElement[], start = 'top 90%'): () => void {
  if (!motionAllowed()) return () => {};
  const triggers = els.map((el) =>
    ScrollTrigger.create({ trigger: el, start, once: true, onEnter: () => decrypt(el) }),
  );
  return () => triggers.forEach((t) => t.kill());
}

/** A small burst of sparks from a point (one-shot, then removed). */
export function spark(x: number, y: number, count = 9): void {
  if (!motionAllowed()) return;
  const host = document.createElement('span');
  host.className = 'spark';
  host.setAttribute('aria-hidden', 'true');
  host.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('i');
    s.style.setProperty('--r', `${(360 / count) * i}deg`);
    host.appendChild(s);
  }
  document.body.appendChild(host);
  gsap.fromTo(
    host.querySelectorAll('i'),
    { '--d': '8px', '--l': 0 },
    { '--d': '30px', '--l': 1, duration: 0.42, ease: 'power2.out', onComplete: () => host.remove() },
  );
  gsap.fromTo(host, { opacity: 1 }, { opacity: 0, duration: 0.2, delay: 0.26 });
}

/**
 * Section headings assemble word by word as they enter (each word rises from behind a mask),
 * scrubbed by scroll. The resting heading is the finished state.
 */
export function revealHeading(heading: HTMLElement): () => void {
  if (!motionAllowed()) return () => {};
  const split = SplitText.create(heading, { type: 'words', mask: 'words', wordsClass: 'hw' });
  const tween = gsap.fromTo(
    split.words,
    { yPercent: 105, rotate: 4 },
    {
      yPercent: 0,
      rotate: 0,
      ease: 'power3.out',
      stagger: 0.12,
      immediateRender: true,
      scrollTrigger: {
        trigger: heading,
        start: 'top 92%',
        end: 'top 62%',
        scrub: 0.6,
        // headings inside a pinned scene: measure against the pin, or the reveal lands late
        pinnedContainer: heading.closest<HTMLElement>('.about__pin, .disciplines__pin, .projects__pin, .xp__pin, .papers__pin, .contact__pin') ?? undefined,
      },
    },
  );
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    split.revert();
  };
}
