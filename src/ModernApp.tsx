import { Suspense, lazy, memo } from 'react';
import type { ReactNode } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { muiTheme } from './theme/muiTheme.js';
import LandingPage from './components/LandingPage';
import AboutErrorBoundary from './components/AboutErrorBoundary';
import ModernNavbar from './components/ModernNavbar';
import { LenisProvider } from './components/LenisProvider';
import BackToTop from './components/BackToTop';

// Lazy load all heavy components for better initial load performance
const ModernAbout = lazy(() => import('./components/ModernAbout'));
const ModernExperience = lazy(() => import('./components/ModernExperience'));
const ModernResearch = lazy(() => import('./components/ModernResearch'));
const ModernProjects = lazy(() => import('./components/ModernProjects'));
const OptimizedModernContact = lazy(() => import('./components/OptimizedModernContact'));

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

const ModernApp = () => {
  return (
    <LenisProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
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
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: 'white',
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
