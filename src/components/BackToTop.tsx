import { memo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Fab } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { useLenis } from '../hooks/useLenis';
import LiquidGlass from './LiquidGlass';

const BackToTop = memo(() => {
  const { lenis } = useLenis();
  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsVisible(latest > 500);
  });

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            zIndex: 1400,
          }}
        >
          <LiquidGlass
            component="div"
            intensity="bold"
            interactive
            sx={{ borderRadius: '50%', display: 'inline-flex' }}
          >
            <Fab
              onClick={scrollToTop}
              size="medium"
              aria-label="Scroll to top"
              sx={{
                background: 'transparent',
                boxShadow: 'none',
                color: 'text.primary',
                transition: 'color 0.3s ease, transform 0.3s ease',
                '&:hover': {
                  background: 'transparent',
                  color: 'primary.main',
                  transform: 'translateY(-3px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </LiquidGlass>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

BackToTop.displayName = 'BackToTop';

export default BackToTop;
