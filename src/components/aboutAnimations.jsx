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
    textShadow: "0px 0px 12px rgba(168,85,247,0.6), 0px 0px 20px rgba(236,72,153,0.4)",
    filter: "brightness(1.2)",
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
    scale: 1.03,
    boxShadow: "0px 0px 20px rgba(168,85,247,0.4)",
    filter: "brightness(1.1)",
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

// Variants for individual words in text content (matching HeroBio)
export const wordVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.03, 1.5),
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.05,
    color: "#a855f7",
    textShadow: "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Mobile variants for individual words
export const wordVariantsMobile = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.02, 1),
      duration: 0.2,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.02,
    color: "#a855f7",
    textShadow: "0px 0px 2px rgba(168,85,247,0.3)",
    transition: { duration: 0.2, ease: "easeOut" },
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
