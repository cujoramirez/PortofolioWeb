import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import { PROJECTS } from '../constants';
import OptimizedImage from './OptimizedImage';

interface Project {
  title: string;
  image: string;
  description: string;
  technologies?: string[];
  demo: string | null;
  github: string | null;
  links: string[];
}

const MAX_CHIPS = 4;
const INITIAL_VISIBLE = 6;

const ProjectCard = memo(({ project }: { project: Project }) => {
  const theme = useTheme();
  const techs = project.technologies ?? [];
  const visibleTechs = techs.slice(0, MAX_CHIPS);
  const extraTech = techs.length - visibleTechs.length;

  // Link logic: prefer explicit demo/github; fall back to a generic view link.
  const demoHref = project.demo;
  const githubHref = project.github;
  const fallbackHref =
    !demoHref && !githubHref && project.links.length > 0 ? project.links[0] : null;

  const hasActions = Boolean(demoHref || githubHref || fallbackHref);

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 16px 40px ${alpha(theme.palette.common.black, 0.18)}`,
        },
        '@media (prefers-reduced-motion: reduce)': {
          '&:hover': { transform: 'none' },
        },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          bgcolor: alpha(theme.palette.text.primary, 0.04),
        }}
      >
        <OptimizedImage
          src={project.image}
          alt={project.title}
          width="100%"
          height="100%"
          objectFit="cover"
          style={{ display: 'block', width: '100%', height: '100%' }}
        />
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, md: 2.5 },
          '&:last-child': { pb: { xs: 2, md: 2.5 } },
        }}
      >
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            lineHeight: 1.35,
            mb: 1,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          {project.title}
        </Typography>

        <Typography
          variant="body2"
          title={project.description}
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6,
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </Typography>

        {/* Technologies */}
        {techs.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: hasActions ? 2 : 0 }}>
            {visibleTechs.map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  color: 'text.secondary',
                  border: `1px solid ${theme.palette.divider}`,
                }}
              />
            ))}
            {extraTech > 0 && (
              <Chip
                label={`+${extraTech}`}
                size="small"
                aria-label={`${extraTech} more technologies`}
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  border: 'none',
                }}
              />
            )}
          </Box>
        )}

        {/* Actions */}
        {hasActions && (
          <Stack direction="row" spacing={1} sx={{ mt: 'auto', flexWrap: 'wrap', gap: 1 }}>
            {demoHref && (
              <Button
                component="a"
                href={demoHref}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="contained"
                startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                aria-label={`Live demo of ${project.title}`}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Live Demo
              </Button>
            )}
            {githubHref && (
              <Button
                component="a"
                href={githubHref}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<GitHubIcon sx={{ fontSize: 16 }} />}
                aria-label={`Source code for ${project.title} on GitHub`}
                sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
              >
                Code
              </Button>
            )}
            {fallbackHref && (
              <Button
                component="a"
                href={fallbackHref}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
                aria-label={`View ${project.title}`}
                sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
              >
                View
              </Button>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
});

ProjectCard.displayName = 'ProjectCard';

const ModernProjectsComponent = () => {
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [showAll, setShowAll] = useState(false);

  const projects = PROJECTS as Project[];
  const visibleProjects = showAll ? projects : projects.slice(0, INITIAL_VISIBLE);
  const hasMore = projects.length > INITIAL_VISIBLE;

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography
          variant="overline"
          sx={{
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontWeight: 500,
            letterSpacing: 3,
            color: 'primary.main',
            display: 'block',
            mb: 1.5,
          }}
        >
          Portfolio
        </Typography>
        <Typography
          variant="h2"
          component="h2"
          sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1.5, color: 'text.primary' }}
        >
          Projects
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 560, lineHeight: 1.7 }}>
          {projects.length} projects spanning computer vision, deep learning, and full-stack
          development.
        </Typography>
      </Box>

      {/* Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
          gap: { xs: 2.5, md: 3 },
        }}
      >
        {visibleProjects.map((project, index) => (
          <motion.div
            key={`${project.title}-${index}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.45,
              delay: Math.min(index % INITIAL_VISIBLE, 5) * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ height: '100%' }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </Box>

      {/* Show more / less */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 4, md: 5 } }}>
          <Button
            onClick={() => setShowAll((prev) => !prev)}
            aria-expanded={showAll}
            variant="outlined"
            color="inherit"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderColor: theme.palette.divider,
              color: 'text.primary',
              '&:hover': { borderColor: alpha(theme.palette.primary.main, 0.5) },
            }}
          >
            {showAll ? 'Show less' : `Show all ${projects.length} projects`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const ModernProjects = memo(ModernProjectsComponent);
ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;
