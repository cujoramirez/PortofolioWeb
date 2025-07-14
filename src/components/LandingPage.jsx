import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Button, IconButton } from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import EnhancedHero from './EnhancedHero.jsx';
import ModernHero from './ModernHero.jsx';
import WebGLErrorBoundary from './WebGLErrorBoundary.jsx';

const LandingPage = ({ introComplete, onNavbarVisibilityChange, onLandingComplete }) => {
  const [showLanding, setShowLanding] = useState(true);
  const [landingComplete, setLandingComplete] = useState(false);

  // Enhanced scroll and touch detection for all devices
  useEffect(() => {
    let timeoutId;
    let startY = 0;
    let startX = 0;
    let currentY = 0;
    let currentX = 0;
    let isScrolling = false;
    
    const completeLanding = () => {
      setShowLanding(false);
      setTimeout(() => {
        setLandingComplete(true);
        onLandingComplete?.(true); // Notify parent component
      }, 1000);
    };
    
    const handleScroll = (e) => {
      if (showLanding) {
        // Allow some natural scroll but trigger transition on intentional scroll
        if (window.scrollY > 30) { // Reduced threshold for mobile
          e.preventDefault();
          e.stopPropagation();
          completeLanding();
        }
      }
    };

    const handleWheel = (e) => {
      if (showLanding && e.deltaY > 0) {
        if (Math.abs(e.deltaY) > 5) { // Lower threshold for sensitivity
          e.preventDefault();
          completeLanding();
        }
      }
    };

    // Enhanced touch handling for mobile/tablet
    const handleTouchStart = (e) => {
      if (showLanding) {
        const touch = e.touches[0];
        startY = touch.clientY;
        startX = touch.clientX;
        isScrolling = false;
      }
    };

    const handleTouchMove = (e) => {
      if (showLanding && !isScrolling) {
        const touch = e.touches[0];
        currentY = touch.clientY;
        currentX = touch.clientX;
        
        const deltaY = startY - currentY;
        const deltaX = Math.abs(startX - currentX);
        
        // Detect vertical swipe (ignore horizontal swipes)
        if (Math.abs(deltaY) > deltaX && Math.abs(deltaY) > 50) {
          isScrolling = true;
          
          // Downward swipe (swipe up gesture)
          if (deltaY > 0) {
            // Only prevent default if the event is cancelable
            if (e.cancelable) {
              e.preventDefault();
            }
            completeLanding();
          }
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (showLanding) {
        isScrolling = false;
      }
    };

    // Auto-transition after a longer delay (more professional)
    const autoTransition = () => {
      timeoutId = setTimeout(() => {
        if (showLanding) {
          completeLanding();
        }
      }, 30000); // Increased to 30 seconds for better UX
    };

    if (introComplete) {
      // Prevent body scroll during landing
      if (showLanding) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.touchAction = 'none'; // Prevent default touch behaviors
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.touchAction = '';
      }
      
      window.addEventListener('scroll', handleScroll, { passive: false });
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('touchstart', handleTouchStart, { passive: true });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd, { passive: true });
      autoTransition();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showLanding, introComplete]);

  // Listen for custom event from "Explore My Work" button
  useEffect(() => {
    const handleExploreWork = () => {
      if (showLanding) {
        // Add professional transition effect
        document.body.style.transition = 'all 0.3s ease-out';
        
        setShowLanding(false);
        setTimeout(() => {
          setLandingComplete(true);
          onLandingComplete?.(true); // Notify parent component
          document.body.style.transition = '';
        }, 1200); // Smooth, professional timing
      }
    };

    window.addEventListener('exploreMyWork', handleExploreWork);
    return () => window.removeEventListener('exploreMyWork', handleExploreWork);
  }, [showLanding]);

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
            exit={{ 
              opacity: 0, 
              y: -50,
              scale: 0.95,
              // filter: "blur(2px)" // Removed
            }}
            transition={{ 
              duration: 1.2, 
              ease: [0.25, 0.46, 0.45, 0.94] // Professional easing curve
            }}
            style={{
              position: 'relative',
              height: '100vh',
              width: '100vw',
              overflow: 'hidden',
              touchAction: 'pan-y', // Allow vertical panning for swipe gestures
            }}
          >
            <WebGLErrorBoundary>
              <EnhancedHero introComplete={introComplete} />
            </WebGLErrorBoundary>
            
            {/* Professional Scroll Indicator */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pb: { xs: 4, sm: 6 }, // Responsive padding
                background: 'linear-gradient(transparent, rgba(0,0,0,0.15))',
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
                transition={{ duration: 1.5, delay: 3 }}
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
                onClick={() => {
                  // Enhanced transition when clicked
                  const transition = () => {
                    document.body.style.cursor = 'wait';
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('exploreMyWork'));
                      document.body.style.cursor = 'default';
                    }, 150);
                  };
                  transition();
                }}
                onTouchStart={(e) => {
                  // Handle touch specifically for better mobile experience
                  e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -6, 0],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2.5, 
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
                  {window.innerWidth <= 768 ? 'Swipe Up to Continue' : 'Scroll to Portfolio'}
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, 8, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut", 
                    delay: 0.3,
                    repeatDelay: 1
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
