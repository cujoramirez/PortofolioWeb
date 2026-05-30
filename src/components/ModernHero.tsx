import { useRef, type RefObject, type ComponentProps } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
  SvgIcon,
} from '@mui/material';
import { GitHub, LinkedIn, Email, ArrowDownward } from '@mui/icons-material';
import { useSystemProfile } from './useSystemProfile';
import RotatingText from './RotatingText';
import heroImg from '../assets/GadingAdityaPerdana.webp';
import { HERO_CONTENT } from '../constants/index';
import ProfileCard from './ProfileCard';

// Custom Google Scholar icon
const GoogleScholarIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
  </SvgIcon>
);

const RESEARCH_INTERESTS = [
  'Vision Transformers',
  'Ensemble Learning',
  'Model Calibration',
  'Computer Vision',
];

const SOCIAL_LINKS = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: GoogleScholarIcon, url: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', label: 'Google Scholar' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const ModernHero = () => {
  const { performanceTier } = useSystemProfile();
  const heroRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isInView = useInView(heroRef as RefObject<Element>, { once: true });

  const shouldReduceMotion = performanceTier === 'low' || isMobile;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease },
    },
  };

  return (
    <Box
      ref={heroRef}
      component="div"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: { xs: 'auto', md: '100svh' },
        overflow: 'hidden',
        // Token-driven background: tint layers over the base surface so it
        // reads intentionally in BOTH light and dark schemes.
        backgroundColor: 'var(--app-palette-bg-base)',
        backgroundImage: `
          radial-gradient(60% 80% at 12% 0%, color-mix(in srgb, var(--app-palette-primary-main) 12%, transparent) 0%, transparent 60%),
          radial-gradient(50% 70% at 100% 100%, color-mix(in srgb, var(--app-palette-secondary-main) 10%, transparent) 0%, transparent 60%)
        `,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left column — content */}
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            {/* Eyebrow / role tag */}
            <Box component={motion.div} variants={itemVariants}>
              <Typography
                variant="overline"
                sx={{
                  color: 'var(--app-palette-primary-main)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2,
                  '&::before': {
                    content: '""',
                    width: 28,
                    height: '1px',
                    bgcolor: 'currentColor',
                    opacity: 0.6,
                  },
                }}
              >
                AI Researcher
              </Typography>
            </Box>

            {/* Headline — the one allowed gradient-text accent on the site */}
            <Box component={motion.div} variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  mb: 2,
                  background: `linear-gradient(120deg, var(--app-palette-text-primary) 0%, var(--app-palette-text-primary) 45%, var(--app-palette-primary-main) 80%, var(--app-palette-secondary-main) 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Gading Aditya Perdana
              </Typography>
            </Box>

            {/* Rotating research interests */}
            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 1, mb: 3 }}
            >
              <Typography variant="h5" component="span" sx={{ color: 'var(--app-palette-text-secondary)', fontWeight: 400 }}>
                Researching
              </Typography>
              <Typography
                variant="h5"
                component="span"
                sx={{ color: 'var(--app-palette-primary-main)', fontWeight: 600 }}
              >
                <RotatingText
                  texts={RESEARCH_INTERESTS}
                  rotationInterval={3000}
                  staggerDuration={0.02}
                  staggerFrom="first"
                  animatePresenceMode="wait"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  auto
                  loop
                />
              </Typography>
            </Box>

            {/* Lede — HERO_CONTENT, constrained to a readable measure */}
            <Box component={motion.div} variants={itemVariants}>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--app-palette-label-secondary)',
                  maxWidth: '60ch',
                  fontSize: { xs: '1rem', md: '1.0625rem' },
                  lineHeight: 1.75,
                  mb: 4,
                }}
              >
                {HERO_CONTENT}
              </Typography>
            </Box>

            {/* Actions */}
            <Box
              component={motion.div}
              variants={itemVariants}
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
            >
              <Button
                variant="contained"
                size="large"
                href="#projects"
                sx={{ px: 3.5, py: 1.25 }}
              >
                View Projects
              </Button>
              <Button
                variant="text"
                size="large"
                href="#contact"
                endIcon={<ArrowDownward fontSize="small" />}
                sx={{ px: 2, py: 1.25, color: 'var(--app-palette-text-primary)' }}
              >
                Get in Touch
              </Button>

              <Box sx={{ display: 'flex', gap: 0.5, ml: { xs: 0, sm: 1 } }}>
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
                        color: 'var(--app-palette-label-tertiary)',
                        transition: 'color 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        '&:hover': { color: 'var(--app-palette-primary-main)' },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Right column — profile card */}
          <Box
            component={motion.div}
            variants={itemVariants}
            sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center' }}
          >
            <ProfileCard
              name="Gading Aditya Perdana"
              title="AI Researcher"
              handle="gadingap"
              status="Apple Developer Academy Scholar"
              contactText="Contact Me"
              avatarUrl={heroImg}
              showUserInfo={false}
              showDetails={false}
              enableTilt={!shouldReduceMotion}
              enableMobileTilt={false}
              priority={true}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
