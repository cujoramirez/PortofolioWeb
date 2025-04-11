import React, { useEffect, useState, useRef, memo } from "react";
import { motion, useAnimation } from "framer-motion";
import { ABOUT_TEXT } from "../constants/index";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";

import { containerVariants } from "./aboutAnimations";
import AboutShapes from "./AboutShapes";
import AboutTitleDivider from "./AboutTitleDivider";
import AboutImage from "./AboutImage";
import AboutText from "./AboutText";
import { highlightAboutText } from "./highlightAboutText";
import { useIOSSafariFixes } from "./useIOSSafariFixes";

function About() {
  const [contentReady, setContentReady] = useState(true); // Always start ready
  const [fallbackActive, setFallbackActive] = useState(true); // Always start active
  const contentRef = useRef(null);
  const controls = useAnimation();

  const { performanceTier, deviceType } = useSystemProfile();

  // Device checks
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  const isMobile = deviceType === "mobile" || deviceType === "tablet";

  // Reduced / simple mode
  const reducedMotion = isMobile || isIOSSafari || performanceTier === "low";
  const simpleMode = isIOSSafari || performanceTier === "low";

  // For background shapes
  const numShapes = isMobile ? 2 : isIOSSafari ? 0 : 5;
  const showShapes = performanceTier !== "low" && !isIOSSafari;

  // Animation flags
  const shouldAnimate = !reducedMotion;
  const shouldUseScrollTrigger = !isMobile && !isIOSSafari && performanceTier === "high";

  // iOS Safari fixes
  useIOSSafariFixes(isIOSSafari, setContentReady, setFallbackActive);

  useEffect(() => {
    if (!isIOSSafari) {
      controls.start("animate");
      controls.start("visible");
      
      // Reduce delays to almost instant to avoid scroll trapping
      const timer = setTimeout(() => setContentReady(true), 50);
      const fallbackTimer = setTimeout(() => setFallbackActive(true), 100);

      return () => {
        clearTimeout(timer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [controls, isIOSSafari, isMobile]);

  return (
    <section
      id="about"
      className="about-section relative w-full overflow-visible"
      style={{
        // Remove overscrollBehavior to allow normal scrolling
        overscrollBehavior: "auto",
        overflowX: "visible",
        overflowY: "visible",
        // Always visible to avoid scroll trapping
        visibility: "visible",
        paddingTop: "2rem",
        paddingBottom: "2rem",
      }}
      ref={contentRef}
    >
      {isIOSSafari ? (
        // ----- 1) Static fallback for iOS Safari -----
        <div className="pt-8 pb-12 relative about-content-wrapper">
          <h2 className="my-12 text-center text-5xl font-bold leading-normal">
            <span className="text-white">About</span>
            <span className="bg-gradient-to-r from-pink-500 to-pink-500 bg-clip-text text-transparent">
              {" "}me
            </span>
          </h2>
          <div
            className="h-1 mx-auto mb-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
            style={{ maxWidth: "400px" }}
          />
          <div className="flex flex-wrap">
            {/* Image for iOS fallback: same design as AboutImage but static */}
            <div className="w-full lg:w-1/2 lg:p-8">
              <div className="flex items-center justify-center h-full">
                <div
                  className="relative w-4/5 max-w-md mx-auto rounded-2xl shadow-lg"
                  style={{ aspectRatio: "1/1.2" }}
                >
                  <img
                    src={aboutImg}
                    alt="about"
                    className="rounded-2xl shadow-lg shadow-purple-500/20 w-full h-auto object-cover z-10 relative"
                    loading="eager"
                  />
                  <div
                    className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-purple-500/50 z-0"
                  />
                  <div
                    className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-pink-500/50 z-0"
                  />
                </div>
              </div>
            </div>
            {/* Text content */}
            <div className="w-full lg:w-1/2 p-4 lg:p-8">
              <div className="flex items-center justify-center h-full">
                <p className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg">
                  {highlightAboutText(ABOUT_TEXT, true, isMobile)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ----- 2) Animated version for other browsers -----
        <motion.div
          className="pt-8 pb-12 relative about-content-wrapper motion-safe"
          variants={containerVariants}
          initial="visible" // Start visible instead of hidden
          animate="visible" // Always visible
          style={{ 
            willChange: !isMobile ? "opacity, transform" : "auto",
            visibility: "visible", // Always visible
          }}
        >
          <AboutShapes
            showShapes={showShapes}
            numShapes={numShapes}
            contentReady={true} // Always ready
            isMobile={isMobile}
          />

          <AboutTitleDivider
            contentReady={true} // Always ready
            isMobile={isMobile}
          />

          <div className="flex flex-col lg:flex-row">
            <AboutImage contentReady={true} isMobile={isMobile} />
            <AboutText
              ABOUT_TEXT={ABOUT_TEXT}
              contentReady={true} // Always ready
              fallbackActive={fallbackActive}
              isMobile={isMobile}
              simpleMode={simpleMode}
              isIOSSafari={isIOSSafari}
              shouldAnimate={shouldAnimate}
              shouldUseScrollTrigger={shouldUseScrollTrigger}
            />
          </div>
        </motion.div>
      )}

      {/* Inline styles for global / iOS Safari fixes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        /* Fix for all devices */
        .about-section, .hero-container {
          transform: translateZ(0);
          -webkit-overflow-scrolling: touch;
          overflow-y: visible !important;
          overflow-x: visible !important;
          scroll-behavior: auto;
          overscroll-behavior: auto;
        }
        
        body {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: auto;
        }

        /* iOS specific fixes */
        .ios-safari {
          height: auto !important;
          overflow: auto !important;
        }
        
        .ios-safari body {
          position: static !important;
          height: auto !important;
          overflow: auto !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          touch-action: pan-y !important;
        }
        
        .ios-safari .about-section {
          min-height: auto;
          height: auto !important;
          overflow: visible !important;
          position: relative !important;
          visibility: visible !important;
        }
        
        .ios-safari .about-content-wrapper {
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        /* Remove delay animations */
        @media (max-width: 768px) {
          .about-section *, .hero-container * {
            transition-delay: 0ms !important;
            animation-delay: 0ms !important;
          }
        }
      `}</style>
    </section>
  );
}

export default memo(About);