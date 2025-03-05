import React, { useEffect } from "react";
import { EXPERIENCES } from "../constants";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Simplified container variant with faster animation
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: "easeOut",
      staggerChildren: 0.15 
    } 
  },
};

// Optimized item variants with faster transitions
const titleVariants = {
  hidden: { opacity: 0, y: -15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    scale: 1.03,
    textShadow: "0px 0px 8px rgba(168,85,247,0.6)",
    transition: { duration: 0.2 }
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    scale: 1.01,
    boxShadow: "0px 6px 12px rgba(168,85,247,0.15)",
    transition: { duration: 0.2 }
  },
};

const inlineItemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

// Simplified tag variants to reduce animation load
const tagVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  hover: {
    backgroundColor: "rgba(168,85,247,0.8)",
    color: "#ffffff",
    transition: { duration: 0.2 }
  },
};

const Experience = () => {
  // Use more efficient intersection observer with ref callback
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "0px 0px 100px 0px" // Preload earlier
  });

  // Trigger animations only when in view
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Memoize the gradient style to prevent recalculation
  const gradientStyle = {
    background: "linear-gradient(90deg, #a855f7, #cbd5e1, #ec4899)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "gradientShift 4s ease-in-out infinite alternate",
  };

  return (
    <motion.div
      ref={ref}
      className="pb-12 px-4 will-change-transform"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
    >
      {/* Section Title */}
      <motion.h2
        className="my-16 text-center text-4xl font-bold"
        variants={titleVariants}
        whileHover="hover"
        whileTap="hover"
        style={gradientStyle}
      >
        Experience
      </motion.h2>

      {/* Experience Cards - Using React.memo for each card would be ideal */}
      {EXPERIENCES.map((experience, index) => (
        <motion.div
          key={index}
          className="mb-10 flex flex-col lg:flex-row lg:justify-center items-start p-6 rounded-lg bg-neutral-950 bg-opacity-50 backdrop-blur-sm will-change-transform"
          variants={cardVariants}
          whileHover="hover"
          whileTap="hover"
          layout
        >
          <motion.div 
            className="w-full lg:w-1/4 mb-4 lg:mb-0"
            variants={inlineItemVariants}
          >
            <p className="text-sm text-neutral-400 font-medium">
              {experience.year}
            </p>
          </motion.div>
          <div className="w-full lg:w-3/4">
            <div className="flex flex-wrap items-center mb-2">
              <motion.h6 
                className="font-semibold text-lg mr-2"
                variants={inlineItemVariants}
              >
                {experience.role}
              </motion.h6>
              <motion.span 
                className="text-sm text-purple-300"
                variants={inlineItemVariants}
              >
                {experience.company}
              </motion.span>
            </div>
            <motion.p 
              className="mb-4 text-neutral-400"
              variants={inlineItemVariants}
            >
              {experience.description}
            </motion.p>
            <div className="flex flex-wrap">
              {experience.technologies.map((tech, idx) => (
                <motion.span
                  key={idx}
                  className="mr-2 mt-2 rounded bg-neutral-900 px-2 py-1 text-sm font-medium text-purple-800 border border-transparent hover:border-purple-700"
                  variants={tagVariants}
                  whileHover="hover"
                  whileTap="hover"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Optimized keyframes with will-change properties */}
{/* Use regular style tag instead of styled-jsx */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* Precompute the transform for better performance */
        .will-change-transform {
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>
    </motion.div>
  );
};

export default React.memo(Experience);
