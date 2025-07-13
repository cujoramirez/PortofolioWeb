import React, { useState, useRef, memo, lazy, Suspense, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Box, Container, Typography, Grid, Paper, Chip } from "@mui/material";
import { Code, Psychology, Science, Architecture, Speed, Memory } from "@mui/icons-material";
import { Canvas } from "@react-three/fiber";
import TechnologyCard from "./TechnologyCard";
import { technologies } from "./techData";
import useDeviceDetection from "./useDeviceDetection";
import { useSystemProfile } from './useSystemProfile';
import { SceneManager } from "./three/SceneManager.jsx";
import { TechConstellation } from "./three/InteractiveTechSphere.jsx";
import { EnterpriseMotion } from "./EnterpriseMotion.jsx";

// Lazy-load enhanced light effects only for desktop
const LightEffects = lazy(() => import("./LightEffects"));

const Technologies = () => {
  const { performanceTier, deviceType } = useSystemProfile();
  const { isMobile, isTablet, isIOSSafari } = useDeviceDetection();
  
  // Content readiness states - critical for iOS scroll fix
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);
  const containerRef = useRef(null);
  const isMountedRef = useRef(false);

  // Advanced scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [20, 0]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 1]); // Always visible
  
  // Flag to identify mobile/tablet devices for optimizations
  const isHandheld = useMemo(() => isMobile || isTablet, [isMobile, isTablet]);
  
  // Determine if we should use scroll trigger based on device and performance
  const shouldUseScrollTrigger = useMemo(() => 
    performanceTier !== "low" && !isIOSSafari && !isHandheld,
  [performanceTier, isIOSSafari, isHandheld]);
  
  // Make mobile/tablet content visible instantly, only delay desktop
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Make content visible immediately on mobile/tablet or iOS Safari
    if (isHandheld || isIOSSafari) {
      setContentReady(true);
      setAnimationsComplete(true); // Skip animation waiting period entirely
    } else {
      // Short delay for desktop only
      const timer = setTimeout(() => {
        if (isMountedRef.current) {
          setContentReady(true);
        }
      }, 200);
      
      // Ensure animations complete after a maximum time (desktop only)
      const animationTimer = setTimeout(() => {
        if (isMountedRef.current) {
          setAnimationsComplete(true);
        }
      }, 2000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
        isMountedRef.current = false;
      };
    }
  }, [isHandheld, isIOSSafari]);

  // Categories with enhanced icons and colors (DevOps removed)
  const categories = [
    { name: 'All', icon: Architecture, color: '#ffffff' },
    { name: 'AI/ML', icon: Psychology, color: '#6366f1' },
    { name: 'Frontend', icon: Code, color: '#22d3ee' },
    { name: 'Backend', icon: Memory, color: '#10b981' },
    { name: 'Other', icon: Science, color: '#8b5cf6' }
  ];

  // Filter technologies based on selected category
  const filteredTechnologies = selectedCategory === 'All' 
    ? technologies 
    : technologies.filter(tech => tech.category === selectedCategory);
  
  // iOS Safari scroll fix
  useEffect(() => {
    if (isIOSSafari) {
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflowY = 'auto';
      
      setTimeout(() => {
        window.scrollTo(0, window.scrollY + 1);
        setTimeout(() => window.scrollTo(0, window.scrollY - 1), 50);
      }, 100);
    }
    
    return () => {
      if (isIOSSafari) {
        document.body.style.overflow = '';
        document.body.style.overflowY = '';
        document.documentElement.style.overflowY = '';
      }
    };
  }, [isIOSSafari]);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="technologies"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2322d3ee" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(34, 211, 238, 0.15), transparent 50%)',
          animation: performanceTier !== 'low' ? 'backgroundPulse 8s ease-in-out infinite alternate' : 'none'
        }
      }}
    >
      {/* Enterprise 3D Technology Constellation */}
      {!isHandheld && performanceTier !== "low" && (
        <SceneManager>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.3,
              zIndex: 2,
              pointerEvents: 'auto'
            }}
          >
            <Suspense fallback={
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.8rem'
                }}
              >
                Loading 3D Scene...
              </Box>
            }>
              <Canvas 
                camera={{ position: [0, 0, 15], fov: 60 }}
                onCreated={({ gl }) => {
                  gl.setClearColor(0x000000, 0);
                }}
                gl={{ 
                  antialias: performanceTier !== 'low',
                  alpha: true,
                  preserveDrawingBuffer: false
                }}
                onError={(error) => {
                  console.warn('3D Canvas error:', error);
                }}
              >
                <Suspense fallback={null}>
                  <ambientLight intensity={0.2} />
                  <pointLight position={[10, 10, 10]} intensity={0.5} />
                  <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8b5cf6" />
                  
                  {/* Interactive technology constellation */}
                  {filteredTechnologies && filteredTechnologies.length > 0 && (
                    <TechConstellation 
                      technologies={filteredTechnologies.slice(0, 12)}
                      hoveredTech={hoveredTech}
                      setHoveredTech={setHoveredTech}
                    />
                  )}
                </Suspense>
              </Canvas>
            </Suspense>
          </Box>
        </SceneManager>
      )}

      {/* Enhanced background effects with floating particles */}
      {!isHandheld && performanceTier !== "low" && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              y: backgroundY
            }}
          >
            <Suspense fallback={null}>
              <LightEffects 
                hoveredTech={hoveredTech}
                hoveredTechRef={hoveredTechRef}
              />
            </Suspense>
          </motion.div>
          
          {/* Floating Particles */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '200%',
                height: '200%',
                background: `
                  radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
                `,
                animation: 'floatSlow 20s ease-in-out infinite'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '150%',
                height: '150%',
                background: `
                  radial-gradient(circle at 60% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 30% 30%, rgba(245, 101, 101, 0.06) 0%, transparent 30%)
                `,
                animation: 'floatReverse 15s ease-in-out infinite'
              }
            }}
          />
          
          {/* Animated Code Symbols */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              '& .floating-symbol': {
                position: 'absolute',
                color: 'rgba(99, 102, 241, 0.1)',
                fontSize: '2rem',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                animation: 'symbolFloat 8s ease-in-out infinite',
                pointerEvents: 'none'
              }
            }}
          >
            <Typography className="floating-symbol" sx={{ top: '10%', left: '5%', animationDelay: '0s' }}>{'<>'}</Typography>
            <Typography className="floating-symbol" sx={{ top: '20%', right: '8%', animationDelay: '1s' }}>{'{ }'}</Typography>
            <Typography className="floating-symbol" sx={{ top: '60%', left: '3%', animationDelay: '2s' }}>{'</>'}</Typography>
            <Typography className="floating-symbol" sx={{ bottom: '20%', right: '5%', animationDelay: '3s' }}>{'[ ]'}</Typography>
            <Typography className="floating-symbol" sx={{ bottom: '40%', left: '7%', animationDelay: '4s' }}>{'( )'}</Typography>
            <Typography className="floating-symbol" sx={{ top: '40%', right: '3%', animationDelay: '5s' }}>{'*'}</Typography>
          </Box>
        </>
      )}

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        {/* Enhanced Title with Gradient and Light Effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            textAlign: 'center',
            marginBottom: 48,
            paddingTop: 32,
            paddingBottom: 32,
            y: shouldUseScrollTrigger ? titleY : 0,
            opacity: 1 // Always visible
          }}
        >
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            {/* Main Title with Gradient */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3.5rem', md: '5rem', lg: '6rem' },
                fontWeight: 800,
                mb: 3,
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                position: 'relative',
                zIndex: 2,
                // Always ensure white text is visible first
                color: '#ffffff !important',
                // Progressive enhancement: add gradient if supported
                ...(typeof window !== 'undefined' && CSS.supports && CSS.supports('-webkit-background-clip', 'text') ? {
                  background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 25%, #6366f1 50%, #22d3ee 75%, #ffffff 100%)',
                  backgroundSize: '400% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: performanceTier !== 'low' && !isHandheld ? 'gradientFlow 8s ease-in-out infinite' : 'none'
                } : {}),
                // Enhanced fallbacks
                '@supports not (-webkit-background-clip: text)': {
                  background: 'none !important',
                  WebkitBackgroundClip: 'initial !important',
                  WebkitTextFillColor: 'initial !important',
                  color: '#ffffff !important'
                }
              }}
            >
              Skills & Technologies
            </Typography>

            {/* Animated Background Glow - Removed to fix white glowing bar */}
            {/* Background glow effects removed to prevent white glowing bar issue */}
          </Box>
          
          {/* Simple Elegant Divider */}
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 4,
                background: 'linear-gradient(90deg, transparent 0%, #6366f1 20%, #22d3ee 50%, #8b5cf6 80%, transparent 100%)',
                borderRadius: 2,
                opacity: 0.8
              }}
            />
          </Box>
        </motion.div>

        {/* Enhanced Category Navigation */}
        {categories && (
          <Box sx={{ mb: 6 }}>
            <Box 
              sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: { xs: 1.5, sm: 2 },
                px: { xs: 2, sm: 0 },
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              {categories.map((category, index) => {
                const IconComponent = category.icon;
                const isSelected = selectedCategory === category.name;
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      flex: { xs: '1 1 calc(50% - 6px)', sm: '0 1 auto' },
                      minWidth: { xs: 'calc(50% - 6px)', sm: '100px' },
                      maxWidth: { xs: 'calc(50% - 6px)', sm: '140px' }
                    }}
                  >
                    <Paper
                      onClick={() => setSelectedCategory(category.name)}
                      elevation={isSelected ? 12 : 4}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 3,
                        background: isSelected 
                          ? `linear-gradient(135deg, ${category.color}40, ${category.color}20)`
                          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                        backdropFilter: 'blur(10px)',
                        border: isSelected ? `2px solid ${category.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        width: '100%',
                        minHeight: { xs: '70px', sm: '80px' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': isSelected && performanceTier !== 'low' && !isHandheld ? {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                            background: `linear-gradient(45deg, transparent 30%, ${category.color}20 50%, transparent 70%)`,
                            animation: 'categoryShimmer 2s ease-in-out infinite',
                            zIndex: 0
                          } : {},
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)`,
                            boxShadow: `0 8px 32px ${category.color}30`
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: { xs: 1, sm: 2 },
                          flexDirection: { xs: 'column', sm: 'row' },
                          position: 'relative',
                          zIndex: 1
                        }}>
                          <IconComponent 
                            sx={{ 
                              color: isSelected ? category.color : 'rgba(255, 255, 255, 0.7)',
                              fontSize: { xs: 24, sm: 28 },
                              transition: 'all 0.3s ease',
                              filter: isSelected ? `drop-shadow(0 0 8px ${category.color}50)` : 'none'
                            }} 
                          />
                          <Typography
                            variant="h6"
                            sx={{
                              color: isSelected ? 'white' : 'rgba(255, 255, 255, 0.8)',
                              fontWeight: isSelected ? 700 : 500,
                              fontSize: { xs: '0.8rem', sm: '1.25rem' },
                              transition: 'all 0.3s ease',
                              textAlign: 'center',
                              textShadow: isSelected ? `0 0 8px ${category.color}50` : 'none'
                            }}
                          >
                            {category.name}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Technologies Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Grid container spacing={3} justifyContent="center">
              {filteredTechnologies.map((tech, index) => (
                <Grid 
                  size={{ xs: 6, sm: 4, md: 3, lg: 2.4, xl: 2 }} 
                  key={tech.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <TechnologyCard
                    tech={tech}
                    index={index}
                    hoveredTech={hoveredTech}
                    setHoveredTech={setHoveredTech}
                    hoveredTechRef={hoveredTechRef}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isIOSSafari={isIOSSafari}
                    reducedMotion={isHandheld}
                    contentReady={contentReady || animationsComplete}
                    performanceTier={performanceTier}
                    useStaticStyles={isHandheld}
                  />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </AnimatePresence>
      </Container>

      {/* Advanced CSS Animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes backgroundPulse {
          0% { opacity: 0.5; transform: scale(1); }
          100% { opacity: 0.8; transform: scale(1.1); }
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }

        @keyframes titleGlow {
          0% { 
            opacity: 0.8;
            transform: scale(1);
            filter: blur(3px);
          }
          50% { 
            opacity: 1;
            transform: scale(1.02);
            filter: blur(5px);
          }
          100% { 
            opacity: 0.8;
            transform: scale(1);
            filter: blur(3px);
          }
        }

        @keyframes titlePulse {
          0% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1.05);
          }
          100% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes dividerGlow {
          0% { 
            opacity: 0.6;
            filter: blur(8px);
          }
          100% { 
            opacity: 1;
            filter: blur(12px);
          }
        }

        @keyframes dividerPulse {
          0% { 
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1.1);
          }
          100% { 
            opacity: 0.1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes floatSlow {
          0% { 
            transform: translate(0%, 0%) rotate(0deg);
            opacity: 0.3;
          }
          33% { 
            transform: translate(2%, -2%) rotate(120deg);
            opacity: 0.5;
          }
          66% { 
            transform: translate(-1%, 1%) rotate(240deg);
            opacity: 0.3;
          }
          100% { 
            transform: translate(0%, 0%) rotate(360deg);
            opacity: 0.3;
          }
        }

        @keyframes floatReverse {
          0% { 
            transform: translate(0%, 0%) rotate(0deg);
            opacity: 0.2;
          }
          50% { 
            transform: translate(-3%, 2%) rotate(-180deg);
            opacity: 0.4;
          }
          100% { 
            transform: translate(0%, 0%) rotate(-360deg);
            opacity: 0.2;
          }
        }

        @keyframes symbolFloat {
          0% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          25% { 
            transform: translateY(-10px) rotate(90deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.2;
          }
          75% { 
            transform: translateY(-10px) rotate(270deg);
            opacity: 0.3;
          }
          100% { 
            transform: translateY(0px) rotate(360deg);
            opacity: 0.1;
          }
        }

        @keyframes categoryShimmer {
          0% { 
            transform: translateX(-100%);
            opacity: 0;
          }
          50% { 
            transform: translateX(0%);
            opacity: 1;
          }
          100% { 
            transform: translateX(100%);
            opacity: 0;
          }
        }

        /* Enhanced 3D perspective for better depth */
        .tech-grid {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        /* Hardware acceleration */
        .floating-card {
          transform: translate3d(0, 0, 0);
          will-change: transform;
        }

        /* Reduced motion fallbacks */
        @media (prefers-reduced-motion: reduce) {
          .floating-symbol,
          [style*="animation"] {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default memo(Technologies);