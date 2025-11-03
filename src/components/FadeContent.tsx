import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FadeContentProps {
  children: ReactNode;
  blur?: boolean;
  duration?: number;
  initialOpacity?: number;
  className?: string;
}

const FadeContent = ({
  children,
  blur = false,
  duration = 900,
  initialOpacity = 0,
  className,
}: FadeContentProps) => {
  return (
    <motion.div
      style={{ width: '100%', height: '100%', display: 'flex' }}
      {...(className ? { 'data-classname': className } : {})}
      initial={{
        opacity: initialOpacity,
        filter: blur ? 'blur(20px)' : 'blur(0px)',
      }}
      animate={{
        opacity: 1,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: duration / 1000,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export default FadeContent;
