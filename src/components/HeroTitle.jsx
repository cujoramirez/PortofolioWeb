import React from "react";
import { motion } from "framer-motion";

const HeroTitle = ({
  contentReady,
  animationsComplete,
  isIOSSafari,
  isMobile,
  currentNameVariants,
  getAnimationProps,
  outlineVariants,
  shouldUseScrollTrigger,
  onPathAnimationUpdate,
  dotVariants,
  dotVisible,
  setDotVisible,
}) => {
  return (
    <div className="relative pb-6 h-24 flex items-center justify-center w-full">
      <svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 600 100"
        style={{
          overflow: "visible",
          transform: "translateZ(0)",
          opacity: contentReady || animationsComplete ? 1 : 0,
          willChange: "opacity",
        }}
        aria-hidden="true"
      >
        <motion.path
          id="heroPath"
          d="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
          fill="none"
          stroke="url(#heroGradient)"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={outlineVariants}
          initial="initial"
          {...(shouldUseScrollTrigger && !isIOSSafari
            ? { whileInView: "animate", viewport: { once: true, amount: 0.3 } }
            : { animate: contentReady ? "animate" : "initial" }
          )}
          onUpdate={onPathAnimationUpdate}
          style={{
            willChange:
              "stroke-dasharray, stroke-dashoffset, stroke-width, stroke-opacity",
            transform: "translateZ(0)",
          }}
        />
        <defs>
          <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        {dotVisible && !isIOSSafari && contentReady && (
          <motion.g
            initial="hidden"
            {...(shouldUseScrollTrigger && !isIOSSafari
              ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
              : { animate: "visible" }
            )}
            variants={dotVariants}
            onAnimationComplete={() => setDotVisible(false)}
            style={{
              willChange: "opacity, transform",
              transform: "translateZ(0)",
            }}
          >
            <circle r={isMobile ? "3.5" : "5"} fill="#ec4899" />
          </motion.g>
        )}
      </svg>
      <motion.h1
        className="text-4xl md:text-5xl xl:text-6xl tracking-tight text-center font-bold relative z-10 no-select"
        {...getAnimationProps(currentNameVariants)}
        whileHover={isIOSSafari ? undefined : "hover"}
        whileTap={isIOSSafari ? undefined : "hover"}
        style={{
          backgroundImage:
            contentReady && !isMobile && !isIOSSafari
              ? "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(236,72,153,0.8) 50%, rgba(255,255,255,1) 100%)"
              : undefined,
          backgroundSize: contentReady && !isMobile && !isIOSSafari ? "200% auto" : undefined,
          WebkitBackgroundClip:
            contentReady && !isMobile && !isIOSSafari ? "text" : "border-box",
          WebkitTextFillColor:
            contentReady && !isMobile && !isIOSSafari ? "transparent" : "white",
          animation:
            contentReady && !isMobile && !isIOSSafari
              ? "nameGradientShift 3s ease-in-out forwards"
              : "none",
          transform: "translateZ(0)",
          willChange:
            "font-weight, letter-spacing, opacity, transform",
          backfaceVisibility: "hidden",
        }}
      >
        Gading Aditya Perdana
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            contentReady
              ? {
                  opacity: isIOSSafari ? 0.2 : [0.1, 0.25, 0.15],
                  scale: isIOSSafari ? 1 : [0.98, 1.02, 1],
                }
              : { opacity: 0 }
          }
          transition={
            isIOSSafari
              ? { duration: 0.5 }
              : { duration: 2.5, times: [0, 0.7, 1], ease: "easeOut" }
          }
          style={{
            willChange: "opacity, transform",
            transform: "translateZ(0)",
          }}
        />
      </motion.h1>
    </div>
  );
};

export default HeroTitle;
