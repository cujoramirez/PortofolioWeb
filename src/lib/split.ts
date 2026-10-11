/**
 * Text split into letters or words for a tween to move, and put back afterwards. It makes the
 * boxes GSAP's SplitText made here (inline-block, hidden from assistive technology under a label
 * that reads the whole text) without its 16 KB in the first bundle: all this site splits is one
 * name and seven short headings. Letters are code points, which is enough for Latin text.
 */
export interface Split {
  parts: HTMLElement[];
  revert(): void;
}

function box(className: string, clip: boolean): HTMLElement {
  const el = document.createElement('div');
  el.className = className;
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `position: relative; display: inline-block;${clip ? ' overflow: clip;' : ''}`;
  return el;
}

/** `mask` wraps each part in a clipping box of that class, for parts that rise from behind an edge. */
export function split(target: HTMLElement, by: 'chars' | 'words', className: string, mask = ''): Split {
  const before = target.innerHTML;
  const labelled = target.hasAttribute('aria-label');
  if (!labelled) target.setAttribute('aria-label', (target.textContent ?? '').trim().replace(/\s+/g, ' '));
  const texts: Text[] = [];
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const parts: HTMLElement[] = [];
  for (const text of texts) {
    const out = document.createDocumentFragment();
    // white space stays as text between the boxes, so lines still break where they did
    for (const piece of text.data.match(by === 'chars' ? /\s+|\S/gu : /\s+|\S+/g) ?? []) {
      if (/^\s/.test(piece)) {
        out.append(piece);
        continue;
      }
      const part = box(className, false);
      part.textContent = piece;
      parts.push(part);
      if (mask) {
        const clip = box(mask, true);
        clip.append(part);
        out.append(clip);
      } else out.append(part);
    }
    text.replaceWith(out);
  }
  return {
    parts,
    revert() {
      target.innerHTML = before;
      if (!labelled) target.removeAttribute('aria-label');
    },
  };
}
