import type { ComponentProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
import heroImg from '../assets/GadingAdityaPerdana.webp';
import { HERO_CONTENT } from '../constants/index';
import { GooeyText } from './GooeyText';

// Custom Google Scholar icon
const GoogleScholarIcon = (props: ComponentProps<typeof SvgIcon>) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" />
  </SvgIcon>
);

// Rotating capability phrases (gooey morph). Component-level presentation copy;
// constants stay frozen. Formal, parallel, research + building as peers.
const HERO_PHRASES = [
  'I research computer vision',
  'I publish peer-reviewed work',
  'I build software',
  'I design interfaces',
];

const SOCIAL_LINKS = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: GoogleScholarIcon, url: 'https://scholar.google.com/citations?user=hwbWuI0AAAAJ', label: 'Google Scholar' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const ModernHero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersReducedMotion = useReducedMotion();

  // Mobile gets a lighter (smaller) rise; reduced-motion zeroes it.
  const rise = prefersReducedMotion ? 0 : isMobile ? 12 : 20;

  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.09, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: rise },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  // Signature headline reveal: a left-to-right clip wipe (fade only under reduced-motion).
  const nameVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }
    : {
        hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
        visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)', transition: { duration: 0.85, ease } },
      };

  const panelVariants = {
    hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.92 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease } },
  };

  const cutoutVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 26 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease, delay: 0.1 } },
  };

  return (
    <Box
      component="div"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: { xs: 'auto', md: '100svh' },
        // No section-specific background — inherits the shared body surface.
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          component={motion.div}
          variants={container}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
            gap: { xs: 5, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left column — content */}
          <Box sx={{ order: { xs: 2, md: 1 } }}>
            {/* Eyebrow */}
            <Box component={motion.div} variants={item}>
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
            <Box component={motion.div} variants={nameVariants}>
              <Typography
                variant="h1"
                sx={{
                  mb: 2.5,
                  background:
                    'linear-gradient(120deg, var(--app-palette-text-primary) 0%, var(--app-palette-text-primary) 45%, var(--app-palette-primary-main) 80%, var(--app-palette-secondary-main) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                }}
              >
                Gading Aditya Perdana
              </Typography>
            </Box>

            {/* Capability line — gooey morph through formal, parallel phrases
                (replaces the retired character-rotating line). */}
            <Box component={motion.div} variants={item} sx={{ mb: 3 }}>
              <Box
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 'clamp(1.15rem, 1.2vw + 0.9rem, 1.5rem)',
                  lineHeight: 1.4,
                  color: 'var(--app-palette-label-primary)',
                  minHeight: '1.6em',
                }}
              >
                <GooeyText
                  texts={HERO_PHRASES}
                  holdTime={2.4}
                  transitionTime={0.7}
                />
              </Box>
            </Box>

            {/* Frozen research paragraph */}
            <Box component={motion.div} variants={item}>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--app-palette-label-secondary)',
                  maxWidth: '60ch',
                  fontSize: { xs: '0.95rem', md: '1rem' },
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
              variants={item}
              sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
            >
              <Button variant="contained" size="large" href="#projects" sx={{ px: 3.5, py: 1.25 }}>
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

          {/* Right column — Shape Breakout portrait */}
          <Box sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: 'min(300px, 78vw)', md: 'min(380px, 34vw)' },
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Tinted panel behind the cutout — adapts light/dark via color-mix over bg-elevated.
                  `top` controls how far the head/shoulders break above the panel. */}
              <Box
                component={motion.div}
                variants={panelVariants}
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: '15% 0 0 0',
                  borderRadius: '24px',
                  border: '1px solid var(--app-palette-divider)',
                  background:
                    'linear-gradient(165deg, color-mix(in srgb, var(--app-palette-primary-main) 14%, var(--app-palette-bg-elevated)) 0%, color-mix(in srgb, var(--app-palette-secondary-main) 10%, var(--app-palette-bg-elevated)) 100%)',
                  transformOrigin: 'bottom center',
                  zIndex: 0,
                }}
              />
              {/* Transparent cutout in front; drop-shadow lifts the dark suit off the panel */}
              <Box component={motion.div} variants={cutoutVariants} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Box
                  component="img"
                  src={heroImg}
                  alt="Gading Aditya Perdana"
                  loading="eager"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    filter: 'drop-shadow(0 16px 28px rgba(0,0,0,0.35))',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
