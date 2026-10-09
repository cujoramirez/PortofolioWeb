import { motionAllowed } from './motion';

export interface SequenceSet { count: number; width: number; height: number; bytes: number; avif: string[]; webp: string[] }
export interface Sequence { desktop: SequenceSet; phone: SequenceSet }
export interface SequencePlayer { update(progress: number, opacity: number, near: boolean): void; destroy(): void }

export function canPlaySequence(): boolean {
  return motionAllowed() && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
}

/** Encoded frames stay cached; decoded frames occupy a bounded window around the scroll position. */
export function mountSequence(screen: HTMLElement, source: Sequence, phone: boolean): SequencePlayer | null {
  if (!canPlaySequence() || !window.createImageBitmap) return null;
  const set = phone ? source.phone : source.desktop;
  const tall = set.height > set.width;
  // A tall recording stands framed on the wide plate. On a phone that frame is about 86 px
  // wide, a thumbnail of the app next to the still it would replace: the still stays.
  if (tall && ((screen.clientHeight - 24) * set.width) / set.height < 120) return null;
  const plate = document.createElement('div');
  plate.className = `pcard__sequence${tall ? ' is-portrait' : ''}`;
  plate.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.width = set.width;
  canvas.height = set.height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return null;
  plate.appendChild(canvas);
  // ahead of the layer tag in the DOM: projects.css lifts the tag in front of the footage
  screen.insertBefore(plate, screen.querySelector('.layer-tag'));
  const decoded = new Map<number, ImageBitmap>();
  const blobs = new Map<string, Promise<Blob>>();
  const pending = new Set<number>();
  const abort = new AbortController();
  // A tall phone recording costs more per bitmap; keep its window within 32 MB.
  const count = Math.min(17, Math.max(3, Math.floor(32 * 1024 * 1024 / (set.width * set.height * 4))));
  let windowFrames = new Set<number>();
  let wanted = 0;
  let painted = -1;
  let opacity = 0;
  let frame = 0;
  let dead = false;
  let failed = false;
  let near = false;
  let fallback = false;
  const blob = (url: string) => {
    if (!blobs.has(url)) blobs.set(url, fetch(url, { signal: abort.signal }).then((r) => { if (!r.ok) throw new Error('Missing frame'); return r.blob(); }));
    return blobs.get(url)!;
  };
  const draw = () => {
    frame = 0;
    const bitmap = decoded.get(wanted);
    if (dead || failed || !bitmap || !near || !canPlaySequence()) { plate.style.opacity = '0'; return; }
    if (painted !== wanted) {
      ctx.drawImage(bitmap, 0, 0);
      painted = wanted;
      plate.dataset.frame = String(wanted);
    }
    plate.style.opacity = String(opacity);
  };
  const request = () => { if (!frame && !dead) frame = requestAnimationFrame(draw); };
  const decode = async (index: number) => {
    pending.add(index);
    try {
      let bitmap: ImageBitmap;
      try { bitmap = await createImageBitmap(await blob((fallback ? set.webp : set.avif)[index])); }
      catch { fallback = true; bitmap = await createImageBitmap(await blob(set.webp[index])); }
      if (dead || !windowFrames.has(index)) bitmap.close();
      else { decoded.set(index, bitmap); if (index === wanted) request(); }
    } catch {
      if (!dead) { failed = true; plate.style.opacity = '0'; }
    } finally { pending.delete(index); if (!dead && !failed) fill(); }
  };
  const fill = () => {
    if (!near || !canPlaySequence()) return;
    const missing = [...windowFrames].filter((i) => !decoded.has(i) && !pending.has(i)).sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted));
    for (const index of missing.slice(0, Math.max(0, 3 - pending.size))) void decode(index);
  };
  return {
    update(progress, alpha, close) {
      if (dead || failed) return;
      opacity = alpha;
      near = close && canPlaySequence();
      wanted = Math.round(Math.max(0, Math.min(1, progress)) * (set.count - 1));
      if (!near) {
        windowFrames.clear();
        decoded.forEach((b) => b.close());
        decoded.clear();
        painted = -1;
        plate.style.opacity = '0';
        return;
      }
      const start = Math.max(0, Math.min(set.count - count, wanted - Math.floor(count / 2)));
      windowFrames = new Set(Array.from({ length: Math.min(count, set.count) }, (_, i) => start + i));
      decoded.forEach((bitmap, index) => { if (!windowFrames.has(index)) { bitmap.close(); decoded.delete(index); } });
      fill();
      if (decoded.has(wanted)) request();
    },
    destroy() {
      dead = true;
      abort.abort();
      if (frame) cancelAnimationFrame(frame);
      decoded.forEach((b) => b.close());
      decoded.clear();
      blobs.clear();
      plate.remove();
    },
  };
}
