import React, { memo, useEffect, useState } from "react";
import { EXPERIENCES } from "../constants";
import { motion } from "framer-motion";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

function Experience() {
  // Device capability detection
  const { performanceTier } = useSystemProfile();
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Set loaded state after initial render to help with scrolling
    setIsLoaded(true);
    
    // Detect iOS Safari specifically since it needs special handling
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    setIsSafariMobile(isIOS && isSafari);
  }, []);
  
  // Determine animation settings based on device capabilities
  const useReducedMotion = performanceTier === "low" || isSafariMobile;
  
  // Define animation variants with conditional complexity
  const containerVariants = useReducedMotion 
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1, 
          transition: { 
            duration: 0.4, 
            staggerChildren: 0.1,
            ease: "easeOut" 
          } 
        }
      };
  
  // Restored title variants with the purple shine effect
  const titleVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    hover: {
      scale: 1.03,
      textShadow: "0px 0px 8px rgba(168,85,247,0.6)",
      transition: { duration: 0.2 }
    },
  };
  
  const itemVariants = useReducedMotion 
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.3 } 
        },
        hover: {
          scale: 1.01,
          boxShadow: "0px 4px 12px rgba(168,85,247,0.15)",
          transition: { duration: 0.2 }
        }
      };
  
  // Tech tag variants with the purple shine effect
  const tagVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    hover: {
      backgroundColor: "rgba(168,85,247,0.8)",
      color: "#ffffff",
      boxShadow: "0 0 8px rgba(168,85,247,0.6)",
      transition: { duration: 0.2 }
    },
  };
  
  // Apply optimized animation properties
  const containerProps = useReducedMotion
    ? { animate: "visible" }
    : { 
        initial: "hidden",
        whileInView: "visible", 
        viewport: { once: true, margin: "-5%" }
      };
  
  // Apply styles that work across all browsers
  const cardStyle = {
    backgroundColor: "rgba(10, 10, 10, 0.95)",
    ...(useReducedMotion ? {} : {
      backdropFilter: "blur(8px)",
      backgroundColor: "rgba(10, 10, 10, 0.5)"
    })
  };

  return (
    <div className="pb-12 px-4">
      {/* Ensure content is immediately visible on Safari */}
      {isSafariMobile && !isLoaded && (
        <h2 className="my-12 md:my-16 text-center text-3xl md:text-4xl font-bold text-purple-500">
          Experience
        </h2>
      )}
      
      <motion.div
        variants={containerVariants}
        {...containerProps}
        className="space-y-8"
      >
        {/* Section Title with restored shine effect */}
        <motion.h2
          className="my-12 md:my-16 text-center text-3xl md:text-4xl font-bold"
          variants={titleVariants}
          whileHover="hover"
          whileTap="hover"
          style={{
            background: "linear-gradient(90deg, #a855f7, #cbd5e1, #ec4899)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: useReducedMotion ? "none" : "gradientShift 4s ease-in-out infinite alternate",
          }}
        >
          Experience
        </motion.h2>

        {/* Experience Cards - Optimized for all platforms */}
        <div className="space-y-8 md:space-y-10">
          {EXPERIENCES.map((experience, index) => (
            <motion.div
              key={index}
              className="flex flex-col lg:flex-row lg:justify-center items-start p-5 md:p-6 rounded-lg border border-neutral-800"
              variants={itemVariants}
              whileHover={useReducedMotion ? undefined : "hover"}
              style={cardStyle}
              layoutId={`exp-${index}`}
            >
              <div className="w-full lg:w-1/4 mb-3 lg:mb-0">
                <p className="text-sm text-neutral-400 font-medium">
                  {experience.year}
                </p>
              </div>
              <div className="w-full lg:w-3/4">
                <div className="flex flex-wrap items-center mb-2">
                  <h3 className="font-semibold text-lg mr-2">
                    {experience.role}
                  </h3>
                  <span className="text-sm text-purple-300">
                    {experience.company}
                  </span>
                </div>
                <p className="mb-4 text-neutral-400">
                  {experience.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {experience.technologies.map((tech, idx) => (
                    <motion.span
                      key={idx}
                      className="rounded bg-neutral-900 px-2.5 py-1 text-sm font-medium text-purple-400 border border-neutral-800"
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
        </div>
      </motion.div>

      {/* Optimized styles with conditional rendering for performance */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* Fix iOS Safari rendering issues */
        @supports (-webkit-touch-callout: none) {
          .experience-card {
            transform: translateZ(0);
          }
        }
        
        /* Ensure content is painted quickly on all browsers */
        html {
          content-visibility: auto;
          contain-intrinsic-size: 1px 5000px; /* Approximate size of page */
        }
        
        /* Improve scrolling on iOS */
        body {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}

export default memo(Experience);
