import React, { useState, useRef, memo, lazy, Suspense, useEffect } from "react";
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

// Optimized container variants with conditional stagger and mobile detection
const optimizedContainerVariants = (staggerValue, isMobile) => ({
  hidden: { opacity: 0, y: isMobile ? 15 : 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: isMobile ? 0.5 : 0.8,
      ease: "easeOut",
      staggerChildren: staggerValue,
      when: "beforeChildren",
    },
  },
});

// Title variant: simplified for mobile
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  hover: {
    scale: 1.03,
    textShadow: "0px 0px 12px rgba(168, 85, 247, 0.7)",
    transition: { duration: 0.3 },
  },
};

// Icon container variants with mobile optimizations
const iconContainerVariants = (isMobile) => ({
  hidden: { opacity: 0, y: isMobile ? 10 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: isMobile ? 0.5 : 0.8, ease: "easeOut" },
  },
  hover: {
    scale: isMobile ? 1.05 : 1.08,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      type: isMobile ? "tween" : "spring",
      stiffness: isMobile ? 200 : 300,
      damping: isMobile ? 20 : 15,
    },
  },
});

// Optimized icon animation for different devices
const getIconAnimation = (color, isMobile, reducedMotion) => {
  // Base animation for non-reduced motion
  if (!reducedMotion) {
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
  } 
  // Reduced motion version - static with just hover effect
  return {
    animate: {
      filter: `drop-shadow(0 0 2px ${color}33)`,
    },
    hover: {
      scale: 1.05,
      filter: `drop-shadow(0 0 8px ${color})`,
      transition: { duration: 0.3 },
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
  ({ tech, index, hoveredTech, setHoveredTech, hoveredTechRef, isMobile, isSafari, reducedMotion }) => {
    // Adjust animation speeds for mobile
    const pulseSpeed = tech.pulseSpeed * (isMobile ? 1.2 : 1);
    
    return (
    <motion.div
      className={`relative rounded-xl border-2 ${tech.borderColor} p-${isMobile ? "3" : "4"}
        bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
        backdrop-blur-sm shadow-lg cursor-pointer flex flex-col items-center justify-center
        w-full max-w-[${isMobile ? "130px" : "150px"}] sm:max-w-[160px] aspect-square`}
      variants={iconContainerVariants(isMobile)}
      whileHover="hover"
      whileTap="hover"
      style={{
        boxShadow:
          hoveredTech === index
            ? `0 0 ${isMobile ? "16px 2px" : "20px 3px"} ${tech.color}${isMobile ? "44" : "55"}`
            : `0 0 ${isMobile ? "15px" : "25px"} rgba(0, 0, 0, ${isMobile ? "0.3" : "0.4"})`,
        transition: "all 0.3s ease-in-out",
        overflow: isMobile ? "visible" : "hidden", // Change to visible for mobile
        transformOrigin: "center",
        // Apply Safari-specific optimizations
        ...(isSafari && {
          WebkitBackfaceVisibility: "hidden",
          WebkitTransform: "translateZ(0)",
        }),
      }}
      onHoverStart={() => {
        setHoveredTech(index);
        hoveredTechRef.current = index;
      }}
      onHoverEnd={() => {
        setHoveredTech(null);
        hoveredTechRef.current = null;
      }}
    >
        {/* Conditionally render animated border glow based on performance */}
        {!reducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-xl z-0"
            style={{ boxShadow: `0 0 0px ${tech.color}00` }}
            animate={{
              boxShadow: isMobile 
                ? [`0 0 3px ${tech.color}22`, `0 0 8px ${tech.color}44`, `0 0 3px ${tech.color}22`]
                : [`0 0 5px ${tech.color}33`, `0 0 15px ${tech.color}55`, `0 0 5px ${tech.color}33`],
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
          variants={getIconAnimation(tech.color, isMobile, reducedMotion)}
          animate="animate"
          whileHover="hover"
          whileTap="hover"
          style={{ 
            position: "relative", 
            zIndex: 2, 
            padding: isMobile ? "6px" : "8px",
            // Hardware acceleration hints
            willChange: "transform, filter",
          }}
        >
          {/* Desktop pulsing background glow */}
          {!reducedMotion && !isMobile && (
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
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1.4, 1.6, 1.4],
                }}
                transition={{
                  duration: pulseSpeed,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${tech.color}22 0%, transparent 60%)`,
                  filter: "blur(5px)",
                  zIndex: 0,
                  transform: "scale(1.2)",
                }}
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1.2, 1.3, 1.2],
                }}
                transition={{
                  duration: pulseSpeed * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
          
          {/* Simplified background glow for mobile */}
          {!reducedMotion && isMobile && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tech.color}22 0%, transparent 70%)`,
                filter: "blur(6px)",
                zIndex: 0,
                transform: "scale(1.3)",
                opacity: 0.5,
              }}
            />
          )}

          <tech.icon
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl relative z-10"
            style={{ 
              color: tech.color, 
              display: "block",
              // Safari optimization
              WebkitTransform: isSafari ? "translateZ(0)" : "none",
            }}
          />
        </motion.div>
        
        {/* Technology name with optimized text effects */}
        <motion.div
          className="text-center mt-1 sm:mt-2 font-medium text-xs sm:text-sm md:text-base"
          style={{
            color: tech.color,
            textShadow: isMobile ? `0 0 5px ${tech.color}44` : `0 0 8px ${tech.color}66`,
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
      prevProps.isSafari === nextProps.isSafari &&
      prevProps.reducedMotion === nextProps.reducedMotion
    );
  }
);

const Technologies = () => {
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const preferredReducedMotion = useReducedMotion();

  // Use our unified system profile hook
  const { performanceTier, deviceType } = useSystemProfile();
  const shouldUseScrollTrigger = performanceTier !== "low";
  
  // Detect mobile device and Safari
  useEffect(() => {
    // Check if it's a mobile device
    const checkMobile = () => {
      const mobileCheck = 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
      setIsMobile(mobileCheck);
    };
    
    // Check if it's Safari
    const checkSafari = () => {
      const isSafariCheck = 
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent) ||
        (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
      setIsSafari(isSafariCheck);
    };
    
    checkMobile();
    checkSafari();
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reduce stagger animation on mobile for smoother rendering
  const staggerMultiplier = deviceType === "desktop" && !isMobile ? 0.2 : 0.1;
  const containerVars = optimizedContainerVariants(staggerMultiplier, isMobile);
  
  // Determine if we should reduce animations
  const reducedMotion = preferredReducedMotion || (isMobile && performanceTier === "low");

  return (
    <section
      id="technologies"
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0f0528, #130a35, #1a0d40)",
        minHeight: isMobile ? "70vh" : "80vh",
        padding: isMobile ? "4rem 0 6rem 0" : "6rem 0 8rem 0",
        position: "relative",
        clipPath: "polygon(0 0, 100% 0, 100% 95%, 0 100%)",
      }}
    >
      {/* Top overlay gradient - simplified for mobile */}
      <div
        className="absolute top-0 left-0 w-full h-20 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15, 5, 40, 0) 0%, rgba(15, 5, 40, 0.8) 100%)",
          transform: "translateY(-100%)",
          opacity: isMobile ? 0.6 : 0.8,
        }}
      />
      
      {/* UPDATED: Light effects for desktop only, completely disabled for mobile */}
      {performanceTier !== "low" && !isMobile && (
        <div className="absolute inset-0 overflow-hidden">
          <Suspense fallback={null}>
            <LightEffects simplified={deviceType !== "desktop"} />
          </Suspense>
        </div>
      )}

      <motion.div
        className="relative z-10 container mx-auto px-3 sm:px-6 md:px-8 h-full flex flex-col"
        variants={containerVars}
        initial="hidden"
        {...(shouldUseScrollTrigger
          ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
          : { animate: "visible" }
        )}
        style={{ 
          willChange: "opacity, transform",
          // Safari optimizations
          ...(isSafari && {
            WebkitBackfaceVisibility: "hidden",
            WebkitTransform: "translateZ(0)",
          })
        }}
      >
        <motion.h2
          className="mb-8 sm:mb-12 md:mb-16 mt-4 text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"
          variants={titleVariants}
          whileHover="hover"
          whileTap="hover"
          style={{
            background:
              "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7, #ec4899)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: reducedMotion ? "none" : "gradientShift 6s ease-in-out infinite",
            textShadow: isMobile ? "0 2px 20px rgba(236, 72, 153, 0.25)" : "0 2px 30px rgba(236, 72, 153, 0.3)",
            paddingBottom: "10px",
            // Improve Safari text rendering
            ...(isSafari && { fontSmoothing: "antialiased", WebkitFontSmoothing: "antialiased" }),
          }}
        >
          Skills & Tools
        </motion.h2>

        <motion.div 
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-${isMobile ? '2' : '3'} sm:gap-4 md:gap-6 justify-items-center max-w-7xl mx-auto`}
          style={{ 
            // Help browser optimize the grid layout
            contentVisibility: "auto",
            containIntrinsicSize: "auto 500px" 
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
              isSafari={isSafari}
              reducedMotion={reducedMotion}
            />
          ))}
        </motion.div>

        <div className="w-full max-w-5xl mx-auto mt-12 sm:mt-16">
          <div
            className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-70"
            style={{ boxShadow: isMobile ? "0 0 6px rgba(168, 85, 247, 0.2)" : "0 0 10px rgba(168, 85, 247, 0.3)" }}
          />
        </div>
      </motion.div>

      {/* Bottom gradient - simplified for mobile */}
      <div className="absolute bottom-0 left-0 w-full h-16 z-10 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to top, rgba(26, 13, 64, 0.8) 0%, rgba(26, 13, 64, 0) 100%)",
            transform: "translateY(50%)",
          }}
        />
      </div>
    </section>
  );
};

export default memo(Technologies);