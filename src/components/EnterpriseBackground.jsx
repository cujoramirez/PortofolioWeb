import React, { memo, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, useTheme, alpha } from '@mui/material';
import { useSystemProfile } from './useSystemProfile';

// Advanced particle system for enterprise backgrounds
const EnhancedParticle = ({ index, useReducedMotion }) => {
  const theme = useTheme();
  const particleRef = useRef(null);
  
  const size = Math.random() * 4 + 2;
  const initialX = Math.random() * 100;
  const initialY = Math.random() * 100;
  const duration = Math.random() * 20 + 15;
  const delay = Math.random() * 10;
  
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main
  ];
  
  const color = colors[index % colors.length];

  return (
    <motion.div
      ref={particleRef}
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}, ${alpha(color, 0.5)})`,
        left: `${initialX}%`,
        top: `${initialY}%`,
        // filter: 'blur(0.5px)', // Removed
        pointerEvents: 'none'
      }}
      animate={useReducedMotion ? {} : {
        x: [0, Math.random() * 200 - 100, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 200 - 100, Math.random() * 100 - 50, 0],
        opacity: [0, 0.6, 0.8, 0.4, 0],
        scale: [0, 1, 1.2, 0.8, 0]
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Floating geometric shapes
const FloatingGeometry = ({ shape = 'circle', index, useReducedMotion }) => {
  const theme = useTheme();
  const size = Math.random() * 60 + 40;
  const duration = Math.random() * 25 + 20;
  
  const shapeStyles = {
    circle: {
      borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`
    },
    square: {
      borderRadius: '20%',
      background: `linear-gradient(45deg, ${alpha(theme.palette.secondary.main, 0.1)}, transparent)`,
      transform: 'rotate(45deg)'
    },
    triangle: {
      width: 0,
      height: 0,
      borderLeft: `${size/2}px solid transparent`,
      borderRight: `${size/2}px solid transparent`,
      borderBottom: `${size}px solid ${alpha(theme.palette.success.main, 0.1)}`,
      background: 'transparent'
    }
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: shape === 'triangle' ? 'auto' : size,
        height: shape === 'triangle' ? 'auto' : size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        ...shapeStyles[shape],
        pointerEvents: 'none'
      }}
      animate={useReducedMotion ? {} : {
        x: [0, Math.random() * 150 - 75],
        y: [0, Math.random() * 150 - 75],
        rotate: [0, 360],
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.7, 0.3]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 2
      }}
    />
  );
};

// Neural network-style connections
const NeuralConnection = ({ start, end, useReducedMotion }) => {
  const theme = useTheme();
  
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: start.x,
        top: start.y,
        width: distance,
        height: 1,
        background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.3)}, ${alpha(theme.palette.secondary.main, 0.3)})`,
        transformOrigin: '0 50%',
        transform: `rotate(${angle}deg)`,
        pointerEvents: 'none'
      }}
      animate={useReducedMotion ? {} : {
        opacity: [0, 0.6, 0],
        scaleX: [0, 1, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Main enterprise background component
const EnterpriseBackground = memo(({ 
  particleCount = 50, 
  showGeometry = true, 
  showNeuralNetwork = true,
  intensity = 'medium' // low, medium, high
}) => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const { scrollYProgress } = useScroll();
  const containerRef = useRef(null);
  
  const useReducedMotion = performanceTier === 'low';
  
  // Adjust effects based on performance tier
  const adjustedParticleCount = {
    low: Math.min(particleCount * 0.3, 15),
    medium: Math.min(particleCount * 0.6, 30),
    high: particleCount
  }[performanceTier] || particleCount;

  // Parallax transforms
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const geometryY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  // Generate neural network nodes for connections
  const neuralNodes = Array.from({ length: 8 }, (_, i) => ({
    x: (Math.random() * 80 + 10),
    y: (Math.random() * 80 + 10),
    id: i
  }));

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1
      }}
    >
      {/* Gradient background layer */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse at top, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 60%),
                      radial-gradient(ellipse at bottom right, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 60%),
                      radial-gradient(ellipse at bottom left, ${alpha(theme.palette.success.main, 0.08)} 0%, transparent 60%)`,
          y: backgroundY
        }}
      />

      {/* Particle system layer */}
      {!useReducedMotion && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            y: particleY
          }}
        >
          {Array.from({ length: adjustedParticleCount }, (_, i) => (
            <EnhancedParticle 
              key={i} 
              index={i} 
              useReducedMotion={useReducedMotion}
            />
          ))}
        </motion.div>
      )}

      {/* Floating geometry layer */}
      {showGeometry && !useReducedMotion && (
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            y: geometryY
          }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <FloatingGeometry 
              key={i} 
              shape={['circle', 'square', 'triangle'][i % 3]}
              index={i}
              useReducedMotion={useReducedMotion}
            />
          ))}
        </motion.div>
      )}

      {/* Neural network layer */}
      {showNeuralNetwork && !useReducedMotion && performanceTier !== 'low' && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.4
          }}
        >
          {/* Neural nodes */}
          {neuralNodes.map((node, index) => (
            <motion.div
              key={`node-${node.id}`}
              style={{
                position: 'absolute',
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: theme.palette.primary.main,
                boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.6)}`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: index * 0.5
              }}
            />
          ))}

          {/* Neural connections */}
          {neuralNodes.slice(0, -1).map((node, index) => {
            const nextNode = neuralNodes[index + 1];
            return (
              <NeuralConnection
                key={`connection-${index}`}
                start={{ x: node.x * window.innerWidth / 100, y: node.y * window.innerHeight / 100 }}
                end={{ x: nextNode.x * window.innerWidth / 100, y: nextNode.y * window.innerHeight / 100 }}
                useReducedMotion={useReducedMotion}
              />
            );
          })}
        </Box>
      )}

      {/* Ambient light effects */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
          // filter: 'blur(60px)', // Removed
          animation: !useReducedMotion ? 'breathe 8s ease-in-out infinite' : 'none'
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          bottom: '30%',
          right: '15%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
          // filter: 'blur(50px)', // Removed
          animation: !useReducedMotion ? 'breathe 6s ease-in-out infinite reverse' : 'none'
        }}
      />

      {/* Grid overlay for enterprise feel */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(${alpha(theme.palette.primary.main, 0.03)} 1px, transparent 1px),
            linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.03)} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          opacity: 0.5,
          animation: !useReducedMotion ? 'gradientShift 20s ease-in-out infinite' : 'none'
        }}
      />
    </Box>
  );
});

EnterpriseBackground.displayName = 'EnterpriseBackground';

export default EnterpriseBackground;

