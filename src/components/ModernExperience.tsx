import { memo, useMemo, useState, useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Link as MuiLink,
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Verified as VerifiedIcon,
  OpenInNew as OpenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { EXPERIENCES, CERTIFICATIONS } from '../constants';
import OptimizedImage from './OptimizedImage';

// Adaptive color tokens (resolve per light/dark scheme via MUI CSS variables).
// Using var(--app-palette-*) directly keeps these in sync with the active scheme;
// theme.palette.* would lock to the default (dark) scheme and break light mode.
const C = {
  textPrimary: 'var(--app-palette-text-primary)',
  textSecondary: 'var(--app-palette-text-secondary)',
  primary: 'var(--app-palette-primary-main)',
  success: 'var(--app-palette-success-main)',
  surface: 'var(--app-palette-bg-elevated)',
} as const;
const softPrimary = (pct: number) =>
  `color-mix(in srgb, var(--app-palette-primary-main) ${pct}%, transparent)`;
const softDivider = (pct: number) =>
  `color-mix(in srgb, var(--app-palette-divider) ${pct}%, transparent)`;

type Experience = {
  year: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  achievements?: string[];
};

type Certification = {
  title: string;
  issuer: string;
  link: string;
  image: string;
};

// ---------------------------------------------------------------------------
// Shared eyebrow / overline
// ---------------------------------------------------------------------------
const Eyebrow = ({ label }: { label: string }) => (
  <Typography
    variant="overline"
    sx={{
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      letterSpacing: 3,
      color: C.primary,
      display: 'block',
      mb: 1,
    }}
  >
    {label}
  </Typography>
);

// ---------------------------------------------------------------------------
// Experience timeline entry (compact, with progressive disclosure)
// ---------------------------------------------------------------------------
const TimelineEntry = ({
  experience,
  isLast,
}: {
  experience: Experience;
  isLast: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  const hasAchievements = !!experience.achievements?.length;

  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        listStyle: 'none',
        pl: { xs: 3.5, md: 4.5 },
        pb: isLast ? 0 : { xs: 4, md: 5 },
      }}
    >
      {/* Rail */}
      {!isLast && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: { xs: 5, md: 6 },
            top: 18,
            bottom: 0,
            width: '1px',
            bgcolor: softDivider(50),
          }}
        />
      )}
      {/* Dot */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: { xs: 0, md: 0 },
          top: 6,
          width: { xs: 11, md: 13 },
          height: { xs: 11, md: 13 },
          borderRadius: '50%',
          bgcolor: C.primary,
          boxShadow: `0 0 0 4px ${softPrimary(12)}`,
        }}
      />

      {/* Year */}
      <Typography
        variant="overline"
        sx={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          letterSpacing: 1,
          color: C.textSecondary,
          display: 'block',
          lineHeight: 1.4,
        }}
      >
        {experience.year}
      </Typography>

      {/* Role */}
      <Typography
        variant="subtitle1"
        component="h4"
        sx={{ fontWeight: 700, color: C.textPrimary, lineHeight: 1.3 }}
      >
        {experience.role}
      </Typography>

      {/* Company */}
      <Typography variant="body2" sx={{ color: C.textSecondary, mb: 1 }}>
        {experience.company}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: C.textSecondary,
          lineHeight: 1.65,
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
      {experience.technologies?.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: expanded && hasAchievements ? 1.5 : 0 }}>
          {experience.technologies.map((tech) => (
            <Chip
              key={tech}
              label={tech}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                bgcolor: softPrimary(8),
                color: C.primary,
                border: `1px solid ${softPrimary(16)}`,
              }}
            />
          ))}
        </Box>
      )}

      {/* Achievements (revealed) */}
      {hasAchievements && expanded && (
        <Box
          id={detailsId}
          component="ul"
          sx={{ m: 0, mt: 0.5, p: 0, listStyle: 'none' }}
        >
          {experience.achievements!.map((achievement) => (
            <Box
              key={achievement}
              component="li"
              sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}
            >
              <CheckIcon sx={{ fontSize: 16, mt: '2px', color: C.success, flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: C.textSecondary, lineHeight: 1.55 }}>
                {achievement}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Show more / less */}
      {hasAchievements && (
        <Button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          size="small"
          variant="text"
          sx={{
            mt: 1,
            px: 0,
            minWidth: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: 0.5,
            color: C.primary,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          {expanded ? 'Show less' : 'Show details'}
        </Button>
      )}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Certification card (compact pill)
// ---------------------------------------------------------------------------
const CertCard = ({
  cert,
  onOpen,
}: {
  cert: Certification;
  onOpen: (cert: Certification) => void;
}) => {
  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={`View ${cert.title} certificate from ${cert.issuer}`}
      onClick={() => onOpen(cert)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(cert);
        }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        p: 1.75,
        height: '100%',
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: C.surface,
        border: `1px solid ${softDivider(60)}`,
        transition: 'border-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
        '&:hover, &:focus-visible': {
          borderColor: softPrimary(40),
          bgcolor: softPrimary(4),
        },
        '&:focus-visible': {
          outline: `2px solid ${C.primary}`,
          outlineOffset: 2,
        },
      }}
    >
      <Chip
        icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
        label={cert.issuer}
        size="small"
        sx={{
          alignSelf: 'flex-start',
          height: 22,
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          letterSpacing: 0.3,
          bgcolor: softPrimary(8),
          color: C.primary,
          '& .MuiChip-icon': { color: C.primary, ml: '6px' },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: C.textPrimary,
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {cert.title}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const INITIAL_CERT_COUNT = 8;

const ModernExperienceComponent = () => {
  const prefersReducedMotion = useReducedMotion();
  void prefersReducedMotion; // reveal animations intentionally omitted for density

  const experiences = EXPERIENCES as Experience[];
  const certifications = CERTIFICATIONS as Certification[];

  const [showAllCerts, setShowAllCerts] = useState(false);
  const [selected, setSelected] = useState<Certification | null>(null);
  const dialogTitleId = useId();

  const issuerCounts = useMemo(() => {
    return certifications.reduce<Record<string, number>>((acc, cert) => {
      acc[cert.issuer] = (acc[cert.issuer] || 0) + 1;
      return acc;
    }, {});
  }, [certifications]);

  const visibleCerts = showAllCerts
    ? certifications
    : certifications.slice(0, INITIAL_CERT_COUNT);

  const summary = useMemo(
    () =>
      Object.entries(issuerCounts)
        .map(([issuer, count]) => `${count} ${issuer}`)
        .join(' · '),
    [issuerCounts],
  );

  return (
    <Box>
      {/* ===================== (A) EXPERIENCE ===================== */}
      <Box component="section" aria-labelledby="experience-heading" sx={{ mb: { xs: 8, md: 10 } }}>
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Eyebrow label="Career Journey" />
          <Typography
            id="experience-heading"
            variant="h2"
            component="h2"
            sx={{ fontWeight: 700, color: C.textPrimary }}
          >
            Experience
          </Typography>
        </Box>

        <Box component="ol" sx={{ m: 0, p: 0, maxWidth: 760 }}>
          {experiences.map((experience, index) => (
            <TimelineEntry
              key={`${experience.role}-${experience.company}`}
              experience={experience}
              isLast={index === experiences.length - 1}
            />
          ))}
        </Box>
      </Box>

      {/* ===================== (B) CERTIFICATIONS ===================== */}
      <Box component="section" aria-labelledby="certifications-heading">
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Eyebrow label="Professional Development" />
          <Typography
            id="certifications-heading"
            variant="h3"
            component="h3"
            sx={{ fontWeight: 700, color: C.textPrimary, mb: 1 }}
          >
            Certifications
          </Typography>
          <Typography variant="body2" sx={{ color: C.textSecondary }}>
            {certifications.length} credentials — {summary}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {visibleCerts.map((cert) => (
            <CertCard key={cert.title} cert={cert} onOpen={setSelected} />
          ))}
        </Box>

        {certifications.length > INITIAL_CERT_COUNT && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              onClick={() => setShowAllCerts((v) => !v)}
              aria-expanded={showAllCerts}
              variant="outlined"
              size="small"
              sx={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                borderColor: softPrimary(40),
                color: C.primary,
              }}
            >
              {showAllCerts ? 'Show less' : `Show all ${certifications.length}`}
            </Button>
          </Box>
        )}
      </Box>

      {/* ===================== CERT DETAIL MODAL ===================== */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
        aria-labelledby={dialogTitleId}
      >
        {selected && (
          <>
            <DialogTitle
              id={dialogTitleId}
              sx={{ pr: 6, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 15 }} />}
                label={selected.issuer}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  height: 24,
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  bgcolor: softPrimary(8),
                  color: C.primary,
                  '& .MuiChip-icon': { color: C.primary },
                }}
              />
              <Typography variant="h6" component="span" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                {selected.title}
              </Typography>
            </DialogTitle>

            <IconButton
              aria-label="Close"
              onClick={() => setSelected(null)}
              sx={{ position: 'absolute', top: 12, right: 12, color: C.textSecondary }}
            >
              <CloseIcon />
            </IconButton>

            <DialogContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${softDivider(60)}`,
                  mb: 2,
                }}
              >
                <OptimizedImage
                  src={selected.image}
                  alt={`${selected.title} certificate issued by ${selected.issuer}`}
                  objectFit="contain"
                  width="100%"
                />
              </Box>
              <Button
                component={MuiLink}
                href={selected.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                fullWidth
                endIcon={<OpenIcon />}
                sx={{ fontWeight: 600, textTransform: 'none' }}
              >
                View credential
              </Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

const ModernExperience = memo(ModernExperienceComponent);
ModernExperience.displayName = 'ModernExperience';

export default ModernExperience;
