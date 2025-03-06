import React, { useEffect, useState, useMemo, useRef, memo } from "react";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";
import { ABOUT_TEXT } from "../constants/index";
import { motion, useAnimation } from "framer-motion";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Enhanced title variant with lighter animations for mobile
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.1,
    },
  },
  hover: {
    scale: 1.03,
    textShadow: "0px 0px 12px rgba(168,85,247,0.6)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Container variant with reduced stagger for mobile
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Image variants optimized for mobile and iOS
const imageVariants = {
  hidden: { x: -30, opacity: 0, rotateY: 3 },
  visible: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0px 0px 20px rgba(168,85,247,0.4)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// Light image container variants
const imageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Simplified text variant for mobile and iOS
const textVariants = {
  hidden: { x: 30, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      delay: 0.2,
    },
  },
};

// iOS-specific simplified variants
const iosTextVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  }
};

// Helper: Generate device-appropriate word variants
const getEnhancedWordVariants = (isMobile, isIOSSafari, delayMultiplier) => ({
  hidden: { opacity: 0, y: isIOSSafari ? 0 : 5 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: isIOSSafari ? Math.min(0.1 + i * 0.001, 0.2) : Math.min(0.5 + i * delayMultiplier, 1.5),
      duration: isIOSSafari ? 0.1 : isMobile ? 0.2 : 0.3,
      ease: "easeOut",
    },
  }),
  hover: isIOSSafari ? {} : {
    scale: isMobile ? 1.02 : 1.05,
    color: "#a855f7",
    textShadow: isMobile ? "0px 0px 3px rgba(168,85,247,0.3)" : "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
});

// Mobile-optimized divider animation
const getDividerVariants = (isMobile, isIOSSafari) => ({
  hidden: { width: "0%", opacity: 0 },
  visible: {
    width: isIOSSafari ? "80%" : ["0%", "60%", "80%"],
    opacity: isIOSSafari ? 1 : [0, 0.5, 1],
    transition: {
      delay: isIOSSafari ? 0.1 : 0.3,
      duration: isIOSSafari ? 0.5 : isMobile ? 0.8 : 1.2,
      ease: "easeInOut",
      times: isIOSSafari ? [0, 0, 1] : [0, 0.7, 1],
    },
  },
});

// Simplified shape variants for mobile and iOS
const getShapeVariants = (isMobile, isIOSSafari) => ({
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: isIOSSafari ? 0.03 : isMobile ? 0.04 : 0.07,
    scale: 1,
    transition: {
      delay: isIOSSafari ? 0.1 : 0.1 + i * 0.1,
      duration: isIOSSafari ? 0.3 : 0.6,
      ease: "easeOut",
    },
  }),
  animate: (i) => ({
    rotate: i % 2 === 0 ? [0, 2, 0] : [0, -2, 0],
    scale: isIOSSafari ? 1 : isMobile ? 1 : [1, 1.02, 1],
    transition: {
      duration: 10 + i,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  }),
});

// Dynamic word coloring – special words get gradient treatment.
const specialWordsList = [
  "deep learning",
  "AI research",
  "computer vision",
  "machine learning",
  "innovative",
  "technology",
  "collaboration",
  "impactful",
  "emerging tech",
  "leadership",
];

function About() {
  // Content ready state - critical for fixing iOS scroll issues
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const isMountedRef = useRef(false);
  
  const controls = useAnimation();
  const { performanceTier, deviceType } = useSystemProfile();
  
  // Detect iOS Safari for specific optimizations
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Device type detection
  const isMobile = deviceType === "mobile" || deviceType === "tablet";
  
  // Performance-based feature toggles
  const shouldUseScrollTrigger = useMemo(() => 
    performanceTier !== "low" && !isIOSSafari && !isMobile,
  [performanceTier, isIOSSafari, isMobile]);
  
  const showShapes = useMemo(() => 
    performanceTier !== "low" && !(isIOSSafari && performanceTier !== "high"),
  [performanceTier, isIOSSafari]);

  // Minimal or no stagger on mobile and iOS
  const delayMultiplier = useMemo(() => 
    isIOSSafari ? 0.001 : isMobile ? 0.003 : 0.01,
  [isIOSSafari, isMobile]);
  
  // Get device-appropriate variants
  const enhancedWordVariants = useMemo(() => 
    getEnhancedWordVariants(isMobile, isIOSSafari, delayMultiplier),
  [isMobile, isIOSSafari, delayMultiplier]);
  
  const dividerVariants = useMemo(() => 
    getDividerVariants(isMobile, isIOSSafari),
  [isMobile, isIOSSafari]);
  
  const shapeVariants = useMemo(() => 
    getShapeVariants(isMobile, isIOSSafari),
  [isMobile, isIOSSafari]);
  
  // For the background shapes, we only do the infinite rotation on desktop with good performance
  const shouldAnimateShapes = !isMobile && !isIOSSafari && performanceTier !== "low";
  const shapeAnimateState = shouldAnimateShapes ? "animate" : "visible";

  // Trigger animation immediately for low-performance devices
  useEffect(() => {
    if (!shouldUseScrollTrigger) {
      controls.start("animate");
      controls.start("visible");
    }
    
    // Make content visible after a short delay regardless of animation state
    isMountedRef.current = true;
    
    // Make content visible immediately on iOS
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
  }, [controls, shouldUseScrollTrigger, isIOSSafari]);

  // Critical iOS Safari fix for scroll blocking
  useEffect(() => {
    if (isIOSSafari) {
      // Force content to be visible and scrollable
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.overscrollBehaviorY = 'auto';
      
      // Scroll hack to trigger iOS redraw
      setTimeout(() => {
        window.scrollTo(0, window.scrollY + 1);
        setTimeout(() => window.scrollTo(0, window.scrollY - 1), 50);
      }, 100);
    }
    
    return () => {
      if (isIOSSafari) {
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
        document.body.style.overscrollBehaviorY = '';
      }
    };
  }, [isIOSSafari]);

  // Highlight specific words in ABOUT_TEXT using enhanced variants
  const highlightedContent = useMemo(() => {
    if (!ABOUT_TEXT) return [];

    const specialPattern = specialWordsList
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const regex = new RegExp(`(${specialPattern})`, "gi");
    const segments = ABOUT_TEXT.split(regex);

    return segments.map((segment, index) => {
      const isSpecial = specialWordsList.some(
        (word) => segment.toLowerCase() === word.toLowerCase()
      );

      if (isSpecial) {
        return (
          <motion.span
            key={`special-${index}`}
            custom={index}
            variants={isIOSSafari ? iosTextVariants : enhancedWordVariants}
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
            whileHover={isIOSSafari ? undefined : "hover"}
            whileTap={isIOSSafari || isMobile ? undefined : "hover"}
          >
            {segment}
          </motion.span>
        );
      }
      
      // Process regular text without breaking it
      return segment.split(/(\s+)/).map((part, partIndex) => {
        if (part.trim() === "") {
          return <span key={`space-${index}-${partIndex}`}>{part}</span>;
        }
        return (
          <motion.span
            key={`word-${index}-${partIndex}`}
            custom={index + partIndex}
            variants={isIOSSafari ? iosTextVariants : enhancedWordVariants}
            className="inline-block"
            whileHover={isIOSSafari ? undefined : "hover"}
            whileTap={isIOSSafari || isMobile ? undefined : "hover"}
            style={isIOSSafari ? {} : { willChange: 'transform, opacity' }}
          >
            {part}
          </motion.span>
        );
      });
    });
  }, [enhancedWordVariants, isIOSSafari, isMobile]);

  // Calculate animation props based on device to reduce code duplication
  const getAnimationProps = (variants, customDelay = 0) => {
    // iOS Safari gets simplified animations with no scroll trigger
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
      className="about-section ios-fix relative w-full"
      style={{
        overscrollBehavior: "none",
        overflowX: "hidden",
        visibility: contentReady || animationsComplete ? "visible" : "visible",
      }}
    >
      <motion.div
        className="pt-8 pb-12 relative"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        {...(shouldUseScrollTrigger
          ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
          : { animate: contentReady ? "visible" : "hidden" }
        )}
        style={{ 
          willChange: !isMobile && !isIOSSafari ? "opacity, transform" : "auto",
          transform: "translateZ(0)", // Hardware acceleration
        }}
      >
        {/* Background animated shapes - reduced number on mobile */}
        {showShapes &&
          [...Array(isIOSSafari ? 2 : isMobile ? 3 : 5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-5"
              style={{
                background: "linear-gradient(45deg, #a855f7, #ec4899)",
                height: `${80 + i * (isIOSSafari ? 20 : isMobile ? 25 : 40)}px`,
                width: `${80 + i * (isIOSSafari ? 20 : isMobile ? 25 : 40)}px`,
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                zIndex: -1,
                transform: "translateZ(0)", // Hardware acceleration
                pointerEvents: "none", // Ensure they don't block interactions
              }}
              variants={shapeVariants}
              custom={i}
              initial="hidden"
              animate={contentReady ? shapeAnimateState : "hidden"}
            />
          ))}

        {/* Enhanced title with hover animation - KEEP whileTap for all devices */}
        <motion.h2
          className="my-12 text-center text-5xl font-bold leading-normal whitespace-normal break-words"
          {...getAnimationProps(titleVariants)}
          whileHover={isIOSSafari ? undefined : "hover"}
          whileTap={isIOSSafari ? undefined : "hover"} // Keep whileTap for all devices
          style={{ 
            transform: "translateZ(0)", // Hardware acceleration
            opacity: contentReady || animationsComplete ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          <span className="text-white">About</span>
          <motion.span
            className="bg-gradient-to-r from-pink-500 to-pink-500 bg-clip-text text-transparent"
            style={{
              backgroundSize: "200% 200%",
              animation: isIOSSafari ? "none" : "gradientShift 4s ease-in-out infinite",
              transform: "translateZ(0)", // Hardware acceleration
            }}
          >
            {" "}
            me
          </motion.span>
        </motion.h2>

        {/* Animated divider with mobile and iOS optimizations */}
        <motion.div
          className="h-1 mx-auto mb-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          {...getAnimationProps(dividerVariants)}
          style={{ 
            maxWidth: "400px", // Ensure consistent width
            transform: "translateZ(0)", // Hardware acceleration
            opacity: contentReady || animationsComplete ? undefined : 0,
          }}
        />

        {/* Content wrapper */}
        <div className="flex flex-wrap">
          {/* Left: Enhanced Image with floating animation - KEEP whileTap for all devices */}
          <motion.div
            className="w-full lg:w-1/2 lg:p-8"
            {...getAnimationProps(imageContainerVariants)}
            style={{
              minHeight: isMobile ? '250px' : '300px', // Pre-allocate space
              visibility: contentReady || animationsComplete ? "visible" : "hidden",
            }}
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="relative w-4/5 max-w-md mx-auto rounded-2xl shadow-lg"
                {...getAnimationProps(imageVariants)}
                whileHover={isIOSSafari ? undefined : "hover"}
                whileTap={isIOSSafari ? undefined : "hover"} // Keep whileTap for all devices
                style={{ 
                  transform: "translateZ(0)", // Hardware acceleration
                  aspectRatio: "1/1.2", // Pre-allocate space for image
                }}
              >
                <motion.img
                  src={aboutImg}
                  alt="about"
                  className="rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-300 z-10 relative w-full h-auto object-cover"
                  initial={{ filter: "brightness(0.8)" }}
                  whileHover={isIOSSafari ? {} : { filter: "brightness(1.1)" }}
                  style={{ 
                    transform: "translateZ(0)", // Hardware acceleration
                    opacity: contentReady || animationsComplete ? 1 : 0,
                  }}
                  loading="eager" // High priority loading
                />
                
                {/* Optimized image border elements */}
                <motion.div
                  className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-purple-500/50 z-0"
                  initial={{ opacity: 0 }}
                  animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: isIOSSafari ? 0.2 : 0.5, duration: 0.3 }}
                  style={{ transform: "translateZ(0)" }}
                />
                <motion.div
                  className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-pink-500/50 z-0"
                  initial={{ opacity: 0 }}
                  animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay: isIOSSafari ? 0.3 : 0.6, duration: 0.3 }}
                  style={{ transform: "translateZ(0)" }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Enhanced Text with improved word highlighting */}
          <motion.div
            className="w-full lg:w-1/2 p-4 lg:p-8"
            {...getAnimationProps(isIOSSafari ? iosTextVariants : textVariants)}
            style={{ 
              transform: "translateZ(0)",
              minHeight: isMobile ? '250px' : '300px', // Pre-allocate space
              visibility: contentReady || animationsComplete ? "visible" : "visible",
            }}
          >
            <div className="flex items-center justify-center h-full">
              <motion.p
                className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg whitespace-normal break-words"
                style={{ 
                  opacity: contentReady || animationsComplete ? 1 : 0,
                  transition: "opacity 0.3s ease-out",
                }}
              >
                {/* Render immediately visible text for iOS */}
                {isIOSSafari && !contentReady ? (
                  <span className="text-gray-300">{ABOUT_TEXT}</span>
                ) : highlightedContent}
              </motion.p>
            </div>
          </motion.div>
        </div>

        {/* Optimized animations and iOS fixes */}
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          
          /* iOS specific optimizations */
          @supports (-webkit-touch-callout: none) {
            .ios-fix {
              transform: translate3d(0,0,0);
              -webkit-overflow-scrolling: touch;
              overflow-y: auto !important;
              min-height: -webkit-fill-available;
              height: auto !important;
            }
            
            body {
              overflow-y: auto !important;
              -webkit-overflow-scrolling: touch;
              position: relative !important;
              height: auto !important;
            }
          }
          
          /* Reduce motion for users who prefer it */
          @media (prefers-reduced-motion: reduce) {
            *, ::before, ::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}</style>

        {/* Immediately visible content for iOS even before animations */}
        {isIOSSafari && !contentReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bio-placeholder rounded-lg w-full max-w-lg"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default memo(About);