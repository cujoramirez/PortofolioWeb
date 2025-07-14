import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  overflow: 'hidden',
}));

const GlowProgress = styled(LinearProgress)(({ theme }) => ({
  width: '60%',
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(99, 102, 241, 0.2)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
    borderRadius: 4,
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
    animation: 'glow 2s ease-in-out infinite alternate',
  },
  '@keyframes glow': {
    '0%': {
      boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
    },
    '100%': {
      boxShadow: '0 0 30px rgba(99, 102, 241, 0.9), 0 0 40px rgba(139, 92, 246, 0.4)',
    },
  },
}));

// Particle Component
const LoadingParticle = ({ index }) => {
  const randomDelay = Math.random() * 2;
  const randomDuration = 3 + Math.random() * 2;
  const randomX = Math.random() * 100;
  const randomY = Math.random() * 100;

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: `${randomX}vw`,
        y: `${randomY}vh`
      }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: `${randomX + (Math.random() - 0.5) * 20}vw`,
        y: `${randomY + (Math.random() - 0.5) * 20}vh`,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        position: 'absolute',
        width: 4,
        height: 4,
        background: `radial-gradient(circle, ${
          index % 3 === 0 ? '#6366f1' : 
          index % 3 === 1 ? '#8b5cf6' : '#22d3ee'
        }, transparent)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }}
    />
  );
};

// Neural Network Background
const NeuralNetwork = () => {
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.3,
      }}
    >
      {/* Connections */}
      {nodes.map((node, i) =>
        nodes.slice(i + 1).map((otherNode, j) => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          
          return distance < 30 ? (
            <motion.line
              key={`${i}-${j}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${otherNode.x}%`}
              y2={`${otherNode.y}%`}
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, delay: Math.random() * 2 }}
            />
          ) : null;
        })
      )}
      
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={node.id}
          cx={`${node.x}%`}
          cy={`${node.y}%`}
          r="2"
          fill={i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1, delay: i * 0.1 }}
        />
      ))}
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Enhanced G Logo Component with Advanced Animations
const EnhancedGLogo = () => {
  return (
    <motion.div
      initial={{ scale: 0, rotateY: 180, opacity: 0 }}
      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
      transition={{ duration: 2, type: "spring", stiffness: 100, damping: 15 }}
      style={{
        position: 'relative',
        width: '200px',
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          position: 'absolute',
          inset: -20,
          border: '2px solid transparent',
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #22d3ee, #10b981) border-box',
          WebkitMask: 'linear-gradient(white 0 0) padding-box, linear-gradient(white 0 0)',
          WebkitMaskComposite: 'subtract',
          opacity: 0.6,
        }}
      />
      
      {/* Inner Energy Ring */}
      <motion.div
        animate={{
          rotate: [360, 0],
          scale: [0.9, 1.05, 0.9],
        }}
        transition={{
          rotate: { duration: 6, repeat: Infinity, ease: "linear" },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        }}
        style={{
          position: 'absolute',
          inset: -10,
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: '50%',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
        }}
      />

      {/* Main G Letter */}
      <motion.div
        animate={{
          rotateY: [0, 15, 0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          fontSize: '120px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #22d3ee 50%, #10b981 75%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 50px rgba(99, 102, 241, 0.5)',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          zIndex: 2,
        }}
      >
        G
      </motion.div>

      {/* Floating Particles around G */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotate: [0, 360],
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            rotate: { duration: 5 + i * 0.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981'][i % 4],
            left: `${50 + 35 * Math.cos((i * Math.PI * 2) / 8)}%`,
            top: `${50 + 35 * Math.sin((i * Math.PI * 2) / 8)}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 15px ${['#6366f1', '#8b5cf6', '#22d3ee', '#10b981'][i % 4]}`,
          }}
        />
      ))}

      {/* Central Pulse Effect */}
      <motion.div
        animate={{
          scale: [0, 2, 0],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent)',
        }}
      />

      {/* Tech Keywords floating around */}
      {['AI', 'ML', 'Code', 'Tech'].map((text, i) => (
        <motion.div
          key={text}
          animate={{
            rotate: [0, 360],
            y: [-5, 5, -5],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            rotate: { duration: 10 + i * 2, repeat: Infinity, ease: "linear" },
            y: { duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: 'absolute',
            left: `${50 + 60 * Math.cos((i * Math.PI * 2) / 4)}%`,
            top: `${50 + 60 * Math.sin((i * Math.PI * 2) / 4)}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            fontWeight: 600,
            color: ['#6366f1', '#8b5cf6', '#22d3ee', '#10b981'][i],
            textShadow: `0 0 10px ${['#6366f1', '#8b5cf6', '#22d3ee', '#10b981'][i]}`,
            pointerEvents: 'none',
          }}
        >
          {text}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Main LoadingScreen Component
const LoadingScreen = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing AI Systems...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  const loadingSteps = [
    'Initializing AI Systems...',
    'Loading Neural Networks...',
    'Calibrating Machine Learning Models...',
    'Optimizing Performance...',
    'Preparing Portfolio Experience...',
    'Almost Ready...'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + Math.random() * 15;
        
        // Update loading text based on progress
        const stepIndex = Math.floor((newProgress / 100) * loadingSteps.length);
        if (stepIndex < loadingSteps.length) {
          setLoadingText(loadingSteps[stepIndex]);
        }
        
        if (newProgress >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(() => {
            onLoadingComplete();
          }, 500); // 0.5s fade duration
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: isFadingOut ? 0 : 1,
          backgroundColor: isFadingOut ? '#000000' : 'transparent'
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10001,
        }}
      >
        <LoadingContainer>
        {/* Background Neural Network */}
        <NeuralNetwork />
        
        {/* Floating Particles */}
        {Array.from({ length: 50 }, (_, i) => (
          <LoadingParticle key={i} index={i} />
        ))}
        
        {/* Main Loading Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            zIndex: 10,
          }}
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
          >
            <EnhancedGLogo />
          </motion.div>
          
          {/* Loading Progress */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
          >
            <GlowProgress 
              variant="determinate" 
              value={progress}
            />
            
            {/* Progress Text */}
            <motion.div
              key={loadingText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}
              >
                {loadingText}
              </Typography>
            </motion.div>
            
            {/* Progress Percentage */}
            <Typography
              variant="h6"
              sx={{
                color: '#6366f1',
                fontSize: '1.5rem',
                fontWeight: 700,
                textShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </motion.div>
          
          {/* Animated Loading Dots */}
          <motion.div
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee',
                  boxShadow: `0 0 10px ${i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#22d3ee'}`,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
        
        {/* Holographic Grid Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          }}
        />
      </LoadingContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;

