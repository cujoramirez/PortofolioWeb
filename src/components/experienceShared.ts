import type { CSSProperties } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

// Shared design tokens + domain logic for the Experience timeline and the Certifications
// archive, kept in one place so the homepage cards and the full credential overlay read as
// one system (mirrors projectsShared.ts and the detection/glass language in ModernResearch).

// Signature reveal curve (ease-out-quint), typed for framer-motion.
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface Experience {
  year: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  achievements?: string[];
}

export interface Certification {
  title: string;
  issuer: string;
  link: string;
  image: string;
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

// Shared external-link styling: the trailing icon nudges out on hover (a small "opens
// elsewhere" cue) and underlines, reduced-motion-gated.
export const EXTERNAL_LINK_SX: SxProps<Theme> = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.74rem',
  color: 'primary.main',
  '& svg': { transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' },
  '&:hover': { textDecoration: 'underline' },
  '&:hover svg': { transform: 'translate(2px, -2px)' },
  '@media (prefers-reduced-motion: reduce)': {
    '& svg': { transition: 'none' },
    '&:hover svg': { transform: 'none' },
  },
};

// Sector classification for each role — an honest read of the kind of work, surfaced as the
// detection-frame tag (decorative) and conveyed accessibly alongside the role heading. Echoes
// the domain tags on the Projects cards so the two sections share one "detection class" motif.
export type TrackKey = 'research' | 'ios' | 'industry' | 'leadership' | 'teaching';

export const TRACK_META: Record<TrackKey, { tag: string; label: string }> = {
  research: { tag: 'RESEARCH', label: 'Research' },
  ios: { tag: 'iOS', label: 'iOS development' },
  industry: { tag: 'INDUSTRY', label: 'Industry' },
  leadership: { tag: 'LEADERSHIP', label: 'Leadership' },
  teaching: { tag: 'TEACHING', label: 'Teaching' },
};

export function inferTrack(exp: Pick<Experience, 'role' | 'company' | 'technologies'>): TrackKey {
  const hay = `${exp.role} ${exp.company} ${(exp.technologies ?? []).join(' ')}`.toLowerCase();
  if (/research|ieee|publication|r-cnn|fracture/.test(hay)) return 'research';
  if (/\bios\b|swift|swiftui|apple/.test(hay)) return 'ios';
  if (/tutor|lecture|teaching|educational|content creator/.test(hay)) return 'teaching';
  if (/chair|secretary|\bngo\b|fundrais|volunteer|leadership/.test(hay)) return 'leadership';
  return 'industry';
}

// Leading 4-digit years across every entry's date range, for the "career record" span.
export function yearSpan(experiences: Experience[]): { start: string; end: string } | null {
  const years = experiences
    .flatMap((exp) => exp.year.match(/\d{4}/g) ?? [])
    .map((y) => Number.parseInt(y, 10))
    .filter((y) => Number.isFinite(y));
  if (!years.length) return null;
  return { start: String(Math.min(...years)), end: String(Math.max(...years)) };
}

// Issuer breakdown ("8 Kaggle · 7 FreeCodeCamp · 1 NVIDIA"), counts descending. Issuer
// strings are rendered byte-for-byte from the data.
export function issuerBreakdown(certifications: Certification[]): { issuer: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const cert of certifications) counts.set(cert.issuer, (counts.get(cert.issuer) ?? 0) + 1);
  return [...counts.entries()]
    .map(([issuer, count]) => ({ issuer, count }))
    .sort((a, b) => b.count - a.count || a.issuer.localeCompare(b.issuer));
}
