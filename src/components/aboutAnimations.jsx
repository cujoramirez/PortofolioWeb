// aboutAnimations.js

// Title animation variants
export const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
    },
    hover: {
      scale: 1.03,
      textShadow: "0px 0px 12px rgba(168,85,247,0.6)",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };
  
  // Container variants for staggering children
  export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };
  
  // Variants for the image container (left side image)
  export const imageContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  
  // Variants for the image block itself (with horizontal motion and slight 3D effect)
  export const imageVariants = {
    hidden: { x: -30, opacity: 0, rotateY: 3 },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0px 0px 20px rgba(168,85,247,0.4)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };
  
  // Variants for the text content
  export const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
    },
  };
  
  // Variants for the divider beneath the title
  export const dividerVariants = {
    hidden: { width: "0%", opacity: 0 },
    visible: {
      width: "80%",
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  
  // Variants for animated background shapes (if used)
  export const shapeVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (i) => ({
      opacity: 0.05,
      scale: 1,
      transition: { delay: 0.1 * i, duration: 0.4, ease: "easeOut" },
    }),
    animate: (i) => ({
      rotate: i % 2 === 0 ? [0, 2, 0] : [0, -2, 0],
      transition: {
        duration: 8 + i,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    }),
  };
  