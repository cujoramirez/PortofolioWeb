import React, { useEffect, useState, useRef, Suspense } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { 
  Box, 
  Typography, 
  Container, 
  Chip, 
  IconButton,
  Fade,
  Grow,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { 
  PlayArrow,
  Pause,
  VolumeOff,
  VolumeUp,
  Download,
  GitHub,
  LinkedIn,
  Email
} from "@mui/icons-material";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import EnterpriseSceneManager, { useSceneManager } from "./three/EnterpriseSceneManager.jsx";
import HeroScene3D from "./three/HeroScene3D.jsx";
import { EnterpriseMotion } from "./animations/EnterpriseMotion.jsx";
import heroImg from "../assets/GadingAdityaPerdana.jpg";
import resumePDF from "../assets/Gading_Resume.pdf";

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

// Animated 3D sphere component with enterprise enhancement
const AnimatedSphere = ({ position = [0, 0, 0] }) => {
  const meshRef = useRef();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Wait for the component to be fully rendered before starting animation
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isReady) return;
    
    let animationId;
    const animate = () => {
      if (meshRef.current && meshRef.current.rotation) {
        meshRef.current.rotation.x += 0.005; // Reduced speed
        meshRef.current.rotation.y += 0.003; // Reduced speed
      }
      animationId = requestAnimationFrame(animate);
    };
    
    if (meshRef.current) {
      animate();
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isReady]);

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} position={position}>
      <MeshDistortMaterial
        color="#6366f1"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0}
        metalness={0.8}
      />
    </Sphere>
  );
};

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            y: [null, -100, -200],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// Modern Hero Section with Enterprise 3D Integration
const ModernHero = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { performanceTier, deviceType } = useSystemProfile();
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const theme = useTheme();
  
  // Scene management integration
  const sceneManager = useSceneManager();
  const isInView = useInView(heroRef, { threshold: 0.3 });
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const shouldReduceMotion = performanceTier === "low" || isMobile;

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Spring animations for smooth motion
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  // Enhanced typing animation with more dynamic effects
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [cursor, setCursor] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: -30 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

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
      {/* Enhanced 3D Background with Enterprise Scene Manager */}
      {!isMobile && !shouldReduceMotion && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.8,
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          <Suspense fallback={<div className="loading-3d">Loading 3D Scene...</div>}>
            <Canvas
              camera={{ position: [0, 0, 10], fov: 75 }}
              gl={{ 
                antialias: false, 
                alpha: true,
                powerPreference: "default"
              }}
              style={{ pointerEvents: 'none' }}
            >
              <HeroScene3D
                mousePosition={sceneManager.mousePosition}
                scrollProgress={sceneManager.scrollProgress}
                isVisible={isInView}
              />
            </Canvas>
          </Suspense>
        </Box>
      )}

      {/* Animated Background Particles for Mobile/Low Performance */}
      {(isMobile || shouldReduceMotion) && <FloatingParticles />}

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
                        variants={itemVariants}
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
                  {/* Glowing background */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -4,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                      borderRadius: '2rem',
                      filter: 'blur(20px)',
                      opacity: 0.7,
                      animation: shouldReduceMotion ? 'none' : 'pulse 3s ease-in-out infinite alternate'
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
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transform: 'perspective(1000px) rotateY(-5deg)',
                    }}
                  >
                    <img
                      src={heroImg}
                      alt="Gading Aditya Perdana"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '2rem',
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

                  {/* Decorative elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                      animation: shouldReduceMotion ? 'none' : 'bounce-subtle 2s ease-in-out infinite'
                    }}
                  />
                  
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -10,
                      left: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                      animation: shouldReduceMotion ? 'none' : 'float 4s ease-in-out infinite'
                    }}
                  />
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

