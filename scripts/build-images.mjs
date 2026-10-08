#!/usr/bin/env node
/**
 * Responsive image ladders: AVIF and WebP per width, content-hashed filenames under public/img,
 * and a manifest at src/data/images.json that components and the hero shell read.
 *
 *   hero          src/assets/GadingAdityaPerdana.png (cutout, alpha kept)  480, 720, 960, 1280
 *   about         src/assets/GadingAdityaPerdana2.jpg (About card photo)   480, 720, 900
 *   projects      src/assets/projects/*.jpg                                480, 960, 1440
 *   certificates  src/assets/certificates/*.png                            480, 960
 *
 * Files are content-addressed, so a rerun writes only new files and removes stale ones.
 * Widths larger than the source are skipped (no upscaling).
 *
 * Usage: npm run images
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import sharp from 'sharp';

const OUT = 'public/img';
const MANIFEST = 'src/data/images.json';
const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 8);
const written = new Set();

/** Encode unless the content-addressed file already exists; record it as live either way. */
async function emit(pipeline, file) {
  written.add(file);
  if (!existsSync(file)) await pipeline.toFile(file);
}

async function ladder(input, key, dir, widths, { alpha = false } = {}) {
  const buf = readFileSync(input);
  const h = hash(buf);
  const meta = await sharp(buf).rotate().metadata();
  const usable = widths.filter((w) => w <= meta.width);
  if (!usable.length) usable.push(meta.width);
  mkdirSync(join(OUT, dir), { recursive: true });
  const avif = [];
  const webp = [];
  for (const w of usable) {
    const img = sharp(buf).rotate().resize({ width: w, withoutEnlargement: true });
    const stem = `${dir ? `${dir}/` : ''}${key}-${h}-${w}`;
    await emit(img.clone().avif({ quality: alpha ? 58 : 50, effort: 6 }), join(OUT, `${stem}.avif`));
    await emit(img.clone().webp({ quality: alpha ? 80 : 75, alphaQuality: 90 }), join(OUT, `${stem}.webp`));
    avif.push(`/img/${stem}.avif`);
    webp.push(`/img/${stem}.webp`);
  }
  return { widths: usable, avif, webp, width: meta.width, height: meta.height };
}

/** Remove files under dir that this run did not produce. */
function prune(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) prune(file);
    // vision-* files belong to scripts/vision/build-vision.mjs
    else if (!written.has(file) && !name.startsWith('vision-')) rmSync(file);
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const hero = await ladder('src/assets/GadingAdityaPerdana.png', 'portrait', '', [480, 720, 960, 1280], { alpha: true });
  const about = await ladder('src/assets/GadingAdityaPerdana2.jpg', 'about', '', [480, 720, 900]);

  const projects = {};
  for (const f of readdirSync('src/assets/projects').filter((n) => /\.jpe?g$/i.test(n)).sort()) {
    const key = basename(f, extname(f));
    projects[key] = await ladder(join('src/assets/projects', f), key, 'projects', [480, 960, 1440]);
  }
  const certificates = {};
  for (const f of readdirSync('src/assets/certificates').filter((n) => /\.png$/i.test(n)).sort()) {
    const key = basename(f, extname(f));
    certificates[key] = await ladder(join('src/assets/certificates', f), key, 'certificates', [480, 960]);
  }

  prune(OUT);
  const manifest = JSON.stringify({ hero, about, projects, certificates }, null, 2) + '\n';
  if (!existsSync(MANIFEST) || readFileSync(MANIFEST, 'utf8') !== manifest) writeFileSync(MANIFEST, manifest);
  const kb = (p) => (readFileSync(`public${p}`).length / 1024).toFixed(1);
  console.log(`hero: ${hero.widths.map((w, i) => `${w}w avif ${kb(hero.avif[i])} KB / webp ${kb(hero.webp[i])} KB`).join('; ')}`);
  console.log(`projects: ${Object.keys(projects).length}, certificates: ${Object.keys(certificates).length} -> ${MANIFEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
