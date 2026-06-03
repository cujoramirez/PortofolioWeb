import { memo, useContext, useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, IconButton, Link as MuiLink, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import OptimizedImage from './OptimizedImage';
import { LenisContext } from './LenisContext';
import { useSystemProfile } from './useSystemProfile';
import {
  EASE,
  MONO_LABEL,
  issuerBreakdown,
  type Certification,
} from './experienceShared';

// Sits above the navbar (1100) and back-to-top (1400); below the mobile-nav/scroll tier (9999).
const Z_ARCHIVE = 1500;

interface CertificationsArchiveProps {
  open: boolean;
  onClose: () => void;
  certifications: Certification[];
}

// One credential, image-led: the certificate gets room to read on a neutral surface, and the
// whole card is a single link to the official credential (no nested interactives).
const CredentialCard = memo(function CredentialCard({ cert }: { cert: Certification }) {
  return (
    <MuiLink
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      aria-label={`${cert.title} credential from ${cert.issuer}, opens in a new tab`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid color-mix(in srgb, var(--app-palette-divider) 75%, transparent)',
        bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 3.5%, transparent)',
        transition:
          'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease',
        '& .cred-cta svg': { transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' },
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor: 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)',
          boxShadow: '0 16px 38px rgba(0, 0, 0, 0.28)',
        },
        '&:hover .cred-cta': { color: 'primary.main' },
        '&:hover .cred-cta svg': { transform: 'translate(2px, -2px)' },
        '&:focus-visible': {
          outline: '2px solid var(--app-palette-primary-main)',
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'border-color 0.28s ease',
          '& .cred-cta svg': { transition: 'none' },
          '&:hover': { transform: 'none' },
          '&:hover .cred-cta svg': { transform: 'none' },
        },
      }}
    >
      {/* Credential image — contained on a neutral mat so the whole certificate reads */}
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '4 / 3',
          bgcolor: 'var(--app-palette-bg-sunken)',
          borderBottom: '1px solid color-mix(in srgb, var(--app-palette-divider) 60%, transparent)',
        }}
      >
        <OptimizedImage
          src={cert.image}
          alt={`${cert.title} certificate issued by ${cert.issuer}`}
          objectFit="contain"
          width="100%"
          height="100%"
          style={{ width: '100%', height: '100%' }}
        />
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.85, px: 1.75, py: 1.5 }}>
        <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.12em', color: 'primary.main' }}>
          {cert.issuer}
        </Box>
        <Typography
          sx={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '0.95rem',
            lineHeight: 1.32,
            letterSpacing: '-0.005em',
            color: 'text.primary',
            textWrap: 'pretty',
          }}
        >
          {cert.title}
        </Typography>
        <Box
          component="span"
          className="cred-cta"
          sx={{
            mt: 'auto',
            pt: 0.5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: '0.72rem',
            color: 'color-mix(in srgb, var(--app-palette-text-primary) 64%, transparent)',
            transition: 'color 0.25s ease',
          }}
        >
          View credential
          <OpenInNewIcon sx={{ fontSize: 13 }} />
        </Box>
      </Box>
    </MuiLink>
  );
});

const CertificationsArchive = memo(function CertificationsArchive({
  open,
  onClose,
  certifications,
}: CertificationsArchiveProps) {
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

  // Group by issuer (counts descending), preserving each issuer's original order within.
  const groups = useMemo(() => {
    return issuerBreakdown(certifications).map(({ issuer, count }) => ({
      issuer,
      count,
      items: certifications.filter((cert) => cert.issuer === issuer),
    }));
  }, [certifications]);

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
          key="certifications-archive"
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
                    // credentials
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
                    All Credentials
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.25, sm: 2 }, flexShrink: 0 }}>
                  <Box component="span" sx={{ ...MONO_LABEL, display: { xs: 'none', sm: 'inline' } }}>
                    {certifications.length} total
                  </Box>
                  <IconButton
                    ref={closeBtnRef}
                    onClick={onClose}
                    aria-label="Close credentials archive"
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
                  <Box key={group.issuer} component="section" aria-label={group.issuer}>
                    {/* Group header (Gestalt grouping cue) */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: { xs: 1.75, md: 2 } }}>
                      <Box component="span" sx={{ ...MONO_LABEL, color: 'primary.main', fontSize: '0.68rem' }}>
                        {group.issuer.toUpperCase()}
                      </Box>
                      <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.66rem' }}>
                        ·&nbsp;{group.count}
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
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
                        gap: { xs: 1.75, md: 2 },
                      }}
                    >
                      {group.items.map((cert) => (
                        <CredentialCard key={cert.title} cert={cert} />
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

CertificationsArchive.displayName = 'CertificationsArchive';

export default CertificationsArchive;
