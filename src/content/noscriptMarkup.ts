/**
 * The page below the hero as plain HTML, for visitors without JavaScript. The scenes are React
 * chunks, so without scripts only the hero shell exists; the hero-shell Vite plugin puts this in
 * a <noscript> after #root. Built from the same data and strings as the scenes.
 * Sections carry the scenes' ids, so the hero's "View my work" link still lands.
 * Pure: no DOM access, no asset imports.
 */
import { technologies } from '../components/techData';
import { aboutChapters, certificates, experiences, featuredProjects, firstSentence, papers, projects, splitTitle } from './data';
import { DISCIPLINES } from './disciplines';
import { escapeHtml } from './heroMarkup';
import { FEATURED, HERO, SECTIONS, type SectionId } from './site';

const e = escapeHtml;
const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const BODY: Partial<Record<SectionId, () => string>> = {
  about: () => aboutChapters.map((p) => `<p>${e(p)}</p>`).join(''),
  disciplines: () => list(DISCIPLINES.map((d) => `<b>${e(d.title)}</b>. ${e(d.line)}`)),
  toolbox: () => `<p>${e(technologies.map((t) => t.name).join(', '))}</p>`,
  projects: () =>
    list(
      // the featured four first, as on the page, then the rest in data order
      [...featuredProjects, ...projects.filter((p) => !featuredProjects.includes(p))].map((p) => {
        const [name] = splitTitle(p.title);
        return `<b>${e(name)}</b>. ${e(FEATURED[name]?.summary ?? firstSentence(p.description))}`;
      }),
    ),
  experience: () => list(experiences.map((x) => `<b>${e(x.role)}</b>, ${e(x.company)}, ${e(x.year)}`)),
  papers: () =>
    list(
      papers.map((p) => {
        const doi = p.doi ? ` <a href="https://doi.org/${e(p.doi)}">DOI</a>` : '';
        return `<b>${e(p.title)}</b>. ${e(p.venue)}, ${e(p.year)}.${doi}`;
      }),
    ),
  // one line per issuer: sixteen titles from three issuers
  certificates: () =>
    list(
      [...new Set(certificates.map((c) => c.issuer))].map(
        (issuer) => `<b>${e(issuer)}</b>. ${e(certificates.filter((c) => c.issuer === issuer).map((c) => c.title).join(', '))}`,
      ),
    ),
  contact: () =>
    `<p>${[...HERO.socials, HERO.resume].map((l) => `<a class="text-link" href="${e(l.href)}">${e(l.label)}</a>`).join(' ')}</p>`,
};

export function noscriptMarkup(): string {
  const sections = SECTIONS.map((s) => `<section id="${s.id}"><h2>${e(s.title)}</h2>${BODY[s.id]?.() ?? ''}</section>`).join('\n');
  return `<noscript>\n<div class="nojs">\n${sections}\n</div>\n</noscript>`;
}
