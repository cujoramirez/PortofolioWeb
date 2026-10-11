/**
 * The site's original "ColorBends" background, ported from three.js to raw WebGL and rendered on
 * demand: a frame is drawn only when something changes (scroll position, pointer, size, theme).
 * An idle page draws nothing. Scroll drives the bends' phase, so they flow as you move through
 * the page; the pointer bends them toward the cursor 1:1 (no easing). Reduced motion and the low
 * tier get one static frame. Rendered at half resolution: the field is smooth, so it upscales cleanly.
 */
import { currentScheme, subscribeScheme } from './theme';
import { MQ, motionAllowed } from './motion';

const COLORS = {
  dark: ['#3b82f6', '#22d3ee', '#60a5fa'],
  light: ['#2563eb', '#06b6d4', '#3b82f6'],
};

const VERT = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// The original shader (ColorBends.tsx), with the fixed settings folded in:
// rotation 90deg, scale 1.15, frequency 1, warp 1, iterations 1, intensity 1.35, band width 7.
const FRAG = `
precision mediump float;
uniform vec2 uCanvas;
uniform float uTime;
uniform vec3 uColors[3];
uniform vec2 uPointer;
varying vec2 vUv;

void main() {
  float t = uTime;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * 0.4 * 0.1;
  vec2 rp = vec2(-p.y, p.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= 1.15;
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  q += (uPointer - rp) * 0.5 * 0.2;

  vec2 s = q;
  vec3 sumCol = vec3(0.0);
  float cover = 0.0;
  for (int i = 0; i < 3; ++i) {
    s -= 0.01;
    vec2 r = sin(1.5 * s.yx + 2.0 * cos(s));
    float m0 = length(r + sin(5.0 * r.y - 3.0 * t + float(i)) / 4.0);
    vec2 warped = s + (r - s);
    float m1 = length(warped + sin(5.0 * warped.y - 3.0 * t + float(i)) / 4.0);
    float m = m1;
    float w = 1.0 - exp(-7.0 / exp(7.0 * m));
    sumCol += uColors[i] * w;
    cover = max(cover, w);
  }
  vec3 col = clamp(sumCol, 0.0, 1.0) * 1.35;
  CAP
  gl_FragColor = vec4(col * cover, cover);
}`;

// Above 1, `col * cover` is a premultiplied pixel brighter than its own alpha, which is not a
// colour: what a browser makes of one is its own business. Chrome and Safari add it as light,
// and the look was tuned on that. Firefox drew the light theme's bands yellow and red, so there
// no channel goes above the coverage (bands a shade dimmer at their edges, 16 of 255 at most).
const GECKO = typeof CSS !== 'undefined' && CSS.supports('-moz-appearance', 'none');
const FRAGMENT = FRAG.replace('CAP', GECKO ? 'col = min(col, 1.0);' : '');

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

/** Start the background in `canvas`. Returns a stop function, or null without WebGL. */
export function startBends(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uCanvas = gl.getUniformLocation(program, 'uCanvas');
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uColors = gl.getUniformLocation(program, 'uColors');
  const uPointer = gl.getUniformLocation(program, 'uPointer');

  // Whether scroll and pointer move the field. Followed while the page is open: turning reduced
  // motion on used to leave a field made under the old setting still following both.
  let live = false;
  const pointer = [0, 0];
  let frame = 0;

  const setColors = () => gl.uniform3fv(uColors, new Float32Array(COLORS[currentScheme()].flatMap(rgb)));

  const resize = () => {
    const scale = Math.min(window.devicePixelRatio || 1, 1) * 0.5;
    const w = Math.max(1, Math.round(window.innerWidth * scale));
    const h = Math.max(1, Math.round(window.innerHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uCanvas, w, h);
  };

  const draw = () => {
    frame = 0;
    // The phase follows the scroll position: about a third of a radian per viewport.
    const t = live ? 0.6 + (window.scrollY / Math.max(1, window.innerHeight)) * 0.32 : 0.6;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uPointer, pointer[0], pointer[1]);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const request = () => {
    if (!frame) frame = window.requestAnimationFrame(draw);
  };

  const onResize = () => {
    resize();
    request();
  };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer[0] = (e.clientX / window.innerWidth) * 2 - 1;
    pointer[1] = -((e.clientY / window.innerHeight) * 2 - 1);
    request();
  };
  const offScheme = subscribeScheme(() => {
    setColors();
    request();
  });

  const reduce = window.matchMedia(MQ.reduce);
  const follow = (event?: Event) => {
    const next = motionAllowed();
    if (next === live) return;
    live = next;
    if (live) {
      window.addEventListener('scroll', request, { passive: true });
      window.addEventListener('pointermove', onPointer, { passive: true });
    } else {
      window.removeEventListener('scroll', request);
      window.removeEventListener('pointermove', onPointer);
      // back to the still frame
      pointer[0] = pointer[1] = 0;
    }
    // (the first call is followed by the first draw)
    if (event) request();
  };

  setColors();
  resize();
  follow();
  draw();
  window.addEventListener('resize', onResize, { passive: true });
  reduce.addEventListener('change', follow);

  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('resize', onResize);
    window.removeEventListener('scroll', request);
    window.removeEventListener('pointermove', onPointer);
    reduce.removeEventListener('change', follow);
    canvas.removeEventListener('webglcontextlost', onLost);
    offScheme();
  }
  return stop;
}
