import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedContentProps {
  children: ReactNode;
  distance?: number;
  duration?: number;
  initialOpacity?: number;
  animateOpacity?: boolean;
  threshold?: number;
  delay?: number;
  className?: string;
}

const AnimatedContent = ({
  children,
  distance = 140,
  duration = 1.1,
  initialOpacity = 0,
  animateOpacity = true,
  delay = 0,
  className,
}: AnimatedContentProps) => {
  return (
    <motion.div
      style={{ width: '100%', height: '100%' }}
      {...(className ? { 'data-classname': className } : {})}
      initial={{
        y: distance,
        opacity: animateOpacity ? initialOpacity : 1,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContent;
