import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sphere, 
  Torus, 
  Box as ThreeBox, 
  Environment, 
  PerspectiveCamera,
  MeshDistortMaterial,
  Html,
  useProgress,
  Preload
} from '@react-three/drei';
import * as THREE from 'three';
import { Typography, LinearProgress, Box as MuiBox } from '@mui/material';

// Professional Enterprise Intro Animation with seamless transitions
const IntroAnimationPro = ({ onComplete }) => {
  const [stage, setStage] = useState('initializing');
  const [showCanvas, setShowCanvas] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleStageComplete = (completedStage) => {
    try {
      switch (completedStage) {
        case 'initializing':
          setTimeout(() => setStage('systemsOnline'), 1500);
          break;
        case 'systemsOnline':
          setTimeout(() => setStage('neural'), 2000);
          break;
        case 'neural':
          setTimeout(() => setStage('transformation'), 2500);
          break;
        case 'transformation':
          setShowCanvas(false);
          setTimeout(() => onComplete(), 800);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Stage transition error:', error);
      setHasError(true);
      setTimeout(() => onComplete(), 1000);
    }
  };

  // Auto-start sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStageComplete('initializing');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-recover from errors
  useEffect(() => {
    if (hasError) {
      const errorTimer = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(errorTimer);
    }
  }, [hasError, onComplete]);

  return (
    <AnimatePresence>
      {showCanvas && !hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: 'radial-gradient(circle at center, #0f172a 0%, #000000 100%)',
          }}
        >
          {/* Dynamic Background Layers */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 50%)',
                'radial-gradient(circle at 50% 80%, #22d3ee 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, #6366f1 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.15 }}
          />

          {/* Professional 3D Canvas */}
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 0, 8], fov: 45 }}
            gl={{ 
              antialias: true,
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
              precision: "highp",
              premultipliedAlpha: false
            }}
            dpr={[1, 2]}
            onCreated={({ gl, scene, camera }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.0;
              gl.outputEncoding = THREE.sRGBEncoding;
              gl.shadowMap.enabled = true;
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              
              // Professional lighting setup
              scene.fog = new THREE.Fog(0x0f172a, 8, 25);
              
              // Context loss prevention
              const canvas = gl.domElement;
              canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL context lost - graceful fallback');
                setHasError(true);
              });
            }}
            fallback={<FallbackAnimation stage={stage} onComplete={onComplete} />}
          >
            <Suspense fallback={null}>
              <ProfessionalScene stage={stage} onStageComplete={handleStageComplete} />
            </Suspense>
          </Canvas>

          {/* UI Overlay with Professional Typography */}
          <MuiBox
            sx={{
              position: 'absolute',
              bottom: 60,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 10
            }}
          >
            <AnimatePresence mode="wait">
              {stage === 'initializing' && (
                <motion.div
                  key="initializing"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      fontWeight: 300,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      mb: 2,
                      fontSize: { xs: '1rem', md: '1.25rem' }
                    }}
                  >
                    Initializing Neural Network
                  </Typography>
                  <motion.div
                    animate={{
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(99, 102, 241, 0.8)', fontSize: '0.9rem' }}
                    >
                      Loading AI Systems...
                    </Typography>
                  </motion.div>
                </motion.div>
              )}

              {stage === 'systemsOnline' && (
                <motion.div
                  key="systemsOnline"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.8, ease: "backOut" }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                      background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: { xs: '1.5rem', md: '2rem' }
                    }}
                  >
                    Systems Online
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: 'rgba(255, 255, 255, 0.7)', letterSpacing: 1 }}
                  >
                    Establishing Neural Pathways
                  </Typography>
                </motion.div>
              )}

              {stage === 'neural' && (
                <motion.div
                  key="neural"
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  exit={{ opacity: 0, rotateX: 90 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 2,
                      textShadow: '0 0 30px rgba(34, 211, 238, 0.8)',
                      fontSize: { xs: '2rem', md: '3rem' }
                    }}
                  >
                    Neural Network Active
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: 2,
                      textTransform: 'uppercase'
                    }}
                  >
                    Consciousness Emerging
                  </Typography>
                </motion.div>
              )}

              {stage === 'transformation' && (
                <motion.div
                  key="transformation"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                >
                  <Typography
                    variant="h2"
                    sx={{
                      color: 'white',
                      fontWeight: 800,
                      mb: 2,
                      textShadow: '0 0 50px rgba(139, 92, 246, 0.9)',
                      fontSize: { xs: '2.5rem', md: '4rem' }
                    }}
                  >
                    Welcome
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      letterSpacing: 3,
                      fontWeight: 300
                    }}
                  >
                    to the Future of AI
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </MuiBox>

          {/* Professional Scan Lines */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(99, 102, 241, 0.03) 2px,
                rgba(99, 102, 241, 0.03) 4px
              )`
            }}
            animate={{ opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Professional 3D Scene Component
const ProfessionalScene = ({ stage, onStageComplete }) => {
  const { camera } = useThree();
  const coreRef = useRef();
  const ringRef = useRef();
  const particlesRef = useRef();
  const neuralNodesRef = useRef();

  useFrame((state, delta) => {
    if (window.webglContextLost) return;
    
    const time = state.clock.elapsedTime;
    
    // Core orb animation
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      
      if (stage === 'neural' || stage === 'transformation') {
        coreRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
      }
    }
    
    // Ring system
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
      ringRef.current.rotation.x += delta * 0.1;
    }
    
    // Neural nodes animation
    if (neuralNodesRef.current && stage === 'neural') {
      neuralNodesRef.current.children.forEach((node, i) => {
        node.position.y = Math.sin(time * 2 + i) * 0.5;
        node.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.2);
      });
    }
    
    // Dynamic camera movement
    if (stage === 'transformation') {
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6, delta * 0.5);
      camera.rotation.z = Math.sin(time * 0.5) * 0.02;
    }
  });

  // Stage transitions with smooth morphing
  useEffect(() => {
    if (stage === 'systemsOnline') {
      setTimeout(() => onStageComplete('systemsOnline'), 2000);
    } else if (stage === 'neural') {
      setTimeout(() => onStageComplete('neural'), 3000);
    } else if (stage === 'transformation') {
      setTimeout(() => onStageComplete('transformation'), 2500);
    }
  }, [stage, onStageComplete]);

  return (
    <>
      {/* Professional Lighting Setup */}
      <ambientLight intensity={0.2} color="#1e293b" />
      <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" />
      <pointLight position={[-10, -10, 5]} intensity={1.5} color="#22d3ee" />
      <spotLight
        position={[0, 0, 15]}
        angle={0.3}
        penumbra={1}
        intensity={3}
        color="#8b5cf6"
        castShadow
      />
      
      {/* Environment */}
      <Environment preset="night" />

      {/* Core Neural Orb */}
      <motion.group
        ref={coreRef}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: stage === 'transformation' ? 0 : 1,
          opacity: stage === 'transformation' ? 0 : 1
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#6366f1"
            attach="material"
            distort={stage === 'neural' ? 0.4 : 0.1}
            speed={stage === 'neural' ? 2 : 0.5}
            roughness={0.1}
            metalness={0.8}
            emissive="#22d3ee"
            emissiveIntensity={stage === 'neural' ? 0.3 : 0.1}
          />
        </Sphere>
        
        {/* Inner Energy Core */}
        <Sphere args={[0.8, 16, 16]} position={[0, 0, 0]}>
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={stage === 'neural' ? 0.8 : 0.4}
          />
        </Sphere>
      </motion.group>

      {/* Neural Ring System */}
      <motion.group
        ref={ringRef}
        initial={{ scale: 0, rotateX: Math.PI }}
        animate={{ 
          scale: stage === 'transformation' ? 3 : 1,
          rotateX: 0,
          opacity: stage === 'transformation' ? 0 : 1
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
      >
        {[2.5, 3.5, 4.5].map((radius, index) => (
          <Torus key={index} args={[radius, 0.05, 8, 32]} rotation={[Math.PI/2, 0, index * Math.PI/3]}>
            <meshPhysicalMaterial
              color={index === 0 ? "#6366f1" : index === 1 ? "#8b5cf6" : "#22d3ee"}
              transparent
              opacity={0.6}
              emissive={index === 0 ? "#6366f1" : index === 1 ? "#8b5cf6" : "#22d3ee"}
              emissiveIntensity={0.2}
            />
          </Torus>
        ))}
      </motion.group>

      {/* Neural Network Nodes */}
      {stage === 'neural' && (
        <group ref={neuralNodesRef}>
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * 6;
            const z = Math.sin(angle) * 6;
            return (
              <motion.group
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <ThreeBox args={[0.2, 0.2, 0.2]} position={[x, 0, z]}>
                  <meshPhysicalMaterial
                    color="#22d3ee"
                    emissive="#22d3ee"
                    emissiveIntensity={0.5}
                  />
                </ThreeBox>
              </motion.group>
            );
          })}
        </group>
      )}

      {/* Transformation Portal */}
      {stage === 'transformation' && (
        <motion.group
          initial={{ scale: 0 }}
          animate={{ scale: 10 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <Sphere args={[1, 32, 32]}>
            <meshBasicMaterial
              color="#8b5cf6"
              transparent
              opacity={0.1}
            />
          </Sphere>
        </motion.group>
      )}
    </>
  );
};

// Fallback Animation for compatibility
const FallbackAnimation = ({ stage, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: 120,
          height: 120,
          border: '3px solid #6366f1',
          borderRadius: '50%',
          marginBottom: 30,
        }}
      />
      
      <Typography variant="h5" sx={{ color: 'white', textAlign: 'center' }}>
        {stage === 'initializing' ? 'Initializing Neural Network' :
         stage === 'systemsOnline' ? 'Systems Online' :
         stage === 'neural' ? 'Neural Network Active' :
         'Welcome to the Future'}
      </Typography>
    </motion.div>
  );
};

export default IntroAnimationPro;
