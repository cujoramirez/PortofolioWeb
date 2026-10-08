/**
 * Presentation copy and links shared by the React app and the build-time hero shell.
 * Facts come from src/constants/index.js; this file only holds short UI strings.
 */
export const OWNER = 'Gading Aditya Perdana';

/** id of the <style> that holds the web fonts' @font-face rules in a build (fontGateScript, lib/fonts.ts). */
export const FONT_FACES_ID = 'font-faces';

/** Browser toolbar colour per scheme: the `--bg` token of each theme (src/styles/tokens.css). */
export const THEME_COLOR = { light: '#fbfbfd', dark: '#0a0b0d' } as const;

export const LINKS = {
  email: 'gadingadityaperdana@gmail.com',
  linkedin: 'https://www.linkedin.com/in/gadingadityaperdana/',
  github: 'https://github.com/cujoramirez',
  scholar: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ',
  resume: '/Gading_Resume.pdf',
} as const;

export const HERO = {
  lines: ['Gading Aditya', 'Perdana'],
  role: 'I research computer vision and build the software around it: five peer-reviewed papers, native iOS and macOS apps, and models that run on the device.',
  facts: ['Computer Science, BINUS University', 'Apple Developer Academy, Cohort 2026', 'Jakarta, Indonesia'],
  primary: { label: 'View my work', href: '#projects' },
  resume: { label: 'Résumé (PDF)', href: LINKS.resume },
  socials: [
    { label: 'LinkedIn', href: LINKS.linkedin },
    { label: 'GitHub', href: LINKS.github },
    { label: 'Google Scholar', href: LINKS.scholar },
    { label: 'Email', href: `mailto:${LINKS.email}` },
  ],
  alt: 'Gading Aditya Perdana in a navy suit and blue tie',
  tags: ['Backdrop', 'Type', 'Portrait', 'Interface'],
  indexLabel: 'On this page',
} as const;

export type SectionId = 'hero' | 'about' | 'disciplines' | 'toolbox' | 'projects' | 'experience' | 'papers' | 'certificates' | 'contact';

/** Sections after the hero, in page order, with their headings. */
export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: 'about', title: 'About' },
  { id: 'disciplines', title: 'What I do' },
  { id: 'toolbox', title: 'Tools I use' },
  { id: 'projects', title: 'Projects' },
  { id: 'experience', title: 'Experience' },
  { id: 'papers', title: 'Papers' },
  { id: 'certificates', title: 'Certificates' },
  { id: 'contact', title: 'Get in touch' },
];

/** Navbar links, in page order, with their `g` + letter shortcut. */
export const NAV: { id: SectionId; label: string; key: string }[] = [
  { id: 'about', label: 'About', key: 'a' },
  { id: 'projects', label: 'Projects', key: 'p' },
  { id: 'experience', label: 'Experience', key: 'e' },
  { id: 'papers', label: 'Papers', key: 'r' },
  { id: 'contact', label: 'Contact', key: 'c' },
];

/**
 * Featured-project presentation (facts from PROJECTS descriptions, condensed for scanning).
 * Keyed by the project's short name (the part before the dash).
 */
export const FEATURED: Record<string, { kind: string; summary: string; highlights: string[]; fit?: 'contain' }> = {
  FightRoom: {
    kind: 'iOS app',
    summary: "A native iOS 26 app for finding martial arts coaches and gyms, built to show Apple's design guidelines applied in real Swift code.",
    highlights: ['Liquid Glass MapKit map', 'Siri shortcut with App Intents', 'WCAG AAA contrast'],
  },
  '67Cam': {
    kind: 'macOS app',
    summary: 'A macOS camera studio that turns a webcam into a system-wide virtual camera, with gesture-triggered overlays any app can read.',
    highlights: ['35 real-time filters', 'Tracks up to 5 people', 'On-device CreateML gestures'],
  },
  DALX: {
    kind: 'macOS app · medical imaging',
    summary: "Chest radiograph measurements computed entirely on the Mac, and an honest null when a measurement can't be made.",
    highlights: ['5 local deep learning models', 'No cloud round-trip', 'DICOM SR and PDF export'],
  },
  OccamViT: {
    kind: 'Research · manuscript in preparation',
    summary: 'A compact vision backbone designed by subtraction, trained from scratch on ImageNet-1K on a single GPU.',
    highlights: ['80.24% top-1 at 6.8M params', '82.14% top-1 at 11.9M params', '31.7% on ImageNet-A'],
    fit: 'contain',
  },
};
