import { Suspense, lazy, memo } from 'react';
import { motion, MotionConfig } from 'framer-motion';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { muiTheme } from './theme/muiTheme.js';
import LandingPage from './components/LandingPage';
import AboutErrorBoundary from './components/AboutErrorBoundary';
import ModernNavbar from './components/ModernNavbar';
import GradualBlur from './components/GradualBlur';
import { LenisProvider } from './components/LenisProvider';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import SectionDivider from './components/SectionDivider';

// Lazy load all heavy components for better initial load performance
const ModernAbout = lazy(() => import('./components/ModernAbout'));
const Technologies = lazy(() => import('./components/Technologies'));
const ModernExperience = lazy(() => import('./components/ModernExperience'));
const ModernResearch = lazy(() => import('./components/ModernResearch'));
const ModernProjects = lazy(() => import('./components/ModernProjects'));
const OptimizedCertifications = lazy(() => import('./components/OptimizedCertifications'));
const OptimizedModernContact = lazy(() => import('./components/OptimizedModernContact'));

// Lightweight loading fallback
const SectionLoader = memo(() => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, minHeight: '200px' }}>
    <CircularProgress size={32} sx={{ color: 'primary.main' }} />
  </Box>
));
SectionLoader.displayName = 'SectionLoader';

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
            {/* Scroll Progress Indicator */}
            <ScrollProgress />
            
            {/* Back to Top Button */}
            <BackToTop />

            {/* Background Gradient */}
            <Box
              sx={{
                position: 'fixed',
                inset: 0,
                zIndex: -2,
                background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
              }}
            />

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

              {/* Landing Page with Hero */}
              <section id="hero" aria-label="Introduction">
                <LandingPage
                  introComplete={true}
                  onNavbarVisibilityChange={() => {}}
                  onLandingComplete={() => {}}
                />
              </section>
              
              <SectionDivider variant="gradient" />
              
              {/* About Section */}
              <section id="about" aria-label="About me">
                <AboutErrorBoundary>
                  <Suspense fallback={<SectionLoader />}>
                    <ModernAbout landingComplete={true} />
                  </Suspense>
                </AboutErrorBoundary>
              </section>
              
              <SectionDivider variant="dots" />
              
              {/* Technologies Section */}
              <section id="technologies" aria-label="Technologies and skills">
                <Suspense fallback={<SectionLoader />}>
                  <Technologies />
                </Suspense>
              </section>
              
              <SectionDivider variant="line" />
              
              {/* Experience Section */}
              <section id="experience" aria-label="Work experience">
                <Suspense fallback={<SectionLoader />}>
                  <ModernExperience />
                </Suspense>
              </section>
              
              <SectionDivider variant="gradient" />
              
              {/* Research Section */}
              <section id="research" aria-label="Research and publications">
                <Suspense fallback={<SectionLoader />}>
                  <ModernResearch />
                </Suspense>
              </section>
              
              <SectionDivider variant="dots" />
              
              {/* Projects Section */}
              <section id="projects" aria-label="Featured projects">
                <Suspense fallback={<SectionLoader />}>
                  <ModernProjects />
                </Suspense>
              </section>
              
              <SectionDivider variant="line" />
              
              {/* Certifications Section */}
              <section id="certifications" aria-label="Certifications and credentials">
                <Suspense fallback={<SectionLoader />}>
                  <OptimizedCertifications />
                </Suspense>
              </section>

              <SectionDivider variant="gradient" />

              {/* Contact Section */}
              <section id="contact" aria-label="Contact information">
                <Suspense fallback={<SectionLoader />}>
                  <OptimizedModernContact />
                </Suspense>
              </section>
            </Box>

            <GradualBlur
              target="page"
              position="bottom"
              height="7rem"
              strength={0.25}
              divCount={6}
              curve="bezier"
              exponential
              opacity={0.95}
              zIndex={1500}
            />
          </motion.div>
        </MotionConfig>
      </ThemeProvider>
    </LenisProvider>
  );
};

export default ModernApp;
