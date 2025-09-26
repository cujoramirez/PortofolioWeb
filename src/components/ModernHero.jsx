import React, { useEffect, useState, useRef, Suspense, lazy, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, useReducedMotion } from "framer-motion";
import { 
  Box, 
  Typography, 
  Container, 
  Chip, 
  IconButton,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { 
  Download,
  GitHub,
  LinkedIn,
  Email
} from "@mui/icons-material";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import { EnterpriseMotion } from "./animations/EnterpriseMotion.jsx";
import heroImg from "../assets/GadingAdityaPerdana.jpg";
import resumePDF from "../assets/Gading_Resume.pdf";

// Optimized 3D constants - now enabled everywhere with smart optimizations
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const ENABLE_3D = true; // Re-enabled with heavy optimizations

// Dynamic imports with Vercel-optimized chunks
const Canvas = lazy(() => 
  import("@react-three/fiber")
    .then(module => ({ default: module.Canvas }))
    .catch(() => ({ default: () => null })) // Graceful fallback
);

const HeroScene3D = lazy(() => 
  import("./three/HeroScene3D.jsx")
    .catch(() => ({ default: () => null })) // Graceful fallback
);

// Preload critical resources on interaction
const preloadResources = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import("@react-three/fiber");
      import("./three/HeroScene3D.jsx");
    });
  }
};

// Professional roles array defined outside component to prevent recreation
const TYPING_ROLES = [
  "AI/ML Engineer",
  "Machine Learning Architect", 
  "Computer Vision Specialist",
  "Deep Learning Engineer",
  "AI Solutions Developer",
  "Neural Network Architect",
  "Data Science Engineer",
  "AI Research Engineer"
];

// Ultra-lightweight CSS particles with GPU acceleration
const OptimizedParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 2.5,
      left: 20 + (i * 15) % 80,
      duration: 15 + (i * 3)
    })), []
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: `${particle.left}%`,
            bottom: 0,
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #6366f1, #22d3ee)',
            transform: 'translateZ(0)', // Force GPU layer
            animation: `float-up-${particle.id} ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            [`@keyframes float-up-${particle.id}`]: {
              '0%': {
                transform: 'translateY(0) translateZ(0)',
                opacity: 0,
              },
              '10%': {
                opacity: 0.8,
              },
              '90%': {
                opacity: 0.4,
              },
              '100%': {
                transform: 'translateY(-100vh) translateZ(0)',
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
};

// Optimized Modern Hero Section with advanced memory management
const ModernHero = () => {
  const { performanceTier, deviceType } = useSystemProfile();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const glCleanupRef = useRef(null);
  const theme = useTheme();
  const prefersReducedMotion = useReducedMotion();
  
  // Advanced intersection observer with memory cleanup
  const isInView = useInView(heroRef, { 
    threshold: 0.1, 
    margin: "100px",
    once: false // Allow re-triggering for memory management
  });
  
  // Optimized media query calculations
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const shouldReduceMotion = useMemo(() => 
    performanceTier === "low" || isMobile || prefersReducedMotion,
    [performanceTier, isMobile, prefersReducedMotion]
  );
  const canRender3D = useMemo(() =>
    ENABLE_3D && performanceTier !== "low" && deviceType !== "mobile" && !prefersReducedMotion,
    [performanceTier, deviceType, prefersReducedMotion]
  );
  const lowPower3D = useMemo(() => 
    performanceTier !== "high" || isTablet,
    [performanceTier, isTablet]
  );

  const pixelRatio = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    return Math.min(window.devicePixelRatio || 1, 2);
  }, []);
  
  // Smart 3D loading with memory management
  const [show3D, setShow3D] = useState(false);
  
  useEffect(() => {
    if (!ENABLE_3D) return;

    if (canRender3D && isInView) {
      const timer = setTimeout(() => setShow3D(true), show3D ? 0 : 300);
      return () => clearTimeout(timer);
    }

    if (!isInView && show3D) {
      setShow3D(false);
    }
  }, [canRender3D, isInView, show3D]);

  useEffect(() => {
    if (!show3D && glCleanupRef.current) {
      glCleanupRef.current();
      glCleanupRef.current = null;
    }
  }, [show3D]);

  useEffect(() => () => {
    if (glCleanupRef.current) {
      glCleanupRef.current();
      glCleanupRef.current = null;
    }
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Spring animations for smooth motion
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  // Optimized typing animation with better performance
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cursor, setCursor] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  // Preload resources on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      preloadResources();
      document.removeEventListener('mouseenter', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    document.addEventListener('mouseenter', handleUserInteraction, { once: true, passive: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });
    
    return () => {
      document.removeEventListener('mouseenter', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Enhanced cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursor(prev => !prev);
    }, isPaused ? 300 : 530);
    
    return () => clearInterval(cursorInterval);
  }, [isPaused]);

  // Enhanced typing animation with variable speed and natural pauses
  useEffect(() => {
    let timeout;
    const currentText = TYPING_ROLES[currentRole];
    
    if (isTyping) {
      if (displayText.length < currentText.length) {
        // Variable typing speed for more natural feel
        const typingSpeed = Math.random() * 60 + 40; // 40-100ms
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Pause at end of word with longer delay
        setIsPaused(true);
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsPaused(false);
        }, 2500 + Math.random() * 1500); // 2.5-4s pause
      }
    } else {
      if (displayText.length > 0) {
        // Variable deletion speed
        const deleteSpeed = Math.random() * 30 + 25; // 25-55ms
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Brief pause before next role
        timeout = setTimeout(() => {
          setCurrentRole((prev) => (prev + 1) % TYPING_ROLES.length);
          setIsTyping(true);
        }, 300);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentRole, isPaused]);

  // Memoized animation variants for performance
  const animationVariants = useMemo(() => ({
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: shouldReduceMotion ? 0 : 0.2,
          delayChildren: shouldReduceMotion ? 0 : 0.3,
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduceMotion ? 0.3 : 0.8,
          ease: "easeOut"
        }
      }
    },
    image: {
      hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.8, rotateY: shouldReduceMotion ? 0 : -30 },
      visible: {
        opacity: 1,
        scale: 1,
        rotateY: 0,
        transition: {
          duration: shouldReduceMotion ? 0.5 : 1.2,
          ease: "easeOut"
        }
      }
    },
    float: shouldReduceMotion ? {} : {
      animate: {
        y: [-10, 10, -10],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  }), [shouldReduceMotion]);

  // Performance monitoring for Vercel
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window && isInView) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name.includes('hero') && entry.duration > 100) {
            console.warn('Hero performance issue:', entry.name, entry.duration);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (e) {
        // Fallback for older browsers
      }
      
      return () => observer.disconnect();
    }
  }, [isInView]);

  return (
    <Box
      ref={heroRef}
      component="section"
      id="hero"
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3Cpath d="M30 1v28m0 2v28M1 30h28m2 0h28"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      {/* Ultra-Optimized 3D Background - Lightweight & Fast */}
      {ENABLE_3D && show3D && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: shouldReduceMotion ? 0.3 : 0.5,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <Suspense fallback={<OptimizedParticles />}>
            <Canvas
              camera={{ 
                position: [0, 0, 8],
                fov: lowPower3D ? 52 : 65,
                near: 1,
                far: 20
              }}
              gl={{ 
                antialias: false,
                alpha: true,
                powerPreference: "low-power",
                precision: "lowp",
                stencil: false,
                depth: false,
                preserveDrawingBuffer: false,
                logarithmicDepthBuffer: false
              }}
              dpr={[1, lowPower3D ? 1.25 : pixelRatio]}
              style={{ pointerEvents: 'none' }}
              frameloop={lowPower3D ? "demand" : "always"}
              performance={{ 
                min: 0.05,
                max: lowPower3D ? 0.5 : 0.8
              }}
              onCreated={({ gl }) => {
                // Additional optimizations
                if (glCleanupRef.current) {
                  glCleanupRef.current();
                }
                gl.setClearColor(0x000000, 0);
                gl.setPixelRatio(lowPower3D ? 1 : pixelRatio);
                glCleanupRef.current = () => {
                  gl.dispose();
                  if (typeof gl.forceContextLoss === 'function') {
                    gl.forceContextLoss();
                  }
                };
              }}
            >
              <HeroScene3D 
                lowPerformanceMode={lowPower3D}
                reducedMotion={shouldReduceMotion}
              />
            </Canvas>
          </Suspense>
        </Box>
      )}

      {/* Optimized particles for all devices */}
      <OptimizedParticles />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <EnterpriseMotion.HeroContainer>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 6, lg: 8 },
              alignItems: 'center',
              py: { xs: 8, md: 12 }
            }}
          >
            {/* Content Section */}
            <Box sx={{ order: { xs: 2, lg: 1 } }}>
              <EnterpriseMotion.HeroSubtitle>
                <Chip
                  label="Welcome to my portfolio"
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.2))',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    color: '#6366f1',
                    fontWeight: 500
                  }}
                />
              </EnterpriseMotion.HeroSubtitle>

              <EnterpriseMotion.HeroTitle>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 700,
                    mb: 2,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.1,
                    textShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
                    filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))',
                  }}
                >
                  Gading Aditya
                  <br />
                  Perdana
                </Typography>
              </EnterpriseMotion.HeroTitle>

              <EnterpriseMotion.HeroSubtitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 500,
                      color: '#d4d4d4'
                    }}
                  >
                    I'm a{" "}
                  </Typography>
                  <Typography
                    variant="h4"
                    component={motion.span}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 600,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #22d3ee, #6366f1)',
                      backgroundSize: '300% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      minWidth: { xs: '200px', md: '300px' },
                      textAlign: 'left',
                      position: 'relative',
                      display: 'inline-block'
                    }}
                  >
                    {displayText}
                    <motion.span
                      animate={{ opacity: cursor ? 1 : 0 }}
                      style={{ 
                        marginLeft: '2px',
                        color: '#6366f1',
                        fontWeight: 'normal'
                      }}
                    >
                      |
                    </motion.span>
                  </Typography>
                </Box>
              </EnterpriseMotion.HeroSubtitle>

              <EnterpriseMotion.HeroSubtitle>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.6,
                    color: '#d4d4d4',
                    mb: 4,
                    maxWidth: '600px'
                  }}
                >
                  Passionate about advancing artificial intelligence through innovative research 
                  and practical applications. Specializing in computer vision, machine learning, 
                  and creating intelligent systems that solve real-world problems.
                </Typography>
              </EnterpriseMotion.HeroSubtitle>

              <EnterpriseMotion.HeroButton>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => {
                      document.getElementById('projects')?.scrollIntoView({ 
                        behavior: shouldReduceMotion ? 'auto' : 'smooth' 
                      });
                    }}
                  >
                    View My Work
                  </motion.button>
                  
                  <motion.button
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      borderRadius: '12px',
                      padding: '16px 32px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => {
                      // Open resume in new tab for viewing
                      const newWindow = window.open(resumePDF, '_blank');
                      
                      // Add download functionality to the new window
                      if (newWindow) {
                        newWindow.addEventListener('load', () => {
                          // Create download button in the new window if desired
                          const style = newWindow.document.createElement('style');
                          style.textContent = `
                            .resume-download-btn {
                              position: fixed;
                              top: 20px;
                              right: 20px;
                              z-index: 9999;
                              background: #6366f1;
                              color: white;
                              border: none;
                              padding: 12px 24px;
                              border-radius: 8px;
                              cursor: pointer;
                              font-weight: 600;
                              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                              transition: all 0.3s ease;
                            }
                            .resume-download-btn:hover {
                              background: #4f46e5;
                              transform: translateY(-2px);
                              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                            }
                          `;
                          newWindow.document.head.appendChild(style);
                          
                          const downloadBtn = newWindow.document.createElement('button');
                          downloadBtn.textContent = '📥 Download Resume';
                          downloadBtn.className = 'resume-download-btn';
                          downloadBtn.onclick = () => {
                            const link = newWindow.document.createElement('a');
                            link.href = resumePDF;
                            link.download = 'Gading_Aditya_Perdana_Resume.pdf';
                            link.click();
                          };
                          newWindow.document.body.appendChild(downloadBtn);
                        });
                      }
                    }}
                  >
                    <Download sx={{ fontSize: 18 }} />
                    View Resume
                  </motion.button>

                  {/* Social Links */}
                  <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                    {[
                      { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
                      { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
                      { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' }
                    ].map((social, index) => (
                      <motion.div
                        key={social.label}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.2, y: -3 }}
                        whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                      >
                        <IconButton
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              color: '#6366f1',
                              background: 'rgba(99, 102, 241, 0.1)',
                              borderColor: 'rgba(99, 102, 241, 0.3)',
                              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                            }
                          }}
                        >
                          <social.icon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </EnterpriseMotion.HeroButton>

              {/* Skill Tags */}
              <EnterpriseMotion.HeroSubtitle>
                <Box sx={{ mt: 6 }}>
                  <Typography variant="overline" sx={{ color: '#d4d4d4', mb: 2, display: 'block' }}>
                    Core Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[
                      'Machine Learning',
                      'Computer Vision', 
                      'Deep Learning',
                      'Python',
                      'TensorFlow',
                      'PyTorch'
                    ].map((skill, index) => (
                      <motion.div
                        key={skill}
                        variants={animationVariants.item}
                        whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -2 }}
                      >
                        <Chip
                          label={skill}
                          sx={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#6366f1',
                            '&:hover': {
                              background: 'rgba(99, 102, 241, 0.2)',
                              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                            }
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </EnterpriseMotion.HeroSubtitle>
            </Box>

            {/* Image Section */}
            <Box sx={{ order: { xs: 1, lg: 2 }, display: 'flex', justifyContent: 'center' }}>
              <EnterpriseMotion.AboutImage>
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 280, md: 350, lg: 400 },
                    height: { xs: 350, md: 420, lg: 480 },
                  }}
                >
                  {/* Optimized glowing background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -2,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                      borderRadius: '2rem',
                      filter: 'blur(12px)',
                      opacity: shouldReduceMotion ? 0.4 : 0.6,
                      animation: shouldReduceMotion ? 'none' : 'pulse 4s ease-in-out infinite alternate'
                    }}
                  />
                  
                  {/* Main image container */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '2rem',
                      overflow: 'hidden',
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: shouldReduceMotion ? 'blur(8px)' : 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      transform: 'perspective(1000px) rotateY(-5deg)',
                    }}
                  >
                    <img
                      src={heroImg}
                      alt="Gading Aditya Perdana - AI/ML Engineer"
                      loading="eager"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '2rem',
                        willChange: shouldReduceMotion ? 'auto' : 'transform',
                        transform: 'translateZ(0)', // Force GPU layer
                      }}
                      onLoad={(e) => {
                        // Optimize image rendering
                        e.target.style.imageRendering = 'optimizeQuality';
                      }}
                    />
                    
                    {/* Overlay gradient */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(34, 211, 238, 0.1) 100%)',
                        borderRadius: '2rem',
                      }}
                    />
                  </Box>

                  {/* Simplified decorative element */}
                  {!shouldReduceMotion && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -15,
                        right: -15,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                        animation: 'pulse 3s ease-in-out infinite alternate',
                        opacity: 0.8
                      }}
                    />
                  )}
                </Box>
              </EnterpriseMotion.AboutImage>
            </Box>
          </Box>
        </EnterpriseMotion.HeroContainer>
      </Container>


    </Box>
  );
};

export default ModernHero;

