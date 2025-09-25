import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  alpha
} from '@mui/material';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion
} from 'framer-motion';

const MotionBox = motion(Box);

const EnhancedHero = ({ introComplete }) => {
  const prefersReducedMotion = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = useMemo(() => ({ stiffness: 180, damping: 26, mass: 0.6 }), []);

  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const tiltRange = prefersReducedMotion ? 0 : 10;
  const tiltX = useTransform(smoothY, [0, 1], [tiltRange, -tiltRange]);
  const tiltY = useTransform(smoothX, [0, 1], [-tiltRange, tiltRange]);
  const accentRotation = useTransform(smoothX, [0, 1], [-6, 6]);
  const glowX = useTransform(smoothX, [0, 1], ['12%', '88%']);
  const glowY = useTransform(smoothY, [0, 1], ['18%', '82%']);
  const rippleScale = useTransform(
    smoothY,
    [0, 1],
    [prefersReducedMotion ? 1 : 0.94, prefersReducedMotion ? 1 : 1.05]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      pointerX.set(Math.min(Math.max(x, 0), 1));
      pointerY.set(Math.min(Math.max(y, 0), 1));
    },
    [pointerX, pointerY]
  );

  const resetPointer = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

  const tags = useMemo(
    () => ['AI Systems', 'Research', 'Creative Engineering'],
    []
  );

  const baseTransition = prefersReducedMotion
    ? { duration: 0.25 }
    : { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] };

  return (
    <MotionBox
      component="section"
      initial={{ opacity: introComplete ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={baseTransition}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
      onPointerLeave={prefersReducedMotion ? undefined : resetPointer}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 150% 120% at 50% 0%, #1e293b 0%, #0f172a 35%, #020617 70%, #000 100%),
          linear-gradient(180deg, #000814 0%, #001d3d 30%, #003566 60%, #001122 100%)
        `,
        color: '#f8fafc',
        isolation: 'isolate',
      }}
    >
      <Box
        className="absolute inset-0 pointer-events-none"
        sx={{
          background: `
            radial-gradient(circle at 20% 15%, rgba(99,102,241,0.4), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34,211,238,0.35), transparent 55%),
            radial-gradient(circle at 40% 85%, rgba(168,85,247,0.25), transparent 45%)
          `,
          opacity: prefersReducedMotion ? 0.6 : 0.8,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-full mix-blend-screen blur-3xl"
        style={{
          left: glowX,
          top: glowY,
          width: '45vw',
          height: '45vw',
          minWidth: 320,
          minHeight: 320,
          background: 'radial-gradient(circle at center, rgba(99,102,241,0.5), transparent 70%)',
          transform: 'translate(-50%, -50%)',
          rotate: accentRotation,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 25% 25%, rgba(168,85,247,0.15), transparent 60%),
            radial-gradient(ellipse 70% 50% at 75% 30%, rgba(59,130,246,0.18), transparent 65%),
            radial-gradient(ellipse 90% 40% at 50% 80%, rgba(34,211,238,0.12), transparent 70%)
          `,
          opacity: prefersReducedMotion ? 0.4 : 0.6,
          rotate: prefersReducedMotion ? 0 : accentRotation,
          scale: rippleScale,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, 
              transparent 0%, 
              transparent 40%,
              rgba(99,102,241,0.08) 60%, 
              rgba(34,211,238,0.06) 70%, 
              rgba(14,116,144,0.12) 80%, 
              rgba(0,0,0,0.6) 95%, 
              rgba(0,0,0,0.9) 100%
            )
          `,
          backdropFilter: prefersReducedMotion ? 'blur(0px)' : 'blur(20px)',
        }}
      />

      <Container
        maxWidth="lg"
        component={motion.div}
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
        }}
        transition={baseTransition}
        sx={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: { xs: 4, md: 5 },
          px: { xs: 3, sm: 6 },
          py: { xs: 8, md: 10 },
          height: '100%',
        }}
      >
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Stack
            className="max-w-xl"
            direction="row"
            spacing={1.5}
            flexWrap="wrap"
            justifyContent="center"
          >
            {tags.map((tag) => (
              <motion.div
                key={tag}
                whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <Chip
                  label={tag}
                  variant="outlined"
                  sx={{
                    borderColor: alpha('#a855f7', 0.35),
                    color: alpha('#e0f2fe', 0.9),
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    backgroundColor: alpha('#0f172a', 0.6),
                    backdropFilter: 'blur(12px)',
                  }}
                />
              </motion.div>
            ))}
          </Stack>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.72, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '2.8rem', sm: '3.2rem', md: '4rem', lg: '4.6rem' },
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              background: 'linear-gradient(90deg, #6366f1 0%, #a855f7 45%, #22d3ee 100%)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              textShadow: prefersReducedMotion
                ? 'none'
                : '0 24px 60px rgba(79, 70, 229, 0.35)',
            }}
          >
            Gading Aditya Perdana
          </Typography>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.7, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Typography
            variant="h6"
            sx={{
              maxWidth: '720px',
              color: alpha('#e2e8f0', 0.86),
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: '1.05rem', md: '1.2rem' },
            }}
          >
            Welcome to my portfolio, where I blend creativity and technology,
            showcasing interfaces that unite advanced machine learning and research with elegant, polished design.
          </Typography>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.7, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%' }}
        >
          <Stack
            direction="row"
            spacing={0}
            justifyContent="center"
            alignItems="center"
          >
            <motion.div
              whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('exploreMyWork'));
                }}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  px: { xs: 4.5, md: 6 },
                  py: { xs: 2, md: 2.4 },
                  borderRadius: '999px',
                  fontSize: { xs: '1.05rem', md: '1.18rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  letterSpacing: '0.015em',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 45%, #22d3ee 100%)',
                  boxShadow: prefersReducedMotion
                    ? '0 12px 30px rgba(99,102,241,0.35)'
                    : '0 18px 48px rgba(99,102,241,0.45)',
                  transition: 'box-shadow 0.35s ease, transform 0.35s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #22d3ee 55%, #14b8a6 100%)',
                    boxShadow: '0 24px 70px rgba(99,102,241,0.55)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '999px',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.08) 55%, transparent 100%)',
                    opacity: 0,
                    transform: 'translateX(-20%)',
                    transition: 'opacity 0.45s ease, transform 0.6s ease',
                  },
                  '&:hover::before': {
                    opacity: 1,
                    transform: 'translateX(0%)',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: '-1px',
                    borderRadius: '999px',
                    background: 'linear-gradient(120deg, rgba(99,102,241,0.55), rgba(34,211,238,0.35))',
                    zIndex: -1,
                    filter: 'blur(18px)',
                    opacity: prefersReducedMotion ? 0.45 : 0.65,
                  },
                }}
              >
                Explore My Work
              </Button>
            </motion.div>
          </Stack>
        </motion.div>
      </Container>
    </MotionBox>
  );
};

export default EnhancedHero;

