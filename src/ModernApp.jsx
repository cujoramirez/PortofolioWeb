import React, { useEffect, useState, Suspense } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  CircularProgress,
  Backdrop,
  Fade,
  Typography
} from "@mui/material";
import { muiTheme } from "./theme/muiTheme.js";
import { useSystemProfile } from "./components/useSystemProfile.jsx";
// Enterprise Three.js background - DISABLED
// import EnterpriseSceneManager, { useSceneManager } from "./components/three/EnterpriseSceneManager.jsx";

// Import components
import ModernNavbar from "./components/ModernNavbar.jsx";
import ModernHero from "./components/ModernHero.jsx";
import ModernAbout from "./components/ModernAbout.jsx";
import AboutErrorBoundary from "./components/AboutErrorBoundary.jsx";
import Technologies from "./components/Technologies.jsx";
import ModernExperience from "./components/ModernExperience.jsx";
import ModernContact from "./components/ModernContact.jsx";
import ModernProjects from "./components/ModernProjects.jsx";
import Certifications from "./components/certificates.jsx";

// Only lazy load Research (least accessed)
const ModernResearch = React.lazy(() => import("./components/ModernResearch.jsx"));

// Enhanced Loading component with G logo animation
const LoadingScreen = ({ isLoading }) => (
  <Backdrop
    open={isLoading}
    sx={{
      zIndex: 9999,
      background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }}
  >
    {/* Animated G Logo */}
    <motion.div
      initial={{ scale: 0, rotateY: -180, opacity: 0 }}
      animate={{ 
        scale: [0, 1.2, 1], 
        rotateY: [180, 0, 0],
        opacity: [0, 1, 1]
      }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        times: [0, 0.6, 1]
      }}
    >
      <Box
        sx={{
          width: { xs: 120, md: 150 },
          height: { xs: 120, md: 150 },
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.5), 0 0 100px rgba(139, 92, 246, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6366f1, #22d3ee, #8b5cf6, #6366f1)',
            backgroundSize: '400% 400%',
            animation: 'gradientRotate 3s ease-in-out infinite',
            zIndex: -1
          }
        }}
      >
        {/* G Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
        >
          <Typography
            sx={{
              fontSize: { xs: '4rem', md: '5rem' },
              fontWeight: 900,
              color: 'white',
              fontFamily: '"Inter", sans-serif',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.05em'
            }}
          >
            G
          </Typography>
        </motion.div>
      </Box>
    </motion.div>

    {/* Animated Loading Dots */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.2
          }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6366f1, #22d3ee)'
          }}
        />
      ))}
    </motion.div>

    {/* Loading Text */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6 }}
    >
      <Typography
        variant="h6"
        sx={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: 500,
          textAlign: 'center',
          fontSize: { xs: '1rem', md: '1.2rem' }
        }}
      >
        Initializing Portfolio Experience
      </Typography>
    </motion.div>
  </Backdrop>
);

// Gradient transition component
const GradientTransition = ({ fromColor, toColor, height = "100px" }) => (
  <Box
    sx={{
      height,
      background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
      position: 'relative'
    }}
  />
);

// Parallax stars background
const ParallaxStars = ({ shouldReduceMotion }) => {
  const { scrollY } = useScroll({
    layoutEffect: false
  });
  const y1 = useSpring(useTransform(scrollY, [0, 1000], [0, -100]), {
    stiffness: 100,
    damping: 30
  });
  const y2 = useSpring(useTransform(scrollY, [0, 1000], [0, -200]), {
    stiffness: 100,
    damping: 30
  });

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
          y: y1
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '100%',
          height: '120%',
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.3) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          y: y2
        }}
      />
    </Box>
  );
};

// Smooth scroll progress indicator
const ScrollProgress = ({ shouldReduceMotion }) => {
  const { scrollYProgress } = useScroll({
    layoutEffect: false
  });
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
        background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
        transformOrigin: '0%',
        scaleX: shouldReduceMotion ? 1 : scaleX,
        zIndex: 50
      }}
    />
  );
};

// Section wrapper with intersection observer
const SectionWrapper = ({ children, id, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} id={id} className={className} style={{ position: 'relative' }}>
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
  // const sceneManager = useSceneManager(); // DISABLED - Three.js background
  
  // Fallback scene manager object
  const sceneManager = {
    currentSection: 'hero',
    mousePosition: { x: 0, y: 0 },
    scrollProgress: 0,
    transitionProgress: 0
  };
  
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

    // Simulate loading time for smooth experience - Extended for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

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
        
        {/* Main Content */}
        <Box
          sx={{
            minHeight: '100vh',
            background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
            position: 'relative',
            visibility: isLoading ? 'hidden' : 'visible',
            pointerEvents: isLoading ? 'none' : 'auto'
          }}
        >
          {/* Enterprise 3D Scene Manager - DISABLED */}
          {/* !shouldReduceMotion && !isMobile && (
            <EnterpriseSceneManager
              currentSection={sceneManager.currentSection}
              isVisible={!isLoading}
              mousePosition={sceneManager.mousePosition}
              scrollProgress={sceneManager.scrollProgress}
              transitionProgress={sceneManager.transitionProgress}
              enableInteractions={!isLoading}
              enablePostProcessing={performanceTier !== 'low'}
            />
          ) */}
                {/* Scroll Progress */}
          <ScrollProgress shouldReduceMotion={shouldReduceMotion} />
          
          {/* Parallax Background */}
          <ParallaxStars shouldReduceMotion={shouldReduceMotion} />
          
          {/* Navigation */}
          <ModernNavbar />
          
          {/* Page Content */}
          <main style={{ position: 'relative' }}>
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
                <AboutErrorBoundary>
                  <Suspense fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  }>
                    <ModernAbout />
                  </Suspense>
                </AboutErrorBoundary>
              </SectionWrapper>
              
              {/* Section Transition - About to Technologies */}
              <GradientTransition 
                fromColor="rgba(15, 23, 42, 0.9)" 
                toColor="rgba(30, 41, 59, 0.9)"
                height="150px"
              />
              
              {/* Technologies Section */}
              <SectionWrapper id="technologies">
                <Technologies />
              </SectionWrapper>
              
              {/* Section Transition - Technologies to Experience */}
              <GradientTransition 
                fromColor="rgba(30, 41, 59, 0.9)" 
                toColor="rgba(51, 65, 85, 0.9)"
                height="120px"
              />
              
              {/* Experience Section */}
              <SectionWrapper id="experience">
                <ModernExperience />
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
                <ModernProjects />
              </SectionWrapper>
              
              {/* Section Transition - Projects to Certifications */}
              <GradientTransition 
                fromColor="rgba(30, 41, 59, 0.9)" 
                toColor="rgba(51, 65, 85, 0.9)"
                height="120px"
              />
              
              {/* Certifications Section */}
              <SectionWrapper id="certifications">
                <Certifications />
              </SectionWrapper>
              
              {/* Section Transition - Certifications to Contact */}
              <GradientTransition 
                fromColor="rgba(51, 65, 85, 0.9)" 
                toColor="rgba(15, 23, 42, 0.9)"
                height="120px"
              />
              
              {/* Contact Section */}
              <SectionWrapper id="contact">
                <ModernContact />
              </SectionWrapper>
            </main>
          </Box>

        {/* Global Styles */}
        <style>{`
          :root {
            --vh: 1vh;
          }
          
          html {
            position: relative;
            scroll-behavior: ${shouldReduceMotion ? 'auto' : 'smooth'};
            overflow-x: hidden;
            height: 100%;
          }
          
          body {
            position: relative;
            overflow-x: hidden;
            overflow-y: ${isLoading ? 'hidden' : 'auto'};
            scroll-behavior: ${shouldReduceMotion ? 'auto' : 'smooth'};
            height: 100%;
            ${isIOSSafari ? '-webkit-overflow-scrolling: touch; overscroll-behavior: auto;' : ''}
          }
          
          #root {
            position: relative;
            min-height: 100vh;
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
          
          /* G Logo Loading Animation */
          @keyframes gradientRotate {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          /* Loading 3D Scene */
          .loading-3d {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            font-weight: 500;
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
