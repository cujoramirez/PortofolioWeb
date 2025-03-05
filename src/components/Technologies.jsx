import React, { useState, useRef, memo, lazy, Suspense, useEffect, useMemo } from "react";
import {
  SiPytorch,
  SiTensorflow,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiKaggle,
  SiHtml5,
  SiCss3,
} from "react-icons/si";
import { FaAtom, FaChartBar } from "react-icons/fa";
import { motion, useReducedMotion } from "framer-motion";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Lazy-load heavy canvas effects only when needed
const LightEffects = lazy(() => import("./LightEffects"));

// Optimized container variants with conditional stagger and device detection
const optimizedContainerVariants = (staggerValue, isIOSSafari, isMobile) => ({
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
const titleVariants = {
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
};

// Icon container variants with device optimizations
const getIconContainerVariants = (isMobile, isIOSSafari) => ({
  hidden: { opacity: 0, y: isIOSSafari ? 5 : isMobile ? 8 : 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: isIOSSafari ? 0.3 : isMobile ? 0.4 : 0.6, 
      ease: "easeOut" 
    },
  },
  hover: isIOSSafari ? {} : {
    scale: isMobile ? 1.03 : 1.05,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      type: "tween",
    },
  },
});

// Optimized icon animation based on device type
const getIconAnimation = (color, isMobile, isTablet, isIOSSafari, reducedMotion) => {
  // Disabled animations for iOS Safari and reduced motion
  if (isIOSSafari || reducedMotion) {
    return {
      animate: {
        filter: `drop-shadow(0 0 2px ${color}33)`,
      },
      hover: isIOSSafari ? {} : {
        scale: 1.03,
        filter: `drop-shadow(0 0 6px ${color})`,
        transition: { duration: 0.2 },
      },
    };
  }
  
  // Tablet-specific animations (less intensive than desktop)
  if (isTablet) {
    return {
      animate: {
        y: [-1, 1, -1],
        filter: `drop-shadow(0 0 1px ${color}33)`,
        transition: {
          y: {
            duration: 3.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          },
        },
      },
      hover: {
        scale: 1.04,
        filter: `drop-shadow(0 0 8px ${color})`,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      },
    };
  }
  
  // Mobile or desktop animations
  return {
    animate: {
      y: isMobile ? [-1, 1, -1] : [-2, 2, -2],
      filter: `drop-shadow(0 0 ${isMobile ? 1 : 2}px ${color}${isMobile ? "22" : "33"})`,
      transition: {
        y: {
          duration: isMobile ? 3 : 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      },
    },
    hover: {
      scale: isMobile ? 1.05 : 1.1,
      filter: `drop-shadow(0 0 ${isMobile ? 8 : 12}px ${color})`,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };
};

// Technology configuration with optimized glow effects
export const technologies = [
  { name: "HTML", icon: SiHtml5, color: "#E34F26", borderColor: "border-orange-600/30", pulseSpeed: 3.1 },
  { name: "CSS", icon: SiCss3, color: "#1572B6", borderColor: "border-blue-500/30", pulseSpeed: 3.4 },
  { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C", borderColor: "border-orange-500/30", pulseSpeed: 3.4 },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00", borderColor: "border-orange-400/30", pulseSpeed: 3.2 },
  { name: "React", icon: SiReact, color: "#61DAFB", borderColor: "border-cyan-400/30", pulseSpeed: 3.7 },
  { name: "Node.js", icon: SiNodedotjs, color: "#539E43", borderColor: "border-green-500/30", pulseSpeed: 3.5 },
  { name: "Python", icon: SiPython, color: "#3776AB", borderColor: "border-blue-500/30", pulseSpeed: 3.3 },
  { name: "Kaggle", icon: SiKaggle, color: "#20BEFF", borderColor: "border-blue-400/30", pulseSpeed: 3.6 },
  { name: "Physics", icon: FaAtom, color: "#9C27B0", borderColor: "border-purple-500/30", pulseSpeed: 3.2 },
  { name: "Statistics", icon: FaChartBar, color: "#FF9800", borderColor: "border-amber-500/30", pulseSpeed: 3.5 },
];

// Optimized Technology Card Component
const TechnologyCard = memo(
  ({ 
    tech, 
    index, 
    hoveredTech, 
    setHoveredTech, 
    hoveredTechRef, 
    isMobile, 
    isTablet, 
    isIOSSafari, 
    reducedMotion, 
    contentReady 
  }) => {
    // Adjust animation speeds based on device
    const pulseSpeed = tech.pulseSpeed * (isIOSSafari ? 1.5 : isMobile ? 1.2 : 1);
    
    // Size adjustments for different devices
    const cardSize = isTablet ? "130px" : isMobile ? "110px" : "150px";
    const iconSize = isTablet ? "text-4xl" : isMobile ? "text-3xl" : "text-5xl";
    const paddingSize = isTablet ? "p-3" : isMobile ? "p-2" : "p-4";
    
    return (
      <motion.div
        className={`relative rounded-xl border-2 ${tech.borderColor} ${paddingSize}
          bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
          backdrop-blur-sm shadow-lg cursor-pointer flex flex-col items-center justify-center`}
        variants={getIconContainerVariants(isMobile, isIOSSafari)}
        whileHover={isIOSSafari ? undefined : "hover"}
        whileTap={isIOSSafari ? undefined : "hover"}
        style={{
          width: '100%',
          maxWidth: cardSize,
          aspectRatio: '1/1',
          boxShadow:
            hoveredTech === index
              ? `0 0 ${isMobile ? "16px 2px" : "20px 3px"} ${tech.color}${isMobile ? "44" : "55"}`
              : `0 0 ${isMobile ? "15px" : "25px"} rgba(0, 0, 0, ${isMobile ? "0.3" : "0.4"})`,
          transition: "all 0.3s ease-in-out",
          overflow: "visible",
          transformOrigin: "center",
          opacity: contentReady ? 1 : 0,
          transform: "translateZ(0)", // Hardware acceleration
        }}
        onHoverStart={() => {
          if (isIOSSafari) return;
          setHoveredTech(index);
          hoveredTechRef.current = index;
        }}
        onHoverEnd={() => {
          if (isIOSSafari) return;
          setHoveredTech(null);
          hoveredTechRef.current = null;
        }}
      >
        {/* Conditionally render animated border glow based on performance */}
        {!reducedMotion && !isIOSSafari && (
          <motion.div
            className="absolute inset-0 rounded-xl z-0"
            style={{ boxShadow: `0 0 0px ${tech.color}00` }}
            animate={{
              boxShadow: isMobile 
                ? [`0 0 3px ${tech.color}22`, `0 0 5px ${tech.color}33`, `0 0 3px ${tech.color}22`]
                : [`0 0 5px ${tech.color}33`, `0 0 12px ${tech.color}44`, `0 0 5px ${tech.color}33`],
            }}
            transition={{
              duration: pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Icon with optimized animations */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          variants={getIconAnimation(tech.color, isMobile, isTablet, isIOSSafari, reducedMotion)}
          animate={contentReady ? "animate" : ""}
          whileHover={isIOSSafari ? undefined : "hover"}
          whileTap={isIOSSafari ? undefined : "hover"}
          style={{ 
            position: "relative", 
            zIndex: 2, 
            padding: isMobile ? "6px" : "8px",
          }}
        >
          {/* Desktop pulsing background glow - only for desktop with good performance */}
          {!reducedMotion && !isMobile && !isIOSSafari && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${tech.color}33 0%, transparent 70%)`,
                  filter: "blur(10px)",
                  zIndex: 0,
                  transform: "scale(1.5)",
                }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1.4, 1.6, 1.4],
                }}
                transition={{
                  duration: pulseSpeed,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Simplified background glow for tablet */}
          {!reducedMotion && isTablet && !isIOSSafari && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tech.color}22 0%, transparent 70%)`,
                filter: "blur(5px)",
                zIndex: 0,
                transform: "scale(1.2)",
                opacity: 0.4,
              }}
            />
          )}

          <tech.icon
            className={`${iconSize} relative z-10`}
            style={{ 
              color: tech.color, 
              display: "block",
            }}
          />
        </motion.div>
        
        {/* Technology name with optimized text effects */}
        <motion.div
          className={`text-center mt-1 sm:mt-2 font-medium ${
            isMobile ? "text-xs" : isTablet ? "text-sm" : "text-base"
          }`}
          style={{
            color: tech.color,
            textShadow: `0 0 ${isMobile ? "4px" : "6px"} ${tech.color}${isMobile ? "33" : "44"}`,
            letterSpacing: "0.5px",
          }}
        >
          {tech.name}
        </motion.div>
      </motion.div>
    );
  },
  // Advanced memo comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.hoveredTech === nextProps.hoveredTech &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.isTablet === nextProps.isTablet &&
      prevProps.isIOSSafari === nextProps.isIOSSafari &&
      prevProps.reducedMotion === nextProps.reducedMotion &&
      prevProps.contentReady === nextProps.contentReady
    );
  }
);

const Technologies = () => {
  // Content readiness states - critical for iOS scroll fix
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const isMountedRef = useRef(false);
  
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const preferredReducedMotion = useReducedMotion();

  // Use our unified system profile hook
  const { performanceTier, deviceType } = useSystemProfile();
  
  // Detect iOS Safari for specific optimizations
  const isIOSSafari = useMemo(() => isIOS && isSafari, [isIOS, isSafari]);
  
  // Determine if we should use scroll trigger based on device and performance
  const shouldUseScrollTrigger = useMemo(() => 
    performanceTier !== "low" && !isIOSSafari && !isMobile,
  [performanceTier, isIOSSafari, isMobile]);
  
  // Detect device types
  useEffect(() => {
    // Check if it's a mobile device or tablet
    const checkDeviceType = () => {
      const width = window.innerWidth;
      // Mobile: less than 640px
      const mobileCheck = width < 640;
      // Tablet: between 640px and 1024px
      const tabletCheck = width >= 640 && width < 1024;
      
      setIsMobile(mobileCheck);
      setIsTablet(tabletCheck);
    };
    
    // Check if it's Safari and/or iOS
    const checkBrowser = () => {
      const isSafariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOSCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      setIsSafari(isSafariCheck);
      setIsIOS(isIOSCheck);
    };
    
    checkDeviceType();
    checkBrowser();
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
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

  // Reduce stagger animation on mobile/tablet for smoother rendering
  const staggerMultiplier = useMemo(() => {
    if (isTablet) return 0.08;
    if (isMobile) return 0.06;
    return 0.15;
  }, [isTablet, isMobile]);
  
  const containerVars = useMemo(() => 
    optimizedContainerVariants(staggerMultiplier, isIOSSafari, isMobile),
  [staggerMultiplier, isIOSSafari, isMobile]);
  
  // Determine if we should reduce animations
  const reducedMotion = useMemo(() => 
    preferredReducedMotion || 
    (isMobile && performanceTier === "low") || 
    isIOSSafari,
  [preferredReducedMotion, isMobile, performanceTier, isIOSSafari]);

  // Determine number of columns based on device type
  const getGridColumns = useMemo(() => {
    if (isMobile) return "grid-cols-2";
    if (isTablet) return "grid-cols-3 md:grid-cols-4";
    return "grid-cols-3 md:grid-cols-5";
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
          variants={titleVariants}
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

        {/* GRID LAYOUT FIXED FOR TABLETS */}
        <motion.div 
          className={`grid ${getGridColumns} ${getGridGap} justify-items-center justify-center max-w-7xl mx-auto`}
          style={{ 
            minHeight: isMobile ? "300px" : isTablet ? "400px" : "500px",
            visibility: contentReady || animationsComplete ? "visible" : "visible",
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
        
        /* Grid layout specific fixes for tablet */
        @media (min-width: 640px) and (max-width: 1023px) {
          .grid-cols-3.md\\:grid-cols-4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          
          @media (min-width: 768px) {
            .grid-cols-3.md\\:grid-cols-4 {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }
        }
      `}</style>
    </section>
  );
};

export default memo(Technologies);