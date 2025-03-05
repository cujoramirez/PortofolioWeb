import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Container variant: elegant fade in and slide up
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: "easeOut",
      staggerChildren: 0.2,
      when: "beforeChildren"
    } 
  },
};

// Common variant for text items with hover effect
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

// Contact card variant for modern hover effect
const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 10px 30px -15px rgba(168,85,247,0.4)",
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

// Button variant for animated interaction
const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(168,85,247,0.4)",
    transition: { duration: 0.3, type: "spring", stiffness: 400 }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 2px 5px rgba(168,85,247,0.4)",
    transition: { duration: 0.1 }
  }
};

// Icon variant for shine effect
const iconVariants = {
  initial: { 
    filter: "drop-shadow(0px 0px 0px rgba(168,85,247,0.0))" 
  },
  hover: {
    scale: 1.1,
    filter: "drop-shadow(0px 0px 8px rgba(168,85,247,0.8))",
    transition: { 
      duration: 0.4, 
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" 
    }
  }
};

const Contact = () => {
  // Memoize the current year
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  // Use our unified system profile hook for performance detection.
  const { performanceTier } = useSystemProfile();
  const isLow = performanceTier === "low";
  
  // On high‑end devices, use scroll triggers; on low‑end, animate immediately.
  const containerProps = isLow 
    ? { animate: "visible" } 
    : { whileInView: "visible", viewport: { once: true, amount: 0.3 } };

  return (
    <motion.div
      id="contact"
      className="py-20 px-4 min-h-[60vh] flex flex-col justify-center"
      variants={containerVariants}
      initial="hidden"
      {...containerProps}
    >
      {/* Animated Section Header */}
      <motion.div 
        className="text-center mb-16"
        variants={itemVariants}
        whileHover="hover"
        whileTap="hover"
      >
        <motion.h2
          className="text-4xl md:text-5xl font-bold mb-6"
          whileHover={{ scale: 1.05, textShadow: "0px 0px 16px rgba(168,85,247,0.8)" }}
          whileTap={{ scale: 1.05, textShadow: "0px 0px 16px rgba(168,85,247,0.8)" }}
          style={{
            background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 4s ease-in-out infinite alternate"
          }}
        >
          Let's Connect
        </motion.h2>
        <motion.p 
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto"
          variants={itemVariants}
          whileHover="hover"
          whileTap="hover"
        >
          I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
        </motion.p>
      </motion.div>

      {/* Contact Card */}
      <motion.div
        className="max-w-3xl mx-auto w-full"
        variants={cardVariants}
        whileHover="hover"
        whileTap="hover"
      >
        <div className="bg-neutral-900/70 backdrop-blur-sm border border-neutral-800 rounded-xl p-8 md:p-10 shadow-xl">
          {/* Contact Methods Container */}
          <div className="contact-section grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Contact Block */}
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover="hover"
              whileTap="hover"
            >
              <motion.div 
                className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"
                variants={iconVariants}
                whileHover="hover"
                whileTap="hover"
                initial="initial"
                style={{
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 3s ease-in-out infinite alternate"
                }}
              >
                <FaEnvelope className="text-3xl text-purple-400" />
              </motion.div>
              <motion.h3 
                className="text-xl font-medium mb-2"
                whileHover={{ scale: 1.05, color: "#a855f7" }}
                whileTap={{ scale: 1.05, color: "#a855f7" }}
              >
                Email
              </motion.h3>
              <motion.p 
                className="text-neutral-400 mb-6"
                whileHover={{ color: "#cbd5e1", scale: 1.02 }}
                whileTap={{ color: "#cbd5e1", scale: 1.02 }}
              >
                Feel free to send me a message anytime
              </motion.p>
              <motion.a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=gadingadityaperdana@gmail.com"
                target="_blank"
                rel="noopener noreferrer"             
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium text-white flex items-center gap-2 hover:from-purple-700 hover:to-pink-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaEnvelope className="text-sm" />
                Email Me
              </motion.a>
            </motion.div>

            {/* LinkedIn Contact Block */}
            <motion.div 
              className="flex flex-col items-center text-center"
              variants={itemVariants}
              whileHover="hover"
              whileTap="hover"
            >
              <motion.div 
                className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"
                variants={iconVariants}
                whileHover="hover"
                whileTap="hover"
                initial="initial"
                style={{
                  backgroundSize: "200% 200%",
                  animation: "gradientShift 3s ease-in-out infinite alternate"
                }}
              >
                <FaLinkedin className="text-3xl text-purple-400" />
              </motion.div>
              <motion.h3 
                className="text-xl font-medium mb-2"
                whileHover={{ scale: 1.05, color: "#a855f7" }}
                whileTap={{ scale: 1.05, color: "#a855f7" }}
              >
                LinkedIn
              </motion.h3>
              <motion.p 
                className="text-neutral-400 mb-6"
                whileHover={{ color: "#cbd5e1", scale: 1.02 }}
                whileTap={{ color: "#cbd5e1", scale: 1.02 }}
              >
                Let's connect professionally
              </motion.p>
              <motion.a
                href="https://www.linkedin.com/in/gadingadityaperdana/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium text-white flex items-center gap-2 hover:from-purple-700 hover:to-pink-700"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaLinkedin className="text-sm" />
                Connect
              </motion.a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        className="text-center mt-16 text-neutral-500 text-sm"
        variants={itemVariants}
        whileHover="hover"
        whileTap="hover"
      >
        <p>© {currentYear} Gading Aditya Perdana. All rights reserved.</p>
      </motion.div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </motion.div>
  );
};

export default memo(Contact);
