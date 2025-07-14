export function getOptimizedContainerVariants(staggerValue, isIOSSafari, isMobile) {
    return {
      hidden: { opacity: 0, y: isIOSSafari ? 0 : isMobile ? 10 : 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: isIOSSafari ? 0.3 : isMobile ? 0.5 : 0.7,
          ease: "easeOut",
          staggerChildren: isIOSSafari ? 0.03 : staggerValue,
          when: "beforeChildren",
        },
      },
    };
  }
  
  export function getTitleVariants() {
    return {
      hidden: { opacity: 0, y: -15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
      },
      hover: {
        scale: 1.02,
        textShadow: "0px 0px 12px rgba(168, 85, 247, 0.7)",
        transition: { duration: 0.3 },
      },
    };
  }
