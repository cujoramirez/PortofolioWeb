/**
 * Drawing a 3D scene's pieces flat, for the stand-ins of lib/flat.ts. Kept apart from that file,
 * which the theme switch loads with the page: this goes with the scenes that register one.
 */
type Point = readonly [number, number];

export interface FlatPart {
  el: HTMLElement;
  /** Points of the box to follow, as fractions of its width and height. The four corners if left out. */
  at?: Point[];
  /** For points on one line (a strip seen along its length): how much of its width the strip keeps. */
  cross?: number;
  /** A box that may be turned in depth: how many upright slices to draw it in when it is. */
  slices?: number;
}

const CORNERS: Point[] = [[0, 0], [1, 0], [0, 1], [1, 1]];
/** Top and bottom of every slice edge, left to right. */
const edges = (slices: number): Point[] => Array.from({ length: slices + 1 }, (_, k): Point[] => [[k / slices, 0], [k / slices, 1]]).flat();
/** How far from its real place a corner may sit before a box is worth slicing, in px. */
const CLOSE = 0.5;

/**
 * The 2D matrix that takes `from` nearest to `to`. A flat painter has no perspective, not even
 * one written into an element's own matrix (tried in WebKit: `perspective()` and `matrix3d` both
 * come out as a shear). So a card turned in depth, a trapezoid on screen, can only become the
 * parallelogram closest to it, with its corners a few px out and its text half as slanted. The
 * owner saw that settle as each transition ended ("the cards behind were flat instead of
 * tilted"). Such a card is drawn in slices instead (see flatPoses): over an eighth of its width
 * the nearest parallelogram is within half a px.
 */
function fit(from: Point[], to: Point[], cross: number): number[] | null {
  if (![...from, ...to].every(([x, y]) => Math.abs(x) < 1e5 && Math.abs(y) < 1e5)) return null;
  const n = from.length;
  const mean = (points: Point[], k: 0 | 1) => points.reduce((sum, p) => sum + p[k], 0) / n;
  const [fx, fy, tx, ty] = [mean(from, 0), mean(from, 1), mean(to, 0), mean(to, 1)];
  let xx = 0, xy = 0, yy = 0, xu = 0, yu = 0, xv = 0, yv = 0;
  from.forEach(([x, y], i) => {
    const [dx, dy, du, dv] = [x - fx, y - fy, to[i][0] - tx, to[i][1] - ty];
    xx += dx * dx; xy += dx * dy; yy += dy * dy;
    xu += dx * du; yu += dy * du; xv += dx * dv; yv += dy * dv;
  });
  const det = xx * yy - xy * xy;
  let a: number, b: number, c: number, d: number;
  if (Math.abs(det) > 1e-9 * (xx + yy) ** 2) {
    a = (xu * yy - yu * xy) / det;
    c = (yu * xx - xu * xy) / det;
    b = (xv * yy - yv * xy) / det;
    d = (yv * xx - xv * xy) / det;
  } else {
    // points on one line: the line goes onto its picture, and across it the box keeps `cross`
    const [px, py] = [from[n - 1][0] - from[0][0], from[n - 1][1] - from[0][1]];
    const [qx, qy] = [to[n - 1][0] - to[0][0], to[n - 1][1] - to[0][1]];
    const [length, reach] = [Math.hypot(px, py), Math.hypot(qx, qy)];
    if (!length || !reach) return null;
    const [ux, uy, wx, wy] = [px / length, py / length, qx / reach, qy / reach];
    a = (qx / length) * ux + cross * wy * uy;
    c = (qx / length) * uy - cross * wy * ux;
    b = (qy / length) * ux - cross * wx * uy;
    d = (qy / length) * uy + cross * wx * ux;
  }
  return [a, b, c, d, tx - (a * fx + c * fy), ty - (b * fx + d * fy)];
}

/**
 * Draw boxes that stand in depth where they appear on screen, with 2D transforms only. The boxes
 * themselves are not touched: copies of them go into a flat layer inside `host` (an element that
 * is not itself turned in depth), each placed by a matrix, and `hide` takes the real ones out of
 * sight and returns what brings them back. Each followed point gets a zero-size marker while
 * this reads where it is. On-screen places are the point here, so this reads them and not
 * layout offsets. A turned box that one matrix cannot place is drawn as copies clipped to
 * upright slices, each placed on its own.
 *
 * The first version flattened the real boxes instead (their transforms overridden for the length
 * of the transition). Safari 27 did not survive that after a warp: the page was back in depth,
 * every style and every measured box was right, and the corridor was drawn without perspective
 * until the next scroll changed a transform. The layers had first been made while the scene was
 * flat. So the real scene keeps its depth throughout and is only hidden.
 */
export function flatPoses(parts: FlatPart[], host: HTMLElement, hide: () => () => void): () => void {
  const shown = parts.filter(({ el }) => getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).opacity !== '0');
  const points = shown.map(({ at, slices }) => (slices ? edges(slices) : (at ?? CORNERS)));
  const dots = shown.map(({ el }, i) =>
    points[i].map(([x, y]) => {
      const dot = document.createElement('span');
      dot.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;width:0;height:0`;
      el.append(dot);
      return dot;
    }),
  );
  const seen = dots.map((set) => set.map((dot): Point => [dot.getBoundingClientRect().left, dot.getBoundingClientRect().top]));
  dots.flat().forEach((dot) => dot.remove());
  const layer = document.createElement('div');
  layer.className = 'flat-standin';
  layer.setAttribute('aria-hidden', 'true');
  host.append(layer);
  const origin = layer.getBoundingClientRect();
  shown.forEach(({ el, cross = 1, slices = 0 }, i) => {
    // the markers sat in the padding box; a copy's own box starts at its border
    const from = points[i].map(([x, y]): Point => [el.clientLeft + x * el.clientWidth, el.clientTop + y * el.clientHeight]);
    const to = seen[i].map(([x, y]): Point => [x - origin.left, y - origin.top]);
    const draw = (m: number[], clip = '') => {
      const copy = el.cloneNode(true) as HTMLElement;
      copy.style.width = `${el.offsetWidth}px`;
      copy.style.height = `${el.offsetHeight}px`;
      copy.style.setProperty('--flat', `matrix(${m.join(', ')})`);
      if (clip) copy.style.clipPath = clip;
      layer.append(copy);
      return copy;
    };
    const outer = slices ? [0, 1, from.length - 2, from.length - 1] : from.map((_, k) => k);
    const m = fit(outer.map((k) => from[k]), outer.map((k) => to[k]), cross);
    // a box behind the viewer has no place on screen
    if (!m) return;
    const off = Math.max(...outer.map((k) => Math.hypot(m[0] * from[k][0] + m[2] * from[k][1] + m[4] - to[k][0], m[1] * from[k][0] + m[3] * from[k][1] + m[5] - to[k][1])));
    // one matrix is enough for a box that faces the viewer
    if (!slices || off < CLOSE) return void draw(m);
    // The box's shadow is drawn once, by an empty copy under the slices placed as the whole box
    // (a soft shadow does not show a few px). A slice that kept its own shadow left a dark
    // hairline along its edge, over the slice beside it.
    const shade = draw(m);
    shade.replaceChildren();
    shade.style.background = 'none';
    shade.style.borderColor = 'transparent';
    for (let k = 0; k < slices; k++) {
      const own = fit(from.slice(2 * k, 2 * k + 4), to.slice(2 * k, 2 * k + 4), cross);
      if (!own) continue;
      // a slice runs 2 px under the next one: two edges that only met let the page show through
      const left = k ? `${from[2 * k][0]}px` : '0';
      const right = k < slices - 1 ? `calc(100% - ${from[2 * k + 2][0] + 2}px)` : '0';
      draw(own, `inset(0 ${right} 0 ${left})`).style.boxShadow = 'none';
    }
  });
  const show = hide();
  return () => {
    show();
    layer.remove();
  };
}
