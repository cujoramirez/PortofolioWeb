import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CERTIFICATIONS } from "../constants";

// Simplified animation variants for better performance
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      delay: 0.1
    } 
  },
  hover: { 
    scale: 1.03, 
    textShadow: "0px 0px 10px rgba(168,85,247,0.7)", 
    transition: { duration: 0.3 } 
  },
};

const certCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
  hover: {
    y: -8,
    scale: 1.03,
    boxShadow: "0 20px 40px -10px rgba(168,85,247,0.2)",
    transition: { duration: 0.3 },
  }
};

const filterButtonVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  },
  inactive: { 
    backgroundColor: "rgba(45, 45, 50, 0.6)",
    color: "#a1a1aa",
    border: "1px solid rgba(82, 82, 95, 0.4)"
  },
  active: { 
    backgroundColor: "rgba(168, 85, 247, 0.25)",
    color: "#d8b4fe",
    border: "1px solid rgba(168, 85, 247, 0.6)",
    boxShadow: "0 0 15px rgba(168, 85, 247, 0.3)"
  },
  hover: { scale: 1.05 }
};

// Memoized filter button component
const FilterButton = memo(({ issuer, isActive, onClick, index }) => {
  return (
    <motion.button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-200 relative"
      variants={filterButtonVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      custom={index}
    >
      <motion.span
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={isActive ? "active" : "inactive"}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{issuer}</span>
      
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full bg-purple-500/20"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: [0.9, 1.05, 0.9], 
            opacity: [0, 0.4, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
      )}
    </motion.button>
  );
});

// Memoized certification card component
const CertificationCard = memo(({ cert, index }) => {
  return (
    <motion.a
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      variants={certCardVariants}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <div className="h-full overflow-hidden rounded-xl bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 shadow-md group-hover:border-purple-500/50 transition-all duration-300">
        <div className="relative aspect-video w-full overflow-hidden">
          {/* Simplified overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
          
          <img
            src={cert.image}
            alt={cert.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          <div className="absolute bottom-0 left-0 w-full p-3 z-20">
            <div className="inline-block px-3 py-1 bg-purple-600/80 backdrop-blur-sm rounded text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              View Certificate
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">
            {cert.title}
          </h3>
          <div className="mt-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
            <p className="text-neutral-400 text-sm">{cert.issuer}</p>
          </div>
          
          <div className="mt-2 text-neutral-500 text-xs">
            {cert.date || "Certification verified"}
          </div>
        </div>
      </div>
    </motion.a>
  );
});

const Certifications = () => {
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const [isInView, setIsInView] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const sectionRef = useRef(null);
  
  // Extract unique issuers for filter buttons
  const issuers = ["All", ...new Set(CERTIFICATIONS.map(cert => cert.issuer))];
  
  // Handle issuer change with optimized animation
  const handleIssuerChange = useCallback((issuer) => {
    if (issuer !== selectedIssuer) {
      setIsChanging(true);
      setTimeout(() => {
        setSelectedIssuer(issuer);
        setIsChanging(false);
      }, 200); // Reduced timeout for faster transitions
    }
  }, [selectedIssuer]);
  
  // Filter certificates based on selected issuer
  const filteredCertifications = selectedIssuer === "All" 
    ? CERTIFICATIONS 
    : CERTIFICATIONS.filter(cert => cert.issuer === selectedIssuer);

  // Optimized intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      id="certifications"
      ref={sectionRef}
      className="pb-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto relative"
      variants={pageContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* Title Section with simplified animations */}
      <div className="relative py-12 flex flex-col items-center">
        <motion.div 
          className="absolute w-32 h-32 rounded-full bg-purple-500 opacity-10 filter blur-3xl"
          initial={{ scale: 0, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 0.1 } : { scale: 0, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        <motion.h2
          className="text-center text-4xl md:text-5xl font-bold w-full relative z-10 bg-gradient-text"
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          whileHover="hover"
        >
          Certifications
        </motion.h2>
        
        <motion.div 
          className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full"
          initial={{ width: 0, opacity: 0 }}
          animate={isInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </div>

      {/* Optimized Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {issuers.map((issuer, index) => (
          <FilterButton
            key={issuer}
            issuer={issuer}
            isActive={selectedIssuer === issuer}
            onClick={() => handleIssuerChange(issuer)}
            index={index}
          />
        ))}
      </div>

      {/* Optimized Certificates Grid with transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedIssuer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertifications.map((cert, index) => (
              <CertificationCard 
                key={`${cert.title}-${index}`} 
                cert={cert} 
                index={index} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Simplified decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-48 h-48 rounded-full bg-purple-700/10 filter blur-3xl"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={isInView ? { 
            scale: [0.5, 0.7, 0.5],
            opacity: [0, 0.2, 0],
            x: [0, 20, 0],
            y: [0, -10, 0],
          } : { scale: 0.5, opacity: 0 }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* CSS styles with performance optimizations */}
      <style jsx global>{`
        .bg-gradient-text {
          background: linear-gradient(90deg, #a855f7, #ec4899, #8b5cf6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 6s ease-in-out infinite alternate;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .bg-gradient-text {
            animation: none;
            background-position: 0% 50%;
          }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
};

export default memo(Certifications);