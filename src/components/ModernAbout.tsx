import { memo, useRef, type RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';

import { useSystemProfile } from './useSystemProfile';
import { ABOUT_TEXT } from '../constants/index';
import aboutImg from '../assets/GadingAdityaPerdana2.jpg';

// Stats data
const statsData = [
  { label: "Publications", value: "5" },
  { label: "Conference Awards", value: "1" },
  { label: "Projects Delivered", value: "6+" },
  { label: "Certifications", value: "15+" },
];

// Research interests
const researchInterests = [
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Computer Vision",
  "Data Science",
  "Neural Networks",
];

const ModernAbout = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  return (
    <Box
      ref={containerRef}
      component="section"
      id="about"
      sx={{
        py: { xs: 10, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.default, 1)} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.background.default, 1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                letterSpacing: 3,
                mb: 2,
                display: 'block',
              }}
            >
              Get To Know Me
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              About Me
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              AI/ML researcher passionate about building intelligent systems
            </Typography>

            {/* Decorative Line */}
            <Box
              sx={{
                width: 48,
                height: 2,
                bgcolor: 'primary.main',
                mx: 'auto',
                mt: 4,
                borderRadius: 1,
              }}
            />
          </Box>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
            gap: { xs: 6, lg: 8 },
            alignItems: 'start',
          }}
        >
          {/* Left Column - Photo */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.7, delay: 0.1 }}
          >
            <Box
              sx={{
                position: 'relative',
                mx: 'auto',
                maxWidth: 400,
              }}
            >
              {/* Photo Container */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 24px 70px ${alpha(theme.palette.common.black, 0.15)}`,
                  },
                }}
              >
                <Box
                  component="img"
                  src={aboutImg}
                  alt="Gading Aditya Perdana - AI/ML Researcher"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    aspectRatio: '4/5',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                {/* Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: `linear-gradient(to top, ${alpha(theme.palette.background.default, 0.9)}, transparent)`,
                  }}
                />

                {/* Name Tag */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      mb: 0.5,
                    }}
                  >
                    Gading Aditya Perdana
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'primary.main', fontWeight: 500 }}
                  >
                    AI/ML Researcher & Engineer
                  </Typography>
                </Box>
              </Box>

              {/* Stats Grid - Below Photo */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mt: 3,
                }}
              >
                {statsData.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.4,
                        delay: shouldReduceMotion ? 0 : 0.3 + index * 0.1,
                      }}
                    >
                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(12px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                          textAlign: 'center',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            mb: 0.5,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
              </Box>
            </Box>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.7, delay: 0.2 }}
          >
            <Box>
              {/* Bio Card */}
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  mb: 4,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.1rem' },
                    lineHeight: 1.9,
                    color: 'text.secondary',
                  }}
                >
                  {ABOUT_TEXT}
                </Typography>
              </Box>

              {/* Research Interests */}
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 3,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    '&::after': {
                      content: '""',
                      flex: 1,
                      height: 1,
                      bgcolor: alpha(theme.palette.divider, 0.1),
                    },
                  }}
                >
                  Research Interests
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  {researchInterests.map((interest, index) => (
                    <motion.div
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        duration: 0.3,
                        delay: shouldReduceMotion ? 0 : 0.4 + index * 0.05,
                      }}
                    >
                      <Chip
                        label={interest}
                        sx={{
                          px: 1.5,
                          py: 2.5,
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: 'primary.main',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            transform: 'translateY(-2px)',
                          },
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Box>

              {/* Education Highlight */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Education
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  B.Sc. in Computer Science
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary' }}
                >
                  Binus University • Aug 2023 - Feb 2027
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 500,
                    mt: 1,
                  }}
                >
                  Specialization: Intelligence Systems • GPA: 3.52/4.00
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: 'text.secondary',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  Accelerated 3.5-year program • Apple Developer Academy Scholar (2026)
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default memo(ModernAbout);
