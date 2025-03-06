// heroAnimations.js
export const nameVariants = {
    initial: {
      fontWeight: 100,
      letterSpacing: "0.05em",
      textShadow: "0 0 0 rgba(255,255,255,0)",
      WebkitTextStroke: "0.2px rgba(255,255,255,0.2)",
      filter: "brightness(0.9)",
      opacity: 0.9,
      y: 3,
    },
    animate: {
      fontWeight: [100, 300, 500, 700],
      letterSpacing: ["0.05em", "0.03em", "0.01em", "0em"],
      textShadow: [
        "0 0 0 rgba(255,255,255,0)",
        "0 0 3px rgba(255,255,255,0.1)",
        "0 0 5px rgba(255,255,255,0.2)",
        "0 0 8px rgba(255,255,255,0.3)",
      ],
      WebkitTextStroke: [
        "0.2px rgba(255,255,255,0.2)",
        "0.15px rgba(255,255,255,0.3)",
        "0.1px rgba(255,255,255,0.2)",
        "0px rgba(255,255,255,0)",
      ],
      filter: ["brightness(0.9)", "brightness(1)", "brightness(1.2)", "brightness(1)"],
      opacity: [0.9, 0.95, 1, 1],
      y: [3, 2, 1, 0],
      transition: {
        duration: 2,
        times: [0, 0.3, 0.7, 1],
        ease: [0.4, 0, 0.2, 1],
      },
    },
    hover: {
      textShadow:
        "0 0 12px rgba(236,72,153,0.6), 0 0 20px rgba(168,85,247,0.4)",
      filter: "brightness(1.2)",
      scale: 1.01,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };
  
  export const nameVariantsMobile = {
    initial: {
      fontWeight: 200,
      opacity: 0.9,
      textShadow: "0 0 0 rgba(255,255,255,0)",
    },
    animate: {
      fontWeight: 700,
      opacity: 1,
      textShadow: "0 0 5px rgba(255,255,255,0.2)",
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
    hover: {
      textShadow: "0 0 8px rgba(236,72,153,0.5)",
      filter: "brightness(1.1)",
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };
  
  export const outlineVariantsHigh = {
    initial: {
      pathLength: 0,
      pathOffset: 0,
      strokeOpacity: 1,
      strokeWidth: 4,
    },
    animate: {
      pathLength: 1,
      pathOffset: [0, 0.25, 0.5, 0.75, 1],
      strokeOpacity: [1, 1, 1, 0.8, 0],
      strokeWidth: [4, 4, 3.5, 3, 2.5],
      transition: {
        pathLength: { duration: 2, ease: [0.33, 1, 0.68, 1] },
        pathOffset: {
          duration: 2,
          times: [0, 0.25, 0.5, 0.75, 1],
          ease: [0.33, 1, 0.68, 1],
        },
        strokeOpacity: {
          duration: 2,
          times: [0, 0.5, 0.8, 0.9, 1],
          ease: "easeInOut",
        },
        strokeWidth: {
          duration: 2,
          times: [0, 0.5, 0.75, 0.9, 1],
          ease: "easeInOut",
        },
      },
    },
  };
  
  export const outlineVariantsMid = {
    initial: {
      pathLength: 0,
      strokeOpacity: 1,
      strokeWidth: 3.5,
    },
    animate: {
      pathLength: 1,
      strokeOpacity: [1, 1, 0.6, 0],
      strokeWidth: [3.5, 3.5, 3, 2.5],
      transition: {
        pathLength: { duration: 1.8, ease: [0.33, 1, 0.68, 1] },
        strokeOpacity: { duration: 1.8, times: [0, 0.6, 0.8, 1], ease: "easeInOut" },
        strokeWidth: { duration: 1.8, times: [0, 0.6, 0.8, 1], ease: "easeInOut" },
      },
    },
  };
  
  export const outlineVariantsLow = {
    initial: {
      pathLength: 0,
      strokeOpacity: 1,
      strokeWidth: 3,
    },
    animate: {
      pathLength: 1,
      strokeOpacity: [1, 0.8, 0],
      strokeWidth: [3, 2.8, 2.5],
      transition: {
        pathLength: { duration: 1.5, ease: "easeOut" },
        strokeOpacity: { duration: 1.5, times: [0, 0.7, 1], ease: "easeInOut" },
        strokeWidth: { duration: 1.5, times: [0, 0.7, 1], ease: "easeInOut" },
      },
    },
  };
  
  export const outlineVariantsIOS = {
    initial: {
      pathLength: 0,
      strokeOpacity: 1,
      strokeWidth: 3,
    },
    animate: {
      pathLength: 1,
      strokeOpacity: [1, 1, 0],
      strokeWidth: [3, 3, 2.5],
      transition: {
        pathLength: { duration: 1.2, ease: [0.33, 1, 0.68, 1] },
        strokeOpacity: { duration: 1.2, times: [0, 0.7, 1], ease: "easeOut" },
        strokeWidth: { duration: 1.2, times: [0, 0.7, 1], ease: "easeOut" },
      },
    },
  };
  
  export const dotVariantsHigh = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0, 0.7, 1, 0.8, 0.6, 0.4, 0],
      scale: [0.8, 1.2, 1, 0.9, 0.8, 0.7, 0.6],
      filter: [
        "brightness(0.8) blur(0px)",
        "brightness(1.5) blur(0px)",
        "brightness(1.2) blur(0px)",
        "brightness(1) blur(0px)",
        "brightness(0.9) blur(1px)",
        "brightness(0.8) blur(2px)",
        "brightness(0.7) blur(3px)",
      ],
      transition: {
        duration: 2.2,
        times: [0, 0.2, 0.4, 0.6, 0.75, 0.9, 1],
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };
  
  export const dotVariantsMid = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: [0, 0.7, 1, 0.6, 0],
      scale: [0.8, 1.1, 1, 0.9, 0.8],
      filter: [
        "brightness(0.8)",
        "brightness(1.3)",
        "brightness(1.2)",
        "brightness(1)",
        "brightness(0.8)",
      ],
      transition: {
        duration: 1.8,
        times: [0, 0.2, 0.5, 0.8, 1],
        ease: "easeInOut",
      },
    },
  };
  
  export const dotVariantsLow = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.7, 1, 0],
      transition: {
        duration: 1.5,
        times: [0, 0.3, 0.6, 1],
        ease: "easeInOut",
      },
    },
  };
  
  export const dotVariantsIOS = {
    hidden: { opacity: 0 },
    visible: {
      opacity: [0, 0.8, 0],
      transition: {
        duration: 1.2,
        times: [0, 0.5, 1],
        ease: "easeInOut",
      },
    },
  };
  
  export const titleLineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 },
    },
  };
  
  export function getEnhancedWordVariants(delayMultiplier, isMobile) {
    return {
      hidden: { opacity: 0, y: 10 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: Math.min(i * delayMultiplier, 1.5),
          duration: isMobile ? 0.2 : 0.3,
          ease: "easeOut",
        },
      }),
      hover: {
        scale: isMobile ? 1.02 : 1.05,
        color: "#a855f7",
        textShadow:
          isMobile
            ? "0px 0px 2px rgba(168,85,247,0.3)"
            : "0px 0px 8px rgba(168,85,247,0.5)",
        transition: { duration: 0.2, ease: "easeOut" },
      },
    };
  }
  
  export const profilePicVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.2, ease: "easeOut" },
    },
    hover: {
      scale: 1.03,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };
  