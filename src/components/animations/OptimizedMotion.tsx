/**
 * Ultra-optimized animation variants for 60fps performance
 * Only GPU-accelerated transforms (translate, scale, rotate, opacity)
 * No filters, no blur, no heavy CSS
 */

import { motion } from 'framer-motion';

// Optimized stagger configuration - reduced delays for smoothness
const optimizedStagger = {
  fast: {
    delayChildren: 0.05,
    staggerChildren: 0.03,
  },
  medium: {
    delayChildren: 0.08,
    staggerChildren: 0.05,
  },
  slow: {
    delayChildren: 0.12,
    staggerChildren: 0.08,
  },
};

// Ultra-fast spring configs
const springs = {
  snappy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 35,
    mass: 0.5,
  },
  smooth: {
    type: "spring" as const,
    stiffness: 400,
    damping: 30,
    mass: 0.6,
  },
  bouncy: {
    type: "spring" as const,
    stiffness: 350,
    damping: 25,
    mass: 0.7,
  },
};

// Optimized easing curves
const easings = {
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.34, 1.56, 0.64, 1],
  swift: [0.25, 0.46, 0.45, 0.94],
};

const optimizedVariants = {
  // Simple fade up - GPU only
  fadeUp: {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: springs.smooth,
    },
  },

  // Scale fade - GPU only
  scaleFade: {
    hidden: {
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: springs.smooth,
    },
  },

  // Slide from left - GPU only
  slideLeft: {
    hidden: {
      opacity: 0,
      x: -40,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: springs.smooth,
    },
  },

  // Slide from right - GPU only
  slideRight: {
    hidden: {
      opacity: 0,
      x: 40,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: springs.smooth,
    },
  },

  // Stagger container
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        ...optimizedStagger.fast,
        when: "beforeChildren",
      },
    },
  },

  // Stagger item
  staggerItem: {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springs.snappy,
    },
  },

  // Hover scale - ultra smooth
  hoverScale: {
    rest: {
      scale: 1,
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: easings.smooth,
      },
    },
  },

  // Hover lift - ultra smooth
  hoverLift: {
    rest: {
      y: 0,
      scale: 1,
    },
    hover: {
      y: -4,
      scale: 1.01,
      transition: {
        duration: 0.18,
        ease: easings.bounce,
      },
    },
  },
};

// Container with stagger
export const OptimizedStaggerContainer = ({ children, speed = "fast", ...props }: any) => (
  <motion.div
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          ...optimizedStagger[speed as keyof typeof optimizedStagger],
          when: "beforeChildren",
        },
      },
    }}
    initial="hidden"
    animate="visible"
    {...props}
  >
    {children}
  </motion.div>
);

// Optimized item with GPU hints
export const OptimizedMotionItem = ({ children, ...props }: any) => (
  <motion.div
    variants={optimizedVariants.staggerItem}
    style={{
      transform: "translateZ(0)",
      backfaceVisibility: "hidden",
      willChange: "transform, opacity",
    }}
    {...props}
  >
    {children}
  </motion.div>
);
