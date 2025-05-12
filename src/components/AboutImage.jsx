// AboutImage.jsx
import React from "react";
import { motion } from "framer-motion";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";
import { imageVariants, imageContainerVariants } from "./aboutAnimations";

const AboutImage = ({ contentReady, isMobile }) => {
  const shouldEnableHover = !isMobile; // Simplified hover check

  return (
    <motion.div
      className="w-full lg:w-1/2 lg:p-8"
      variants={imageContainerVariants}
      initial="hidden"
      animate={contentReady ? "visible" : "hidden"}
    >
      <div className="flex items-center justify-center h-full">
        <motion.div
          className="relative w-4/5 max-w-md mx-auto rounded-2xl shadow-lg"
          variants={imageVariants} // Use the updated variants
          initial="hidden"
          animate={contentReady ? ["visible", "float"] : "hidden"} // Add "float" to the animate array
          whileHover={shouldEnableHover ? "hover" : undefined}
          whileTap={shouldEnableHover ? "hover" : undefined} // Consistent tap behavior
          style={{ aspectRatio: "1/1.2" }}
        >
          <motion.img
            src={aboutImg}
            alt="about"
            className="rounded-2xl shadow-lg shadow-purple-500/20 w-full h-auto object-cover z-10 relative"
            loading="eager"
          />
          {/* Animated borders - enhanced with subtle animation */}
          <motion.div
            className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl border-2 border-purple-500/60 z-0" // Slightly more opaque border
            initial={{ opacity: 0, scale: 0.95 }}
            animate={contentReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }} // Smoother transition
          />
          <motion.div
            className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-pink-500/60 z-0" // Slightly more opaque border
            initial={{ opacity: 0, scale: 0.95 }}
            animate={contentReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }} // Smoother transition
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AboutImage;
