import { useRef, type RefObject } from 'react';
import { motion, useInView } from 'framer-motion';
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
import heroImg from '../assets/GadingAdityaPerdana.jpg';
import resumePDF from '../assets/Gading_Resume.pdf';
import { useLenis } from '../hooks/useLenis';
import ProfileCard from './ProfileCard';

// Custom Google Scholar icon
const GoogleScholarIcon = (props: React.ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
  </SvgIcon>
);

const TYPING_ROLES = [
  'AI/ML Engineer',
  'Machine Learning Researcher',
  'Computer Vision Specialist',
  'Deep Learning Engineer',
];

const SOCIAL_LINKS = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: GoogleScholarIcon, url: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', label: 'Google Scholar' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const SKILLS = ['PyTorch', 'TensorFlow', 'Computer Vision', 'Deep Learning', 'Python', 'React'];

const ModernHero = () => {
  const { performanceTier } = useSystemProfile();
  const heroRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const { lenis } = useLenis();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isInView = useInView(heroRef as RefObject<Element>, { once: true });

  // Simplified - direct computation is faster than useMemo for simple booleans
  const shouldReduceMotion = performanceTier === 'low' || isMobile;

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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 400px' },
            gap: { xs: 6, lg: 10 },
            alignItems: 'center',
            py: { xs: 8, md: 0 },
          }}
        >
          {/* Left Column - Content */}
          <Box sx={{ order: { xs: 2, lg: 1 }, position: 'relative', zIndex: 15 }}>
            {/* Greeting */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
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
                Welcome to my portfolio
              </Typography>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem', lg: '4.5rem' },
                  lineHeight: 1.1,
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.text.primary, 0.8)} 100%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'gradientShift 8s ease infinite',
                  '@keyframes gradientShift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                  },
                }}
              >
                Gading Aditya
                <br />
                Perdana
              </Typography>
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    color: 'text.secondary',
                  }}
                >
                  I'm a{' '}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    minWidth: { xs: '180px', md: '280px' },
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
                      damping: 20,
                      stiffness: 150,
                    }}
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    auto
                    loop
                  />
                </Typography>
              </Box>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  lineHeight: 1.8,
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 550,
                }}
              >
                First-generation undergraduate researcher with five published papers in 
                ensemble learning, model calibration, and computer vision. Passionate about 
                advancing AI through innovative research and practical applications.
              </Typography>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{ position: 'relative', zIndex: 20 }}
            >
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 5, position: 'relative', zIndex: 20 }}>
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
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  View My Work
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Download />}
                  href={resumePDF}
                  target="_blank"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderColor: alpha(theme.palette.divider, 0.3),
                    color: 'text.primary',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  Resume
                </Button>

                {/* Social Links */}
                <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 1 }, position: 'relative', zIndex: 10 }}>
                  {SOCIAL_LINKS.map((social) => {
                    const Icon = social.icon;
                    return (
                      <IconButton
                        key={social.label}
                        component="a"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        aria-label={social.label}
                        sx={{
                          color: 'text.secondary',
                          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            color: 'primary.main',
                            borderColor: alpha(theme.palette.primary.main, 0.4),
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                          },
                        }}
                      >
                        <Icon fontSize="small" />
                      </IconButton>
                    );
                  })}
                </Box>
              </Box>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 600,
                  letterSpacing: 2,
                  mb: 2,
                  display: 'block',
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
                      duration: 0.3, 
                      delay: shouldReduceMotion ? 0 : 0.6 + index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    whileHover={shouldReduceMotion ? {} : { 
                      scale: 1.08,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <Chip
                      label={skill}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: 'primary.main',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                        fontWeight: 500,
                        cursor: 'default',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.15),
                          borderColor: alpha(theme.palette.primary.main, 0.4),
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                        },
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* Right Column - Image */}
          <Box sx={{ order: { xs: 1, lg: 2 }, display: 'flex', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <ProfileCard
                name="Gading Aditya Perdana"
                title="AI/ML Engineer & Researcher"
                handle="gadingap"
                status="Available for Projects"
                contactText="Contact Me"
                avatarUrl={heroImg}
                showUserInfo={false}
                showDetails={false}
                enableTilt={!shouldReduceMotion}
                enableMobileTilt={!shouldReduceMotion}
              />
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
