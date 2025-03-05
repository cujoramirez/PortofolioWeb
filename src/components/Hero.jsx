import React, {
  useEffect,
  useState,
  memo,
  useMemo,
  lazy,
  Suspense,
  useRef
} from "react";
import { motion } from "framer-motion";
import profilePic from "../assets/GadingAdityaPerdana.jpg";
import { HERO_CONTENT } from "../constants/index";

// Lazy-load heavy effects with error boundaries
const AmbientBackground = lazy(() => import("./AmbientBackground"));
const ParticleEffect = lazy(() => import("./ParticleEffect"));

// Import our custom device/performance detection
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// ---------- 1) Tokenization Helpers ----------
const specialWords = [
  "Python",
  "machine",
  "learning",
  "AI",
  "research",
  "deep",
  "vision",
  "computer",
  "innovative",
  "recognition",
  "collaborative",
];

const multiWordPhrases = [
  "computer science",
  "facial recognition",
  "machine learning",
  "deep learning",
  "computer vision",
];

function isSpecialWord(word) {
  const cleanWord = word.replace(/[^\w\s]/g, "");
  return specialWords.some(
    (special) => cleanWord.toLowerCase() === special.toLowerCase()
  );
}

// Improved tokenization to fix spacing issues
function tokenizeParagraph(paragraph) {
  // First clean the text by ensuring proper spaces between words
  const cleanedText = paragraph.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  const words = cleanedText.split(" ").filter(word => word.length > 0);
  const tokens = [];
  let i = 0;
  
  while (i < words.length) {
    const current = words[i];
    const cleanCurrent = current.replace(/[^\w\s]/g, "").toLowerCase();
    
    if (i + 1 < words.length) {
      const next = words[i + 1];
      const cleanNext = next.replace(/[^\w\s]/g, "").toLowerCase();
      const combined = `${cleanCurrent} ${cleanNext}`;
      
      if (multiWordPhrases.includes(combined)) {
        tokens.push({ text: `${current} ${next}`, isSpecial: true });
        i += 2;
        continue;
      }
    }
    
    tokens.push({
      text: current,
      isSpecial: isSpecialWord(current),
    });
    i++;
  }
  
  return tokens;
}

// ---------- 2) Framer Motion Variants ----------
const outlineVariantsHigh = {
  initial: { pathLength: 0, pathOffset: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    pathOffset: [0, 0.5, 1],
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 2.5, ease: "easeInOut" },
      pathOffset: { duration: 2.5, ease: "easeInOut", times: [0, 0.5, 1] },
      strokeOpacity: { duration: 1, delay: 2, ease: "easeOut" },
    },
  },
};

const outlineVariantsMid = {
  initial: { pathLength: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 1.8, ease: "easeInOut" },
      strokeOpacity: { duration: 1, delay: 1.5, ease: "easeOut" },
    },
  },
};

const outlineVariantsLow = {
  initial: { pathLength: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" },
      strokeOpacity: { duration: 0.8, delay: 1.2, ease: "easeOut" },
    },
  },
};

// Simplest outline variant for iOS - much shorter duration
const outlineVariantsIOS = {
  initial: { pathLength: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    strokeOpacity: 0,
    transition: {
      pathLength: { duration: 0.8, ease: "easeInOut" },
      strokeOpacity: { duration: 0.3, delay: 0.7 },
    },
  },
};

const dotVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" },
  },
};

const nameVariants = {
  initial: { fontWeight: 200, textShadow: "0 0 0 rgba(255,255,255,0)" },
  animate: {
    fontWeight: 700,
    textShadow: "0 0 8px rgba(255,255,255,0.3)",
    transition: { duration: 1.2, ease: "easeOut" },
  },
  hover: {
    textShadow:
      "0 0 12px rgba(236,72,153,0.6), 0 0 20px rgba(168,85,247,0.4)",
    filter: "brightness(1.5)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Title line variants with reduced animations for mobile/iOS
const titleLineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 },
  },
};

// Helper to generate enhanced word variants with a configurable delay multiplier
const getEnhancedWordVariants = (delayMultiplier, isMobile) => ({
  hidden: { opacity: 0, y: 10 }, // Reduced y offset for better performance
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * delayMultiplier, 1.5), // Cap maximum delay to 1.5s
      duration: isMobile ? 0.2 : 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: isMobile ? 1.02 : 1.05, // Smaller scale for mobile
    color: "#a855f7",
    textShadow: isMobile ? "0px 0px 2px rgba(168,85,247,0.3)" : "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
});

const bioVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.4, ease: "easeOut" },
  },
};

const profilePicVariants = {
  hidden: { opacity: 0, scale: 0.95 }, // Less dramatic scale for better performance
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
  },
  hover: {
    scale: 1.03, // Smaller scale for better performance
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const Hero = () => {
  // State for content readiness - critical for fixing iOS scroll issues
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  
  // Ref to track component mount
  const isMountedRef = useRef(false);

  // 1) Determine performance tier & device type using our system profile hook
  const { performanceTier, deviceType } = useSystemProfile();

  // 2) Set appropriate effects based on device and performance
  const isMobile = deviceType === "mobile" || deviceType === "tablet";
  
  // Browser detection for iOS Safari optimization
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Performance adaptations
  const showAmbient = performanceTier !== "low" && !isMobile && !isIOSSafari;
  const showParticles = performanceTier === "high" && !isMobile && !isIOSSafari;
  const showDot = (performanceTier === "high" || performanceTier === "mid") && !isIOSSafari;
  
  // Select appropriate animation variants based on device and browser
  const outlineVariants = useMemo(() => {
    if (isIOSSafari) return outlineVariantsIOS;
    if (performanceTier === "high") return outlineVariantsHigh;
    if (performanceTier === "mid") return outlineVariantsMid;
    return outlineVariantsLow;
  }, [performanceTier, isIOSSafari]);

  // 3) Decide if we should use scroll-triggered animations
  const shouldUseScrollTrigger = useMemo(() => 
    performanceTier !== "low" && !isIOSSafari && !isMobile, 
  [performanceTier, isIOSSafari, isMobile]);

  // 4) Tokenize HERO_CONTENT once with improved tokenization
  const tokens = useMemo(() => tokenizeParagraph(HERO_CONTENT), []);

  // Only animate tokens on desktop with adequate performance
  const shouldAnimateTokens = deviceType === "desktop" && performanceTier !== "low" && !isIOSSafari;

  // 5) Local state for controlling dot visibility
  const [dotVisible, setDotVisible] = useState(true);

  // 6) Delay multiplier for staggered animations - reduced for iOS
  const delayMultiplier = useMemo(() => {
    if (!shouldAnimateTokens) return 0;
    if (isIOSSafari) return 0.005;
    return 0.015;
  }, [shouldAnimateTokens, isIOSSafari]);
  
  const enhancedWordVariants = useMemo(() => 
    getEnhancedWordVariants(delayMultiplier, isMobile || isIOSSafari), 
  [delayMultiplier, isMobile, isIOSSafari]);

  // 7) Fix iOS Safari viewport height issues
  useEffect(() => {
    // Fix for mobile viewport height (especially iOS Safari)
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      
      // Force redraw on iOS Safari to fix scroll issues
      if (isIOSSafari) {
        setTimeout(() => {
          window.scrollTo(0, window.scrollY + 1);
          setTimeout(() => window.scrollTo(0, window.scrollY - 1), 10);
        }, 50);
      }
    };
    
    // Set initial height
    updateHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, [isIOSSafari]);

  // 8) Improve touch scrolling performance and fix iOS-specific issues
  useEffect(() => {
    if (isMobile || isIOSSafari) {
      document.body.style.touchAction = 'pan-y';
      
      // Prevent rubber-banding/overscroll on iOS
      document.body.style.overscrollBehaviorY = 'none';
      
      // Disable text selection on mobile to improve performance
      document.body.style.userSelect = 'none';
      
      // iOS Safari specific fixes
      if (isIOSSafari) {
        // Make scrolling work immediately
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
        
        // Force iOS to recalculate scroll area
        setTimeout(() => {
          window.scrollTo(0, 1);
          setTimeout(() => window.scrollTo(0, 0), 10);
        }, 50);
      }
    }
    return () => {
      document.body.style.touchAction = '';
      document.body.style.overscrollBehaviorY = '';
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobile, isIOSSafari]);

  // 9) Make content visible after a short delay regardless of animation state
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Make content visible immediately on iOS Safari
    if (isIOSSafari) {
      setContentReady(true);
    } else {
      // Short delay for other browsers
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setContentReady(true);
        }
      }, 300);
      
      return () => {
        clearTimeout(timer);
        isMountedRef.current = false;
      };
    }
    
    // Ensure animations complete after a maximum time
    const animationTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setAnimationsComplete(true);
      }
    }, isIOSSafari ? 800 : 3000);
    
    return () => {
      clearTimeout(animationTimer);
      isMountedRef.current = false;
    };
  }, [isIOSSafari]);

  // 10) Critical iOS Safari fix for scroll blocking
  useEffect(() => {
    if (isIOSSafari) {
      // Force content to be visible and scrollable on iOS
      document.body.style.position = 'relative';
      document.body.style.height = 'auto';
      document.body.style.minHeight = '100%';
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.overscrollBehaviorY = 'auto';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.overflowY = 'auto';
      
      // Scroll hack to trigger iOS redraw
      setTimeout(() => {
        window.scrollTo(0, 1);
        setTimeout(() => window.scrollTo(0, 0), 50);
      }, 100);
    }
    
    return () => {
      if (isIOSSafari) {
        document.body.style.position = '';
        document.body.style.height = '';
        document.body.style.minHeight = '';
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
        document.body.style.overscrollBehaviorY = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.overflowY = '';
      }
    };
  }, [isIOSSafari]);

  // 11) Prepare container style with optimized properties
  const containerStyle = useMemo(() => ({
    backgroundColor: "#0f0528",
    willChange: deviceType === "desktop" && !isIOSSafari ? "opacity, transform" : "auto",
    height: isMobile ? 'auto' : "calc(var(--vh, 1vh) * 100)",
    minHeight: isMobile ? 'calc(var(--vh, 1vh) * 100)' : undefined,
    WebkitOverflowScrolling: 'touch', // Improve iOS scrolling
    overflowX: 'hidden', // Prevent horizontal scrolling
    padding: isMobile ? '3rem 1rem' : '4rem 1rem', // Pre-allocate space for content
    // Critical for iOS scrolling:
    position: 'relative',
    display: 'block',
    // Ensure visibility even if animations aren't complete
    visibility: contentReady || animationsComplete ? 'visible' : 'visible',
  }), [deviceType, isMobile, isIOSSafari, contentReady, animationsComplete]);

  // 12) Pre-allocate space for elements to prevent layout shifts
  const titleContainerHeight = isMobile ? '180px' : '200px';
  const bioContainerHeight = isMobile ? '180px' : '180px';
  
  // Prepare animation props to simplify component
  const getAnimationProps = (variants, customDelay = 0) => {
    // iOS Safari gets simplified animations
    if (isIOSSafari) {
      return {
        initial: "hidden",
        animate: contentReady ? "visible" : "hidden",
        variants,
        transition: { 
          duration: 0.3, 
          delay: customDelay * 0.5,  // Reduce delays for iOS
        }
      };
    }
    
    // Normal animation props with scroll trigger for desktop
    return {
      variants,
      initial: "hidden",
      ...(shouldUseScrollTrigger
        ? { 
            whileInView: contentReady ? "visible" : "hidden", 
            viewport: { once: true, amount: 0.2 } 
          }
        : { animate: contentReady ? "visible" : "hidden" }
      ),
      transition: { 
        duration: 0.5, 
        delay: customDelay
      }
    };
  };

  return (
    <div 
      className="hero-container ios-fix relative w-full" 
      style={{ 
        overflowX: 'hidden',
        minHeight: '100vh',
        minHeight: 'calc(var(--vh, 1vh) * 100)',
      }}
    >
      <motion.div
        className="relative w-full flex flex-col justify-center items-center"
        style={containerStyle}
        {...getAnimationProps({ 
          hidden: { opacity: 0 },
          visible: { opacity: 1 } 
        })}
      >
        {/* Global Styles */}
        <style>{`
          :root {
            --vh: 1vh;
          }
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            scroll-behavior: smooth;
            background: #0f0528;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: none;
          }
          body {
            height: auto;
            min-height: 100%;
            position: relative;
            overflow-y: auto !important;
          }
          ::-webkit-scrollbar {
            width: 0;
            background: transparent;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          @keyframes lightGradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          /* Pre-allocate space for content containers to prevent layout shifts */
          .title-container {
            height: ${titleContainerHeight};
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .bio-container {
            min-height: ${bioContainerHeight};
            opacity: ${contentReady || animationsComplete ? 1 : 0};
            transition: opacity 0.3s ease-out;
          }
          /* Fix iOS Safari issues */
          @supports (-webkit-touch-callout: none) {
            .ios-fix {
              min-height: -webkit-fill-available;
              height: auto !important;
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch;
            }
            body {
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch;
              position: relative !important;
              height: auto !important;
            }
          }
          /* Text container optimization */
          .text-container {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
          /* Bio placeholder for layout stability */
          .bio-placeholder {
            min-height: ${bioContainerHeight};
            background: linear-gradient(90deg, #ffffff05 25%, #ffffff08 50%, #ffffff05 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {/* Lazy-load Ambient Background */}
        <Suspense fallback={null}>
          {showAmbient && contentReady && <AmbientBackground />}
        </Suspense>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-10 max-w-7xl mx-auto w-full relative z-10">
          {/* LEFT: Text Area */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start mt-6 lg:mt-0">
            {/* Name + Animated Outline - Fixed height to prevent layout shifts */}
            <div className="relative pb-6 h-24 flex items-center justify-center lg:justify-start w-full">
              <svg
                className="absolute top-0 left-0 w-full h-full"
                viewBox="0 0 600 100"
                style={{ 
                  overflow: "visible", 
                  transform: "translateZ(0)",
                  opacity: contentReady || animationsComplete ? 1 : 0,
                }}
                aria-hidden="true"
              >
                <motion.path
                  id="heroPath"
                  d="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
                  fill="none"
                  stroke="url(#heroGradient)"
                  strokeWidth="4"
                  strokeLinecap="butt"
                  variants={outlineVariants}
                  initial="initial"
                  {...(shouldUseScrollTrigger && !isIOSSafari
                    ? { whileInView: "animate", viewport: { once: true, amount: 0.3 } }
                    : { animate: contentReady ? "animate" : "initial" }
                  )}
                />

                {/* The moving dot - simplified for iOS */}
                {showDot && dotVisible && contentReady && (
                  <motion.g
                    initial="hidden"
                    {...(shouldUseScrollTrigger && !isIOSSafari
                      ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                      : { animate: "visible" }
                    )}
                    variants={dotVariants}
                    onAnimationComplete={() => setDotVisible(false)}
                  >
                    <circle r="5" fill="#ec4899">
                      <animateMotion 
                        dur={isIOSSafari ? "1.5s" : "3s"} 
                        repeatCount="1" 
                        fill="freeze"
                        calcMode="linear"
                      >
                        <mpath xlinkHref="#heroPath" />
                      </animateMotion>
                    </circle>
                  </motion.g>
                )}

                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#cbd5e1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Name */}
              <motion.h1
                className="text-4xl md:text-5xl xl:text-6xl tracking-tight text-center lg:text-left font-bold relative z-10 no-select"
                {...getAnimationProps(nameVariants)}
                whileHover={isIOSSafari ? undefined : "hover"}
                whileTap={isIOSSafari ? undefined : "hover"}
              >
                Gading Aditya Perdana
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
                  initial={{ opacity: 0 }}
                  animate={contentReady ? { 
                    opacity: isIOSSafari ? 0.2 : [0.1, 0.2, 0.1],
                    scale: isIOSSafari ? 1 : [1, 1.02, 1],
                  } : { opacity: 0 }}
                  transition={isIOSSafari ? { duration: 0.5 } : { 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: "mirror" 
                  }}
                />
              </motion.h1>
            </div>

            {/* Titles - Fixed height container to prevent layout shifts */}
            <div className="title-container relative w-full mb-4">
              <div className="text-xl md:text-2xl xl:text-3xl tracking-tight text-center lg:text-left relative space-y-3 no-select">
                {/* Title line 1 */}
                <motion.div
                  className="text-container text-transparent bg-clip-text relative"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: isIOSSafari ? "none" : "gradientShift 2s ease-in-out infinite alternate",
                  }}
                  {...getAnimationProps(titleLineVariants)}
                  whileHover={isIOSSafari ? undefined : "hover"}
                  whileTap={isIOSSafari ? undefined : "hover"}
                >
                  Computer Science Undergraduate
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={contentReady ? (
                      isMobile || isIOSSafari 
                      ? { opacity: 0.15 } 
                      : { opacity: [0.1, 0.2, 0.1] }
                    ) : { opacity: 0 }}
                    transition={isMobile || isIOSSafari 
                      ? { duration: 0.5 } 
                      : { duration: 2.5, repeat: Infinity, repeatType: "mirror" }
                    }
                  />
                </motion.div>

                {/* Title line 2 */}
                <motion.div
                  className="text-container text-transparent bg-clip-text relative"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: isIOSSafari ? "none" : "gradientShift 2s ease-in-out infinite alternate",
                  }}
                  {...getAnimationProps(titleLineVariants, 0.15)}
                  whileHover={isIOSSafari ? undefined : "hover"}
                  whileTap={isIOSSafari ? undefined : "hover"}
                >
                  Aspiring AI & Deep Learning Researcher
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={contentReady ? (
                      isMobile || isIOSSafari 
                        ? { opacity: 0.15 } 
                        : { opacity: [0.1, 0.2, 0.1] }
                      ) : { opacity: 0 }
                    }
                    transition={isMobile || isIOSSafari 
                      ? { duration: 0.5 } 
                      : { 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: 0.5,
                        }
                    }
                  />
                </motion.div>

                {/* Title line 3 */}
                <motion.div
                  className="text-container text-transparent bg-clip-text relative"
                  style={{
                    background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: isIOSSafari ? "none" : "gradientShift 2s ease-in-out infinite alternate",
                  }}
                  {...getAnimationProps(titleLineVariants, 0.3)}
                  whileHover={isIOSSafari ? undefined : "hover"}
                  whileTap={isIOSSafari ? undefined : "hover"}
                >
                  (Computer Vision Focus)
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={contentReady ? (
                      isMobile || isIOSSafari 
                        ? { opacity: 0.15 } 
                        : { opacity: [0.1, 0.2, 0.1] }
                      ) : { opacity: 0 }
                    }
                    transition={isMobile || isIOSSafari 
                      ? { duration: 0.5 } 
                      : {
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "mirror",
                          delay: 1,
                        }
                    }
                  />
                </motion.div>
              </div>
            </div>

            {/* Bio Paragraph - Fixed size container with pre-render visibility for iOS */}
            <div 
              className="bio-container w-full my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg text-center lg:text-left relative"
              style={{
                minHeight: bioContainerHeight,
                opacity: contentReady || animationsComplete ? 1 : 0,
                visibility: contentReady || animationsComplete ? 'visible' : 'visible',
                transition: 'opacity 0.3s ease-out'
              }}
            >
              {/* Optimized gradient backdrop */}
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10"
                initial={{ opacity: 0 }}
                animate={contentReady ? (
                  isMobile || isIOSSafari 
                    ? { opacity: 0.1 } 
                    : { opacity: [0.05, 0.1, 0.05] }
                  ) : { opacity: 0 }
                }
                transition={isMobile || isIOSSafari 
                  ? { duration: 0.5 } 
                  : { duration: 5, repeat: Infinity, repeatType: "mirror" }
                }
              />
              
              {/* Optimized text rendering with reduced animations on iOS/mobile */}
              <motion.p 
                className="text-container break-words"
                initial={{ opacity: 0 }}
                animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {tokens.map((token, index) =>
                  shouldAnimateTokens ? (
                    <motion.span
                      key={index}
                      custom={index}
                      variants={enhancedWordVariants}
                      initial="hidden"
                      {...(shouldUseScrollTrigger && !isIOSSafari
                        ? { 
                            whileInView: "visible", 
                            viewport: { once: true, amount: 0.1 } 
                          }
                        : { animate: contentReady ? "visible" : "hidden" }
                      )}
                      whileHover={isIOSSafari ? undefined : "hover"}
                      whileTap={isIOSSafari ? undefined : "hover"}
                      className={`inline-block mr-1 ${
                        token.isSpecial
                          ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                          : ""
                      }`}
                      style={{
                        transform: 'translateZ(0)', // Hardware acceleration
                        willChange: 'transform, opacity' // Performance optimization
                      }}
                    >
                      {token.text}{" "}
                    </motion.span>
                  ) : (
                    <span
                      key={index}
                      className={`inline-block mr-1 ${
                        token.isSpecial
                          ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                          : ""
                      }`}
                    >
                      {token.text}{" "}
                    </span>
                  )
                )}
              </motion.p>
            </div>
          </div>

          {/* RIGHT: Profile Image - Fixed dimensions to prevent layout shifts */}
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div 
              className="relative w-full max-w-xs md:max-w-sm lg:max-w-md" 
              style={{ 
                aspectRatio: "1/1",
                transform: 'translateZ(0)', // Hardware acceleration
                willChange: 'transform', // Performance optimization
              }}
            >
              <motion.img
                src={profilePic}
                alt="Gading Aditya Perdana"
                className="rounded-lg shadow-md w-full object-cover relative z-10"
                {...getAnimationProps(profilePicVariants, isIOSSafari ? 0.1 : 0.4)}
                whileHover={isIOSSafari || isMobile ? undefined : "hover"}
                whileTap={isIOSSafari || isMobile ? undefined : "hover"}
                style={{ 
                  transform: 'translateZ(0)', // Hardware acceleration
                  backfaceVisibility: 'hidden', // Prevent flickering
                  // Ensure the image is visible immediately for iOS
                  opacity: isIOSSafari ? 1 : undefined
                }}
                loading="eager" // Tell browser to load this image with high priority
              />

              {/* Optimized glow behind image */}
              <motion.div
                className={`absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg ${isMobile || isIOSSafari ? 'blur-sm opacity-20' : 'blur opacity-30'} -z-10`}
                initial={{ opacity: 0 }}
                animate={contentReady ? (
                  isMobile || isIOSSafari 
                    ? { opacity: 0.15 } 
                    : { opacity: [0.2, 0.3, 0.2] }
                  ) : { opacity: 0 }
                }
                transition={isMobile || isIOSSafari 
                  ? { duration: 0.5 } 
                  : { 
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }
                }
                style={{ 
                  mixBlendMode: "screen",
                  transform: "translateZ(0)",
                  backgroundSize: "200% 200%",
                  animation: isMobile ? "lightGradientShift 3s ease-in-out infinite alternate" : "none",
                  willChange: 'opacity', // Performance optimization
                }}
              />

              {/* Lazy-load Particle Effect only when ready */}
              {contentReady && (
                <Suspense fallback={null}>
                  {showParticles && <ParticleEffect />}
                </Suspense>
              )}
            </div>
          </div>
        </div>
        
        {/* Immediately visible content for iOS even before animations */}
        {isIOSSafari && !contentReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bio-placeholder rounded-lg w-full max-w-lg"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default memo(Hero);