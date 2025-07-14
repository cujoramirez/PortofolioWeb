import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

// Enterprise-level animation variants with unique section animations
export const enterpriseVariants = {
  // Hero Section - Dynamic Title Animation
  heroMorphTitle: {
    hidden: { 
      opacity: 0, 
      y: 80,
      scale: 0.8,
      rotateX: -25,
      // filter: "blur(10px)" // Removed
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1],
        type: "spring",
        damping: 20,
        stiffness: 100
      }
    }
  },

  heroMorphSubtitle: {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.9,
      rotateY: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1.0,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  heroMorphButton: {
    hidden: { 
      opacity: 0, 
      scale: 0.6,
      rotateZ: -10,
      y: 30
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.6,
        type: "spring",
        damping: 15,
        stiffness: 120
      }
    }
  },

  // About Section - Organic Morphing
  aboutMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  },

  aboutMorphElement: {
    hidden: { 
      opacity: 0, 
      scale: 0.4,
      rotateY: -60,
      rotateX: 30,
      z: -200,
      // filter: "blur(8px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      z: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 0.8,
        ease: "backOut"
      }
    }
  },

  aboutMorphImage: {
    hidden: { 
      opacity: 0, 
      scale: 0.7,
      rotateZ: -15,
      // filter: "blur(12px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateZ: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.3,
        type: "spring",
        damping: 18,
        stiffness: 85
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
      // filter: "blur(10px)" // Removed
    },
    visible: { 
      opacity: 1,
      scale: 1,
      // filter: "blur(0px)", // Removed
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

  // Contact Section Morphing - Professional Enterprise Greeting
  contactMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  },

  contactMorphCard: {
    hidden: { 
      opacity: 0, 
      scale: 0.4,
      rotateY: -90,
      rotateX: 30,
      z: -200,
      // filter: "blur(10px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      rotateX: 0,
      z: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 1.2
      }
    }
  },

  // Hero Section Morphing - Enterprise Entrance
  heroMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  },

  // Experience Section - Professional Slide-In
  experienceMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.05
      }
    }
  },

  experienceMorphCard: {
    hidden: { 
      opacity: 0, 
      x: -100,
      scale: 0.8,
      rotateY: 45,
      // filter: "blur(6px)" // Removed
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      rotateY: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 0.9,
        type: "spring",
        damping: 25,
        stiffness: 100
      }
    }
  },

  experienceMorphTitle: {
    hidden: { 
      opacity: 0, 
      y: -50,
      scale: 0.9,
      // filter: "blur(8px)" // Removed
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.0,
        type: "spring",
        damping: 20,
        stiffness: 80
      }
    }
  },

  experienceMorphTimeline: {
    hidden: { 
      opacity: 0, 
      scaleY: 0,
      transformOrigin: "top"
    },
    visible: { 
      opacity: 1, 
      scaleY: 1,
      transition: {
        duration: 1.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Projects Section - Dynamic Grid Morphing
  projectsMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },

  projectsMorphCard: {
    hidden: { 
      opacity: 0, 
      scale: 0.5,
      rotateX: 45,
      rotateY: -30,
      z: -150,
      // filter: "blur(10px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateX: 0,
      rotateY: 0,
      z: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.0,
        type: "spring",
        damping: 20,
        stiffness: 80
      }
    }
  },

  projectsMorphTitle: {
    hidden: { 
      opacity: 0, 
      y: -60,
      scale: 0.8,
      rotateX: 15,
      // filter: "blur(12px)" // Removed
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.2,
        type: "spring",
        damping: 18,
        stiffness: 70
      }
    }
  },

  projectsMorphImage: {
    hidden: { 
      opacity: 0, 
      scale: 1.3,
      // filter: "blur(15px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Technologies Section - Floating Elements
  techMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  },

  techMorphCard: {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.6,
      rotateZ: 15,
      // filter: "blur(8px)" // Removed
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateZ: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 0.8,
        type: "spring",
        damping: 28,
        stiffness: 120
      }
    }
  },

  techMorphIcon: {
    hidden: { 
      opacity: 0, 
      scale: 0.3,
      rotateY: -180
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.7,
        delay: 0.2,
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  },

  // Research Section - Academic Flow
  researchMorphContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.15
      }
    }
  },

  researchMorphCard: {
    hidden: { 
      opacity: 0, 
      scale: 0.7,
      rotateX: -30,
      y: 40,
      // filter: "blur(12px)" // Removed
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotateX: 0,
      y: 0,
      // filter: "blur(0px)", // Removed
      transition: {
        duration: 1.1,
        type: "spring",
        damping: 22,
        stiffness: 90
      }
    }
  },

  researchMorphTitle: {
    hidden: { 
      opacity: 0, 
      x: -30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.9,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  },

  // Global floating animation for background elements
  floatingElement: {
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      scale: [1, 1.05, 1],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  },

  // Hover interactions
  hoverScale: {
    whileHover: {
      scale: 1.05,
      rotateY: 5,
      z: 50,
      transition: {
        duration: 0.3,
        type: "spring",
        damping: 15,
        stiffness: 100
      }
    }
  },

  hoverGlow: {
    whileHover: {
      filter: "brightness(1.1) drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))",
      transition: {
        duration: 0.3
      }
    }
  }
};

// Enterprise Motion Components - Section-Specific Morphing
export const EnterpriseMotion = {
  // Hero Section Components
  HeroContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  HeroTitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  HeroSubtitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphSubtitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  HeroButton: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphButton}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // About Section Components
  AboutContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  AboutElement: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphElement}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  AboutImage: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphImage}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverGlow.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Experience Section Components
  ExperienceContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ExperienceCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ExperienceTitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ExperienceTimeline: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphTimeline}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Projects Section Components
  ProjectsContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ProjectCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ProjectsTitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ProjectImage: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphImage}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverGlow.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Technologies Section Components
  TechContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.techMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  TechCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.techMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  TechIcon: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.techMorphIcon}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverGlow.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Research Section Components
  ResearchContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ResearchCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ResearchTitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ResearchStats: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ContactElement: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.contactMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  ContactInfo: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.contactMorphInfo}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Universal Components
  FloatingElement: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.floatingElement}
      animate="animate"
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Legacy Support (keeping existing ones that might be used)
  MorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  MorphItem: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphElement}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      whileHover={enterpriseVariants.hoverScale.whileHover}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Contact Container
  ContactContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.contactMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Hero Morph Container
  HeroMorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Hero Morph Title
  HeroMorphTitle: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.heroMorphTitle}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // About Morph Container
  AboutMorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // About Morph Element
  AboutMorphElement: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.aboutMorphElement}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Projects Morph Container
  ProjectsMorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Projects Morph Card
  ProjectsMorphCard: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.projectsMorphCard}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Experience Morph Container
  ExperienceMorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Experience Morph Item
  ExperienceMorphItem: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.experienceMorphItem}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Research Morph Container
  ResearchMorphContainer: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )),

  // Research Morph Paper
  ResearchMorphPaper: forwardRef(({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={enterpriseVariants.researchMorphPaper}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
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

