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
        duration: 0.8,
        ease: "backOut"
      }
    }
  },

  // Technologies Sphere Animation
  techSphere: {
    hidden: { 
      opacity: 0,
      scale: 0,
      rotateX: 180
    },
    visible: { 
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 1.5,
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    },
    hover: {
      scale: 1.1,
      rotateY: 360,
      transition: {
        duration: 2,
        ease: "linear"
      }
    }
  },

  // Experience Timeline
  timelineContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
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
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Research Visualization
  researchData: {
    hidden: { 
      opacity: 0,
      scale: 0.5,
      filter: "blur(10px)"
    },
    visible: { 
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 1.2,
        ease: "anticipate"
      }
    }
  },

  // Projects Showcase
  projectCard: {
    hidden: { 
      opacity: 0,
      rotateX: -90,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    },
    hover: {
      rotateY: 10,
      scale: 1.05,
      z: 50,
      transition: {
        duration: 0.4
      }
    }
  },

  // Certifications Awards
  certificateFloat: {
    hidden: { 
      opacity: 0,
      y: 100,
      rotateZ: -10
    },
    visible: { 
      opacity: 1,
      y: 0,
      rotateZ: 0,
      transition: {
        duration: 1,
        ease: "circOut"
      }
    },
    hover: {
      y: -10,
      rotateZ: 5,
      scale: 1.02,
      transition: {
        duration: 0.3
      }
    }
  },

  // Contact Form Magic
  contactElement: {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      filter: "blur(5px)"
    },
    visible: { 
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 20px rgba(99, 102, 241, 0.3)",
      transition: {
        duration: 0.2
      }
    }
  },

  // Page transitions
  pageTransition: {
    initial: { opacity: 0, scale: 1.1 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 0.9 }
  },

  // Advanced stagger animations
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  // Quantum effect
  quantumShift: {
    hidden: {
      opacity: 0,
      scale: 0,
      rotateX: -180,
      rotateY: 180,
      z: -200
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      transition: {
        duration: 1.5,
        ease: [0.175, 0.885, 0.32, 1.275]
      }
    }
  }
};

// Enterprise Motion Components
export const EnterpriseMotion = {
  // Hero Enhanced
  HeroContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroTitle}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Morphing About
  MorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.morphContainer}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )),

  MorphItem: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.morphItem}
      whileHover={{ scale: 1.05, rotateY: 10 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Tech Sphere
  TechSphere: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.techSphere}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Timeline Experience
  TimelineContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.timelineContainer}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )),

  TimelineItem: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.timelineItem}
      whileHover={{ scale: 1.02, x: 10 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Research Data
  ResearchData: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchData}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Project Card
  ProjectCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectCard}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Certificate Float
  CertificateFloat: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.certificateFloat}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Contact Element
  ContactElement: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.contactElement}
      initial="hidden"
      animate="visible"
      whileFocus="focus"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Quantum Shift
  QuantumShift: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.quantumShift}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  ))
};

// Advanced Animation Hooks
export const useEnterpriseAnimation = (variant, options = {}) => {
  return {
    variants: enterpriseVariants[variant],
    initial: "hidden",
    animate: "visible",
    ...options
  };
};

export default EnterpriseMotion;
