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

/**
 * Put boxes that stand in depth where they appear on screen, with 2D transforms only. `flatten`
 * switches their 3D off (leaving `--flat` to place them) and returns what switches it back on.
 * On-screen boxes are the point here, so this reads them and not layout offsets.
 */
export function flatPoses(boxes: HTMLElement[], flatten: () => () => void): () => void {
  const seen = boxes.map((el) => el.getBoundingClientRect());
  boxes.forEach((el) => el.style.removeProperty('--flat'));
  const restore = flatten();
  const laid = boxes.map((el) => el.getBoundingClientRect());
  boxes.forEach((el, i) => {
    const a = seen[i];
    const b = laid[i];
    const pose = [a.left + a.width / 2 - (b.left + b.width / 2), a.top + a.height / 2 - (b.top + b.height / 2), a.width / b.width, a.height / b.height];
    // a box behind the viewer has no place on screen; the scene has hidden it already
    if (pose.every(Number.isFinite)) el.style.setProperty('--flat', `translate(${pose[0]}px, ${pose[1]}px) scale(${pose[2]}, ${pose[3]})`);
  });
  return () => {
    restore();
    boxes.forEach((el) => el.style.removeProperty('--flat'));
  };
}
