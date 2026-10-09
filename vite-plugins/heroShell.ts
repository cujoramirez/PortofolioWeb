/**
 * Renders the static hero shell into index.html (dev and build):
 *  - the hero markup from src/content/heroMarkup.ts with the portrait ladder from
 *    src/data/images.json and the Apple Vision outputs from src/data/vision.json;
 *  - a pre-paint script that sets [data-theme], so there is no flash of the wrong theme;
 *  - an AVIF preload for the LCP image;
 *  - a <noscript> block after #root with the rest of the page as plain text (noscriptMarkup);
 *  - at build, the entry CSS inlined into <style> (no render-blocking stylesheet request), with
 *    the web fonts' @font-face rules in a second <style> that waits for the LCP image.
 */
import type { Plugin } from 'vite';
import { HERO_SIZES, fontGateScript, heroMarkup, themeInitScript, type VisionData } from '../src/content/heroMarkup';
import { FONT_FACES_ID } from '../src/content/site';
import { heroIndex } from '../src/content/heroIndex';
import { noscriptMarkup } from '../src/content/noscriptMarkup';
import images from '../src/data/images.json';
import vision from '../src/data/vision.json';

export default function heroShell(): Plugin {
  return {
    name: 'hero-shell',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const hero = images.hero;
        if (!html.includes('<!--hero-shell-->')) throw new Error('index.html is missing the <!--hero-shell--> slot');
        let out = html.replace('<!--hero-shell-->', () => heroMarkup(hero, vision as VisionData, heroIndex()));
        if (!out.includes('<div id="root"></div>')) throw new Error('index.html is missing <div id="root"></div>');
        // a function, so a "$" in the copy is never read as a replacement pattern
        out = out.replace('<div id="root"></div>', (root) => `${root}\n        ${noscriptMarkup()}`);

        const avifSet = hero.avif.map((f, i) => `${f} ${hero.widths[i]}w`).join(', ');
        const preload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${avifSet}" imagesizes="${HERO_SIZES}" fetchpriority="high">`;
        out = out.replace(/<meta charset="UTF-8" \/>/, (m) => `${m}\n    <script>${themeInitScript()}</script>`);
        out = out.replace('</head>', `    ${preload}\n</head>`);

        // Lazy chunks can preload entry CSS too; an empty asset keeps those references valid.
        const bundle = ctx.bundle;
        if (bundle) {
          out = out.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (tag, file: string) => {
            const asset = bundle[file];
            if (!asset || asset.type !== 'asset') return tag;
            const css = String(asset.source);
            asset.source = '';
            return `<style>${css}</style>`;
          });
          // The web fonts' @font-face rules (the ones with a file, not the local() fallbacks) move
          // into their own <style>, which fontGateScript keeps shut until the portrait has loaded.
          const faces: string[] = [];
          out = out.replace(/@font-face\{[^}]*\}/g, (rule) => {
            if (!rule.includes('.woff2')) return rule;
            faces.push(rule);
            return '';
          });
          if (faces.length) {
            out = out.replace('</head>', () => `    <style id="${FONT_FACES_ID}">${faces.join('')}</style><script>${fontGateScript()}</script>\n</head>`);
          }
        }
        return out;
      },
    },
  };
}
