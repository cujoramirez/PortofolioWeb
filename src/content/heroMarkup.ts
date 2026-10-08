/**
 * The hero as a static HTML string. The hero-shell Vite plugin renders it into index.html so
 * the hero and its LCP image paint before any JavaScript runs; HeroScene then attaches the
 * scroll choreography, the Vision lens and the detections toggle to this DOM.
 * Pure: no DOM access, no asset imports.
 */
import type { IndexEntry } from './heroIndex';
import { FONT_FACES_ID, HERO, OWNER, THEME_COLOR } from './site';

export interface HeroImage {
  avif: string[];
  webp: string[];
  widths: number[];
  width: number;
  height: number;
}

type Pt = [number, number];
interface Box { x: number; y: number; w: number; h: number }
export interface VisionData {
  framework: string;
  width: number;
  height: number;
  face: { box: Box; confidence: number; landmarks: Record<string, Pt[]> } | null;
  person: { box: Box; confidence: number } | null;
  mask: string;
  edge: string;
}

/** Rendered portrait width: 88vh tall at 3:4 on tablet and up, a poster crop on phones. */
export const HERO_SIZES = '(min-width: 768px) 66vh, 76vw';

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]);

const srcset = (files: string[], widths: number[]) => files.map((f, i) => `${f} ${widths[i]}w`).join(', ');
const external = (href: string) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener noreferrer"' : '');

const CLOSED = new Set(['leftEye', 'rightEye', 'outerLips', 'innerLips']);

/** A labelled box in image pixels: the label chip sits on the box's top-left edge. */
function labelledBox(b: Box, label: string, cls: string): string {
  const w = 34 * label.length + 44;
  return `<g class="${cls}">
<rect class="cv-box" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="18"/>
<g class="cv-label" transform="translate(${b.x} ${Math.max(0, b.y - 74)})"><rect width="${w}" height="64" rx="16"/><text x="22" y="44">${escapeHtml(label)}</text></g>
</g>`;
}

/** The Vision overlay: segmentation mask + contour, person and face boxes, face landmarks. */
export function visionMarkup(v: VisionData): string {
  const parts: string[] = [];
  if (v.person) parts.push(labelledBox(v.person.box, `person ${v.person.confidence.toFixed(2)}`, 'cv-person'));
  if (v.face) {
    parts.push(labelledBox(v.face.box, `face ${v.face.confidence.toFixed(2)}`, 'cv-face'));
    const lines = Object.entries(v.face.landmarks)
      .map(([k, pts]) => {
        const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ') + (CLOSED.has(k) ? ' Z' : '');
        return `<path d="${d}"/>`;
      })
      .join('');
    const dots = Object.values(v.face.landmarks)
      .flat()
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`)
      .join('');
    parts.push(`<g class="cv-landmarks">${lines}${dots}</g>`);
  }
  return `<div class="hero__cv" aria-hidden="true">
<span class="cv-mask" style="--m:url(${v.mask})"></span>
<span class="cv-edge" style="--m:url(${v.edge})"></span>
<span class="cv-scan"></span>
<svg class="cv-svg" viewBox="0 0 ${v.width} ${v.height}" preserveAspectRatio="xMidYMax meet">${parts.join('')}</svg>
</div>`;
}

/** The index in the plate's right third: one link per section, with its count where it has one. */
function indexMarkup(entries: IndexEntry[]): string {
  const rows = entries
    .map((s, i) => {
      const count = s.count === undefined ? '' : `<span class="hero__index-count">${s.count}</span>`;
      return `<li><a href="#${s.id}"><span class="hero__index-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span>${escapeHtml(s.title)}</span>${count}</a></li>`;
    })
    .join('');
  return `<nav class="hero__index layer" data-layer="3" aria-label="${escapeHtml(HERO.indexLabel)}"><ol>${rows}</ol></nav>`;
}

export function heroMarkup(img: HeroImage, vision: VisionData | null, index: IndexEntry[] = []): string {
  const fallback = img.webp[Math.min(1, img.webp.length - 1)];
  const lines = HERO.lines.map((l) => `<span class="hero__line">${escapeHtml(l)}</span>`).join(' ');
  const socials = HERO.socials
    .map((s) => `<a class="text-link" href="${escapeHtml(s.href)}"${external(s.href)}>${escapeHtml(s.label)}</a>`)
    .join('');
  const facts = HERO.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join('');
  const tags = HERO.tags
    .map((t, i) => `<span class="layer-tag hero__tag hero__tag--${i}" aria-hidden="true">${escapeHtml(t)}</span>`)
    .join('');
  const cv = vision ? visionMarkup(vision) : '';
  return `<section id="hero" class="scene hero" aria-labelledby="hero-name">
<div class="hero__spacer">
<div class="hero__pin">
<div class="hero__persp persp">
<div class="hero__stage stage">
<div class="hero__plate plate dots layer" data-layer="0" aria-hidden="true"></div>
<h1 id="hero-name" class="hero__name layer" data-layer="1" aria-label="${escapeHtml(OWNER)}">${lines}</h1>
<div class="hero__portrait layer" data-layer="2">
<picture>
<source type="image/avif" srcset="${srcset(img.avif, img.widths)}" sizes="${HERO_SIZES}">
<source type="image/webp" srcset="${srcset(img.webp, img.widths)}" sizes="${HERO_SIZES}">
<img class="hero__img" src="${escapeHtml(fallback)}" width="${img.width}" height="${img.height}" alt="${escapeHtml(HERO.alt)}" fetchpriority="high" decoding="async">
</picture>
${cv}
</div>
<div class="hero__ui layer" data-layer="3">
<p class="hero__role">${escapeHtml(HERO.role)}</p>
<ul class="hero__facts mono">${facts}</ul>
<div class="hero__actions">
<a class="btn btn--primary" href="${HERO.primary.href}">${escapeHtml(HERO.primary.label)}</a>
<a class="btn btn--secondary" href="${HERO.resume.href}" target="_blank" rel="noopener">${escapeHtml(HERO.resume.label)}</a>
</div>
<p class="hero__socials">${socials}</p>
</div>
${index.length ? indexMarkup(index) : ''}
${tags}
</div>
</div>
</div>
</div>
</section>`;
}

/**
 * Sets [data-theme] on <html> before first paint (and marks JS as available). Stored choice
 * wins; otherwise the OS scheme. Kept in sync with src/lib/theme.ts (same key and values).
 * It also adds a theme-color meta for the active scheme. The script runs before the two
 * media-keyed tags in index.html are parsed, so its tag comes first in the tree and wins;
 * those two remain for visitors without JavaScript.
 */
/**
 * Holds the web fonts back until the hero portrait (the LCP image) has loaded. Inlined
 * @font-face rules start three font downloads with the first layout; on a slow connection they
 * took bandwidth from the portrait and LCP went from 1.82 s to 1.94 s. The script shuts the
 * <style> (media "not all") before anything is laid out and opens it on the portrait's load or
 * error event, or after 3 s. Without JavaScript the rules simply apply.
 */
export function fontGateScript(): string {
  return `(function(){var d=document,s=d.getElementById('${FONT_FACES_ID}'),t;if(!s)return;s.media='not all';function o(){if(!t)return;clearTimeout(t);t=0;s.media='all';d.removeEventListener('load',h,true);d.removeEventListener('error',h,true)}function h(e){if(e.target&&e.target.className==='hero__img')o()}t=setTimeout(o,3000);d.addEventListener('load',h,true);d.addEventListener('error',h,true)})();`;
}

export function themeInitScript(): string {
  return `(function(){var d=document.documentElement,p=null,s,m;d.classList.add('js');try{p=localStorage.getItem('theme')}catch(e){}s=d.dataset.theme=p==='light'||p==='dark'?p:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');m=document.createElement('meta');m.name='theme-color';m.content=s==='light'?'${THEME_COLOR.light}':'${THEME_COLOR.dark}';document.head.appendChild(m)})();`;
}
