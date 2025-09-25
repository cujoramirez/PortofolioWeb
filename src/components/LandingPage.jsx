import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import EnhancedHero from './EnhancedHero.jsx';
import ModernHero from './ModernHero.jsx';
import WebGLErrorBoundary from './WebGLErrorBoundary.jsx';
import { getPerformanceProfile, debounce } from '../utils/performanceOptimizations.js';

const LandingPage = ({ introComplete, onNavbarVisibilityChange, onLandingComplete }) => {
  const [showLanding, setShowLanding] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(max-width: 768px)').matches;
  });

  // Memoize performance profile to avoid recalculation
  const performanceProfile = useMemo(() => getPerformanceProfile(), []);

  const showLandingRef = useRef(showLanding);
  const transitionTimeoutRef = useRef(null);
  const autoTransitionRef = useRef(null);
  const touchStateRef = useRef({ startY: 0, startX: 0, hasTriggered: false });
  const bodyStylesRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const exitDelay = prefersReducedMotion ? 420 : 650;
  const autoTransitionDuration = prefersReducedMotion ? 12000 : 20000;
  const indicatorDelay = prefersReducedMotion ? 1.2 : 2.2;
  const wheelThreshold = prefersReducedMotion ? 6 : 10;
  const swipeThreshold = prefersReducedMotion ? 45 : 60;

  useEffect(() => {
    showLandingRef.current = showLanding;
  }, [showLanding]);

  const clearTimeoutRef = useCallback((ref) => {
    if (ref.current) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);

  const restoreBodyStyles = useCallback(() => {
    if (typeof document === 'undefined' || !bodyStylesRef.current) {
      return;
    }

    const body = document.body;
    if (!body) {
      return;
    }

    const previousStyles = bodyStylesRef.current;
    Object.keys(previousStyles).forEach((key) => {
      body.style[key] = previousStyles[key];
    });

    bodyStylesRef.current = null;
  }, []);

  const completeLanding = useCallback(
    (delay) => {
      if (!showLandingRef.current || typeof window === 'undefined') {
        return;
      }

      showLandingRef.current = false;
      setShowLanding(false);

      clearTimeoutRef(autoTransitionRef);
      clearTimeoutRef(transitionTimeoutRef);

      const finalDelay = typeof delay === 'number' ? delay : exitDelay;
      transitionTimeoutRef.current = window.setTimeout(() => {
        setLandingComplete(true);
        onLandingComplete?.(true);
      }, finalDelay);
    },
    [clearTimeoutRef, exitDelay, onLandingComplete]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (event) => setIsMobile(event.matches);

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!introComplete || typeof document === 'undefined') {
      return undefined;
    }

    const body = document.body;
    if (!body) {
      return undefined;
    }

    if (showLanding) {
      if (!bodyStylesRef.current) {
        bodyStylesRef.current = {
          overflow: body.style.overflow,
          position: body.style.position,
          width: body.style.width,
          height: body.style.height,
          touchAction: body.style.touchAction,
        };
      }

      Object.assign(body.style, {
        overflow: 'hidden',
        position: 'fixed',
        width: '100%',
        height: '100%',
        touchAction: 'none',
      });
    } else {
      restoreBodyStyles();
    }

    return restoreBodyStyles;
  }, [introComplete, showLanding, restoreBodyStyles]);

  useEffect(() => {
    if (!introComplete || !showLanding || typeof window === 'undefined') {
      return undefined;
    }

    const handleWheel = (event) => {
      if (event.deltaY <= 0) {
        return;
      }

      if (Math.abs(event.deltaY) < wheelThreshold) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
      completeLanding(exitDelay);
    };

    const handleTouchStart = (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      touchStateRef.current = {
        startY: touch.clientY,
        startX: touch.clientX,
        hasTriggered: false,
      };
    };

    const handleTouchMove = (event) => {
      const touch = event.touches[0];
      if (!touch || touchStateRef.current.hasTriggered) {
        return;
      }

      const deltaY = touchStateRef.current.startY - touch.clientY;
      const deltaX = Math.abs(touchStateRef.current.startX - touch.clientX);

      if (Math.abs(deltaY) <= deltaX || deltaY <= swipeThreshold) {
        return;
      }

      touchStateRef.current.hasTriggered = true;

      if (event.cancelable) {
        event.preventDefault();
      }

      completeLanding(exitDelay);
    };

    const handleTouchEnd = () => {
      touchStateRef.current.hasTriggered = false;
    };

    const handleKeyDown = (event) => {
      if (!['Enter', ' ', 'ArrowDown', 'PageDown'].includes(event.key)) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }

      completeLanding(Math.max(exitDelay - 80, 280));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    clearTimeoutRef(autoTransitionRef);
    autoTransitionRef.current = window.setTimeout(() => {
      completeLanding();
    }, autoTransitionDuration);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeoutRef(autoTransitionRef);
    };
  }, [introComplete, showLanding, completeLanding, clearTimeoutRef, wheelThreshold, swipeThreshold, autoTransitionDuration, exitDelay]);

  useEffect(() => {
    if (!introComplete || typeof window === 'undefined') {
      return undefined;
    }

    const handleExploreWork = () => completeLanding(Math.max(exitDelay - 80, 260));
    window.addEventListener('exploreMyWork', handleExploreWork);
    return () => window.removeEventListener('exploreMyWork', handleExploreWork);
  }, [introComplete, completeLanding, exitDelay]);

  useEffect(() => () => {
    clearTimeoutRef(autoTransitionRef);
    clearTimeoutRef(transitionTimeoutRef);
  }, [clearTimeoutRef]);

  // Control navbar visibility
  useEffect(() => {
    if (onNavbarVisibilityChange) {
      onNavbarVisibilityChange(!showLanding);
    }
  }, [showLanding, onNavbarVisibilityChange]);

  return (
    <>
      {/* 3D Landing Hero */}
      <AnimatePresence>
        {showLanding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { 
              opacity: 0, 
              y: -50,
              scale: 0.95,
            }}
            transition={{ 
              duration: prefersReducedMotion ? 0.3 : 1.2, 
              ease: prefersReducedMotion ? "easeOut" : [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
              position: 'relative',
              height: '100vh',
              width: '100vw',
              overflow: 'hidden',
              touchAction: 'pan-y',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <EnhancedHero introComplete={introComplete} />
            
            {/* Professional Scroll Indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '-36px', sm: '-48px' },
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pb: { xs: 5, sm: 7 }, // Responsive padding
                background: 'linear-gradient(transparent, rgba(0,0,0,0.2))',
                pointerEvents: 'none', // Allow touch events to pass through
                '& > *': {
                  pointerEvents: 'auto', // Re-enable for child elements
                }
              }}
            >
              {/* Subtle scroll hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ 
                  duration: prefersReducedMotion ? 0.3 : 1.2, 
                  delay: prefersReducedMotion ? 0 : indicatorDelay 
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  padding: '16px', // Better touch target
                  minHeight: '80px', // Minimum touch target size
                  touchAction: 'manipulation', // Optimize for touch
                }}
                onClick={() => completeLanding(Math.max(exitDelay - 120, 240))}
                onTouchStart={(e) => {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <motion.div
                  animate={prefersReducedMotion ? { opacity: 0.8 } : { 
                    y: [0, -6, 0],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={prefersReducedMotion ? { duration: 0.3 } : { 
                    duration: 2.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatDelay: 1
                  }}
                  style={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    fontWeight: 500,
                    marginBottom: '12px',
                    textAlign: 'center',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    fontFamily: '"Inter", system-ui, sans-serif',
                  }}
                >
                  {isMobile ? 'Swipe Up to Continue' : 'Scroll to Portfolio'}
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, 8, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2.3,
                    repeat: prefersReducedMotion ? 4 : Infinity,
                    ease: "easeInOut", 
                    delay: 0.3,
                    repeatDelay: prefersReducedMotion ? 0 : 1
                  }}
                >
                  <KeyboardArrowDown 
                    sx={{ 
                      fontSize: '2rem',
                      opacity: 0.7,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }} 
                  />
                </motion.div>
              </motion.div>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Hero Section (Original/ModernHero) */}
      <motion.div
        id="main-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: landingComplete || !showLanding ? 1 : 0,
          y: landingComplete || !showLanding ? 0 : 20
        }}
        transition={{ 
          duration: 1.2, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: landingComplete || !showLanding ? 0.3 : 0
        }}
        style={{
          position: landingComplete || !showLanding ? 'relative' : 'fixed',
          top: landingComplete || !showLanding ? 0 : '100vh',
          width: '100%',
          zIndex: landingComplete || !showLanding ? 1 : -1,
        }}
      >
        <WebGLErrorBoundary>
          <ModernHero />
        </WebGLErrorBoundary>
      </motion.div>
    </>
  );
};

export default LandingPage;
