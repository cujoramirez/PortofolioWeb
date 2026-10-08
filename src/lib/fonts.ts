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
  if (!gate || gate.media !== 'not all') return fonts.ready.then(() => undefined);
  // still shut: the next batch of loads to finish is the one the gate starts when it opens
  return new Promise((resolve) => fonts.addEventListener('loadingdone', () => resolve(), { once: true }));
}
