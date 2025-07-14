// AboutShapes.jsx
import React from "react";
import { motion } from "framer-motion";
import { shapeVariants } from "./aboutAnimations";

const AboutShapes = ({ showShapes, numShapes, contentReady, isMobile }) => {
  if (!showShapes || numShapes <= 0) return null;

  return (
    <>
      {[...Array(numShapes)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-5"
          style={{
            background: "linear-gradient(45deg, #a855f7, #ec4899)",
            height: `${80 + i * (isMobile ? 20 : 40)}px`,
            width: `${80 + i * (isMobile ? 20 : 40)}px`,
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            zIndex: -1,
            pointerEvents: "none",
          }}
          variants={shapeVariants}
          custom={i}
          initial="hidden"
          animate={contentReady ? (isMobile ? "visible" : "animate") : "hidden"}
        />
      ))}
    </>
  );
};

export default AboutShapes;

