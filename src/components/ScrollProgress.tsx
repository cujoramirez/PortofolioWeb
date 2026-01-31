import { memo } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Box, alpha, useTheme } from '@mui/material';

const ScrollProgress = memo(() => {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        background: alpha(theme.palette.background.default, 0.5),
        backdropFilter: 'blur(4px)',
      }}
    >
      <motion.div
        style={{
          scaleX,
          height: '100%',
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.light, 0.8)} 50%, ${theme.palette.primary.main} 100%)`,
          transformOrigin: '0%',
          boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}, 0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      />
    </Box>
  );
});

ScrollProgress.displayName = 'ScrollProgress';

export default ScrollProgress;
