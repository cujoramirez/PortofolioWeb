import React, { useState, useCallback, useRef, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { CERTIFICATIONS } from "../constants";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Animation Variants
const pageContainerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut", delay: 0.1 } 
  },
  hover: { 
    scale: 1.02, 
    textShadow: "0px 0px 8px rgba(168,85,247,0.6)", 
    transition: { duration: 0.2 } 
  },
};

const certCardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: "easeOut" } 
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2 },
  }
};

const filterButtonVariants = {
  initial: { opacity: 0, y: 5 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  },
  hover: { scale: 1.03, transition: { duration: 0.15 } }
};

// Memoized Filter Button
const FilterButton = memo(({ issuer, isActive, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm relative"
      variants={filterButtonVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${
          isActive 
            ? "bg-purple-500/25 border border-purple-500/60" 
            : "bg-neutral-800/60 border border-neutral-700/40"
        }`}
      />
      <span className="relative z-10">{issuer}</span>
      
      {isActive && (
        <motion.span
          className="absolute inset-0 rounded-full bg-purple-500/15"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ 
            scale: [0.95, 1.03, 0.95], 
            opacity: [0, 0.3, 0] 
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.5
          }}
        />
      )}
    </motion.button>
  );
});

// Separate memoized component for the certificate image.
const CertificationImage = memo(({ src, alt }) => (
  <img
    src={src}
    alt={alt}
    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
    loading="lazy"
    decoding="async"
    width="400"
    height="225"
  />
));

// Memoized Certification Card (with memoized image)
const CertificationCard = memo(({ cert }) => {
  return (
    <motion.a
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full transform-gpu"
      variants={certCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <div className="h-full overflow-hidden rounded-xl bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 shadow-md group-hover:border-purple-500/50 transition-all duration-200">
        <div className="relative aspect-video w-full overflow-hidden">
          {/* Optimized overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-70 group-hover:opacity-90 transition-opacity duration-200" />
          
          <CertificationImage src={cert.image} alt={cert.title} />
          
          <div className="absolute bottom-0 left-0 w-full p-3 z-20">
            <div className="inline-block px-3 py-1 bg-purple-600/80 backdrop-blur-sm rounded text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              View Certificate
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors duration-200 line-clamp-2">
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
  
  // Extract unique issuers for filter buttons
  const issuers = ["All", ...new Set(CERTIFICATIONS.map(cert => cert.issuer))];
  
  const handleIssuerChange = useCallback((issuer) => {
    if (issuer !== selectedIssuer) {
      setSelectedIssuer(issuer);
    }
  }, [selectedIssuer]);
  
  // Filter certificates based on selected issuer
  const filteredCertifications = selectedIssuer === "All" 
    ? CERTIFICATIONS 
    : CERTIFICATIONS.filter(cert => cert.issuer === selectedIssuer);

  // Use the unified system profile hook to determine performance tier.
  const { performanceTier } = useSystemProfile();
  const isLow = performanceTier === "low";
  const shouldUseScrollTrigger = !isLow;
  const containerProps = shouldUseScrollTrigger
    ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
    : { animate: "visible" };

  // Memoized gradient style for the title.
  const gradientStyle = {
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animation: "gradientShift 8s ease-in-out infinite alternate"
  };

  return (
    <motion.div
      id="certifications"
      className="pb-16 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto relative will-change-opacity"
      variants={pageContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title Section */}
      <div className="relative py-10 flex flex-col items-center">
        { !isLow && (
          <motion.div 
            className="absolute w-24 h-24 rounded-full bg-purple-500 opacity-10 filter blur-2xl"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}
        
        <motion.h2
          className="text-center text-4xl md:text-5xl font-bold w-full relative z-10 bg-gradient-text"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          Certifications
        </motion.h2>
        
        <motion.div 
          className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mt-4 rounded-full"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {issuers.map((issuer) => (
          <FilterButton
            key={issuer}
            issuer={issuer}
            isActive={selectedIssuer === issuer}
            onClick={() => handleIssuerChange(issuer)}
          />
        ))}
      </div>

      {/* Certificates Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCertifications.map((cert, index) => (
            <div 
              key={`${cert.title}-${index}`}
              className="cert-card-container"
              data-cert-id={`${cert.title}-${index}`}
            >
              <CertificationCard cert={cert} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Decorative Element */}
      { !isLow && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 right-10 w-40 h-40 rounded-full bg-purple-700/10 filter blur-2xl will-change-transform"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 0.6, 0.5],
              opacity: [0, 0.15, 0],
              x: [0, 15, 0],
              y: [0, -5, 0],
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 1
            }}
          />
        </div>
      )}

      <style>{`
        .bg-gradient-text {
          background: linear-gradient(90deg, #a855f7, #ec4899);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 8s ease-in-out infinite alternate;
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
