import { motion, useScroll, useTransform } from "framer-motion";
import { FaFilePdf, FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import { RESEARCH_PAPERS } from "../constants";
import ResearchLogoLeft from "./ResearchLogoLeft";
import ResearchLogoRight from "./ResearchLogoRight";
import React, { useState, useEffect, useRef } from "react";
import useDeviceDetection from "./useDeviceDetection";

const Research = () => {
  const { scrollYProgress } = useScroll();
  const { isMobile, isTablet, isIOSSafari, performanceTier } = useDeviceDetection();
  const [isHovered, setIsHovered] = useState(null);

  // Reference for the section to calculate its position
  const sectionRef = useRef(null);
  
  // Create parallax effect for the logos
  const leftLogoY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const rightLogoY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const leftLogoRotate = useTransform(scrollYProgress, [0, 1], [0, 10]);
  const rightLogoRotate = useTransform(scrollYProgress, [0, 1], [0, -10]);
  
  // For title animation
  const titleGradientPosition = useTransform(
    scrollYProgress, 
    [0, 0.5, 1], 
    ["0% 50%", "50% 50%", "100% 50%"]
  );
  
  // Determine if we should use reduced animations
  const shouldReduceMotion = performanceTier === "low" || isIOSSafari || isMobile || isTablet;
  
  // Animation variants
  const containerVariants = shouldReduceMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { 
            duration: 0.7, 
            staggerChildren: 0.3,
            ease: "easeOut" 
          },
        },
      };

  const itemVariants = shouldReduceMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 40 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.7, ease: "easeOut" } 
        },
        hover: { 
          y: -8, // More lift
          scale: 1.01, // Subtle scale for the card
          boxShadow: "0 15px 35px -10px rgba(138, 92, 246, 0.35)", // More pronounced shadow
          background: "rgba(20, 20, 30, 0.85)", // Adjusted background
          transition: { duration: 0.3, ease: "easeOut" }
        }
      };

  const quoteIconVariants = {
    initial: { opacity: 0.5, scale: 1 },
    hover: { opacity: 1, scale: 1.1, color: "#c084fc", transition: { duration: 0.3 } }, // Brighter purple on hover
  };

  const descriptionBoxVariants = {
    initial: { boxShadow: "none" },
    hover: { 
      boxShadow: "0 0 15px 5px rgba(168, 85, 247, 0.2)", // Subtle purple glow
      borderColor: "rgba(168, 85, 247, 0.4)", // Highlight border
      transition: { duration: 0.3, ease: "easeOut" }
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
        delay: 0.2,
        staggerChildren: 0.05, // Added for letter-by-letter animation on scroll
      },
    },
    hover: { 
      scale: 1.05,
      // Adjusted textShadow for a softer glow matching title colors
      textShadow: '0 0 6px rgba(224, 176, 255, 0.4), 0 0 10px rgba(192, 132, 252, 0.5), 0 0 14px rgba(244, 114, 182, 0.4)', 
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10,
      },
    },
  };

  const letterVariants = {
    hidden: { // Renamed from 'initial' and added opacity for scroll-in animation
      opacity: 0,
      y: 0,
      color: null,
    },
    visible: { // Renamed from 'hover' and added opacity for scroll-in animation
      opacity: 1,
      y: [0, -5, 0, 5, 0],
      color: [null, '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7'],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1]
      }
    }
  };

  return (
    <div className="relative border-b border-neutral-800 pb-32" ref={sectionRef}>
      {/* Scientific research logos */}
      {!isIOSSafari && !isMobile && !isTablet && (
        <>
          <motion.div 
            className="absolute left-0 top-16 -z-1 hidden lg:block"
            style={{ 
              y: leftLogoY,
              rotate: leftLogoRotate,
              opacity: 0.2
            }}
            whileHover={{ opacity: 0.5, transition: { duration: 0.3 } }}
          >
            <ResearchLogoLeft />
          </motion.div>
          
          <motion.div 
            className="absolute right-0 top-16 -z-1 hidden lg:block"
            style={{ 
              y: rightLogoY,
              rotate: rightLogoRotate,
              opacity: 0.2
            }}
            whileHover={{ opacity: 0.5, transition: { duration: 0.3 } }}
          >
            <ResearchLogoRight />
          </motion.div>
        </>
      )}
      
      {/* Title with animated gradient */}
      {isMobile || isTablet ? (
        <div className="mb-10 md:mb-14 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2" style={{textShadow: '0 0 8px rgba(168,85,247,0.18)'}}>Research</h1>
          <div className="flex justify-center items-center mb-2">
            <span className="text-3xl font-bold text-purple-300">&amp;</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300" style={{textShadow: '0 0 8px rgba(34,211,238,0.18)'}}>Publications</h2>
        </div>
      ) : (
        <motion.h1
          className="text-5xl md:text-6xl lg:text-7xl font-bold mb-12 md:mb-16 text-center relative z-10 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 hover:from-purple-300 hover:via-pink-300 hover:to-purple-300 transition-all duration-300 ease-in-out cursor-default"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          whileHover="hover"
          style={{ textShadow: '0 0 5px rgba(255,255,255,0.3), 0 0 10px rgba(168, 85, 247,0.3)' }}
        >
          {"Research & Publications".split("").map((char, index) => (
            <motion.span 
              key={index} 
              variants={letterVariants}
              className="inline-block"
              style={{willChange: 'transform, color'}}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>
      )}
      
      {/* Research papers container */}
      {isMobile || isTablet ? (
        <div className="relative mx-auto max-w-5xl px-4">
          {RESEARCH_PAPERS.map((paper, index) => (
            <div
              key={index}
              className="mb-16 overflow-hidden rounded-xl border border-purple-900/30 bg-neutral-900/20 p-8 backdrop-blur-sm"
            >
              <div className="relative flex flex-col lg:flex-row lg:items-start">
                {/* Year and conference (left column on desktop) */}
                <div className="mb-6 lg:mb-0 lg:w-1/4 lg:pr-6">
                  <div className="flex flex-row items-center lg:flex-col lg:items-start">
                    <span className="inline-block rounded bg-purple-900/30 px-3 py-1 text-sm font-semibold text-purple-300">
                      {paper.year}
                    </span>
                    {paper.conference && (
                      <p className="ml-4 text-sm italic text-neutral-400 lg:mt-2 lg:ml-0">
                        {paper.conference}
                      </p>
                    )}
                  </div>
                </div>
                {/* Paper details (right column on desktop) */}
                <div className="flex-1">
                  <h3
                    className={`mb-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-cyan-300`}
                  >
                    {paper.title}
                  </h3>
                  {paper.authors && (
                    <p className="mb-4 text-sm font-semibold text-neutral-200 tracking-wide">
                      {paper.authors}
                    </p>
                  )}
                  <div className="relative mb-6 rounded-lg bg-neutral-900/40 p-6 border border-transparent">
                    <span className="absolute left-3 top-3">
                      <FaQuoteLeft className="h-4 w-4 text-purple-500/50" />
                    </span>
                    <p className="text-neutral-300 text-justify leading-relaxed">
                      {paper.description}
                    </p>
                    <span className="absolute right-3 bottom-3">
                      <FaQuoteRight className="h-4 w-4 text-purple-500/50" />
                    </span>
                  </div>
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Keywords
                    </p>
                    <div>
                      {paper.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="mr-2 mb-2 inline-block rounded-md border border-purple-900/30 bg-neutral-800/50 px-3 py-1 text-xs font-medium text-purple-300"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  {paper.pdfLink && (
                    <a
                      href={paper.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md bg-purple-800/20 px-4 py-2 text-sm font-medium text-purple-300 transition-colors"
                    >
                      <FaFilePdf className="mr-2 h-4 w-4" />
                      View Publication
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-5xl px-4"
        >
          {RESEARCH_PAPERS.map((paper, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="mb-16 overflow-hidden rounded-xl border border-purple-900/30 bg-neutral-900/20 p-8 backdrop-blur-sm"
              whileHover={shouldReduceMotion ? {} : "hover"}
              onHoverStart={() => setIsHovered(index)}
              onHoverEnd={() => setIsHovered(null)}
            >
              <div className="relative flex flex-col lg:flex-row lg:items-start">
                {/* Year and conference (left column on desktop) */}
                <motion.div
                  className="mb-6 lg:mb-0 lg:w-1/4 lg:pr-6"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="flex flex-row items-center lg:flex-col lg:items-start">
                    <span className="inline-block rounded bg-purple-900/30 px-3 py-1 text-sm font-semibold text-purple-300">
                      {paper.year}
                    </span>
                    {paper.conference && (
                      <p className="ml-4 text-sm italic text-neutral-400 lg:mt-2 lg:ml-0">
                        {paper.conference}
                      </p>
                    )}
                  </div>
                </motion.div>
                
                {/* Paper details (right column on desktop) */}
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Paper title */}
                  {(() => {
                    const isCalmPaper = paper.title === "CALM: Calibrated Adaptive Learning via Mutual-Ensemble Fusion";
                    const isCurrentlyHovered = isHovered === index && !shouldReduceMotion;

                    return (
                      <motion.h3
                        className={`mb-3 text-2xl font-bold text-transparent bg-clip-text ${
                          isCalmPaper && isCurrentlyHovered
                            ? 'bg-gradient-to-r from-pink-400 via-purple-600 to-indigo-600' // Hover gradient for CALM
                            : 'bg-gradient-to-r from-purple-300 to-cyan-300' // Default gradient
                        }`}
                        animate={{
                          scale: isCurrentlyHovered
                            ? (isCalmPaper ? 1.06 : 1.03) // Enhanced scale for CALM on hover
                            : 1,
                          filter: isCalmPaper && isCurrentlyHovered
                            ? 'drop-shadow(0 0 7px rgba(224, 176, 255, 0.7)) drop-shadow(0 0 14px rgba(192, 132, 252, 0.5))' // Glow for CALM
                            : 'none',
                        }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        {paper.title}
                      </motion.h3>
                    );
                  })()}
                  
                  {/* Authors */}
                  {paper.authors && (
                    <p className="mb-4 text-sm font-semibold text-neutral-200 tracking-wide hover:text-purple-300 transition-colors duration-300">
                      {paper.authors}
                    </p>
                  )}
                  
                  {/* Description with quote icons */}
                  <motion.div 
                    className="relative mb-6 rounded-lg bg-neutral-900/40 p-6 border border-transparent"
                    variants={descriptionBoxVariants}
                    animate={isHovered === index && !shouldReduceMotion ? "hover" : "initial"}
                  >
                    <motion.span variants={quoteIconVariants} animate={isHovered === index && !shouldReduceMotion ? "hover" : "initial"} className="absolute left-3 top-3">
                      <FaQuoteLeft className="h-4 w-4 text-purple-500/50" />
                    </motion.span>
                    <p className="text-neutral-300 text-justify leading-relaxed">
                      {paper.description}
                    </p>
                    <motion.span variants={quoteIconVariants} animate={isHovered === index && !shouldReduceMotion ? "hover" : "initial"} className="absolute right-3 bottom-3">
                      <FaQuoteRight className="h-4 w-4 text-purple-500/50" />
                    </motion.span>
                  </motion.div>
                  
                  {/* Keywords */}
                  <div className="mb-6">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                      Keywords
                    </p>
                    <div>
                      {paper.keywords.map((keyword, i) => (
                        <motion.span
                          key={i}
                          className="mr-2 mb-2 inline-block rounded-md border border-purple-900/30 bg-neutral-800/50 px-3 py-1 text-xs font-medium text-purple-300"
                          animate={{ y: isHovered === index && !shouldReduceMotion ? -2 : 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 10, duration: 0.2 }}
                          whileHover={{
                            backgroundColor: "rgba(168, 85, 247, 0.3)",
                            color: "#f3e8ff",
                            transition: { duration: 0.2 }
                          }}
                        >
                          {keyword}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  
                  {/* PDF link */}
                  {paper.pdfLink && (
                    <motion.a
                      href={paper.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center rounded-md bg-purple-800/20 px-4 py-2 text-sm font-medium text-purple-300 transition-colors"
                      whileHover={{ 
                        backgroundColor: "rgba(126, 34, 206, 0.3)",
                        color: "#f3e8ff"
                      }}
                    >
                      <motion.span 
                        animate={{ x: isHovered === index && !shouldReduceMotion ? 3 : 0 }} 
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      >
                        <FaFilePdf className="mr-2 h-4 w-4" />
                      </motion.span>
                      View Publication
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(Research);

