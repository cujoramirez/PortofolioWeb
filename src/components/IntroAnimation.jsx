import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  Environment, 
  PerspectiveCamera, 
  useTexture, 
  Sphere, 
  Box, 
  MeshDistortMaterial,
  Html,
  Float,
  Center,
  useProgress,
  Preload
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box as MuiBox, 
  Typography, 
  LinearProgress,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import * as THREE from 'three';

// Ultra-lightweight particle system for maximum WebGL stability
const OptimizedParticles = () => {
  const particlesRef = useRef();
  const particleCount = 8; // Reduced from 20 for maximum stability
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 4, // Further reduced range
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ],
        scale: Math.random() * 0.05 + 0.02, // Much smaller
        speed: Math.random() * 0.005 + 0.002 // Much slower
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.2;
      particlesRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, index) => (
        <Float
          key={index}
          speed={particle.speed * 10}
          rotationIntensity={0.1}
          floatIntensity={0.5}
        >
          <mesh position={particle.position}>
            <sphereGeometry args={[particle.scale, 8, 8]} />
            <meshStandardMaterial
              color="#6366f1"
              emissive="#4338ca"
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Loading Progress Component
const LoadingProgress = () => {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="text-center"
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white', 
            mb: 2, 
            fontWeight: 600,
            textShadow: '0 0 20px rgba(99, 102, 241, 0.8)'
          }}
        >
          Loading Experience...
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{
            width: 300,
            height: 6,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
              borderRadius: 3,
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)'
            }
          }}
        />
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            mt: 1,
            fontSize: '0.9rem'
          }}
        >
          {Math.round(progress)}%
        </Typography>
      </motion.div>
    </Html>
  );
};

// Animated Logo Component
const AnimatedLogo = ({ isLoaded }) => {
  const meshRef = useRef();
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    // Use delta for frame-rate independent animation
    const time = state.clock.elapsedTime;
    
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.2;
      meshRef.current.rotation.y += delta * 0.5; // Frame-rate independent
      meshRef.current.position.y = Math.sin(time * 0.8) * 0.1;
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.2;
      particlesRef.current.rotation.x += delta * 0.1;
    }
  });

  // Optimized particle system with reduced count
  const particleCount = 30; // Further reduced for optimal WebGL stability
  const particles = React.useMemo(() => {
    const temp = [];
    for (let i = 0; i < particleCount; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8, // Reduced range
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        ],
        scale: Math.random() * 0.15 + 0.05,
        speed: Math.random() * 0.02 + 0.01
      });
    }
    return temp;
  }, []);

  return (
    <group>
      {/* Main Logo Sphere */}
      <motion.group
        ref={meshRef}
        animate={isLoaded ? { scale: [1, 1.2, 0.8, 0] } : { scale: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Sphere args={[1, 16, 16]} position={[0, 0, 0]}> {/* Further reduced from 32,32 for stability */}
          <MeshDistortMaterial
            color="#6366f1"
            attach="material"
            distort={hovered ? 0.4 : 0.2} // Reduced distortion for performance
            speed={1} // Reduced from 2
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
        
        {/* Inner Core */}
        <Sphere args={[0.6, 12, 12]} position={[0, 0, 0]}> {/* Further reduced from 16,16 */}
          <meshPhysicalMaterial
            color="#22d3ee"
            transparent
            opacity={0.6}
            roughness={0}
            metalness={1}
            clearcoat={1}
            emissive="#22d3ee"
            emissiveIntensity={0.2}
          />
        </Sphere>
      </motion.group>
 

      {/* Ultra-optimized Particle System */}
      <group ref={particlesRef}>
        {particles.map((particle, index) => (
          <mesh key={index} position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[0.02, 4, 4]} /> {/* Minimal geometry for performance */}
            <meshBasicMaterial
              color={new THREE.Color().setHSL((index / particleCount) * 0.3 + 0.6, 1, 0.5)}
              transparent
              opacity={0.7} // Slightly reduced opacity
            />
          </mesh>
        ))}
      </group>

      {/* Simplified Rotating Rings - Reduced count for performance */}
      {[1.8, 2.3].map((radius, index) => ( // Reduced from 3 rings to 2
        <mesh key={index} rotation={[Math.PI / 2, 0, index * 0.8]}>
          <torusGeometry args={[radius, 0.02, 8, 50]} /> {/* Reduced geometry complexity */}
          <meshBasicMaterial
            color={index === 0 ? "#6366f1" : "#8b5cf6"}
            transparent
            opacity={0.5} // Reduced opacity
          />
        </mesh>
      ))}
    </group>
  );
};

// Gate Door Component
const GateDoor = ({ side, isOpening }) => {
  const meshRef = useRef();
  
  useFrame(() => {
    if (meshRef.current && isOpening) {
      const targetX = side === 'left' ? -8 : 8;
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x, 
        targetX, 
        0.05
      );
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]}>
      <boxGeometry args={[6, 12, 0.2]} />
      <meshPhysicalMaterial
        color="#1e293b"
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        emissive="#6366f1"
        emissiveIntensity={0.1}
      />
      
      {/* Gate Panel Details */}
      <mesh position={[side === 'left' ? 2 : -2, 0, 0.11]}>
        <boxGeometry args={[0.5, 8, 0.1]} />
        <meshPhysicalMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
    </mesh>
  );
};

// Liquid Transformation Component
const LiquidTransform = ({ isActive }) => {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.3;
      meshRef.current.rotation.y += 0.02;
      
      if (materialRef.current) {
        materialRef.current.distort = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      }
    }
  });

  return (
    <mesh ref={meshRef} scale={isActive ? [4, 4, 4] : [0, 0, 0]}>
      <sphereGeometry args={[1, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#8b5cf6"
        distort={0.6}
        speed={5}
        roughness={0}
        metalness={1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

// 3D Scene Component - FIXED VERSION
const Scene3D = ({ stage, onStageComplete }) => {
  const cameraRef = useRef();
  const [gateOpening, setGateOpening] = useState(false);
  const [liquidActive, setLiquidActive] = useState(false);

  useEffect(() => {
    if (stage === 'gateOpen') {
      setGateOpening(true);
      setTimeout(() => onStageComplete('gateOpen'), 2000);
    } else if (stage === 'liquidTransform') {
      setLiquidActive(true);
      setTimeout(() => onStageComplete('liquidTransform'), 1500);
    }
  }, [stage, onStageComplete]);

  useFrame((state, delta) => {
    if (cameraRef.current) {
      if (stage === 'liquidTransform') {
        const targetZ = 2;
        const currentZ = cameraRef.current.position.z;
        const distance = Math.abs(targetZ - currentZ);
        
        let lerpFactor = Math.min(delta * 0.5, 0.012);
        
        if (distance < 0.5) {
          lerpFactor *= 0.3;
        }
        
        if (distance > 3) {
          lerpFactor = 0.008;
        }
        
        cameraRef.current.position.z = THREE.MathUtils.lerp(
          currentZ, 
          targetZ, 
          lerpFactor
        );
        
        cameraRef.current.position.z = THREE.MathUtils.damp(
          cameraRef.current.position.z,
          targetZ,
          0.5,
          delta
        );
      }
    }
  });

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 5]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#22d3ee" />
      <spotLight
        position={[0, 0, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#8b5cf6"
        castShadow
      />

      {/* Environment */}
      <Environment preset="night" />

      {/* Content based on stage */}
      {stage === 'loading' && (
        <>
          <Suspense fallback={<LoadingProgress />}>
            <Preload all />
          </Suspense>
        </>
      )}

      {stage === 'loaded' && (
        <AnimatedLogo isLoaded={true} />
      )}

      {stage === 'gateOpen' && (
        <>
          <GateDoor side="left" isOpening={gateOpening} />
          <GateDoor side="right" isOpening={gateOpening} />
        </>
      )}

      {stage === 'liquidTransform' && (
        <LiquidTransform isActive={liquidActive} />
      )}
    </>
  );
};

// Main Intro Animation Component
const IntroAnimation = ({ onComplete }) => {
  const theme = useTheme();
  const [stage, setStage] = useState('loading');
  const [showCanvas, setShowCanvas] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleStageComplete = (completedStage) => {
    try {
      switch (completedStage) {
        case 'loading':
          setStage('loaded');
          setTimeout(() => setStage('gateOpen'), 500); // Faster initial transition
          break;
        case 'gateOpen':
          setStage('liquidTransform');
          break;
        case 'liquidTransform':
          setShowCanvas(false);
          setTimeout(() => onComplete(), 300); // Faster completion
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Stage transition error:', error);
      setHasError(true);
      setTimeout(() => onComplete(), 1000); // Fallback completion
    }
  };

  // Optimized loading completion with error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        handleStageComplete('loading');
      } catch (error) {
        console.error('Loading completion error:', error);
        setHasError(true);
        onComplete();
      }
    }, 2500); // Slightly faster loading
    return () => clearTimeout(timer);
  }, []);

  // Auto-recover from errors
  useEffect(() => {
    if (hasError) {
      const errorTimer = setTimeout(() => {
        onComplete();
      }, 1500);
      return () => clearTimeout(errorTimer);
    }
  }, [hasError, onComplete]);

  return (
    <AnimatePresence>
      {showCanvas && (
        <>
          {hasError ? (
            <FallbackAnimation stage={stage} onComplete={onComplete} />
          ) : (
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
              onError={() => setHasError(true)}
            >
          {/* Animated Background Particles */}
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
            style={{ opacity: 0.1 }}
          />

          {/* 3D Canvas with Error Handling */}
          <Canvas
            style={{ width: '100%', height: '100%' }}
            camera={{ position: [0, 0, 5], fov: 75 }}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: true,
              failIfMajorPerformanceCaveat: false,
              stencil: false,
              depth: true
            }}
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
            onCreated={({ gl, scene, camera }) => {
              // Optimize renderer settings for stability
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.0; // Reduced from 1.2
              gl.outputEncoding = THREE.sRGBEncoding;
              gl.shadowMap.enabled = false; // Disable shadows for better performance
              gl.shadowMap.type = THREE.PCFSoftShadowMap;
              
              // Conservative performance settings
              gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio
              gl.antialias = false; // Disable for performance
              gl.alpha = true;
              gl.premultipliedAlpha = false;
              gl.preserveDrawingBuffer = true;
              
              // Enhanced WebGL context loss prevention
              const canvas = gl.domElement;
              
              canvas.addEventListener('webglcontextlost', (event) => {
                event.preventDefault();
                console.warn('WebGL context lost, preventing default behavior');
                window.webglContextLost = true;
                // Pause all animations
                window.pauseAnimations = true;
              });
              
              canvas.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored successfully');
                window.webglContextLost = false;
                window.pauseAnimations = false;
                
                // Gentle restart
                setTimeout(() => {
                  gl.setSize(canvas.clientWidth, canvas.clientHeight);
                }, 100);
              });
              
              // Memory management
              const originalDispose = gl.dispose;
              gl.dispose = () => {
                console.log('Disposing WebGL context safely');
                if (originalDispose) originalDispose.call(gl);
              };
              
              // Error boundary for WebGL errors
              const handleWebGLError = (error) => {
                console.error('WebGL Error:', error);
                if (error.message.includes('CONTEXT_LOST')) {
                  window.webglContextLost = true;
                }
              };
              
              window.addEventListener('error', handleWebGLError);
              
              // Cleanup function
              gl.cleanup = () => {
                window.removeEventListener('error', handleWebGLError);
              };
            }}
            fallback={
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div>🌌</div>
                  <div style={{ marginTop: '10px' }}>Loading 3D Portal...</div>
                </div>
              </div>
            }
          >
            <Suspense fallback={null}>
              <Scene3D stage={stage} onStageComplete={handleStageComplete} />
            </Suspense>
          </Canvas>

          {/* UI Overlay */}
          <MuiBox
            sx={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              zIndex: 10
            }}
          >
            <AnimatePresence mode="wait">
              {stage === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 300,
                      letterSpacing: 2,
                      textTransform: 'uppercase'
                    }}
                  >
                    Initializing Experience
                  </Typography>
                </motion.div>
              )}

              {stage === 'gateOpen' && (
                <motion.div
                  key="gateOpen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      mb: 1,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gateway Opening
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: 1
                    }}
                  >
                    Entering Digital Dimension
                  </Typography>
                </motion.div>
              )}

              {stage === 'liquidTransform' && (
                <motion.div
                  key="liquidTransform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      mb: 1,
                      textShadow: '0 0 30px rgba(139, 92, 246, 0.8)'
                    }}
                  >
                    Transformation Complete
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      letterSpacing: 1.5
                    }}
                  >
                    Welcome to the Future
                  </Typography>
                </motion.div>
              )}
            </AnimatePresence>
          </MuiBox>

          {/* Scan Lines Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(99, 102, 241, 0.05) 2px,
                rgba(99, 102, 241, 0.05) 4px
              )`
            }}
            animate={{ opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

// 2D Fallback Animation Component
const FallbackAnimation = ({ stage, onComplete }) => {
  useEffect(() => {
    // Auto-complete stages faster in fallback mode
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
      {/* Animated Background */}
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 10,
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

      {/* Central Animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: 100,
          height: 100,
          border: '3px solid #6366f1',
          borderRadius: '50%',
          position: 'relative',
          marginBottom: 30,
        }}
      >
        <motion.div
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            inset: 10,
            background: 'radial-gradient(circle, #6366f1, transparent)',
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Stage Text */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            textAlign: 'center',
            fontWeight: 600,
            mb: 1,
          }}
        >
          {stage === 'loading' ? 'Gateway Opening' : 
           stage === 'gateOpen' ? 'Entering Digital Dimension' : 
           'Transformation Complete'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
          }}
        >
          Preparing enhanced experience...
        </Typography>
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;

