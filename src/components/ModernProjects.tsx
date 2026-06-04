import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Button, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { PROJECTS, FEATURED_PROJECT_TITLES } from '../constants';
import OptimizedImage from './OptimizedImage';
import DetectionFrame from './DetectionFrame';
import LiquidGlass from './LiquidGlass';
import { useSystemProfile } from './useSystemProfile';
import ProjectsArchive from './ProjectsArchive';
import {
  DOMAIN_META,
  DOMAIN_ORDER,
  EASE,
  GLASS_TINT,
  MONO_LABEL,
  inferDomain,
  visuallyHidden,
  type DomainKey,
  type Project,
} from './projectsShared';
import { ProjectLinks, TechChips } from './ProjectMeta';

const ARCHIVE_HASH = '#all-projects';
const FALLBACK_FEATURED = 4;

// Human phrasing for the archive summary line.
const DOMAIN_WORDS: Record<DomainKey, string> = {
  research: 'research',
  vision: 'computer vision',
  web: 'the web',
  teaching: 'teaching',
  other: 'other work',
};

const humanList = (items: string[]): string => {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

// Open/close the archive through a hash route (#all-projects), so it is deep-linkable and
// the browser Back button closes it — without introducing a router into the single-page app.
function useArchiveRoute() {
  const [open, setOpen] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    const sync = () => {
      const isOpen = window.location.hash === ARCHIVE_HASH;
      setOpen(isOpen);
      if (!isOpen) pushedRef.current = false;
    };
    sync(); // honor a deep link on first load
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  const openArchive = useCallback(() => {
    if (window.location.hash !== ARCHIVE_HASH) {
      pushedRef.current = true;
      window.history.pushState(null, '', ARCHIVE_HASH);
    }
    setOpen(true);
  }, []);

  const closeArchive = useCallback(() => {
    if (window.location.hash !== ARCHIVE_HASH) {
      setOpen(false);
      return;
    }
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back(); // pops our entry -> popstate -> closes
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      setOpen(false);
    }
  }, []);

  return { open, openArchive, closeArchive };
}

// Image-led hero card: the screenshot is framed as a "detected input" (corner brackets +
// a domain class tag), unifying the visually heterogeneous captures into one CV motif.
const ProjectHeroCard = memo(function ProjectHeroCard({ project }: { project: Project }) {
  const domain = DOMAIN_META[inferDomain(project)];
  return (
    <LiquidGlass
      intensity="subtle"
      interactive
      blur={12}
      radius={18}
      style={GLASS_TINT}
      sx={{
        height: '100%',
        px: { xs: 1.25, md: 1.5 },
        py: { xs: 1.25, md: 1.5 },
        transition:
          'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          '--lg-shadow': '0 18px 44px rgba(0, 0, 0, 0.32)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <DetectionFrame
        tag={domain.tag}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: { xs: 1.5, md: 1.75 },
          py: { xs: 1.5, md: 1.75 },
          '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)',
          '@media (hover: hover)': {
            '&:hover': {
              '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 92%, transparent)',
            },
          },
        }}
      >
        {/* Screenshot */}
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16 / 10',
            borderRadius: '10px',
            overflow: 'hidden',
            mb: 1.75,
            border: '1px solid color-mix(in srgb, var(--app-palette-divider) 70%, transparent)',
            bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 4%, transparent)',
          }}
        >
          <OptimizedImage
            src={project.image}
            alt={`${project.title} — interface`}
            width="100%"
            height="100%"
            objectFit="cover"
            style={{ width: '100%', height: '100%', objectPosition: 'top' }}
          />
        </Box>

        {/* Title (domain conveyed accessibly alongside the decorative frame tag) */}
        <Typography
          component="h3"
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(1.05rem, 0.5vw + 0.95rem, 1.22rem)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            textWrap: 'pretty',
            mb: 1,
          }}
        >
          {project.title}
          <Box component="span" sx={visuallyHidden}>
            {` (${domain.label})`}
          </Box>
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'color-mix(in srgb, var(--app-palette-text-primary) 70%, transparent)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </Typography>

        <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TechChips technologies={project.technologies ?? []} max={4} />
          <ProjectLinks project={project} />
        </Box>
      </DetectionFrame>
    </LiquidGlass>
  );
});

const ModernProjectsComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier } = useSystemProfile();
  const reduce = !!prefersReducedMotion || performanceTier === 'low';

  const projects = useMemo(() => PROJECTS as Project[], []);

  // Curated homepage set (data-driven, easy to re-curate as flagship projects land).
  const featured = useMemo(() => {
    const byTitle = new Map(projects.map((p) => [p.title, p]));
    const picked = (FEATURED_PROJECT_TITLES as string[])
      .map((title) => byTitle.get(title))
      .filter((p): p is Project => Boolean(p));
    return picked.length ? picked : projects.slice(0, FALLBACK_FEATURED);
  }, [projects]);

  // Factual one-liner for the archive strip, derived so it never drifts from the data.
  const domainSummary = useMemo(() => {
    const present = DOMAIN_ORDER.filter((key) => projects.some((p) => inferDomain(p) === key));
    return humanList(present.map((key) => DOMAIN_WORDS[key]));
  }, [projects]);

  const { open, openArchive, closeArchive } = useArchiveRoute();

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });

  // Per-element reveal; static under reduced motion / low-end devices. Header stays visible.
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <Box ref={rootRef}>
      {/* Section header */}
      <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
        <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
          Portfolio
        </Typography>
        <Typography variant="h2" component="h2" sx={{ color: 'text.primary' }}>
          Projects
        </Typography>
      </Box>

      {/* Curated showcase */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {featured.map((project, index) => (
          <motion.div key={project.title} {...item(0.08 + index * 0.08)} style={{ height: '100%' }}>
            <ProjectHeroCard project={project} />
          </motion.div>
        ))}
      </Box>

      {/* Archive strip — echoes the Research record strip and carries the "view all" action */}
      <motion.div {...item(0.12 + featured.length * 0.08)}>
        <LiquidGlass
          intensity="subtle"
          blur={12}
          radius={16}
          style={GLASS_TINT}
          sx={{ mt: { xs: 2.5, md: 3 }, px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 } }}
        >
          <DetectionFrame sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 } }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 2, md: 3 },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box component="span" sx={{ ...MONO_LABEL, display: 'block', mb: 0.85 }}>
                  // project archive
                </Box>
                <Typography
                  sx={{
                    color: 'text.primary',
                    fontSize: '1rem',
                    fontWeight: 500,
                    lineHeight: 1.55,
                    maxWidth: '52ch',
                    textWrap: 'pretty',
                  }}
                >
                  {featured.length} featured here. The full record spans {projects.length} projects across{' '}
                  {domainSummary}.
                </Typography>
              </Box>

              <Button
                onClick={openArchive}
                aria-haspopup="dialog"
                aria-expanded={open}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  flexShrink: 0,
                  textTransform: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  letterSpacing: '0.03em',
                  color: 'primary.main',
                  px: 2,
                  py: 0.9,
                  minHeight: 44,
                  borderRadius: '10px',
                  border: '1px solid color-mix(in srgb, var(--app-palette-primary-main) 45%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--app-palette-primary-main) 8%, transparent)',
                  transition: 'background-color 0.25s ease, border-color 0.25s ease',
                  '& .MuiButton-endIcon svg': {
                    fontSize: 16,
                    transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                  },
                  '&:hover': {
                    backgroundColor: 'color-mix(in srgb, var(--app-palette-primary-main) 14%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--app-palette-primary-main) 75%, transparent)',
                    '& .MuiButton-endIcon svg': { transform: 'translateX(3px)' },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    '& .MuiButton-endIcon svg': { transition: 'none' },
                    '&:hover .MuiButton-endIcon svg': { transform: 'none' },
                  },
                }}
              >
                View all {projects.length} projects
              </Button>
            </Box>
          </DetectionFrame>
        </LiquidGlass>
      </motion.div>

      <ProjectsArchive open={open} onClose={closeArchive} projects={projects} />
    </Box>
  );
};

const ModernProjects = memo(ModernProjectsComponent);
ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;
