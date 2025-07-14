// ParticleEffect.jsx
import React from "react";
import { motion } from "framer-motion";

const ParticleEffect = () => (
  <div className="absolute -inset-16 z-0 opacity-60">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-purple-500"
        style={{
          width: 6 + Math.random() * 8,
          height: 6 + Math.random() * 8,
          top: `${20 + Math.random() * 60}%`,
          left: `${20 + Math.random() * 60}%`,
          filter: "blur(3px)",
        }}
        animate={{
          x: [0, Math.random() * 40 - 20, 0],
          y: [0, Math.random() * 40 - 20, 0],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3 + Math.random() * 4,
          repeat: Infinity,
          repeatType: "mirror",
          delay: i * 0.5,
        }}
      />
    ))}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i + 6}
        className="absolute rounded-full bg-pink-500"
        style={{
          width: 5 + Math.random() * 6,
          height: 5 + Math.random() * 6,
          top: `${20 + Math.random() * 60}%`,
          left: `${20 + Math.random() * 60}%`,
          filter: "blur(2px)",
        }}
        animate={{
          x: [0, Math.random() * 30 - 15, 0],
          y: [0, Math.random() * 30 - 15, 0],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          repeatType: "mirror",
          delay: i * 0.5 + 0.2,
        }}
      />
    ))}
  </div>
);

export default ParticleEffect;

