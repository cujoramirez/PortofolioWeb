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
          {...getAnimationProps(profilePicVariants, isIOSSafari ? 0.1 : 0.4)}
          whileHover={isIOSSafari || isMobile ? undefined : "hover"}
          whileTap={isIOSSafari || isMobile ? undefined : "hover"}
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
            isMobile || isIOSSafari ? "blur-sm opacity-20" : "blur opacity-30"
          } -z-10`}
          initial={{ opacity: 0 }}
          animate={
            contentReady
              ? isMobile || isIOSSafari
                ? { opacity: 0.15 }
                : { opacity: [0.2, 0.3, 0.2] }
              : { opacity: 0 }
          }
          transition={
            isMobile || isIOSSafari
              ? { duration: 0.5 }
              : { duration: 3, repeat: Infinity, repeatType: "mirror" }
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
