import React from "react";
import { motion } from "framer-motion";

const HeroAdditionalContent = ({
  contentReady,
  isMobile,
  isIOSSafari,
}) => {
  // If mobile, don't render the content
  if (isMobile) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Research Interests */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Research Interests
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          My research focuses on developing robust computer vision algorithms that
          enhance medical diagnostics and improve accessibility. I'm particularly
          interested in exploring the intersection of neural networks and 
          interpretable AI to create more efficient and trustworthy systems.
        </p>
      </motion.div>

      {/* Featured Projects */}
      <motion.div
        className="mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Featured Projects
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-2 rounded-lg border border-purple-800/20">
            <h4 className="font-medium text-gray-200 text-sm">
              Diabetic Retinopathy Detection
            </h4>
            <p className="text-gray-400 text-xs">
              Deep learning model with 92% accuracy in early detection
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-2 rounded-lg border border-purple-800/20">
            <h4 className="font-medium text-gray-200 text-sm">
              Transparent Facial Recognition
            </h4>
            <p className="text-gray-400 text-xs">
              Privacy-focused system with explainable AI features
            </p>
          </div>
        </div>
      </motion.div>

      {/* Technical Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={contentReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <h3 className="text-xl font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
          Technical Skills
        </h3>
        <div className="flex flex-wrap gap-1">
          {["Python", "PyTorch", "TensorFlow", "Computer Vision", "ReactJS", "OpenCV", "Deep Learning"].map((skill, i) => (
            <span 
              key={i} 
              className="px-2 py-1 bg-gradient-to-br from-purple-900/30 to-pink-900/30 text-gray-300 rounded-full text-xs"
            >
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HeroAdditionalContent;
