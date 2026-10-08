#!/usr/bin/env node
/**
 * Real computer-vision outputs for the hero portrait, computed on this machine with Apple's
 * Vision framework (scripts/vision/analyze.swift): face box + landmarks, upper-body person box,
 * person segmentation. The site draws them exactly as returned (confidences included).
 *
 * Writes src/data/vision.json and two alpha images in public/img: the segmentation mask and its
 * contour (content-hashed; rerun only rewrites what changed).
 *
 * Usage: node scripts/vision/build-vision.mjs   (macOS with Xcode command line tools)
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'src/assets/GadingAdityaPerdana.png';
const OUT_JSON = 'src/data/vision.json';
const MW = 600;
const MH = 800;
const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 8);
const r1 = (n) => Math.round(n * 10) / 10;

const tmp = mkdtempSync(join(tmpdir(), 'vision-'));
const input = join(tmp, 'input.jpg');
const maskPng = join(tmp, 'mask.png');
// Vision reads the cutout best on a neutral backdrop (same pixel grid as the source).
await sharp(SOURCE).flatten({ background: '#8a8f98' }).jpeg({ quality: 95 }).toFile(input);
const raw = JSON.parse(execFileSync('swift', ['scripts/vision/analyze.swift', input, maskPng], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

// Mask -> white image whose alpha is the mask; contour -> 3 px band where the mask changes.
const { data } = await sharp(maskPng).resize(MW, MH, { fit: 'fill' }).greyscale().raw().toBuffer({ resolveWithObject: true });
const mask = Buffer.alloc(MW * MH * 4, 255);
const edge = Buffer.alloc(MW * MH * 4, 255);
const on = (x, y) => data[Math.min(MH - 1, Math.max(0, y)) * MW + Math.min(MW - 1, Math.max(0, x))] > 127;
for (let y = 0; y < MH; y++) {
  for (let x = 0; x < MW; x++) {
    const i = (y * MW + x) * 4;
    mask[i + 3] = data[y * MW + x];
    const c = on(x, y);
    let boundary = false;
    for (let d = 1; d <= 1 && !boundary; d++) boundary = on(x + d, y) !== c || on(x - d, y) !== c || on(x, y + d) !== c || on(x, y - d) !== c;
    edge[i + 3] = boundary ? 255 : 0;
  }
}
const emit = async (buf, name) => {
  const webp = await sharp(buf, { raw: { width: MW, height: MH, channels: 4 } }).webp({ lossless: true }).toBuffer();
  const file = `public/img/${name}-${hash(webp)}.webp`;
  if (!existsSync(file)) writeFileSync(file, webp);
  return { file, url: file.replace(/^public/, '') };
};
const maskOut = await emit(mask, 'vision-mask');
const edgeOut = await emit(edge, 'vision-edge');
// drop superseded versions
for (const f of readdirSync('public/img')) {
  const path = `public/img/${f}`;
  if (/^vision-(mask|edge)-/.test(f) && path !== maskOut.file && path !== edgeOut.file) rmSync(path);
}

const face = raw.faces[0];
const person = raw.people[0];
const box = (b) => ({ x: r1(b.x), y: r1(b.y), w: r1(b.w), h: r1(b.h) });
const landmarks = Object.fromEntries(Object.entries(face?.landmarks ?? {}).map(([k, pts]) => [k, pts.map(([x, y]) => [r1(x), r1(y)])]));
const vision = {
  framework: raw.framework,
  source: SOURCE,
  width: raw.width,
  height: raw.height,
  face: face ? { box: box(face.box), confidence: Math.round(face.confidence * 100) / 100, landmarks } : null,
  person: person ? { box: box(person.box), confidence: Math.round(person.confidence * 100) / 100 } : null,
  mask: maskOut.url,
  edge: edgeOut.url,
};
const json = JSON.stringify(vision) + '\n';
if (!existsSync(OUT_JSON) || readFileSync(OUT_JSON, 'utf8') !== json) writeFileSync(OUT_JSON, json);
rmSync(tmp, { recursive: true, force: true });
console.log(`face ${vision.face?.confidence} person ${vision.person?.confidence} mask ${vision.mask}`);
