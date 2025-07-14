import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography } from '@mui/material';

const SimpleIntroAnimation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    {
      title: "Gateway Opening",
      subtitle: "Initializing portal to digital dimension...",
      duration: 2000
    },
    {
      title: "Entering Digital Dimension", 
      subtitle: "Accessing advanced AI portfolio interface...",
      duration: 2000
    },
    {
      title: "Transformation Complete",
      subtitle: "Welcome to Gading's AI Portfolio",
      duration: 1500
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        if (currentStep === steps.length - 1) {
          setIsComplete(true);
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else {
          setCurrentStep(currentStep + 1);
        }
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Animated Background Grid */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.3,
            }}
          />

          {/* Energy Ripples */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [0, 4],
                opacity: [0.6, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                border: '2px solid #6366f1',
                borderRadius: '50%',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Main Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 1.1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            style={{
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                filter: ['hue-rotate(0deg)', 'hue-rotate(30deg)', 'hue-rotate(0deg)'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '2rem', md: '3rem' },
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  textShadow: '0 0 50px rgba(99, 102, 241, 0.5)',
                  mb: 2,
                }}
              >
                {steps[currentStep].title}
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                }}
              >
                {steps[currentStep].subtitle}
              </Typography>
            </motion.div>
          </motion.div>

          {/* Progress Indicators */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '12px',
            }}
          >
            {steps.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: currentStep === i ? 1.5 : 1,
                  opacity: currentStep >= i ? 1 : 0.3,
                  backgroundColor: currentStep >= i ? '#6366f1' : 'rgba(99, 102, 241, 0.3)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  boxShadow: currentStep === i ? '0 0 20px #6366f1' : 'none',
                }}
              />
            ))}
          </motion.div>

          {/* Particle Effects */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                left: `${20 + Math.random() * 60}%`,
                bottom: 0,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: ['#6366f1', '#8b5cf6', '#22d3ee'][i % 3],
                boxShadow: `0 0 10px ${['#6366f1', '#8b5cf6', '#22d3ee'][i % 3]}`,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleIntroAnimation;
