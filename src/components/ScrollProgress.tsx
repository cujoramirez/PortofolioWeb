import { memo, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Box, alpha, useTheme } from '@mui/material';

const ScrollProgress = memo(() => {
  const theme = useTheme();
  const scrollProgress = useMotionValue(0);
  const scaleX = useSpring(scrollProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      scrollProgress.set(progress);
    };

    // Initial update
    updateProgress();

    // Listen to scroll events
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [scrollProgress]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          scaleX,
          height: '100%',
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${theme.palette.primary.main} 50%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          transformOrigin: '0%',
          boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.3)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.15)}`,
        }}
      />
    </Box>
  );
});

ScrollProgress.displayName = 'ScrollProgress';

export default ScrollProgress;
