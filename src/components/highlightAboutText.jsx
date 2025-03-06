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
          }}
          className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
          whileHover={isMobile ? undefined : "hover"}
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
        }}
      >
        {segment}
      </motion.span>
    );
  });
}
