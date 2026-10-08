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
import { SplitText } from 'gsap/SplitText';

const raf = window.requestAnimationFrame;
window.requestAnimationFrame = () => 0;
try {
  gsap.registerPlugin(ScrollTrigger, SplitText);
} finally {
  window.requestAnimationFrame = raf;
}

gsap.config({ autoSleep: 10, nullTargetWarn: false });
// dev only: lets scripts/devtools/film.mjs slow the choreography down to inspect it
if (import.meta.env.DEV) (window as unknown as { __gsap: typeof gsap }).__gsap = gsap;
ScrollTrigger.config({ ignoreMobileResize: true, syncInterval: 2 ** 31 - 1 });

export { gsap, ScrollTrigger, SplitText };
