import { memo, useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Fab, alpha, useTheme } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { useLenis } from '../hooks/useLenis';

const BackToTop = memo(() => {
  const theme = useTheme();
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
              background: alpha(theme.palette.background.paper, 0.6),
              color: alpha(theme.palette.text.primary, 0.6),
              backdropFilter: 'blur(16px)',
              boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, 0.15)}, 0 0 0 1px ${alpha(theme.palette.divider, 0.08)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              transition: 'all 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)',
              '&:hover': {
                background: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`,
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
