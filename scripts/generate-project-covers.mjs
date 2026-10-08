#!/usr/bin/env node
/**
 * Schematic cover illustrations for projects that have no screenshot (the original code and
 * captures were lost). Each is a domain motif drawn in the site's visual language: dark plate,
 * dot grid, ink line work, one accent. They are illustrations, not screenshots: no invented
 * numbers, labels or model outputs. Output: src/assets/projects/cover-*.jpg (1600x1000), then
 * `npm run images` builds the AVIF/WebP ladders.
 *
 * Usage: node scripts/generate-project-covers.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const W = 1600;
const H = 1000;
const INK = '#f2f4f7';
const INK2 = 'rgba(242,244,247,0.62)';
const INK3 = 'rgba(242,244,247,0.34)';
const LINE = 'rgba(242,244,247,0.16)';
const ACCENT = '#3b82f6';
const PANEL = '#1b1d22';
const MONO = 'Menlo, SFMono-Regular, monospace';

/** Deterministic pseudo-random numbers, so reruns produce identical files. */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const dots = () => {
  let out = '';
  for (let y = 44; y < H - 30; y += 28) for (let x = 44; x < W - 30; x += 28) out += `<circle cx="${x}" cy="${y}" r="1.4" fill="rgba(242,244,247,0.07)"/>`;
  return out;
};

const frame = (body) => `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<rect width="${W}" height="${H}" fill="#0a0b0d"/>
<rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="36" fill="#141518" stroke="${LINE}" stroke-width="2"/>
${dots()}
${body}
</svg>`;

const label = (x, y, text, anchor = 'start', fill = INK2) =>
  `<text x="${x}" y="${y}" font-family="${MONO}" font-size="22" letter-spacing="3" fill="${fill}" text-anchor="${anchor}">${text}</text>`;

const panel = (x, y, w, h, r = 28) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${PANEL}" stroke="${LINE}" stroke-width="2"/>`;
const bar = (x, y, w, h = 14, fill = INK3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`;

function wave(x, y, w, amp, seed, { step = 12, fill = INK2, gate } = {}) {
  const r = rng(seed);
  let out = '';
  for (let i = 0, px = x; px < x + w; i++, px += step) {
    const env = 0.35 + 0.65 * Math.abs(Math.sin(i / 9)) * (0.6 + 0.4 * r());
    const on = gate ? gate(i) : 1;
    const h = Math.max(4, amp * env * on);
    out += `<rect x="${px}" y="${(y - h / 2).toFixed(1)}" width="${step - 5}" height="${h.toFixed(1)}" rx="3" fill="${fill}"/>`;
  }
  return out;
}

/* ---------- Aria: one mix splits into vocal and instrumental lanes ---------- */
function aria() {
  const x0 = 520;
  const lanes = [
    { y: 250, name: 'MIX', seed: 7, fill: INK2 },
    { y: 520, name: 'VOCALS', seed: 11, fill: ACCENT, gate: (i) => (Math.sin(i / 5) > -0.2 ? 1 : 0.15) },
    { y: 760, name: 'INSTRUMENTAL', seed: 19, fill: INK2 },
  ];
  let body = '';
  // cover art plate: concentric grooves
  body += panel(110, 170, 330, 330, 30);
  for (let r = 40; r <= 140; r += 20) body += `<circle cx="275" cy="335" r="${r}" fill="none" stroke="${LINE}" stroke-width="2"/>`;
  body += `<circle cx="275" cy="335" r="22" fill="${ACCENT}"/>`;
  // transport
  body += `<circle cx="195" cy="640" r="34" fill="none" stroke="${INK3}" stroke-width="3"/><circle cx="275" cy="640" r="46" fill="${INK}"/><path d="M262 616 L296 640 L262 664 Z" fill="#16191e"/><circle cx="355" cy="640" r="34" fill="none" stroke="${INK3}" stroke-width="3"/>`;
  body += bar(110, 740, 330, 10, INK3) + bar(110, 740, 150, 10, INK2);
  for (const lane of lanes) {
    body += label(x0, lane.y - 80, lane.name);
    body += wave(x0, lane.y, 960, lane.name === 'MIX' ? 120 : 90, lane.seed, { fill: lane.fill, gate: lane.gate });
  }
  // the split
  body += `<path d="M1000 330 C 1000 400, 900 400, 900 440" fill="none" stroke="${INK3}" stroke-width="3" stroke-dasharray="8 10"/>`;
  body += `<path d="M1040 330 C 1040 560, 1140 600, 1140 680" fill="none" stroke="${INK3}" stroke-width="3" stroke-dasharray="8 10"/>`;
  // playhead
  body += `<rect x="1180" y="150" width="4" height="700" fill="${ACCENT}"/><circle cx="1182" cy="150" r="10" fill="${ACCENT}"/>`;
  return frame(body);
}

/* ---------- CS Learning Platform: a quiz card and three roles ---------- */
function csLearning() {
  let body = '';
  // sidebar
  body += panel(90, 110, 300, 780);
  for (let i = 0; i < 7; i++) body += bar(130, 180 + i * 70, i === 2 ? 200 : 150 + ((i * 37) % 70), 16, i === 2 ? INK : INK3);
  body += `<rect x="110" y="310" width="4" height="56" rx="2" fill="${ACCENT}"/>`;
  // role tabs
  const roles = ['ADMINISTRATOR', 'LECTURER', 'STUDENT'];
  roles.forEach((r, i) => {
    const x = 450 + i * 330;
    const active = i === 1;
    body += `<rect x="${x}" y="110" width="300" height="72" rx="36" fill="${active ? 'rgba(59,130,246,0.14)' : 'none'}" stroke="${active ? ACCENT : LINE}" stroke-width="2"/>`;
    body += label(x + 150, 154, r, 'middle', active ? ACCENT : INK2);
  });
  // quiz card
  body += panel(450, 230, 960, 660);
  body += label(500, 300, 'QUIZ BUILDER', 'start', INK3);
  body += bar(500, 340, 700, 22, INK) + bar(500, 380, 520, 22, INK2);
  for (let i = 0; i < 4; i++) {
    const y = 460 + i * 96;
    const chosen = i === 1;
    body += `<rect x="500" y="${y}" width="860" height="72" rx="18" fill="${chosen ? 'rgba(59,130,246,0.1)' : 'none'}" stroke="${chosen ? ACCENT : LINE}" stroke-width="2"/>`;
    body += `<circle cx="540" cy="${y + 36}" r="14" fill="none" stroke="${chosen ? ACCENT : INK3}" stroke-width="3"/>`;
    if (chosen) body += `<circle cx="540" cy="${y + 36}" r="7" fill="${ACCENT}"/>`;
    body += bar(580, y + 29, 260 + ((i * 97) % 240), 14, chosen ? INK : INK3);
  }
  return frame(body);
}

/* ---------- EchoVision: a viewfinder that routes an item to one of 12 bins ---------- */
function echoVision() {
  let body = '';
  const [fx, fy, fw, fh] = [110, 150, 640, 700];
  // viewfinder corners
  const c = 70;
  for (const [x, y, dx, dy] of [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]]) {
    body += `<path d="M${x} ${y + dy * c} L${x} ${y} L${x + dx * c} ${y}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  // a bottle, drawn as line work
  body += `<path d="M395 290 h50 v70 c0 30 60 50 60 110 v280 c0 22 -18 40 -40 40 h-90 c-22 0 -40 -18 -40 -40 v-280 c0 -60 60 -80 60 -110 z" fill="none" stroke="${INK2}" stroke-width="5" stroke-linejoin="round"/>`;
  body += `<rect x="385" y="262" width="70" height="30" rx="8" fill="none" stroke="${INK2}" stroke-width="5"/>`;
  body += `<path d="M335 560 h170" stroke="${INK3}" stroke-width="4"/><path d="M335 620 h170" stroke="${INK3}" stroke-width="4"/>`;
  body += label(fx, fy + fh + 60, 'CAMERA', 'start', INK3);
  // 12 bins
  const bx = 900;
  const by = 190;
  const hit = 6;
  for (let i = 0; i < 12; i++) {
    const x = bx + (i % 4) * 150;
    const y = by + Math.floor(i / 4) * 200;
    const on = i === hit;
    body += `<rect x="${x}" y="${y + 30}" width="112" height="130" rx="18" fill="${on ? 'rgba(59,130,246,0.14)' : PANEL}" stroke="${on ? ACCENT : LINE}" stroke-width="3"/>`;
    body += `<rect x="${x - 8}" y="${y}" width="128" height="26" rx="8" fill="${on ? ACCENT : 'rgba(242,244,247,0.18)'}"/>`;
  }
  body += label(bx, 850, '12 CATEGORIES', 'start', INK3);
  // route from the frame to the chosen bin
  const tx = bx + (hit % 4) * 150;
  const ty = by + Math.floor(hit / 4) * 200 + 95;
  body += `<path d="M${fx + fw + 20} 500 C 830 500, 830 ${ty}, ${tx - 16} ${ty}" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-dasharray="10 10"/>`;
  body += `<circle cx="${tx - 16}" cy="${ty}" r="8" fill="${ACCENT}"/>`;
  return frame(body);
}

/* ---------- Factory Bearing Monitoring: bearing, vibration trace, factory outline ---------- */
function bearing() {
  let body = '';
  const [cx, cy] = [360, 430];
  body += `<circle cx="${cx}" cy="${cy}" r="230" fill="${PANEL}" stroke="${INK2}" stroke-width="5"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="190" fill="none" stroke="${LINE}" stroke-width="3"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="110" fill="none" stroke="${LINE}" stroke-width="3"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="72" fill="#16191e" stroke="${INK2}" stroke-width="5"/>`;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    body += `<circle cx="${(cx + Math.cos(a) * 150).toFixed(1)}" cy="${(cy + Math.sin(a) * 150).toFixed(1)}" r="30" fill="${i === 2 ? ACCENT : 'rgba(242,244,247,0.2)'}" stroke="${i === 2 ? ACCENT : INK2}" stroke-width="3"/>`;
  }
  // vibration trace
  const [px, py, pw, ph] = [720, 180, 780, 420];
  body += panel(px, py, pw, ph);
  body += label(px + 36, py + 56, 'VIBRATION', 'start', INK3);
  for (let i = 1; i < 4; i++) body += `<path d="M${px + 30} ${py + (ph / 4) * i} h${pw - 60}" stroke="${LINE}" stroke-width="2"/>`;
  const r = rng(5);
  let d = '';
  for (let i = 0; i <= 150; i++) {
    const x = px + 40 + (i / 150) * (pw - 80);
    const burst = i > 96 && i < 118 ? 2.6 : 1;
    const y = py + ph / 2 + Math.sin(i * 0.7) * 34 * burst + (r() - 0.5) * 26 * burst;
    d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `;
  }
  body += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
  body += `<rect x="${px + 40 + (96 / 150) * (pw - 80)}" y="${py + 80}" width="${(22 / 150) * (pw - 80)}" height="${ph - 110}" rx="10" fill="rgba(59,130,246,0.14)" stroke="${ACCENT}" stroke-width="2" stroke-dasharray="8 8"/>`;
  // factory outline
  const fy = 860;
  body += `<path d="M720 ${fy} V720 l120 -60 v60 l120 -60 v60 l120 -60 v60 h90 V600 h50 v120 h70 V640 h50 v80 h80 V${fy} Z" fill="none" stroke="${INK2}" stroke-width="4" stroke-linejoin="round"/>`;
  body += `<path d="M700 ${fy} H1520" stroke="${INK3}" stroke-width="3"/>`;
  return frame(body);
}

/* ---------- Lord Card Shop: fanned collectible cards and a checkout panel ---------- */
function cardShop() {
  let body = '';
  const card = (x, y, rot, accent) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <rect x="-150" y="-215" width="300" height="430" rx="26" fill="${PANEL}" stroke="${accent ? ACCENT : INK2}" stroke-width="4"/>
    <rect x="-118" y="-183" width="236" height="210" rx="14" fill="none" stroke="${LINE}" stroke-width="3"/>
    <path d="M0 -140 L42 -78 L0 -16 L-42 -78 Z" fill="${accent ? ACCENT : 'rgba(242,244,247,0.22)'}"/>
    <rect x="-118" y="60" width="200" height="16" rx="8" fill="${INK2}"/>
    <rect x="-118" y="96" width="150" height="12" rx="6" fill="${INK3}"/>
    <rect x="-118" y="124" width="180" height="12" rx="6" fill="${INK3}"/>
    <circle cx="96" cy="170" r="18" fill="none" stroke="${INK3}" stroke-width="3"/>
  </g>`;
  body += card(330, 520, -16, false) + card(470, 490, -2, false) + card(610, 520, 12, true);
  // checkout
  const [x, y] = [930, 170];
  body += panel(x, y, 560, 680);
  body += label(x + 40, y + 70, 'CART', 'start', INK3);
  for (let i = 0; i < 3; i++) {
    const ry = y + 120 + i * 120;
    body += `<rect x="${x + 40}" y="${ry}" width="70" height="92" rx="10" fill="none" stroke="${i === 2 ? ACCENT : INK3}" stroke-width="3"/>`;
    body += bar(x + 140, ry + 22, 220, 16, INK2) + bar(x + 140, ry + 56, 140, 12, INK3) + bar(x + 420, ry + 36, 90, 16, INK2);
  }
  body += `<path d="M${x + 40} ${y + 500} H${x + 520}" stroke="${LINE}" stroke-width="2"/>`;
  body += bar(x + 40, y + 540, 120, 16, INK2) + bar(x + 400, y + 536, 110, 22, INK);
  body += `<rect x="${x + 40}" y="${y + 590}" width="480" height="64" rx="16" fill="${ACCENT}"/>`;
  body += bar(x + 220, y + 614, 120, 16, '#16191e');
  return frame(body);
}

const covers = {
  'cover-aria': aria,
  'cover-cs-learning': csLearning,
  'cover-echovision': echoVision,
  'cover-bearing': bearing,
  'cover-card-shop': cardShop,
};

for (const [key, draw] of Object.entries(covers)) {
  const file = `src/assets/projects/${key}.jpg`;
  const jpg = await sharp(Buffer.from(draw())).jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
  // rewrite only when the pixels changed (the folder may be cloud-synced)
  if (!existsSync(file) || !readFileSync(file).equals(jpg)) writeFileSync(file, jpg);
  console.log(file);
}
