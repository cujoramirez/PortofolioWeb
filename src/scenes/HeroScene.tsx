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
 * Phones: see "read upright" below (the name leaves, the portrait steps forward at full width,
 * the Vision scan reads it, and the same hand-off to the About card). No layer stack: tilted to
 * fit a phone it was a thumbnail. Short phones get the same in a short pin.
 */
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { decrypt, magnet } from '../lib/micro';
import { showOnFocus } from '../lib/focusStep';
import { fontsReady } from '../lib/fonts';
import { refreshSoon } from '../lib/scroll';
import { split, type Split } from '../lib/split';
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
/** Phones: how far the relief turns the portrait to either side (degrees) while it is read. */
const SWAY = 24;
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
    const [stage] = q('.hero__stage');
    const [plate] = q('.hero__plate') as HTMLElement[];
    const [name] = q('.hero__name') as HTMLElement[];
    const [portrait] = q('.hero__portrait') as HTMLElement[];
    const [ui] = q('.hero__ui') as HTMLElement[];
    // the index is part of the interface layer: same depth, same exit
    const front = [ui, ...(q('.hero__index') as HTMLElement[])];
    const tags = q('.hero__tag') as HTMLElement[];
    const cv = q('.hero__portrait > .hero__cv') as HTMLElement[];
    const cvFill = q('.hero__portrait > .hero__cv .cv-mask, .hero__portrait > .hero__cv .cv-edge');
    const cvMarks = q('.hero__portrait > .hero__cv > .cv-svg');
    const scan = q('.hero__portrait > .hero__cv > .cv-scan');
    const root = document.documentElement;
    const mobile = variant === 'mobile';

    // The mobile variant also covers wide windows too short to pin the desktop scene. Those keep
    // the wide layout and a lighter exploded view; the rest of this is for the stacked layout.
    if (mobile && !window.matchMedia('(max-width: 767px)').matches) return shortWide();

    /** The About card's front face in its own pin, which lies over this one: null until About has mounted, and where it does not pin. */
    const cardBox = () => {
      const card = document.querySelector<HTMLElement>('#about.is-motion:is(.is-desktop, .is-tablet, .is-pinned) [data-handoff]');
      const aboutPin = card?.closest<HTMLElement>('.about__pin');
      return card && aboutPin ? offsetWithin(card, aboutPin) : null;
    };

    // Phones. Where the portrait stands once it has stepped forward (offsets from rest and a
    // scale, about its foot), and where the interface card rests and leaves to.
    const geo = { x: 0, y: 0, s: 1, uiY: 0, uiOut: 0, card: false };
    /** Whether this hero hands over to a pinned About card (not on short phones). */
    let handing = true;
    let fitted = '';
    let stale = true;
    // About sizes its card on the same event, after this listener: the fit waits for the first
    // tween value that asks for it.
    const unfit = () => { stale = true; };
    const fit = () => {
      if (!stale) return geo;
      stale = false;
      const box = handing ? cardBox() : null;
      // Lazy pins refresh the whole page; this only changes with the viewport, the font or the card.
      const key = `${innerWidth}:${innerHeight}:${document.fonts.status}:${box ? `${box.top}:${box.height}` : ''}`;
      if (key === fitted) return geo;
      fitted = key;
      const vh = window.innerHeight;
      const pl = offsetWithin(plate, pin);
      const from = offsetWithin(portrait, pin);
      const uiTop = offsetWithin(ui, pin).top;
      // The interface card rests on the bottom edge. Under an About card it takes the rest of the
      // screen, its text centred: `pad` is what its surface (hero.css) gains above and below the text.
      const pad = box ? Math.max(0, (vh - 6 - (box.top + box.height - 14) - ui.offsetHeight - 2) / 2) : 0;
      const sheetTop = pad ? box!.top + box!.height - 20 + pad : vh - 14 - ui.offsetHeight;
      ui.style.setProperty('--pad', `${pad.toFixed(1)}px`);
      geo.uiY = sheetTop - uiTop;
      // with no card to hand over to, it stays, and the hero scrolls away as it stands
      geo.uiOut = box ? vh + 40 + pad - uiTop : geo.uiY;
      geo.card = !!box;
      // The portrait fills the About card it hands over to, so nothing has to move at the hand-off.
      // Without one it fills the plate, down to a little behind the interface card.
      const to = box ?? { left: pl.left + 4, top: pl.top + 8, width: pl.width - 8, height: Math.min(pl.height, handing ? sheetTop + 28 - pl.top : Infinity) - 8 };
      // 3:4, as the picture is
      const h = Math.min(to.height, to.width / 0.75);
      geo.s = h / from.height;
      geo.x = to.left + to.width / 2 - (from.left + from.width / 2);
      geo.y = to.top + to.height - (from.top + from.height);
      return geo;
    };
    /**
     * Phones: the name sinks back into the plate and the portrait steps forward into its place
     * over `len`. It keeps coming, slowly, until `until`: the scan is never over a still picture.
     */
    const stepForward = (t: gsap.core.Timeline, len: number, until: number) => {
      gsap.set(portrait, { transformOrigin: '50% 100%' });
      ScrollTrigger.addEventListener('refreshInit', unfit);
      return t
        // gone before the head reaches its last line
        .to(name, { scale: 0.88, y: -18, transformOrigin: '0% 40%', duration: len * 0.5, ease: 'power1.in' }, 0)
        .to(name, { opacity: 0, duration: len * 0.36 }, 0)
        .to(portrait, { x: () => fit().x, y: () => fit().y, scale: () => fit().s * 0.96, duration: len - 0.01, ease: 'power2.inOut' }, 0.01)
        .to(portrait, { scale: () => fit().s, duration: until - len, ease: 'sine.inOut' }, len);
    };
    /**
     * Phones: the scan at full width. The beam crosses the portrait at the pace of the scroll and
     * the segmentation fills in behind it (--wipe, hero.css); the face's box and landmarks arrive
     * once the beam has cleared the face, the person's box once it has cleared the person.
     */
    const read = (t: gsap.core.Timeline, at: number, len: number) => {
      const group = (cls: string) => q(`.hero__portrait > .hero__cv .${cls}`);
      /** When the beam's lower edge is `y` of the way down the portrait: it travels 1.16 heights. */
      const pop = (cls: string, y: number) =>
        t.fromTo(group(cls), { opacity: 0 }, { opacity: 1, duration: len * 0.06, immediateRender: true }, at + (len * y) / 1.16);
      t.to(cv, { opacity: 1, duration: 0.02 }, at)
        .fromTo(scan, { yPercent: -100, opacity: 1 }, { yPercent: 625, duration: len, immediateRender: true }, at)
        // trailing the beam's edge by the most the relief bends it (0.07 of the height, heroRelief)
        .fromTo(group('cv-seg'), { '--wipe': -0.07 }, { '--wipe': 1.09, duration: len, immediateRender: true }, at)
        .to(scan, { opacity: 0, duration: len * 0.1 }, at + len * 0.84);
      pop('cv-face', 0.5);
      pop('cv-landmarks', 0.53);
      pop('cv-person', 0.95);
    };
    // No room for the interface card under a portrait of useful size: it stays in the page's flow.
    if (mobile && ui.offsetHeight + 80 + 200 > window.innerHeight) return phoneCompact();

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
      // a rebuild may choose the short pin, which hands nothing over
      about?.removeAttribute('data-jump-offset');
      root.classList.remove('hero-handed');
    };
    setOverlap();
    ScrollTrigger.addEventListener('refreshInit', setOverlap);
    cleanups.push(() => ScrollTrigger.removeEventListener('refreshInit', setOverlap));

    // Desktop and tablet: the flight ends with the portrait's top-left corner (its transform
    // origin) on the About card's front face, at the card's height.
    const landing = () => {
      const to = cardBox();
      const from = offsetWithin(portrait, pin);
      if (!to) return { x: -from.width * 0.35, y: from.height * 0.1, scale: 0.6 };
      const s = to.height / from.height;
      return { x: to.left + (to.width - from.width * s) / 2 - from.left, y: to.top - from.top, scale: s };
    };

    // Desktop and tablet split the name into characters, so its exit can scatter them. Created once
    // the web fonts are in (splitName below): on a slow connection this build step runs while they
    // are still downloading, and letters measured in the fallback font get the wrong slices.
    let letters: Split | null = null;
    // Each character shows its own slice of the name's gradient (so it survives the scatter). Measured
    // from layout offsets (through positioned words), never from on-screen boxes: a refresh can run
    // this mid-choreography, and transformed boxes cut the glyphs out of their gradient.
    const paintGradient = () => {
      if (!letters) return;
      const w = `${name.offsetWidth}px`;
      const h = `${name.offsetHeight}px`;
      // Firefox does not paint a background clipped to text on an element that stands in 3D, and
      // once split every letter does: the name showed for a second, then was gone for good. There
      // each letter takes one colour, the gradient's at its middle: how far along the 120 degree
      // line it sits, toward the accent from 45 to 80 % and on toward the secondary to 100 %.
      // (Written here and not in hero.css, which is inlined into a page with no bytes to spare.)
      const gecko = CSS.supports('-moz-appearance', 'none');
      const [dx, dy] = [Math.sin((120 * Math.PI) / 180), -Math.cos((120 * Math.PI) / 180)];
      const along = name.offsetWidth * dx + name.offsetHeight * dy;
      const part = (t: number, from: number, to: number) => `${(Math.min(1, Math.max(0, (t - from) / (to - from))) * 100).toFixed(1)}%`;
      letters.parts.forEach((c) => {
        const o = offsetWithin(c, name);
        c.style.setProperty('--gx', `${-o.left}px`);
        c.style.setProperty('--gy', `${-o.top}px`);
        c.style.setProperty('--gw', w);
        c.style.setProperty('--gh', h);
        if (!gecko) return;
        const t = 0.5 + ((o.left + o.width / 2 - name.offsetWidth / 2) * dx + (o.top + o.height / 2 - name.offsetHeight / 2) * dy) / along;
        c.style.background = 'none';
        c.style.color = c.style.webkitTextFillColor = `color-mix(in srgb, color-mix(in srgb, var(--ink), var(--accent) ${part(t, 0.45, 0.8)}), var(--secondary) ${part(t, 0.8, 1)})`;
      });
    };
    section.addEventListener('hero:fit', paintGradient);
    let live = true;
    cleanups.push(() => {
      live = false;
      section.removeEventListener('hero:fit', paintGradient);
      section.classList.remove('is-split');
      letters?.revert();
    });

    let handed = false;
    let handoff = -1;
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
      // About mounts on the first scroll too; let that layout settle before compiling the relief.
      if (reliefReady && !reliefPending && tl.progress() > 0.12 && tl.progress() < HOLD_END) startRelief();
      if (relief) {
        // none at rest, full while the stack is apart (phones: while the portrait is read), gone
        // again before the portrait flies off
        const p = tl.progress();
        const strength = (mobile ? ramp(p, 0.1, 0.26) : ramp(p, 0.03, 0.38)) * (1 - ramp(p, 0.66, 0.74));
        const beam = scan[0];
        relief.update(
          mobile ? 0 : Number(gsap.getProperty(stage, 'rotationX')),
          // A phone's portrait stays square to the screen. The relief alone turns it, as if the
          // camera moved from one side of it to the other during the scan.
          mobile ? SWAY * (1 - 2 * ramp(p, 0.2, 0.7)) : Number(gsap.getProperty(stage, 'rotationY')),
          strength,
          // .cv-scan is 16 % of the portrait tall and travels by its own height
          (Number(gsap.getProperty(beam, 'yPercent')) / 100 + 1) * 0.16,
          Number(gsap.getProperty(beam, 'opacity')),
        );
      }
      // A phone hands over only to an About card that is there and pinned. Where About flows (or
      // has not mounted) the hero keeps its last frame and scrolls away with the page: hidden, it
      // left a screen of nothing before About arrived.
      const taken = !mobile || fit().card;
      // The backdrop fades during the dispersal. Set from progress, not tweened: a tween wrote the
      // plate's opacity mid-way through its CSS intro (0) at build time and left it invisible.
      const fade = taken ? Math.min(1, Math.max(0, (tl.progress() - HOLD_END) / (HERO_DISPERSE * 0.85))) : 0;
      plate.style.opacity = fade > 0 ? (1 - fade).toFixed(3) : '';
      const h = taken ? Math.round(Math.min(1, Math.max(0, (tl.progress() - 0.9) / 0.09)) * 100) / 100 : 0;
      if (h !== handoff) {
        handoff = h;
        [portrait, swapLayer()].forEach((el) => el?.style.setProperty('--handoff', String(h)));
      }
      const done = taken && tl.progress() > 0.995;
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
        .then((m) => live ? m.mountRelief(portrait, () => (mobile ? fit().s : 1)) : null)
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
    /** Split the name and add its exit to the running timeline, then re-measure. */
    const splitName = (leave: (chars: Element[]) => void) =>
      void fontsReady().then(() => {
        if (!live) return;
        letters = split(name, 'chars', 'hero__char');
        section.classList.add('is-split');
        paintGradient();
        leave(letters.parts);
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
      const rest = poseAt(TURN_END, TILT_END);
      // The index is the nearest layer and the furthest right. Part of the way into the turn, with
      // the stage turned but not yet drawn back, a wide window drew it past its right edge: 43 px
      // at 1512 x 859, 63 at 1920, more beside a scrollbar, with its counts out of sight. So its
      // slide is not one straight move: the stage is put through the turn in quarters here, before
      // any tween has read these elements, and at each the index goes back by what was over. This
      // measures the box on screen on purpose: where the turn puts it is the question.
      const inside = (part: number, turn: number, tilt: number, x: number) => {
        const el = front[1];
        if (!el?.getClientRects().length) return x;
        const was = { rotateX: gsap.getProperty(stage, 'rotateX'), rotateY: gsap.getProperty(stage, 'rotateY'), scale: gsap.getProperty(stage, 'scale') };
        const own = { x: Number(gsap.getProperty(el, 'x')), z: Number(gsap.getProperty(el, 'z')) };
        const limit = document.documentElement.clientWidth - 16;
        gsap.set(stage, { rotateX: tilt, rotateY: turn, scale: 1 - 0.2 * part });
        gsap.set(el, { z: own.z + (Z[3] - own.z) * part });
        // Stepped, not solved in one: this near the viewer a px of slide is up to two on screen,
        // and fewer the further back it goes (one straight step left 33 px over at 2560 wide).
        let at = x;
        for (let step = 0; step < 6; step++) {
          gsap.set(el, { x: at });
          const over = el.getBoundingClientRect().right - limit;
          if (over <= 0.5) break;
          gsap.set(el, { x: at - 20 });
          const per = (over + limit - el.getBoundingClientRect().right) / 20;
          if (per <= 0.1) break;
          at -= over / per;
        }
        gsap.set(stage, was);
        gsap.set(el, own);
        return at;
      };
      const QUARTERS = [0.25, 0.5, 0.75, 1];
      const indexPath = QUARTERS.map((part) => inside(part, TURN * part, TILT * part, (pose[3].x ?? 0) * part));
      const indexRest = inside(1, TURN_END, TILT_END, rest[3].x ?? 0);
      [plate, name, portrait, ui].forEach((layer, i) => tl.to(layer, { ...pose[i], duration: EXPLODE, ease: 'power1.inOut' }, 0));
      // the index has nothing above it to clear, and sliding down would take it off a short window
      tl.to(front.slice(1), { z: Z[3], duration: EXPLODE, ease: 'power1.inOut' }, 0);
      // the same ease as the stage, so each quarter of its turn meets the place measured for it
      tl.to(front.slice(1), { keyframes: { x: [0, ...indexPath], easeEach: 'none' }, duration: EXPLODE, ease: 'power1.inOut' }, 0);
      tags.forEach((t, i) => {
        tl.to(t, { ...pose[i], z: Z[i] + 6, duration: EXPLODE, ease: 'power1.inOut' }, 0);
        tl.to(t, { opacity: 1, duration: 0.1 }, 0.22 + i * 0.03);
      });
      // 0.45 -> 0.75: the hold is a slow turn, not a freeze: the relief shifts with it, and a scan
      // of this stretch had found 0.3 viewport heights where almost nothing changed. The layers
      // keep sliding with the angle, so the name stays clear of the head throughout.
      const hold = { duration: HOLD_END - EXPLODE, ease: 'sine.inOut' };
      tl.to(stage, { rotateX: TILT_END, rotateY: TURN_END, ...hold }, EXPLODE);
      [name, ui].forEach((layer, n) => tl.to(layer, { x: rest[n ? 3 : 1].x, y: rest[n ? 3 : 1].y, ...hold }, EXPLODE));
      tl.to(front.slice(1), { x: indexRest, ...hold }, EXPLODE);
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
      splitName((chars) => scatter(chars, k));
      return () => {
        cleanups.forEach((fn) => fn());
        clearHandoff();
      };
    }

    /*
     * Phones: read upright. One picture on top and one text card below, from the first frame to
     * About's first chapter.
     *   0.00-0.22  the name sinks back into the plate, the portrait steps forward until it fills
     *              the About card's place, and the interface rises below it as a card, readable
     *              and live;
     *   0.14-0.74  the Vision scan crosses the portrait at full width: segmentation behind the
     *              beam, then the face's box and landmarks, then the person's box;
     *   0.75-1.00  the About card's frame draws around the portrait, which already stands where
     *              that card is, the backdrop fades, and the interface card slides down off the
     *              screen as About's first chapter rises in its place (see AboutScene).
     * No layer stack as on the wide layouts: fitted to a phone it was a small tilted thumbnail.
     */
    const IN = 0.22;
    stepForward(tl, IN, HOLD_END);
    // The card is solid before it moves, and rises in step with the portrait: its top edge and
    // the portrait's foot start and end together, so it never climbs over the picture.
    tl.to(ui, { '--sheet': 1, duration: 0.04 }, 0)
      .to(ui, { y: () => fit().uiY, duration: IN - 0.01, ease: 'power2.inOut' }, 0.01)
      // the card leaves through the bottom edge; About's first chapter is rising behind it
      .to(ui, { y: () => fit().uiOut, duration: 0.15, ease: 'power1.in' }, 0.85)
      // with nothing to hand over to, the portrait keeps coming to the end of the pin
      .to(portrait, { scale: () => fit().s * (fit().card ? 1 : 1.03), duration: D, ease: 'sine.out' }, HOLD_END);
    read(tl, 0.14, 0.6);
    // at rest the interface is below the fold and the pin holds it there: it shows while its card is up
    cleanups.push(showOnFocus(section, () => tl.scrollTrigger, (el) => (ui.contains(el) ? [0.25, 0.8] : null)));

    return () => {
      cleanups.forEach((fn) => fn());
      ScrollTrigger.removeEventListener('refreshInit', unfit);
      ui.style.removeProperty('--pad');
      clearHandoff();
    };

    /** Short phones: the same reading in a short pin, with nothing handed over. */
    function phoneCompact() {
      handing = false;
      const short = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: section, start: 'top top', end: () => `+=${window.innerHeight * 0.85}`, pin, pinSpacer: spacer, scrub: 0.6, invalidateOnRefresh: true },
      });
      stepForward(short, 0.26, 1);
      read(short, 0.2, 0.7);
      return () => {
        ScrollTrigger.removeEventListener('refreshInit', unfit);
        ui.style.removeProperty('--pad');
      };
    }

    /** Wide windows too short for the desktop pin: a lighter exploded view in a short pin. */
    function shortWide() {
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
        .to([tB, tT, tP], { opacity: 1, duration: 0.12, stagger: 0.04 }, 0.24)
        .to(cv, { opacity: 1, duration: 0.16 }, 0.22)
        .to([...cv, tB, tT, tP], { opacity: 0, duration: 0.1 }, 0.7)
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
