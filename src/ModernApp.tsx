import { Suspense, lazy, memo } from 'react';
import type { ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'framer-motion';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { muiTheme } from './theme/muiTheme.js';
import LandingPage from './components/LandingPage';
import AboutErrorBoundary from './components/AboutErrorBoundary';
import ErrorBoundary from './components/ErrorBoundary';
import ModernNavbar from './components/ModernNavbar';
import { LenisProvider } from './components/LenisProvider';
import BackToTop from './components/BackToTop';

// Lazy load all heavy components for better initial load performance
const ModernAbout = lazy(() => import('./components/ModernAbout'));
const ModernExperience = lazy(() => import('./components/ModernExperience'));
const ModernResearch = lazy(() => import('./components/ModernResearch'));
const ModernProjects = lazy(() => import('./components/ModernProjects'));
const OptimizedModernContact = lazy(() => import('./components/OptimizedModernContact'));
// Heavy WebGL background — lazy so `three` lands in a deferred chunk, not initial load.
const ColorBends = lazy(() => import('./components/ColorBends'));

// Lightweight loading fallback
const SectionLoader = memo(() => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: '200px' }}>
    <CircularProgress size={32} sx={{ color: 'primary.main' }} />
  </Box>
));
SectionLoader.displayName = 'SectionLoader';

// Centered content column capped to the design content width with consistent gutters.
const ContentColumn = ({ children }: { children: ReactNode }) => (
  <Box sx={{ maxWidth: 'var(--content-max)', mx: 'auto', px: 'var(--gutter)', width: '100%' }}>
    {children}
  </Box>
);

// Blue→cyan token family, tuned per scheme; the shader lerps between these on toggle.
const DARK_BENDS = ['#3b82f6', '#22d3ee', '#60a5fa'];
const LIGHT_BENDS = ['#2563eb', '#06b6d4', '#3b82f6'];

// Static token tint — the reduced-motion path AND the Suspense fallback while `three` loads.
const TINT_BG = `
  radial-gradient(55% 45% at 12% 0%, color-mix(in srgb, var(--app-palette-primary-main) 6%, transparent) 0%, transparent 70%),
  radial-gradient(50% 50% at 100% 100%, color-mix(in srgb, var(--app-palette-secondary-main) 5%, transparent) 0%, transparent 70%)
`;

// One fixed layer behind ALL content (no per-section seams). Animated ColorBends when
// motion is allowed; the static tint otherwise.
const GlobalBackground = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const { mode, systemMode } = useColorScheme();
  const resolved: 'light' | 'dark' = (mode === 'system' ? systemMode : mode) === 'light' ? 'light' : 'dark';

  const tint = (
    <Box aria-hidden sx={{ position: 'fixed', inset: 0, height: '100dvh', zIndex: 0, pointerEvents: 'none', background: TINT_BG }} />
  );

  const content = prefersReducedMotion ? (
    tint
  ) : (
    <ErrorBoundary fallback={tint}>
      <Suspense fallback={tint}>
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            height: '100dvh',
            zIndex: 0,
            pointerEvents: 'none',
            opacity: resolved === 'light' ? 0.4 : 0.6,
            transition: 'opacity 0.6s ease',
          }}
        >
          <ColorBends
            colors={resolved === 'light' ? LIGHT_BENDS : DARK_BENDS}
            transparent
            rotation={90}
            autoRotate={0}
            speed={0.15}
            scale={1.15}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.5}
            parallax={0.4}
            noise={0.05}
            iterations={1}
            intensity={1.35}
            bandWidth={7}
            colorTransition={0.6}
            maxPixelRatio={1.5}
            style={{ width: '100%', height: '100dvh' }}
          />
        </Box>
      </Suspense>
    </ErrorBoundary>
  );

  return content;
});
GlobalBackground.displayName = 'GlobalBackground';

const ModernApp = () => {
  return (
    <LenisProvider>
      <ThemeProvider theme={muiTheme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline enableColorScheme />
        <MotionConfig
          reducedMotion="user"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          {/* Skip to main content link for accessibility */}
          <Box
            component="a"
            href="#about"
            sx={{
              position: 'absolute',
              left: '-9999px',
              zIndex: 9999,
              padding: '1rem',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              textDecoration: 'none',
              fontWeight: 600,
              borderRadius: '0 0 8px 0',
              '&:focus': {
                left: 0,
                top: 0,
              },
            }}
          >
            Skip to main content
          </Box>

          {/* Main App Content - No loading screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Back to Top Button */}
            <BackToTop />

            {/* Global animated background — ColorBends WebGL when motion is allowed,
                static token tint as the reduced-motion path and Suspense fallback. */}
            <GlobalBackground />

            {/* Main Container */}
            <Box
              component="main"
              role="main"
              aria-label="Main content"
              sx={{
                position: 'relative',
                zIndex: 1,
                minHeight: '100vh',
              }}
            >
              {/* Navigation */}
              <ModernNavbar />

              {/* 1. Landing Page with Hero (full-bleed; self-manages height — no
                  section padding on desktop so it doesn't stack on top of the
                  hero's own viewport min-height). */}
              <Box component="section" id="hero" aria-label="Introduction" sx={{ py: { xs: 'var(--section-py)', md: 0 } }}>
                <LandingPage
                  introComplete={true}
                  onNavbarVisibilityChange={() => {}}
                  onLandingComplete={() => {}}
                />
              </Box>

              {/* 2. About Section */}
              <Box component="section" id="about" aria-label="About me" sx={{ py: 'var(--section-py)' }}>
                <ContentColumn>
                  <AboutErrorBoundary>
                    <Suspense fallback={<SectionLoader />}>
                      <ModernAbout />
                    </Suspense>
                  </AboutErrorBoundary>
                </ContentColumn>
              </Box>

              {/* 3. Research Section */}
              <Box component="section" id="research" aria-label="Research and publications" sx={{ py: 'var(--section-py)' }}>
                <ContentColumn>
                  <Suspense fallback={<SectionLoader />}>
                    <ModernResearch />
                  </Suspense>
                </ContentColumn>
              </Box>

              {/* 4. Projects Section */}
              <Box component="section" id="projects" aria-label="Featured projects" sx={{ py: 'var(--section-py)' }}>
                <ContentColumn>
                  <Suspense fallback={<SectionLoader />}>
                    <ModernProjects />
                  </Suspense>
                </ContentColumn>
              </Box>

              {/* 5. Experience Section */}
              <Box component="section" id="experience" aria-label="Work experience" sx={{ py: 'var(--section-py)' }}>
                <ContentColumn>
                  <Suspense fallback={<SectionLoader />}>
                    <ModernExperience />
                  </Suspense>
                </ContentColumn>
              </Box>

              {/* 6. Contact Section */}
              <Box component="section" id="contact" aria-label="Contact information" sx={{ py: 'var(--section-py)' }}>
                <ContentColumn>
                  <Suspense fallback={<SectionLoader />}>
                    <OptimizedModernContact />
                  </Suspense>
                </ContentColumn>
              </Box>
            </Box>
          </motion.div>
        </MotionConfig>

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </LenisProvider>
  );
};

export default ModernApp;
