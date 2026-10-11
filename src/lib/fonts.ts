/**
 * Resolves once the web fonts are in. In a build their @font-face rules wait in a gated <style>
 * until the hero portrait has loaded (fontGateScript in src/content/heroMarkup.ts), so
 * `document.fonts.ready` on its own can resolve before a single font has started loading.
 */
import { FONT_FACES_ID } from '../content/site';

export function fontsReady(): Promise<void> {
  const fonts = document.fonts;
  if (!fonts) return Promise.resolve();
  const gate = document.getElementById(FONT_FACES_ID) as HTMLStyleElement | null;
  /** Every face the page declares, loaded or failed. The local fallbacks settle at once. */
  const faces = () => {
    // rules that have just opened join the set with a style update
    void getComputedStyle(document.documentElement).fontFamily;
    return Promise.allSettled([...fonts].map((face) => face.load())).then(() => undefined);
  };
  if (!gate || gate.media !== 'not all') return faces();
  // Still shut: wait for the gate itself. The set's `loadingdone` event is no signal for it. Safari
  // never fires one, so whenever the scripts beat the portrait there (any real network) nothing
  // that waits here ran: the hero name was never split and did not scatter. Chrome fires one
  // early, for the local fallbacks.
  return new Promise((resolve) => {
    const watch = new MutationObserver(() => {
      if (gate.media === 'not all') return;
      watch.disconnect();
      resolve(faces());
    });
    watch.observe(gate, { attributes: true, attributeFilter: ['media'] });
  });
}
