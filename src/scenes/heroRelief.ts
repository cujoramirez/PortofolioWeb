/** Scroll-driven relief from the baked depth estimate. The original image and SVG remain the fallback;
    canvas landmarks use each point's sampled depth rather than translating whole lines. */
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
  colour.rgb = beam.rgb * colour.a + colour.rgb * (1.0 - beam.a);
  gl_FragColor = colour;
}`;

export interface Relief {
  /** Tilt in degrees (rotateX, rotateY), strength 0..1, and the scan beam's bottom edge (0..1 down the portrait) and opacity. */
  update(rotateX: number, rotateY: number, strength: number, scanEdge: number, scanOpacity: number): void;
  resize(): void;
  destroy(): void;
}

/** `zoom`: how far the scene scales the portrait up while the relief shows (phones), so the canvas is drawn for the size it is seen at. */
export async function mountRelief(portrait: HTMLElement, zoom: () => number = () => 1): Promise<Relief | null> {
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
          if (['leftEye', 'rightEye', 'outerLips', 'innerLips'].includes(key)) ctx.closePath();
          ctx.stroke();
          moved.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); });
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

  // The boxes stay in SVG and move by their sampled centre depths.
  const k = (el: Element | null, value: number | null) => (el as SVGElement | null)?.style.setProperty('--k', ((value ?? FOCUS) - FOCUS).toFixed(3));
  k(svg.querySelector('.cv-person'), depth.person);
  k(svg.querySelector('.cv-face'), depth.face);
  const [vw, vh] = [svg.viewBox.baseVal.width, svg.viewBox.baseVal.height];

  portrait.insertBefore(canvas, overlay);
  overlay.appendChild(marks);
  portrait.classList.add('has-relief');
  let boxRatio = 1;
  let sized = '';
  const resize = () => {
    const w = portrait.offsetWidth;
    const h = portrait.offsetHeight;
    const z = Math.max(1, zoom());
    const key = `${w}:${h}:${z.toFixed(2)}:${devicePixelRatio}`;
    if (key === sized) return;
    sized = key;
    boxRatio = w / Math.max(1, h);
    quad.size(w * z, h * z, 2);
    marks.width = canvas.width;
    marks.height = canvas.height;
    const scale = Math.min(w / width, h / height);
    canvas.style.left = `${(w - width * scale) / 2}px`;
    canvas.style.top = `${h - height * scale}px`;
    canvas.style.width = `${width * scale}px`;
    canvas.style.height = `${height * scale}px`;
  };
  resize();

  const clampSin = (degrees: number) => Math.max(-MAX_SIN, Math.min(MAX_SIN, Math.sin((degrees * Math.PI) / 180)));
  return {
    update(rotateX, rotateY, strength, scanEdge, scanOpacity) {
      if (strength <= 0) {
        if (state.strength > 0) {
          svg.style.removeProperty('--rx');
          svg.style.removeProperty('--ry');
        }
        state.strength = 0;
        show(false);
        return;
      }
      // A surface nearer than the stage plane slides by depth x sin(tilt): left when the stage
      // turns its right edge away (rotateY < 0), up when it tips its top away (rotateX > 0).
      state.sx = AMOUNT * clampSin(rotateY);
      state.sy = -AMOUNT * clampSin(rotateX) * boxRatio;
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
