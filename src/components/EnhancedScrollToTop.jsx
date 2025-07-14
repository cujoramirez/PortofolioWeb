import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fab, useTheme } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

const EnhancedScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = useTheme();

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
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1000,
          }}
        >
          <Fab
            onClick={scrollToTop}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedScrollToTop;

