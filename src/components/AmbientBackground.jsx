// AmbientBackground.jsx
import React from "react";
import { motion } from "framer-motion";

const ambientBlobVariants = {
  initial: { scale: 0.8, opacity: 0.1 },
  animate: (i) => ({
    scale: [0.8, 1.2, 0.9, 1.1, 0.8],
    opacity: [0.1, 0.2, 0.15, 0.25, 0.1],
    x: [0, 50, -30, 20, 0],
    y: [0, -30, 50, -20, 0],
    transition: {
      duration: 25 + i * 5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    },
  }),
};

const AmbientBackground = () => (
  <>
    {/* Ambient Blobs */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background:
              i % 2 === 0
                ? "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)"
                : "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0) 70%)",
            width: `${400 + i * 100}px`,
            height: `${400 + i * 100}px`,
            top: `${i * 10}%`,
            left: `${(i * 25) % 100}%`,
            filter: "blur(60px)",
            mixBlendMode: "normal",
          }}
          custom={i}
          variants={ambientBlobVariants}
          initial="initial"
          animate="animate"
        />
      ))}
    </div>
    {/* Subtle Grid Background */}
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        backgroundPosition: "center center",
        opacity: 0.2,
      }}
    ></div>
    {/* Animated Gradient Mesh */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <svg width="100%" height="100%" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.05)" />
            <stop offset="50%" stopColor="rgba(236,72,153,0.05)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0.05)" />
          </linearGradient>
        </defs>
        <motion.rect
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          fill="url(#meshGradient)"
          initial={{ rotate: 0, scale: 1 }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
            filter: "blur(80px)",
          }}
          transition={{
            rotate: { duration: 60, ease: "linear", repeat: Infinity },
            scale: {
              duration: 20,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            },
          }}
        />
      </svg>
    </div>
  </>
);

export default AmbientBackground;
