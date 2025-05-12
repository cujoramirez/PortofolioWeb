// HeroProfileImage.jsx
import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import profilePic from "../assets/GadingAdityaPerdana.jpg";

// Lazy-load heavy effects
const AmbientBackground = lazy(() => import("./AmbientBackground"));
const ParticleEffect = lazy(() => import("./ParticleEffect"));

const HeroProfileImage = ({
  contentReady,
  isIOSSafari,
  isMobile,
  showParticles,
  showAmbient,
  getAnimationProps,
  profilePicVariants,
}) => {
  const shouldEnableHover = !isIOSSafari && !isMobile;

  return (
    <div className="w-full max-w-xs md:max-w-sm lg:max-w-md flex justify-center items-center mb-4">
      {/* Profile Image */}
      <div
        className="relative w-full"
        style={{
          aspectRatio: "1/1",
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <motion.img
          src={profilePic}
          alt="Gading Aditya Perdana"
          className="rounded-lg shadow-md w-full object-cover relative z-10"
          variants={profilePicVariants} // Directly use variants
          initial="hidden"
          animate={contentReady ? ["visible", "float"] : "hidden"} // Add float to animate
          whileHover={shouldEnableHover ? "hover" : undefined}
          whileTap={shouldEnableHover ? "hover" : undefined}
          style={{
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            opacity: isIOSSafari ? 1 : undefined,
          }}
          loading="eager"
        />
        {/* Animated glow behind the image */}
        <motion.div
          className={`absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg ${
            isMobile || isIOSSafari ? "blur-sm opacity-20" : "blur-md opacity-40" // Enhanced blur and opacity
          } -z-10`}
          initial={{ opacity: 0 }}
          animate={
            contentReady
              ? isMobile || isIOSSafari
                ? { opacity: 0.25 } // Slightly more visible on mobile/iOS
                : { opacity: [0.3, 0.5, 0.3] } // Enhanced opacity cycle
              : { opacity: 0 }
          }
          transition={
            isMobile || isIOSSafari
              ? { duration: 0.8 } // Slightly longer duration
              : { duration: 4, repeat: Infinity, repeatType: "mirror" } // Slower, more noticeable pulse
          }
          style={{
            mixBlendMode: "screen",
            transform: "translateZ(0)",
            backgroundSize: "200% 200%",
            animation: isMobile
              ? "lightGradientShift 3s ease-in-out infinite alternate"
              : "none",
            willChange: "opacity",
          }}
        />
        {contentReady && (
          <Suspense fallback={null}>
            {showParticles && <ParticleEffect />}
          </Suspense>
        )}
      </div>

      {/* Optionally load AmbientBackground here or in parent */}
      {showAmbient && contentReady && (
        <Suspense fallback={null}>
          <AmbientBackground />
        </Suspense>
      )}
    </div>
  );
};

export default HeroProfileImage;
