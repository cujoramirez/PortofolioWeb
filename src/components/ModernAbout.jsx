import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useInView, useScroll, useTransform, useSpring, useMotionValue, useAnimationFrame } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  Psychology,
  Code,
  School,
  EmojiEvents,
  TrendingUp,
  Science,
  AutoAwesome,
  Insights,
  Rocket,
  Favorite,
  Star,
  Timeline
} from "@mui/icons-material";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import { ABOUT_TEXT } from "../constants/index";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";

// Stats data with enhanced animations
const statsData = [
  { label: "Peer-reviewed Publications", value: 4, displayValue: "4", icon: Science, color: "#6366f1", delay: 0 },
  { label: "Conference Awards", value: 1, displayValue: "1", icon: EmojiEvents, color: "#22d3ee", delay: 0.2 },
  { label: "Intelligent Systems Delivered", value: 6, displayValue: "6", icon: Rocket, color: "#8b5cf6", delay: 0.4 },
  { label: "Certifications", value: 15, displayValue: "15", icon: EmojiEvents, color: "#10b981", delay: 0.6 },
];

// Skills data with 3D effects
const skillsData = [
  { name: "Machine Learning", level: 95, color: "#6366f1", icon: Psychology },
  { name: "Deep Learning", level: 90, color: "#8b5cf6", icon: AutoAwesome },
  { name: "Computer Vision", level: 88, color: "#22d3ee", icon: Insights },
  { name: "Python", level: 92, color: "#3776ab", icon: Code },
  { name: "AI Innovation", level: 88, color: "#ff6f00", icon: Rocket },
  { name: "Data Science", level: 90, color: "#10b981", icon: Science },
];

// Enhanced Floating Elements Component with better performance
const Floating3DElement = ({ children, intensity = 1, delay = 0 }) => {
  const ref = useRef();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = useMemo(() => {
    return (e) => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        mouseX.set(x * intensity * 15);
        mouseY.set(y * intensity * 15);
      }
    };
  }, [intensity, mouseX, mouseY]);

  const handleMouseLeave = useMemo(() => {
    return () => {
      mouseX.set(0);
      mouseY.set(0);
    };
  }, [mouseX, mouseY]);

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const rotateX = useTransform(y, [-15, 15], [3, -3]);
  const rotateY = useTransform(x, [-15, 15], [-3, 3]);

  return (
    <motion.div
      ref={ref}
      style={{ x, y, rotateX, rotateY }}
      initial={{ opacity: 0, scale: 0.9, z: -50 }}
      animate={{ opacity: 1, scale: 1, z: 0 }}
      transition={{ 
        delay, 
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 12
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
};

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let startTime;
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * value));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

// Enhanced Skill bar component with better interactions
const SkillBar = ({ skill, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
            border: `1px solid ${skill.color}40`,
            boxShadow: `0 20px 40px ${skill.color}20`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: isHovered ? 0 : '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${skill.color}10, transparent)`,
            transition: 'left 0.5s ease',
          }
        }}
      >
        {/* Skill Icon */}
        <Box sx={{ 
          position: 'absolute', 
          top: 16, 
          right: 16,
          opacity: isHovered ? 1 : 0.6,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)'
        }}>
          <skill.icon sx={{ 
            color: skill.color, 
            fontSize: '1.8rem',
            filter: `drop-shadow(0 2px 4px ${skill.color}40)`
          }} />
        </Box>
        
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                color: isHovered ? skill.color : 'rgba(255, 255, 255, 0.9)',
                transition: 'color 0.3s ease',
              }}
            >
              {skill.name}
            </Typography>
            <motion.span
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: skill.color, 
                  fontWeight: 700,
                  textShadow: isHovered ? `0 0 10px ${skill.color}50` : 'none',
                  transition: 'text-shadow 0.3s ease',
                }}
              >
                {skill.level}%
              </Typography>
            </motion.span>
          </Box>
          
          {/* Enhanced Progress Bar */}
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={isInView ? skill.level : 0}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)`,
                  borderRadius: 4,
                  boxShadow: isHovered ? `0 0 20px ${skill.color}60` : 'none',
                  transition: 'box-shadow 0.3s ease',
                }
              }}
            />
            
            {/* Animated Glow Effect */}
            {isHovered && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: 8,
                  background: `linear-gradient(90deg, ${skill.color}80, ${skill.color}40)`,
                  borderRadius: 4,
                  zIndex: -1,
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
};

// Memoized floating shapes component to prevent re-renders
const FloatingShapes = React.memo(() => {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            background: `linear-gradient(135deg, ${
              ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#ef4444'][i]
            }20, transparent)`,
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
        />
      ))}
    </Box>
  );
});

// Enhanced ModernAbout component with stability improvements
const ModernAbout = ({ landingComplete = true }) => {
  const { performanceTier, deviceType } = useSystemProfile();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const shouldReduceMotion = performanceTier === "low" || isMobile;
  
  const containerRef = useRef(null);
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  
  // Enhanced intersection observer with better triggering
  const isInView = useInView(containerRef, { 
    once: false, // Allow multiple triggers
    amount: isMobile ? 0.01 : 0.1, // Lower threshold for mobile
    margin: isMobile ? "0px 0px -100px 0px" : "0px 0px -50px 0px" // More generous margins
  });
  
  // Enhanced visibility state management
  const [shouldShowContent, setShouldShowContent] = useState(false);
  
  // Handle smooth scroll navigation and button clicks
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#about') {
        setShouldShowContent(true);
        setForceVisible(true);
        console.log('ModernAbout: Triggered by hash navigation');
      }
    };
    
    const handleExploreWork = () => {
      setShouldShowContent(true);
      setForceVisible(true);
      console.log('ModernAbout: Triggered by exploreMyWork event');
    };
    
    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes and explore work events
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('exploreMyWork', handleExploreWork);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('exploreMyWork', handleExploreWork);
    };
  }, []);
  
  // Improved scroll-based triggering
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Trigger when section is 80% visible
        if (rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2) {
          setShouldShowContent(true);
          setForceVisible(true);
          console.log('ModernAbout: Triggered by scroll visibility');
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check immediately
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Standard intersection observer trigger
  useEffect(() => {
    if (isInView) {
      setShouldShowContent(true);
      setHasAnimated(true);
      setForceVisible(true);
      console.log('ModernAbout: Triggered by intersection observer');
    }
  }, [isInView]);
  
  // Component mounting effect
  useEffect(() => {
    setIsComponentMounted(true);
    
    // Quick fallback timer
    const visibilityTimer = setTimeout(() => {
      setShouldShowContent(true);
      setForceVisible(true);
      console.log('ModernAbout: Fallback timer triggered');
    }, 2000);
    
    return () => {
      setIsComponentMounted(false);
      clearTimeout(visibilityTimer);
    };
  }, []);
  
  // Enhanced scroll progress with container targeting for better animation - Fixed hydration warning
  const { scrollYProgress } = useScroll(
    isComponentMounted && containerRef.current ? {
      target: containerRef,
      offset: ["start end", "end start"],
      layoutEffect: false // Prevent layout effects that can cause disappearing
    } : {
      layoutEffect: false
    }
  );
  
  // Enhanced transforms with better scroll responsiveness - Fixed visibility issues
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], shouldReduceMotion ? [0, 0, 0, 0] : [0, 0, 0, 0]); // Disabled y movement to prevent disappearing
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 1]); // Keep high minimum opacity
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], shouldReduceMotion ? [1, 1, 1, 1] : [0.98, 1, 1, 1]); // Minimal scaling to prevent issues

  // Enhanced animation variants with better scroll responsiveness
  const containerVariants = useMemo(() => ({
    hidden: { 
      opacity: shouldReduceMotion ? 1 : 0, 
      scale: shouldReduceMotion ? 1 : 0.9,
      y: shouldReduceMotion ? 0 : 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 1.2,
        ease: "easeOut",
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.2,
      }
    }
  }), [shouldReduceMotion]);

  const itemVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 60,
      scale: shouldReduceMotion ? 1 : 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.8,
        ease: "easeOut"
      }
    }
  }), [shouldReduceMotion]);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }), []);

  // Don't render until component is mounted to prevent hydration issues
  if (!isComponentMounted) {
    return (
      <Box
        component="section"
        id="about"
        sx={{
          py: { xs: 8, md: 12 },
          pb: { xs: 12, md: 16 },
          minHeight: '100vh',
          background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          Loading About Section...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      component="section"
      id="about"
      sx={{
        py: { xs: 8, md: 12 },
        pb: { xs: 12, md: 16 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh', // Ensure minimum height to prevent layout shifts
        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
        willChange: 'transform', // Optimize for animations
        // Ensure content is always visible as fallback
        '& .motion-div': {
          minHeight: '50vh',
          visibility: 'visible !important', // Force visibility
          transform: 'translateZ(0)', // Hardware acceleration
        },
        contain: 'layout style paint', // Improve performance and prevent reflows
        zIndex: isMobile ? 100 : 1, // Higher z-index on mobile to ensure visibility
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2322d3ee" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5
        }
      }}
    >
      {/* Floating shapes background */}
      {!shouldReduceMotion && isComponentMounted && <FloatingShapes />}
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: isMobile ? 101 : 10 }}> {/* Higher z-index on mobile */}
        <motion.div
          className="motion-div"
          variants={containerVariants}
          initial="hidden"
          animate={shouldShowContent || forceVisible ? "visible" : "hidden"}
          style={{
            y: shouldReduceMotion ? 0 : y,
            opacity: shouldReduceMotion ? 1 : opacity,
            scale: shouldReduceMotion ? 1 : scale,
            position: 'relative',
            zIndex: isMobile ? 102 : 10, // Higher z-index on mobile to ensure visibility
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        >
          {/* Section Header - BIGGER TITLE */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '5rem', lg: '6rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                <Box component="span" sx={{ color: 'white' }}>About</Box> Me
              </Typography>
              
              <Box
                sx={{
                  width: 120,
                  height: 6,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
                  borderRadius: 3,
                  mx: 'auto'
                }}
              />
            </Box>
          </motion.div>

          {/* Main Content Grid - PERFECT SIDE-BY-SIDE LAYOUT */}
          <Grid container spacing={4} alignItems="center" sx={{ mt: 0 }}>
            {/* Portrait Image Section - LEFT SIDE */}
            <Grid size={{ xs: 12, lg: 5 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Floating3DElement intensity={1.5}>
                  <motion.div
                    variants={itemVariants}
                    style={{
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: '380px', md: '450px' },
                        height: { xs: '450px', md: '550px' },
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
                        position: 'relative',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                          animation: 'shine 2s ease-in-out infinite',
                          zIndex: 2,
                        }
                      }}
                    >
                      {/* Main Profile Image */}
                      <Box
                        component="img"
                        src={aboutImg}
                        alt="Gading Aditya Perdana - AI/ML Engineer"
                        className="profile-image"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          filter: 'brightness(1.1) contrast(1.05)',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          zIndex: 1,
                        }}
                      />
                      
                      {/* Overlay and floating icon hover effects removed for static presentation */}
                      
                      {/* Animated Border Accent */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          borderRadius: '26px',
                          background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #22d3ee, #10b981)',
                          zIndex: -1,
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </Box>
                  </motion.div>
                </Floating3DElement>
              </Box>
            </Grid>

            {/* Text Content Section - RIGHT SIDE */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  pl: { lg: 4 }
                }}
              >
                <motion.div variants={itemVariants} style={{ width: '100%', display: 'flex', justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ width: 'fit-content', maxWidth: '100%' }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        p: { xs: 3, md: 4 },
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        width: 'fit-content', // Fix: Make width fit content
                        maxWidth: '100%', // Prevent overflow
                        mx: { xs: 'auto', lg: 0 }, // Center on mobile, left on desktop
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                          boxShadow: '0 20px 40px rgba(99, 102, 241, 0.1)',
                          '& .text-content': {
                            color: 'rgba(255, 255, 255, 0.95)',
                          },
                          '& .floating-words': {
                            opacity: 1,
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: '-100%',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
                          transition: 'left 0.5s ease',
                        },
                        '&:hover::before': {
                          left: '100%',
                        }
                      }}
                    >
                      {/* Floating Keywords */}
                      <Box
                        className="floating-words"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                          pointerEvents: 'none',
                          zIndex: 1,
                        }}
                      >
                        {['AI', 'ML', 'Innovation', 'Research'].map((word, i) => (
                          <motion.div
                            key={word}
                            style={{
                              position: 'absolute',
                              top: `${20 + i * 20}%`,
                              right: `${10 + i * 5}%`,
                            }}
                            animate={{
                              y: [-10, 10, -10],
                              opacity: [0.3, 0.7, 0.3],
                            }}
                            transition={{
                              duration: 3 + i * 0.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: i * 0.3,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#6366f1',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                textShadow: '0 2px 4px rgba(99, 102, 241, 0.3)',
                              }}
                            >
                              {word}
                            </Typography>
                          </motion.div>
                        ))}
                      </Box>
                      
                      {/* Main Text Content */}
                      <Typography
                        className="text-content"
                        variant="h6"
                        sx={{
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                          lineHeight: 1.8,
                          color: 'rgba(255, 255, 255, 0.9)',
                          textAlign: { xs: 'center', lg: 'left' },
                          maxWidth: { xs: '90vw', sm: '80vw', md: '70vw', lg: '55vw' }, // Responsive max width
                          width: 'fit-content', // Fix: Make width fit content
                          mx: { xs: 'auto', lg: 0 },
                          position: 'relative',
                          zIndex: 2,
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {ABOUT_TEXT}
                      </Typography>
                      
                      {/* Interactive Quote Mark */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: 16,
                          left: 16,
                          zIndex: 0,
                        }}
                        animate={{
                          rotate: [0, 5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Typography
                          variant="h1"
                          sx={{
                            fontSize: '4rem',
                            color: 'rgba(99, 102, 241, 0.1)',
                            fontFamily: 'serif',
                            lineHeight: 1,
                          }}
                        >
                          "
                        </Typography>
                      </motion.div>
                    </Paper>
                  </motion.div>
                </motion.div>
              </Box>
            </Grid>
          </Grid>

          {/* Professional Achievements Section */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mt: 8, mb: 6 }}>
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  mb: 6,
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Professional Achievements
              </Typography>
              
              <Grid container spacing={3} justifyContent="center">
                {statsData.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                      <Floating3DElement intensity={0.8} delay={stat.delay}>
                        <Card
                          sx={{
                            background: `linear-gradient(135deg, ${stat.color}25, ${stat.color}15)`,
                            border: `2px solid ${stat.color}40`,
                            borderRadius: '20px',
                            p: 3,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.4s ease',
                            height: '160px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${stat.color}35, ${stat.color}25)`,
                              border: `2px solid ${stat.color}70`,
                              boxShadow: `0 20px 40px ${stat.color}40`,
                              transform: 'translateY(-8px)',
                            },
                          }}
                        >
                          <IconComponent 
                            sx={{ 
                              color: stat.color, 
                              fontSize: { xs: 32, md: 36 }, 
                              mb: 1.5,
                              filter: 'drop-shadow(0 0 12px currentColor)',
                            }} 
                          />
                          <Typography
                            variant="h3"
                            sx={{
                              fontWeight: 800,
                              color: stat.color,
                              mb: 0.5,
                              fontSize: { xs: '2rem', md: '2.5rem' },
                              textShadow: `0 0 20px ${stat.color}50`
                            }}
                          >
                            {stat.displayValue}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.9)',
                              fontWeight: 600,
                              fontSize: { xs: '0.75rem', md: '0.85rem' },
                              textTransform: 'uppercase',
                              letterSpacing: 1
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Card>
                      </Floating3DElement>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </motion.div>
          
          {/* Bottom spacer to prevent cutoff */}
          <Box sx={{ height: { xs: 60, md: 80 } }} />
        </motion.div>
      </Container>
    </Box>
  );
};

export default React.memo(ModernAbout);
