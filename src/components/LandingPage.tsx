import { useState, useEffect, useRef, useCallback, useMemo, type MutableRefObject, type TouchEvent as ReactTouchEvent } from 'react';
import { motion } from 'framer-motion';
import { Box } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import gsap from 'gsap';
import EnhancedHero from './EnhancedHero';
import ModernHero from './ModernHero';
import WebGLErrorBoundary from './WebGLErrorBoundary';
import AnimatedContent from './AnimatedContent';
import FadeContent from './FadeContent';
import SplashCursor from './SplashCursor';
import { useReducedMotionOverride } from '../hooks/useReducedMotionOverride';
import { useSystemProfile } from './useSystemProfile';
import { useLenis } from '../hooks/useLenis';

interface LandingPageProps {
  introComplete: boolean;
  onNavbarVisibilityChange?: (visible: boolean) => void;
  onLandingComplete?: (complete: boolean) => void;
}

type TouchState = {
  startY: number;
  startX: number;
  hasTriggered: boolean;
};

const LANDING_MEDIA_QUERY = '(max-width: 768px)';

const MotionBox = motion(Box);

const LandingPage = ({
  introComplete,
  onNavbarVisibilityChange,
  onLandingComplete,
}: LandingPageProps) => {
  const { stop: stopLenis, start: startLenis } = useLenis();
  const [showLanding, setShowLanding] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(LANDING_MEDIA_QUERY).matches;
  });

  const landingContainerRef = useRef<HTMLDivElement | null>(null);
  const exitTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const showLandingRef = useRef(showLanding);
  const autoTransitionRef = useRef<number | null>(null);
  const touchStateRef = useRef<TouchState>({ startY: 0, startX: 0, hasTriggered: false });
  const prefersReducedMotion = useReducedMotionOverride();
  const { performanceTier } = useSystemProfile();
  const exitDelay = prefersReducedMotion ? 420 : 650;
  // Shorter auto-transition for mobile/tablet to prevent scroll lock
  const autoTransitionDuration = isMobile ? 5000 : (prefersReducedMotion ? 8000 : 10000);
  const indicatorDelay = prefersReducedMotion ? 1.2 : 2.2;
  const wheelThreshold = prefersReducedMotion ? 6 : 10;
  const swipeThreshold = prefersReducedMotion ? 45 : 60;
  const shouldRunSplashCursor =
    showLanding &&
    !prefersReducedMotion &&
    performanceTier === 'high';
  const [showSplashCursor, setShowSplashCursor] = useState(false);

  const splashCursorProps = useMemo(() => {
    if (!shouldRunSplashCursor) {
      return null;
    }

    const baseConfig = {
      BACK_COLOR: { r: 0.02, g: 0.03, b: 0.12 },
      DENSITY_DISSIPATION: 1.2,
      VELOCITY_DISSIPATION: 1.45,
      PRESSURE: 0.12,
      CURL: 3.6,
      SPLAT_RADIUS: 0.22,
      TRANSPARENT: true,
    } as const;

    return {
      ...baseConfig,
      SIM_RESOLUTION: 120,
      DYE_RESOLUTION: 1200,
      CAPTURE_RESOLUTION: 420,
      PRESSURE_ITERATIONS: 18,
      SPLAT_FORCE: 6400,
      COLOR_UPDATE_SPEED: 11,
    } as const;
  }, [shouldRunSplashCursor]);

  useEffect(() => {
    showLandingRef.current = showLanding;
  }, [showLanding]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!shouldRunSplashCursor) {
      setShowSplashCursor(false);
      return undefined;
    }

    // Delay the fluid shader setup so it doesn't compete with the hero fade-in for main-thread time
    let rafId: number | null = null;
    const timeoutId = window.setTimeout(() => {
      rafId = window.requestAnimationFrame(() => setShowSplashCursor(true));
    }, prefersReducedMotion ? 0 : 180);

    return () => {
      window.clearTimeout(timeoutId);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [prefersReducedMotion, shouldRunSplashCursor]);

  const clearTimeoutRef = useCallback((ref: MutableRefObject<number | null>) => {
    if (ref.current !== null) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  }, []);



  const finalizeLanding = useCallback(() => {
    setLandingComplete(true);
    setShowLanding(false);
    onLandingComplete?.(true);
  }, [onLandingComplete]);

  const playExitAnimation = useCallback(
    (delayMs: number) => {
      const target = landingContainerRef.current;
      if (!target) {
        finalizeLanding();
        return;
      }

      exitTimelineRef.current?.kill();
      exitTimelineRef.current = gsap
        .timeline({ delay: delayMs / 1000, onComplete: finalizeLanding })
        .to(target, {
          yPercent: prefersReducedMotion ? -5 : -25,
          opacity: 0,
          duration: prefersReducedMotion ? 0.35 : 0.9,
          ease: 'power3.inOut',
        });
    },
    [finalizeLanding, prefersReducedMotion],
  );

  const completeLanding = useCallback(
    (delay?: number) => {
      if (!showLandingRef.current || typeof window === 'undefined') {
        return;
      }

      showLandingRef.current = false;

      clearTimeoutRef(autoTransitionRef);

      const animationDelay = typeof delay === 'number' ? delay : exitDelay;
      playExitAnimation(animationDelay);
    },
    [clearTimeoutRef, exitDelay, playExitAnimation],
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(LANDING_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Safety mechanism: force-enable scrolling after max time
  useEffect(() => {
    if (!introComplete || typeof document === 'undefined' || typeof window === 'undefined') {
      return undefined;
    }

    // Maximum time landing can lock scroll (failsafe)
    const maxLockDuration = isMobile ? 6000 : 12000;
    const safetyTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-landing-active');
      document.body.removeAttribute('data-landing-active');
      startLenis();
    }, maxLockDuration);

    return () => {
      window.clearTimeout(safetyTimer);
    };
  }, [introComplete, startLenis, isMobile]);

  useEffect(() => {
    if (!introComplete || typeof document === 'undefined') {
      return () => undefined;
    }

    if (showLanding) {
      // Simply stop Lenis - no DOM manipulation needed
      stopLenis();
      
      // Add data attribute for CSS-based scroll prevention
      document.documentElement.setAttribute('data-landing-active', 'true');
      document.body.setAttribute('data-landing-active', 'true');
    } else {
      // Resume Lenis and remove attribute
      document.documentElement.removeAttribute('data-landing-active');
      document.body.removeAttribute('data-landing-active');
      requestAnimationFrame(() => {
        startLenis();
      });
    }

    return () => {
      document.documentElement.removeAttribute('data-landing-active');
      document.body.removeAttribute('data-landing-active');
      requestAnimationFrame(() => {
        startLenis();
      });
    };
  }, [introComplete, showLanding, stopLenis, startLenis]);

  useEffect(() => {
    if (!introComplete || !showLanding || typeof window === 'undefined') {
      return () => undefined;
    }

    const handleWheel = (event: WheelEvent) => {
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

    const handleTouchStart = (event: TouchEvent) => {
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

    const handleTouchMove = (event: TouchEvent) => {
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

    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [
    introComplete,
    showLanding,
    completeLanding,
    clearTimeoutRef,
    wheelThreshold,
    swipeThreshold,
    autoTransitionDuration,
    exitDelay,
  ]);

  useEffect(() => {
    if (!introComplete || typeof window === 'undefined') {
      return () => undefined;
    }

    const handleExploreWork = () => completeLanding(Math.max(exitDelay - 80, 260));
    window.addEventListener('exploreMyWork', handleExploreWork);
    return () => window.removeEventListener('exploreMyWork', handleExploreWork);
  }, [introComplete, completeLanding, exitDelay]);

  useEffect(
    () => () => {
      clearTimeoutRef(autoTransitionRef);
      exitTimelineRef.current?.kill();
      exitTimelineRef.current = null;
    },
    [clearTimeoutRef],
  );

  useEffect(() => {
    onNavbarVisibilityChange?.(!showLanding);
  }, [showLanding, onNavbarVisibilityChange]);

  return (
    <>
      {showLanding && (
        <Box
          ref={landingContainerRef}
          sx={{
            position: 'relative',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            touchAction: 'none',
            overscrollBehavior: 'contain',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            isolation: 'isolate',
            background: 'radial-gradient(120% 120% at 20% 10%, rgba(76, 29, 149, 0.32), rgba(15, 23, 42, 0.96) 55%, rgba(2, 6, 23, 0.98))',
          }}
        >
          {showSplashCursor && splashCursorProps ? (
            <SplashCursor {...splashCursorProps} />
          ) : null}

          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 0, md: 2 },
              '& .landing-fade-wrapper': {
                width: '100%',
                height: '100%',
                display: 'flex',
              },
            }}
          >
            <FadeContent
              className="landing-fade-wrapper"
              blur={!prefersReducedMotion}
              duration={prefersReducedMotion ? 280 : 900}
              initialOpacity={prefersReducedMotion ? 1 : 0}
            >
              <EnhancedHero introComplete={introComplete} />
            </FadeContent>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: '-36px', sm: '-48px' },
              left: 0,
              right: 0,
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pb: { xs: 5, sm: 7 },
              pointerEvents: 'none',
            }}
          >
            <AnimatedContent
              distance={prefersReducedMotion ? 12 : 140}
              duration={prefersReducedMotion ? 0.4 : 1.1}
              initialOpacity={0}
              animateOpacity
              threshold={0.25}
              delay={prefersReducedMotion ? 0 : indicatorDelay}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: 'rgba(255, 255, 255, 0.78)',
                  cursor: 'pointer',
                  p: 2,
                  minHeight: '80px',
                  touchAction: 'manipulation',
                  pointerEvents: 'auto',
                  background: 'linear-gradient(transparent, rgba(15,23,42,0.6))',
                  borderRadius: '999px',
                }}
                onClick={() => completeLanding(Math.max(exitDelay - 120, 240))}
                onTouchStart={(event: ReactTouchEvent<HTMLDivElement>) => {
                  event.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(event: ReactTouchEvent<HTMLDivElement>) => {
                  event.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <motion.div
                  animate={
                    prefersReducedMotion
                      ? { opacity: 0.8 }
                      : {
                          y: [0, -6, 0],
                          opacity: [0.5, 0.85, 0.5],
                        }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.3 }
                      : {
                          duration: 2.1,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          repeatDelay: 1,
                        }
                  }
                  style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
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
                    scale: [1, 1.08, 1],
                  }}
                  transition={{
                    duration: 2.1,
                    repeat: prefersReducedMotion ? 4 : Infinity,
                    ease: 'easeInOut',
                    delay: 0.25,
                    repeatDelay: prefersReducedMotion ? 0 : 0.9,
                  }}
                >
                  <KeyboardArrowDown
                    sx={{
                      fontSize: '2rem',
                      opacity: 0.75,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))',
                    }}
                  />
                </motion.div>
              </Box>
            </AnimatedContent>
          </Box>
        </Box>
      )}

      <MotionBox
        id="main-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: landingComplete || !showLanding ? 1 : 0,
          y: landingComplete || !showLanding ? 0 : 20,
        }}
        transition={{
          duration: 1.2,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: landingComplete || !showLanding ? 0.3 : 0,
        }}
        sx={{
          position: landingComplete || !showLanding ? 'relative' : 'fixed',
          top: landingComplete || !showLanding ? 0 : '100vh',
          width: '100%',
          zIndex: landingComplete || !showLanding ? 1 : -1,
        }}
      >
        <WebGLErrorBoundary>
          <ModernHero />
        </WebGLErrorBoundary>
      </MotionBox>
    </>
  );
};

export default LandingPage;
