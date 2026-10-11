/**
 * Safari paints 3D flattened inside a view-transition snapshot: an element keeps its own turn but
 * loses its depth, and nearer things no longer cover farther ones. Most scenes still read for the
 * length of a transition (the hero's stack only loses its parallax). The Experience corridor does
 * not: cards 900 px apart in depth were drawn full size, the dim far ones over the one in front,
 * through every theme switch and every warp. A scene whose picture depends on depth registers a
 * flat stand-in here, and the two root transitions ask for it around their snapshots.
 * Playwright's WebKit screenshots flatten the same way, which is how this is checked.
 */
type StandIn = () => () => void;
type Point = readonly [number, number];

const scenes = new Set<StandIn>();
/** Safari, and every browser on iOS. Chromium and Firefox keep depth in their snapshots. */
const paintsFlat = /Apple/.test(navigator.vendor);

/** Register a scene's stand-in: it flattens the scene and returns what puts the depth back. */
export function onSnapshot(standIn: StandIn): () => void {
  scenes.add(standIn);
  return () => scenes.delete(standIn);
}

/** Flatten every registered scene for a snapshot. Call the result when the transition ends. */
export function forSnapshot(): () => void {
  if (!paintsFlat) return () => {};
  const undo = [...scenes].map((standIn) => standIn());
  return () => undo.forEach((fn) => fn());
}

export interface FlatPart {
  el: HTMLElement;
  /** Points of the box to follow, as fractions of its width and height. The four corners if left out. */
  at?: Point[];
  /** For points on one line (a strip seen along its length): how much of its width the strip keeps. */
  cross?: number;
}

const CORNERS: Point[] = [[0, 0], [1, 0], [0, 1], [1, 1]];

/**
 * The 2D matrix that takes `from` nearest to `to`. A flat painter has no perspective, so a card
 * turned in depth, a trapezoid on screen, becomes the parallelogram closest to it: its corners
 * are a few px out, where a plain box had its far edge 12 px out and its lines of text level.
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
 * Put boxes that stand in depth where they appear on screen, with 2D transforms only. `flatten`
 * switches their 3D off (leaving `--flat` to place them) and returns what switches it back on.
 * Each followed point gets a zero-size marker for the length of this call, read once in depth
 * and once flat. On-screen places are the point here, so this reads them and not layout offsets.
 */
export function flatPoses(parts: FlatPart[], flatten: () => () => void): () => void {
  const dots = parts.map(({ el, at = CORNERS }) =>
    at.map(([x, y]) => {
      const dot = document.createElement('span');
      dot.style.cssText = `position:absolute;left:${x * 100}%;top:${y * 100}%;width:0;height:0`;
      el.append(dot);
      return dot;
    }),
  );
  const read = () => dots.map((set) => set.map((dot): Point => [dot.getBoundingClientRect().left, dot.getBoundingClientRect().top]));
  parts.forEach(({ el }) => el.style.removeProperty('--flat'));
  const seen = read();
  const restore = flatten();
  const laid = read();
  const frames = parts.map(({ el }) => {
    const box = el.getBoundingClientRect();
    const [x, y] = getComputedStyle(el).transformOrigin.split(' ').map(parseFloat);
    return [box.left + x, box.top + y];
  });
  dots.flat().forEach((dot) => dot.remove());
  parts.forEach(({ el, cross = 1 }, i) => {
    const m = fit(laid[i], seen[i], cross);
    // a box behind the viewer has no place on screen
    if (!m) return el.style.setProperty('--flat', 'scale(0)');
    // CSS applies the matrix about the element's transform origin
    const [ox, oy] = frames[i];
    const [e, f] = [m[0] * ox + m[2] * oy + m[4] - ox, m[1] * ox + m[3] * oy + m[5] - oy];
    el.style.setProperty('--flat', `matrix(${[m[0], m[1], m[2], m[3], e, f].join(', ')})`);
  });
  return () => {
    restore();
    parts.forEach(({ el }) => el.style.removeProperty('--flat'));
  };
}
