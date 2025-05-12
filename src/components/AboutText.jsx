import React from "react";
import { motion } from "framer-motion";
import { textVariants, wordVariants, wordVariantsMobile } from "./aboutAnimations";
import { highlightAboutText } from "./highlightAboutText";

const AboutText = ({ ABOUT_TEXT, contentReady, fallbackActive, isMobile, simpleMode, isIOSSafari }) => {
  // Process text content to get tokens with special words highlighted
  const processText = () => {
    const text = ABOUT_TEXT;
    // Special words and phrases to highlight
    const specialWords = [
      "computer vision", "deep learning", "machine learning", "AI", "research",
      "neural networks", "algorithms", "data science", "projects", "passionate",
      "Diabetic Retinopathy", "Facial Recognition", "collaborative", "innovative"
    ];
    
    // First, prepare a normalized version of the text for searching
    const normalizedText = text.toLowerCase();
    const result = [];
    let currentIndex = 0;
    
    // Process the original text to maintain original casing and punctuation
    while (currentIndex < text.length) {
      let matchFound = false;
      
      // Check for multi-word special terms at the current position
      for (const specialWord of specialWords) {
        const specialWordLower = specialWord.toLowerCase();
        const textToCheck = normalizedText.substring(currentIndex);
        
        // Check if the special word is at the beginning of the remaining text
        // and is followed by a word boundary (space, punctuation, or end of text)
        if (textToCheck.startsWith(specialWordLower) &&
            (currentIndex + specialWordLower.length === normalizedText.length || 
             !(/[a-zA-Z0-9]/.test(normalizedText[currentIndex + specialWordLower.length])))) {
          
          // Get the original case version from the text
          const originalCaseWord = text.substring(currentIndex, currentIndex + specialWord.length);
          result.push({
            text: originalCaseWord,
            isSpecial: true
          });
          
          currentIndex += specialWord.length;
          matchFound = true;
          break;
        }
      }
      
      // If no special word was found, add the current character and move on
      if (!matchFound) {
        // Find the next space or end of text
        let nextSpaceIndex = text.indexOf(' ', currentIndex);
        if (nextSpaceIndex === -1) nextSpaceIndex = text.length;
        
        // Add all characters up to the next space as a regular word
        const word = text.substring(currentIndex, nextSpaceIndex);
        result.push({
          text: word,
          isSpecial: false
        });
        
        currentIndex = nextSpaceIndex + 1;
        
        // Add the space separately
        if (nextSpaceIndex < text.length) {
          result.push({
            text: ' ',
            isSpecial: false
          });
        }
      }
    }
    
    return result;
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
                  className={`inline ${
                    token.isSpecial
                      ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                      : ""
                  }`}
                >
                  {token.text}
                </span>
              ))}
            </div>
          ) : (
            // Enhanced rendering with word-by-word animation for desktop
            <div>
              {tokens.map((token, index) => {
                // Prevent hover effects on space-only tokens
                const isSpaceToken = token.text.trim() === "";
                return (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={enhancedWordVariants}
                    initial="hidden"
                    animate={contentReady ? "visible" : "hidden"}
                    whileHover={!isSpaceToken && contentReady ? "hover" : undefined}
                    whileTap={!isSpaceToken && contentReady ? "hover" : undefined}
                    className={`inline ${
                      token.isSpecial
                        ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                        : ""
                    }`}
                    style={{
                      transform: "translateZ(0)",
                      willChange: "transform, opacity, color, background-image, text-shadow", // Added properties that change on hover
                      cursor: !isSpaceToken ? "pointer" : "default", // Add pointer cursor for non-space tokens
                    }}
                  >
                    {token.text}
                  </motion.span>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutText;