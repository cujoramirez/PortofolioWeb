import React, { memo, useMemo, useCallback, type ElementType } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Container,
  useTheme,
  alpha,
  useMediaQuery,
  IconButton,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Work as WorkIcon,
  BusinessCenter as BusinessIcon,
  School as SchoolIcon,
  Star as StarIcon,
  OpenInNew as OpenIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as AwardIcon,
} from '@mui/icons-material';
import { EXPERIENCES } from '../constants';
import { useSystemProfile } from './useSystemProfile';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import ScrollFloat from './ScrollFloat';

type Experience = {
  year: string;
  role: string;
  company: string;
  description: string;
  technologies: string[];
  achievements?: string[];
  link?: string | null;
};

type EnhancedExperience = Experience & {
  id: number;
  icon: ElementType;
  color: 'primary' | 'secondary' | 'info' | 'success';
  achievements: string[];
  link: string | null;
};

const ModernExperienceComponent = () => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();

  const experienceData = useMemo<Experience[]>(() => EXPERIENCES as Experience[], []);

  const enhancedExperiences = useMemo<EnhancedExperience[]>(
    () =>
      experienceData.map((experience, index) => ({
        ...experience,
        id: index,
        icon: index % 3 === 0 ? WorkIcon : index % 3 === 1 ? BusinessIcon : SchoolIcon,
        color: (['primary', 'secondary', 'info', 'success'] as const)[index % 4],
        achievements: experience.achievements ?? [],
        link: experience.link ?? null,
        technologies: experience.technologies ?? [],
      })),
    [experienceData],
  );

  const shouldReduceMotion = performanceTier === 'low';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const isTabletViewport = useMediaQuery(theme.breakpoints.between('md', 'lg'), {
    noSsr: true,
  });
  const useScrollStack = !shouldReduceMotion && !isMobile;
  const scrollSectionMinHeight = useScrollStack
    ? `${Math.max(320, 200 + enhancedExperiences.length * 90)}vh`
    : 'auto';
  const stackPositionValue = isTabletViewport ? '7%' : '10%';
  const scaleEndPositionValue = isTabletViewport ? '4%' : '6%';

  const renderExperienceCard = useCallback(
    (experience: EnhancedExperience) => {
      const IconComponent = experience.icon;
      const accentColor = theme.palette[experience.color].main;
      const hasAchievements = experience.achievements.length > 0;

      return (
        <Card
          component="article"
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            backdropFilter: 'blur(18px) saturate(160%)',
            border: `1.5px solid ${alpha(theme.palette.divider, 0.18)}`,
            boxShadow: `0 16px 48px ${alpha(accentColor, 0.2)}, 0 6px 24px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: `
                radial-gradient(circle at 20% 20%, ${alpha(accentColor, 0.12)} 0%, transparent 55%),
                radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 55%)
              `,
              opacity: 0.85,
              pointerEvents: 'none',
            }}
          />

          <CardContent
            sx={{
              position: 'relative',
              zIndex: 1,
              p: { xs: 3, md: 4 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2.5, md: 3 },
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2.5,
                    display: 'grid',
                    placeItems: 'center',
                    background: `linear-gradient(135deg, ${alpha(accentColor, 0.18)}, ${alpha(accentColor, 0.05)})`,
                    border: `1.5px solid ${alpha(accentColor, 0.22)}`,
                    boxShadow: `0 12px 32px ${alpha(accentColor, 0.22)}`,
                  }}
                >
                  <IconComponent sx={{ fontSize: 28, color: accentColor }} />
                </Box>

                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: accentColor,
                      fontSize: '0.75rem',
                      display: 'block',
                    }}
                  >
                    {experience.year}
                  </Typography>
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.35rem', md: '1.6rem' },
                      color: theme.palette.text.primary,
                      lineHeight: 1.2,
                      mt: 0.5,
                    }}
                  >
                    {experience.role}
                  </Typography>
                </Box>
              </Stack>

              {experience.link && (
                <Tooltip title="View Details" placement="top">
                  <IconButton
                    component="a"
                    href={experience.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="medium"
                    sx={{
                      color: accentColor,
                      bgcolor: alpha(accentColor, 0.12),
                      border: `1.5px solid ${alpha(accentColor, 0.22)}`,
                      transition: 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      '&:hover': {
                        willChange: 'transform',
                        bgcolor: alpha(accentColor, 0.2),
                        borderColor: accentColor,
                        transform: 'translateZ(0) translateY(-2px) scale(1.02)',
                        boxShadow: `0 8px 18px ${alpha(accentColor, 0.32)}`,
                      },
                      '&:not(:hover)': {
                        willChange: 'auto',
                      },
                    }}
                  >
                    <OpenIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.25}>
              <TrendingUpIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: '1rem',
                }}
              >
                {experience.company}
              </Typography>
            </Stack>

            <Divider sx={{ borderColor: alpha(accentColor, 0.12) }} />

            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.75,
                fontSize: { xs: '0.95rem', md: '1rem' },
                color: theme.palette.text.primary,
                fontWeight: 400,
              }}
            >
              {experience.description}
            </Typography>

            {experience.technologies.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    color: theme.palette.text.secondary,
                    mb: 1.5,
                    display: 'block',
                    fontSize: '0.7rem',
                  }}
                >
                  Tech Stack
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {experience.technologies.map((tech) => (
                    <Chip
                      key={`${experience.id}-tech-${tech}`}
                      label={tech}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.12),
                        color: theme.palette.secondary.dark,
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {hasAchievements && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AwardIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.8rem',
                    }}
                  >
                    Key Achievements
                  </Typography>
                </Stack>
                <Stack spacing={1.25} sx={{ mt: 1.5 }}>
                  {experience.achievements.map((achievement, idx) => (
                    <Stack
                      key={`${experience.id}-achievement-${idx}`}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <StarIcon
                        sx={{
                          fontSize: 16,
                          color: theme.palette.warning.main,
                          mt: 0.3,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.6,
                          fontSize: '0.9rem',
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {achievement}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      );
    },
    [theme],
  );

  return (
    <Box
      component="section"
      id="experience"
      sx={{
        position: 'relative',
        py: { xs: 6, md: 10 },
        overflow: 'visible',
        minHeight: scrollSectionMinHeight,
        background: alpha(theme.palette.background.default, 0.98),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.3,
          background: `
            radial-gradient(circle at 15% 25%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 40%),
            radial-gradient(circle at 85% 75%, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 40%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box textAlign="center" mb={{ xs: 6, md: 10 }} sx={{ position: 'relative' }}>
          <Typography
            variant="overline"
            sx={{
              fontWeight: 700,
              letterSpacing: 2,
              color: theme.palette.primary.main,
              fontSize: '0.9rem',
              mb: 2,
              display: 'block',
            }}
          >
            Career Journey
          </Typography>
          <ScrollFloat
            as="h2"
            containerClassName="my-0"
            containerStyle={{ marginBottom: theme.spacing(2) }}
            textClassName="font-black tracking-tight"
            textStyle={{
              fontSize: 'clamp(2.8rem, 6.5vw, 4.6rem)',
              background: 'linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.1,
              display: 'inline-block',
            }}
          >
            Professional Experience
          </ScrollFloat>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: 700,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.25rem' },
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            A comprehensive journey through transformative roles, innovative projects, and measurable
            impact across diverse industries
          </Typography>

          <Box
            sx={{
              width: 80,
              height: 4,
              mx: 'auto',
              mt: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          />
        </Box>

        {useScrollStack ? (
          <ScrollStack
            className="experience-scroll-stack"
            itemDistance={640}
            itemStackDistance={28}
            baseScale={0.88}
            itemScale={0.025}
            blurAmount={0.5}
            stackPosition={stackPositionValue}
            scaleEndPosition={scaleEndPositionValue}
            rotationAmount={0}
            useWindowScroll={true}
          >
            {enhancedExperiences.map((experience) => (
              <ScrollStackItem key={experience.id}>{renderExperienceCard(experience)}</ScrollStackItem>
            ))}
          </ScrollStack>
        ) : (
          <Stack spacing={3.5}>
            {enhancedExperiences.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
              >
                {renderExperienceCard(experience)}
              </motion.div>
            ))}
          </Stack>
        )}

        <Box
          textAlign="center"
          mt={{ xs: 8, md: 12 }}
          sx={{
            opacity: 0.8,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: '0.9rem',
              fontStyle: 'italic',
            }}
          >
            {useScrollStack
              ? 'Scroll to explore each experience in detail'
              : 'Swipe through each role to explore the journey'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const ModernExperience = memo(ModernExperienceComponent);

ModernExperience.displayName = 'ModernExperience';

export default ModernExperience;

