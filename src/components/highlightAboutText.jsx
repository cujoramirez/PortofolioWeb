// highlightAboutText.js

import React from "react";
import { motion } from "framer-motion";

export const specialWordsList = [
  "deep learning",
  "AI research",
  "computer vision",
  "machine learning",
  "innovative",
  "technology",
  "collaboration",
  "impactful",
  "emerging tech",
  "leadership",
];

// Define the hover variants to match desktop heroAnimations
const desktopHoverVariants = {
  hover: {
    scale: 1.05,
    color: "#a855f7",
    textShadow: "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  }
};

export function highlightAboutText(ABOUT_TEXT, simpleMode, isMobile) {
  if (!ABOUT_TEXT) return [];

  const specialPattern = specialWordsList
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${specialPattern})`, "gi");
  const segments = ABOUT_TEXT.split(regex);

  if (simpleMode) {
    return segments.map((segment, index) => {
      const isSpecial = specialWordsList.some(
        (word) => segment.toLowerCase() === word.toLowerCase()
      );
      if (isSpecial) {
        return (
          <span
            key={`special-${index}`}
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
          >
            {segment}
          </span>
        );
      }
      return <span key={`text-${index}`}>{segment}</span>;
    });
  }

  return segments.map((segment, index) => {
    const isSpecial = specialWordsList.some(
      (word) => segment.toLowerCase() === word.toLowerCase()
    );
    if (isSpecial) {
      return (
        <motion.span
          key={`special-${index}`}
          custom={index}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { delay: 0.1, duration: 0.4 },
            },
            ...desktopHoverVariants
          }}
          className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
          whileHover={!isMobile ? "hover" : undefined}
          style={{
            transform: "translateZ(0)",
            willChange: !isMobile ? "transform, opacity" : "auto",
          }}
        >
          {segment}
        </motion.span>
      );
    }
    return (
      <motion.span
        key={`word-${index}`}
        custom={index}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { delay: 0.1 + index * 0.01, duration: 0.3 },
          },
          ...(!isSpecial && !isMobile ? desktopHoverVariants : {})
        }}
        whileHover={!isMobile && !isSpecial ? "hover" : undefined}
        style={{
          transform: !isMobile ? "translateZ(0)" : "none",
          willChange: !isMobile ? "transform, opacity" : "auto",
        }}
      >
        {segment}
      </motion.span>
    );
  });
}