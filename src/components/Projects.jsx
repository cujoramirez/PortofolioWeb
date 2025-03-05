import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PROJECTS } from "../constants";

// Custom hook to detect low‑end devices based on a simple heuristic
function useLowEndDevice() {
  const [isLowEnd, setIsLowEnd] = React.useState(false);
  React.useEffect(() => {
    const lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isOlderIphone = /iPhone OS (7|8|9|10|11|12)_/i.test(navigator.userAgent);
    setIsLowEnd(isMobile && (isOlderIphone || lowMemory));
  }, []);
  return isLowEnd;
}

// Lighter-weight animation variants for better performance
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: "easeOut", 
      staggerChildren: 0.08 
    } 
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: "easeOut" } 
  },
  hover: { 
    scale: 1.02, 
    textShadow: "0px 0px 6px rgba(168,85,247,0.6)", 
    transition: { duration: 0.2 } 
  },
};

// Minimal project content variants
const projectContentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Simplified hover effects for project image
const projectImageHover = {
  scale: 1.03,
  filter: "brightness(1.05)",
  transition: { duration: 0.2 },
};

// Memoized tag component with virtually instant animation
const TechTag = React.memo(({ tech, index }) => {
  const tagVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.1 + index * 0.02, duration: 0.2 }
    },
    hover: {
      backgroundColor: "rgba(168,85,247,0.7)",
      color: "#ffffff",
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.span
      className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-purple-400 border border-purple-500/30 will-change-transform"
      variants={tagVariants}
      whileHover="hover"
      whileTap="hover"
    >
      {tech}
    </motion.span>
  );
});

const Projects = () => {
  const [expandedTags, setExpandedTags] = useState({});
  const initialVisibleTags = 4;
  
  const toggleTags = useCallback((projectIndex) => {
    setExpandedTags(prev => ({
      ...prev,
      [projectIndex]: !prev[projectIndex]
    }));
  }, []);

  // Memoized gradient style to prevent recalculation
  const gradientStyle = {
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  };

  // Use low‑end device check to conditionally apply scroll triggers
  const isLowEnd = useLowEndDevice();
  const shouldUseScrollTrigger = !isLowEnd;
  const containerProps = shouldUseScrollTrigger
    ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
    : { animate: "visible" };

  return (
    <div
      id="projects"
      className="pb-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
    >
      {/* Title with optimized animation */}
      <motion.h2
        className="my-16 text-center text-4xl md:text-5xl font-bold w-full bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-slate-300 to-purple-600"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="hover"
        style={gradientStyle}
      >
        My Projects
      </motion.h2>

      <motion.div
        className="grid gap-10"
        variants={containerVariants}
        initial="hidden"
        {...containerProps}
      >
        {PROJECTS.map((project, index) => (
          <motion.div
            key={index}
            className="bg-neutral-800/40 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm border border-neutral-700/50 hover:border-purple-500/50 transition-colors duration-300 will-change-transform"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            whileTap="hover"
          >
            <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 md:gap-8">
              {/* Project Image with optimized loading */}
              <motion.div
                className="flex-shrink-0 flex justify-center lg:justify-start"
                variants={projectContentVariants}
              >
                <motion.div 
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shadow-lg"
                  whileHover={projectImageHover}
                  whileTap={projectImageHover}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </motion.div>
              </motion.div>
              
              {/* Project Text */}
              <motion.div
                className="flex-grow space-y-3"
                variants={projectContentVariants}
              >
                <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                  {project.title}
                </h3>
                
                <p className="text-neutral-300 leading-relaxed">
                  {project.description}
                </p>
                
                <div className="pt-1 md:pt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies
                      .slice(0, expandedTags[index] ? project.technologies.length : initialVisibleTags)
                      .map((tech, idx) => (
                        <TechTag key={tech + idx} tech={tech} index={idx} />
                      ))}
                    
                    {project.technologies.length > initialVisibleTags && (
                      <motion.button
                        onClick={() => toggleTags(index)}
                        className="rounded-full bg-neutral-900/70 px-3 py-1.5 text-sm font-medium text-purple-300 border border-purple-500/20 cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {expandedTags[index] 
                          ? <span className="flex items-center gap-1">Less <span className="text-xs">▲</span></span>
                          : <span className="flex items-center gap-1">+{project.technologies.length - initialVisibleTags} <span className="text-xs">▼</span></span>
                        }
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-3 md:pt-4">
                  {project.title === "Ensemble Model Research for Deep Learning" ? (
                    <motion.div
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-indigo-900 text-white border border-purple-500/50 font-medium shadow-md flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Ongoing Research
                    </motion.div>
                  ) : (
                    project.links && project.links.length > 0 && (
                      project.links.map((link, idx) => {
                        let displayText = "View Project";
                        try {
                          if (typeof link === 'string') {
                            const url = new URL(link);
                            displayText = url.hostname.replace('www.', '');
                          } else if (link.text) {
                            displayText = link.text;
                          }
                        } catch (e) {}
                        
                        return (
                          <motion.a
                            key={idx}
                            href={typeof link === 'string' ? link : link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md flex items-center gap-2 relative overflow-hidden group"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-full transition-all duration-500 ease-out"></div>
                            
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            
                            {displayText}
                          </motion.a>
                        );
                      })
                    )
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .bg-gradient-to-r {
            animation: gradientShift 6s ease-in-out infinite alternate;
            background-size: 200% 200%;
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        .will-change-transform {
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default React.memo(Projects);
