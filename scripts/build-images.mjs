#!/usr/bin/env node
/**
 * Responsive image ladders: AVIF and WebP per width, content-hashed filenames under public/img,
 * and a manifest at src/data/images.json that components and the hero shell read.
 *
 *   hero          src/assets/GadingAdityaPerdana.png (cutout, alpha kept)  480, 720, 960, 1280
 *   about         src/assets/GadingAdityaPerdana2.jpg (About card photo)   480, 720, 900
 *   projects      src/assets/projects/*.jpg                                480, 960, 1440
 *   certificates  src/assets/certificates/*.png                            480, 960
 *   resume        public/Gading_Resume.pdf, one ladder per page            800, 1280, 2000
 *                 (macOS: rendered with PDFKit by resume-pages.swift; elsewhere the pages in
 *                 the manifest are kept as they are)
 *
 * Files are content-addressed, so a rerun writes only new files and removes stale ones.
 * Widths larger than the source are skipped (no upscaling).
 *
 * Usage: npm run images
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

async function ladder(input, key, dir, widths, { alpha = false, h: named } = {}) {
  const buf = readFileSync(input);
  const h = named ?? hash(buf);
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

const RESUME = 'public/Gading_Resume.pdf';

/**
 * The résumé's pages as images, named after the PDF's own hash: an unchanged PDF renders nothing.
 * Needs macOS (PDFKit); without it the pages already in the manifest stay.
 */
async function resumePages(previous) {
  const h = hash(readFileSync(RESUME));
  const keep = (pages) => {
    pages.forEach((page) => [...page.avif, ...page.webp].forEach((file) => written.add(join('public', file))));
    return pages;
  };
  const current = (previous ?? []).every((page) => [...page.avif, ...page.webp].every((file) => file.includes(`-${h}-`) && existsSync(join('public', file))));
  if (previous?.length && current) return keep(previous);
  const dir = mkdtempSync(join(tmpdir(), 'pf-resume-'));
  try {
    const count = Number(execFileSync('swift', ['scripts/resume-pages.swift', RESUME, dir, '2000'], { encoding: 'utf8' }).trim());
    const pages = [];
    for (let n = 1; n <= count; n++) pages.push(await ladder(join(dir, `page-${n}.png`), `resume-p${n}`, '', [800, 1280, 2000], { h }));
    return pages;
  } catch (err) {
    console.warn(`résumé pages not rendered (${String(err.message ?? err).split('\n')[0]}); keeping the ${previous?.length ?? 0} in the manifest`);
    return keep(previous ?? []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Remove files under dir that this run did not produce. */
function prune(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) prune(file);
    // vision-* and depth-* files belong to scripts/vision/build-vision.mjs (this once deleted the depth maps)
    else if (!written.has(file) && !/^(vision|depth)-/.test(name)) rmSync(file);
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

  const resume = await resumePages(existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')).resume : undefined);

  prune(OUT);
  const manifest = JSON.stringify({ hero, about, projects, certificates, resume }, null, 2) + '\n';
  if (!existsSync(MANIFEST) || readFileSync(MANIFEST, 'utf8') !== manifest) writeFileSync(MANIFEST, manifest);
  const kb = (p) => (readFileSync(`public${p}`).length / 1024).toFixed(1);
  console.log(`hero: ${hero.widths.map((w, i) => `${w}w avif ${kb(hero.avif[i])} KB / webp ${kb(hero.webp[i])} KB`).join('; ')}`);
  console.log(`résumé pages: ${resume.map((page, n) => `p${n + 1} ${page.widths.map((w, i) => `${w}w avif ${kb(page.avif[i])} KB / webp ${kb(page.webp[i])} KB`).join('; ')}`).join(' | ')}`);
  console.log(`projects: ${Object.keys(projects).length}, certificates: ${Object.keys(certificates).length} -> ${MANIFEST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
