/**
 * Typed views over src/constants/index.js (the approved facts) plus small presentation helpers.
 */
import {
  ABOUT_FACTS,
  ABOUT_QUOTES,
  ABOUT_TEXT,
  CERTIFICATIONS,
  EXPERIENCES,
  FEATURED_CERTIFICATION_TITLES,
  FEATURED_PROJECT_TITLES,
  MORE_WORK_TITLES,
  PROJECTS,
  RESEARCH_PAPERS,
  SCHOLAR_PROFILE_URL,
} from '../constants/index.js';

export interface Project {
  title: string;
  image: string;
  description: string;
  technologies: string[];
  demo: string | null;
  github: string | null;
  links: string[];
}

export interface Experience {
  year: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  achievements: string[];
}

export interface Paper {
  year: string;
  title: string;
  authors: string;
  venue: string;
  venueType: string;
  description: string;
  keywords: string[];
  isFirstAuthor: boolean;
  doi?: string;
  scopusIndexed?: string;
}

export interface Certificate {
  title: string;
  issuer: string;
  link: string;
  image: string;
}

export interface Quote {
  text: string;
  author: string;
}

export const projects = PROJECTS as Project[];
export const experiences = EXPERIENCES as Experience[];
export const papers = RESEARCH_PAPERS as Paper[];
export const certificates = CERTIFICATIONS as Certificate[];
export const quotes = ABOUT_QUOTES as Quote[];
export const aboutFacts = ABOUT_FACTS as { gpa: string; gpaScale: string; academy: { accepted: number; applicants: string; rate: string } };
export const scholarUrl = SCHOLAR_PROFILE_URL as string;

const byTitle = <T extends { title: string }>(list: T[], titles: string[]) =>
  titles.map((t) => list.find((item) => item.title === t)).filter((x): x is T => Boolean(x));

export const featuredProjects = byTitle(projects, FEATURED_PROJECT_TITLES as string[]);
export const moreWorkProjects = byTitle(projects, MORE_WORK_TITLES as string[]);
export const featuredCertificates = byTitle(certificates, FEATURED_CERTIFICATION_TITLES as string[]);

/** "OccamViT – A Compact Vision Backbone…" -> ["OccamViT", "A Compact Vision Backbone…"] */
export function splitTitle(title: string): [string, string | null] {
  const m = /^(.+?)\s+[–-]\s+(.+)$/.exec(title);
  return m ? [m[1], m[2]] : [title, null];
}

/** Sentences, split on terminal punctuation followed by a capital (keeps "e.g." style text intact). */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z“"(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Covers drawn by scripts/generate-project-covers.mjs are illustrations, not screenshots. */
export const isIllustration = (imageKey: string) => imageKey.startsWith('cover-');

export const firstSentence = (text: string) => sentences(text)[0] ?? text;

export const aboutChapters = (ABOUT_TEXT as string).split(/\n\s*\n/).map((p) => p.trim());
