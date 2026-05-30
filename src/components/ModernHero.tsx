import React, { useRef, type RefObject } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  alpha,
  SvgIcon,
} from '@mui/material';
import { Download, GitHub, LinkedIn, Email } from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';
import RotatingText from './RotatingText';
import heroImg from '../assets/GadingAdityaPerdana.webp';
import resumePDF from '../assets/Gading_Resume.pdf';
import { useLenis } from '../hooks/useLenis';
import ProfileCard from './ProfileCard';
import { HERO_CONTENT } from '../constants/index';

// Custom Google Scholar icon
const GoogleScholarIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
  </SvgIcon>
);

const TYPING_ROLES = [
  'AI Researcher',
  'Computer Vision Specialist',
  'Deep Learning Researcher',
  'Apple Developer Academy Scholar',
];

const SOCIAL_LINKS = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: GoogleScholarIcon, url: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', label: 'Google Scholar' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const SKILLS = ['PyTorch', 'Computer Vision', 'Deep Learning', 'Swift', 'Python', 'Research'];

// Floating particle component
const FloatingParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0.5],
      y: [0, -80, -160],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    sx={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
      pointerEvents: 'none',
      filter: 'blur(1px)',
    }}
  />
);

// Magnetic button wrapper
const MagneticButton = ({ children, strength = 0.3, ...props }: { children: React.ReactNode; strength?: number; [key: string]: unknown }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: 'inline-flex' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
};

const ModernHero = () => {
  const { performanceTier } = useSystemProfile();
  const heroRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { lenis } = useLenis();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isInView = useInView(heroRef as RefObject<Element>, { once: true });

  const shouldReduceMotion = performanceTier === 'low' || isMobile;

  // Stagger animation config
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30, filter: shouldReduceMotion ? 'none' : 'blur(10px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <Box
      ref={heroRef}
      component="section"
      id="hero"
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(180deg,
          ${theme.palette.background.default} 0%,
          ${alpha(theme.palette.primary.main, 0.03)} 50%,
          ${theme.palette.background.default} 100%)`,
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '40%',
          height: '60%',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 60%)`,
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '5%',
          right: '-10%',
          width: '35%',
          height: '50%',
          background: `radial-gradient(ellipse at center, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 60%)`,
          pointerEvents: 'none',
          filter: 'blur(80px)',
        }}
      />

      {/* Floating particles - only on desktop with good performance */}
      {!shouldReduceMotion && (
        <>
          <FloatingParticle delay={0} size={6} x="15%" y="30%" duration={6} />
          <FloatingParticle delay={1.5} size={4} x="75%" y="60%" duration={7} />
          <FloatingParticle delay={3} size={5} x="40%" y="70%" duration={8} />
          <FloatingParticle delay={2} size={3} x="85%" y="25%" duration={5} />
          <FloatingParticle delay={4} size={4} x="25%" y="80%" duration={9} />
        </>
      )}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' },
            gap: { xs: 6, lg: 10 },
            alignItems: 'center',
            pt: { xs: 12, md: 10 },
            pb: { xs: 8, md: 0 },
          }}
        >
          {/* Left Column - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            style={{ order: isMobile ? 2 : 1, position: 'relative', zIndex: 15 }}
          >
            {/* Greeting */}
            <motion.div variants={itemVariants}>
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
                  '&::before': {
                    content: '""',
                    display: 'inline-block',
                    width: 32,
                    height: 1,
                    bgcolor: 'primary.main',
                    opacity: 0.5,
                  },
                }}
              >
                Welcome to my portfolio
              </Typography>
            </motion.div>

            {/* Name */}
            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontFamily: '"Sora", system-ui, sans-serif',
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                  lineHeight: 1.05,
                  mb: 2.5,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.primary} 40%, ${theme.palette.primary.main} 70%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 8s ease infinite',
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                  letterSpacing: '-0.03em',
                }}
              >
                Gading Aditya
                <br />
                Perdana
              </Typography>
            </motion.div>

            {/* Role */}
            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: 400,
                    color: alpha(theme.palette.text.secondary, 0.7),
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                  }}
                >
                  I'm a{' '}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Sora", system-ui, sans-serif',
                    fontWeight: 600,
                    color: 'primary.main',
                    minWidth: { xs: '180px', md: '300px' },
                    fontSize: { xs: '1.1rem', md: '1.3rem' },
                  }}
                >
                  <RotatingText
                    texts={TYPING_ROLES}
                    rotationInterval={4000}
                    staggerDuration={0.025}
                    staggerFrom="first"
                    animatePresenceMode="wait"
                    transition={{
                      type: 'spring',
                      damping: 25,
                      stiffness: 200,
                    }}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    auto
                    loop
                  />
                </Typography>
              </Box>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants}>
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1.05rem' },
                  lineHeight: 1.85,
                  color: alpha(theme.palette.text.secondary, 0.8),
                  mb: 4.5,
                  maxWidth: 540,
                  fontWeight: 400,
                }}
              >
                {HERO_CONTENT}
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} style={{ position: 'relative', zIndex: 20 }}>
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center', mb: 5, position: 'relative', zIndex: 20 }}>
                <MagneticButton strength={0.15}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => {
                      const target = document.getElementById('projects');
                      if (!target) return;
                      if (lenis) {
                        lenis.scrollTo(target, { duration: shouldReduceMotion ? 0 : 1 });
                      } else {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    sx={{
                      px: 4.5,
                      py: 1.75,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontFamily: '"Sora", system-ui, sans-serif',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      letterSpacing: '0.02em',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}, 0 0 60px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    View My Work
                  </Button>
                </MagneticButton>

                <MagneticButton strength={0.15}>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<Download />}
                    href={resumePDF}
                    target="_blank"
                    sx={{
                      px: 4,
                      py: 1.75,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontFamily: '"Sora", system-ui, sans-serif',
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      letterSpacing: '0.02em',
                      borderColor: alpha(theme.palette.divider, 0.2),
                      color: 'text.primary',
                      transition: 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.12)}`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                    }}
                  >
                    Resume
                  </Button>
                </MagneticButton>

                {/* Social Links */}
                <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 2 }, position: 'relative', zIndex: 10 }}>
                  {SOCIAL_LINKS.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <motion.div
                        key={social.label}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{
                          duration: 0.4,
                          delay: 0.8 + index * 0.08,
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <IconButton
                          component="a"
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          aria-label={social.label}
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                            '&:hover': {
                              color: 'primary.main',
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              transform: 'translateY(-3px) scale(1.08)',
                              boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                          }}
                        >
                          <Icon fontSize="small" />
                        </IconButton>
                      </motion.div>
                    );
                  })}
                </Box>
              </Box>
            </motion.div>

            {/* Skills */}
            <motion.div variants={itemVariants}>
              <Typography
                variant="overline"
                sx={{
                  color: alpha(theme.palette.text.secondary, 0.5),
                  fontWeight: 500,
                  letterSpacing: 3,
                  mb: 2,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  '&::after': {
                    content: '""',
                    display: 'inline-block',
                    width: 24,
                    height: 1,
                    bgcolor: alpha(theme.palette.text.secondary, 0.2),
                  },
                }}
              >
                Core Expertise
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {SKILLS.map((skill, index) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : 0.9 + index * 0.06,
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.08, y: -2 }}
                  >
                    <Chip
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                        color: alpha(theme.palette.primary.main, 0.85),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        fontWeight: 500,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.72rem',
                        letterSpacing: '0.02em',
                        cursor: 'default',
                        transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.15)}, inset 0 0 20px ${alpha(theme.palette.primary.main, 0.05)}`,
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </motion.div>

          {/* Right Column - Image */}
          <Box sx={{ order: isMobile ? 1 : 2, display: 'flex', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.85, filter: shouldReduceMotion ? 'none' : 'blur(20px)' }}
              animate={isInView ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProfileCard
                name="Gading Aditya Perdana"
                title="AI Researcher & SWE Trainee"
                handle="gadingap"
                status="Available for Projects"
                contactText="Contact Me"
                avatarUrl={heroImg}
                showUserInfo={false}
                showDetails={false}
                enableTilt={!shouldReduceMotion}
                enableMobileTilt={!shouldReduceMotion}
                priority={true}
              />
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
