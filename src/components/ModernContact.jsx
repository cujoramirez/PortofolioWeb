import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Link,
  Tooltip,
  Chip
} from "@mui/material";
import { 
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Rocket as RocketIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon
} from "@mui/icons-material";
import { useSystemProfile } from "./useSystemProfile";

const contactMethods = [
  {
    icon: EmailIcon,
    label: "Email",
    value: "gadingadityaperdana@gmail.com",
    href: "mailto:gadingadityaperdana@gmail.com",
    color: "#6366f1",
    description: "Best for detailed inquiries"
  },
  {
    icon: LinkedInIcon,
    label: "LinkedIn",
    value: "gadingadityaperdana",
    href: "https://www.linkedin.com/in/gadingadityaperdana/",
    color: "#0077b5",
    description: "Professional networking"
  },
  {
    icon: GitHubIcon,
    label: "GitHub", 
    value: "cujoramirez",
    href: "https://github.com/cujoramirez",
    color: "#333",
    description: "View my code repositories"
  },
  {
    icon: LocationIcon,
    label: "Location",
    value: "Central Jakarta, Indonesia",
    href: null,
    color: "#10b981",
    description: "Available globally for remote work"
  }
];

const stats = [
  { icon: WorkIcon, value: "3+", label: "Years Experience" },
  { icon: BusinessIcon, value: "20+", label: "Projects Completed" },
  { icon: CodeIcon, value: "10+", label: "Technologies" },
  { icon: AnalyticsIcon, value: "24/7", label: "Availability" },
  { icon: ScienceIcon, value: "AI/ML", label: "Specialization" }
];

const expertise = [
  { icon: PsychologyIcon, label: "AI Strategy", color: "#6366f1" },
  { icon: AutoAwesomeIcon, label: "Machine Learning", color: "#8b5cf6" },
  { icon: RocketIcon, label: "Digital Innovation", color: "#22d3ee" },
  { icon: BusinessIcon, label: "Enterprise Solutions", color: "#10b981" },
  { icon: CodeIcon, label: "Full-Stack Development", color: "#f59e0b" },
  { icon: AnalyticsIcon, label: "Data Analytics", color: "#ef4444" }
];

const ModernContact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { performanceTier } = useSystemProfile();
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { 
    once: true, 
    margin: "-100px",
    amount: 0.2
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const shouldReduceMotion = performanceTier === "low" || isMobile;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="contact"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #475569 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
          opacity: 0.8
        }
      }}
    >
      {/* Animated Background Elements */}
      {!shouldReduceMotion && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            opacity: 0.1
          }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: 200 + i * 50,
                height: 200 + i * 50,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </Box>
      )}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{
            y: shouldReduceMotion ? 0 : y,
          }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<ContactIcon />}
                label="Get In Touch"
                sx={{
                  mb: 3,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#6366f1',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
              
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                }}
              >
                Let's Build Something
                <br />
                <span style={{ color: '#22d3ee' }}>Extraordinary</span>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  mb: 4
                }}
              >
                Ready to transform your ideas into innovative AI solutions? 
                Let's discuss how we can accelerate your digital transformation journey.
              </Typography>

              {/* Stats Row */}
              <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Grid size={{ xs: 4, sm: 2 }} key={stat.label}>
                      <motion.div
                        variants={itemVariants}
                        style={{ delay: index * 0.1 }}
                      >
                        <Card
                          sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            p: 2,
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.1)',
                              transform: 'translateY(-5px)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                            }
                          }}
                        >
                          <Icon sx={{ color: theme.palette.primary.main, mb: 1, fontSize: 24 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 0.5 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}>
                            {stat.label}
                          </Typography>
                        </Card>
                      </motion.div>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </motion.div>

          {/* Main Content Grid */}
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="stretch">
            {/* Contact Methods */}
            <Grid size={{ xs: 12, md: 8 }}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    p: { xs: 3, md: 4 },
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: 4,
                      color: 'white',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Contact Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {contactMethods.map((method, index) => {
                      const Icon = method.icon;
                      return (
                        <Grid size={{ xs: 12, sm: 6 }} key={method.label}>
                          <motion.div
                            whileHover={method.href ? { scale: 1.02, x: 8 } : {}}
                            transition={{ duration: 0.2 }}
                          >
                            <Box
                              component={method.href ? Link : 'div'}
                              href={method.href || undefined}
                              target={method.href ? "_blank" : undefined}
                              rel={method.href ? "noopener noreferrer" : undefined}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                textDecoration: 'none',
                                color: 'inherit',
                                transition: 'all 0.3s ease',
                                height: '100%',
                                cursor: method.href ? 'pointer' : 'default',
                                '&:hover': method.href ? {
                                  background: `rgba(${method.color === '#333' ? '99, 102, 241' : method.color.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}, 0.1)`,
                                  border: `1px solid rgba(${method.color === '#333' ? '99, 102, 241' : method.color.slice(1).match(/.{2}/g).map(x => parseInt(x, 16)).join(', ')}, 0.3)`,
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                                } : {}
                              }}
                            >
                              <Avatar
                                sx={{
                                  background: method.color,
                                  width: 60,
                                  height: 60,
                                  mr: 3,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                                }}
                              >
                                <Icon sx={{ fontSize: 28 }} />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                                  {method.label}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontWeight: 500 }}>
                                  {method.value}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  {method.description}
                                </Typography>
                              </Box>
                            </Box>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Call to Action */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                      Ready to Start Your Project?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                      I'm always open to discussing new opportunities and innovative projects.
                    </Typography>
                    <Button
                      component={Link}
                      href="mailto:gadingadityaperdana@gmail.com"
                      variant="contained"
                      size="large"
                      startIcon={<EmailIcon />}
                      sx={{
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        textDecoration: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5855eb, #7c3aed)',
                          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                        }
                      }}
                    >
                      Get In Touch
                    </Button>
                  </Box>
                </Card>
              </motion.div>
            </Grid>

            {/* Expertise Areas */}
            <Grid size={{ xs: 12, md: 4 }}>
              <motion.div variants={cardVariants}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    p: 3,
                    height: '100%',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'white' }}>
                    Areas of Expertise
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {expertise.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Grid size={{ xs: 6 }} key={item.label}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Tooltip title={item.label} arrow>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: '12px',
                                  background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
                                  border: `1px solid ${item.color}30`,
                                  textAlign: 'center',
                                  transition: 'all 0.3s ease',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${item.color}30, ${item.color}20)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 24px ${item.color}30`,
                                  }
                                }}
                              >
                                <Icon sx={{ color: item.color, fontSize: 32, mb: 1 }} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    display: 'block',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {item.label}
                                </Typography>
                              </Box>
                            </Tooltip>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Availability */}
                  <Box sx={{ textAlign: 'center' }}>
                    <ScheduleIcon sx={{ color: theme.palette.primary.main, fontSize: 40, mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                      Available for Collaboration
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                      Currently accepting new projects and consulting opportunities.
                    </Typography>
                    <Chip
                      label="Open to Work"
                      sx={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Footer */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2 }}>
                Let's create innovative solutions together. Reach out and let's discuss your next big idea.
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                © {new Date().getFullYear()} Gading Aditya Perdana. All rights reserved.
              </Typography>
            </Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ModernContact;
