import { memo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Fab } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { useLenis } from '../hooks/useLenis';

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
          <Fab
            onClick={scrollToTop}
            size="medium"
            aria-label="Scroll to top"
            sx={{
              background: 'color-mix(in srgb, var(--app-palette-bg-elevated) 60%, transparent)',
              color: 'color-mix(in srgb, var(--app-palette-text-primary) 60%, transparent)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15), 0 0 0 1px color-mix(in srgb, var(--app-palette-divider) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--app-palette-divider) 8%, transparent)',
              transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
              '&:hover': {
                background: 'color-mix(in srgb, var(--app-palette-primary-main) 12%, transparent)',
                color: 'var(--app-palette-primary-main)',
                boxShadow: '0 8px 32px color-mix(in srgb, var(--app-palette-primary-main) 15%, transparent), 0 0 0 1px color-mix(in srgb, var(--app-palette-primary-main) 15%, transparent)',
                transform: 'translateY(-3px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <KeyboardArrowUp />
          </Fab>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

BackToTop.displayName = 'BackToTop';

export default BackToTop;
