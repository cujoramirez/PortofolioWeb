import React, { memo, useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

const Contact = () => {
  // Memoize the current year
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  // Device capability detection
  const { performanceTier } = useSystemProfile();
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  useEffect(() => {
    // Set loaded state after initial render to help with scrolling
    setIsLoaded(true);
    
    // Detect iOS Safari specifically since it needs special handling
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    setIsSafariMobile(isIOS && isSafari);
    
    // Detect device type for email button behavior
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Determine animation settings based on device capabilities
  const useReducedMotion = performanceTier === "low" || isSafariMobile;
  
  // Define animation variants with conditional complexity
  const containerVariants = useReducedMotion
    ? { visible: { opacity: 1 } }
    : {
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
  const itemVariants = useReducedMotion
    ? { visible: { opacity: 1 } }
    : {
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
  const cardVariants = useReducedMotion
    ? { visible: { opacity: 1 } }
    : {
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
  const buttonVariants = useReducedMotion
    ? {}
    : {
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
  const iconVariants = useReducedMotion
    ? { initial: {} }
    : {
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
  
  // Apply optimized animation properties
  const containerProps = useReducedMotion
    ? { animate: "visible" }
    : { 
        initial: "hidden",
        whileInView: "visible", 
        viewport: { once: true, margin: "-5%" }
      };

  return (
    <>
      {/* Ensure content is immediately visible on Safari */}
      {isSafariMobile && !isLoaded && (
        <div id="contact" className="py-20 px-4 min-h-[60vh] flex flex-col justify-center">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-purple-500">
              Let's Connect
            </h2>
          </div>
        </div>
      )}
    
      <motion.div
        id="contact"
        className="py-20 px-4 min-h-[60vh] flex flex-col justify-center transform-gpu"
        variants={containerVariants}
        initial="hidden"
        {...containerProps}
      >
        {/* Animated Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
          whileHover={useReducedMotion ? undefined : "hover"}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-6"
            whileHover={useReducedMotion ? undefined : { scale: 1.05, textShadow: "0px 0px 16px rgba(168,85,247,0.8)" }}
            style={{
              background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: useReducedMotion ? "none" : "gradientShift 4s ease-in-out infinite alternate"
            }}
          >
            Let's Connect
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto"
            variants={itemVariants}
            whileHover={useReducedMotion ? undefined : "hover"}
          >
            I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
          </motion.p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          className="max-w-3xl mx-auto w-full"
          variants={cardVariants}
          whileHover={useReducedMotion ? undefined : "hover"}
        >
          <div 
            className="rounded-xl p-8 md:p-10 shadow-xl"
            style={{
              backgroundColor: "rgba(23, 23, 23, 0.9)",
              ...(useReducedMotion ? {} : {
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(23, 23, 23, 0.7)",
                borderColor: "rgba(38, 38, 38, 0.7)",
                borderWidth: "1px",
                borderStyle: "solid"
              })
            }}
          >
            {/* Contact Methods Container */}
            <div className="contact-section grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Contact Block */}
              <motion.div 
                className="flex flex-col items-center text-center"
                variants={itemVariants}
                whileHover={useReducedMotion ? undefined : "hover"}
              >
                <motion.div 
                  className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"
                  variants={iconVariants}
                  whileHover={useReducedMotion ? undefined : "hover"}
                  initial="initial"
                  style={{
                    backgroundSize: "200% 200%",
                    animation: useReducedMotion ? "none" : "gradientShift 3s ease-in-out infinite alternate"
                  }}
                >
                  <FaEnvelope className="text-3xl text-purple-400" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-medium mb-2"
                  whileHover={useReducedMotion ? undefined : { scale: 1.05, color: "#a855f7" }}
                >
                  Email
                </motion.h3>
                <motion.p 
                  className="text-neutral-400 mb-6"
                  whileHover={useReducedMotion ? undefined : { color: "#cbd5e1", scale: 1.02 }}
                >
                  Feel free to send me a message anytime
                </motion.p>
                <motion.a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=gadingadityaperdana@gmail.com&su=Website%20Inquiry&body=Hi%20Gading,%0A%0AI%20found%20your%20website%20and%20would%20like%20to%20connect%20about:%0A%0A"
                  target="_blank"
                  rel="noopener noreferrer"             
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium text-white flex items-center gap-2 hover:from-purple-700 hover:to-pink-700"
                  variants={buttonVariants}
                  whileHover={useReducedMotion ? undefined : "hover"}
                  whileTap={useReducedMotion ? undefined : "tap"}
                  onClick={(e) => {
                    // Desktop behavior - open Gmail web compose directly
                    if (!isMobile && !isTablet) {
                      // Let the default href handle it (Gmail web compose)
                      return;
                    }
                    
                    // Mobile/Tablet behavior - try to open app
                    e.preventDefault();
                    
                    // Detect OS
                    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
                    const isAndroid = /android/i.test(userAgent);
                    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                    
                    let appOpened = false;
                    
                    if (isAndroid) {
                      // Try to open Gmail app on Android
                      window.location.href = "intent://compose?to=gadingadityaperdana@gmail.com#Intent;scheme=mailto;package=com.google.android.gm;end";
                      appOpened = true;
                    } else if (isIOS) {
                      // Try to open Gmail app on iOS
                      window.location.href = "googlegmail:///co?to=gadingadityaperdana@gmail.com";
                      appOpened = true;
                    }
                    
                    // Fallback to default mail app after a short delay if we attempted to open an app
                    if (appOpened) {
                      setTimeout(() => {
                        window.location.href = "mailto:gadingadityaperdana@gmail.com";
                        
                        // Final fallback to Gmail web as last resort
                        setTimeout(() => {
                          window.open("https://mail.google.com/mail/?view=cm&fs=1&to=gadingadityaperdana@gmail.com", "_blank");
                        }, 500);
                      }, 300);
                    } else {
                      // Direct fallback to Gmail web if we couldn't detect the platform
                      window.open("https://mail.google.com/mail/?view=cm&fs=1&to=gadingadityaperdana@gmail.com", "_blank");
                    }
                  }}
                >
                  <FaEnvelope className="text-sm" />
                  Email Me
                </motion.a>
              </motion.div>

              {/* LinkedIn Contact Block */}
              <motion.div 
                className="flex flex-col items-center text-center"
                variants={itemVariants}
                whileHover={useReducedMotion ? undefined : "hover"}
              >
                <motion.div 
                  className="mb-6 p-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20"
                  variants={iconVariants}
                  whileHover={useReducedMotion ? undefined : "hover"}
                  initial="initial"
                  style={{
                    backgroundSize: "200% 200%",
                    animation: useReducedMotion ? "none" : "gradientShift 3s ease-in-out infinite alternate"
                  }}
                >
                  <FaLinkedin className="text-3xl text-purple-400" />
                </motion.div>
                <motion.h3 
                  className="text-xl font-medium mb-2"
                  whileHover={useReducedMotion ? undefined : { scale: 1.05, color: "#a855f7" }}
                >
                  LinkedIn
                </motion.h3>
                <motion.p 
                  className="text-neutral-400 mb-6"
                  whileHover={useReducedMotion ? undefined : { color: "#cbd5e1", scale: 1.02 }}
                >
                  Let's connect professionally
                </motion.p>
                <motion.a
                  href="https://www.linkedin.com/in/gadingadityaperdana/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium text-white flex items-center gap-2 hover:from-purple-700 hover:to-pink-700"
                  variants={buttonVariants}
                  whileHover={useReducedMotion ? undefined : "hover"}
                  whileTap={useReducedMotion ? undefined : "tap"}
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
          whileHover={useReducedMotion ? undefined : "hover"}
        >
          <p>© {currentYear} Gading Aditya Perdana. All rights reserved.</p>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* Fix iOS Safari rendering issues */
        @supports (-webkit-touch-callout: none) {
          #contact {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
          
          /* Fix for Safari gradient text */
          @media not all and (min-resolution:.001dpcm) { 
            @supports (-webkit-appearance:none) {
              #contact h2 {
                -webkit-text-stroke: 1px transparent;
              }
            }
          }
        }
        
        /* Improve scrolling on iOS */
        body {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </>
  );
};

export default memo(Contact);