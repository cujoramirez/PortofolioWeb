// animationUtils.js
export function getIconContainerVariants(isMobile, isIOSSafari) {
    return {
      hidden: { opacity: 0, y: isIOSSafari ? 5 : isMobile ? 8 : 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { 
          duration: isIOSSafari ? 0.3 : isMobile ? 0.4 : 0.6, 
          ease: "easeOut" 
        },
      },
      hover: isIOSSafari ? {} : {
        scale: isMobile ? 1.03 : 1.05,
        transition: {
          duration: 0.3,
          ease: "easeOut",
          type: "tween",
        },
      },
    };
  }
  
  export function getIconAnimation(color, isMobile, isTablet, isIOSSafari, reducedMotion) {
    // Disabled animations for iOS Safari and reduced motion
    if (isIOSSafari || reducedMotion) {
      return {
        animate: {
          filter: `drop-shadow(0 0 2px ${color}33)`,
        },
        hover: isIOSSafari ? {} : {
          scale: 1.03,
          filter: `drop-shadow(0 0 6px ${color})`,
          transition: { duration: 0.2 },
        },
      };
    }
    
    // Tablet-specific animations (lighter than desktop)
    if (isTablet) {
      return {
        animate: {
          y: [-1, 1, -1],
          filter: `drop-shadow(0 0 1px ${color}33)`,
          transition: {
            y: {
              duration: 3.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            },
          },
        },
        hover: {
          scale: 1.04,
          filter: `drop-shadow(0 0 8px ${color})`,
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        },
      };
    }
    
    // Desktop animations (kept intact as requested)
    return {
      animate: {
        y: [-2, 2, -2],
        filter: `drop-shadow(0 0 2px ${color}33)`,
        transition: {
          y: {
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          },
        },
      },
      hover: {
        scale: 1.1,
        filter: `drop-shadow(0 0 12px ${color})`,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      },
    };
  }
