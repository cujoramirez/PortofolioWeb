import { memo, useRef, useState, useEffect, type RefObject } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';

import { useSystemProfile } from './useSystemProfile';
import { ABOUT_TEXT, ABOUT_QUOTES } from '../constants/index';
import aboutImg from '../assets/GadingAdityaPerdana2.jpg';

// Stats data
const statsData = [
  { label: "Publications", value: "5", icon: "📄" },
  { label: "Conference Awards", value: "1", icon: "🏆" },
  { label: "Projects Delivered", value: "6", suffix: "+", icon: "🚀" },
  { label: "Certifications", value: "15", suffix: "+", icon: "✅" },
];

// Research interests
const researchInterests = [
  "Computer Vision",
  "Deep Learning",
  "Vision Transformers",
  "Ensemble Learning",
  "Model Calibration",
  "Medical Imaging",
];

// Animated counter
const AnimatedStat = ({ value, suffix = '' }: { value: string; suffix?: string }) => {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref as RefObject<Element>, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const num = parseInt(value);
    if (isNaN(num)) { setDisplay(value); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(num / 25));
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setDisplay(value); clearInterval(timer); }
      else setDisplay(String(current));
    }, 50);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
};

const ModernAbout = () => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef as RefObject<Element>, { once: true, margin: '-100px' });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === 'low';

  // Parallax for photo
  const { scrollYProgress } = useScroll({
    target: containerRef as RefObject<HTMLElement>,
    offset: ['start end', 'end start'],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [40, -40]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24, filter: shouldReduceMotion ? 'none' : 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

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
          ${alpha(theme.palette.primary.main, 0.015)} 50%,
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
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 500,
                letterSpacing: 4,
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
              Get To Know Me
            </Typography>

            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '2.25rem', md: '3rem' },
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
                color: alpha(theme.palette.text.secondary, 0.7),
                maxWidth: 560,
                mx: 'auto',
                lineHeight: 1.7,
              }}
            >
              AI Researcher & Apple Developer Academy Scholar passionate about Computer Vision and Deep Learning
            </Typography>
          </Box>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '400px 1fr' },
            gap: { xs: 6, lg: 10 },
            alignItems: 'start',
          }}
        >
          {/* Left Column - Photo + Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
          >
            <Box sx={{ position: 'relative', mx: 'auto', maxWidth: 400 }}>
              {/* Photo Container with parallax */}
              <motion.div variants={itemVariants} style={{ y: photoY }}>
                <Box
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: alpha(theme.palette.background.paper, 0.88),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    boxShadow: `0 24px 48px ${alpha(theme.palette.common.black, 0.15)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.05)}`,
                    transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                    '&:hover': {
                      transform: 'translateY(-6px) scale(1.01)',
                      boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.2)}, 0 0 80px ${alpha(theme.palette.primary.main, 0.06)}`,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={aboutImg}
                    alt="Gading Aditya Perdana - AI Researcher & Developer"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '4/5',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {/* Subtle overlay gradient at bottom */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '30%',
                      background: `linear-gradient(to top, ${alpha(theme.palette.background.default, 0.4)}, transparent)`,
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              </motion.div>

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
                  <motion.div key={stat.label} variants={itemVariants}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, 0.6),
                        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                        textAlign: 'center',
                        transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        position: 'relative',
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
                          transition: 'width 0.4s ease',
                        },
                        '&:hover': {
                          bgcolor: alpha(theme.palette.background.paper, 0.8),
                          borderColor: alpha(theme.palette.primary.main, 0.15),
                          transform: 'translateY(-3px)',
                          boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                          '&::before': { width: '80%' },
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          mb: 0.5,
                          fontFamily: '"Sora", system-ui, sans-serif',
                        }}
                      >
                        <AnimatedStat value={stat.value} suffix={stat.suffix || ''} />
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.6),
                          fontWeight: 500,
                          fontSize: '0.7rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>

              {/* Research Interests */}
              <motion.div variants={itemVariants}>
                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2.5,
                      color: 'text.primary',
                      fontSize: '0.95rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&::after': {
                        content: '""',
                        flex: 1,
                        height: 1,
                        bgcolor: alpha(theme.palette.divider, 0.08),
                      },
                    }}
                  >
                    Research Interests
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {researchInterests.map((interest, index) => (
                      <motion.div
                        key={interest}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : 0.4 + index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ scale: 1.06, y: -2 }}
                      >
                        <Chip
                          label={interest}
                          sx={{
                            px: 1.5,
                            py: 2.5,
                            fontSize: '0.82rem',
                            fontWeight: 500,
                            borderRadius: 2,
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            color: alpha(theme.palette.primary.main, 0.85),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            transition: 'all 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.12),
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </motion.div>

              {/* Education Highlight */}
              <motion.div variants={itemVariants}>
                <Box
                  sx={{
                    mt: 4,
                    p: 3,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.15),
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                    },
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                      letterSpacing: 2,
                      display: 'block',
                      mb: 1,
                    }}
                  >
                    Education
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5, fontSize: '1.05rem' }}>
                    B.Sc. in Computer Science
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha(theme.palette.text.secondary, 0.7) }}>
                    Binus University · Aug 2023 - Feb 2027
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 500, mt: 1 }}>
                    Specialization: Intelligence Systems · GPA: 3.52/4.00
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.5), display: 'block', mt: 0.5 }}>
                    Accelerated 3.5-year program · Apple Developer Academy Scholar (2026)
                  </Typography>
                </Box>
              </motion.div>
            </Box>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30, filter: shouldReduceMotion ? 'none' : 'blur(10px)' }}
            animate={isInView ? { opacity: 1, x: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: shouldReduceMotion ? 0.3 : 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box>
              {/* Bio Card */}
              <Box
                sx={{
                  p: { xs: 3, md: 4.5 },
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                  mb: 4,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.95,
                    color: alpha(theme.palette.text.secondary, 0.85),
                    whiteSpace: 'pre-line',
                  }}
                >
                  {ABOUT_TEXT}
                </Typography>
              </Box>

              {/* Inspirational Quotes */}
              <Box
                sx={{
                  p: { xs: 3, md: 4.5 },
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.06)}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: alpha(theme.palette.primary.main, 0.6),
                    fontWeight: 500,
                    letterSpacing: 3,
                    mb: 3,
                    display: 'block',
                  }}
                >
                  Guiding Principles
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {ABOUT_QUOTES.map((quote, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.6 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Box
                        sx={{
                          pl: 3,
                          borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderLeftColor: alpha(theme.palette.primary.main, 0.6),
                            pl: 3.5,
                          },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontStyle: 'italic',
                            color: alpha(theme.palette.text.secondary, 0.7),
                            lineHeight: 1.8,
                            mb: 0.75,
                            fontSize: { xs: '0.92rem', md: '1rem' },
                          }}
                        >
                          "{quote.text}"
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: alpha(theme.palette.primary.main, 0.7),
                            fontWeight: 600,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: '0.72rem',
                            letterSpacing: '0.05em',
                          }}
                        >
                          — {quote.author}
                        </Typography>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default memo(ModernAbout);
