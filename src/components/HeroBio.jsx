import React from "react";
import { motion } from "framer-motion";

const HeroBio = ({
  tokens,
  contentReady,
  animationsComplete,
  isMobile,
  isIOSSafari,
  getAnimationProps,
  titleLineVariants,
  enhancedWordVariants,
  shouldAnimateTokens,
  shouldUseScrollTrigger,
}) => {
  // Adjust these heights for better spacing on desktop
  const titleContainerHeight = isMobile ? "180px" : "200px";
  
  return (
    <div className="w-full flex flex-col items-center lg:items-center mt-6 lg:mt-0 lg:px-4 xl:px-8">
      {/* Title and animated outline */}
      <div
        className="title-container relative w-full mb-4"
        style={{ height: titleContainerHeight }}
      >
        <div className="text-xl md:text-2xl xl:text-3xl tracking-tight text-center lg:text-center relative space-y-3 no-select">
          {/* Title line 1 */}
          <motion.div
            className="text-container text-transparent bg-clip-text relative"
            style={{
              background:
                "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: isIOSSafari
                ? "none"
                : "gradientShift 2s ease-in-out infinite alternate",
            }}
            {...getAnimationProps(titleLineVariants)}
            whileHover={isIOSSafari ? undefined : "hover"}
            whileTap={isIOSSafari ? undefined : "hover"}
          >
            Computer Science Undergraduate
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur-md -z-10"
              initial={{ opacity: 0 }}
              animate={
                contentReady
                  ? isMobile || isIOSSafari
                    ? { opacity: 0.15 }
                    : { opacity: [0.1, 0.2, 0.1] }
                  : { opacity: 0 }
              }
              transition={
                isMobile || isIOSSafari
                  ? { duration: 0.5 }
                  : { duration: 2.5, repeat: Infinity, repeatType: "mirror" }
              }
            />
          </motion.div>
          {/* Title line 2 */}
          <motion.div
            className="text-container text-transparent bg-clip-text relative"
            style={{
              background:
                "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: isIOSSafari
                ? "none"
                : "gradientShift 2s ease-in-out infinite alternate",
            }}
            {...getAnimationProps(titleLineVariants, 0.15)}
            whileHover={isIOSSafari ? undefined : "hover"}
            whileTap={isIOSSafari ? undefined : "hover"}
          >
            Aspiring AI & Deep Learning Researcher
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
              initial={{ opacity: 0 }}
              animate={
                contentReady
                  ? isMobile || isIOSSafari
                    ? { opacity: 0.15 }
                    : { opacity: [0.1, 0.2, 0.1] }
                  : { opacity: 0 }
              }
              transition={
                isMobile || isIOSSafari
                  ? { duration: 0.5 }
                  : {
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 0.5,
                    }
              }
            />
          </motion.div>
          {/* Title line 3 */}
          <motion.div
            className="text-container text-transparent bg-clip-text relative"
            style={{
              background:
                "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: isIOSSafari
                ? "none"
                : "gradientShift 2s ease-in-out infinite alternate",
            }}
            {...getAnimationProps(titleLineVariants, 0.3)}
            whileHover={isIOSSafari ? undefined : "hover"}
            whileTap={isIOSSafari ? undefined : "hover"}
          >
            (Computer Vision Focus)
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
              initial={{ opacity: 0 }}
              animate={
                contentReady
                  ? isMobile || isIOSSafari
                    ? { opacity: 0.15 }
                    : { opacity: [0.1, 0.2, 0.1] }
                  : { opacity: 0 }
              }
              transition={
                isMobile || isIOSSafari
                  ? { duration: 0.5 }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 1,
                    }
              }
            />
          </motion.div>
        </div>
      </div>
      
      {/* Content Container for Bio */}
      <div className="w-full flex flex-col space-y-4">
        {/* Bio Paragraph */}
        <div
          className="bio-container w-full text-gray-300 leading-relaxed text-lg text-center lg:text-center relative lg:max-w-2xl lg:mx-auto"
          style={{
            minHeight: isMobile ? "180px" : "auto",
            opacity: contentReady || animationsComplete ? 1 : 0,
            visibility: contentReady || animationsComplete ? "visible" : "visible",
            transition: "opacity 0.3s ease-out",
          }}
        >
          <motion.div
            className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10"
            initial={{ opacity: 0 }}
            animate={
              contentReady
                ? isMobile || isIOSSafari
                  ? { opacity: 0.1 }
                  : { opacity: [0.05, 0.1, 0.05] }
                : { opacity: 0 }
            }
            transition={
              isMobile || isIOSSafari
                ? { duration: 0.5 }
                : { duration: 5, repeat: Infinity, repeatType: "mirror" }
            }
          />
          
          {/* Main Bio Text */}
          <motion.div
            className="text-container break-words lg:px-8 lg:mx-auto"
            initial={{ opacity: 0 }}
            animate={contentReady ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tokens.map((token, index) =>
              shouldAnimateTokens ? (
                <motion.span
                  key={index}
                  custom={index}
                  variants={enhancedWordVariants}
                  initial="hidden"
                  {...(shouldUseScrollTrigger && !isIOSSafari
                    ? { whileInView: "visible", viewport: { once: true, amount: 0.1 } }
                    : { animate: contentReady ? "visible" : "hidden" }
                  )}
                  whileHover={isIOSSafari ? undefined : "hover"}
                  whileTap={isIOSSafari ? undefined : "hover"}
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
              ) : (
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
              )
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroBio;
