import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Box, Button, Collapse, Link as MuiLink, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { EXPERIENCES, CERTIFICATIONS, FEATURED_CERTIFICATION_TITLES } from '../constants';
import DetectionFrame from './DetectionFrame';
import LiquidGlass from './LiquidGlass';
import { TechChips } from './ProjectMeta';
import { useSystemProfile } from './useSystemProfile';
import CertificationsArchive from './CertificationsArchive';
import {
  EASE,
  GLASS_TINT,
  MONO_LABEL,
  TRACK_META,
  inferTrack,
  issuerBreakdown,
  visuallyHidden,
  yearSpan,
  type Certification,
  type Experience,
} from './experienceShared';

const ARCHIVE_HASH = '#credentials';
const FALLBACK_FEATURED = 4;

// Open/close the credentials archive through a hash route (#credentials), so it is
// deep-linkable and the browser Back button closes it — without adding a router (mirrors
// the Projects archive route).
function useCredentialsRoute() {
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

// One role as a "tracked" career node: a rail marker locks the chronology, the entry is a
// liquid-glass detection card (sector tag, full date range, progressive-disclosure outcomes).
const TimelineEntry = memo(function TimelineEntry({
  experience,
  isLast,
}: {
  experience: Experience;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const track = TRACK_META[inferTrack(experience)];
  const achievements = experience.achievements ?? [];
  const hasAchievements = achievements.length > 0;

  return (
    <>
      {/* Rail segment + node (decorative; chronology is announced by the ordered list) */}
      {!isLast && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: { xs: 5, md: 5.5 },
            top: { xs: 25, md: 28 },
            // Bridge the inter-card gap so the spine reads continuous into the next node.
            bottom: { xs: -14, md: -16 },
            width: '1px',
            bgcolor: 'color-mix(in srgb, var(--app-palette-divider) 55%, transparent)',
          }}
        />
      )}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: 0,
          top: { xs: 14, md: 16 },
          width: { xs: 11, md: 12 },
          height: { xs: 11, md: 12 },
          borderRadius: '50%',
          bgcolor: 'var(--app-palette-primary-main)',
          boxShadow: '0 0 0 4px color-mix(in srgb, var(--app-palette-primary-main) 14%, transparent)',
        }}
      />

      <LiquidGlass
        intensity="subtle"
        interactive
        blur={12}
        radius={16}
        style={GLASS_TINT}
        sx={{
          px: { xs: 1.25, md: 1.5 },
          py: { xs: 1.25, md: 1.5 },
          transition:
            'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
          '&:hover': {
            transform: 'translateY(-3px)',
            '--lg-shadow': '0 16px 40px rgba(0, 0, 0, 0.30)',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
            '&:hover': { transform: 'none' },
          },
        }}
      >
        <DetectionFrame
          tag={track.tag}
          sx={{
            px: { xs: 1.75, md: 2.25 },
            py: { xs: 1.5, md: 1.75 },
            '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 55%, transparent)',
            '@media (hover: hover)': {
              '&:hover': {
                '--df-stroke': 'color-mix(in srgb, var(--app-palette-primary-main) 92%, transparent)',
              },
            },
          }}
        >
          {/* Date range */}
          <Box
            component="span"
            sx={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontWeight: 500,
              fontSize: '0.74rem',
              letterSpacing: '0.04em',
              color: 'color-mix(in srgb, var(--app-palette-text-primary) 70%, transparent)',
              fontVariantNumeric: 'tabular-nums',
              mb: 0.85,
            }}
          >
            {experience.year}
          </Box>

          {/* Role (sector conveyed accessibly alongside the decorative frame tag) */}
          <Typography
            component="h3"
            sx={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'clamp(1.05rem, 0.5vw + 0.95rem, 1.2rem)',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
              color: 'text.primary',
              textWrap: 'pretty',
            }}
          >
            {experience.role}
            <Box component="span" sx={visuallyHidden}>
              {` (${track.label})`}
            </Box>
          </Typography>

          {/* Company */}
          <Typography
            sx={{
              color: 'color-mix(in srgb, var(--app-palette-text-primary) 66%, transparent)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              mt: 0.35,
              mb: 1.25,
            }}
          >
            {experience.company}
          </Typography>

          {/* Description (clamped until expanded) */}
          <Typography
            variant="body2"
            sx={{
              color: 'color-mix(in srgb, var(--app-palette-text-primary) 78%, transparent)',
              fontSize: '0.9rem',
              lineHeight: 1.62,
              maxWidth: '66ch',
              mb: 1.5,
              ...(expanded
                ? {}
                : {
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }),
            }}
          >
            {experience.description}
          </Typography>

          {/* Technologies */}
          <TechChips technologies={experience.technologies ?? []} max={6} />

          {/* Key outcomes (revealed on demand) */}
          {hasAchievements && (
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box id={detailsId} sx={{ mt: 1.75 }}>
                <Box component="div" sx={{ ...MONO_LABEL, fontSize: '0.62rem', letterSpacing: '0.18em', mb: 1 }}>
                  KEY OUTCOMES
                </Box>
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none', maxWidth: '66ch', display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                  {achievements.map((achievement) => (
                    <Box key={achievement} component="li" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.1 }}>
                      <Box
                        aria-hidden
                        sx={{
                          mt: '7px',
                          width: 5,
                          height: 5,
                          flexShrink: 0,
                          borderRadius: '1px',
                          bgcolor: 'var(--app-palette-primary-main)',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'color-mix(in srgb, var(--app-palette-text-primary) 82%, transparent)',
                          fontSize: '0.875rem',
                          lineHeight: 1.6,
                        }}
                      >
                        {achievement}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Collapse>
          )}

          {/* Disclosure toggle */}
          {hasAchievements && (
            <Box sx={{ mt: 1.5 }}>
              <Button
                onClick={() => setExpanded((prev) => !prev)}
                size="small"
                variant="text"
                aria-expanded={expanded}
                aria-controls={detailsId}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      transition: 'transform 0.25s ease',
                      transform: expanded ? 'rotate(180deg)' : 'none',
                    }}
                  />
                }
                sx={{
                  px: 0.5,
                  minHeight: { xs: 44, sm: 'auto' },
                  minWidth: 0,
                  textTransform: 'none',
                  color: 'color-mix(in srgb, var(--app-palette-text-primary) 72%, transparent)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 500,
                  fontSize: '0.74rem',
                  '&:hover': { color: 'text.primary', backgroundColor: 'transparent' },
                }}
              >
                {expanded ? 'Hide details' : 'Show details'}
              </Button>
            </Box>
          )}
        </DetectionFrame>
      </LiquidGlass>
    </>
  );
});

// Curated credential, inline: a light detection-less card (the brackets stay on the timeline
// and record strips) linking straight to the official credential. Images live in the archive.
const FeaturedCert = memo(function FeaturedCert({ cert }: { cert: Certification }) {
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
        gap: 1,
        height: '100%',
        px: 1.75,
        py: 1.5,
        borderRadius: '12px',
        border: '1px solid color-mix(in srgb, var(--app-palette-divider) 75%, transparent)',
        bgcolor: 'color-mix(in srgb, var(--app-palette-text-primary) 3.5%, transparent)',
        transition:
          'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease',
        '& .fc-icon': { transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)' },
        // Hover affordance only where hover is real; on touch it would stick after a tap.
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: 'color-mix(in srgb, var(--app-palette-primary-main) 50%, transparent)',
            boxShadow: '0 14px 34px rgba(0, 0, 0, 0.24)',
          },
          '&:hover .fc-icon': { color: 'primary.main', transform: 'translate(2px, -2px)' },
        },
        '&:focus-visible': { outline: '2px solid var(--app-palette-primary-main)', outlineOffset: 2 },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'border-color 0.28s ease',
          '& .fc-icon': { transition: 'none' },
          '&:hover': { transform: 'none' },
          '&:hover .fc-icon': { transform: 'none' },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.12em', color: 'primary.main' }}>
          {cert.issuer}
        </Box>
        <OpenInNewIcon
          className="fc-icon"
          sx={{ fontSize: 14, color: 'color-mix(in srgb, var(--app-palette-text-primary) 45%, transparent)' }}
        />
      </Box>
      <Typography
        sx={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '0.92rem',
          lineHeight: 1.35,
          letterSpacing: '-0.005em',
          color: 'text.primary',
          textWrap: 'pretty',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {cert.title}
      </Typography>
    </MuiLink>
  );
});

const ModernExperienceComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  const { performanceTier } = useSystemProfile();
  const reduce = !!prefersReducedMotion || performanceTier === 'low';

  const experiences = useMemo(() => EXPERIENCES as Experience[], []);
  const certifications = useMemo(() => CERTIFICATIONS as Certification[], []);

  const expHeadingId = useId();
  const certHeadingId = useId();

  // Headline credibility figures for the career record, derived so they never drift.
  const careerStats = useMemo(() => {
    const span = yearSpan(experiences);
    const out: { value: string; label: string }[] = [
      { value: String(experiences.length), label: experiences.length === 1 ? 'ROLE' : 'ROLES' },
    ];
    if (span) out.push({ value: `${span.start}–${span.end}`, label: 'SPAN' });
    return out;
  }, [experiences]);

  // Curated set (data-driven via FEATURED_CERTIFICATION_TITLES; easy to re-curate).
  const featuredCerts = useMemo(() => {
    const byTitle = new Map(certifications.map((c) => [c.title, c]));
    const picked = (FEATURED_CERTIFICATION_TITLES as string[])
      .map((title) => byTitle.get(title))
      .filter((c): c is Certification => Boolean(c));
    return picked.length ? picked : certifications.slice(0, FALLBACK_FEATURED);
  }, [certifications]);

  // "8 Kaggle · 7 FreeCodeCamp · 1 NVIDIA", derived so it never drifts from the data.
  const breakdown = useMemo(
    () => issuerBreakdown(certifications).map(({ issuer, count }) => `${count} ${issuer}`).join(' · '),
    [certifications],
  );

  const { open, openArchive, closeArchive } = useCredentialsRoute();

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef as RefObject<HTMLDivElement>, { once: true, margin: '-15% 0px' });

  // Per-element reveal; static under reduced motion / low-end devices. Headers stay visible.
  const item = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: reduce ? undefined : inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <Box ref={rootRef}>
      {/* ===================== EXPERIENCE ===================== */}
      <Box component="section" aria-labelledby={expHeadingId} sx={{ mb: { xs: 7, md: 9 } }}>
        <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
            Career
          </Typography>
          <Typography id={expHeadingId} variant="h2" component="h2" sx={{ color: 'text.primary' }}>
            Experience
          </Typography>
        </Box>

        {/* Career record — the signature dossier strip (glass + one-shot scan) */}
        <motion.div {...item(0.05)}>
          <LiquidGlass
            intensity="subtle"
            blur={12}
            radius={16}
            style={GLASS_TINT}
            sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1.25, md: 1.5 } }}
          >
            <DetectionFrame scan active={inView} sx={{ px: { xs: 1.5, md: 2 }, py: { xs: 1, md: 1.25 } }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: { xs: 1.5, md: 2 },
                }}
              >
                <Box component="span" sx={{ ...MONO_LABEL }}>
                  // career record
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: { xs: 1.75, md: 2.5 } }}>
                  {careerStats.map((s) => (
                    <Box key={s.label} sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.6 }}>
                      <Box
                        component="span"
                        sx={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          color: 'text.primary',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {s.value}
                      </Box>
                      <Box component="span" sx={{ ...MONO_LABEL, fontSize: '0.64rem', letterSpacing: '0.14em' }}>
                        {s.label}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </DetectionFrame>
          </LiquidGlass>
        </motion.div>

        {/* Timeline */}
        <Box
          component="ol"
          sx={{ listStyle: 'none', m: 0, mt: { xs: 2.5, md: 3 }, p: 0 }}
        >
          {experiences.map((experience, index) => (
            <Box
              key={`${experience.role}-${experience.company}`}
              component={motion.li}
              {...item(0.12 + index * 0.07)}
              sx={{
                position: 'relative',
                pl: { xs: 2.75, md: 3.5 },
                pb: index === experiences.length - 1 ? 0 : { xs: 2.25, md: 2.75 },
              }}
            >
              <TimelineEntry experience={experience} isLast={index === experiences.length - 1} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ===================== CERTIFICATIONS ===================== */}
      <Box component="section" aria-labelledby={certHeadingId}>
        <Box sx={{ mb: { xs: 3, md: 3.5 } }}>
          <Typography variant="overline" sx={{ color: 'primary.main', display: 'block', mb: 1 }}>
            Credentials
          </Typography>
          <Typography id={certHeadingId} variant="h3" component="h3" sx={{ color: 'text.primary' }}>
            Certifications
          </Typography>
        </Box>

        {/* Curated cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {featuredCerts.map((cert, index) => (
            <motion.div key={cert.title} {...item(0.1 + index * 0.07)} style={{ height: '100%' }}>
              <FeaturedCert cert={cert} />
            </motion.div>
          ))}
        </Box>

        {/* Credential record — echoes the Projects archive strip, carries the "view all" action */}
        <motion.div {...item(0.1 + featuredCerts.length * 0.07)}>
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
                    // credentials
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
                    {certifications.length} credentials, {breakdown}.
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
                  View all {certifications.length} credentials
                </Button>
              </Box>
            </DetectionFrame>
          </LiquidGlass>
        </motion.div>
      </Box>

      <CertificationsArchive open={open} onClose={closeArchive} certifications={certifications} />
    </Box>
  );
};

const ModernExperience = memo(ModernExperienceComponent);
ModernExperience.displayName = 'ModernExperience';

export default ModernExperience;
