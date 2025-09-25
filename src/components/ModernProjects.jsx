import React, { memo, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
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
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { 
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Close as CloseIcon,
  Code as CodeIcon,
  Visibility as ViewIcon,
  Web as WebIcon,
  Psychology as AIIcon,
  School as EducationIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  SmartToy as RobotIcon,
  CameraAlt as VisionIcon,
  ShoppingCart as EcommerceIcon,
  MusicNote as MusicIcon,
  Business as BusinessIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { PROJECTS } from '../constants';
import { useSystemProfile } from './useSystemProfile';

// Lightweight CSS-only floating particles - no motion calculations
const OptimizedParticle = memo(({ index, theme }) => (
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
        '50%': { transform: 'translate(20px, -20px) scale(1)', opacity: 0.6 }
      }
    }}
  />
));

// Function to get appropriate icon for project type
const getProjectIcon = (title, technologies) => {
  const titleLower = title.toLowerCase();
  const techString = technologies?.join(' ').toLowerCase() || '';
  
  if (titleLower.includes('ai') || titleLower.includes('detection') || titleLower.includes('cnn') || 
      techString.includes('tensorflow') || techString.includes('pytorch') || titleLower.includes('diabetic')) {
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

// Memoized project card to prevent unnecessary re-renders
const ProjectCard = memo(({ project, index, isMobile, theme, onProjectClick }) => {
  const IconComponent = useMemo(() => 
    getProjectIcon(project.title, project.technologies), 
    [project.title, project.technologies]
  );

  const handleCardClick = useCallback(() => {
    onProjectClick(project);
  }, [project, onProjectClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={!isMobile ? { 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      style={{ height: '100%', display: 'flex' }}
    >
      <Card
        elevation={2}
        sx={{
          height: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          borderRadius: 2,
          '&:hover': {
            boxShadow: isMobile ? theme.shadows[4] : theme.shadows[8],
            borderColor: alpha(theme.palette.primary.main, 0.3),
            '& .project-icon': {
              color: theme.palette.secondary.main,
              transform: isMobile ? 'scale(1.05)' : 'scale(1.1)'
            }
          }
        }}
        onClick={handleCardClick}
      >
        {/* Simplified header with icon */}
        <Box 
          sx={{ 
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.03)}, 
              ${alpha(theme.palette.secondary.main, 0.03)})`,
            position: 'relative'
          }}
        >
          <IconComponent
            className="project-icon"
            sx={{
              fontSize: 48,
              color: theme.palette.primary.main,
              transition: 'all 0.2s ease-in-out'
            }}
          />
          
          {/* Action buttons overlay - simplified */}
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              display: 'flex',
              gap: 1,
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              '.MuiCard-root:hover &': {
                opacity: 1
              }
            }}
          >
            <Tooltip title="View Details">
              <IconButton
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                  }
                }}
              >
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Project Title */}
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 1.5,
              lineHeight: 1.3,
              fontSize: '1.1rem'
            }}
          >
            {project.title}
          </Typography>

          {/* Project Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ 
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '0.875rem'
            }}
          >
            {project.description}
          </Typography>

          {/* Technologies - limited display */}
          <Box display="flex" flexWrap="wrap" gap={0.5} sx={{ mt: 'auto' }}>
            {project.technologies?.slice(0, 3).map((tech) => (
              <Chip
                key={tech}
                label={tech}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            ))}
            {project.technologies?.length > 3 && (
              <Chip
                label={`+${project.technologies.length - 3}`}
                size="small"
                variant="filled"
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  fontSize: '0.7rem',
                  height: 24
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
});

const ModernProjects = memo(() => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedProject, setSelectedProject] = useState(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });

  const useReducedMotion = performanceTier === 'low' || isMobile;

  // Memoized callbacks to prevent re-renders
  const handleProjectClick = useCallback((project) => {
    setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedProject(null);
  }, []);

  // Memoized projects to prevent recalculation
  const memoizedProjects = useMemo(() => PROJECTS, []);

  // Lightweight particles for decoration
  const decorativeParticles = useMemo(() => 
    useReducedMotion ? [] : Array.from({ length: 6 }, (_, i) => (
      <OptimizedParticle key={i} index={i} theme={theme} />
    )), 
    [useReducedMotion, theme]
  );

  return (
    <Box
      component="section"
      id="projects"
      ref={containerRef}
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.95)} 0%, 
          ${alpha(theme.palette.primary.main, 0.01)} 50%,
          ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
        overflow: 'hidden'
      }}
    >
      {/* Lightweight background decoration */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            transparent 50%),
            radial-gradient(circle at 75% 75%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 0%, 
            transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      {/* Decorative particles */}
      {decorativeParticles}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Simplified header */}
        {isInView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: { xs: 1, md: 2 },
                  lineHeight: 1.2
                }}
              >
                Featured Projects
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ 
                  maxWidth: 500, 
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6
                }}
              >
                Innovative solutions showcasing technical expertise
              </Typography>
            </Box>
          </motion.div>
        )}

        {/* Optimized projects grid */}
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 2, md: 3, lg: 3.5 },
            gridTemplateColumns: {
              xs: 'repeat(1, minmax(0, 1fr))',
              sm: 'repeat(2, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))'
            },
            alignItems: 'stretch'
          }}
        >
          {memoizedProjects.map((project, index) => (
            <Box key={project.id || index} sx={{ display: 'flex' }}>
              <ProjectCard
                project={project}
                index={index}
                isMobile={isMobile}
                theme={theme}
                onProjectClick={handleProjectClick}
              />
            </Box>
          ))}
        </Box>

        {/* Optimized project modal */}
        <Dialog
          open={!!selectedProject}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }
          }}
        >
          {selectedProject && (
            <>
              <DialogTitle
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 1
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
                    const IconComponent = getProjectIcon(selectedProject.title, selectedProject.technologies);
                    return (
                      <IconComponent
                        sx={{
                          fontSize: 64,
                          color: theme.palette.primary.main
                        }}
                      />
                    );
                  })()}
                </Box>

                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3, lineHeight: 1.6 }}
                >
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
                          fontWeight: 500
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
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
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
                          backgroundColor: theme.palette.secondary.dark
                        }
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
});

ModernProjects.displayName = 'ModernProjects';

export default ModernProjects;

