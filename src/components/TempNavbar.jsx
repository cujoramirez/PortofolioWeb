import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/GadingLogo.png";
import { FaLinkedin, FaGithub, FaEnvelope, FaFileAlt } from "react-icons/fa";
import resumePDF from "../assets/Gading Aditya Perdana-resume.pdf";

// 1) Variants declared outside
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

const gLogoVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    filter: "drop-shadow(0 0 8px rgba(168,85,247,0.7))",
    transition: { duration: 0.4, ease: "easeInOut" },
  },
};

const socialIconVariants = {
  initial: { y: -20, opacity: 0 },
  animate: (custom) => ({
    y: 0,
    opacity: 1,
    transition: { delay: 0.3 + custom * 0.1, duration: 0.5, ease: "easeOut" },
  }),
  hover: {
    y: -5,
    scale: 1.2,
    color: "#a855f7",
    filter: "drop-shadow(0 0 6px rgba(168,85,247,0.7))",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const iconContainerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const progressVariants = {
  initial: { scaleX: 0, transformOrigin: "left" },
  animate: {
    scaleX: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

// 2) Memoized Logo component
const Logo = memo(({ isHovered }) => {
  return (
    <motion.div
      className="relative flex items-center"
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="hover"
    >
      <motion.div
        variants={gLogoVariants}
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

// 3) Memoized SocialIcon component
const SocialIcon = memo(
  ({ Icon, tooltip, color, link, onClick, download, target, rel, index }) => {
    return (
      <motion.a
        href={link}
        onClick={onClick}
        download={download}
        target={target}
        rel={rel}
        className="relative group"
        variants={socialIconVariants}
        whileHover="hover"
        whileTap="hover"
        custom={index}
        aria-label={tooltip}
      >
        <Icon className="text-2xl text-gray-300 transition-colors" />
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
      </motion.a>
    );
  }
);

function Navbar() {
  const [logoHovered, setLogoHovered] = useState(false);

  // 4) Define scrollToContact BEFORE referencing it in socialIcons
  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection =
      document.getElementById("contact") ||
      document.querySelector(".contact-section") ||
      document.querySelector("section.contact") ||
      document.querySelector("footer");
    if (contactSection) {
      // Calculate navbar height dynamically
      const navElement = document.querySelector("nav");
      const navHeight = navElement ? navElement.offsetHeight : 76;
      const startPosition = window.pageYOffset;
      
      // Extra offset to scroll a little further for the pulse effect
      const extraOffset = 50;
      
      // Compute target position, subtracting navbar height but adding extra offset
      let targetPosition =
        contactSection.getBoundingClientRect().top + window.pageYOffset - navHeight + extraOffset;
      
      // Clamp targetPosition to the maximum scrollable value
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetPosition = Math.min(targetPosition, maxScroll);
      // If we're at the bottom, subtract a few pixels to avoid rubber banding
      if (targetPosition === maxScroll) {
        targetPosition = maxScroll - 2;
      }
  
      const distance = targetPosition - startPosition;
      // Dynamically adjust duration based on distance (min 800ms, max 1500ms)
      const duration = Math.min(1500, Math.max(800, distance * 0.5));
      let startTimestamp = null;
      
      // Use an easeOutQuart easing function for a smoother deceleration
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
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };
  
  

  // 5) Now define socialIcons
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

  return (
    <>
      <motion.nav
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
        className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-6">
          <motion.div
            className="flex items-center"
            onHoverStart={() => setLogoHovered(true)}
            onHoverEnd={() => setLogoHovered(false)}
          >
            <Logo isHovered={logoHovered} />
          </motion.div>
          <motion.div
            className="flex items-center gap-5"
            variants={iconContainerVariants}
            initial="initial"
            animate="animate"
          >
            {socialIcons.map((item, index) => (
              <SocialIcon key={index} {...item} index={index} />
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
    </>
  );
}

export default memo(Navbar);
