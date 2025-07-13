import React, { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Container,
  Grid,
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
  Science as ScienceIcon,
  AutoFixHigh as MagicIcon
} from '@mui/icons-material';
import { PROJECTS } from '../constants';
import { useSystemProfile } from './useSystemProfile';

// Enhanced floating particle component for projects
const ProjectParticle = ({ delay = 0 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0, 1, 0],
        scale: [0, 1, 0]
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  );
};

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
  
  // Default icon
  return CodeIcon;
};

const ModernProjects = memo(() => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [selectedProject, setSelectedProject] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProject, setHoveredProject] = useState(null);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });
  const { scrollYProgress } = useScroll();
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const useReducedMotion = performanceTier === 'low' || isMobile;

  // Parallax effect for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Enhanced animation variants for mobile
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: useReducedMotion ? 0.05 : 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: isMobile ? 30 : 50,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: useReducedMotion ? 0.3 : 0.6,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: useReducedMotion ? {} : {
      y: isMobile ? -4 : -8,
      scale: isMobile ? 1.02 : 1.05,
      transition: { duration: 0.3 }
    }
  };

  const chipVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: useReducedMotion ? {} : {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <Box
      component="section"
      id="projects"
      ref={containerRef}
      sx={{
        py: { xs: 6, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.9)} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        overflow: 'hidden',
        minHeight: { xs: 'auto', md: '100vh' }
      }}
    >
      {/* Enhanced animated background elements */}
      {!useReducedMotion && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            y: backgroundY
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              width: { xs: 100, md: 200 },
              height: { xs: 100, md: 200 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
              animation: 'float 25s ease-in-out infinite'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '70%',
              right: '5%',
              width: { xs: 80, md: 150 },
              height: { xs: 80, md: 150 },
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
              animation: 'float 20s ease-in-out infinite reverse'
            }}
          />
          
          {/* Enhanced floating particles */}
          {[...Array(isMobile ? 8 : 15)].map((_, i) => (
            <ProjectParticle key={i} delay={i * 2} />
          ))}
        </motion.div>
      )}

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            transparent 50%),
            radial-gradient(circle at 75% 75%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
            transparent 50%)`,
          pointerEvents: 'none'
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Enhanced section header */}
          <motion.div variants={cardVariants}>
            <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: { xs: 2, md: 3 },
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.1)}, 
                    ${alpha(theme.palette.secondary.main, 0.1)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <MagicIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: { xs: 20, md: 24 } }} />
                <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: { xs: 1, md: 2 }, fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                  Portfolio Showcase
                </Typography>
              </Box>

              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: { xs: 2, md: 3 },
                  position: 'relative',
                  lineHeight: 1.1
                }}
              >
                Featured Projects
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ 
                  maxWidth: { xs: 350, md: 600 }, 
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  lineHeight: 1.6,
                  px: { xs: 2, md: 0 }
                }}
              >
                Innovative solutions showcasing technical expertise and creative problem-solving
              </Typography>
            </Box>
          </motion.div>

          {/* Enhanced projects grid */}
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {PROJECTS.map((project, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={index}>
                <motion.div
                  variants={cardVariants}
                  whileHover={!useReducedMotion ? "hover" : undefined}
                  style={{ height: '100%' }}
                  onHoverStart={() => setHoveredProject(index)}
                  onHoverEnd={() => setHoveredProject(null)}
                >
                  <motion.div variants={cardHoverVariants}>
                    <Card
                      elevation={isMobile ? 2 : 4}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        borderRadius: { xs: 2, md: 3 },
                        '&:hover': {
                          boxShadow: isMobile ? theme.shadows[4] : theme.shadows[12],
                          borderColor: theme.palette.primary.main,
                          '& .project-icon': {
                            transform: isMobile ? 'scale(1.05)' : 'scale(1.1) rotate(5deg)',
                            color: theme.palette.secondary.main
                          },
                          '& .project-particles': {
                            opacity: 1
                          }
                        }
                      }}
                      onClick={() => handleProjectClick(project)}
                    >
                      {/* Enhanced project icon header */}
                      <Box 
                        sx={{ 
                          position: 'relative', 
                          overflow: 'hidden',
                          height: { xs: 140, md: 180 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: `linear-gradient(135deg, 
                            ${alpha(theme.palette.primary.main, 0.05)}, 
                            ${alpha(theme.palette.secondary.main, 0.05)})`,
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `radial-gradient(circle at center, 
                              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                              transparent 70%)`,
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out'
                          },
                          '&:hover::before': {
                            opacity: 1
                          }
                        }}
                      >
                        {(() => {
                          const IconComponent = getProjectIcon(project.title, project.technologies);
                          return (
                            <IconComponent
                              sx={{
                                fontSize: { xs: 48, md: 64 },
                                color: theme.palette.primary.main,
                                transition: 'all 0.3s ease-in-out',
                                position: 'relative',
                                zIndex: 1,
                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                              }}
                              className="project-icon"
                            />
                          );
                        })()}
                        
                        {/* Enhanced decorative elements */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: { xs: 15, md: 20 },
                            right: { xs: 15, md: 20 },
                            width: { xs: 20, md: 24 },
                            height: { xs: 20, md: 24 },
                            borderRadius: '50%',
                            background: alpha(theme.palette.secondary.main, 0.2),
                            animation: !useReducedMotion ? 'float 3s ease-in-out infinite' : 'none'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: { xs: 15, md: 20 },
                            left: { xs: 15, md: 20 },
                            width: { xs: 14, md: 16 },
                            height: { xs: 14, md: 16 },
                            borderRadius: '50%',
                            background: alpha(theme.palette.primary.main, 0.3),
                            animation: !useReducedMotion ? 'float 3s ease-in-out infinite reverse' : 'none'
                          }}
                        />

                        {/* Floating particles on hover */}
                        {!useReducedMotion && (
                          <Box
                            className="project-particles"
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              opacity: 0,
                              transition: 'opacity 0.3s ease-in-out'
                            }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <ProjectParticle key={i} delay={i * 0.5} />
                            ))}
                          </Box>
                        )}

                        {/* Enhanced action buttons overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: { xs: 12, md: 16 },
                            right: { xs: 12, md: 16 },
                            display: 'flex',
                            gap: 1,
                            opacity: 0,
                            transition: 'opacity 0.3s ease-in-out',
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
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.main,
                                  color: 'white',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {project.github && (
                            <Tooltip title="View Code">
                              <IconButton
                                component="a"
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                  backdropFilter: 'blur(10px)',
                                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                  '&:hover': {
                                    backgroundColor: theme.palette.secondary.main,
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <GitHubIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {project.demo && (
                            <Tooltip title="Live Demo">
                              <IconButton
                                component="a"
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                                  backdropFilter: 'blur(10px)',
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                  '&:hover': {
                                    backgroundColor: theme.palette.info.main,
                                    color: 'white',
                                    transform: 'scale(1.1)'
                                  }
                                }}
                              >
                                <LaunchIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      <CardContent sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
                        {/* Project Title */}
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            fontWeight: 700,
                            mb: 2,
                            color: theme.palette.text.primary,
                            lineHeight: 1.3,
                            fontSize: { xs: '1.1rem', md: '1.25rem' }
                          }}
                        >
                          {project.title}
                        </Typography>

                        {/* Project Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            mb: 3, 
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitLineClamp: { xs: 2, md: 3 },
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: { xs: '0.875rem', md: '0.925rem' }
                          }}
                        >
                          {project.description}
                        </Typography>

                        {/* Technologies */}
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          <AnimatePresence>
                            {project.technologies?.slice(0, isMobile ? 3 : 4).map((tech, techIndex) => (
                              <motion.div
                                key={tech}
                                variants={chipVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                whileHover="hover"
                                style={{ 
                                  animationDelay: `${techIndex * 0.05}s` 
                                }}
                              >
                                <Chip
                                  label={tech}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                    fontSize: { xs: '0.7rem', md: '0.75rem' },
                                    height: { xs: 24, md: 28 },
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      borderColor: theme.palette.primary.main,
                                      transform: isMobile ? 'none' : 'scale(1.05)'
                                    }
                                  }}
                                />
                              </motion.div>
                            ))}
                            {project.technologies?.length > (isMobile ? 3 : 4) && (
                              <Chip
                                label={`+${project.technologies.length - (isMobile ? 3 : 4)}`}
                                size="small"
                                variant="filled"
                                sx={{
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  fontSize: { xs: '0.7rem', md: '0.75rem' },
                                  height: { xs: 24, md: 28 }
                                }}
                              />
                            )}
                          </AnimatePresence>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        <Dialog
          open={!!selectedProject}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
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
                <Typography variant="h5" component="div" fontWeight={700}>
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
                          fontSize: 80,
                          color: theme.palette.primary.main,
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                        }}
                      />
                    );
                  })()}
                </Box>

                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ mb: 3, lineHeight: 1.7 }}
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
