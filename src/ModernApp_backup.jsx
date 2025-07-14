import React, { useEffect, useState, Suspense } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  CircularProgress,
  Backdrop,
  Fade
} from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import { useSystemProfile } from "./components/useSystemProfile.jsx";
import EnterpriseSceneManager, { useSceneManager } from "./components/three/EnterpriseSceneManager.jsx";
import { Canvas } from "@react-three/fiber";

// Import components
import ModernNavbar from "./components/ModernNavbar.jsx";
import ModernHero from "./components/ModernHero.jsx";
import ModernAbout from "./components/ModernAbout.jsx";

// Lazy load remaining components for better performance
const Technologies = React.lazy(() => import("./components/Technologies.jsx"));
const ModernExperience = React.lazy(() => import("./components/ModernExperience.jsx"));
const ModernResearch = React.lazy(() => import("./components/ModernResearch.jsx"));
const ModernProjects = React.lazy(() => import("./components/ModernProjects.jsx"));
const Certifications = React.lazy(() => import("./components/certificates.jsx"));
const ModernContact = React.lazy(() => import("./components/ModernContact.jsx"));

// Loading component
const LoadingScreen = ({ isLoading }) => (
  <Backdrop
    open={isLoading}
    sx={{
      zIndex: 9999,
      background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
            zIndex: -1,
            opacity: 0.5,
            // filter: 'blur(8px)', // Removed
            animation: 'pulse 2s ease-in-out infinite'
          }
        }}
      >
        G
      </Box>
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <CircularProgress
        size={40}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }}
      />
    </motion.div>
  </Backdrop>
);

// Parallax stars background
const ParallaxStars = ({ shouldReduceMotion }) => {
  const { scrollY } = useScroll();
  const y1 = useSpring(useScroll().scrollY, { stiffness: 100, damping: 30 });
  const y2 = useSpring(useScroll().scrollY, { stiffness: 200, damping: 60 });
  
  if (shouldReduceMotion) return null;

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: -1, opacity: 0.4 }}>
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '120%',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          y: y1.get() * -0.1
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '120%',
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          y: y1.get() * -0.2
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '120%',
          backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.2) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          y: y2.get() * -0.05
        }}
      />
    </Box>
  );
};

// Smooth scroll progress indicator
const ScrollProgress = ({ shouldReduceMotion }) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
        transformOrigin: '0%',
        scaleX: shouldReduceMotion ? 0.1 : scaleX,
        zIndex: 1000
      }}
    />
  );
};

// Section transition component with fade gradients
const GradientTransition = ({ fromColor = "#0f172a", toColor = "#1e293b", height = "200px" }) => {
  return (
    <Box
      sx={{
        height: height,
        background: `linear-gradient(180deg, ${fromColor} 0%, rgba(15, 23, 42, 0.5) 50%, ${toColor} 100%)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          opacity: 0.6
        }
      }}
    />
  );
};

// Section wrapper with intersection observer
const SectionWrapper = ({ children, id, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      <Fade in={isVisible} timeout={800}>
        <div>
          {isVisible && children}
        </div>
      </Fade>
    </section>
  );
};

// Enhanced error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portfolio Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
            color: 'white',
            textAlign: 'center',
            p: 4
          }}
        >
          <div>
            <h1>Something went wrong</h1>
            <p>Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Refresh Page
            </button>
          </div>
        </Box>
      );
    }

    return this.props.children;
  }
}

function ModernApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const { performanceTier, deviceType } = useSystemProfile();
  const sceneManager = useSceneManager();
  
  const shouldReduceMotion = performanceTier === "low" || deviceType === "mobile";
  const isMobile = deviceType === "mobile";

  // Initialize app
  useEffect(() => {
    // Detect iOS Safari
    const detectIOSSafari = () => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      return isIOS && isSafari;
    };
    
    setIsIOSSafari(detectIOSSafari());

    // Set CSS custom properties for viewport height
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Add iOS Safari specific class
    if (detectIOSSafari()) {
      document.documentElement.classList.add('ios-safari');
    }

    // Simulate loading time for smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  // Preload critical resources
  useEffect(() => {
    const preloadImages = [
      '/src/assets/GadingAdityaPerdana.jpg',
      '/src/assets/GadingAdityaPerdana2.jpg'
    ];

    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        
        {/* Loading Screen */}
        <LoadingScreen isLoading={isLoading} />
        
        {/* Main Content with Enterprise 3D Scene Management */}
        <Fade in={!isLoading} timeout={1000}>
          <Box
            sx={{
              minHeight: '100vh',
              background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Enterprise 3D Scene Manager */}
            {!shouldReduceMotion && !isMobile && (
              <EnterpriseSceneManager
                currentSection={sceneManager.currentSection}
                isVisible={!isLoading}
                mousePosition={sceneManager.mousePosition}
                scrollProgress={sceneManager.scrollProgress}
                transitionProgress={sceneManager.transitionProgress}
                enableInteractions={true}
                enablePostProcessing={performanceTier !== 'low'}
              />
            )}
            {/* Scroll Progress */}
            <ScrollProgress shouldReduceMotion={shouldReduceMotion} />
            
            {/* Parallax Background */}
            <ParallaxStars shouldReduceMotion={shouldReduceMotion} />
            
            {/* Navigation */}
            <ModernNavbar />
            
            {/* Page Content */}
            <main>
              {/* Hero Section */}
              <ModernHero />
              
              {/* Section Transition - Hero to About */}
              <GradientTransition 
                fromColor="rgba(0, 0, 0, 0.8)" 
                toColor="rgba(15, 23, 42, 0.9)"
                height="150px"
              />
              
              {/* About Section */}
              <SectionWrapper id="about">
                <ModernAbout />
              </SectionWrapper>
              
              {/* Section Transition - About to Technologies */}
              <GradientTransition 
                fromColor="rgba(15, 23, 42, 0.9)" 
                toColor="rgba(30, 41, 59, 0.9)"
                height="150px"
              />
              
              {/* Technologies Section */}
              <SectionWrapper id="technologies">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <Technologies />
                </Suspense>
              </SectionWrapper>
              
              {/* Section Transition - Technologies to Experience */}
              <GradientTransition 
                fromColor="rgba(30, 41, 59, 0.9)" 
                toColor="rgba(51, 65, 85, 0.9)"
                height="120px"
              />
              
              {/* Experience Section */}
              <SectionWrapper id="experience">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <ModernExperience />
                </Suspense>
              </SectionWrapper>
              
              {/* Section Transition - Experience to Research */}
              <GradientTransition 
                fromColor="rgba(51, 65, 85, 0.9)" 
                toColor="rgba(15, 23, 42, 0.9)"
                height="120px"
              />
              
              {/* Research Section */}
              <SectionWrapper id="research">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <ModernResearch />
                </Suspense>
              </SectionWrapper>
              
              {/* Section Transition - Research to Projects */}
              <GradientTransition 
                fromColor="rgba(15, 23, 42, 0.9)" 
                toColor="rgba(30, 41, 59, 0.9)"
                height="120px"
              />
              
              {/* Projects Section */}
              <SectionWrapper id="projects">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <ModernProjects />
                </Suspense>
              </SectionWrapper>
              
              {/* Enhanced Section Transitions with 3D Effects */}
              {!performanceTier === "low" && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '200px',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }}
                >
                  <Canvas camera={{ position: [0, 0, 5] }}>
                    <Suspense fallback={null}>
                      <SectionTransition 
                        type="wave" 
                        color1="#6366f1" 
                        color2="#8b5cf6"
                        position={[0, -15, 0]}
                      />
                    </Suspense>
                  </Canvas>
                </Box>
              )}
              
              {/* Section Transition - Projects to Certifications */}
              <GradientTransition 
                fromColor="rgba(30, 41, 59, 0.9)" 
                toColor="rgba(51, 65, 85, 0.9)"
                height="120px"
              />
              
              {/* Certifications Section */}
              <SectionWrapper id="certifications">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <Certifications />
                </Suspense>
              </SectionWrapper>
              
              {/* Section Transition - Certifications to Contact */}
              <GradientTransition 
                fromColor="rgba(51, 65, 85, 0.9)" 
                toColor="rgba(15, 23, 42, 0.9)"
                height="120px"
              />
              
              {/* Contact Section */}
              <SectionWrapper id="contact">
                <Suspense fallback={
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                  </Box>
                }>
                  <ModernContact />
                </Suspense>
              </SectionWrapper>
            </main>
          </Box>
        </Fade>

        {/* Global Styles */}
        <style>{`
          :root {
            --vh: 1vh;
          }
          
          html {
            scroll-behavior: ${shouldReduceMotion ? 'auto' : 'smooth'};
            overflow-x: hidden;
          }
          
          body {
            overflow-x: hidden;
            scroll-behavior: ${shouldReduceMotion ? 'auto' : 'smooth'};
            ${isIOSSafari ? '-webkit-overflow-scrolling: touch; overscroll-behavior: auto;' : ''}
          }
          
          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #1e293b;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, #6366f1, #22d3ee);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, #4f46e5, #06b6d4);
          }
          
          /* iOS Safari specific fixes */
          .ios-safari {
            height: 100%;
            -webkit-text-size-adjust: 100%;
          }
          
          .ios-safari body {
            position: static !important;
            height: auto !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: auto;
            touch-action: pan-y !important;
          }
          
          /* Animation keyframes */
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes bounce-subtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          /* Reduced motion preferences */
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          /* Performance optimizations */
          .gpu-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
          
          /* High contrast mode support */
          @media (prefers-contrast: high) {
            .text-gradient-primary,
            .text-gradient-secondary,
            .text-gradient-accent {
              background: none !important;
              -webkit-background-clip: initial !important;
              -webkit-text-fill-color: initial !important;
              color: #ffffff !important;
            }
          }
        `}</style>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default ModernApp;
