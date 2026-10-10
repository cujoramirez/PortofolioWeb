/**
 * Hero, attached to the static shell that index.html already painted.
 *
 * Always (every variant, reduced motion too):
 *  - the name is fitted to the plate from measured glyphs, and the portrait's head is placed in
 *    the measured gap between the first and middle name;
 *  - on hover-capable devices a lens follows the pointer 1:1 and reveals the Apple Vision outputs
 *    (real, scripts/vision) under it; the full overlay appears as the stack explodes on scroll.
 *
 * Scroll (desktop/tablet):
 *   0.00-0.45  three-quarter turn; layers separate to z -360 / -120 / +120 / +320; layer tags and
 *              the Vision overlay (segmentation, boxes, landmarks) appear
 *   0.45-0.75  hold the exploded stack; tags and overlay fade
 *   0.75-1.00  disperse: interface rises, the name scatters in z, the backdrop recedes, and the
 *              portrait flies into the About card and crossfades into its photo (see handoff.ts)
 * Phones: see "the show" below (an isometric exploded stack, the interface as a card, the Vision
 * scan, and the same hand-off to the About card); short phones get a lighter exploded view.
 */
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { decrypt, magnet } from '../lib/micro';
import { showOnFocus } from '../lib/focusStep';
import { fontsReady } from '../lib/fonts';
import { refreshSoon } from '../lib/scroll';
import { useScene } from '../lib/useScene';
import { HERO_DISPERSE, HERO_PIN, leadPx, offsetWithin } from './handoff';
import type { Relief } from './heroRelief';
import { afterLoad } from '../lib/idle';

const EXPLODE = 0.45;
const HOLD_END = 1 - HERO_DISPERSE;
/** The stage's turn and tilt (rotateY, rotateX, degrees) in the exploded view on desktop and tablet. */
const TURN = -24;
const TILT = 12;
/** Where the stage has drifted to by the end of the hold: a slow turn that lets the relief show. */
const TURN_END = -18;
const TILT_END = 9;
/** 0 below `from`, 1 above `to`, smooth between. */
const ramp = (v: number, from: number, to: number) => {
  const t = Math.min(1, Math.max(0, (v - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
const LENS_R = 105;
/** The classes that change the hero's layout: a fit is good for one viewport size under one set of them. */
const FIT_CLASSES = ['is-motion', 'is-desktop', 'is-tablet', 'is-mobile', 'is-split'];
/** Fires once every pin is back in flow, before a refresh measures. GSAP's types leave it out. */
const REVERT = 'revert' as 'refresh';

/** Fit the name to the plate and aim the portrait's head between the names (see below). */
function fitHero(section: HTMLElement) {
  // The reduced-motion reset gives every element a 0.01 ms transition, so a size written by the fit
  // was not yet in the layout it read next: the head landed on the "A" of Aditya.
  section.classList.add('is-fitting');
  measureHero(section);
  void section.offsetWidth;
  section.classList.remove('is-fitting');
}

function measureHero(section: HTMLElement) {
  const name = section.querySelector<HTMLElement>('.hero__name');
  const stage = section.querySelector<HTMLElement>('.hero__stage');
  const portrait = section.querySelector<HTMLElement>('.hero__portrait');
  if (!name || !stage || !portrait) return;
  // on the stage, not on the name or the portrait: the layer tags read both (see hero.css)
  stage.style.removeProperty('--fs-name');
  stage.style.removeProperty('--head-px');
  section.classList.remove('no-index');
  const stacked = window.matchMedia('(max-width: 767px), (min-width: 768px) and (max-aspect-ratio: 1 / 1)').matches;
  if (stacked) return;

  const avail = stage.clientWidth - name.offsetLeft * 2;
  if (name.offsetWidth > avail) {
    const fs = parseFloat(getComputedStyle(name).fontSize);
    stage.style.setProperty('--fs-name', `${Math.floor((fs * avail) / name.offsetWidth)}px`);
  }
  // and to the height: on short windows the name must still clear the intro block under it
  const ui = stage.querySelector<HTMLElement>('.hero__ui');
  const room = ui ? ui.offsetTop - 20 - name.offsetTop : Infinity;
  if (name.offsetHeight > room && room > 0) {
    const fs = parseFloat(getComputedStyle(name).fontSize);
    stage.style.setProperty('--fs-name', `${Math.max(40, Math.floor((fs * room) / name.offsetHeight))}px`);
  }

  // Midway between the end of "Perdana" (line 2, beside the face) and the start of "Aditya"
  // (line 1, beside the hair), in stage coordinates: the face then clears both words.
  const [line1, line2] = name.querySelectorAll<HTMLElement>('.hero__line');
  if (!line1 || !line2) return;
  let target: number | null = null;
  const chars1 = line1.querySelectorAll<HTMLElement>('.hero__char');
  const chars2 = line2.querySelectorAll<HTMLElement>('.hero__char');
  if (chars1.length > 6 && chars2.length) {
    const last = chars2[chars2.length - 1];
    target = name.offsetLeft + (chars1[6].offsetLeft + last.offsetLeft + last.offsetWidth) / 2;
  } else if (line1.firstChild?.nodeType === Node.TEXT_NODE && line2.firstChild?.nodeType === Node.TEXT_NODE) {
    const t1 = line1.firstChild as Text;
    const t2 = line2.firstChild as Text;
    const space = t1.data.indexOf(' ');
    if (space > 0) {
      const range = document.createRange();
      range.setStart(t1, space + 1);
      range.setEnd(t1, space + 2);
      const aditya = range.getBoundingClientRect().left;
      range.setStart(t2, 0);
      range.setEnd(t2, t2.data.length);
      const perdanaEnd = range.getBoundingClientRect().right;
      target = (aditya + perdanaEnd) / 2 - stage.getBoundingClientRect().left;
    }
  }
  if (target !== null) stage.style.setProperty('--head-px', `${Math.round(target)}px`);
  // The index needs the plate's right third to itself: its box must clear the portrait's shoulder
  // (the silhouette ends about 5% inside the portrait's box) and the first line of the name.
  const index = stage.querySelector<HTMLElement>('.hero__index');
  if (index && index.offsetWidth) {
    const shoulder = portrait.offsetLeft + portrait.offsetWidth * 0.95;
    const lineBottom = name.offsetTop + line1.offsetHeight;
    section.classList.toggle('no-index', index.offsetLeft < shoulder + 12 || index.offsetTop < lineBottom + 12);
  }
  section.dispatchEvent(new Event('hero:fit'));
}

export default function HeroScene() {
  const rootRef = useRef<HTMLElement | null>(typeof document === 'undefined' ? null : document.getElementById('hero'));

  // Fit and the Vision lens: independent of motion.
  useEffect(() => {
    const section = rootRef.current;
    if (!section) return undefined;
    const portrait = section.querySelector<HTMLElement>('.hero__portrait');
    const cv = section.querySelector<HTMLElement>('.hero__cv');
    const cleanups: (() => void)[] = [];
    // the Vision overlay starts unrendered so its mask images load after the portrait (hero.css)
    section.classList.add('has-cv');
    cleanups.push(() => section.classList.remove('has-cv'));

    // Measure only once the real font is in: measuring the fallback font first would move the
    // portrait twice (a layout shift) as the web font swaps in.
    let ready = false;
    let live = true;
    let fitted = '';
    // After a resize the pinned hero keeps the px size of the last refresh until ScrollTrigger
    // reverts it. A fit made before that measured the old stage and stuck until a reload.
    let stalePin = false;
    const timers: number[] = [];
    const fit = (force = false) => {
      if (!ready) return;
      const key = `${innerWidth}:${innerHeight}:${FIT_CLASSES.filter((c) => section.classList.contains(c)).join(' ')}`;
      if (key === fitted && !force) return;
      // a first fit against a stale pin still shows, and the next revert measures again
      fitted = stalePin ? '' : key;
      fitHero(section);
    };
    const onResize = () => {
      stalePin = section.classList.contains('is-motion');
    };
    const onRefreshInit = () => {
      if (!stalePin) fit();
    };
    const onRevert = () => {
      stalePin = false;
      fit();
    };
    // The poster has no pin and no refresh: refit when the stage itself changes size.
    const stage = section.querySelector<HTMLElement>('.hero__stage');
    const poster = new ResizeObserver(() => {
      if (!section.classList.contains('is-motion')) fit(true);
    });
    if (stage) poster.observe(stage);
    void fontsReady().then(() => {
      ready = true;
      fit();
      // the facts resolve out of scrambled glyphs once, like a terminal printing them
      if (!live) return;
      section.querySelectorAll<HTMLElement>('.hero__facts li').forEach((li, i) => timers.push(window.setTimeout(() => decrypt(li, 0.8), 150 + i * 140)));
    });
    section.querySelectorAll<HTMLElement>('.hero__actions .btn').forEach((b) => cleanups.push(magnet(b, 0.28)));
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.addEventListener(REVERT, onRevert);
    window.addEventListener('resize', onResize);
    cleanups.push(() => {
      ScrollTrigger.removeEventListener('refreshInit', onRefreshInit);
      ScrollTrigger.removeEventListener(REVERT, onRevert);
      window.removeEventListener('resize', onResize);
      poster.disconnect();
    });

    if (portrait && cv && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const lens = document.createElement('div');
      lens.className = 'hero__lens';
      lens.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('div');
      inner.className = 'hero__lens-inner';
      const copy = cv.cloneNode(true) as HTMLElement;
      // the original (and its layers) may carry GSAP's inline opacity
      [copy, ...copy.querySelectorAll<HTMLElement>('*')].forEach((el) => el.style.removeProperty('opacity'));
      inner.appendChild(copy);
      lens.appendChild(inner);
      portrait.appendChild(lens);
      const move = (e: PointerEvent) => {
        // only at rest (while exploded, the full overlay is already showing)
        if (window.scrollY > 40) {
          lens.classList.remove('is-on');
          return;
        }
        const r = portrait.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        inner.style.width = `${r.width}px`;
        inner.style.height = `${r.height}px`;
        lens.style.transform = `translate3d(${x - LENS_R}px, ${y - LENS_R}px, 0)`;
        inner.style.transform = `translate3d(${LENS_R - x}px, ${LENS_R - y}px, 0)`;
        lens.classList.add('is-on');
      };
      const leave = () => lens.classList.remove('is-on');
      portrait.addEventListener('pointermove', move, { passive: true });
      portrait.addEventListener('pointerleave', leave);
      cleanups.push(() => {
        portrait.removeEventListener('pointermove', move);
        portrait.removeEventListener('pointerleave', leave);
        lens.remove();
      });
    }
    return () => {
      live = false;
      timers.forEach((t) => window.clearTimeout(t));
      cleanups.forEach((fn) => fn());
    };
  }, []);

  useScene(rootRef, ({ variant, k, section }) => {
    const q = gsap.utils.selector(section);
    const [pin] = q('.hero__pin') as HTMLElement[];
    // The pin's spacer is in the prerendered markup: ScrollTrigger would otherwise wrap the pin in a
    // new element, re-inserting the LCP portrait (a second, later LCP entry) when the script runs.
    const [spacer] = q('.hero__spacer') as HTMLElement[];
    const [persp] = q('.hero__persp') as HTMLElement[];
    const [stage] = q('.hero__stage');
    const [plate] = q('.hero__plate') as HTMLElement[];
    const [name] = q('.hero__name') as HTMLElement[];
    const [portrait] = q('.hero__portrait') as HTMLElement[];
    const [ui] = q('.hero__ui') as HTMLElement[];
    // the index is part of the interface layer: same depth, same exit
    const front = [ui, ...(q('.hero__index') as HTMLElement[])];
    const tags = q('.hero__tag') as HTMLElement[];
    const cv = q('.hero__portrait > .hero__cv') as HTMLElement[];
    const cvFill = q('.hero__portrait > .hero__cv > .cv-mask, .hero__portrait > .hero__cv > .cv-edge');
    const cvMarks = q('.hero__portrait > .hero__cv > .cv-svg');
    const scan = q('.hero__portrait > .hero__cv > .cv-scan');
    const root = document.documentElement;
    const mobile = variant === 'mobile';

    // Phones need room for the interface card under a strip for the stack; short ones get a lighter
    // exploded view that never hides the interface.
    if (mobile && ui.offsetHeight + 80 + 200 > window.innerHeight) return phoneLite();

    // pin length factor: phones pin at near desktop length (the About phone pin uses the same)
    const kLen = mobile ? 0.9 : k;
    const cleanups: (() => void)[] = [];

    // About sits under the pinned hero and pins while the hero disperses (see handoff.ts).
    // --hero-overlap and --handoff sit on the elements that read them. On <html> each write
    // restyled the whole document: 1900 elements, twice in every ScrollTrigger refresh.
    const about = document.getElementById('about');
    let overlap = '';
    const setOverlap = () => {
      const next = `${pin.offsetHeight + leadPx(kLen)}px`;
      if (next !== overlap) about?.style.setProperty('--hero-overlap', (overlap = next));
      about?.setAttribute('data-jump-offset', String(Math.round(leadPx(kLen))));
    };
    // The About card's photo layer once its chunk has mounted; until then the section holds the value.
    const swapLayer = () => about?.querySelector<HTMLElement>('.about__swap') ?? about;
    const clearHandoff = () => {
      [about, swapLayer(), portrait].forEach((el) => el?.style.removeProperty('--handoff'));
      about?.style.removeProperty('--hero-overlap');
      root.classList.remove('hero-handed');
    };
    setOverlap();
    ScrollTrigger.addEventListener('refreshInit', setOverlap);
    cleanups.push(() => ScrollTrigger.removeEventListener('refreshInit', setOverlap));

    // The portrait scales about its transform origin (ox, oy); the landing keeps its top-left
    // corner on the About card's front face (measured untransformed).
    const origin = { x: 0, y: 0 };
    const landing = () => {
      const card = document.querySelector<HTMLElement>('#about.is-motion:is(.is-desktop, .is-tablet, .is-pinned) [data-handoff]');
      const aboutPin = card?.closest<HTMLElement>('.about__pin');
      const from = offsetWithin(portrait, pin);
      if (!card || !aboutPin) return { x: -from.width * 0.35, y: from.height * 0.1, scale: 0.6 };
      const to = offsetWithin(card, aboutPin);
      const s = to.height / from.height;
      // centred across the card (a phone's card is wider than the 3:4 portrait)
      const dx = (to.width - from.width * s) / 2;
      return { x: to.left + dx - from.left - origin.x * (1 - s), y: to.top - from.top - origin.y * (1 - s), scale: s };
    };

    // On phones the name wraps at its natural (min-content) width: characters stay inside unbreakable
    // words (.hero__word), or the min-content of single characters would be one letter wide.
    // Created once the web fonts are in (splitName below): on a slow connection this build step
    // runs while they are still downloading, and SplitText warns about a split made in the fallback.
    let split: SplitText | null = null;
    // Each character shows its own slice of the name's gradient (so it survives the scatter). Measured
    // from layout offsets (through positioned words), never from on-screen boxes: a refresh can run
    // this mid-choreography, and transformed boxes cut the glyphs out of their gradient.
    const paintGradient = () => {
      if (!split) return;
      const w = `${name.offsetWidth}px`;
      const h = `${name.offsetHeight}px`;
      (split.chars as HTMLElement[]).forEach((c) => {
        const o = offsetWithin(c, name);
        c.style.setProperty('--gx', `${-o.left}px`);
        c.style.setProperty('--gy', `${-o.top}px`);
        c.style.setProperty('--gw', w);
        c.style.setProperty('--gh', h);
      });
    };
    section.addEventListener('hero:fit', paintGradient);
    let live = true;
    cleanups.push(() => {
      live = false;
      section.removeEventListener('hero:fit', paintGradient);
      section.classList.remove('is-split');
      split?.revert();
    });

    let handed = false;
    let handoff = -1;
    let render = () => {};
    let relief: Relief | null = null;
    let reliefReady = false;
    let reliefPending = false;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${HERO_PIN * window.innerHeight * kLen}`,
        pin,
        pinSpacer: spacer,
        scrub: 0.6,
        invalidateOnRefresh: true,
        // a refresh (resize, a far jump) restores progress without onUpdate
        onRefresh: () => sync(),
      },
      onUpdate: () => sync(),
    });
    // Crossfade the flying portrait into the About card photo over the last stretch of the flight.
    function sync() {
      render();
      // About mounts on the first scroll too; let that layout settle before compiling the relief.
      if (reliefReady && !reliefPending && tl.progress() > 0.12 && tl.progress() < HOLD_END) startRelief();
      if (relief) {
        // none at rest, full through the exploded view, gone again before the portrait flies off
        const p = tl.progress();
        const strength = ramp(p, 0.03, 0.38) * (1 - ramp(p, 0.66, 0.74));
        const beam = scan[0];
        relief.update(
          mobile ? st.a : Number(gsap.getProperty(stage, 'rotationX')),
          mobile ? 0 : Number(gsap.getProperty(stage, 'rotationY')),
          strength,
          // .cv-scan is 16 % of the portrait tall and travels by its own height
          (Number(gsap.getProperty(beam, 'yPercent')) / 100 + 1) * 0.16,
          Number(gsap.getProperty(beam, 'opacity')),
        );
      }
      // The backdrop fades during the dispersal. Set from progress, not tweened: a tween wrote the
      // plate's opacity mid-way through its CSS intro (0) at build time and left it invisible.
      const fade = Math.min(1, Math.max(0, (tl.progress() - HOLD_END) / (HERO_DISPERSE * 0.85)));
      plate.style.opacity = fade > 0 ? (1 - fade).toFixed(3) : '';
      const h = Math.round(Math.min(1, Math.max(0, (tl.progress() - 0.9) / 0.09)) * 100) / 100;
      if (h !== handoff) {
        handoff = h;
        [portrait, swapLayer()].forEach((el) => el?.style.setProperty('--handoff', String(h)));
      }
      const done = tl.progress() > 0.995;
      if (done !== handed) {
        handed = done;
        root.classList.toggle('hero-handed', done);
      }
    }

    // Depth relief on the portrait: a lazy chunk, mounted once the page has loaded and is idle (as
    // the backdrop is), so neither its code nor the depth map competes with the hero.
    const startRelief = () => {
      reliefPending = true;
      void import('./heroRelief')
        .then((m) => live ? m.mountRelief(portrait) : null)
        .then((mounted) => {
          if (!live) return mounted?.destroy();
          relief = mounted;
          sync();
        }).catch(() => {});
    };
    const cancelRelief = afterLoad(() => { reliefReady = true; sync(); });
    const resizeRelief = () => relief?.resize();
    ScrollTrigger.addEventListener('refresh', resizeRelief);
    cleanups.push(() => {
      cancelRelief();
      ScrollTrigger.removeEventListener('refresh', resizeRelief);
      relief?.destroy();
      relief = null;
    });

    // The scan: a band of light sweeps the portrait; the segmentation comes first, then the boxes
    // and landmarks as the band passes them.
    const addScan = (at: number, len: number) => {
      tl.to(cv, { opacity: 1, duration: 0.02 }, at)
        .fromTo(cvFill, { opacity: 0 }, { opacity: 1, duration: len * 0.3, immediateRender: true }, at)
        .fromTo(scan, { yPercent: -100, opacity: 1 }, { yPercent: 625, duration: len, ease: 'power1.inOut', immediateRender: true }, at)
        .to(scan, { opacity: 0, duration: len * 0.15 }, at + len * 0.85)
        .fromTo(cvMarks, { opacity: 0 }, { opacity: 1, duration: len * 0.3, immediateRender: true }, at + len * 0.35);
    };

    const D = HERO_DISPERSE;
    const rand = gsap.utils.random;
    const scatter = (chars: Element[], f: number) =>
      tl.to(
        chars,
        {
          x: () => rand(-260, 260) * f,
          y: () => rand(-180, 180) * f,
          z: () => rand(-400, 400) * f,
          rotationX: () => rand(-70, 70),
          rotationY: () => rand(-90, 90),
          opacity: 0,
          duration: D * 0.6,
          ease: 'power1.in',
          stagger: { each: 0.004, from: 'random' },
        },
        HOLD_END + 0.01,
      );
    /** Split the name and add its scatter to the running timeline, then re-measure. */
    const splitName = (f: number) =>
      void fontsReady().then(() => {
        if (!live) return;
        split = SplitText.create(name, { type: mobile ? 'words,chars' : 'chars', charsClass: 'hero__char', wordsClass: 'hero__word' });
        section.classList.add('is-split');
        paintGradient();
        scatter(split.chars, f);
        refreshSoon();
      });

    if (!mobile) {
      const Z = [-360, -120, 120, 320].map((z) => z * k);
      gsap.set(portrait, { transformOrigin: '0 0' });
      gsap.set(tags, { z: (i: number) => [2, 3, 4, 5][i] });
      // 0 -> 0.45: turn to a three-quarter view and pull the layers apart
      tl.to(stage, { rotateX: TILT, rotateY: TURN, scale: 0.8, duration: EXPLODE, ease: 'power1.inOut' }, 0);
      // Turning and tilting the stage slides every layer across the screen by its depth (z x tan of
      // the angle). Unchecked, the portrait drifted over the ends of "Gading" and "Perdana", the
      // interface ran off the left edge of a 1190 px window, and in a short window it rose into the
      // name. The name and the interface slide back by their depth relative to the portrait, so the
      // stack reads as the poster seen from the side. The backdrop keeps its drift: that is the depth.
      const rad = Math.PI / 180;
      /** Where each layer sits for a given turn and tilt of the stage. */
      const poseAt = (turn: number, tilt: number) => {
        const X = Z.map((z) => (z - Z[2]) * Math.tan(-turn * rad));
        const Y = Z.map((z) => (z - Z[2]) * Math.tan(tilt * rad));
        return [
          { z: Z[0] },
          // a little further than its depth: perspective draws the portrait (in front) larger, and
          // the head would cover the last letter of each word again
          { z: Z[1], x: X[1] - 64 * k, y: Y[1] },
          { z: Z[2] },
          { z: Z[3], x: X[3], y: Y[3] },
        ];
      };
      const pose = poseAt(TURN, TILT);
      [plate, name, portrait, ui].forEach((layer, i) => tl.to(layer, { ...pose[i], duration: EXPLODE, ease: 'power1.inOut' }, 0));
      // the index has nothing above it to clear, and sliding down would take it off a short window
      tl.to(front.slice(1), { z: Z[3], x: pose[3].x, duration: EXPLODE, ease: 'power1.inOut' }, 0);
      tags.forEach((t, i) => {
        tl.to(t, { ...pose[i], z: Z[i] + 6, duration: EXPLODE, ease: 'power1.inOut' }, 0);
        tl.to(t, { opacity: 1, duration: 0.1 }, 0.22 + i * 0.03);
      });
      // 0.45 -> 0.75: the hold is a slow turn, not a freeze: the relief shifts with it, and a scan
      // of this stretch had found 0.3 viewport heights where almost nothing changed. The layers
      // keep sliding with the angle, so the name stays clear of the head throughout.
      const hold = { duration: HOLD_END - EXPLODE, ease: 'sine.inOut' };
      const rest = poseAt(TURN_END, TILT_END);
      tl.to(stage, { rotateX: TILT_END, rotateY: TURN_END, ...hold }, EXPLODE);
      [name, ui].forEach((layer, n) => tl.to(layer, { x: rest[n ? 3 : 1].x, y: rest[n ? 3 : 1].y, ...hold }, EXPLODE));
      tl.to(front.slice(1), { x: rest[3].x, ...hold }, EXPLODE);
      tl.to(tags[1], { x: rest[1].x, y: rest[1].y, ...hold }, EXPLODE).to(tags[3], { x: rest[3].x, y: rest[3].y, ...hold }, EXPLODE);
      // what the model sees: segmentation, boxes and landmarks on the portrait layer
      addScan(0.2, 0.22);
      // hold, then the labels go; the overlay stays on the portrait through its flight (the About
      // card takes over its mask and contour on landing, see AboutScene)
      tl.to(tags, { opacity: 0, duration: 0.08 }, HOLD_END - 0.1);
      // 0.75 -> 1: disperse into the next scene
      tl.to(stage, { rotateX: 0, rotateY: 0, scale: 1, duration: D, ease: 'power2.inOut' }, HOLD_END)
        .to(front, { y: -180 * k, z: Z[3] + 240 * k, opacity: 0, duration: D * 0.7, ease: 'power1.in' }, HOLD_END)
        // the name squares up with the stage again while its letters scatter
        .to(name, { x: 0, y: 0, duration: D * 0.6, ease: 'power2.inOut' }, HOLD_END)
        .to(plate, { z: -900 * k, duration: D * 0.9, ease: 'power1.in' }, HOLD_END)
        .to(portrait, { x: () => landing().x, y: () => landing().y, scale: () => landing().scale, z: 0, duration: D, ease: 'power2.inOut' }, HOLD_END);
      splitName(k);
      return () => {
        cleanups.forEach((fn) => fn());
        clearHandoff();
      };
    }

    /*
     * Phones: the show.
     *   0.00-0.20  the poster turns into an isometric exploded stack in the top half (each layer
     *              displaced along the tilted plane's normal, drawn as a dashed plane, tagged) while
     *              the interface rises from below as a card in the bottom half, readable and live;
     *   0.20-0.52  the stack orbits slowly and the Vision scan sweeps the portrait;
     *   0.52-0.66  the card lifts away; the stack glides to the centre and grows;
     *   0.75-1.00  the stack swings back to face you, the name scatters, the backdrop fades, and the
     *              portrait flies into the About card (the silhouette hand-off, as on desktop).
     * One state object drives the stack. It is drawn without perspective (hero.css): `zb` only keeps
     * the stack behind the interface card, and `oy` is where its hinge sits on screen.
     */
    const [tBackdrop, tType, tPortrait, tInterface] = tags;
    const rigid: { el: HTMLElement; d: number }[] = [
      { el: plate, d: 0 },
      { el: tBackdrop, d: 3 },
      { el: name, d: 90 },
      { el: tType, d: 93 },
      { el: portrait, d: 190 },
      { el: tPortrait, d: 193 },
    ];
    const planes = [plate, name, portrait];
    // Poses (tilt a, turn c, degrees): apart beside the card, then alone on the screen. The second
    // is turned and tilted less, so the plate stands taller than it is wide and can use the height.
    const POSE_A = { a: 52, c: -28 };
    const POSE_C = { a: 42, c: -12 };
    const st = { a: 0, c: 0, s: 1, zb: 0, lift: 0, spread: 0, oy: 0 };
    const geo = { plateC: 0, oyA: 0, oyC: 0, sA: 0.6, sC: 0.8, uiY: 0, perspTop: 0 };
    const RAD = Math.PI / 180;
    let measured = '';

    const measure = () => {
      // Lazy pins refresh the whole page; the rigid stack only needs new geometry after a resize
      // or its font/split changes. Rewriting every hinge otherwise forces repeated layouts.
      const key = `${innerWidth}:${innerHeight}:${document.fonts.status}:${section.classList.contains('is-split')}`;
      if (key === measured) return;
      measured = key;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const pl = offsetWithin(plate, persp);
      geo.perspTop = offsetWithin(persp, pin).top;
      geo.plateC = pl.top + pl.height / 2;
      // the interface card rests on the bottom edge
      const uiBox = offsetWithin(ui, pin);
      const sheetTop = vh - 14 - ui.offsetHeight;
      geo.uiY = sheetTop - uiBox.top;
      // Fit the exploded stack by projecting it. Each layer's corners go through the steps the render
      // applies (scale about the hinge, tilt, turn, rise along the plane's normal by the layer's
      // depth), and the scale is the largest whose outline stays inside the screen. There is no
      // perspective term: the phone stack is drawn without one (see hero.css). An earlier estimate
      // from the plate alone was tuned by eye and capped the stack at under half of an 844 px screen.
      const hinge = { x: pl.left + pl.width / 2, y: geo.plateC };
      const outline = [
        { el: plate, d: 0 },
        { el: name, d: 90 },
        { el: portrait, d: 190 },
      ].map(({ el, d }) => {
        const b = offsetWithin(el, persp);
        return { d, xs: [b.left - hinge.x, b.left + b.width - hinge.x], ys: [b.top - hinge.y, b.top + b.height - hinge.y] };
      });
      const extent = (pose: { a: number; c: number }, s: number) => {
        const [ca, sa, cc, sc] = [Math.cos(pose.a * RAD), Math.sin(pose.a * RAD), Math.cos(pose.c * RAD), Math.sin(pose.c * RAD)];
        const e = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
        for (const { d, xs, ys } of outline) {
          for (const px of xs) {
            for (const py of ys) {
              const y = py * s * ca;
              const X = px * s * cc - y * sc + d * sa * sc;
              const Y = px * s * sc + y * cc - d * sa * cc;
              e.x0 = Math.min(e.x0, X);
              e.x1 = Math.max(e.x1, X);
              e.y0 = Math.min(e.y0, Y);
              e.y1 = Math.max(e.y1, Y);
            }
          }
        }
        return e;
      };
      /** Largest scale (up to `cap`) at which the pose fits between y0 and y1, and where to centre it. */
      const fit = (pose: { a: number; c: number }, y0: number, y1: number, cap: number) => {
        const half = vw / 2 - 8;
        const fits = (s: number) => {
          const e = extent(pose, s);
          return e.x0 >= -half && e.x1 <= half && e.y1 - e.y0 <= y1 - y0;
        };
        let [lo, hi] = [0.34, cap];
        if (fits(hi)) lo = hi;
        else for (let i = 0; i < 18; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        const e = extent(pose, lo);
        // the hinge goes where the outline sits centred
        return { s: lo, oy: (y0 + y1) / 2 - geo.perspTop - (e.y0 + e.y1) / 2 };
      };
      const top = 80;
      // while the card is up, the stack may run behind the card's top edge (the card is in front)
      const a = fit(POSE_A, top, sheetTop + 110, 0.95);
      // alone on the screen it may grow past its resting size
      const c = fit(POSE_C, top, vh - 24, 1.3);
      [geo.sA, geo.oyA, geo.sC, geo.oyC] = [a.s, a.oy, c.s, c.oy];
      // one shared hinge for the rigid stack: the plate's centre, in each element's own box
      const cx = plate.offsetLeft + plate.offsetWidth / 2;
      const cy = plate.offsetTop + plate.offsetHeight / 2;
      rigid.forEach(({ el }) => gsap.set(el, { transformOrigin: `${cx - el.offsetLeft}px ${cy - el.offsetTop}px` }));
      origin.x = cx - portrait.offsetLeft;
      origin.y = cy - portrait.offsetTop;
      // each tag sits on the edge of its own layer (the interface tag on the card)
      const put = (tag: HTMLElement, left: number, t: number) => Object.assign(tag.style, { left: `${left}px`, top: `${t}px`, right: 'auto', bottom: 'auto' });
      put(tBackdrop, plate.offsetLeft + plate.offsetWidth - tBackdrop.offsetWidth - 16, plate.offsetTop + 14);
      put(tType, name.offsetLeft + 16, name.offsetTop + name.offsetHeight - 4);
      put(tPortrait, portrait.offsetLeft + portrait.offsetWidth - tPortrait.offsetWidth - 22, portrait.offsetTop - 7);
      put(tInterface, ui.offsetLeft + 12, ui.offsetTop - 22);
    };
    measure();
    ScrollTrigger.addEventListener('refreshInit', measure);
    cleanups.push(() => ScrollTrigger.removeEventListener('refreshInit', measure));

    render = () => {
      // the tilted plane's normal: rotateX(a) then rotate(c), as GSAP composes them
      const nx = Math.sin(st.a * RAD) * Math.sin(st.c * RAD);
      const ny = -Math.sin(st.a * RAD) * Math.cos(st.c * RAD);
      const nz = Math.cos(st.a * RAD);
      const yb = st.lift * (st.oy - geo.plateC);
      const handing = tl.progress() > HOLD_END;
      rigid.forEach(({ el, d }) => {
        if (handing && el === portrait) return;
        const t = d * st.spread;
        gsap.set(el, { rotateX: st.a, rotation: st.c, scale: st.s, x: t * nx, y: yb + t * ny, z: st.zb + t * nz });
      });
    };
    st.oy = geo.oyA;

    const IN = 0.2;
    // apart: into the isometric stack; the interface card rises
    tl.to(st, { ...POSE_A, s: () => geo.sA, zb: -260, lift: 1, duration: IN, ease: 'power2.inOut' }, 0)
      // the layers pop apart with a little overshoot, like a physical stack
      .to(st, { spread: 1, duration: IN * 0.9, ease: 'back.out(1.6)' }, IN * 0.25)
      .to([ui, tInterface], { y: () => geo.uiY, duration: IN, ease: 'power3.out' }, 0.02)
      .to(ui, { '--sheet': 1, duration: 0.1 }, 0.05)
      .to(planes, { '--planes': 1, duration: 0.08 }, 0.1)
      .to([tBackdrop, tType, tPortrait, tInterface], { opacity: 1, duration: 0.06, stagger: 0.02 }, 0.1)
      // orbit while the scan runs
      .to(st, { a: 48, c: -14, duration: 0.32, ease: 'sine.inOut' }, IN);
    addScan(0.24, 0.22);
    // the card lifts away; the stack takes the whole screen
    tl.to([ui, tInterface], { y: () => geo.uiY - 140, opacity: 0, duration: 0.12, ease: 'power2.in' }, 0.52)
      .to(ui, { '--sheet': 0, duration: 0.08 }, 0.56)
      .to(st, { oy: () => geo.oyC, s: () => geo.sC, ...POSE_C, duration: 0.14, ease: 'power2.inOut' }, 0.52)
      // back together facing you, then the hand-off
      .to([tBackdrop, tType, tPortrait], { opacity: 0, duration: 0.05 }, HOLD_END - 0.04)
      .to(planes, { '--planes': 0, duration: 0.06 }, HOLD_END - 0.03)
      .to(st, { a: 0, c: 0, s: 1, zb: 0, lift: 0, spread: 0, duration: D, ease: 'power2.inOut' }, HOLD_END)
      .to(
        portrait,
        { x: () => landing().x, y: () => landing().y, scale: () => landing().scale, z: 0, rotateX: 0, rotation: 0, duration: D, ease: 'power2.inOut' },
        HOLD_END,
      );
    splitName(0.6);
    render();
    // at rest the interface is below the fold and the pin holds it there: it shows while its card is up
    cleanups.push(showOnFocus(section, () => tl.scrollTrigger, (el) => (ui.contains(el) ? [0.25, 0.48] : null)));

    return () => {
      cleanups.forEach((fn) => fn());
      clearHandoff();
      tags.forEach((t) => ['left', 'top', 'right', 'bottom'].forEach((key) => t.style.removeProperty(key)));
    };

    /** Short phones: a lighter exploded view in a short pin; the interface stays in the page flow. */
    function phoneLite() {
      const [tB, tT, tP, tI] = tags;
      const lanes = [plate, name, portrait];
      const stack = [...lanes, tB, tT, tP];
      gsap.set(tI, { display: 'none' });
      const place = () => {
        const cx = plate.offsetLeft + plate.offsetWidth / 2;
        const cy = plate.offsetTop + plate.offsetHeight / 2;
        stack.forEach((el) => gsap.set(el, { transformOrigin: `${cx - el.offsetLeft}px ${cy - el.offsetTop}px` }));
        const put = (tag: HTMLElement, left: number, t: number) => Object.assign(tag.style, { left: `${left}px`, top: `${t}px`, right: 'auto', bottom: 'auto' });
        put(tB, plate.offsetLeft + plate.offsetWidth - tB.offsetWidth - 16, plate.offsetTop + 14);
        put(tT, name.offsetLeft + 16, name.offsetTop + name.offsetHeight - 4);
        put(tP, portrait.offsetLeft + portrait.offsetWidth - tP.offsetWidth - 22, portrait.offsetTop - 7);
      };
      place();
      ScrollTrigger.addEventListener('refreshInit', place);
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 0.85}`, pin, pinSpacer: spacer, scrub: 0.6, invalidateOnRefresh: true },
        })
        .to(stack, { rotateX: 16, scale: 0.84, duration: 0.42, ease: 'power2.inOut' }, 0)
        .to(plate, { z: -70, duration: 0.42, ease: 'power2.inOut' }, 0)
        .to([name, tT], { z: (i: number) => 36 + i * 2, y: -26, duration: 0.42, ease: 'power2.inOut' }, 0)
        .to([portrait, tP], { z: (i: number) => 110 + i * 2, y: 18, x: () => -plate.offsetWidth * 0.07, duration: 0.42, ease: 'power2.inOut' }, 0)
        .to(tB, { z: -68, duration: 0.42, ease: 'power2.inOut' }, 0)
        .to(lanes, { '--planes': 1, duration: 0.16 }, 0.2)
        .to([tB, tT, tP], { opacity: 1, duration: 0.12, stagger: 0.04 }, 0.24)
        .to(cv, { opacity: 1, duration: 0.16 }, 0.22)
        .to([...cv, tB, tT, tP], { opacity: 0, duration: 0.1 }, 0.7)
        .to(lanes, { '--planes': 0, duration: 0.1 }, 0.7)
        .to(stack, { rotateX: 0, scale: 1, z: 0, y: 0, x: 0, duration: 0.3, ease: 'power2.inOut' }, 0.7);
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', place);
        [tB, tT, tP].forEach((t) => ['left', 'top', 'right', 'bottom'].forEach((key) => t.style.removeProperty(key)));
        gsap.set(tI, { clearProps: 'display' });
      };
    }
  });

  return null;
}
