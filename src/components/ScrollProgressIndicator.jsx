import React from 'react';
import { motion, useScroll } from 'framer-motion';
import { Box } from '@mui/material';

const ScrollProgressIndicator = () => {
  const { scrollYProgress } = useScroll();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
      }}
    >
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
          transformOrigin: '0%',
          scaleX: scrollYProgress,
        }}
      />
    </Box>
  );
};

export default ScrollProgressIndicator;

