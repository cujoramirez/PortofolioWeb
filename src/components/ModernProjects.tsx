import {
  memo,
  useState,
  useRef,
  useMemo,
  useCallback,
  type ElementType,
  type FC,
  type ReactElement,
  type RefObject,
} from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Container,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Web as WebIcon,
  Psychology as AIIcon,
  School as EducationIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  CameraAlt as VisionIcon,
  ShoppingCart as EcommerceIcon,
  MusicNote as MusicIcon,
  Business as BusinessIcon,
  Science as ScienceIcon,
} from '@mui/icons-material';
import type { Theme } from '@mui/material/styles';
import { PROJECTS } from '../constants';
import { useSystemProfile } from './useSystemProfile';
import MagicBento, { type MagicBentoItem } from './MagicBento';
import ScrollFloat from './ScrollFloat';

const toRgbString = (color: string, fallback: string = '132, 0, 255'): string => {
  const trimmed = color.trim();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3) {
      const [r, g, b] = hex.split('').map((char) => parseInt(char.repeat(2), 16));
      if ([r, g, b].every((channel) => Number.isFinite(channel))) {
        return `${r}, ${g}, ${b}`;
      }
    }

    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every((channel) => Number.isFinite(channel))) {
        return `${r}, ${g}, ${b}`;
      }
    }
  }

  const rgbMatch = trimmed.match(/rgba?\(([^)]+)\)/i);
  if (rgbMatch && rgbMatch[1]) {
    const parts = rgbMatch[1]
      .split(',')
      .slice(0, 3)
      .map((segment) => Number.parseFloat(segment.trim()))
      .filter((value) => Number.isFinite(value));

    if (parts.length === 3) {
      const [r, g, b] = parts.map((value) => Math.round(value));
      return `${r}, ${g}, ${b}`;
    }
  }

  return fallback;
};

const PARTICLE_COUNT = 6;

export type Project = {
  id?: string | number | null;
  title: string;
  image: string;
  description: string;
  technologies?: string[];
  demo: string | null;
  github: string | null;
  links: string[];
};

type OptimizedParticleProps = {
  index: number;
  theme: Theme;
};

const OptimizedParticle = memo(({ index, theme }: OptimizedParticleProps) => (
  <Box
    sx={{
      position: 'absolute',
      width: 3,
      height: 3,
      borderRadius: '50%',
      background: theme.palette.primary.main,
      left: `${(index * 37) % 100}%`,
      top: `${(index * 23) % 100}%`,
      opacity: 0.4,
      animation: `floatParticle ${6 + (index % 4)}s ease-in-out infinite ${index * 0.5}s`,
      '@keyframes floatParticle': {
        '0%, 100%': { transform: 'translate(0, 0) scale(0.8)', opacity: 0.2 },
        '50%': { transform: 'translate(20px, -20px) scale(1)', opacity: 0.6 },
      },
    }}
  />
));

OptimizedParticle.displayName = 'OptimizedParticle';

const getProjectIcon = (title: string, technologies?: string[]): ElementType => {
  const titleLower = title.toLowerCase();
  const techString = technologies?.join(' ').toLowerCase() ?? '';

  if (
    titleLower.includes('ai') ||
    titleLower.includes('detection') ||
    titleLower.includes('cnn') ||
    techString.includes('tensorflow') ||
    techString.includes('pytorch') ||
    titleLower.includes('diabetic')
  ) {
    return AIIcon;
  }
  if (titleLower.includes('facial') || titleLower.includes('recognition') || titleLower.includes('security')) {
    return SecurityIcon;
  }
  if (titleLower.includes('web') || titleLower.includes('website') || titleLower.includes('tailor')) {
    return WebIcon;
  }
  if (titleLower.includes('music') || titleLower.includes('aria')) {
    return MusicIcon;
  }
  if (titleLower.includes('learning') || titleLower.includes('education') || titleLower.includes('tutor')) {
    return EducationIcon;
  }
  if (titleLower.includes('research') || titleLower.includes('vision')) {
    return ScienceIcon;
  }
  if (titleLower.includes('shop') || titleLower.includes('ecommerce') || titleLower.includes('card')) {
    return EcommerceIcon;
  }
  if (titleLower.includes('waste') || titleLower.includes('echo')) {
    return VisionIcon;
  }
  if (titleLower.includes('monitoring') || titleLower.includes('bearing') || titleLower.includes('factory')) {
    return AnalyticsIcon;
  }
  if (titleLower.includes('platform') || titleLower.includes('cs')) {
    return BusinessIcon;
  }

  return CodeIcon;
};


const ModernProjectsComponent: FC = () => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(containerRef as RefObject<Element>, { once: true, amount: 0.1 });

  const shouldReduceMotion = performanceTier === 'low' || isMobile;

  const handleProjectClick = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const memoizedProjects = useMemo<Project[]>(() => PROJECTS as Project[], []);

  const prioritizedProjects = useMemo<Project[]>(() => {
    const targetTitle = 'Deep Learning research on Computer Vision';
    const projects = [...memoizedProjects];
    const targetIndex = projects.findIndex((project) => project.title === targetTitle);

    if (targetIndex > 0) {
      const [flagshipProject] = projects.splice(targetIndex, 1);
      projects.unshift(flagshipProject);
    }

    return projects;
  }, [memoizedProjects]);

  const premiumMotionEnabled = useMemo(
    () => performanceTier === 'high' && !shouldReduceMotion && !isMobile,
    [performanceTier, shouldReduceMotion, isMobile],
  );

  const glowColor = useMemo(
    () => toRgbString(theme.palette.primary.main || '#8466ff'),
    [theme.palette.primary.main],
  );

  const accentPalette = useMemo(
    () => {
      const { primary, secondary, info, warning, success } = theme.palette;
      return [
        primary.main,
        secondary.main,
        info?.main ?? alpha(primary.main, 0.9),
        warning?.main ?? alpha(secondary.main, 0.9),
        success?.main ?? alpha(primary.main, 0.7),
      ];
    },
    [theme],
  );

  const bentoItems = useMemo<MagicBentoItem[]>(() => {
    return prioritizedProjects.map((project, index) => {
      const accentColor = accentPalette[index % accentPalette.length];
      const IconComponent = getProjectIcon(project.title, project.technologies);
      const variant: MagicBentoItem['variant'] = 'standard';

      const badge = index === 0 ? 'Flagship Project' : undefined;

      return {
        id: (project.id ?? project.title) || index,
        title: project.title,
        subtitle: project.technologies?.[0] ?? 'Innovation Focus',
        description: project.description,
        icon: IconComponent,
        accentColor,
        gradient: `linear-gradient(135deg, ${alpha(accentColor, 0.18)}, ${alpha(theme.palette.background.paper, 0.92)})`,
        chips: project.technologies ?? [],
        variant,
        badge,
        badgeColor: badge ? accentColor : undefined,
        data: project,
      } satisfies MagicBentoItem;
    });
  }, [accentPalette, prioritizedProjects, theme.palette.background.paper]);

  const decorativeParticles = useMemo<ReactElement[]>(() => {
    if (shouldReduceMotion) {
      return [];
    }

    return Array.from({ length: PARTICLE_COUNT }, (_, particleIndex) => (
      <OptimizedParticle key={particleIndex} index={particleIndex} theme={theme} />
    ));
  }, [shouldReduceMotion, theme]);

  return (
    <Box
      component="section"
      id="projects"
      ref={containerRef}
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.01)} 50%, ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      {decorativeParticles}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {isInView && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <ScrollFloat
                as="h2"
                animationDuration={1}
                ease="back.inOut(2)"
                scrollStart="center bottom+=50%"
                scrollEnd="bottom bottom-=40%"
                stagger={0.03}
                containerClassName="my-0"
                textClassName="font-extrabold tracking-tight"
                containerStyle={{ marginBottom: theme.spacing(1.5) }}
                textStyle={{
                  fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
                  background: 'linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  lineHeight: 1.2,
                  display: 'inline-block',
                }}
              >
                Featured Projects
              </ScrollFloat>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 500, mx: 'auto', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6 }}
              >
                Innovative solutions showcasing technical expertise
              </Typography>
            </Box>
          </motion.div>
        )}

        <Box
          display="flex"
          justifyContent="center"
          mb={{ xs: 5, md: 7 }}
          px={{ xs: 2, md: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <MagicBento
              items={bentoItems}
              onItemClick={(item: MagicBentoItem) => {
                const project = (item.data ?? null) as Project | null;
                if (project) {
                  handleProjectClick(project);
                }
              }}
              textAutoHide
              enableStars={premiumMotionEnabled}
              enableSpotlight={premiumMotionEnabled}
              enableBorderGlow
              enableTilt={premiumMotionEnabled}
              enableMagnetism={premiumMotionEnabled}
              clickEffect={premiumMotionEnabled}
              disableAnimations={!premiumMotionEnabled}
              spotlightRadius={premiumMotionEnabled ? 340 : 220}
              particleCount={premiumMotionEnabled ? 12 : 6}
              glowColor={glowColor}
            />
          </motion.div>
        </Box>

        <Dialog
          open={Boolean(selectedProject)}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            },
          }}
        >
          {selectedProject && (
            <>
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 1,
                }}
              >
                <Typography variant="h5" component="div" fontWeight={600}>
                  {selectedProject.title}
                </Typography>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  {(() => {
                    const SelectedIcon = getProjectIcon(selectedProject.title, selectedProject.technologies);
                    return <SelectedIcon sx={{ fontSize: 64, color: theme.palette.primary.main }} />;
                  })()}
                </Box>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                  {selectedProject.description}
                </Typography>

                <Box mb={3}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Technologies Used
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedProject.technologies?.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        variant="filled"
                        sx={{
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box display="flex" gap={2} flexWrap="wrap">
                  {selectedProject.github && (
                    <Button
                      variant="outlined"
                      startIcon={<GitHubIcon />}
                      component="a"
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      View Code
                    </Button>
                  )}

                  {selectedProject.demo && (
                    <Button
                      variant="contained"
                      startIcon={<LaunchIcon />}
                      component="a"
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        '&:hover': {
                          backgroundColor: theme.palette.secondary.dark,
                        },
                      }}
                    >
                      Live Demo
                    </Button>
                  )}
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

ModernProjectsComponent.displayName = 'ModernProjectsComponent';

const ModernProjects = memo(ModernProjectsComponent);

ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;
