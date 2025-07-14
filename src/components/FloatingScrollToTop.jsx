import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fab, useTheme, alpha } from '@mui/material';
import { KeyboardArrowUp as UpIcon } from '@mui/icons-material';

const FloatingScrollToTop = () => {
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 20,
            rotateZ: -180 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            rotateZ: 0 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: 20,
            rotateZ: 180 
          }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut" 
          }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 1000,
          }}
          whileHover={{
            scale: 1.1,
            rotateY: 15,
            rotateX: 10,
            y: -5,
          }}
          whileTap={{
            scale: 0.95,
            rotateZ: 10,
          }}
        >
          <Fab
            onClick={scrollToTop}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              width: 56,
              height: 56,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              boxShadow: `
                0 10px 30px ${alpha(theme.palette.primary.main, 0.3)},
                0 0 20px ${alpha(theme.palette.secondary.main, 0.2)},
                inset 0 1px 0 ${alpha('#fff', 0.2)}
              `,
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
                animation: 'shine 3s ease-in-out infinite',
              },
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: `
                  0 15px 40px ${alpha(theme.palette.primary.main, 0.4)},
                  0 0 30px ${alpha(theme.palette.secondary.main, 0.3)},
                  inset 0 1px 0 ${alpha('#fff', 0.3)}
                `,
              },
              '&:active': {
                transform: 'scale(0.95)',
              }
            }}
          >
            <UpIcon 
              sx={{ 
                fontSize: 28,
                filter: 'drop-shadow(0 0 8px currentColor)',
              }} 
            />
          </Fab>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingScrollToTop;

