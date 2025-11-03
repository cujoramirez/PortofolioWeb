import { useState, Suspense, useMemo, lazy } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { muiTheme } from './theme/muiTheme.js';
import { useSystemProfile } from './components/useSystemProfile';
import { getPerformanceProfile } from './utils/performanceOptimizations.js';
import LandingPage from './components/LandingPage';
import WebGLErrorBoundary from './components/WebGLErrorBoundary';
import AboutErrorBoundary from './components/AboutErrorBoundary';
import ModernNavbar from './components/ModernNavbar';
import ModernAbout from './components/ModernAbout';
import Technologies from './components/Technologies';
import ModernExperience from './components/ModernExperience';
import OptimizedModernContact from './components/OptimizedModernContact';
import ModernProjects from './components/ModernProjects';
import OptimizedCertifications from './components/OptimizedCertifications';
import GradualBlur from './components/GradualBlur';
import { LenisProvider } from './components/LenisProvider';

const LoadingScreen = lazy(() => import('./components/LoadingScreen'));
const IntroAnimation = lazy(() => import('./components/IntroAnimationOverhauled'));
const ModernResearch = lazy(() => import('./components/ModernResearch'));

const ModernApp = () => {
  // Performance-aware state management
  const performanceProfile = useMemo(() => getPerformanceProfile(), []);
  const disableLoadingSequences = true;
  const skipIntroAnimations = disableLoadingSequences || performanceProfile.isLowEnd || performanceProfile.reducedMotion;
  
  // State management for loading sequence
  const [showLoading, setShowLoading] = useState(!skipIntroAnimations);
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(skipIntroAnimations);
  const [showNavbar, setShowNavbar] = useState(skipIntroAnimations);
  const [landingComplete, setLandingComplete] = useState(skipIntroAnimations);

  const { performanceTier: _performanceTier, deviceType: _deviceType } = useSystemProfile();

  // Handle loading sequence - skip on low-end devices
  const handleLoadingComplete = () => {
    setShowLoading(false);
    if (skipIntroAnimations) {
      setIntroComplete(true);
      setShowNavbar(true);
      setLandingComplete(true);
    } else {
      setTimeout(() => {
        setShowIntro(true);
      }, 500);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => {
      setIntroComplete(true);
    }, 1000);
  };

  return (
    <LenisProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <MotionConfig 
          reducedMotion="never"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
        {/* Loading Screen */}
        {/* LoadingScreen with WebGL Protection */}
        <AnimatePresence mode="wait">
          {showLoading && (
            <WebGLErrorBoundary>
              <Suspense fallback={null}>
                <LoadingScreen onLoadingComplete={handleLoadingComplete} />
              </Suspense>
            </WebGLErrorBoundary>
          )}
        </AnimatePresence>

        {/* Intro Animation with WebGL Protection */}
        <AnimatePresence mode="wait">
          {showIntro && (
            <WebGLErrorBoundary>
              <Suspense fallback={null}>
                <IntroAnimation onComplete={handleIntroComplete} />
              </Suspense>
            </WebGLErrorBoundary>
          )}
        </AnimatePresence>

        {/* Main App Content */}
        <AnimatePresence>
          {introComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
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
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  minHeight: '100vh',
                }}
              >
                {/* Navigation - Only show when not in landing mode */}
                {showNavbar && <ModernNavbar />}

                {/* Landing Page with 3D Hero + Original Hero */}
                <section id="hero">
                  <LandingPage
                    introComplete={introComplete}
                    onNavbarVisibilityChange={setShowNavbar}
                    onLandingComplete={setLandingComplete}
                  />
                </section>
                
                {/* About Section */}
                <section id="about">
                  <AboutErrorBoundary>
                    <Suspense fallback={
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                      </Box>
                    }>
                      <ModernAbout landingComplete={landingComplete} />
                    </Suspense>
                  </AboutErrorBoundary>
                </section>
                
                {/* Technologies Section */}
                <section id="technologies">
                  <Technologies />
                </section>
                
                {/* Experience Section */}
                <section id="experience">
                  <ModernExperience />
                </section>
                
                {/* Research Section */}
                <section id="research">
                  <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <ModernResearch />
                  </Suspense>
                </section>
                
                {/* Projects Section */}
                <section id="projects">
                  <ModernProjects />
                </section>
                
                {/* Certifications Section */}
                <section id="certifications">
                  <OptimizedCertifications />
                </section>

                {/* Contact Section */}
                <section id="contact">
                  <OptimizedModernContact />
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
          )}
        </AnimatePresence>
      </MotionConfig>
      </ThemeProvider>
    </LenisProvider>
  );
};

export default ModernApp;
