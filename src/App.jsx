import { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import OptimizedIntroAnimation from "./components/OptimizedIntroAnimation";
import OptimizedLandingPage from "./components/OptimizedLandingPage";
import FloatingNavBubble from "./components/FloatingNavBubble";
import EnterpriseBackground from "./components/EnterpriseBackground";
import EnhancedScrollToTop from "./components/EnhancedScrollToTop";
import ScrollProgressIndicator from "./components/ScrollProgressIndicator";

const App = () => {
  // Always call all hooks at the top level - no conditions!
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // ALWAYS call these hooks, regardless of platform
  const gradientStartTransform = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["125% 125% at 50% 10%", "150% 150% at 60% 30%", "125% 125% at 50% 50%"]
  );
  
  const primaryColorTransform = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#000 40%", "#050520 40%", "#000 40%", "#050520 40%", "#000 40%"]
  );
  
  const accentColorTransform = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    ["#63e 100%", "#60c 100%", "#70e 100%", "#50e 100%", "#63e 100%"]
  );
  
  // Star parallax transforms - ALWAYS create them
  const bigStarParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const smallStarParallax = useTransform(scrollYProgress, [0, 1], [0, -50]);
  
  // iOS Safari detection - use useMemo to pre-calculate values that don't need state
  const browserInfo = useMemo(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    return {
      isIOS,
      isSafari,
      isIOSSafariDetected: isIOS && isSafari
    };
  }, []);
  
  // Setup effect - runs once
  useEffect(() => {
    setIsIOSSafari(browserInfo.isIOSSafariDetected);
    
    // Add iOS Safari class to html element for global CSS targeting
    if (browserInfo.isIOSSafariDetected) {
      document.documentElement.classList.add('ios-safari');
      // Set static gradient values for iOS Safari
      document.documentElement.style.setProperty("--gradient-position", "125% 125% at 50% 10%");
      document.documentElement.style.setProperty("--primary-color", "#000 40%");
      document.documentElement.style.setProperty("--accent-color", "#63e 100%");
    }
    
    return () => {
      document.documentElement.classList.remove('ios-safari');
    };
  }, [browserInfo.isIOSSafariDetected]);

  // Handle loading sequence
  const handleLoadingComplete = () => {
    setShowLoading(false);
    setTimeout(() => {
      setShowIntro(true);
    }, 500);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => {
      setIntroComplete(true);
    }, 1000);
  };
  
  // Gradient update effect - always runs but may skip updates
  useEffect(() => {
    // Skip updates for iOS Safari but don't skip the hook call
    if (isIOSSafari) return;
    
    const updateGradient = () => {
      document.documentElement.style.setProperty(
        "--gradient-position", 
        gradientStartTransform.get()
      );
      document.documentElement.style.setProperty(
        "--primary-color", 
        primaryColorTransform.get()
      );
      document.documentElement.style.setProperty(
        "--accent-color", 
        accentColorTransform.get()
      );
    };

    // Initial update
    updateGradient();
    
    // Subscribe to scroll changes
    const unsubscribe = scrollYProgress.on("change", updateGradient);
    return () => unsubscribe();
  }, [
    scrollYProgress, 
    gradientStartTransform, 
    primaryColorTransform, 
    accentColorTransform, 
    isIOSSafari
  ]);
  
  return (
    <div className="overflow-x-hidden text-neutral-300 
      antialiased selection:bg-cyan-300 selection:text-cyan-900"
      style={{
        // Fix for iPhone scrolling issues
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'none',
        touchAction: 'pan-y',
        position: 'relative',
        minHeight: '100vh'
      }}
    >
      {/* Loading Screen */}
      <AnimatePresence mode="wait">
        {showLoading && (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {/* Optimized Intro Animation */}
      <AnimatePresence mode="wait">
        {showIntro && (
          <OptimizedIntroAnimation onComplete={handleIntroComplete} />
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
            {/* Scroll Progress Indicator */}
            <ScrollProgressIndicator />
            
            {/* Enterprise Background Layer */}
            <EnterpriseBackground 
              particleCount={60}
              showGeometry={true}
              showNeuralNetwork={true}
              intensity="high"
            />
            
            {/* Background gradient */}
            {isIOSSafari ? (
              <div 
                className="fixed inset-0 -z-10 h-full w-full"
                style={{
                  background: "radial-gradient(125% 125% at 50% 10%, #000 40%, #63e 100%)"
                }}
              />
            ) : (
              <motion.div
                className="fixed inset-0 -z-10 h-full w-full"
                style={{
                  background: "radial-gradient(var(--gradient-position), var(--primary-color), var(--accent-color))",
                  transition: "background 0.5s ease"
                }}
              />
            )}
            
            {/* Parallax stars effect */}
            {!isIOSSafari && (
              <div className="fixed inset-0 -z-5 opacity-30">
                <motion.div 
                  className="absolute h-full w-full"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    y: bigStarParallax
                  }}
                />
                <motion.div 
                  className="absolute h-full w-full"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    y: smallStarParallax
                  }}
                />
              </div>
            )}
            
            {/* Optimized Landing Page with integrated navigation - NO OTHER UI ELEMENTS */}
            <OptimizedLandingPage introComplete={introComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;