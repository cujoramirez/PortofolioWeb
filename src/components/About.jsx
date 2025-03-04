import React, { useEffect, memo } from "react";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";
import { ABOUT_TEXT } from "../constants/index";
import { motion, useAnimation } from "framer-motion";

// Enhanced title variant with more impressive animations
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

// Container variant with improved stagger for overall fade-in
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

// Enhanced image variants with more dramatic entrance and hover effects
const imageVariants = {
  hidden: { x: -100, opacity: 0, rotateY: 10 },
  visible: {
    x: 0,
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 1,
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

// Enhanced image container variants
const imageContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

// Text variant: enhanced slide in from the right with better easing
const textVariants = {
  hidden: { x: 100, opacity: 0 },
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

// Word variants with enhanced staggered reveal and hover effects
const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.8 + i * 0.012, // Slightly faster to improve readability
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.08,
    color: "#a855f7",
    textShadow: "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Background shape animation variants
const shapeVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i) => ({
    opacity: 0.07,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.2,
      duration: 0.8,
      ease: "easeOut",
    },
  }),
  animate: (i) => ({
    rotate: i % 2 === 0 ? [0, 5, 0] : [0, -5, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 6 + i,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  }),
};

// Dynamic word coloring - special words will get gradient treatment
const specialWords = [
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

// Section divider
const dividerVariants = {
  hidden: { width: 0, opacity: 0 },
  visible: {
    width: "80%",
    opacity: 1,
    transition: {
      delay: 0.5,
      duration: 1,
      ease: "easeOut",
    },
  },
};

function About() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("animate");
  }, [controls]);

  // Highlight specific words in the text
  const highlightSpecialWords = () => {
    if (!ABOUT_TEXT) return [];

    // Create a regex pattern from the special words array
    // This will match whole words and phrases
    const specialWordsPattern = specialWords
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special regex chars
      .join("|");

    const regex = new RegExp(`(${specialWordsPattern})`, "gi");

    // Split text by special words and preserve delimiters
    const segments = ABOUT_TEXT.split(regex);

    return segments.map((segment, index) => {
      const isSpecial = specialWords.some(
        (word) => segment.toLowerCase() === word.toLowerCase()
      );

      if (isSpecial) {
        return (
          <motion.span
            key={`special-${index}`}
            custom={index}
            variants={wordVariants}
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
            whileHover="hover"
            whileTap="hover"
          >
            {segment}
          </motion.span>
        );
      }

      // For non-special text, we need to preserve spacing while animating words
      return segment.split(/(\s+)/).map((part, partIndex) => {
        // If it's whitespace, just return it directly to preserve spacing
        if (part.trim() === "") {
          return <span key={`space-${index}-${partIndex}`}>{part}</span>;
        }

        // Otherwise it's a word to animate
        return (
          <motion.span
            key={`word-${index}-${partIndex}`}
            custom={index + partIndex}
            variants={wordVariants}
            className="inline-block"
            whileHover="hover"
            whileTap="hover"
          >
            {part}
          </motion.span>
        );
      });
    });
  };

  return (
    <motion.div
      className="
        pt-8
        pb-12
        relative
        // [FIX] Removed overflow-hidden so text won't be clipped
      "
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      style={{ willChange: "opacity, transform" }}
    >
      {/* Background animated shapes */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-5 will-change-transform"
          style={{
            background: "linear-gradient(45deg, #a855f7, #ec4899)",
            height: `${100 + i * 50}px`,
            width: `${100 + i * 50}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            zIndex: -1,
          }}
          variants={shapeVariants}
          custom={i}
          initial="hidden"
          whileInView="visible"
          animate={controls}
          viewport={{ once: true }}
        />
      ))}

      {/* Enhanced title with hover animation */}
      <motion.h2
        className="my-12 text-center text-5xl font-bold leading-normal whitespace-normal break-words"
        variants={titleVariants}
        whileHover="hover"
        whileTap="hover"
        style={{ willChange: "transform, filter" }}
      >
        <span className="text-white">About</span>
        <motion.span
          className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
          style={{
            backgroundSize: "200% 200%",
            animation: "gradientShift 4s ease-in-out infinite",
            willChange: "background-position, filter",
          }}
        >
          {" "}
          me
        </motion.span>
      </motion.h2>

      {/* Animated divider */}
      <motion.div
        className="h-1 mx-auto mb-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        variants={dividerVariants}
        style={{ willChange: "width, opacity" }}
      />

      {/* Content wrapper */}
      <div className="flex flex-wrap">
        {/* Left: Enhanced Image with floating animation */}
        <motion.div
          className="w-full lg:w-1/2 lg:p-8"
          variants={imageContainerVariants}
          style={{ willChange: "opacity" }}
        >
          <div className="flex items-center justify-center h-full">
            <motion.div
              className="relative w-4/5 max-w-md mx-auto rounded-2xl shadow-lg"
              variants={imageVariants}
              whileHover="hover"
              whileTap="hover"
              style={{ willChange: "transform, opacity" }}
            >
              <motion.img
                src={aboutImg}
                alt="about"
                className="rounded-2xl shadow-lg shadow-purple-500/20 transition-all duration-300 z-10 relative w-full h-auto object-cover"
                initial={{ filter: "brightness(0.8)" }}
                whileHover={{ filter: "brightness(1.1)" }}
                whileTap={{ filter: "brightness(1.1)" }}
                style={{ willChange: "filter, transform" }}
              />
              {/* Image decorative elements */}
              <motion.div
                className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-purple-500/50 z-0"
                initial={{ opacity: 0 }}
                whileInView={{
                  opacity: 1,
                  transition: { delay: 1.2, duration: 0.5 },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.4 },
                }}
                whileTap="hover"
                viewport={{ once: true }}
                style={{ willChange: "transform, opacity" }}
              />
              <motion.div
                className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-pink-500/50 z-0"
                initial={{ opacity: 0 }}
                whileInView={{
                  opacity: 1,
                  transition: { delay: 1.4, duration: 0.5 },
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.4 },
                }}
                whileTap="hover"
                viewport={{ once: true }}
                style={{ willChange: "transform, opacity" }}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Enhanced Text with improved word highlighting */}
        <motion.div
          className="w-full lg:w-1/2 p-4 lg:p-8"
          variants={textVariants}
          style={{ willChange: "transform, opacity" }}
        >
          <div className="flex items-center justify-center">
            <motion.p
              className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg whitespace-normal break-words"
              style={{ willChange: "transform, opacity" }}
            >
              {highlightSpecialWords()}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Enhanced gradient keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(168,85,247,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(168,85,247,0); }
          100% { box-shadow: 0 0 0 0 rgba(168,85,247,0); }
        }
      `}</style>
    </motion.div>
  );
}

// Wrap in React.memo to reduce re-renders
export default React.memo(About);
