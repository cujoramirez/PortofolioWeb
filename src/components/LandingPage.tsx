import { memo } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import ModernHero from './ModernHero';
import WebGLErrorBoundary from './WebGLErrorBoundary';

// Props kept for API compatibility but no longer used internally
interface LandingPageProps {
  introComplete?: boolean;
  onNavbarVisibilityChange?: (visible: boolean) => void;
  onLandingComplete?: (complete: boolean) => void;
}

const MotionBox = motion(Box);

/**
 * Simplified LandingPage - removed scroll lock and complex landing sequence
 * for better mobile performance and user experience
 */
const LandingPage = memo((_props: LandingPageProps) => {
  return (
    <MotionBox
      id="main-hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      sx={{
        position: 'relative',
        width: '100%',
        zIndex: 1,
      }}
    >
      <WebGLErrorBoundary>
        <ModernHero />
      </WebGLErrorBoundary>
    </MotionBox>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
