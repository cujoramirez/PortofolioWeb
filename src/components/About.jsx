import React, { useEffect, memo } from "react";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";
import { ABOUT_TEXT } from "../constants/index";
import { motion, useAnimation } from "framer-motion";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Enhanced title variant with lighter animations for mobile
const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.05,
    textShadow: "0px 0px 12px rgba(168,85,247,0.8)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Container variant with reduced stagger for mobile
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Image variants optimized for mobile
const imageVariants = {
  hidden: { x: -50, opacity: 0, rotateY: 5 },
  visible: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0px 0px 20px rgba(168,85,247,0.4)",
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Light image container variants
const imageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Simplified text variant for mobile
const textVariants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, 0.05, 0.01, 0.9],
      delay: 0.4,
    },
  },
};

// Helper: Generate device-appropriate word variants
const getEnhancedWordVariants = (isMobile, delayMultiplier) => ({
  hidden: { opacity: 0, y: 10 }, // Less movement on mobile
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * delayMultiplier,
      duration: isMobile ? 0.2 : 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: isMobile ? 1.04 : 1.08, // Smaller scale for mobile
    color: "#a855f7",
    textShadow: isMobile ? "0px 0px 4px rgba(168,85,247,0.4)" : "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
});

// Mobile-optimized divider animation
const getDividerVariants = (isMobile, isIOSSafari) => ({
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: isIOSSafari ? "80%" : ["0%", "60%", "80%"], // Skip keyframes on iOS Safari
    opacity: isIOSSafari ? 1 : [0, 0.5, 1],
    transition: {
      delay: 0.5,
      duration: isMobile ? 1.0 : 1.4,
      ease: "easeInOut",
      times: isIOSSafari ? [0, 0, 1] : [0, 0.7, 1],
    },
  },
});

// Simplified shape variants for mobile
const getShapeVariants = (isMobile) => ({
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: isMobile ? 0.05 : 0.07,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
  animate: (i) => ({
    rotate: i % 2 === 0 ? [0, 2, 0] : [0, -2, 0], // Reduced rotation
    scale: isMobile ? 1 : [1, 1.02, 1], // No scale change on mobile
    transition: {
      duration: 12 + i,
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
  const controls = useAnimation();
  const { performanceTier, deviceType } = useSystemProfile();
  
  // Detect iOS Safari for specific optimizations
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Device type detection
  const isMobile = deviceType === "mobile" || deviceType === "tablet";
  
  // Performance-based feature toggles
  const shouldUseScrollTrigger = performanceTier !== "low" && !isIOSSafari;
  const showShapes = performanceTier !== "low" && !(isIOSSafari && performanceTier !== "high");

  // Minimal or no stagger on mobile
  const delayMultiplier = isMobile ? 0.004 : 0.012;
  
  // Get device-appropriate variants
  const enhancedWordVariants = getEnhancedWordVariants(isMobile, delayMultiplier);
  const dividerVariants = getDividerVariants(isMobile, isIOSSafari);
  const shapeVariants = getShapeVariants(isMobile);
  
  // For the background shapes, we only do the infinite rotation on desktop with good performance
  const shouldAnimateShapes = !isMobile && performanceTier !== "low";
  const shapeAnimateState = shouldAnimateShapes ? "animate" : "visible";

  // Trigger animation immediately for low-performance devices
  useEffect(() => {
    if (!shouldUseScrollTrigger) {
      controls.start("animate");
      controls.start("visible");
    }
  }, [controls, shouldUseScrollTrigger]);

  // Highlight specific words in ABOUT_TEXT using enhanced variants
  const highlightSpecialWords = () => {
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
            variants={enhancedWordVariants}
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
            whileHover="hover"
            {...(!isMobile && { whileTap: "hover" })}
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
            variants={enhancedWordVariants}
            className="inline-block"
            whileHover="hover"
            {...(!isMobile && { whileTap: "hover" })}
          >
            {part}
          </motion.span>
        );
      });
    });
  };

  return (
    <motion.div
      className="pt-8 pb-12 relative"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      {...(shouldUseScrollTrigger
        ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
        : { animate: "visible" }
      )}
      // Only use willChange on desktop
      style={!isMobile ? { willChange: "opacity, transform" } : {}}
    >
      {/* Background animated shapes - reduced number on mobile */}
      {showShapes &&
        [...Array(isMobile ? 3 : 5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-5"
            style={{
              background: "linear-gradient(45deg, #a855f7, #ec4899)",
              height: `${100 + i * (isMobile ? 30 : 50)}px`,
              width: `${100 + i * (isMobile ? 30 : 50)}px`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
              zIndex: -1,
              // Hardware acceleration
              transform: "translateZ(0)",
            }}
            variants={shapeVariants}
            custom={i}
            initial="hidden"
            animate={shapeAnimateState}
          />
        ))}

      {/* Enhanced title with hover animation */}
      <motion.h2
        className="my-12 text-center text-5xl font-bold leading-normal whitespace-normal break-words"
        variants={titleVariants}
        whileHover="hover"
        whileTap="hover"
        style={{ transform: "translateZ(0)" }} // Hardware acceleration
      >
        <span className="text-white">About</span>
        <motion.span
          className="bg-gradient-to-r from-pink-500 to-pink-500 bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 200%",
            animation: "gradientShift 4s ease-in-out infinite",
            transform: "translateZ(0)", // Hardware acceleration
          }}
        >
          {" "}
          me
        </motion.span>
      </motion.h2>

      {/* Animated divider with mobile optimizations */}
      <motion.div
        className="h-1 mx-auto mb-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        variants={dividerVariants}
        style={{ 
          maxWidth: "400px", // Ensure consistent width
          transform: "translateZ(0)", // Hardware acceleration
        }}
      />

      {/* Content wrapper */}
      <div className="flex flex-wrap">
        {/* Left: Enhanced Image with floating animation */}
        <motion.div
          className="w-full lg:w-1/2 lg:p-8"
          variants={imageContainerVariants}
        >
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="relative w-4/5 max-w-md mx-auto rounded-2xl shadow-lg"
              variants={imageVariants}
              whileHover="hover"
              whileTap="hover"
              style={{ transform: "translateZ(0)" }} // Hardware acceleration
            >
              <motion.img
                src={aboutImg}
                alt="about"
                className="rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-300 z-10 relative w-full h-auto object-cover"
                initial={{ filter: "brightness(0.8)" }}
                whileHover={{ filter: "brightness(1.1)" }}
                whileTap={{ filter: "brightness(1.1)" }}
                style={{ transform: "translateZ(0)" }} // Hardware acceleration
              />
              {/* Optimized image border elements */}
              <motion.div
                className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-purple-500/50 z-0"
                initial={{ opacity: 0 }}
                {...(shouldUseScrollTrigger
                  ? {
                      whileInView: {
                        opacity: 1,
                        transition: { delay: 0.8, duration: 0.5 },
                      },
                      viewport: { once: true },
                    }
                  : {
                      animate: { opacity: 1, transition: { delay: 0.8, duration: 0.5 } },
                    }
                )}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                whileTap={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                style={{ transform: "translateZ(0)" }}
              />
              <motion.div
                className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-pink-500/50 z-0"
                initial={{ opacity: 0 }}
                {...(shouldUseScrollTrigger
                  ? {
                      whileInView: {
                        opacity: 1,
                        transition: { delay: 1.0, duration: 0.5 },
                      },
                      viewport: { once: true },
                    }
                  : {
                      animate: { opacity: 1, transition: { delay: 1.0, duration: 0.5 } },
                    }
                )}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                whileTap={{
                  scale: 1.03,
                  transition: { duration: 0.3 },
                }}
                style={{ transform: "translateZ(0)" }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Enhanced Text with improved word highlighting */}
        <motion.div
          className="w-full lg:w-1/2 p-4 lg:p-8"
          variants={textVariants}
          style={{ transform: "translateZ(0)" }}
        >
          <div className="flex items-center justify-center">
            <motion.p
              className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg whitespace-normal break-words"
            >
              {highlightSpecialWords()}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Optimized keyframe animation */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* iOS specific optimizations */
        @supports (-webkit-touch-callout: none) {
          .ios-fix {
            transform: translate3d(0,0,0);
          }
        }
      `}</style>
    </motion.div>
  );
}

export default memo(About);