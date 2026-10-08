/**
 * The hero's index: every section after the hero with how many things it holds. Counts are
 * lengths of the data the sections render, never typed in. Pure, for the build-time hero shell.
 */
import { technologies } from '../components/techData';
import { certificates, experiences, papers, projects } from './data';
import { DISCIPLINES } from './disciplines';
import { SECTIONS, type SectionId } from './site';

export interface IndexEntry {
  id: SectionId;
  title: string;
  count?: number;
}

const COUNTS: Partial<Record<SectionId, number>> = {
  disciplines: DISCIPLINES.length,
  toolbox: technologies.length,
  projects: projects.length,
  experience: experiences.length,
  papers: papers.length,
  certificates: certificates.length,
};

export const heroIndex = (): IndexEntry[] => SECTIONS.map((s) => ({ ...s, count: COUNTS[s.id] }));
