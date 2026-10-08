/**
 * A small WebGL 1 helper for the page's image effects (the depth reliefs, the pointer
 * displacement), in the manner of bends.ts: one full-frame triangle, a fragment shader, a few
 * textures, and drawing on demand. Nothing here owns a clock. `request()` folds any number of
 * changes into one frame, so an idle canvas draws nothing.
 */
import { DPR_CAP, readTier } from './tier';

// vUv runs from the picture's top left: an ImageBitmap uploads top row first, and WebGL's
// UNPACK_FLIP_Y_WEBGL does not apply to bitmaps.
const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = vec2(position.x * 0.5 + 0.5, 0.5 - position.y * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`;

export interface Quad {
  gl: WebGLRenderingContext;
  /** Set a float uniform of one to four components. */
  set(name: string, ...v: number[]): void;
  /** Bind a texture to a sampler uniform on a texture unit. */
  bind(name: string, unit: number, texture: WebGLTexture): void;
  /** Match the drawing buffer to a CSS size, at the device pixel ratio capped by tier and `maxRatio`. */
  size(cssWidth: number, cssHeight: number, maxRatio?: number): void;
  /** Draw once on the next frame, however often this is called before then. */
  request(): void;
  /** Draw now: for a first frame that has to be in place before the canvas shows. */
  draw(): void;
  destroy(): void;
}

interface QuadOptions {
  /** Sets this frame's uniforms; called just before each draw. */
  frame: (quad: Quad) => void;
  /** The context went away: show the plain image again. */
  onLost: () => void;
  /** The context is back with an empty program slot and no textures: upload them again, then draw. */
  onRestored: (quad: Quad) => void;
}

function program(gl: WebGLRenderingContext, frag: string): WebGLProgram | null {
  const prog = gl.createProgram();
  if (!prog) return null;
  for (const [type, src] of [[gl.VERTEX_SHADER, VERT], [gl.FRAGMENT_SHADER, frag]] as const) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;
    gl.attachShader(prog, shader);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  return prog;
}

/** A canvas that draws `frag` over its whole area. Null without WebGL or if the shader fails. */
export function createQuad(canvas: HTMLCanvasElement, frag: string, options: QuadOptions): Quad | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  let prog = program(gl, frag);
  if (!prog) return null;
  const cap = DPR_CAP[readTier()];
  let locations: Record<string, WebGLUniformLocation | null> = {};
  let frame = 0;
  let lost = false;

  const at = (name: string) => (locations[name] ??= gl.getUniformLocation(prog as WebGLProgram, name));
  const quad: Quad = {
    gl,
    set(name, ...v) {
      if (v.length === 1) gl.uniform1f(at(name), v[0]);
      else if (v.length === 2) gl.uniform2f(at(name), v[0], v[1]);
      else if (v.length === 3) gl.uniform3f(at(name), v[0], v[1], v[2]);
      else gl.uniform4f(at(name), v[0], v[1], v[2], v[3]);
    },
    bind(name, unit, texture) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(at(name), unit);
    },
    size(cssWidth, cssHeight, maxRatio = cap) {
      const ratio = Math.min(window.devicePixelRatio || 1, cap, maxRatio);
      const w = Math.max(1, Math.round(cssWidth * ratio));
      const h = Math.max(1, Math.round(cssHeight * ratio));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    request() {
      if (!frame && !lost) frame = window.requestAnimationFrame(quad.draw);
    },
    draw() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (lost) return;
      options.frame(quad);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    destroy() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    },
  };

  const onLost = (event: Event) => {
    // preventDefault is what allows the browser to restore the context later
    event.preventDefault();
    lost = true;
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    options.onLost();
  };
  const onRestored = () => {
    prog = program(gl, frag);
    locations = {};
    if (!prog) return;
    lost = false;
    options.onRestored(quad);
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);
  return quad;
}

/**
 * Fetch a picture and upload it as a texture of a known size. Decoded with createImageBitmap from
 * the bytes: an <img> that chose its file from a srcset reports a naturalWidth already divided by
 * the density it picked, so its own numbers cannot size a texture. Colour comes premultiplied.
 */
export async function loadTexture(gl: WebGLRenderingContext, url: string): Promise<{ texture: WebGLTexture; width: number; height: number } | null> {
  try {
    const blob = await (await fetch(url)).blob();
    const bitmap = await createImageBitmap(blob, { premultiplyAlpha: 'premultiply' });
    const texture = gl.createTexture();
    if (!texture) return null;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    // any size is allowed in WebGL 1 with clamping and no mipmaps
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const size = { texture, width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}
