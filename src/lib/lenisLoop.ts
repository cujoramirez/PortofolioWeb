/**
 * Idle-aware driver for Lenis. Lenis needs `raf(time)` every frame only while it is
 * smoothing a scroll; driving it forever keeps the page rendering while idle. This loop runs
 * from a kick (wheel, scroll keys, programmatic scrollTo) until Lenis reports it is no longer
 * smoothing, then stops.
 */
export interface LenisLike {
  isScrolling: boolean | string;
  raf(time: number): void;
}

export interface LoopDeps {
  raf(cb: FrameRequestCallback): number;
  caf(id: number): void;
}

export function createLenisLoop(lenis: LenisLike, deps: LoopDeps) {
  let id = 0;

  const frame = (time: number) => {
    id = 0;
    lenis.raf(time);
    if (lenis.isScrolling === 'smooth' || lenis.isScrolling === true) id = deps.raf(frame) || -1;
  };

  return {
    kick() {
      if (id === 0) id = deps.raf(frame) || -1;
    },
    stop() {
      if (id > 0) deps.caf(id);
      id = 0;
    },
  };
}
