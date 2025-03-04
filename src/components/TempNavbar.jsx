import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/GadingLogo.png";
import { FaLinkedin, FaGithub, FaEnvelope, FaFileAlt } from "react-icons/fa";
import resumePDF from "../assets/Gading Aditya Perdana-resume.pdf";

const Navbar = () => {
  const [logoHovered, setLogoHovered] = useState(false);

  // Enhanced logo animation variants with glow effect
  const logoVariants = {
    initial: { rotate: -10, scale: 0.8, opacity: 0 },
    animate: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    hover: {
      rotate: [0, -5, 5, -3, 0],
      scale: 1.1,
      filter: "drop-shadow(0 0 12px rgba(168,85,247,0.8))",
      transition: {
        duration: 0.7,
        ease: "easeInOut",
      },
    },
  };

  // Improved G Logo text style with gradient and subtle animation
  const gLogoVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      filter: "drop-shadow(0 0 8px rgba(168,85,247,0.7))",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  // Logo text variants for name that appears on hover
  const logoTextVariants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  // Social icon animation variants
  const socialIconVariants = {
    initial: { y: -20, opacity: 0 },
    animate: (custom) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.3 + custom * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -5,
      scale: 1.2,
      color: "#a855f7", // Matching purple from your other components
      filter: "drop-shadow(0 0 6px rgba(168,85,247,0.7))",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Social icon container
  const iconContainerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  // Navbar background animation
  const navBgVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Progress indicator that appears when scrolling
  const progressVariants = {
    initial: { scaleX: 0, transformOrigin: "left" },
    animate: {
      scaleX: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Handle scroll to contact section with enhanced smooth scrolling
  const scrollToContact = (e) => {
    e.preventDefault();
    
    // Find contact section with multiple fallback options
    const contactSection = 
      document.getElementById('contact') || 
      document.querySelector('.contact-section') || 
      document.querySelector('section.contact') ||
      document.querySelector('footer'); // Often contact is in footer
    
    if (contactSection) {
      // Use a smooth scrolling technique with easing
      const startPosition = window.pageYOffset;
      const targetPosition = contactSection.getBoundingClientRect().top + window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // ms - slightly longer for smoother feel
      let startTimestamp = null;
      
      // Easing function for natural motion
      const easeInOutCubic = t => t < 0.5 
        ? 4 * t * t * t 
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      
      // Animation function
      const animateScroll = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        const easing = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * easing);
        
        if (elapsed < duration) {
          window.requestAnimationFrame(animateScroll);
        } else {
          // Optional: Add a subtle highlight effect to draw attention
          contactSection.classList.add('highlight-section');
          setTimeout(() => {
            contactSection.classList.remove('highlight-section');
          }, 1000);
        }
      };
      
      window.requestAnimationFrame(animateScroll);
    } else {
      // Fallback to standard scrolling if section not found
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Social icons with tooltips
  const socialIcons = [
    { Icon: FaLinkedin, tooltip: "LinkedIn", color: "#0077b5", link: "https://www.linkedin.com/in/gadingadityaperdana/", target: "_blank", rel: "noopener noreferrer" },
    { Icon: FaGithub, tooltip: "GitHub", color: "#6e5494", link: "https://github.com/cujoramirez", target: "_blank", rel: "noopener noreferrer" },
    { Icon: FaEnvelope, tooltip: "Contact", color: "#ff5252", link: "#contact", onClick: scrollToContact },
    { Icon: FaFileAlt, tooltip: "Resume", color: "#4caf50", link: resumePDF, download: "Gading Aditya Perdana-resume.pdf" },
  ];

  return (
    <>
      {/* Main navbar */}
      <motion.nav
        initial="initial"
        animate="animate"
        variants={navBgVariants}
        className="
          fixed top-0 left-0 right-0 z-50
          bg-neutral-900/80 backdrop-blur-md
        "
      >
        {/* Centered container for logo & icons */}
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          {/* Logo and name section */}
          <motion.div
            className="flex items-center"
            onHoverStart={() => setLogoHovered(true)}
            onHoverEnd={() => setLogoHovered(false)}
          >
            <motion.div
              className="relative flex items-center"
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              {/* Choose between the stylized G or the image logo */}
              {/* Option 1: Stylized G with gradient */}
              <motion.div
                variants={gLogoVariants}
                className="w-12 h-12 flex items-center justify-center"
              >
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent filter drop-shadow-md">
                  G
                </span>
              </motion.div>

              {/* Option 2: Original image logo - comment out the above and uncomment this if you prefer 
              <motion.img
                variants={logoVariants}
                className="w-12 h-12 object-contain"
                src={logo}
                alt="Gading Aditya Perdana logo"
              />
              */}

              {/* Enhanced glow effect behind logo */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-md z-[-1]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: logoHovered ? 0.9 : 0,
                  scale: logoHovered ? 1.5 : 0.8,
                  transition: { duration: 0.5 },
                }}
              />

              {/* Name that appears on hover with improved styling */}
              <AnimatePresence>
                {logoHovered && (
                  <motion.span
                    className="ml-3 text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-sans tracking-wide"
                    variants={logoTextVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ 
                      textShadow: "0 2px 10px rgba(168,85,247,0.3)" 
                    }}
                  >
                    Gading Aditya Perdana
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Social icons with tooltips */}
          <motion.div
            className="flex items-center gap-5"
            variants={iconContainerVariants}
            initial="initial"
            animate="animate"
          >
            {socialIcons.map(({ Icon, tooltip, color, link, onClick, download, target, rel }, index) => (
              <motion.a
                key={index}
                href={link}
                onClick={onClick}
                download={download}
                target={target}
                rel={rel}
                className="relative group"
                variants={socialIconVariants}
                whileHover="hover"
                custom={index}
                aria-label={tooltip}
              >
                <Icon className="text-2xl text-gray-300 transition-colors" />

                {/* Tooltip that appears on hover */}
                <motion.div
                  className="
                    absolute top-full left-1/2 transform -translate-x-1/2
                    mt-1 px-2 py-1 bg-neutral-800 text-xs font-medium rounded
                    opacity-0 group-hover:opacity-100 pointer-events-none
                  "
                  initial={{ y: 5 }}
                  animate={{
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                    },
                  }}
                  style={{
                    boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
                  }}
                >
                  {tooltip}
                </motion.div>
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.nav>

      {/* Scroll progress indicator */}
      <motion.div
        className="fixed top-[76px] left-0 right-0 z-50 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"
        variants={progressVariants}
        initial="initial"
        animate="animate"
      />
    </>
  );
};

export default Navbar;