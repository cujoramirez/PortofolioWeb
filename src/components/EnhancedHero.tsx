import { memo, useCallback, useMemo, type PointerEvent, type PointerEventHandler } from 'react';
import { Box, Container, Typography, Button, Stack, Chip, alpha } from '@mui/material';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  type HTMLMotionProps,
  type MotionStyle,
  type ForwardRefComponent,
} from 'framer-motion';
import { useReducedMotionOverride } from '../hooks/useReducedMotionOverride';

type EnhancedHeroProps = {
  introComplete: boolean;
};

const MotionDiv = motion.div as ForwardRefComponent<HTMLDivElement, HTMLMotionProps<'div'>>;

type MotionSectionProps = HTMLMotionProps<'section'> & {
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
};

const MotionSection = motion.section as ForwardRefComponent<HTMLDivElement, MotionSectionProps>;

const EnhancedHero = memo(({ introComplete }: EnhancedHeroProps) => {
  const prefersReducedMotion = useReducedMotionOverride();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springConfig = useMemo<SpringOptions>(() => ({ stiffness: 180, damping: 26, mass: 0.6 }), []);

  const smoothX = useSpring(pointerX, springConfig);
  const smoothY = useSpring(pointerY, springConfig);

  const tiltRange = prefersReducedMotion ? 0 : 10;
  const tiltX = useTransform(smoothY, [0, 1], [tiltRange, -tiltRange]);
  const tiltY = useTransform(smoothX, [0, 1], [-tiltRange, tiltRange]);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      pointerX.set(Math.min(Math.max(x, 0), 1));
      pointerY.set(Math.min(Math.max(y, 0), 1));
    },
    [pointerX, pointerY],
  );

  const resetPointer = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

  const tags = useMemo(() => ['AI Systems', 'Research', 'Creative Engineering'], []);

  const baseTransition = prefersReducedMotion
    ? { duration: 0.25 }
    : { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] };

  const handleExploreClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('exploreMyWork'));
    }
  }, []);

  const containerMotionStyle: MotionStyle = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    rotateX: tiltX,
    rotateY: tiltY,
  };

  return (
    <MotionSection
      initial={{ opacity: introComplete ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={baseTransition}
      onPointerMove={prefersReducedMotion ? undefined : handlePointerMove}
      onPointerLeave={prefersReducedMotion ? undefined : resetPointer}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        background: 'transparent', // Changed to transparent to show SplashCursor
        color: '#f8fafc',
        isolation: 'isolate',
      }}
    >
      <MotionDiv style={containerMotionStyle} transition={baseTransition}>
        <Container
          maxWidth="lg"
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
            <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center" sx={{ maxWidth: '32rem' }}>
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
                      borderColor: alpha('#3b82f6', 0.35),
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
                background: 'linear-gradient(90deg, #1e40af 0%, #3b82f6 45%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: prefersReducedMotion ? 'none' : '0 24px 60px rgba(30, 64, 175, 0.35)',
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
              Welcome to my portfolio, where I blend creativity and technology, showcasing interfaces that unite advanced machine learning and research with elegant, polished design.
            </Typography>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0.1 } : { duration: 0.7, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ width: '100%' }}
          >
            <Stack direction="row" spacing={0} justifyContent="center" alignItems="center">
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              >
                <Button
                  variant="contained"
                  onClick={handleExploreClick}
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
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 45%, #22d3ee 100%)',
                    boxShadow: prefersReducedMotion
                      ? '0 12px 30px rgba(59,130,246,0.35)'
                      : '0 18px 48px rgba(59,130,246,0.45)',
                    transition: 'box-shadow 0.35s ease, transform 0.35s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #22d3ee 55%, #14b8a6 100%)',
                      boxShadow: '0 24px 70px rgba(59,130,246,0.55)',
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
                      background: 'linear-gradient(120deg, rgba(59,130,246,0.55), rgba(34,211,238,0.35))',
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
      </MotionDiv>
    </MotionSection>
  );
});

EnhancedHero.displayName = 'EnhancedHero';

export default EnhancedHero;
