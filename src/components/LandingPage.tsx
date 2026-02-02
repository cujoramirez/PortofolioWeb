import { memo } from 'react';
import { Box } from '@mui/material';
import ModernHero from './ModernHero';
import WebGLErrorBoundary from './WebGLErrorBoundary';

// Props kept for API compatibility but no longer used internally
interface LandingPageProps {
  introComplete?: boolean;
  onNavbarVisibilityChange?: (visible: boolean) => void;
  onLandingComplete?: (complete: boolean) => void;
}

/**
 * Simplified LandingPage - removed scroll lock and complex landing sequence
 * for better mobile performance and user experience
 */
const LandingPage = memo((_props: LandingPageProps) => {
  return (
    <Box
      id="main-hero"
      sx={{
        position: 'relative',
        width: '100%',
        zIndex: 1,
      }}
    >
      <WebGLErrorBoundary>
        <ModernHero />
      </WebGLErrorBoundary>
    </Box>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
