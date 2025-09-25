import React, { useState, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  CircularProgress,
} from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import { useSystemProfile } from "./components/useSystemProfile.jsx";
import { getPerformanceProfile } from "./utils/performanceOptimizations.js";

// Import new loading and intro components
import LoadingScreen from "./components/LoadingScreen.jsx";
import IntroAnimation from "./components/IntroAnimationOverhauled.jsx";
import LandingPage from "./components/LandingPage.jsx";
import WebGLErrorBoundary from "./components/WebGLErrorBoundary.jsx";

// Import other components
import ModernNavbar from "./components/ModernNavbar.jsx";
import ModernAbout from "./components/ModernAbout.jsx";
import AboutErrorBoundary from "./components/AboutErrorBoundary.jsx";
import Technologies from "./components/Technologies.jsx";
import ModernExperience from "./components/ModernExperience.jsx";
import OptimizedModernContact from "./components/OptimizedModernContact.jsx";
import ModernProjects from "./components/ModernProjects.jsx";
import OptimizedCertifications from "./components/OptimizedCertifications.jsx";

// Only lazy load Research (least accessed)
const ModernResearch = React.lazy(() => import("./components/ModernResearch.jsx"));

// Main ModernApp component
const ModernApp = () => {
  // Performance-aware state management
  const performanceProfile = useMemo(() => getPerformanceProfile(), []);
  const skipIntroAnimations = performanceProfile.isLowEnd || performanceProfile.reducedMotion;
  
  // State management for loading sequence
  const [showLoading, setShowLoading] = useState(!skipIntroAnimations);
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(skipIntroAnimations);
  const [showNavbar, setShowNavbar] = useState(skipIntroAnimations);
  const [landingComplete, setLandingComplete] = useState(skipIntroAnimations);
  
  const { performanceTier, deviceType } = useSystemProfile();

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
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      
      {/* Loading Screen */}
      {/* LoadingScreen with WebGL Protection */}
      <AnimatePresence mode="wait">
        {showLoading && (
          <WebGLErrorBoundary>
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          </WebGLErrorBoundary>
        )}
      </AnimatePresence>

      {/* Intro Animation with WebGL Protection */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <WebGLErrorBoundary>
            <IntroAnimation onComplete={handleIntroComplete} />
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
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
};

export default ModernApp;
