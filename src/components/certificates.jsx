import React, { useState, useCallback, useRef, memo, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { Box, Container, Typography, Grid, Paper, Chip } from "@mui/material";
import { EmojiEvents, Verified, School, Psychology, Science } from "@mui/icons-material";
import { CERTIFICATIONS } from "../constants";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Memoized Filter Button with conditional animations
const FilterButton = memo(({ issuer, isActive, onClick, useReducedMotion }) => {
  const filterButtonVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    hover: { scale: 1.03, transition: { duration: 0.15 } }
  };

  return (
    <motion.button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm relative"
      variants={filterButtonVariants}
      initial="initial"
      animate="animate"
      whileHover={useReducedMotion ? undefined : "hover"}
      whileTap={useReducedMotion ? undefined : { scale: 0.98 }}
    >
      <div 
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${
          isActive 
            ? "bg-purple-500/25 border border-purple-500/60" 
            : "bg-neutral-800/60 border border-neutral-700/40"
        }`}
      />
      <span className="relative z-10">{issuer}</span>
      
      {isActive && !useReducedMotion && (
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

// Enhanced lazy-loaded certification image component
const CertificationImage = memo(({ src, alt }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef(null);
  const isInView = useInView(imageRef, { once: true, margin: "100px" });

  return (
    <div ref={imageRef} className="relative w-full h-full">
      {isInView && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-103 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
          decoding="async"
          width="400"
          height="225"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.log('Image failed to load:', src);
            setImageError(true);
          }}
        />
      )}
      
      {/* Loading placeholder */}
      {(!isInView || !imageLoaded) && !imageError && (
        <div className="absolute inset-0 bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error fallback */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white text-sm">
          Certificate Image
        </div>
      )}
    </div>
  );
});

// Memoized Certification Card with conditional animations
const CertificationCard = memo(({ cert, useReducedMotion }) => {
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

  return (
    <motion.a
      href={cert.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      variants={certCardVariants}
      initial="hidden"
      animate="visible"
      whileHover={useReducedMotion ? undefined : "hover"}
      whileTap={useReducedMotion ? undefined : { scale: 0.98 }}
      style={{ display: 'block', opacity: 1, visibility: 'visible' }}
    >
      <div 
        className="h-full overflow-hidden rounded-xl bg-neutral-800/80 backdrop-blur-sm border border-neutral-700/50 shadow-xl group-hover:border-purple-500/50 transition-all duration-200"
        style={{ minHeight: '240px', backgroundColor: 'rgba(30, 41, 59, 0.8)' }}
      >
        <div className="relative aspect-video w-full overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
          {/* Simplified overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-200" />
          
          <CertificationImage 
            src={cert.image}
            alt={cert.title}
          />
          
          <div className="absolute bottom-0 left-0 w-full p-3">
            <div className="inline-block px-3 py-1 bg-purple-600/90 backdrop-blur-sm rounded text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              View Certificate
            </div>
          </div>
        </div>
        
        <div className="p-3" style={{ color: 'white' }}>
          <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors duration-200" style={{ color: 'white' }}>
            {cert.title}
          </h3>
          <div className="mt-1.5 flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5"></div>
            <p className="text-neutral-300 text-xs" style={{ color: '#d1d5db' }}>{cert.issuer}</p>
          </div>
          <div className="mt-1.5 text-neutral-400 text-xs" style={{ color: '#9ca3af' }}>
            {cert.date || "Certification verified"}
          </div>
        </div>
      </div>
    </motion.a>
  );
});

const Certifications = () => {
  const [selectedIssuer, setSelectedIssuer] = useState("All");
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  
  // Device capability detection
  const { performanceTier } = useSystemProfile();
  
  // Advanced scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [100, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  
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

  // Define animation variants with conditional complexity
  const pageContainerVariants = useReducedMotion
    ? { visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: { 
          opacity: 1,
          transition: { duration: 0.3, ease: "easeOut" }
        },
      };

  // Title animation with purple shine effect
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
  
  // Container animation props based on device capability
  const containerProps = useReducedMotion
    ? { animate: "visible" }
    : { 
        initial: "hidden",
        whileInView: "visible", 
        viewport: { once: true, margin: "-5%" }
      };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="certifications"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        color: 'white',
        overflow: 'visible'
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <div style={{ opacity: 1, visibility: 'visible' }}>
          {/* Enhanced Title Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip
              icon={<EmojiEvents />}
              label="Professional Certifications"
              sx={{
                mb: 4,
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: '#ec4899',
                fontWeight: 600,
                fontSize: '1rem',
                py: 1,
                px: 2
              }}
            />
            
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 800,
                mb: 4,
                color: 'white',
                lineHeight: 1.1
              }}
            >
              Certifications
            </Typography>

            <div
              style={{
                height: 4,
                width: 120,
                background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                borderRadius: 2,
                margin: '0 auto'
              }}
            />
          </Box>

          {/* Filter Buttons */}
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={2} justifyContent="center">
              {issuers.map((issuer, index) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={issuer}>
                  <FilterButton
                    issuer={issuer}
                    isActive={selectedIssuer === issuer}
                    onClick={() => handleIssuerChange(issuer)}
                    useReducedMotion={useReducedMotion}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Certificates Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)', 
                md: 'repeat(4, 1fr)',
                lg: 'repeat(5, 1fr)'
              },
              gap: 3,
              width: '100%'
            }}
          >
            {filteredCertifications.map((cert, index) => (
              <Box key={`${cert.title}-${index}`}>
                <CertificationCard 
                  cert={cert} 
                  useReducedMotion={useReducedMotion} 
                />
              </Box>
            ))}
          </Box>
        </div>
      </Container>

    </Box>
  );
};

export default memo(Certifications);