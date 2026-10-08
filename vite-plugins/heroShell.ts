/**
 * Renders the static hero shell into index.html (dev and build):
 *  - the hero markup from src/content/heroMarkup.ts with the portrait ladder from
 *    src/data/images.json and the Apple Vision outputs from src/data/vision.json;
 *  - a pre-paint script that sets [data-theme], so there is no flash of the wrong theme;
 *  - an AVIF preload for the LCP image;
 *  - at build, the entry CSS inlined into <style> (no render-blocking stylesheet request).
 */
import type { Plugin } from 'vite';
import { HERO_SIZES, heroMarkup, themeInitScript, type VisionData } from '../src/content/heroMarkup';
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
        let out = html.replace('<!--hero-shell-->', heroMarkup(hero, vision as VisionData));

        const avifSet = hero.avif.map((f, i) => `${f} ${hero.widths[i]}w`).join(', ');
        const preload = `<link rel="preload" as="image" type="image/avif" imagesrcset="${avifSet}" imagesizes="${HERO_SIZES}" fetchpriority="high">`;
        out = out.replace(/<meta charset="UTF-8" \/>/, (m) => `${m}\n    <script>${themeInitScript()}</script>`);
        out = out.replace('</head>', `    ${preload}\n</head>`);

        // Build: inline the entry stylesheet(s) Vite linked, and drop them from the output.
        const bundle = ctx.bundle;
        if (bundle) {
          out = out.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (tag, file: string) => {
            const asset = bundle[file];
            if (!asset || asset.type !== 'asset') return tag;
            delete bundle[file];
            return `<style>${String(asset.source)}</style>`;
          });
        }
        return out;
      },
    },
  };
}
