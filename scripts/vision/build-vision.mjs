#!/usr/bin/env node
/**
 * Real computer-vision outputs for the hero portrait, computed on this machine with Apple's
 * Vision framework (scripts/vision/analyze.swift): face box + landmarks, upper-body person box,
 * person segmentation. The site draws them exactly as returned (confidences included).
 *
 * Writes src/data/vision.json and two alpha images in public/img: the segmentation mask and its
 * contour (content-hashed; rerun only rewrites what changed).
 *
 * Depth, for the hero and About reliefs: Depth Anything V2 Small as a Core ML model
 * (scripts/vision/depth.swift), run on the same flattened portrait and on the café photo. It adds
 * two greyscale maps (near = white) and, in vision.json, the model's name, each map's raw range
 * and the depth at every landmark and at the centre of each box. The model is not in the repo:
 *   hf download apple/coreml-depth-anything-v2-small --include "DepthAnythingV2SmallF16.mlpackage/*" \
 *     --local-dir ~/Library/Caches/pf-models/coreml-depth-anything-v2-small
 * (Apache-2.0 per its model card; the Base and Large variants are non-commercial.) Without it the
 * depth block already in vision.json is kept as it is.
 *
 * Usage: node scripts/vision/build-vision.mjs   (macOS with Xcode command line tools)
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'src/assets/GadingAdityaPerdana.png';
const ABOUT_SOURCE = 'src/assets/GadingAdityaPerdana2.jpg';
const OUT_JSON = 'src/data/vision.json';
const DEPTH_MODEL = join(homedir(), 'Library/Caches/pf-models/coreml-depth-anything-v2-small/DepthAnythingV2SmallF16.mlpackage');
const BACKDROP = '8a8f98';
// Depth maps are smooth, so they ship small: one and a half times the model's own 294 x 392.
const DW = 450;
const DH = 600;
const MW = 600;
const MH = 800;
const hash = (buf) => createHash('sha1').update(buf).digest('hex').slice(0, 8);
const r1 = (n) => Math.round(n * 10) / 10;

const tmp = mkdtempSync(join(tmpdir(), 'vision-'));
const input = join(tmp, 'input.jpg');
const maskPng = join(tmp, 'mask.png');
// Vision reads the cutout best on a neutral backdrop (same pixel grid as the source).
await sharp(SOURCE).flatten({ background: `#${BACKDROP}` }).jpeg({ quality: 95 }).toFile(input);
const raw = JSON.parse(execFileSync('swift', ['scripts/vision/analyze.swift', input, maskPng], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));

// Mask -> white image whose alpha is the mask. Contour -> a soft band where a lightly blurred copy
// of the mask crosses half coverage. It has to be anti-aliased: the About reveal scales it up to
// 7x, and the hard 1 px boundary this used to be showed stair-steps from about 2.5x on a 2x display.
const resized = () => sharp(maskPng).resize(MW, MH, { fit: 'fill' }).greyscale();
const data = await resized().raw().toBuffer();
const soft = await resized().blur(1).raw().toBuffer();
const mask = Buffer.alloc(MW * MH * 4, 255);
const edge = Buffer.alloc(MW * MH * 4, 255);
for (let p = 0; p < MW * MH; p++) {
  mask[p * 4 + 3] = data[p];
  // 1 where coverage is exactly half, falling to 0 about 1.5 px either side
  const off = Math.abs(soft[p] / 255 - 0.5) / 0.42;
  edge[p * 4 + 3] = off >= 1 ? 0 : Math.round(255 * (1 - off * off));
}
const emit = async (buf, name) => {
  const webp = await sharp(buf, { raw: { width: MW, height: MH, channels: 4 } }).webp({ lossless: true }).toBuffer();
  const file = `public/img/${name}-${hash(webp)}.webp`;
  if (!existsSync(file)) writeFileSync(file, webp);
  return { file, url: file.replace(/^public/, '') };
};
const maskOut = await emit(mask, 'vision-mask');
const edgeOut = await emit(edge, 'vision-edge');

// ---- Depth ----

/** Run the model on one picture: a Float32 map at DW x DH, 0 (far) to 1 (near), and its raw range. */
async function depthOf(picture, name) {
  const out = join(tmp, `${name}.png`);
  const report = JSON.parse(execFileSync('swift', ['scripts/vision/depth.swift', DEPTH_MODEL, picture, out, BACKDROP], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }));
  // a column either side sits on the edge of the pad bars: leave it out
  const [w, h] = report.size;
  const raw = await sharp(out).extract({ left: 2, top: 0, width: w - 4, height: h }).resize(DW, DH, { fit: 'fill', kernel: 'cubic' }).toColourspace('grey16').raw({ depth: 'ushort' }).toBuffer();
  const px = new Uint16Array(raw.buffer, raw.byteOffset, DW * DH);
  return { map: Float32Array.from(px, (v) => v / 65535), range: report.range };
}
/** Box blur passes over a Float32 map: close to a Gaussian, and enough to hide the model's blocks. */
function soften(map, radius, passes = 2) {
  let src = map;
  for (let n = 0; n < passes * 2; n++) {
    const dst = new Float32Array(DW * DH);
    const horizontal = n % 2 === 0;
    for (let y = 0; y < DH; y++) {
      for (let x = 0; x < DW; x++) {
        let sum = 0;
        let count = 0;
        for (let k = -radius; k <= radius; k++) {
          const [xx, yy] = horizontal ? [x + k, y] : [x, y + k];
          if (xx < 0 || yy < 0 || xx >= DW || yy >= DH) continue;
          sum += src[yy * DW + xx];
          count++;
        }
        dst[y * DW + x] = sum / count;
      }
    }
    src = dst;
  }
  return src;
}
/** Stretch a map to 0..1 over the pixels `inside` (all of them by default). */
function normalise(map, inside) {
  let lo = Infinity;
  let hi = -Infinity;
  map.forEach((v, i) => {
    if (inside && !inside[i]) return;
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  });
  return map.map((v, i) => (inside && !inside[i] ? 0 : (v - lo) / (hi - lo)));
}
const emitDepth = async (map, name) => {
  const webp = await sharp(Buffer.from(map.map((v) => Math.round(v * 255))), { raw: { width: DW, height: DH, channels: 1 } }).webp({ quality: 88, effort: 6 }).toBuffer();
  const file = `public/img/${name}-${hash(webp)}.webp`;
  if (!existsSync(file)) writeFileSync(file, webp);
  return { file, url: file.replace(/^public/, ''), bytes: webp.length };
};

const previous = existsSync(OUT_JSON) ? JSON.parse(readFileSync(OUT_JSON, 'utf8')).depth : undefined;
let depth = previous;
let depthFiles = previous ? [`public${previous.portrait}`, `public${previous.about}`] : [];
if (existsSync(DEPTH_MODEL)) {
  const portrait = await depthOf(input, 'depth-portrait');
  const about = await depthOf(ABOUT_SOURCE, 'depth-about');

  // Portrait: only the person's depth is wanted. The backdrop is far and flat, and blurring across
  // the silhouette would smear it into the shoulders. So the person's depth is first grown outward
  // over the whole frame, then blurred, then cut to the mask grown by GROW px: the relief shader
  // shifts its lookups by up to 2 % of the width, and a lookup just outside the silhouette has to
  // move with the person, not with the backdrop.
  const GROW = 12;
  // The model's own outline of the person runs a few px inside Vision's in places, so depth right
  // at the mask's edge can already be the backdrop's. Trust only the mask pulled in by CORE px, and
  // grow from there (left in, those edge values spread outward as dark streaks).
  const CORE = 5;
  const person = await sharp(maskPng).resize(DW, DH, { fit: 'fill' }).greyscale().raw().toBuffer();
  let known = Uint8Array.from(person, (v) => (v > 127 ? 1 : 0));
  for (let n = 0; n < CORE; n++) {
    const inner = new Uint8Array(DW * DH);
    for (let y = 1; y < DH - 1; y++) {
      for (let x = 1; x < DW - 1; x++) {
        const i = y * DW + x;
        inner[i] = known[i] & known[i - 1] & known[i + 1] & known[i - DW] & known[i + DW];
      }
    }
    // the person runs off the bottom of the frame: that edge is not a silhouette
    for (let x = 1; x < DW - 1; x++) inner[(DH - 1) * DW + x] = known[(DH - 1) * DW + x] & known[(DH - 2) * DW + x];
    known = inner;
  }
  const grown = Float32Array.from(portrait.map);
  const reach = new Uint16Array(DW * DH); // how many px outside the trusted core a pixel was filled at
  for (let step = 1, pending = true; pending; step++) {
    pending = false;
    const add = [];
    for (let y = 0; y < DH; y++) {
      for (let x = 0; x < DW; x++) {
        const i = y * DW + x;
        if (known[i]) continue;
        let sum = 0;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const [xx, yy] = [x + dx, y + dy];
            if (xx < 0 || yy < 0 || xx >= DW || yy >= DH || !known[yy * DW + xx]) continue;
            sum += grown[yy * DW + xx];
            count++;
          }
        }
        if (count) add.push([i, sum / count]);
        else pending = true;
      }
    }
    for (const [i, v] of add) {
      grown[i] = v;
      known[i] = 1;
      reach[i] = step;
    }
    if (!add.length) break;
  }
  const kept = Uint8Array.from(reach, (r) => (r <= CORE + GROW ? 1 : 0));
  const portraitMap = normalise(soften(grown, 2), kept);
  const aboutMap = normalise(soften(about.map, 2));

  const portraitOut = await emitDepth(portraitMap, 'depth-portrait');
  const aboutOut = await emitDepth(aboutMap, 'depth-about');
  depthFiles = [portraitOut.file, aboutOut.file];

  // depth under a point given in source-image pixels, bilinear, 0..1
  const at = (x, y) => {
    const fx = Math.min(DW - 1.001, Math.max(0, (x / raw.width) * DW - 0.5));
    const fy = Math.min(DH - 1.001, Math.max(0, (y / raw.height) * DH - 0.5));
    const [x0, y0] = [Math.floor(fx), Math.floor(fy)];
    const [tx, ty] = [fx - x0, fy - y0];
    const v = (xx, yy) => portraitMap[yy * DW + xx];
    return Math.round(((v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx) * (1 - ty) + (v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx) * ty) * 1000) / 1000;
  };
  const centre = (b) => at(b.x + b.w / 2, b.y + b.h / 2);
  const face0 = raw.faces[0];
  const person0 = raw.people[0];
  depth = {
    model: 'Depth Anything V2 Small (Core ML)',
    source: 'apple/coreml-depth-anything-v2-small, DepthAnythingV2SmallF16, Apache-2.0',
    portrait: portraitOut.url,
    about: aboutOut.url,
    size: [DW, DH],
    // the model's own output values at each map's 0 and 1
    range: { portrait: portrait.range, about: about.range },
    face: face0 ? centre(face0.box) : null,
    person: person0 ? centre(person0.box) : null,
    landmarks: Object.fromEntries(Object.entries(face0?.landmarks ?? {}).map(([k, pts]) => [k, pts.map(([x, y]) => at(x, y))])),
  };
  console.log(`depth portrait ${portraitOut.bytes} B, about ${aboutOut.bytes} B, face ${depth.face}, person ${depth.person}`);
} else {
  console.log(`depth model not found at ${DEPTH_MODEL}: keeping the depth block already in ${OUT_JSON}`);
}

// drop superseded versions
for (const f of readdirSync('public/img')) {
  const path = `public/img/${f}`;
  if (/^vision-(mask|edge)-/.test(f) && path !== maskOut.file && path !== edgeOut.file) rmSync(path);
  if (/^depth-(portrait|about)-/.test(f) && !depthFiles.includes(path)) rmSync(path);
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
  ...(depth ? { depth } : {}),
};
const json = JSON.stringify(vision) + '\n';
if (!existsSync(OUT_JSON) || readFileSync(OUT_JSON, 'utf8') !== json) writeFileSync(OUT_JSON, json);
rmSync(tmp, { recursive: true, force: true });
console.log(`face ${vision.face?.confidence} person ${vision.person?.confidence} mask ${vision.mask}`);
