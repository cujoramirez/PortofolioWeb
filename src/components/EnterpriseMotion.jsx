import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

// Enterprise-level animation variants
export const enterpriseVariants = {
  // Hero Section Animations
  heroTitle: {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
      rotateX: -15 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.2
      }
    }
  },

  // About Section Morphing
  morphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  },

  morphItem: {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      rotateY: -90,
      z: -100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      z: 0,
      transition: {
        duration: 1.5,
        ease: "backOut",
        type: "spring",
        stiffness: 100
      }
    }
  },

  // Technologies Timeline
  timelineContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  },

  timelineItem: {
    hidden: { 
      opacity: 0, 
      x: -100,
      rotateY: -45
    },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    }
  },

  // Research Section Networks
  networkContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  },

  networkNode: {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotateZ: 180
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      transition: {
        duration: 1,
        ease: "elasticOut",
        type: "spring",
        stiffness: 200
      }
    }
  },

  // Projects Gallery
  projectContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  },

  projectCard: {
    hidden: { 
      opacity: 0, 
      y: 100,
      rotateX: -30,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 1,
        ease: [0.23, 1, 0.32, 1],
        type: "spring",
        stiffness: 80
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  },

  // Certificates Achievement
  certificateContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.4
      }
    }
  },

  certificate: {
    hidden: { 
      opacity: 0, 
      rotateX: -90,
      y: 50,
      scale: 0.5
    },
    visible: { 
      opacity: 1, 
      rotateX: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.175, 0.885, 0.32, 1.275],
        type: "spring",
        stiffness: 60
      }
    }
  },

  // Contact Section
  contactContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  },

  contactItem: {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      rotateZ: -45
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      transition: {
        duration: 0.8,
        ease: "backOut",
        type: "spring",
        stiffness: 120
      }
    }
  }
};

// Hero section specific variants
export const heroVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.1
      }
    }
  },
  title: {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }
    }
  },
  subtitle: {
    hidden: { 
      opacity: 0, 
      x: -50,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      x: 0,
      rotateY: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.2
      }
    }
  },
  cta: {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      rotateZ: -10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      transition: {
        duration: 0.8,
        ease: "backOut",
        delay: 0.4
      }
    }
  }
};

// Professional micro-interactions
export const microInteractions = {
  buttonHover: {
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  buttonTap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeInOut"
    }
  },
  cardHover: {
    y: -8,
    scale: 1.02,
    rotateY: 2,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  iconSpin: {
    rotate: 360,
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity
    }
  },
  pulseGlow: {
    boxShadow: [
      "0 0 20px rgba(99, 102, 241, 0.3)",
      "0 0 40px rgba(99, 102, 241, 0.6)",
      "0 0 20px rgba(99, 102, 241, 0.3)"
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

// Stagger utility functions
export const staggerUtilities = {
  fastStagger: {
    staggerChildren: 0.05,
    delayChildren: 0.1
  },
  normalStagger: {
    staggerChildren: 0.1,
    delayChildren: 0.2
  },
  slowStagger: {
    staggerChildren: 0.2,
    delayChildren: 0.3
  }
};

// Page transition variants
export const pageTransitions = {
  initial: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  in: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  out: { 
    opacity: 0, 
    scale: 1.05,
    y: -20,
    transition: {
      duration: 0.4,
      ease: [0.55, 0.085, 0.68, 0.53]
    }
  }
};

// Enhanced motion component with enterprise features
export const EnterpriseMotion = forwardRef(({ 
  children, 
  variant = "default",
  stagger = "normal",
  enableReducedMotion = true,
  className = "",
  ...props 
}, ref) => {
  
  // Respect user's motion preferences
  const shouldReduceMotion = enableReducedMotion && 
    (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  const getVariants = () => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } }
      };
    }

    switch (variant) {
      case "hero":
        return enterpriseVariants.heroTitle;
      case "morph":
        return enterpriseVariants.morphItem;
      case "timeline":
        return enterpriseVariants.timelineItem;
      case "network":
        return enterpriseVariants.networkNode;
      case "project":
        return enterpriseVariants.projectCard;
      case "certificate":
        return enterpriseVariants.certificate;
      case "contact":
        return enterpriseVariants.contactItem;
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: {
              duration: 0.6,
              ease: "easeOut"
            }
          }
        };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`enterprise-motion ${className}`}
      variants={getVariants()}
      initial="hidden"
      animate="visible"
      whileHover={variant === "project" ? "hover" : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
});

EnterpriseMotion.displayName = 'EnterpriseMotion';

export default EnterpriseMotion;

