import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaGithub, FaEnvelope, FaFileAlt } from "react-icons/fa";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import resumePDF from "../assets/GadingAdityaPerdana-resume.pdf";

// Memoized Logo component with fixed G logo visibility
const Logo = memo(({ isHovered, useReducedMotion }) => {
  // No variants for G logo when using reduced motion to ensure it's always visible
  const gLogoVariants = {
    initial: { opacity: useReducedMotion ? 1 : 0, scale: useReducedMotion ? 1 : 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: useReducedMotion ? 0 : 0.5, ease: "easeOut" },
    },
    hover: useReducedMotion ? {} : {
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
  useReducedMotion
}) => {
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
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Device capability detection using our unified system profile hook
  const { performanceTier } = useSystemProfile();
  
  useEffect(() => {
    // Set loaded state after initial render
    setIsLoaded(true);
    
    // Detect iOS Safari specifically
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    setIsSafariMobile(isIOS && isSafari);
  }, []);
  
  // Determine animation settings based on device capabilities
  const useReducedMotion = performanceTier === "low" || isSafariMobile;

  // Memoize the scroll function using useCallback
  const scrollToContact = useCallback((e) => {
    e.preventDefault();
    const contactSection =
      document.getElementById("contact") ||
      document.querySelector(".contact-section") ||
      document.querySelector("section.contact") ||
      document.querySelector("footer");
      
    if (contactSection) {
      // For low-end devices or Safari mobile, use simpler scrolling
      if (useReducedMotion) {
        contactSection.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      
      // Enhanced scrolling for capable devices
      const navElement = document.querySelector("nav");
      const navHeight = navElement ? navElement.offsetHeight : 76;
      const startPosition = window.pageYOffset;
      const extraOffset = 50;
      let targetPosition =
        contactSection.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight +
        extraOffset;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      targetPosition = Math.min(targetPosition, maxScroll);
      if (targetPosition === maxScroll) {
        targetPosition = maxScroll - 2;
      }
      const distance = targetPosition - startPosition;
      const duration = Math.min(1500, Math.max(800, distance * 0.5));
      let startTimestamp = null;
      const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
      const animateScroll = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easing = easeOutQuart(progress);
        window.scrollTo(0, startPosition + distance * easing);
        if (elapsed < duration) {
          window.requestAnimationFrame(animateScroll);
        } else {
          contactSection.classList.add("highlight-section");
          setTimeout(() => {
            contactSection.classList.remove("highlight-section");
          }, 1000);
        }
      };
      window.requestAnimationFrame(animateScroll);
    } else {
      // Fallback scrolling
      window.scrollTo({ 
        top: document.body.scrollHeight, 
        behavior: useReducedMotion ? "auto" : "smooth" 
      });
    }
  }, [useReducedMotion]);

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

  // Define animation variants with conditional complexity
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
  
  const progressVariants = {
    initial: { scaleX: useReducedMotion ? 1 : 0, transformOrigin: "left" },
    animate: {
      scaleX: 1,
      transition: { duration: useReducedMotion ? 0 : 0.8, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* Ensure content is immediately visible on Safari */}
      {isSafariMobile && !isLoaded && (
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
        className={`fixed top-0 left-0 right-0 z-50 transform-gpu ${
          useReducedMotion 
            ? "bg-neutral-900" 
            : "bg-neutral-900/80 backdrop-blur-md"
        }`}
        style={{
          transform: "translateZ(0)",
          willChange: "transform"
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <motion.div
            className="flex items-center"
            onHoverStart={() => !useReducedMotion && setLogoHovered(true)}
            onHoverEnd={() => !useReducedMotion && setLogoHovered(false)}
          >
            <Logo isHovered={logoHovered} useReducedMotion={useReducedMotion} />
          </motion.div>
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
              />
            ))}
          </motion.div>
        </div>
      </motion.nav>

      <motion.div
        className="fixed top-[76px] left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
        variants={progressVariants}
        initial="initial"
        animate="animate"
      />

      <style jsx global>{`
        /* Ensure Safari correctly renders fixed position elements */
        @supports (-webkit-touch-callout: none) {
          nav {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
            backface-visibility: hidden;
            will-change: transform;
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