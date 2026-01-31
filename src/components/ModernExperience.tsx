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

// Timeline connector line component - uses CSS variables to avoid useTheme overhead
const TimelineConnector = ({ isLast }: { isLast: boolean }) => {
  if (isLast) return null;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        left: { xs: 20, md: 28 },
        top: 56,
        bottom: -32,
        width: 2,
        background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 100%)',
      }}
    />
  );
};

// Timeline dot component - static colors for performance
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
      background: 'linear-gradient(135deg, #3b82f6 0%, rgba(59, 130, 246, 0.7) 100%)',
      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
      flexShrink: 0,
      zIndex: 2,
    }}
  >
    <WorkIcon sx={{ fontSize: { xs: 18, md: 24 }, color: 'white' }} />
    {/* Pulse ring */}
    <Box
      sx={{
        position: 'absolute',
        inset: -4,
        borderRadius: '50%',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        animation: 'pulse 2s ease-in-out infinite',
        animationDelay: `${index * 0.2}s`,
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
          '50%': { opacity: 0.6, transform: 'scale(1.1)' },
        },
      }}
    />
  </Box>
);

// Individual experience card
const ExperienceCard = ({ 
  experience, 
  index, 
  isLast 
}: { 
  experience: Experience; 
  index: number; 
  isLast: boolean;
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const hasAchievements = experience.achievements && experience.achievements.length > 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: shouldReduceMotion ? 0.3 : 0.7, 
        delay: shouldReduceMotion ? 0 : index * 0.15,
        ease: [0.22, 1, 0.36, 1]
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
              background: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                color: theme.palette.primary.main,
                fontSize: '0.75rem',
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
              background: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: alpha(theme.palette.background.paper, 0.8),
                borderColor: alpha(theme.palette.primary.main, 0.2),
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
                transform: shouldReduceMotion ? 'none' : 'translateY(-2px)',
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
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    color: theme.palette.text.primary,
                    lineHeight: 1.3,
                    mb: 0.5,
                  }}
                >
                  {experience.role}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
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
                lineHeight: 1.8,
                fontSize: { xs: '0.875rem', md: '0.95rem' },
                color: theme.palette.text.secondary,
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
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: theme.palette.text.secondary,
                    fontSize: '0.65rem',
                    mb: 1.5,
                    display: 'block',
                  }}
                >
                  Technologies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {experience.technologies.map((tech, techIdx) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: shouldReduceMotion ? 0 : (index * 0.15) + (techIdx * 0.03),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Chip
                        label={tech}
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.secondary.main, 0.08),
                          color: theme.palette.secondary.main,
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.secondary.main, 0.12),
                            transform: 'translateY(-1px)',
                          },
                        }}
                      />
                    </motion.div>
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
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: theme.palette.text.secondary,
                    fontSize: '0.65rem',
                    mb: 1.5,
                    display: 'block',
                  }}
                >
                  Key Achievements
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 0, listStyle: 'none' }}>
                  {experience.achievements!.map((achievement, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: shouldReduceMotion ? 0 : (index * 0.15) + (idx * 0.08),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Box
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
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                            mt: 0.2,
                            flexShrink: 0,
                          }}
                        >
                          <CheckIcon
                            sx={{
                              fontSize: 12,
                              color: theme.palette.success.main,
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.85rem',
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                          }}
                        >
                          {achievement}
                        </Typography>
                      </Box>
                    </motion.div>
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
      {/* Subtle background gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`,
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
                fontWeight: 600,
                letterSpacing: 3,
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
                mb: 2,
                display: 'block',
              }}
            >
              Career Journey
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
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
              variant="h6"
              sx={{
                fontWeight: 400,
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.6,
              }}
            >
              Building impactful solutions through research, development, and innovation
            </Typography>

            {/* Decorative line */}
            <Box
              sx={{
                width: 60,
                height: 3,
                mx: 'auto',
                mt: 4,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            />
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

