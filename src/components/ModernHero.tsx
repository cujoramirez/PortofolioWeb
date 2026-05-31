import { useState, type ComponentProps, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, useReducedMotion, useMotionValue, useTransform, useSpring } from 'framer-motion';
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

// Detection-frame corner brackets (the "bounding box" around the portrait).
const BRACKETS = [
  { top: 10, left: 10, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: '8px' },
  { top: 10, right: 10, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: '8px' },
  { bottom: 10, left: 10, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: '8px' },
  { bottom: 10, right: 10, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: '8px' },
];

const ModernHero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const prefersReducedMotion = useReducedMotion();

  // Mobile gets a lighter (smaller) rise; reduced-motion zeroes it.
  const rise = prefersReducedMotion ? 0 : isMobile ? 12 : 20;

  // Hover "detection" state + a key to re-trigger the scanline sweep each hover.
  const [detecting, setDetecting] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  // Cursor parallax for the cutout (motion values stay off the React render path).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const parallaxSpring = { stiffness: 150, damping: 18, mass: 0.5 };
  const cutoutX = useSpring(useTransform(pointerX, [-1, 1], [-14, 14]), parallaxSpring);
  const cutoutY = useSpring(useTransform(pointerY, [-1, 1], [-14, 14]), parallaxSpring);

  const handlePortraitMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    pointerX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    pointerY.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const handlePortraitEnter = () => {
    if (prefersReducedMotion) return;
    setDetecting(true);
    setScanKey((k) => k + 1);
  };
  const handlePortraitLeave = () => {
    setDetecting(false);
    pointerX.set(0);
    pointerY.set(0);
  };

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

            {/* Capability line — gooey morph through formal, parallel phrases */}
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
                <GooeyText texts={HERO_PHRASES} holdTime={2.4} transitionTime={0.7} />
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

          {/* Right column — Vision-model detection portrait */}
          <Box sx={{ order: { xs: 1, md: 2 }, display: 'flex', justifyContent: 'center' }}>
            <Box
              onMouseMove={handlePortraitMove}
              onMouseEnter={handlePortraitEnter}
              onMouseLeave={handlePortraitLeave}
              sx={{
                position: 'relative',
                width: { xs: 'min(300px, 78vw)', md: 'min(380px, 34vw)' },
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
              }}
            >
              {/* Tinted backdrop card that grounds the portrait. */}
              <Box
                component={motion.div}
                variants={panelVariants}
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: '14% 0 0 0',
                  borderRadius: '24px',
                  border: '1px solid var(--app-palette-divider)',
                  background:
                    'linear-gradient(165deg, color-mix(in srgb, var(--app-palette-primary-main) 18%, var(--app-palette-bg-elevated)) 0%, color-mix(in srgb, var(--app-palette-secondary-main) 12%, var(--app-palette-bg-elevated)) 100%)',
                  boxShadow: detecting
                    ? '0 24px 60px rgba(0,0,0,0.42), 0 0 0 1px color-mix(in srgb, var(--app-palette-primary-main) 45%, transparent)'
                    : '0 24px 60px rgba(0,0,0,0.38)',
                  transformOrigin: 'bottom center',
                  transition: 'box-shadow 0.35s ease',
                  zIndex: 0,
                }}
              />

              {/* Scanline — clipped to the card; sweeps once on load and on each hover. */}
              {!prefersReducedMotion && (
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: '14% 0 0 0',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    zIndex: 2,
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    key={scanKey}
                    component={motion.div}
                    initial={{ top: '-8%', opacity: 0 }}
                    animate={{ top: '108%', opacity: detecting ? 0.95 : 0.7 }}
                    transition={{ duration: 1.3, ease }}
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background:
                        'linear-gradient(90deg, transparent, var(--app-palette-primary-main), var(--app-palette-secondary-main), transparent)',
                      boxShadow: '0 0 14px color-mix(in srgb, var(--app-palette-primary-main) 65%, transparent)',
                    }}
                  />
                </Box>
              )}

              {/* Cutout (load rise) wrapping a parallax layer (cursor depth). */}
              <Box component={motion.div} variants={cutoutVariants} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Box component={motion.div} style={{ x: cutoutX, y: cutoutY }} sx={{ width: '100%' }}>
                  <Box
                    component="img"
                    src={heroImg}
                    alt="Gading Aditya Perdana"
                    loading="eager"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      filter: 'drop-shadow(0 18px 36px rgba(0,0,0,0.4))',
                    }}
                  />
                </Box>
              </Box>

              {/* Detection HUD — boots up with a digital jitter on load, then settles.
                  Brackets are the bounding box; the bare TRACKING tag appears on hover. */}
              <Box
                component={motion.div}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : {
                        opacity: [0, 1, 0.25, 1, 0.6, 1, 0.85, 1],
                        x: [0, -3, 3, -2, 2, -1, 1, 0],
                        y: [0, 2, -3, 2, -1, 1, 0, 0],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0.3, delay: 0.4 }
                    : {
                        duration: 0.6,
                        delay: 0.45,
                        ease: 'linear',
                        times: [0, 0.12, 0.26, 0.4, 0.55, 0.7, 0.85, 1],
                      }
                }
                sx={{ position: 'absolute', inset: '14% 0 0 0', zIndex: 3, pointerEvents: 'none' }}
              >
                {BRACKETS.map((b, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: 'absolute',
                      width: 22,
                      height: 22,
                      borderStyle: 'solid',
                      borderColor: detecting
                        ? 'var(--app-palette-primary-main)'
                        : 'var(--app-palette-label-tertiary)',
                      borderTopWidth: 0,
                      borderRightWidth: 0,
                      borderBottomWidth: 0,
                      borderLeftWidth: 0,
                      transform: detecting ? 'scale(1.08)' : 'scale(1)',
                      filter: detecting
                        ? 'drop-shadow(0 0 6px color-mix(in srgb, var(--app-palette-primary-main) 70%, transparent))'
                        : 'none',
                      transition: 'border-color 0.3s ease, transform 0.3s ease, filter 0.3s ease',
                      ...b,
                    }}
                  />
                ))}

                {/* Bare HUD tag (no pill) — fades in on hover */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 14,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--app-palette-label-secondary)',
                    textShadow: '0 1px 8px rgba(0,0,0,0.7)',
                    opacity: detecting ? 1 : 0,
                    transform: detecting ? 'translateY(0)' : 'translateY(-4px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'var(--app-palette-primary-main)',
                      boxShadow: '0 0 8px var(--app-palette-primary-main)',
                    }}
                  />
                  Tracking
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ModernHero;
