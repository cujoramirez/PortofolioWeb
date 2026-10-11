/**
 * Safari paints 3D flattened inside a view-transition snapshot: an element keeps its own turn but
 * loses its depth, and nearer things no longer cover farther ones. Most scenes still read for the
 * length of a transition (the hero's stack only loses its parallax). The Experience corridor does
 * not: cards 900 px apart in depth were drawn full size, the dim far ones over the one in front,
 * through every theme switch and every warp. A scene whose picture depends on depth registers a
 * flat stand-in here (drawn by lib/flatPoses.ts), and the two root transitions ask for it around
 * their snapshots. Playwright's WebKit screenshots flatten the same way, which is how the picture
 * is checked; what Safari does to the real scene afterwards only real Safari shows.
 */
type StandIn = () => () => void;

const scenes = new Set<StandIn>();
/** Safari, and every browser on iOS. Chromium and Firefox keep depth in their snapshots. */
const paintsFlat = /Apple/.test(navigator.vendor);

/** Register a scene's stand-in: it puts a flat picture of the scene up and returns what takes it down. */
export function onSnapshot(standIn: StandIn): () => void {
  scenes.add(standIn);
  return () => scenes.delete(standIn);
}

/** Put every registered scene's stand-in up for a snapshot. Call the result when the transition ends. */
export function forSnapshot(): () => void {
  if (!paintsFlat) return () => {};
  const undo = [...scenes].map((standIn) => standIn());
  return () => undo.forEach((fn) => fn());
}
