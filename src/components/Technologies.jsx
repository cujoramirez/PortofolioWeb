import React, { useState, useRef, memo, lazy, Suspense, useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TechnologyCard from "./TechnologyCard";
import { technologies } from "./techData";
import useDeviceDetection from "./useDeviceDetection";
import { useSuppressReducedMotionWarning } from './useSupressReducedMotionWarning';

// Lazy-load heavy canvas effects only when needed
const LightEffects = lazy(() => import("./LightEffects"));

const Technologies = () => {
  // Content readiness states - critical for iOS scroll fix
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const isMountedRef = useRef(false);
  
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);
  const preferredReducedMotion = useReducedMotion();

  useSuppressReducedMotionWarning();

  // Use our device detection hook
  const { 
    isMobile, 
    isTablet, 
    isIOSSafari, 
    performanceTier, 
    deviceType 
  } = useDeviceDetection();
  
  // Determine if we should use scroll trigger based on device and performance
  const shouldUseScrollTrigger = useMemo(() => 
    performanceTier !== "low" && !isIOSSafari && !isMobile,
  [performanceTier, isIOSSafari, isMobile]);
  
  // Make content visible after a short delay
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
      }, 200);
      
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
    }, isIOSSafari ? 800 : 2000);
    
    return () => {
      clearTimeout(animationTimer);
      isMountedRef.current = false;
    };
  }, [isIOSSafari]);
  
  // iOS Safari scroll fix
  useEffect(() => {
    if (isIOSSafari) {
      // Force content to be visible and scrollable
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowY = 'auto';
      
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
        document.documentElement.style.overflowY = '';
      }
    };
  }, [isIOSSafari]);

  // Optimized container variants with conditional stagger and device detection
  const getOptimizedContainerVariants = (staggerValue, isIOSSafari, isMobile) => ({
    hidden: { opacity: 0, y: isIOSSafari ? 0 : isMobile ? 10 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isIOSSafari ? 0.3 : isMobile ? 0.5 : 0.7,
        ease: "easeOut",
        staggerChildren: isIOSSafari ? 0.03 : staggerValue,
        when: "beforeChildren",
      },
    },
  });

  // Title variant: simplified for mobile and iOS
  const getTitleVariants = () => ({
    hidden: { opacity: 0, y: -15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      textShadow: "0px 0px 12px rgba(168, 85, 247, 0.7)",
      transition: { duration: 0.3 },
    },
  });

  // Reduce stagger animation on mobile/tablet for smoother rendering
  const staggerMultiplier = useMemo(() => {
    if (isTablet) return 0.08;
    if (isMobile) return 0.06;
    return 0.15;
  }, [isTablet, isMobile]);
  
  const containerVars = useMemo(() => 
    getOptimizedContainerVariants(staggerMultiplier, isIOSSafari, isMobile),
  [staggerMultiplier, isIOSSafari, isMobile]);
  
  
  // Determine if we should reduce animations
  const reducedMotion = useMemo(() => 
    preferredReducedMotion || 
    (isMobile && performanceTier === "low") || 
    isIOSSafari,
  [preferredReducedMotion, isMobile, performanceTier, isIOSSafari]);

  // FIXED: Improve grid layout for tablets to center last two items
  const getGridColumns = useMemo(() => {
    if (isMobile) return "grid-cols-2";
    if (isTablet) return "grid-cols-3 tablet-grid"; // Custom class for tablet
    return "grid-cols-5";
  }, [isMobile, isTablet]);
  
  // Determine grid gap based on device type
  const getGridGap = useMemo(() => {
    if (isMobile) return "gap-2";
    if (isTablet) return "gap-3 sm:gap-4";
    return "gap-4 md:gap-5";
  }, [isMobile, isTablet]);
  
  // Set appropriate padding based on device
  const sectionPadding = useMemo(() => {
    if (isMobile) return "py-8";
    if (isTablet) return "py-12";
    return "py-16";
  }, [isMobile, isTablet]);

  return (
    <section
      id="technologies"
      className={`relative overflow-hidden ${sectionPadding}`}
      style={{
        background: "linear-gradient(to bottom, #0f0528, #130a35, #1a0d40)",
        minHeight: isMobile ? "auto" : isTablet ? "65vh" : "80vh",
        position: "relative",
        clipPath: "polygon(0 0, 100% 0, 100% 95%, 0 100%)",
        visibility: contentReady || animationsComplete ? "visible" : "visible",
      }}
    >
      {/* Top overlay gradient - simplified for mobile */}
      <div
        className="absolute top-0 left-0 w-full h-16 sm:h-20 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15, 5, 40, 0) 0%, rgba(15, 5, 40, 0.8) 100%)",
          transform: "translateY(-100%)",
          opacity: isMobile || isTablet ? 0.5 : 0.7,
        }}
      />
      
      {/* Light effects only for desktop with good performance */}
      {performanceTier !== "low" && !isMobile && !isTablet && !isIOSSafari && contentReady && (
        <div className="absolute inset-0 overflow-hidden">
          <Suspense fallback={null}>
            <LightEffects simplified={deviceType !== "desktop"} />
          </Suspense>
        </div>
      )}

      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 h-full flex flex-col"
        variants={containerVars}
        initial="hidden"
        {...(shouldUseScrollTrigger
          ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
          : { animate: contentReady ? "visible" : "hidden" }
        )}
        style={{ 
          transform: "translateZ(0)", // Hardware acceleration
          opacity: contentReady || animationsComplete ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <motion.h2
          className="mb-6 sm:mb-10 md:mb-14 mt-4 text-center text-3xl sm:text-4xl md:text-5xl font-bold"
          variants={getTitleVariants()}
          whileHover={isIOSSafari ? undefined : "hover"}
          style={{
            background:
              "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7, #ec4899)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: reducedMotion ? "none" : "gradientShift 6s ease-in-out infinite",
            textShadow: isMobile ? "0 2px 15px rgba(236, 72, 153, 0.25)" : "0 2px 25px rgba(236, 72, 153, 0.3)",
            paddingBottom: "10px",
          }}
        >
          Skills & Tools
        </motion.h2>

        {/* FIXED: Grid layout for properly centering last two items on tablet */}
        <motion.div 
          className={`grid ${getGridColumns} ${getGridGap} justify-items-center mx-auto`}
          style={{ 
            minHeight: isMobile ? "300px" : isTablet ? "400px" : "500px",
            visibility: contentReady || animationsComplete ? "visible" : "visible",
            maxWidth: isMobile ? "500px" : isTablet ? "800px" : "1200px",
          }}
        >
          {technologies.map((tech, index) => (
            <TechnologyCard
              key={index}
              tech={tech}
              index={index}
              hoveredTech={hoveredTech}
              setHoveredTech={setHoveredTech}
              hoveredTechRef={hoveredTechRef}
              isMobile={isMobile}
              isTablet={isTablet}
              isIOSSafari={isIOSSafari}
              reducedMotion={reducedMotion}
              contentReady={contentReady || animationsComplete}
              performanceTier={performanceTier}
            />
          ))}
        </motion.div>

        <div className="w-full max-w-5xl mx-auto mt-8 sm:mt-12 md:mt-16">
          <div
            className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-70"
            style={{ boxShadow: "0 0 8px rgba(168, 85, 247, 0.25)" }}
          />
        </div>
      </motion.div>

      {/* Bottom gradient - simplified for mobile */}
      <div className="absolute bottom-0 left-0 w-full h-12 sm:h-16 z-10 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to top, rgba(26, 13, 64, 0.8) 0%, rgba(26, 13, 64, 0) 100%)",
            transform: "translateY(50%)",
          }}
        />
      </div>
      
      <ResponsiveStyles />
    </section>
  );
};

// Encapsulated responsive styles component
const ResponsiveStyles = () => (
  <style>{`
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    /* iOS specific optimizations */
    @supports (-webkit-touch-callout: none) {
      .ios-fix {
        transform: translate3d(0,0,0);
        -webkit-overflow-scrolling: touch;
        overflow-y: auto !important;
      }
      
      body {
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch;
      }
    }
    
    /* FIXED: Special grid layout for tablets to center last two items */
    .tablet-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    
    /* Center the last two items specifically for 10 items in 3-column grid */
    @media (min-width: 640px) and (max-width: 1023px) {
      .tablet-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      
      .tablet-grid > *:nth-last-child(2),
      .tablet-grid > *:last-child {
        grid-column: span 1;
      }
      
      .tablet-grid > *:nth-last-child(2) {
        transform: translateX(50%);
      }
      
      .tablet-grid::after {
        content: "";
        width: 0;
        grid-column: span 3;
      }
    }
    
    /* For larger tablets */
    @media (min-width: 768px) and (max-width: 1023px) {
      .tablet-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      
      .tablet-grid > *:nth-last-child(2),
      .tablet-grid > *:last-child {
        grid-column: span 2;
        justify-self: center;
        max-width: 130px;
      }
      
      .tablet-grid > *:nth-last-child(2) {
        transform: translateX(0);
      }
    }
  `}</style>
);

export default memo(Technologies);