import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HERO_CONTENT } from "../constants/index";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import { tokenizeParagraph } from "./tokenization";
import {
  nameVariants,
  nameVariantsMobile,
  outlineVariantsHigh,
  outlineVariantsMid,
  outlineVariantsLow,
  outlineVariantsIOS,
  dotVariantsHigh,
  dotVariantsMid,
  dotVariantsLow,
  dotVariantsIOS,
  titleLineVariants,
  getEnhancedWordVariants,
  profilePicVariants,
} from "./heroAnimations";
import { useIOSSafariFixes } from "./useIOSSafariFixes";
import HeroTitle from "./HeroTitle";
import HeroBio from "./HeroBio";
import HeroProfileImage from "./HeroProfileImage";

const Hero = () => {
  const [contentReady, setContentReady] = useState(true); // Start with content ready
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [dotVisible, setDotVisible] = useState(true);
  const isMountedRef = useRef(false);

  const { performanceTier, deviceType } = useSystemProfile();
  const isMobile = deviceType === "mobile" || deviceType === "tablet";

  // Detect iOS Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;

  // Decide which fancy effects to show
  const showAmbient = performanceTier !== "low" && !isMobile && !isIOSSafari;
  const showParticles = performanceTier === "high" && !isMobile && !isIOSSafari;

  // Decide if we should animate on scroll (desktop only)
  const shouldUseScrollTrigger = useMemo(
    () => performanceTier !== "low" && !isIOSSafari && !isMobile,
    [performanceTier, isIOSSafari, isMobile]
  );

  // iOS Safari fixes
  useIOSSafariFixes(isIOSSafari);

  // Tokenize hero text
  const tokens = useMemo(() => tokenizeParagraph(HERO_CONTENT), []);
  const shouldAnimateTokens =
    deviceType === "desktop" && performanceTier !== "low" && !isIOSSafari;

  // Delays for word animations
  const delayMultiplier = useMemo(() => {
    // No delays for iOS Safari to prevent scroll issues
    if (isIOSSafari) return 0;
    if (!shouldAnimateTokens) return 0;
    return isMobile ? 0 : 0.015; // No delay for mobile
  }, [shouldAnimateTokens, isIOSSafari, isMobile]);

  const enhancedWordVariants = useMemo(
    () => getEnhancedWordVariants(delayMultiplier, isMobile || isIOSSafari),
    [delayMultiplier, isMobile, isIOSSafari]
  );

  // Outline & dot variants
  const outlineVariants = useMemo(() => {
    if (isIOSSafari) return outlineVariantsIOS;
    if (performanceTier === "high") return outlineVariantsHigh;
    if (performanceTier === "mid") return outlineVariantsMid;
    return outlineVariantsLow;
  }, [performanceTier, isIOSSafari]);

  const currentNameVariants = useMemo(() => {
    return isMobile || isIOSSafari ? nameVariantsMobile : nameVariants;
  }, [isMobile, isIOSSafari]);

  const dotVariants = useMemo(() => {
    if (isIOSSafari) return dotVariantsIOS;
    if (performanceTier === "high") return dotVariantsHigh;
    if (performanceTier === "mid") return dotVariantsMid;
    return dotVariantsLow;
  }, [performanceTier, isIOSSafari]);

  // Set content ready immediately for iOS Safari
  useEffect(() => {
    isMountedRef.current = true;
    // Always set content ready immediately for iOS
    setContentReady(true);
    
    if (!isIOSSafari && !isMobile) {
      const animationTimer = setTimeout(() => {
        if (isMountedRef.current) setAnimationsComplete(true);
      }, 1500);
      return () => {
        clearTimeout(animationTimer);
        isMountedRef.current = false;
      };
    } else {
      // Mark animations complete immediately for iOS & mobile
      setAnimationsComplete(true);
    }
  }, [isIOSSafari, isMobile]);

  // Helper to unify initial/animate states
  const getAnimationProps = (variants, customDelay = 0) => {
    // No delay for iOS Safari
    if (isIOSSafari) {
      return {
        initial: "visible", // Start visible for iOS
        animate: "visible",
        variants,
        transition: { duration: 0, delay: 0 }, // No duration/delay for iOS
      };
    }
    
    // Reduced delays for mobile
    const finalDelay = isMobile ? 0 : customDelay;
    
    return {
      variants,
      initial: "hidden",
      ...(shouldUseScrollTrigger
        ? {
            whileInView: contentReady ? "visible" : "hidden",
            viewport: { once: true, amount: 0.2 },
          }
        : { animate: contentReady ? "visible" : "hidden" }),
      transition: { duration: isMobile ? 0.2 : 0.5, delay: finalDelay },
    };
  };

  return (
    <section
      id="hero"
      className={`hero-container ios-fix relative w-full ${isIOSSafari ? "ios-safari-container" : ""}`}
      style={{
        paddingTop: "6rem",
        scrollMarginTop: "6rem",
        // Remove any height constraints for iOS Safari
        height: isIOSSafari ? "auto" : "auto",
        minHeight: isIOSSafari ? "auto" : "100vh",
        // Ensure overflow is visible
        overflow: "visible",
        // iOS Safari specific styles
        ...(isIOSSafari && {
          position: "static",
          WebkitOverflowScrolling: "touch",
          touchAction: "auto",
        }),
      }}
    >
      <div
        className={`
          relative w-full
          flex flex-col
          lg:flex-row-reverse
          items-center
          justify-center
          py-8 lg:py-20
        `}
        // Switch to a plain div for iOS Safari
        {...(!isIOSSafari ? {
          component: motion.div,
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5 }
        } : {})}
        style={{
          backgroundColor: "#0f0528",
          // Critical iOS Safari fixes
          height: isIOSSafari ? "auto" : "auto",
          minHeight: isIOSSafari ? "auto" : "calc(100vh - 6rem)",
          // Ensure overflow is visible
          overflow: "visible",
          overflowX: "visible",
          overflowY: "visible",
          WebkitOverflowScrolling: "touch",
          padding: isMobile ? "3rem 1rem" : "4rem 1rem",
          // Position static for iOS Safari
          position: isIOSSafari ? "static" : "relative",
          // Always visible
          visibility: "visible",
          // iOS Safari specific styles
          ...(isIOSSafari && {
            touchAction: "pan-y",
            transform: "translateZ(0)",
          }),
        }}
      >
        {/* Global/CSS styles with iOS Safari fixes */}
        <style>{`
          :root {
            --vh: 1vh;
            --animation-progress: 0;
            --dot-opacity: 0;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            scroll-behavior: smooth;
            background: #0f0528;
            -webkit-overflow-scrolling: touch;
            /* Allow scrolling */
            overscroll-behavior-y: auto;
          }
          
          body {
            height: auto;
            min-height: 100%;
            position: relative;
            overflow-y: auto !important;
          }
          
          /* iOS Safari specific fixes */
          @supports (-webkit-touch-callout: none) {
            html, body {
              height: 100%;
              overflow-y: auto !important;
              position: static !important;
              overscroll-behavior-y: auto;
              -webkit-overflow-scrolling: touch;
            }
            
            /* Make sure elements don't trap scroll */
            .hero-container, .ios-fix {
              min-height: auto !important;
              height: auto !important;
              overflow: visible !important;
              overflow-y: visible !important;
              -webkit-overflow-scrolling: touch;
              touch-action: pan-y !important;
              position: relative !important;
            }
            
            /* Fix content visibility */
            .ios-safari-container * {
              opacity: 1 !important;
              visibility: visible !important;
              animation: none !important;
              transition: none !important;
              animation-delay: 0s !important;
              transition-delay: 0s !important;
            }
            
            /* Disable all viewport-breaking elements */
            .ios-safari-container {
              position: static !important;
              transform: none !important;
              height: auto !important;
              min-height: auto !important;
            }
            
            /* Fix for fixed position elements */
            .ios-safari body {
              position: static !important;
              height: auto !important;
            }
          }
          
          /* Make sure sections are visible and scrollable */
          section.hero-container {
            overflow: visible !important;
            height: auto !important;
            scroll-snap-align: none;
            scroll-snap-stop: normal;
            overscroll-behavior: auto;
          }
          
          /* Fixed scrollbar */
          ::-webkit-scrollbar {
            width: 0;
            background: transparent;
          }
          
          /* Animation styles */
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          
          @keyframes lightGradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
          
          @keyframes nameGradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          
          /* Disable animations completely for mobile/iOS */
          @media (max-width: 1024px), (-webkit-touch-callout: none) {
            * {
              transition-delay: 0ms !important;
              animation-delay: 0ms !important;
              transition-duration: 0ms !important;
              animation-duration: 0ms !important;
            }
            
            .hero-container * {
              animation: none !important;
              transition: none !important;
            }
            
            .bio-container, .title-container {
              opacity: 1 !important;
              visibility: visible !important;
            }
          }
        `}</style>

        {/* RIGHT column on desktop (because flex-row-reverse) */}
        <div className="lg:w-1/2 flex justify-center items-center mb-6 lg:mb-0">
          <HeroProfileImage
            contentReady={true} // Always ready for iOS
            isIOSSafari={isIOSSafari}
            isMobile={isMobile}
            showParticles={isIOSSafari ? false : showParticles}
            showAmbient={isIOSSafari ? false : showAmbient}
            getAnimationProps={getAnimationProps}
            profilePicVariants={profilePicVariants}
          />
        </div>

        {/* LEFT column on desktop */}
        <div className="lg:w-1/2 flex flex-col items-center px-2 md:px-6">
          <HeroTitle
            contentReady={true} // Always ready for iOS
            animationsComplete={true} // Always complete for iOS
            isIOSSafari={isIOSSafari}
            isMobile={isMobile}
            currentNameVariants={currentNameVariants}
            getAnimationProps={getAnimationProps}
            outlineVariants={outlineVariants}
            shouldUseScrollTrigger={shouldUseScrollTrigger && !isIOSSafari}
            onPathAnimationUpdate={(progress) => {
              setAnimationProgress(progress);
              document.documentElement.style.setProperty(
                "--animation-progress",
                progress
              );
            }}
            dotVariants={dotVariants}
            dotVisible={dotVisible}
            setDotVisible={setDotVisible}
          />

          <HeroBio
            tokens={tokens}
            contentReady={true} // Always ready for iOS
            animationsComplete={true} // Always complete for iOS
            isMobile={isMobile}
            isIOSSafari={isIOSSafari}
            getAnimationProps={getAnimationProps}
            titleLineVariants={titleLineVariants}
            enhancedWordVariants={enhancedWordVariants}
            shouldAnimateTokens={shouldAnimateTokens && !isIOSSafari}
            shouldUseScrollTrigger={shouldUseScrollTrigger && !isIOSSafari}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;