/**
 * Depth relief on the hero portrait: a canvas over the image, under the Vision overlay. As the
 * stage tilts, each pixel is looked up a little to the side according to its depth, so the nose,
 * jaw and shoulders move against each other as a relief would. The depth is a real estimate
 * (Depth Anything V2 Small, baked by scripts/vision): nothing here is placed by hand.
 *
 * It has no clock and no pointer input. HeroScene calls `update` from its timeline's `sync()`,
 * and each call costs at most one frame. At strength 0 the canvas shows exactly the image, so it
 * is hidden and the image shows instead.
 * The overlay's boxes and landmarks stay in the SVG: this module gives each its depth (`--k`) and
 * moves them with two variables, by the same amount the shader moves the pixel under them.
 */
import { depth, face, width, height } from '../data/vision.json';
import { createQuad, loadTexture } from '../lib/gl';
import './heroRelief.css';

/** The depth that stays put: the face, so the boxes around it barely move. */
const FOCUS = depth.face ?? 0.5;
/** Shift per unit of depth at sin(tilt) = 1, as a share of the picture's width. The chest is 0.59
    nearer than the face, so at the stage's 24 degrees it moves 2 % of the width. */
const AMOUNT = 0.083;
/** Phones tilt the stack past 50 degrees: the shift stops growing here. */
const MAX_SIN = 0.42;

const FRAG = `
precision mediump float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uShift;
uniform float uFocus;
uniform vec3 uScan;
varying vec2 vUv;

void main() {
  // The pixel shown here came from a point whose own depth decided how far it moved: walk back to it.
  vec2 src = vUv;
  for (int i = 0; i < 4; i++) src = vUv - uShift * (texture2D(uDepth, src).r - uFocus);
  float d = texture2D(uDepth, src).r;
  vec4 colour = texture2D(uImage, src);
  colour *= step(0.0, src.x) * step(src.x, 1.0) * step(0.0, src.y) * step(src.y, 1.0);

  // The scan beam: the same gradient as .cv-scan, but nearer surfaces meet it sooner, so the
  // band bends over the face and shoulders. uScan = bottom edge, height, opacity.
  float t = (vUv.y + 0.07 * d - (uScan.x - uScan.y)) / uScan.y;
  vec4 lo = vec4(34.0, 211.0, 238.0, 255.0) / 255.0 * 0.22;
  vec4 hi = vec4(165.0, 243.0, 252.0, 255.0) / 255.0 * 0.95;
  vec4 beam = t < 0.72 ? lo * (t / 0.72) : mix(lo, hi, (t - 0.72) / 0.28);
  beam *= step(0.0, t) * step(t, 1.0) * uScan.z;
  gl_FragColor = beam + colour * (1.0 - beam.a);
}`;

export interface Relief {
  /** Tilt in degrees (rotateX, rotateY), strength 0..1, and the scan beam's bottom edge (0..1 down the portrait) and opacity. */
  update(rotateX: number, rotateY: number, strength: number, scanEdge: number, scanOpacity: number): void;
  resize(): void;
  destroy(): void;
}

export async function mountRelief(portrait: HTMLElement): Promise<Relief | null> {
  const img = portrait.querySelector<HTMLImageElement>('.hero__img');
  const overlay = portrait.querySelector<HTMLElement>(':scope > .hero__cv');
  const svg = overlay?.querySelector<SVGSVGElement>('.cv-svg');
  if (!img || !overlay || !svg) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'hero__relief';
  canvas.setAttribute('aria-hidden', 'true');

  const marks = document.createElement('canvas');
  marks.className = 'hero__relief-marks';
  marks.setAttribute('aria-hidden', 'true');
  const ctx = marks.getContext('2d');
  const landmarkGroup = svg.querySelector<SVGGElement>('.cv-landmarks');
  const state = { sx: 0, sy: 0, strength: 0, scan: 0, scanOpacity: 0, marksOpacity: 0 };
  let ready = false;
  let dead = false;
  const show = (on: boolean) => {
    // fades in over the first eighth of the strength, while the shift is still under a pixel;
    // the image steps aside only once the canvas fully covers it
    canvas.style.opacity = on ? String(Math.min(1, state.strength * 8)) : '0';
    portrait.classList.toggle('is-relief', on && state.strength * 8 >= 1);
  };
  const quad = createQuad(canvas, FRAG, {
    frame: (q) => {
      q.set('uShift', state.sx * state.strength, state.sy * state.strength);
      q.set('uFocus', FOCUS);
      q.set('uScan', state.scan, 0.16, state.scanOpacity);
      if (ctx) {
        ctx.clearRect(0, 0, marks.width, marks.height);
        const scale = Math.min(marks.width / width, marks.height / height);
        ctx.save();
        ctx.translate((marks.width - width * scale) / 2, marks.height - height * scale);
        ctx.scale(scale, scale);
        ctx.globalAlpha = state.marksOpacity;
        ctx.strokeStyle = '#a5f3fc';
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        Object.entries(face.landmarks).forEach(([key, points]) => {
          const values = depth.landmarks[key as keyof typeof depth.landmarks];
          const moved = points.map(([x, y], i) => [x + state.sx * state.strength * width * (values[i] - FOCUS), y + state.sy * state.strength * height * (values[i] - FOCUS)]);
          ctx.beginPath();
          moved.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
          if (key !== 'faceContour' && key !== 'noseCrest') ctx.closePath();
          ctx.stroke();
          moved.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); });
        });
        ctx.restore();
      }
      // The first draw and visibility switch share a paint; an empty canvas never covers LCP.
      show(ready && state.strength > 0);
    },
    onLost: () => {
      ready = false;
      show(false);
    },
    onRestored: () => void load().then((ok) => { if (ok && !dead) quad?.request(); }),
  });
  if (!quad) return null;

  const load = async () => {
    const [image, map] = await Promise.all([loadTexture(quad.gl, img.currentSrc || img.src), loadTexture(quad.gl, depth.portrait)]);
    if (dead) return false;
    if (!image || !map) return false;
    quad.bind('uImage', 0, image.texture);
    quad.bind('uDepth', 1, map.texture);
    ready = true;
    return true;
  };
  if (!(await load())) {
    quad.destroy();
    return null;
  }

  // Each overlay element learns its depth relative to the face: the boxes at their centres, a
  // landmark line at its mean, every dot at its own point. Document order matches the baked data.
  const k = (el: Element | null, value: number | null) => (el as SVGElement | null)?.style.setProperty('--k', ((value ?? FOCUS) - FOCUS).toFixed(3));
  k(svg.querySelector('.cv-person'), depth.person);
  k(svg.querySelector('.cv-face'), depth.face);
  const [vw, vh] = [svg.viewBox.baseVal.width, svg.viewBox.baseVal.height];

  portrait.insertBefore(canvas, overlay);
  overlay.appendChild(marks);
  portrait.classList.add('has-relief');
  const resize = () => {
    quad.size(portrait.offsetWidth, portrait.offsetHeight, 2);
    marks.width = canvas.width;
    marks.height = canvas.height;
    const scale = Math.min(portrait.offsetWidth / width, portrait.offsetHeight / height);
    canvas.style.left = `${(portrait.offsetWidth - width * scale) / 2}px`;
    canvas.style.top = `${portrait.offsetHeight - height * scale}px`;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  };
  resize();

  const clampSin = (degrees: number) => Math.max(-MAX_SIN, Math.min(MAX_SIN, Math.sin((degrees * Math.PI) / 180)));
  return {
    update(rotateX, rotateY, strength, scanEdge, scanOpacity) {
      // A surface nearer than the stage plane slides by depth x sin(tilt): left when the stage
      // turns its right edge away (rotateY < 0), up when it tips its top away (rotateX > 0).
      state.sx = AMOUNT * clampSin(rotateY);
      state.sy = -AMOUNT * clampSin(rotateX) * (portrait.offsetWidth / Math.max(1, portrait.offsetHeight));
      state.strength = strength;
      state.scan = scanEdge;
      state.scanOpacity = scanOpacity;
      state.marksOpacity = landmarkGroup ? Number(getComputedStyle(landmarkGroup).opacity) : 0;
      // the overlay follows in the SVG's own units
      svg.style.setProperty('--rx', `${(state.sx * strength * vw).toFixed(2)}px`);
      svg.style.setProperty('--ry', `${(state.sy * strength * vh).toFixed(2)}px`);
      if (!ready || strength <= 0) show(false);
      if (ready && strength > 0) quad.request();
    },
    resize,
    destroy() {
      dead = true;
      quad.destroy();
      canvas.remove();
      marks.remove();
      portrait.classList.remove('has-relief', 'is-relief');
      svg.style.removeProperty('--rx');
      svg.style.removeProperty('--ry');
    },
  };
}
