import type { CSSProperties } from 'react';

// Shared design tokens + domain logic for the Projects showcase and archive, kept in one
// place so the homepage hero cards and the full archive read as one system (mirrors the
// detection/glass language shipped in ModernResearch). Components live in ProjectMeta.tsx.

// Signature reveal curve (ease-out-quint), typed for framer-motion.
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Project {
  title: string;
  image: string;
  description: string;
  technologies?: string[];
  demo: string | null;
  github: string | null;
  links: string[];
}

// Mono labels: medium weight + an ink-leaning tint so small type stays legible over the
// frosted glass (the default secondary gray reads too thin on the moving background).
export const MONO_LABEL = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.72rem',
  letterSpacing: '0.15em',
  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
} as const;

// Steadier glass: more opaque tint than the 62% default so card text reads cleanly where
// the animated background streaks pass behind it.
export const GLASS_TINT = {
  '--lg-tint': 'color-mix(in srgb, var(--app-palette-bg-elevated) 80%, transparent)',
} as CSSProperties;

export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

// Coarse domain inference so cards can carry a "detection class" tag and the archive can
// group by similarity (Gestalt). Order matters: research wins over its own CV stack.
export type DomainKey = 'research' | 'apple' | 'vision' | 'web' | 'teaching' | 'other';

export const DOMAIN_META: Record<DomainKey, { tag: string; label: string }> = {
  research: { tag: 'RESEARCH', label: 'Research' },
  apple: { tag: 'SWIFT', label: 'Apple Platforms' },
  vision: { tag: 'CV', label: 'Computer Vision & ML' },
  web: { tag: 'WEB', label: 'Web & Full-Stack' },
  teaching: { tag: 'EDU', label: 'Teaching' },
  other: { tag: 'PROJECT', label: 'Other Work' },
};

export const DOMAIN_ORDER: DomainKey[] = ['research', 'apple', 'vision', 'web', 'teaching', 'other'];

export function inferDomain(project: Pick<Project, 'title' | 'technologies'>): DomainKey {
  const hay = `${project.title} ${(project.technologies ?? []).join(' ')}`.toLowerCase();
  if (/\bresearch\b|cvpr|ensemble|mutual learning|distillation/.test(hay)) return 'research';
  if (/tutor|lecture|teaching|educational|bootcamp/.test(hay)) return 'teaching';
  // Native Apple-platform apps win over their own CV/ML stack (67Cam ships Vision + CoreML).
  if (/\bswift\b|swiftui|swiftdata|\bios\b|ipados|macos|mapkit|app intents|coreml|createml|liquid glass|xcode|coremediaio|\bcmio\b/.test(hay)) {
    return 'apple';
  }
  if (/cnn|computer vision|opencv|gradcam|grad-cam|tensorflow|keras|pytorch|mobilenet|transfer learning|machine learning|deep learning|\beda\b/.test(hay)) {
    return 'vision';
  }
  if (/react|node|express|laravel|php|asp\.net|bootstrap|sql|mysql|sqlite|html|css|javascript|razor|entity framework|blade/.test(hay)) {
    return 'web';
  }
  return 'other';
}
