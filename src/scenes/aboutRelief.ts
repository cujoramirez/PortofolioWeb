import { depth } from '../data/vision.json';
import { createQuad, loadTexture } from '../lib/gl';

const FRAG = `
precision mediump float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec4 uFit;
uniform vec2 uShift;
varying vec2 vUv;
void main() {
  vec2 uv = uFit.xy + vUv * uFit.zw;
  vec2 src = uv;
  for (int i = 0; i < 4; i++) src = uv - uShift * (texture2D(uDepth, src).r - 0.5);
  gl_FragColor = texture2D(uImage, src);
}`;

export interface AboutRelief {
  update(angle: number, visible: boolean): void;
  resize(): void;
  destroy(): void;
}

/** The photo and canvas share object-fit: cover and the same 55% / 35% crop. */
export async function mountAboutRelief(counter: HTMLElement): Promise<AboutRelief | null> {
  const img = counter.querySelector<HTMLImageElement>('.about__img');
  if (!img) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'about__relief';
  canvas.setAttribute('aria-hidden', 'true');
  let visible = false;
  let ready = false;
  let dead = false;
  let angle = 0;
  let imageRatio = 0.75;
  let fit = [0, 0, 1, 1];
  const hide = () => { canvas.style.opacity = '0'; };
  const quad = createQuad(canvas, FRAG, {
    frame: (q) => {
      q.set('uFit', ...fit);
      q.set('uShift', Math.max(-0.04, Math.min(0.04, Math.sin(angle * Math.PI / 180) * 0.16)), 0);
      canvas.style.opacity = visible && ready ? '1' : '0';
    },
    onLost: () => { ready = false; hide(); },
    onRestored: () => { void load().then((ok) => { if (ok && !dead && visible) quad?.request(); }); },
  });
  if (!quad) return null;
  const load = async () => {
    const [image, map] = await Promise.all([loadTexture(quad.gl, img.currentSrc || img.src), loadTexture(quad.gl, depth.about)]);
    if (!image || !map || dead) return false;
    imageRatio = image.width / image.height;
    quad.bind('uImage', 0, image.texture);
    quad.bind('uDepth', 1, map.texture);
    ready = true;
    return true;
  };
  if (!(await load())) { quad.destroy(); return null; }
  counter.appendChild(canvas);
  const resize = () => {
    const w = counter.offsetWidth;
    const h = counter.offsetHeight;
    const ih = Math.max(h, w / imageRatio);
    const iw = ih * imageRatio;
    fit = [(iw - w) * 0.55 / iw, (ih - h) * 0.35 / ih, w / iw, h / ih];
    quad.size(w, h, 2);
  };
  resize();
  return {
    update(turn, on) {
      angle = turn;
      visible = on && Math.abs(turn) < 65 && Math.abs(turn) > 0.05;
      if (ready && visible) quad.request();
      else hide();
    },
    resize,
    destroy() { dead = true; quad.destroy(); canvas.remove(); },
  };
}
