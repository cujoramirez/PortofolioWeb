import { memo, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import GitHubIcon from '@mui/icons-material/GitHub';

import OptimizedImage from './OptimizedImage';
import { useScrollLock } from './useScrollLock';
import { useSystemProfile } from './useSystemProfile';
import { DOMAIN_META, EASE, MONO_LABEL, inferDomain, type Project } from './projectsShared';
import { TechChips } from './ProjectMeta';

// Above the archive overlay (1500) so a detail can sit on top of it later if needed.
const Z_DETAIL = 1600;

const ACTION_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.75,
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
  fontWeight: 600,
  fontSize: '0.8rem',
  letterSpacing: '0.03em',
  color: 'primary.main',
  px: 2,
  minHeight: 44,
  borderRadius: '10px',
  border: '1px solid color-mix(in srgb, var(--app-palette-primary-main) 45%, transparent)',
  backgroundColor: 'color-mix(in srgb, var(--app-palette-primary-main) 8%, transparent)',
  transition: 'background-color 0.25s ease, border-color 0.25s ease',
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--app-palette-primary-main) 14%, transparent)',
    borderColor: 'color-mix(in srgb, var(--app-palette-primary-main) 75%, transparent)',
  },
} as const;

interface ProjectDetailProps {
  project: Project | null;
  onClose: () => void;
}

// Full read of a single project: the card shows a clamped teaser, this shows everything
// (large capture, complete description, every technology, and any public links).
const ProjectDetail = memo(function ProjectDetail({ project, onClose }: ProjectDetailProps) {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier } = useSystemProfile();
  const motionOn = !prefersReducedMotion;
  const heavyFx = !prefersReducedMotion && performanceTier !== 'low';

  const open = Boolean(project);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Keep the last project mounted through the exit animation (prop clears on close).
  const [shown, setShown] = useState<Project | null>(project);
  useEffect(() => {
    if (project) setShown(project);
  }, [project]);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus({ preventScroll: true });

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
          last.focus({ preventScroll: true });
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus({ preventScroll: true });
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  const domain = shown ? DOMAIN_META[inferDomain(shown)] : null;

  return createPortal(
    <AnimatePresence>
      {open && shown && domain && (
        <motion.div
          key="project-detail"
          ref={overlayRef}
          data-lenis-prevent=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionOn ? 0.28 : 0.16, ease: EASE }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: Z_DETAIL,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
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

          <Box
            component={motion.div}
            initial={{ opacity: 0, y: motionOn ? 32 : 0, scale: motionOn ? 0.96 : 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: motionOn ? 18 : 0, scale: motionOn ? 0.98 : 1 }}
            transition={{ duration: motionOn ? 0.44 : 0.16, ease: EASE, delay: motionOn ? 0.04 : 0 }}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: { xs: '100%', sm: 'calc(100% - 48px)' },
              maxWidth: '760px',
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
              {/* Header */}
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                  px: { xs: 2.5, md: 3.5 },
                  pt: { xs: 2.5, md: 3 },
                  pb: { xs: 2, md: 2.25 },
                  borderBottom: '1px solid color-mix(in srgb, var(--app-palette-divider) 70%, transparent)',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Box component="span" sx={{ ...MONO_LABEL, color: 'primary.main', display: 'block', mb: 1 }}>
                    {domain.label.toUpperCase()}
                  </Box>
                  <Typography
                    id={titleId}
                    component="h2"
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 'clamp(1.25rem, 1.05rem + 1vw, 1.7rem)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                      color: 'text.primary',
                      textWrap: 'pretty',
                    }}
                  >
                    {shown.title}
                  </Typography>
                </Box>

                <IconButton
                  ref={closeBtnRef}
                  onClick={onClose}
                  aria-label="Close project details"
                  sx={{
                    flexShrink: 0,
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

              {/* Scrolling body */}
              <Box
                data-lenis-prevent=""
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 2.5, md: 3 },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '16 / 10',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    mb: { xs: 2.5, md: 3 },
                    border: '1px solid color-mix(in srgb, var(--app-palette-divider) 70%, transparent)',
                    bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 4%, transparent)',
                  }}
                >
                  <OptimizedImage
                    src={shown.image}
                    alt={`${shown.title} — interface`}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    style={{ width: '100%', height: '100%', objectPosition: 'top' }}
                  />
                </Box>

                <Typography
                  sx={{
                    color: 'color-mix(in srgb, var(--app-palette-text-primary) 82%, transparent)',
                    fontSize: '0.975rem',
                    lineHeight: 1.75,
                    textWrap: 'pretty',
                    mb: { xs: 2.5, md: 3 },
                  }}
                >
                  {shown.description}
                </Typography>

                {(shown.technologies?.length ?? 0) > 0 && (
                  <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
                    <Box component="span" sx={{ ...MONO_LABEL, display: 'block', mb: 1.25 }}>
                      // stack
                    </Box>
                    <TechChips technologies={shown.technologies ?? []} />
                  </Box>
                )}

                {(shown.demo || shown.github) && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {shown.demo && (
                      <Box
                        component="a"
                        href={shown.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Live demo of ${shown.title}, opens in a new tab`}
                        sx={ACTION_SX}
                      >
                        Live demo
                        <OpenInNewIcon sx={{ fontSize: 15 }} />
                      </Box>
                    )}
                    {shown.github && (
                      <Box
                        component="a"
                        href={shown.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Source code for ${shown.title} on GitHub, opens in a new tab`}
                        sx={ACTION_SX}
                      >
                        Source
                        <GitHubIcon sx={{ fontSize: 16 }} />
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
});

export default ProjectDetail;
