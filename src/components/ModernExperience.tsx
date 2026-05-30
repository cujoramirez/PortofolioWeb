import { memo, useRef, type RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Container,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Work as WorkIcon,
  OpenInNew as OpenIcon,
  CheckCircleOutline as CheckIcon,
} from '@mui/icons-material';
import { EXPERIENCES } from '../constants';
import { useSystemProfile } from './useSystemProfile';

type Experience = {
  year: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  achievements?: string[];
  link?: string | null;
};

// Timeline connector line
const TimelineConnector = ({ isLast }: { isLast: boolean }) => {
  if (isLast) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        left: { xs: 20, md: 28 },
        top: 56,
        bottom: -32,
        width: 1,
        background: `linear-gradient(180deg, ${alpha('#3b82f6', 0.3)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
      }}
    />
  );
};

// Timeline dot
const TimelineDot = ({ index }: { index: number }) => (
  <Box
    sx={{
      position: 'relative',
      width: { xs: 40, md: 56 },
      height: { xs: 40, md: 56 },
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${alpha('#3b82f6', 0.15)} 0%, ${alpha('#3b82f6', 0.05)} 100%)`,
      border: `1px solid ${alpha('#3b82f6', 0.2)}`,
      backdropFilter: 'blur(8px)',
      flexShrink: 0,
      zIndex: 2,
      transition: 'all 0.3s ease',
    }}
  >
    <WorkIcon sx={{ fontSize: { xs: 16, md: 22 }, color: alpha('#3b82f6', 0.8) }} />
    {/* Subtle pulse ring */}
    <Box
      sx={{
        position: 'absolute',
        inset: -3,
        borderRadius: '50%',
        border: `1px solid ${alpha('#3b82f6', 0.15)}`,
        animation: 'subtlePulse 3s ease-in-out infinite',
        animationDelay: `${index * 0.3}s`,
        '@keyframes subtlePulse': {
          '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.08)' },
        },
      }}
    />
  </Box>
);

// Experience card
const ExperienceCard = ({
  experience,
  index,
  isLast,
}: {
  experience: Experience;
  index: number;
  isLast: boolean;
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as RefObject<Element>, { once: true, margin: '-80px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const hasAchievements = experience.achievements && experience.achievements.length > 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30, filter: shouldReduceMotion ? 'none' : 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.6,
        delay: shouldReduceMotion ? 0 : index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ position: 'relative' }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 4 },
          pb: { xs: 4, md: 6 },
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Timeline column */}
        <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TimelineDot index={index} />
          <TimelineConnector isLast={isLast} />
        </Box>

        {/* Content column */}
        <Box sx={{ flex: 1, minWidth: 0, pt: { xs: 0, md: 0.5 } }}>
          {/* Year badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 2,
              py: 0.5,
              mb: 2,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: 0.5,
                color: alpha(theme.palette.primary.main, 0.8),
                fontSize: '0.72rem',
              }}
            >
              {experience.year}
            </Typography>
          </Box>

          {/* Card */}
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: alpha(theme.palette.background.paper, 0.5),
              border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
              backdropFilter: 'blur(12px)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3px',
                height: '0%',
                background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '0 2px 2px 0',
                transition: 'height 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
              },
              '&:hover': {
                background: alpha(theme.palette.background.paper, 0.7),
                borderColor: alpha(theme.palette.primary.main, 0.12),
                boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.12)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.05)}`,
                transform: shouldReduceMotion ? 'none' : 'translateY(-3px)',
                '&::before': { height: '100%' },
              },
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.15rem', md: '1.35rem' },
                    color: theme.palette.text.primary,
                    lineHeight: 1.3,
                    mb: 0.5,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {experience.role}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: alpha(theme.palette.text.secondary, 0.7),
                    fontSize: { xs: '0.88rem', md: '0.95rem' },
                  }}
                >
                  {experience.company}
                </Typography>
              </Box>

              {experience.link && (
                <Tooltip title="View Details" placement="top">
                  <IconButton
                    component="a"
                    href={experience.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      color: alpha(theme.palette.primary.main, 0.6),
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.main,
                        transform: 'rotate(-12deg)',
                      },
                    }}
                  >
                    <OpenIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                lineHeight: 1.85,
                fontSize: { xs: '0.875rem', md: '0.92rem' },
                color: alpha(theme.palette.text.secondary, 0.75),
                mb: 3,
              }}
            >
              {experience.description}
            </Typography>

            {/* Technologies */}
            {experience.technologies && experience.technologies.length > 0 && (
              <Box sx={{ mb: hasAchievements ? 3 : 0 }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 2,
                    color: alpha(theme.palette.text.secondary, 0.45),
                    fontSize: '0.65rem',
                    mb: 1.5,
                    display: 'block',
                  }}
                >
                  Technologies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {experience.technologies.map((tech) => (
                    <Chip
                      key={tech}
                      label={tech}
                      size="small"
                      sx={{
                        height: 26,
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        fontFamily: '"JetBrains Mono", monospace',
                        bgcolor: alpha(theme.palette.secondary.main, 0.06),
                        color: alpha(theme.palette.secondary.main, 0.8),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          transform: 'translateY(-1px)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Achievements */}
            {hasAchievements && (
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 500,
                    letterSpacing: 2,
                    color: alpha(theme.palette.text.secondary, 0.45),
                    fontSize: '0.65rem',
                    mb: 1.5,
                    display: 'block',
                  }}
                >
                  Key Achievements
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {experience.achievements!.map((achievement, idx) => (
                    <Box
                      key={idx}
                      component="li"
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        mb: 1.5,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          mt: 0.2,
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 11, color: alpha(theme.palette.success.main, 0.7) }} />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: '0.85rem',
                          color: alpha(theme.palette.text.secondary, 0.7),
                          lineHeight: 1.65,
                        }}
                      >
                        {achievement}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

const ModernExperienceComponent = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const experienceData = EXPERIENCES as Experience[];

  return (
    <Box
      component="section"
      id="experience"
      ref={sectionRef}
      sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      {/* Subtle ambient background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.015)} 0%, transparent 100%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 } }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 500,
                letterSpacing: 4,
                color: theme.palette.primary.main,
                mb: 2.5,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                '&::before, &::after': {
                  content: '""',
                  display: 'inline-block',
                  width: 24,
                  height: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.3),
                },
              }}
            >
              Career Journey
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.25rem', md: '3rem' },
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 2,
              }}
            >
              Professional Experience
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 400,
                color: alpha(theme.palette.text.secondary, 0.6),
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.7,
              }}
            >
              Building impactful solutions through research, development, and innovation
            </Typography>
          </Box>
        </motion.div>

        {/* Timeline */}
        <Box sx={{ maxWidth: 800, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {experienceData.map((experience, index) => (
            <ExperienceCard
              key={`${experience.role}-${index}`}
              experience={experience}
              index={index}
              isLast={index === experienceData.length - 1}
            />
          ))}
        </Box>
      </Container>
    </Box>
  );
};

const ModernExperience = memo(ModernExperienceComponent);
ModernExperience.displayName = 'ModernExperience';

export default ModernExperience;
