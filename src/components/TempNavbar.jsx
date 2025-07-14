import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaGithub, FaEnvelope, FaFileAlt } from "react-icons/fa";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import resumePDF from "../assets/Gading_Resume.pdf";

// Memoized Logo component with fixed G logo visibility
const Logo = memo(({ isHovered, useReducedMotion, isIOSTouchDevice }) => {
  // No variants for G logo when using reduced motion to ensure it's always visible
  const gLogoVariants = {
    initial: { opacity: useReducedMotion ? 1 : 0, scale: useReducedMotion ? 1 : 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: useReducedMotion ? 0 : 0.5, ease: "easeOut" },
    },
    hover: (useReducedMotion || isIOSTouchDevice) ? {} : {
      scale: 1.05,
      filter: "drop-shadow(0 0 8px rgba(168,85,247,0.7))",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const logoTextVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };

  // For iOS Safari, just render the logo without motion effects
  if (isIOSTouchDevice) {
    return (
      <div className="relative flex items-center">
        <div className="w-12 h-12 flex items-center justify-center">
          <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            G
          </span>
        </div>
        {isHovered && (
          <span className="ml-3 text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-sans tracking-wide">
            Gading Aditya Perdana
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="relative flex items-center"
      whileHover={useReducedMotion ? undefined : "hover"}
    >
      <motion.div
        variants={gLogoVariants}
        initial="initial"
        animate="animate"
        whileHover={useReducedMotion ? undefined : "hover"}
        className="w-12 h-12 flex items-center justify-center"
      >
        <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent filter drop-shadow-md">
          G
        </span>
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="ml-3 text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-sans tracking-wide"
            variants={logoTextVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ textShadow: "0 2px 10px rgba(168,85,247,0.3)" }}
          >
            Gading Aditya Perdana
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Memoized SocialIcon component with fixed visibility
const SocialIcon = memo(({
  Icon,
  tooltip,
  color,
  link,
  onClick,
  download,
  target,
  rel,
  index,
  useReducedMotion,
  isIOSTouchDevice
}) => {
  // For iOS Safari, use static elements without animations
  if (isIOSTouchDevice) {
    return (
      <a
        href={link}
        onClick={onClick}
        download={download}
        target={target}
        rel={rel}
        className="relative"
        aria-label={tooltip}
      >
        <Icon className="text-2xl text-gray-300" />
      </a>
    );
  }

  const socialIconVariants = {
    initial: { y: useReducedMotion ? 0 : -20, opacity: useReducedMotion ? 1 : 0 },
    animate: (custom) => ({
      y: 0,
      opacity: 1,
      transition: { 
        delay: useReducedMotion ? 0 : 0.3 + custom * 0.1, 
        duration: useReducedMotion ? 0 : 0.5, 
        ease: "easeOut" 
      },
    }),
    hover: useReducedMotion ? {} : {
      y: -5,
      scale: 1.2,
      color: "#a855f7",
      filter: "drop-shadow(0 0 6px rgba(168,85,247,0.7))",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.a
      href={link}
      onClick={onClick}
      download={download}
      target={target}
      rel={rel}
      className="relative group"
      variants={socialIconVariants}
      initial="initial"
      animate="animate"
      whileHover={useReducedMotion ? undefined : "hover"}
      whileTap={useReducedMotion ? undefined : "hover"}
      custom={index}
      aria-label={tooltip}
    >
      <Icon className="text-2xl text-gray-300 transition-colors" />
      {!useReducedMotion && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-neutral-800 text-xs font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none"
          initial={{ y: 5 }}
          animate={{
            y: 0,
            transition: { type: "spring", stiffness: 300 },
          }}
          style={{ boxShadow: `0 2px 8px rgba(0,0,0,0.3)` }}
        >
          {tooltip}
        </motion.div>
      )}
    </motion.a>
  );
});

function Navbar() {
  const [logoHovered, setLogoHovered] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);
  const [isIOSTouchDevice, setIsIOSTouchDevice] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Device capability detection using our unified system profile hook
  const { performanceTier, deviceType } = useSystemProfile();
  
  // Track if we're on a mobile or tablet device
  const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';
  
  // More comprehensive device detection
  useEffect(() => {
    setIsLoaded(true);
    
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const safari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    setIsIOS(iOS);
    setIsSafari(safari);
    setIsIOSSafari(iOS && safari);
    // Consider any iOS device a touch device, or any touch-enabled Safari
    setIsIOSTouchDevice(iOS || (isTouch && safari));
    
    // Add a class to the document body for iOS Safari
    if (iOS && safari) {
      document.body.classList.add('ios-safari');
    }
    
    return () => {
      document.body.classList.remove('ios-safari');
    };
  }, []);
  
  // Determine animation settings based on device capabilities
  const useReducedMotion = performanceTier === "low" || isIOSSafari || isIOSTouchDevice;

  // Simplified scroll function that uses native scrolling for iOS
  const scrollToContact = useCallback((e) => {
    e.preventDefault();
    const contactSection =
      document.getElementById("contact") ||
      document.querySelector(".contact-section") ||
      document.querySelector("section.contact") ||
      document.querySelector("footer");
      
    if (contactSection) {
      // Always use native scrolling on iOS devices or touch Safari
      if (isIOSTouchDevice || useReducedMotion) {
        // Use immediate scrolling without smooth behavior for iOS Safari
        contactSection.scrollIntoView({ 
          behavior: isIOSSafari ? "auto" : "smooth", 
          block: "start" 
        });
        return;
      }
      
      // Enhanced scrolling for capable devices only
      const navElement = document.querySelector("nav");
      const navHeight = navElement ? navElement.offsetHeight : 76;
      const targetPosition =
        contactSection.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight +
        50;
        
      // Use browser's smooth scrolling for modern browsers
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      
      // Add highlight after scrolling
      setTimeout(() => {
        contactSection.classList.add("highlight-section");
        setTimeout(() => {
          contactSection.classList.remove("highlight-section");
        }, 1000);
      }, 1000);
    } else {
      // Fallback scrolling
      window.scrollTo({ 
        top: document.body.scrollHeight, 
        behavior: useReducedMotion ? "auto" : "smooth" 
      });
    }
  }, [useReducedMotion, isIOSTouchDevice, isIOSSafari]);

  const socialIcons = [
    {
      Icon: FaLinkedin,
      tooltip: "LinkedIn",
      color: "#0077b5",
      link: "https://www.linkedin.com/in/gadingadityaperdana/",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      Icon: FaGithub,
      tooltip: "GitHub",
      color: "#6e5494",
      link: "https://github.com/cujoramirez",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    {
      Icon: FaEnvelope,
      tooltip: "Contact",
      color: "#ff5252",
      link: "#contact",
      onClick: scrollToContact,
    },
    {
      Icon: FaFileAlt,
      tooltip: "Resume",
      color: "#4caf50",
      link: resumePDF,
      download: "Gading Aditya Perdana-resume.pdf",
    },
  ];

  // Simplified variants for iOS
  const navContainerVariants = {
    initial: { opacity: useReducedMotion ? 1 : 0 },
    animate: {
      opacity: 1,
      transition: { duration: useReducedMotion ? 0 : 0.5, ease: "easeOut" },
    },
  };
  
  const iconContainerVariants = {
    initial: { opacity: useReducedMotion ? 1 : 0 },
    animate: {
      opacity: 1,
      transition: useReducedMotion 
        ? { duration: 0 }
        : { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };
  
  // Simplified progress variants for iOS
  const progressVariants = {
    initial: { 
      scaleX: useReducedMotion ? 1 : 0, 
      transformOrigin: "left",
      opacity: useReducedMotion ? 1 : isMobileOrTablet ? 0.6 : 0
    },
    animate: {
      scaleX: 1,
      opacity: 1,
      transition: { 
        duration: useReducedMotion ? 0 : isMobileOrTablet ? 0.5 : 0.8, 
        ease: isMobileOrTablet ? "easeInOut" : "easeOut",
      },
    },
  };

  // For iOS Safari, render a simplified navbar without motion effects
  if (isIOSSafari) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center">
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                G
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {socialIcons.map((item, index) => (
              <SocialIcon
                key={index}
                {...item}
                index={index}
                useReducedMotion={true}
                isIOSTouchDevice={true}
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
      </nav>
    );
  }

  return (
    <>
      {/* Ensure content is immediately visible while loading */}
      {!isLoaded && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900">
          <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
            <div className="flex items-center">
              <div className="w-12 h-12 flex items-center justify-center">
                <span className="text-3xl font-bold text-purple-500">
                  G
                </span>
              </div>
            </div>
          </div>
        </nav>
      )}
    
      <motion.nav
        initial="initial"
        animate="animate"
        variants={navContainerVariants}
        className={`fixed top-0 left-0 right-0 z-50 ${
          useReducedMotion || isIOSTouchDevice
            ? "bg-neutral-900" 
            : "bg-neutral-900/80 backdrop-blur-md transform-gpu"
        }`}
        style={
          isIOSTouchDevice
            ? { position: 'fixed' } // Simplified styles for iOS touch devices
            : {
                transform: "translateZ(0)",
                willChange: "transform"
              }
        }
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <div
            className="flex items-center"
            onMouseEnter={() => !isIOSTouchDevice && !useReducedMotion && setLogoHovered(true)}
            onMouseLeave={() => !isIOSTouchDevice && !useReducedMotion && setLogoHovered(false)}
            onTouchStart={() => isIOSTouchDevice && setLogoHovered(true)}
          >
            <Logo 
              isHovered={logoHovered} 
              useReducedMotion={useReducedMotion}
              isIOSTouchDevice={isIOSTouchDevice} 
            />
          </div>
          
          {/* Social icons with conditional motion wrapping */}
          {isIOSTouchDevice ? (
            <div className="flex items-center gap-5">
              {socialIcons.map((item, index) => (
                <SocialIcon
                  key={index}
                  {...item}
                  index={index}
                  useReducedMotion={true}
                  isIOSTouchDevice={true}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="flex items-center gap-5"
              variants={iconContainerVariants}
              initial="initial"
              animate="animate"
            >
              {socialIcons.map((item, index) => (
                <SocialIcon
                  key={index}
                  {...item}
                  index={index}
                  useReducedMotion={useReducedMotion}
                  isIOSTouchDevice={isIOSTouchDevice}
                />
              ))}
            </motion.div>
          )}
        </div>
        
        {/* Progress bar - static for iOS touch devices */}
        {isIOSTouchDevice ? (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
        ) : (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
            variants={progressVariants}
            initial="initial"
            animate="animate"
            style={
              useReducedMotion 
                ? {} 
                : {
                    translateZ: 0,
                    backfaceVisibility: "hidden",
                    willChange: "transform, opacity"
                  }
            }
          />
        )}
      </motion.nav>

      <style>{`
        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
          html, body {
            height: 100%;
            -webkit-overflow-scrolling: touch;
            overflow-y: auto !important;
            touch-action: manipulation;
            overscroll-behavior-y: auto;
          }
          
          /* Ensure nav doesn't create scrolling issues */
          nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 50;
            transform: none !important;
            -webkit-transform: none !important;
            will-change: auto !important;
            background-color: #171717; /* neutral-900 */
          }
          
          /* Remove performance-impacting styles on iOS */
          .ios-safari * {
            transform: none !important;
            transition: none !important;
            animation: none !important;
            will-change: auto !important;
            backdrop-filter: none !important;
          }
          
          /* Fix Safari gradient text */
          @media not all and (min-resolution:.001dpcm) { 
            @supports (-webkit-appearance:none) {
              .bg-gradient-to-r {
                -webkit-text-stroke: 1px transparent;
              }
            }
          }
        }
      `}</style>
    </>
  );
}

export default memo(Navbar);
