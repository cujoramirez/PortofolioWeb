import React, { memo, useState, useRef, useMemo, useCallback, RefObject } from 'react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Container,
  IconButton,
  Dialog,
  DialogContent,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Psychology as AIIcon,
  Science as ScienceIcon,
  Web as WebIcon,
  Security as SecurityIcon,
  CameraAlt as VisionIcon,
} from '@mui/icons-material';
import type { ElementType } from 'react';
import { PROJECTS } from '../constants';
import { useSystemProfile } from './useSystemProfile';

interface Project {
  title: string;
  image: string;
  description: string;
  technologies?: string[];
  demo: string | null;
  github: string | null;
  links: string[];
}

const getProjectIcon = (title: string, technologies?: string[]): ElementType => {
  const titleLower = title.toLowerCase();
  const techString = technologies?.join(' ').toLowerCase() ?? '';

  if (titleLower.includes('detection') || titleLower.includes('cnn') || techString.includes('tensorflow') || techString.includes('pytorch') || titleLower.includes('diabetic') || titleLower.includes('calm')) return AIIcon;
  if (titleLower.includes('facial') || titleLower.includes('recognition') || titleLower.includes('security')) return SecurityIcon;
  if (titleLower.includes('web') || titleLower.includes('website') || titleLower.includes('tailor')) return WebIcon;
  if (titleLower.includes('research') || titleLower.includes('vision') || titleLower.includes('ensemble')) return ScienceIcon;
  if (titleLower.includes('waste') || titleLower.includes('retinopathy')) return VisionIcon;
  return CodeIcon;
};

// 3D tilt card wrapper
const TiltCard = ({ children, disabled }: { children: React.ReactNode; disabled: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (disabled) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        height: '100%',
      }}
    >
      {children}
    </motion.div>
  );
};

// Project Card
const ProjectCard = memo(({
  project,
  index,
  onSelect,
}: {
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef as RefObject<Element>, { once: true, margin: '-50px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const IconComponent = getProjectIcon(project.title, project.technologies);
  const isFeatured = index === 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24, filter: shouldReduceMotion ? 'none' : 'blur(6px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ height: '100%' }}
    >
      <TiltCard disabled={shouldReduceMotion || isMobile}>
        <Box
          onClick={() => onSelect(project)}
          sx={{
            position: 'relative',
            height: '100%',
            p: { xs: 2.5, md: 3 },
            borderRadius: 3,
            background: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '0%',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
              transition: 'width 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
            },
            '&:hover': {
              transform: isMobile ? 'none' : 'translateY(-6px)',
              boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`,
              borderColor: alpha(theme.palette.primary.main, 0.15),
              background: alpha(theme.palette.background.paper, 0.7),
              '&::before': { width: '60%' },
              '& .project-icon': {
                transform: 'scale(1.12) rotate(5deg)',
                color: theme.palette.primary.main,
                background: alpha(theme.palette.primary.main, 0.12),
              },
            },
          }}
        >
          {/* Featured Badge */}
          {isFeatured && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                px: 1.5,
                py: 0.4,
                borderRadius: 1.5,
                background: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.62rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  color: alpha(theme.palette.primary.main, 0.85),
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                Featured
              </Typography>
            </Box>
          )}

          {/* Icon */}
          <Box
            className="project-icon"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.06),
              color: alpha(theme.palette.text.secondary, 0.6),
              mb: 2.5,
              transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            <IconComponent sx={{ fontSize: 24 }} />
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.98rem', md: '1.05rem' },
              color: theme.palette.text.primary,
              mb: 1.5,
              lineHeight: 1.35,
              pr: isFeatured ? 8 : 0,
              letterSpacing: '-0.01em',
            }}
          >
            {project.title}
          </Typography>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: alpha(theme.palette.text.primary, 0.55),
              fontSize: '0.84rem',
              lineHeight: 1.65,
              mb: 2.5,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </Typography>

          {/* Technologies */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 'auto' }}>
            {project.technologies?.slice(0, 4).map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  background: alpha(theme.palette.text.primary, 0.03),
                  color: alpha(theme.palette.text.secondary, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                }}
              />
            ))}
            {(project.technologies?.length ?? 0) > 4 && (
              <Chip
                label={`+${(project.technologies?.length ?? 0) - 4}`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.68rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  background: alpha(theme.palette.primary.main, 0.06),
                  color: alpha(theme.palette.primary.main, 0.7),
                  border: 'none',
                }}
              />
            )}
          </Box>

          {/* Links indicator */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mt: 2,
              pt: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.04)}`,
            }}
          >
            {project.github && <GitHubIcon sx={{ fontSize: 15, color: alpha(theme.palette.text.secondary, 0.35) }} />}
            {project.demo && <OpenInNewIcon sx={{ fontSize: 15, color: alpha(theme.palette.text.secondary, 0.35) }} />}
            <Typography
              variant="caption"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.4),
                fontSize: '0.72rem',
                fontFamily: '"JetBrains Mono", monospace',
                ml: 'auto',
                transition: 'color 0.25s ease',
              }}
            >
              View details →
            </Typography>
          </Box>
        </Box>
      </TiltCard>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

// Project Detail Modal
const ProjectModal = memo(({
  project,
  open,
  onClose,
}: {
  project: Project | null;
  open: boolean;
  onClose: () => void;
}) => {
  const theme = useTheme();
  if (!project) return null;
  const IconComponent = getProjectIcon(project.title, project.technologies);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: alpha(theme.palette.text.secondary, 0.5),
            transition: 'all 0.25s ease',
            '&:hover': { color: theme.palette.text.primary, transform: 'rotate(90deg)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 2.5,
            background: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            mb: 3,
          }}
        >
          <IconComponent sx={{ fontSize: 28 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 2, lineHeight: 1.3, letterSpacing: '-0.01em' }}>
          {project.title}
        </Typography>

        <Typography variant="body1" sx={{ color: alpha(theme.palette.text.primary, 0.7), lineHeight: 1.75, mb: 3, fontSize: '0.95rem' }}>
          {project.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ fontWeight: 500, color: alpha(theme.palette.text.secondary, 0.5), mb: 1.5, display: 'block', letterSpacing: 2 }}>
            Technologies
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {project.technologies?.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  fontSize: '0.72rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  background: alpha(theme.palette.primary.main, 0.06),
                  color: alpha(theme.palette.primary.main, 0.85),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {project.github && (
            <Box
              component="a"
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                background: alpha(theme.palette.text.primary, 0.04),
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                textDecoration: 'none',
                color: alpha(theme.palette.text.primary, 0.8),
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': { background: alpha(theme.palette.text.primary, 0.08), transform: 'translateY(-1px)' },
              }}
            >
              <GitHubIcon sx={{ fontSize: 18 }} />
              View Code
            </Box>
          )}
          {project.demo && (
            <Box
              component="a"
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                textDecoration: 'none',
                color: theme.palette.primary.contrastText,
                fontSize: '0.85rem',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': { boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`, transform: 'translateY(-1px)' },
              }}
            >
              <OpenInNewIcon sx={{ fontSize: 18 }} />
              Live Demo
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
});

ProjectModal.displayName = 'ProjectModal';

// Main Component
const ModernProjectsComponent = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projects = useMemo<Project[]>(() => PROJECTS as Project[], []);

  const handleProjectSelect = useCallback((project: Project) => setSelectedProject(project), []);
  const handleCloseModal = useCallback(() => setSelectedProject(null), []);

  return (
    <Box
      component="section"
      id="projects"
      ref={sectionRef}
      sx={{
        position: 'relative',
        py: { xs: 10, md: 16 },
        background: theme.palette.background.default,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(0deg, ${alpha(theme.palette.primary.main, 0.012)} 0%, transparent 100%)`,
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
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
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
              Portfolio
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
              Selected Projects
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha(theme.palette.text.secondary, 0.6),
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.02rem' },
                lineHeight: 1.7,
              }}
            >
              Technical projects showcasing expertise in computer vision, deep learning, and full-stack development
            </Typography>
          </Box>
        </motion.div>

        {/* Projects Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: { xs: 2.5, md: 3 },
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          {projects.map((project, index) => (
            <ProjectCard key={`${project.title}-${index}`} project={project} index={index} onSelect={handleProjectSelect} />
          ))}
        </Box>
      </Container>

      <ProjectModal project={selectedProject} open={Boolean(selectedProject)} onClose={handleCloseModal} />
    </Box>
  );
};

const ModernProjects = memo(ModernProjectsComponent);
ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;
