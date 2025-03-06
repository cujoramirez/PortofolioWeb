import React from "react";
import { motion } from "framer-motion";
import { textVariants, wordVariants, wordVariantsMobile } from "./aboutAnimations";
import { highlightAboutText } from "./highlightAboutText";

const AboutText = ({ ABOUT_TEXT, contentReady, fallbackActive, isMobile, simpleMode, isIOSSafari }) => {
  // Process text content to get tokens with special words highlighted
  const processText = () => {
    const text = ABOUT_TEXT;
    const specialWords = [
      "computer vision", "deep learning", "machine learning", "AI", "research",
      "neural networks", "algorithms", "data science", "projects", "passionate"
    ];
    
    // Split text into words and mark special ones
    const words = text.split(/\s+/);
    return words.map((word, index) => {
      const cleanWord = word.replace(/[.,;!?()]/g, '').toLowerCase();
      const isSpecial = specialWords.some(special => cleanWord === special.toLowerCase() || 
                                         cleanWord.includes(special.toLowerCase()));
      return {
        text: word,
        isSpecial: isSpecial
      };
    });
  };

  const tokens = processText();
  const enhancedWordVariants = isMobile ? wordVariantsMobile : wordVariants;

  return (
    <motion.div
      className="w-full lg:w-1/2 p-4 lg:p-8"
      variants={textVariants}
      initial="hidden"
      animate={contentReady ? "visible" : "hidden"}
    >
      <div className="flex items-center justify-center h-full">
        <motion.div 
          className="my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg"
          initial={{ opacity: 0 }}
          animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {isMobile || fallbackActive || isIOSSafari ? (
            // Simple rendering for mobile or fallback mode
            <div>
              {tokens.map((token, index) => (
                <span
                  key={index}
                  className={`inline-block mr-1 ${
                    token.isSpecial
                      ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                      : ""
                  }`}
                >
                  {token.text}{" "}
                </span>
              ))}
            </div>
          ) : (
            // Enhanced rendering with word-by-word animation for desktop
            <div>
              {tokens.map((token, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={enhancedWordVariants}
                  initial="hidden"
                  animate={contentReady ? "visible" : "hidden"}
                  whileHover="hover"
                  whileTap="hover"
                  className={`inline-block mr-1 ${
                    token.isSpecial
                      ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                      : ""
                  }`}
                  style={{
                    transform: "translateZ(0)",
                    willChange: "transform, opacity",
                  }}
                >
                  {token.text}{" "}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutText;