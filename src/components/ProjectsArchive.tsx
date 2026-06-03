import { memo, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import DetectionFrame from './DetectionFrame';
import { LenisContext } from './LenisContext';
import { useSystemProfile } from './useSystemProfile';
import {
  DOMAIN_META,
  DOMAIN_ORDER,
  EASE,
  MONO_LABEL,
  inferDomain,
  type DomainKey,
  type Project,
} from './projectsShared';
import { ProjectLinks, TechChips } from './ProjectMeta';

// Sits above the navbar (1100) and back-to-top (1400); below the mobile-nav/scroll tier (9999).
const Z_ARCHIVE = 1500;

interface ProjectsArchiveProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
}

// One full-detail dossier row (detection-framed, hover-selectable) — denser than the
// homepage hero cards: full description, every technology, all available links.
const ArchiveRow = memo(function ArchiveRow({ project }: { project: Project }) {
  return (
    <DetectionFrame
      interactive
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 1.75, md: 2 },
        py: { xs: 1.5, md: 1.75 },
        borderRadius: '8px',
        bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 3.5%, transparent)',
        '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 42%, transparent)',
      }}
    >
      <Typography
        component="h3"
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '1.02rem',
          lineHeight: 1.32,
          letterSpacing: '-0.01em',
          color: 'text.primary',
          textWrap: 'pretty',
          mb: 0.85,
        }}
      >
        {project.title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'color-mix(in srgb, var(--app-palette-text-primary) 68%, transparent)',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          mb: 1.5,
        }}
      >
        {project.description}
      </Typography>

      <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TechChips technologies={project.technologies ?? []} />
        <ProjectLinks project={project} />
      </Box>
    </DetectionFrame>
  );
});

const ProjectsArchive = memo(function ProjectsArchive({ open, onClose, projects }: ProjectsArchiveProps) {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier } = useSystemProfile();
  // Entrance motion (cheap GPU transforms) plays everywhere except reduced-motion; the
  // expensive backdrop-blur is the only thing gated off on low-end devices.
  const motionOn = !prefersReducedMotion;
  const heavyFx = !prefersReducedMotion && performanceTier !== 'low';

  const { stop, start } = useContext(LenisContext);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Group by domain for scannability (Gestalt: similarity + proximity); skip empty groups.
  const groups = useMemo(() => {
    const byDomain = new Map<DomainKey, Project[]>();
    for (const project of projects) {
      const key = inferDomain(project);
      const bucket = byDomain.get(key);
      if (bucket) bucket.push(project);
      else byDomain.set(key, [project]);
    }
    return DOMAIN_ORDER.filter((key) => byDomain.has(key)).map((key) => ({
      key,
      meta: DOMAIN_META[key],
      items: byDomain.get(key) as Project[],
    }));
  }, [projects]);

  // While open: pause Lenis, lock the body, trap focus, and wire Escape to close.
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'Tab' && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      start();
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, stop, start]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="projects-archive"
          ref={overlayRef}
          data-lenis-prevent=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionOn ? 0.32 : 0.16, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_ARCHIVE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Scrim + click-to-dismiss (plain element so the DOM handler is preserved) */}
          <Box
            aria-hidden
            onClick={onClose}
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'color-mix(in srgb, var(--app-palette-bg-sunken) 78%, transparent)',
              backdropFilter: heavyFx ? 'blur(8px) saturate(118%)' : 'none',
              WebkitBackdropFilter: heavyFx ? 'blur(8px) saturate(118%)' : 'none',
            }}
          />

          {/* Panel — outer carries motion + sizing, inner carries dialog semantics + surface */}
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: motionOn ? 44 : 0, scale: motionOn ? 0.94 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: motionOn ? 24 : 0, scale: motionOn ? 0.975 : 1 }}
            transition={{ duration: motionOn ? 0.52 : 0.16, ease: EASE, delay: motionOn ? 0.06 : 0 }}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: { xs: '100%', sm: 'calc(100% - 48px)' },
              maxWidth: '1080px',
              height: { xs: '100dvh', sm: 'auto' },
              maxHeight: { xs: '100dvh', sm: '88vh' },
              display: 'flex',
            }}
          >
            <Box
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              sx={{
                position: 'relative',
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: 'var(--app-palette-bg-elevated)',
                border: '1px solid color-mix(in srgb, var(--app-palette-divider) 80%, transparent)',
                borderRadius: { xs: 0, sm: '18px' },
                boxShadow: '0 40px 120px rgba(0, 0, 0, 0.45)',
              }}
            >
              {/* One-shot detection scanline as the panel powers up */}
              {motionOn && (
                <motion.div
                  aria-hidden
                  initial={{ top: '0%', opacity: 0 }}
                  animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.95, ease: EASE, delay: 0.12 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    zIndex: 5,
                    pointerEvents: 'none',
                    background:
                      'linear-gradient(90deg, transparent, color-mix(in srgb, var(--app-palette-secondary-main) 80%, transparent), transparent)',
                    boxShadow: '0 0 12px color-mix(in srgb, var(--app-palette-secondary-main) 55%, transparent)',
                  }}
                />
              )}

              {/* Header (fixed while the body scrolls) */}
              <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                px: { xs: 2.5, md: 4 },
                pt: { xs: 2.5, md: 3.5 },
                pb: { xs: 2, md: 2.5 },
                borderBottom: '1px solid color-mix(in srgb, var(--app-palette-divider) 70%, transparent)',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Box component="span" sx={{ ...MONO_LABEL, display: 'block', mb: 1 }}>
                  // project archive
                </Box>
                <Typography
                  id={titleId}
                  component="h2"
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.1rem)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    color: 'text.primary',
                  }}
                >
                  All Projects
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 2 }, flexShrink: 0 }}>
                <Box component="span" sx={{ ...MONO_LABEL, display: { xs: 'none', sm: 'inline' } }}>
                  {projects.length} total
                </Box>
                <IconButton
                  ref={closeBtnRef}
                  onClick={onClose}
                  aria-label="Close projects archive"
                  sx={{
                    color: 'text.primary',
                    border: '1px solid color-mix(in srgb, var(--app-palette-divider) 70%, transparent)',
                    borderRadius: '10px',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'color-mix(in srgb, var(--app-palette-text-primary) 6%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--app-palette-primary-main) 45%, transparent)',
                    },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Scrolling body (data-lenis-prevent so Lenis yields to native scroll) */}
            <Box
              data-lenis-prevent=""
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                px: { xs: 2.5, md: 4 },
                py: { xs: 2.5, md: 3.5 },
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 3.5, md: 4.5 },
              }}
            >
              {groups.map((group) => (
                <Box key={group.key} component="section" aria-label={group.meta.label}>
                  {/* Group header (Gestalt grouping cue) */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: { xs: 1.75, md: 2 } }}>
                    <Box component="span" sx={{ ...MONO_LABEL, color: 'primary.main', fontSize: '0.68rem' }}>
                      {group.meta.label.toUpperCase()}
                    </Box>
                    <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.66rem' }}>
                      ·&nbsp;{group.items.length}
                    </Box>
                    <Box
                      aria-hidden
                      sx={{
                        flex: 1,
                        height: '1px',
                        ml: 1.25,
                        bgcolor: 'color-mix(in srgb, var(--app-palette-divider) 60%, transparent)',
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: { xs: 1.75, md: 2 },
                    }}
                  >
                    {group.items.map((project) => (
                      <ArchiveRow key={project.title} project={project} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

ProjectsArchive.displayName = 'ProjectsArchive';

export default ProjectsArchive;
