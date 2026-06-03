import { memo } from 'react';
import { Box, Link } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GitHubIcon from '@mui/icons-material/GitHub';

import type { Project } from './projectsShared';

// Contained mono chip (matches the Research keyword chips): subtle fill + hairline border.
const CHIP_SX = {
  fontFamily: 'var(--font-mono)',
  fontWeight: 500,
  fontSize: '0.7rem',
  lineHeight: 1.5,
  letterSpacing: '0.01em',
  color: 'color-mix(in srgb, var(--app-palette-text-primary) 80%, transparent)',
  bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 6%, transparent)',
  px: 0.85,
  py: 0.4,
  border: '1px solid color-mix(in srgb, var(--app-palette-divider) 85%, transparent)',
  borderRadius: '5px',
} as const;

const CHIP_EXTRA_SX = {
  ...CHIP_SX,
  color: 'primary.main',
  bgcolor: 'color-mix(in srgb, var(--app-palette-primary-main) 10%, transparent)',
  border: '1px solid color-mix(in srgb, var(--app-palette-primary-main) 30%, transparent)',
} as const;

// Shared external-link styling: the trailing icon nudges out on hover (a small "opens
// elsewhere" cue) and underlines, reduced-motion-gated.
const EXTERNAL_LINK_SX: SxProps<Theme> = {
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

// Contained mono tech chips, optionally capped with a "+N" overflow marker.
export const TechChips = memo(function TechChips({
  technologies,
  max,
  sx,
}: {
  technologies: string[];
  max?: number;
  sx?: SxProps<Theme>;
}) {
  if (!technologies.length) return null;
  const list = typeof max === 'number' ? technologies.slice(0, max) : technologies;
  const extra = typeof max === 'number' ? technologies.length - list.length : 0;
  return (
    <Box sx={[{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {list.map((tech) => (
        <Box key={tech} component="span" sx={CHIP_SX}>
          {tech}
        </Box>
      ))}
      {extra > 0 && (
        <Box component="span" aria-label={`${extra} more technologies`} sx={CHIP_EXTRA_SX}>
          +{extra}
        </Box>
      )}
    </Box>
  );
});

// Demo / source links across every availability state (renders nothing when neither exists).
export const ProjectLinks = memo(function ProjectLinks({
  project,
  sx,
}: {
  project: Project;
  sx?: SxProps<Theme>;
}) {
  const { demo, github, title } = project;
  if (!demo && !github) return null;
  return (
    <Box sx={[{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {demo && (
        <Link
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          aria-label={`Live demo of ${title}, opens in a new tab`}
          sx={EXTERNAL_LINK_SX}
        >
          Live demo
          <OpenInNewIcon sx={{ fontSize: 13 }} />
        </Link>
      )}
      {github && (
        <Link
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
          aria-label={`Source code for ${title} on GitHub, opens in a new tab`}
          sx={EXTERNAL_LINK_SX}
        >
          Source
          <GitHubIcon sx={{ fontSize: 14 }} />
        </Link>
      )}
    </Box>
  );
});
