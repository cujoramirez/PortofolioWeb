/**
 * The hero as a static HTML string. The hero-shell Vite plugin renders it into index.html so
 * the hero and its LCP image paint before any JavaScript runs; HeroScene then attaches the
 * scroll choreography, the Vision lens and the detections toggle to this DOM.
 * Pure: no DOM access, no asset imports.
 */
import { HERO, OWNER } from './site';

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

export function heroMarkup(img: HeroImage, vision: VisionData | null): string {
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
 */
export function themeInitScript(): string {
  return `(function(){var d=document.documentElement,p=null;d.classList.add('js');try{p=localStorage.getItem('theme')}catch(e){}d.dataset.theme=p==='light'||p==='dark'?p:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark')})();`;
}
