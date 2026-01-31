import React, { memo, useState, useRef, useMemo, useCallback, RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
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

  if (
    titleLower.includes('detection') ||
    titleLower.includes('cnn') ||
    techString.includes('tensorflow') ||
    techString.includes('pytorch') ||
    titleLower.includes('diabetic') ||
    titleLower.includes('calm')
  ) {
    return AIIcon;
  }
  if (titleLower.includes('facial') || titleLower.includes('recognition') || titleLower.includes('security')) {
    return SecurityIcon;
  }
  if (titleLower.includes('web') || titleLower.includes('website') || titleLower.includes('tailor')) {
    return WebIcon;
  }
  if (titleLower.includes('research') || titleLower.includes('vision') || titleLower.includes('ensemble')) {
    return ScienceIcon;
  }
  if (titleLower.includes('waste') || titleLower.includes('retinopathy')) {
    return VisionIcon;
  }

  return CodeIcon;
};

// Project Card Component
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

  const IconComponent = getProjectIcon(project.title, project.technologies);
  const isFeatured = index === 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: shouldReduceMotion ? 0.3 : 0.5,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ height: '100%' }}
    >
      <Box
        onClick={() => onSelect(project)}
        sx={{
          position: 'relative',
          height: '100%',
          p: { xs: 2.5, md: 3 },
          borderRadius: 2.5,
          background: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: 'blur(16px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 25px 50px ${alpha(theme.palette.common.black, 0.15)}, 0 0 40px ${alpha(theme.palette.primary.main, 0.1)}`,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            background: alpha(theme.palette.background.paper, 0.7),
            '& .project-icon': {
              transform: 'scale(1.15) rotate(5deg)',
              color: theme.palette.primary.main,
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
              py: 0.5,
              borderRadius: 1.5,
              background: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                color: theme.palette.primary.main,
                letterSpacing: 0.5,
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
            background: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.text.secondary,
            mb: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <IconComponent sx={{ fontSize: 24 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1rem', md: '1.1rem' },
            color: theme.palette.text.primary,
            mb: 1,
            lineHeight: 1.3,
            pr: isFeatured ? 8 : 0,
          }}
        >
          {project.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: alpha(theme.palette.text.primary, 0.7),
            fontSize: '0.85rem',
            lineHeight: 1.6,
            mb: 2,
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
                fontSize: '0.7rem',
                background: alpha(theme.palette.text.primary, 0.04),
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              }}
            />
          ))}
          {(project.technologies?.length ?? 0) > 4 && (
            <Chip
              label={`+${(project.technologies?.length ?? 0) - 4}`}
              size="small"
              sx={{
                height: 24,
                fontSize: '0.7rem',
                background: alpha(theme.palette.primary.main, 0.08),
                color: theme.palette.primary.main,
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
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
          }}
        >
          {project.github && (
            <GitHubIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, opacity: 0.6 }} />
          )}
          {project.demo && (
            <OpenInNewIcon sx={{ fontSize: 16, color: theme.palette.text.secondary, opacity: 0.6 }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              ml: 'auto',
            }}
          >
            View details →
          </Typography>
        </Box>
      </Box>
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
          background: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 3,
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: theme.palette.text.secondary,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Icon */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 2,
            background: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            mb: 3,
          }}
        >
          <IconComponent sx={{ fontSize: 28 }} />
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 2,
            lineHeight: 1.3,
          }}
        >
          {project.title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.text.primary, 0.8),
            lineHeight: 1.7,
            mb: 3,
          }}
        >
          {project.description}
        </Typography>

        {/* Technologies */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 1.5,
              fontSize: '0.85rem',
            }}
          >
            Technologies
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {project.technologies?.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  fontSize: '0.75rem',
                  background: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Action Links */}
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
                background: alpha(theme.palette.text.primary, 0.05),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textDecoration: 'none',
                color: theme.palette.text.primary,
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: alpha(theme.palette.text.primary, 0.1),
                },
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
                background: theme.palette.primary.main,
                textDecoration: 'none',
                color: theme.palette.primary.contrastText,
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: theme.palette.primary.dark,
                },
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

  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

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
      {/* Subtle background */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: `linear-gradient(0deg, ${alpha(theme.palette.primary.main, 0.015)} 0%, transparent 100%)`,
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
                fontWeight: 600,
                letterSpacing: 3,
                color: theme.palette.primary.main,
                fontSize: '0.8rem',
                mb: 2,
                display: 'block',
              }}
            >
              Portfolio
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontWeight: 800,
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
                color: theme.palette.text.secondary,
                maxWidth: 520,
                mx: 'auto',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              Technical projects showcasing expertise in AI/ML, computer vision, and full-stack development
            </Typography>

            {/* Decorative line */}
            <Box
              sx={{
                width: 48,
                height: 2,
                mx: 'auto',
                mt: 3,
                borderRadius: 1,
                background: theme.palette.primary.main,
              }}
            />
          </Box>
        </motion.div>

        {/* Projects Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: { xs: 2.5, md: 3 },
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={`${project.title}-${index}`}
              project={project}
              index={index}
              onSelect={handleProjectSelect}
            />
          ))}
        </Box>
      </Container>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        open={Boolean(selectedProject)}
        onClose={handleCloseModal}
      />
    </Box>
  );
};

const ModernProjects = memo(ModernProjectsComponent);
ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;
