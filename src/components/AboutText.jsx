// AboutText.jsx

import React from "react";
import { motion } from "framer-motion";
import { textVariants } from "./aboutAnimations";
import { highlightAboutText } from "./highlightAboutText";

const AboutText = ({ ABOUT_TEXT, contentReady, fallbackActive, isMobile, simpleMode }) => {
  const textContent = highlightAboutText(ABOUT_TEXT, simpleMode, isMobile);

  return (
    <motion.div
      className="w-full lg:w-1/2 p-4 lg:p-8"
      variants={textVariants}
      initial="hidden"
      animate={contentReady ? "visible" : "hidden"}
    >
      <div className="flex items-center justify-center h-full">
        <motion.p className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg">
          {isMobile || fallbackActive ? (
            textContent
          ) : (
            <motion.span
              initial="hidden"
              animate={contentReady ? "visible" : "hidden"}
              variants={textVariants}
            >
              {textContent}
            </motion.span>
          )}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default AboutText;
