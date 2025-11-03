import {
  useEffect,
  useRef,
  useState,
  Suspense,
  lazy,
  useMemo,
  type ElementType,
  type SyntheticEvent,
  type ComponentType,
  type PropsWithChildren,
  type RefObject,
  type FC,
} from 'react';
import { motion, useInView, type HTMLMotionProps } from 'framer-motion';
import {
  Box,
  Typography,
  Container,
  Chip,
  IconButton,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import { Download, GitHub, LinkedIn, Email } from '@mui/icons-material';
import type { WebGLRenderer } from 'three';
import { useSystemProfile } from './useSystemProfile';
import { EnterpriseMotion } from './animations/EnterpriseMotion';
import { useReducedMotionOverride } from '../hooks/useReducedMotionOverride';
import RotatingText from './RotatingText';
import heroImg from '../assets/GadingAdityaPerdana.jpg';
import resumePDF from '../assets/Gading_Resume.pdf';
import ProfileCard from './ProfileCard';
import { useLenis } from '../hooks/useLenis';
import ScrollFloat from './ScrollFloat';

const ENABLE_3D = true;

const Canvas = lazy(() =>
  import('@react-three/fiber').then((module) => ({ default: module.Canvas })),
);

const HeroScene3D = lazy(() =>
  import('./three/HeroScene3D').then((module) => ({ default: module.default })),
);

const TYPING_ROLES = [
  'AI/ML Engineer',
  'Machine Learning Architect',
  'Computer Vision Specialist',
  'Deep Learning Engineer',
  'AI Solutions Developer',
  'Neural Network Architect',
  'Data Science Engineer',
  'AI Research Engineer',
];

const SOCIAL_LINKS: Array<{ icon: ElementType; url: string; label: string }> = [
  { icon: GitHub, url: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: LinkedIn, url: 'https://www.linkedin.com/in/gadingadityaperdana/', label: 'LinkedIn' },
  { icon: Email, url: 'mailto:gadingadityaperdana@gmail.com', label: 'Email' },
];

const SKILLS = [
  'Machine Learning',
  'Computer Vision',
  'Deep Learning',
  'Python',
  'TensorFlow',
  'PyTorch',
] as const;

type Particle = {
  id: number;
  delay: number;
  left: number;
  duration: number;
};

type CleanupFn = () => void;

const preloadResources = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const run = () => {
    void import('@react-three/fiber');
    void import('./three/HeroScene3D');
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(run);
  } else {
    window.setTimeout(run, 0);
  }
};

const OptimizedParticles = () => {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: 5 }, (_, index) => ({
        id: index,
        delay: index * 2.5,
        left: 20 + ((index * 15) % 80),
        duration: 15 + index * 3,
      })),
    [],
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
            transform: 'translateZ(0)',
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

const ModernHero = () => {
  const { performanceTier, deviceType } = useSystemProfile();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const glCleanupRef = useRef<CleanupFn | null>(null);
  const activationTimeoutRef = useRef<number | null>(null);
  const theme = useTheme();
  const { lenis } = useLenis();
  const prefersReducedMotion = useReducedMotionOverride();
  
  // Mouse tracking for 3D magnetism effect
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const pendingMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseUpdateRafRef = useRef<number | null>(null);

  const motionComponents = EnterpriseMotion as Record<
    string,
    ComponentType<PropsWithChildren<Record<string, unknown>>>
  >;

  const HeroContainer = motionComponents.HeroContainer;
  const HeroSubtitle = motionComponents.HeroSubtitle;
  const HeroTitle = motionComponents.HeroTitle;
  const HeroButton = motionComponents.HeroButton;
  const AboutImage = motionComponents.AboutImage;
  const MotionButton = motion(Button);

  const isInView = useInView(heroRef as unknown as RefObject<Element>, {
    amount: 0.1,
    margin: '100px',
    once: false,
  });

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const shouldReduceMotion = useMemo(
    () => performanceTier === 'low' || isMobile || prefersReducedMotion,
    [performanceTier, isMobile, prefersReducedMotion],
  );

  const shouldReduceTextMotion = useMemo(
    () => performanceTier === 'low' || prefersReducedMotion,
    [performanceTier, prefersReducedMotion],
  );

  const canRender3D = useMemo(
    () => ENABLE_3D && performanceTier !== 'low' && deviceType !== 'mobile' && !prefersReducedMotion,
    [deviceType, performanceTier, prefersReducedMotion],
  );

  const lowPower3D = useMemo(
    () => performanceTier !== 'high' || isTablet,
    [performanceTier, isTablet],
  );

  const pixelRatio = useMemo(() => {
    if (typeof window === 'undefined') {
      return 1;
    }

    return Math.min(window.devicePixelRatio ?? 1, 2);
  }, []);

  const canvasFrameloop = useMemo<'always' | 'demand'>(
    () => (lowPower3D || !isInView ? 'demand' : 'always'),
    [isInView, lowPower3D],
  );

  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (!ENABLE_3D) {
      return;
    }

    if (activationTimeoutRef.current !== null) {
      window.clearTimeout(activationTimeoutRef.current);
      activationTimeoutRef.current = null;
    }

    if (canRender3D && isInView && !show3D) {
      activationTimeoutRef.current = window.setTimeout(() => {
        setShow3D(true);
        activationTimeoutRef.current = null;
      }, 300);
    }

    return () => {
      if (activationTimeoutRef.current !== null) {
        window.clearTimeout(activationTimeoutRef.current);
        activationTimeoutRef.current = null;
      }
    };
  }, [canRender3D, isInView, show3D]);

  useEffect(
    () => () => {
      if (glCleanupRef.current) {
        glCleanupRef.current();
        glCleanupRef.current = null;
      }

      if (activationTimeoutRef.current !== null) {
        window.clearTimeout(activationTimeoutRef.current);
        activationTimeoutRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    if (!canRender3D && glCleanupRef.current) {
      glCleanupRef.current();
      glCleanupRef.current = null;
    }
  }, [canRender3D]);
  
  // Track mouse position for 3D magnetism effect
  useEffect(() => {
    if (!canRender3D || prefersReducedMotion) {
      return undefined;
    }

    const updateMousePosition = () => {
      mousePositionRef.current.x = pendingMousePositionRef.current.x;
      mousePositionRef.current.y = pendingMousePositionRef.current.y;
      mouseUpdateRafRef.current = null;
    };

    const handleMouseMove = (event: MouseEvent) => {
      const normalizedX = (event.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (event.clientY / window.innerHeight) * 2 - 1;
      pendingMousePositionRef.current.x = normalizedX;
      pendingMousePositionRef.current.y = normalizedY;

      if (mouseUpdateRafRef.current === null) {
        mouseUpdateRafRef.current = window.requestAnimationFrame(updateMousePosition);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseUpdateRafRef.current !== null) {
        window.cancelAnimationFrame(mouseUpdateRafRef.current);
        mouseUpdateRafRef.current = null;
      }
    };
  }, [canRender3D, prefersReducedMotion]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleUserInteraction = () => {
      preloadResources();
      document.removeEventListener('mouseenter', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('mouseenter', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true, passive: true });

    return () => {
      document.removeEventListener('mouseenter', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  const animationVariants = useMemo(
    () => ({
      container: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.2,
            delayChildren: shouldReduceMotion ? 0 : 0.3,
          },
        },
      },
      item: {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: shouldReduceMotion ? 0.3 : 0.8,
            ease: 'easeOut',
          },
        },
      },
      image: {
        hidden: {
          opacity: 0,
          scale: shouldReduceMotion ? 1 : 0.8,
          rotateY: shouldReduceMotion ? 0 : -30,
        },
        visible: {
          opacity: 1,
          scale: 1,
          rotateY: 0,
          transition: {
            duration: shouldReduceMotion ? 0.5 : 1.2,
            ease: 'easeOut',
          },
        },
      },
      float: shouldReduceMotion
        ? {}
        : {
            animate: {
              y: [-10, 10, -10],
              transition: {
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            },
          },
    }),
    [shouldReduceMotion],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined' || !isInView) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name.includes('hero') && entry.duration > 100) {
          console.warn('Hero performance issue detected:', entry.name, entry.duration);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    } catch (error) {
      console.debug('PerformanceObserver unavailable for this browser:', error);
    }

    return () => observer.disconnect();
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
        background:
          'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3Cpath d="M30 1v28m0 2v28M1 30h28m2 0h28"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        },
      }}
    >
      {ENABLE_3D && show3D && canRender3D && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: shouldReduceMotion ? 0.3 : 0.5,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <Suspense fallback={<OptimizedParticles />}>
            <Canvas
              camera={{
                position: [0, 0, 8],
                fov: lowPower3D ? 52 : 65,
                near: 1,
                far: 20,
              }}
              gl={{
                antialias: false,
                alpha: true,
                powerPreference: 'low-power',
                precision: 'lowp',
                stencil: false,
                depth: false,
                preserveDrawingBuffer: false,
                logarithmicDepthBuffer: false,
              }}
              dpr={[1, lowPower3D ? 1.25 : pixelRatio]}
              style={{ pointerEvents: 'none' }}
              frameloop={canvasFrameloop}
              performance={{
                min: 0.05,
                max: lowPower3D ? 0.5 : 0.8,
              }}
              onCreated={({ gl }) => {
                const renderer = gl as WebGLRenderer;
                const nextCleanup: CleanupFn = () => {
                  renderer.dispose();
                };

                glCleanupRef.current?.();
                glCleanupRef.current = nextCleanup;

                renderer.setClearColor(0x000000, 0);
                renderer.setPixelRatio(lowPower3D ? 1 : pixelRatio);
              }}
            >
              <HeroScene3D 
                lowPerformanceMode={lowPower3D} 
                reducedMotion={shouldReduceMotion}
                mousePositionRef={mousePositionRef}
              />
            </Canvas>
          </Suspense>
        </Box>
      )}

      <OptimizedParticles />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <HeroContainer>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
              gap: { xs: 6, lg: 8 },
              alignItems: 'center',
              py: { xs: 8, md: 12 },
            }}
          >
            <Box sx={{ order: { xs: 2, lg: 1 } }}>
      

              <HeroTitle>
                <ScrollFloat
                  as="h1"
                  containerClassName="my-0"
                  containerStyle={{ marginBottom: theme.spacing(2) }}
                  textClassName="font-extrabold tracking-tight"
                  immediate
                  delay={isMobile ? 3.55 : 4.8}
                  textStyle={{
                    fontSize: 'clamp(3.2rem, 6.8vw, 4.8rem)',
                    background: 'linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1.1,
                    display: 'inline-block',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {`Gading Aditya\nPerdana`}
                </ScrollFloat>
              </HeroTitle>

              <HeroSubtitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 500,
                      color: '#d4d4d4',
                    }}
                  >
                    I'm a{' '}
                  </Typography>
                  <Typography
                    variant="h4"
                    component={motion.span}
                    animate={{
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    sx={{
                      fontSize: { xs: '1.5rem', md: '2rem' },
                      fontWeight: 600,
                      background:
                        'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #22d3ee, #6366f1)',
                      backgroundSize: '300% 100%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      color: 'transparent',
                      minWidth: { xs: '200px', md: '300px' },
                      textAlign: 'left',
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    <RotatingText
                      texts={TYPING_ROLES}
                      rotationInterval={shouldReduceTextMotion ? 6500 : 5200}
                      staggerDuration={shouldReduceTextMotion ? 0 : 0.08}
                      staggerFrom="first"
                      transition={{
                        type: 'spring',
                        damping: 24,
                        stiffness: 220,
                      }}
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-105%', opacity: 0 }}
                      auto={!shouldReduceTextMotion}
                      loop
                      mainStyle={{
                        display: 'inline-flex',
                        minWidth: 'clamp(200px, 35vw, 320px)',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        background: 'inherit',
                        WebkitBackgroundClip: 'inherit',
                        WebkitTextFillColor: 'inherit',
                        backgroundClip: 'inherit',
                        color: 'inherit',
                      }}
                      splitLevelStyle={{
                        display: 'inline-flex',
                        background: 'inherit',
                        WebkitBackgroundClip: 'inherit',
                        WebkitTextFillColor: 'inherit',
                        backgroundClip: 'inherit',
                        color: 'inherit',
                      }}
                      elementLevelStyle={{
                        display: 'inline-block',
                        background: 'inherit',
                        WebkitBackgroundClip: 'inherit',
                        WebkitTextFillColor: 'inherit',
                        backgroundClip: 'inherit',
                        color: 'inherit',
                      }}
                    />
                  </Typography>
                </Box>
              </HeroSubtitle>

              <HeroSubtitle>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    lineHeight: 1.6,
                    color: '#d4d4d4',
                    mb: 4,
                    maxWidth: '600px',
                  }}
                >
                  Passionate about advancing artificial intelligence through innovative research
                  and practical applications. Specializing in computer vision, machine learning,
                  and creating intelligent systems that solve real-world problems.
                </Typography>
              </HeroSubtitle>

              <HeroButton>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <MotionButton
                    whileHover={shouldReduceMotion ? {} : { 
                      scale: 1.05, 
                      y: -2,
                      transition: { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 }
                    }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                    disableElevation
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      borderRadius: '12px',
                      px: 4,
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                      textTransform: 'none',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                    onClick={() => {
                      if (typeof document === 'undefined') {
                        return;
                      }

                      const target = document.getElementById('projects');
                      if (!target) {
                        return;
                      }

                      if (lenis) {
                        lenis.scrollTo(target, {
                          duration: shouldReduceMotion ? 0 : 1,
                          immediate: shouldReduceMotion,
                        });
                      } else {
                        target.scrollIntoView({
                          behavior: shouldReduceMotion ? 'auto' : 'smooth',
                        });
                      }
                    }}
                  >
                    View My Work
                  </MotionButton>

                  <MotionButton
                    whileHover={shouldReduceMotion ? {} : { 
                      scale: 1.05, 
                      y: -2,
                      transition: { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 }
                    }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                    disableElevation
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#22d3ee',
                      border: '1px solid rgba(34, 211, 238, 0.3)',
                      borderRadius: '12px',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      px: 4,
                      py: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backdropFilter: 'blur(10px)',
                      textTransform: 'none',
                    }}
                    onClick={() => {
                      if (typeof window === 'undefined') {
                        return;
                      }

                      const newWindow = window.open(resumePDF, '_blank');

                      if (newWindow) {
                        newWindow.addEventListener('load', () => {
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
                              transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, box-shadow 0.2s ease;
                              will-change: transform;
                            }
                            .resume-download-btn:hover {
                              background: #4f46e5;
                              transform: translateY(-2px);
                              box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                            }
                          `;
                          newWindow.document.head.appendChild(style);

                          const downloadButton = newWindow.document.createElement('button');
                          downloadButton.textContent = '📥 Download Resume';
                          downloadButton.className = 'resume-download-btn';
                          downloadButton.onclick = () => {
                            const link = newWindow.document.createElement('a');
                            link.href = resumePDF;
                            link.download = 'Gading_Aditya_Perdana_Resume.pdf';
                            link.click();
                          };
                          newWindow.document.body.appendChild(downloadButton);
                        });
                      }
                    }}
                  >
                    <Download sx={{ fontSize: 18 }} />
                    View Resume
                  </MotionButton>

                  <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                    {SOCIAL_LINKS.map((social) => {
                      const Icon = social.icon;
                      return (
                        <motion.div
                          key={social.label}
                          whileHover={shouldReduceMotion ? {} : { 
                            scale: 1.2, 
                            y: -3,
                            transition: { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 }
                          }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                          style={{
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(0)',
                          }}
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
                              willChange: 'transform',
                              '&:hover': {
                                color: '#6366f1',
                                background: 'rgba(99, 102, 241, 0.1)',
                                borderColor: 'rgba(99, 102, 241, 0.3)',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                              },
                            }}
                          >
                            <Icon sx={{ fontSize: 20 }} />
                          </IconButton>
                        </motion.div>
                      );
                    })}
                  </Box>
                </Box>
              </HeroButton>

              <HeroSubtitle>
                <Box sx={{ mt: 6 }}>
                  <Typography variant="overline" sx={{ color: '#d4d4d4', mb: 2, display: 'block' }}>
                    Core Expertise
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {SKILLS.map((skill) => (
                      <motion.div
                        key={skill}
                        variants={animationVariants.item}
                        whileHover={shouldReduceMotion ? {} : { 
                          scale: 1.1, 
                          y: -2,
                          transition: { type: 'spring', stiffness: 600, damping: 25, mass: 0.4 }
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'translateZ(0)',
                        }}
                      >
                        <Chip
                          label={skill}
                          sx={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#6366f1',
                            '&:hover': {
                              willChange: 'transform',
                              background: 'rgba(99, 102, 241, 0.2)',
                              boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </HeroSubtitle>
            </Box>

            <Box sx={{ order: { xs: 1, lg: 2 }, display: 'flex', justifyContent: 'center' }}>
              <AboutImage>
                <ProfileCard
                  name="Gading Aditya Perdana"
                  title="AI/ML Engineer & Researcher"
                  handle="gadingap"
                  status="Available for Projects"
                  contactText="Contact Me"
                  avatarUrl={heroImg}
                  showUserInfo={false}
                  showDetails={false}
                  enableTilt={!shouldReduceMotion}
                  enableMobileTilt={!shouldReduceMotion}
                />
              </AboutImage>
            </Box>
          </Box>
        </HeroContainer>
      </Container>
    </Box>
  );
};

export default ModernHero;
