import { jumpTo } from './jump';

const NEXT: Record<string, [string, string]> = {
  hero: ['about', 'About'], about: ['disciplines', 'What I do'], disciplines: ['toolbox', 'Tools I use'],
  projects: ['experience', 'Experience'], experience: ['papers', 'Papers'], papers: ['certificates', 'Certificates'],
  contact: ['hero', 'the top'],
};

/** Outside the section's stacking context, the About skip stays above the overlapping hero. */
export function skipScene(section: HTMLElement): () => void {
  const next = NEXT[section.id];
  if (!next) return () => {};
  const link = document.createElement('a');
  link.className = 'skip-link skip-scene';
  link.href = `#${next[0]}`;
  link.textContent = `Skip to ${next[1]}`;
  const click = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); void jumpTo(next[0]); };
  link.addEventListener('click', click);
  section.before(link);
  return () => { link.removeEventListener('click', click); link.remove(); };
}
