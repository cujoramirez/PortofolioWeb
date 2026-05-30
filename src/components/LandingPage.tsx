import { memo } from 'react';
import { Box } from '@mui/material';
import ModernHero from './ModernHero';

// Props kept for API compatibility but no longer used internally
interface LandingPageProps {
  introComplete?: boolean;
  onNavbarVisibilityChange?: (visible: boolean) => void;
  onLandingComplete?: (complete: boolean) => void;
}

/**
 * Simplified LandingPage - renders the lightweight, token-based hero.
 * The previous WebGL/OGL orb (and its error boundary) have been retired.
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
      <ModernHero />
    </Box>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
