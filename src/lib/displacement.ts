import { gsap } from './gsap';
import { createQuad, loadTexture } from './gl';
import { motionAllowed } from './motion';

const FRAG = `
precision mediump float;
uniform sampler2D uImage;
uniform vec2 uScale;
uniform vec2 uPointer;
uniform float uStrength;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) / uScale + 0.5;
  vec2 delta = vUv - uPointer;
  float r = length(delta);
  vec2 shifted = uv + delta * exp(-r * 8.0) * sin(r * 24.0) * uStrength * 0.08;
  vec4 colour = texture2D(uImage, shifted);
  colour *= step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  gl_FragColor = colour;
}`;

/** One movable canvas serves the wall; scrolling only settles it, never redraws its position. */
export function mountDisplacement(host: HTMLElement): () => void {
  let stop: (() => void) | null = null;
  const start = (event: PointerEvent) => {
    if (!(event.target as Element).closest('button.wall__card') || !motionAllowed()) return;
    host.removeEventListener('pointermove', start);
    host.removeEventListener('pointerdown', start);
    stop = startDisplacement(host, event);
  };
  host.addEventListener('pointermove', start, { passive: true });
  host.addEventListener('pointerdown', start, { passive: true });
  return () => {
    host.removeEventListener('pointermove', start);
    host.removeEventListener('pointerdown', start);
    stop?.();
  };
}

function startDisplacement(host: HTMLElement, first: PointerEvent): () => void {
  const canvas = document.createElement('canvas');
  canvas.className = 'wall__displacement';
  canvas.setAttribute('aria-hidden', 'true');
  const state = { strength: 0, x: 0.5, y: 0.5 };
  let active: HTMLElement | null = null;
  let texture: WebGLTexture | null = null;
  let scale = [1, 1];
  let ready = false;
  let loading = false;
  let dead = false;
  let epoch = 0;
  let touch = false;
  let tween: gsap.core.Tween | null = null;
  const quad = createQuad(canvas, FRAG, {
    frame: (q) => {
      q.set('uPointer', state.x, state.y);
      q.set('uScale', ...scale);
      q.set('uStrength', state.strength);
      canvas.style.opacity = ready && state.strength > 0 ? '1' : '0';
    },
    onLost: () => { ready = false; canvas.style.opacity = '0'; tween?.kill(); },
    onRestored: () => { texture = null; active = null; },
  });
  if (!quad) return () => {};
  const settle = () => {
    if (state.strength === 0) return;
    tween?.kill();
    tween = gsap.to(state, { strength: 0, duration: 0.3, ease: 'power2.out', onUpdate: () => quad.request(), onComplete: () => { canvas.style.opacity = '0'; } });
  };
  const locate = (e: PointerEvent) => {
    const card = (e.target as Element).closest<HTMLElement>('button.wall__card');
    if (!card || !host.contains(card) || !motionAllowed()) return null;
    const img = card.querySelector<HTMLImageElement>('.wall__img');
    if (!img) return null;
    // Same raw client position as the spotlight, expressed in the image's box.
    const r = img.getBoundingClientRect();
    state.x = (e.clientX - r.left) / r.width;
    state.y = (e.clientY - r.top) / r.height;
    return { card, img };
  };
  const enter = async (e: PointerEvent) => {
    const found = locate(e);
    if (!found) return;
    const { card, img } = found;
    touch = e.pointerType === 'touch';
    if (card === active && loading) return;
    if (card !== active || !ready) {
      const token = ++epoch;
      active = card;
      loading = true;
      ready = false;
      canvas.style.opacity = '0';
      tween?.kill();
      state.strength = 0;
      const image = await loadTexture(quad.gl, img.currentSrc || img.src);
      if (!image) { if (token === epoch) loading = false; return; }
      if (dead || token !== epoch) { quad.gl.deleteTexture(image.texture); return; }
      if (texture) quad.gl.deleteTexture(texture);
      texture = image.texture;
      quad.bind('uImage', 0, texture);
      const ar = image.width / image.height;
      const box = img.clientWidth / img.clientHeight;
      scale = ar > box ? [1, box / ar] : [ar / box, 1];
      quad.size(img.clientWidth, img.clientHeight, 2);
      card.querySelector('.wall__thumb')?.appendChild(canvas);
      ready = true;
      loading = false;
    }
    tween?.kill();
    tween = gsap.to(state, { strength: 1, duration: 0.18, ease: 'power2.out', onUpdate: () => quad.request(), onComplete: () => { if (touch) settle(); } });
  };
  const move = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const found = locate(e);
    if (!found) return;
    if (found.card !== active) void enter(e);
    else if (ready) quad.request();
  };
  const out = (e: PointerEvent) => {
    if (active && (!(e.relatedTarget instanceof Node) || !active.contains(e.relatedTarget))) leave();
  };
  const leave = () => { ++epoch; loading = false; active = null; settle(); };
  const up = () => { if (touch) leave(); };
  const down = (e: PointerEvent) => { if (e.pointerType === 'touch') void enter(e); };
  host.addEventListener('pointermove', move, { passive: true });
  host.addEventListener('pointerout', out);
  host.addEventListener('pointerdown', down, { passive: true });
  window.addEventListener('pointerup', up, { passive: true });
  window.addEventListener('scroll', leave, { passive: true });
  if (first.pointerType === 'touch') void enter(first);
  else move(first);
  return () => {
    dead = true;
    ++epoch;
    tween?.kill();
    quad.destroy();
    canvas.remove();
    host.removeEventListener('pointermove', move);
    host.removeEventListener('pointerout', out);
    host.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('scroll', leave);
  };
}
