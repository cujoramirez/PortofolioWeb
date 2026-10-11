/**
 * One place to register GSAP plugins and global config, tuned so an idle page renders nothing:
 *  - autoSleep: the ticker stops requesting frames ~0.2 s after the last tween (scrub tweens
 *    included) finishes.
 *  - ScrollTrigger starts an empty requestAnimationFrame loop at registration that runs forever
 *    (a Firefox repaint workaround). It is kicked off exactly once, inside registerPlugin, so we
 *    swallow that one request and the loop never starts. Scrolling still renders: Lenis and the
 *    scrub tweens request their own frames while they move.
 *  - ScrollTrigger also polls every 250 ms and requests a frame to re-read the scroll position.
 *    Scroll events (native, and Lenis via ScrollTrigger.update) already cover that, so the poll
 *    is pushed out to the longest interval setInterval accepts (about 24 days).
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const raf = window.requestAnimationFrame;
window.requestAnimationFrame = () => 0;
try {
  gsap.registerPlugin(ScrollTrigger);
} finally {
  window.requestAnimationFrame = raf;
}

gsap.config({ autoSleep: 10, nullTargetWarn: false });
// dev only: lets scripts/devtools/film.mjs slow the choreography down to inspect it
if (import.meta.env.DEV) (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
ScrollTrigger.config({ ignoreMobileResize: true, syncInterval: 2 ** 31 - 1 });

// With that poll gone, ScrollTrigger's velocity samples stop at the last scroll event and go on
// reading "still moving" for seconds. Its snap waits for stillness: after a touch scroll a deck
// rested between two cards. Two more readings, each over 50 ms after the last, settle it.
let settling = 0;
window.addEventListener(
  'scroll',
  () => {
    window.clearTimeout(settling);
    settling = window.setTimeout(() => {
      ScrollTrigger.update();
      settling = window.setTimeout(() => ScrollTrigger.update(), 55);
    }, 60);
  },
  { passive: true },
);

export { gsap, ScrollTrigger };
