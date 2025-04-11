// AboutTitleDivider.jsx

import React from "react";
import { motion } from "framer-motion";
import { titleVariants, dividerVariants } from "./aboutAnimations";

const AboutTitleDivider = ({ contentReady, isMobile }) => {
  return (
    <>
      <motion.h2
        className="my-12 text-center text-5xl font-bold leading-normal"
        variants={titleVariants}
        initial="hidden"
        animate={contentReady ? "visible" : "hidden"}
        whileHover={isMobile ? undefined : "hover"}
        whileTap={isMobile ? undefined : "hover"}
      >
        <span className="text-white">About</span>
        <motion.span className="bg-gradient-to-r from-pink-500 to-pink-500 bg-clip-text text-transparent">
          {" "}me
        </motion.span>
      </motion.h2>
      <motion.div
        className="h-1 mx-auto mb-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
        style={{ maxWidth: "400px" }}
        variants={dividerVariants}
        initial="hidden"
        animate={contentReady ? "visible" : "hidden"}
      />
    </>
  );
};

export default AboutTitleDivider;
