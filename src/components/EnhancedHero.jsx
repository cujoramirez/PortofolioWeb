import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  MeshDistortMaterial, 
  Float, 
  Center,
  Environment,
  PerspectiveCamera,
  useTexture
} from '@react-three/drei';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Box,
  Container, 
  Typography, 
  Button, 
  Grid, 
  Avatar,
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  PlayArrow, 
  RocketLaunch,
  Psychology,
  Code
} from '@mui/icons-material';
import * as THREE from 'three';
import EnterpriseMotion from './animations/EnterpriseMotion.jsx';

// Enhanced Interactive Morphing Geometry Component
const MorphingGeometry = () => {
  const meshRef = useRef();
  const materialRef = useRef();
  const [morphState, setMorphState] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Complex morphing animation with mouse interaction
      const time = state.clock.elapsedTime;
      const mouseX = state.mouse.x;
      const mouseY = state.mouse.y;
      
      // Enhanced rotation with mouse influence and hover state
      const hoverMultiplier = isHovered ? 2 : 1;
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.2 + mouseY * 0.5 * hoverMultiplier;
      meshRef.current.rotation.y += 0.005 + mouseX * 0.02 * hoverMultiplier;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.1 + mouseX * 0.15 * hoverMultiplier;
      
      // Interactive morphing based on mouse position
      const morphProgress = (Math.sin(time * 0.5) + 1) / 2;
      const mouseInfluence = (Math.abs(mouseX) + Math.abs(mouseY)) * 0.8 * hoverMultiplier;
      const scale = 0.8 + morphProgress * 0.4 + mouseInfluence * 0.3;
      meshRef.current.scale.setScalar(scale);
      
      // Enhanced material properties with interaction
      if (materialRef.current) {
        const baseDistort = 0.2 + morphProgress * 0.6;
        const mouseDistort = mouseInfluence * 0.5;
        materialRef.current.distort = baseDistort + mouseDistort;
        materialRef.current.speed = 1 + morphProgress * 3 + mouseInfluence * 2;
        
        // Color shifting based on mouse position
        const hue = (time * 0.1 + mouseX * 0.2 + mouseY * 0.1) % 1;
        materialRef.current.color.setHSL(0.6 + hue * 0.4, 0.8, 0.6);
      }
    }
  });

  // Mouse interaction handlers
  const handlePointerOver = () => setIsHovered(true);
  const handlePointerOut = () => setIsHovered(false);

  return (
    <Float
      speed={isHovered ? 4 : 2}
      rotationIntensity={isHovered ? 1.5 : 0.8}
      floatIntensity={isHovered ? 1.5 : 0.8}
      floatingRange={[0, 0.8]}
    >
      <mesh 
        ref={meshRef} 
        position={[0, 0, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          ref={materialRef}
          color="#6366f1"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#6366f1"
          emissiveIntensity={isHovered ? 0.3 : 0.1}
          transparent
          opacity={isHovered ? 0.9 : 0.8}
        />
      </mesh>
    </Float>
  );
};

// Enhanced Interactive Particle Field Component with Bubbly Effects
const ParticleField = () => {
  const pointsRef = useRef();
  const particleCount = 1500; // Increased for more bubbly effect
  
  const particles = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      // Velocities for bubble-like movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Enhanced colors with more variety
      const color = new THREE.Color();
      const hue = Math.random() * 0.5 + 0.4; // Blue to cyan to purple range
      color.setHSL(hue, 0.8 + Math.random() * 0.2, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      // Variable sizes for bubble effect
      sizes[i] = Math.random() * 0.8 + 0.2;
    }
    
    return { positions, colors, velocities, sizes };
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      const mouseX = state.mouse.x;
      const mouseY = state.mouse.y;
      const time = state.clock.elapsedTime;
      
      // Enhanced rotation with mouse influence
      pointsRef.current.rotation.x += 0.0005 + mouseY * 0.002;
      pointsRef.current.rotation.y += 0.001 + mouseX * 0.003;
      
      // Interactive particle movement with bubble physics
      const positions = pointsRef.current.geometry.attributes.position.array;
      const colors = pointsRef.current.geometry.attributes.color.array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Bubble-like floating motion
        positions[i3] += particles.velocities[i3] + Math.sin(time * 0.5 + i * 0.01) * 0.003;
        positions[i3 + 1] += particles.velocities[i3 + 1] + Math.cos(time * 0.7 + i * 0.01) * 0.003;
        positions[i3 + 2] += particles.velocities[i3 + 2] + Math.sin(time * 0.3 + i * 0.01) * 0.002;
        
        // Enhanced wave motion with mouse interaction
        positions[i3 + 1] += Math.sin(time + positions[i3]) * 0.002;
        positions[i3] += Math.cos(time + positions[i3 + 2]) * 0.001;
        
        // Strong mouse influence for interactive feel
        const mouseInfluenceX = mouseX * 0.0008;
        const mouseInfluenceY = mouseY * 0.0006;
        positions[i3] += mouseInfluenceX * (1 + Math.sin(i * 0.1));
        positions[i3 + 1] += mouseInfluenceY * (1 + Math.cos(i * 0.1));
        positions[i3 + 2] += (mouseInfluenceX + mouseInfluenceY) * 0.5;
        
        // Boundary wrapping for infinite effect
        const boundary = 15;
        if (Math.abs(positions[i3]) > boundary) positions[i3] *= -0.8;
        if (Math.abs(positions[i3 + 1]) > boundary) positions[i3 + 1] *= -0.8;
        if (Math.abs(positions[i3 + 2]) > boundary) positions[i3 + 2] *= -0.8;
        
        // Dynamic color shifting based on movement and mouse
        const distance = Math.sqrt(positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2);
        const colorShift = (time * 0.1 + distance * 0.01 + mouseX * 0.2 + mouseY * 0.2) % 1;
        const color = new THREE.Color();
        color.setHSL(0.6 + colorShift * 0.4, 0.8, 0.6 + Math.sin(time + i * 0.1) * 0.2);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        alphaTest={0.001}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

// Holographic Text Component (using simple mesh instead of Text3D)
const HolographicText = ({ text, position = [0, 0, 0] }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.material.emissiveIntensity = 
        0.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[2, 0.5, 0.1]} />
      <meshPhysicalMaterial
        color="#22d3ee"
        emissive="#22d3ee"
        emissiveIntensity={0.2}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

// Interactive Bubble Orbs Component
const InteractiveBubbles = () => {
  const groupRef = useRef();
  const bubblesRef = useRef([]);
  const bubbleCount = 15;

  const bubbleData = React.useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      ],
      scale: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.3,
      color: new THREE.Color().setHSL(
        Math.random() * 0.3 + 0.5, // Blue to purple range
        0.8,
        0.6
      )
    }));
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const mouseX = state.mouse.x;
    const mouseY = state.mouse.y;

    bubblesRef.current.forEach((bubble, index) => {
      if (bubble) {
        const data = bubbleData[index];
        
        // Floating bubble motion
        bubble.position.y += Math.sin(time * data.speed + index) * 0.005;
        bubble.position.x += Math.cos(time * data.speed * 0.7 + index) * 0.003;
        bubble.position.z += Math.sin(time * data.speed * 0.5 + index) * 0.002;
        
        // Mouse attraction/repulsion
        const mouseDistance = Math.sqrt(mouseX**2 + mouseY**2);
        const attraction = mouseDistance > 0.5 ? 1 : -1; // Repel when close, attract when far
        
        bubble.position.x += mouseX * 0.008 * attraction;
        bubble.position.y += mouseY * 0.008 * attraction;
        
        // Bubble scaling with breathing effect
        const breathe = Math.sin(time * 2 + index) * 0.1 + 1;
        const mouseScale = 1 + mouseDistance * 0.3;
        bubble.scale.setScalar(data.scale * breathe * mouseScale);
        
        // Color shifting
        if (bubble.material) {
          const hue = (data.color.getHSL({}).h + time * 0.1 + mouseX * 0.2) % 1;
          bubble.material.color.setHSL(hue, 0.8, 0.6 + mouseDistance * 0.2);
          bubble.material.emissiveIntensity = 0.2 + mouseDistance * 0.3;
        }
        
        // Boundary wrapping
        const boundary = 8;
        if (Math.abs(bubble.position.x) > boundary) bubble.position.x *= -0.9;
        if (Math.abs(bubble.position.y) > boundary) bubble.position.y *= -0.9;
        if (Math.abs(bubble.position.z) > boundary) bubble.position.z *= -0.9;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {bubbleData.map((data, index) => (
        <Float
          key={index}
          speed={1 + index * 0.2}
          rotationIntensity={0.2}
          floatIntensity={0.5}
        >
          <mesh
            ref={(el) => (bubblesRef.current[index] = el)}
            position={data.position}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial
              color={data.color}
              metalness={0.1}
              roughness={0.1}
              transparent
              opacity={0.4}
              transmission={0.8}
              thickness={0.5}
              emissive={data.color}
              emissiveIntensity={0.1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

// Energy Orbs Component
const EnergyOrbs = () => {
  const orbPositions = [
    [-3, 2, -2],
    [3, -1, -1],
    [-2, -2, 1],
    [2, 2, 0],
    [0, 3, -3]
  ];

  return (
    <>
      {orbPositions.map((position, index) => (
        <Float
          key={index}
          speed={1 + index * 0.5}
          rotationIntensity={0.3}
          floatIntensity={0.3}
        >
          <mesh position={position}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#6366f1" : "#22d3ee"}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
};

// Main 3D Scene with Enhanced Mouse Interaction
const HeroScene = ({ scrollY }) => {
  const { camera, mouse, viewport } = useThree();
  const groupRef = useRef();
  const lightRef = useRef();
  const ambientLightRef = useRef();
  
  useFrame((state) => {
    // Camera movement based on scroll and mouse
    const mouseInfluence = Math.sqrt(mouse.x**2 + mouse.y**2);
    camera.position.z = 5 + scrollY * 0.01 + mouseInfluence * 2;
    
    // Enhanced camera tracking with smooth mouse following
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
    
    // Interactive mouse movement for entire scene
    if (groupRef.current) {
      groupRef.current.rotation.x = mouse.y * 0.3;
      groupRef.current.rotation.y = mouse.x * 0.3;
      
      // Add gentle swaying motion
      const time = state.clock.elapsedTime;
      groupRef.current.position.x = Math.sin(time * 0.2) * 0.5 + mouse.x * 0.5;
      groupRef.current.position.y = Math.cos(time * 0.15) * 0.3 + mouse.y * 0.3;
    }
    
    // Dynamic light movement following mouse with intensity changes
    if (lightRef.current) {
      lightRef.current.position.x = mouse.x * 8;
      lightRef.current.position.y = mouse.y * 8;
      lightRef.current.intensity = 2.5 + mouseInfluence * 2;
    }
    
    // Ambient light pulsing based on mouse movement
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.3 + mouseInfluence * 0.4;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      
      {/* Enhanced Lighting Setup with Interactive Elements */}
      <ambientLight ref={ambientLightRef} intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
      <pointLight position={[-10, -10, 5]} intensity={1.0} color="#22d3ee" />
      <pointLight position={[5, -8, 8]} intensity={0.8} color="#8b5cf6" />
      <spotLight
        ref={lightRef}
        position={[0, 0, 10]}
        angle={0.5}
        penumbra={1}
        intensity={2.5}
        color="#ffffff"
      />

      <Environment preset="night" />
      
      {/* Interactive 3D Elements Group */}
      <group ref={groupRef}>
        <ParticleField />
        <MorphingGeometry />
        <InteractiveBubbles />
        <EnergyOrbs />
        
        {/* Holographic Elements */}
        <HolographicText text="AI" position={[-2, 1, -1]} />
        <HolographicText text="ML" position={[2, -1, -1]} />
      </group>
    </>
  );
};

// Enhanced Hero Component with Mouse Tracking
const EnhancedHero = ({ introComplete }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { scrollY } = useScroll();
  const containerRef = useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse tracking for interactive text
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <AnimatePresence>
      {introComplete && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ y, opacity }}
        >
          <Box
            component="section"
            id="hero"
            sx={{
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(125% 125% at 50% 10%, #000 30%, #0f172a 60%, #1e293b 90%, #334155 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, rgba(34, 211, 238, 0.06) 0%, transparent 50%),
                  repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    transparent 98px,
                    rgba(99, 102, 241, 0.02) 100px,
                    rgba(99, 102, 241, 0.02) 102px
                  )
                `,
                zIndex: 1,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)',
                zIndex: 1,
              }
            }}
          >
            {/* 3D Background */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 75 }}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                }}
                gl={{ 
                  antialias: true, 
                  alpha: true,
                  preserveDrawingBuffer: true,
                  powerPreference: "high-performance",
                  failIfMajorPerformanceCaveat: false
                }}
                onCreated={({ gl }) => {
                  // Add context loss event listeners
                  gl.domElement.addEventListener('webglcontextlost', (e) => {
                    console.warn('WebGL context lost, preventing default behavior');
                    e.preventDefault();
                  });
                  
                  gl.domElement.addEventListener('webglcontextrestored', () => {
                    console.log('WebGL context restored');
                  });
                }}
                fallback={
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))'
                  }}>
                    <Typography variant="h6" sx={{ color: 'white', opacity: 0.7 }}>
                      Loading 3D Experience...
                    </Typography>
                  </Box>
                }
              >
                <Suspense fallback={null}>
                  <HeroScene scrollY={scrollY.get()} />
                </Suspense>
              </Canvas>
            </Box>

            {/* Content Container */}
            <Container 
              maxWidth="xl" 
              sx={{ 
                position: 'relative', 
                zIndex: 10,
                textAlign: 'center',
                pt: { xs: 4, md: 8 },
                pb: { xs: 8, md: 12 }
              }}
            >
              <EnterpriseMotion.HeroContainer>
                {/* Main Title */}
                <EnterpriseMotion.HeroTitle>
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotateX: 45 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: { xs: '3rem', md: '5rem', lg: '7rem' },
                        fontWeight: 900,
                        mb: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 25%, #22d3ee 50%, #10b981 75%, #f59e0b 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                        position: 'relative',
                        zIndex: 10,
                        filter: 'none',
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        backfaceVisibility: 'hidden',
                        transform: `translateZ(0) translateX(${mousePosition.x * 15}px) translateY(${mousePosition.y * 8}px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 2}deg)`,
                        transition: 'transform 0.3s ease',
                        textShadow: `${mousePosition.x * 8}px ${mousePosition.y * 8}px 30px rgba(99, 102, 241, ${0.2 + Math.abs(mousePosition.x) * 0.3})`,
                      }}
                    >
                      Gading Aditya Perdana
                    </Typography>
                  </motion.div>
                </EnterpriseMotion.HeroTitle>

                {/* Subtitle */}
                <EnterpriseMotion.HeroSubtitle>
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: { xs: '1.5rem', md: '2.5rem', lg: '3rem' },
                        fontWeight: 600,
                        mb: 4,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        position: 'relative',
                        zIndex: 10,
                        textRendering: 'optimizeLegibility',
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                      }}
                    >
                      <motion.span
                        animate={{
                          color: [
                            '#6366f1',
                            '#8b5cf6',
                            '#22d3ee',
                            '#10b981',
                            '#6366f1',
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        style={{
                          display: 'inline-block',
                          position: 'relative',
                          cursor: 'default', // Changed from 'pointer' to 'default'
                          textRendering: 'optimizeLegibility',
                          WebkitFontSmoothing: 'antialiased',
                          MozOsxFontSmoothing: 'grayscale',
                          filter: 'none',
                          transition: 'all 0.3s ease',
                          backfaceVisibility: 'hidden',
                          transform: `translateZ(0) translateX(${mousePosition.x * 10}px) translateY(${mousePosition.y * 5}px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 3}deg)`,
                          textShadow: `${mousePosition.x * 5}px ${mousePosition.y * 5}px 20px rgba(99, 102, 241, ${0.3 + Math.abs(mousePosition.x) * 0.4})`,
                        }}
                      >
                        AI/ML ENGINEER
                      </motion.span>
                    </Typography>
                  </motion.div>
                </EnterpriseMotion.HeroSubtitle>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      fontWeight: 400,
                      mb: 6,
                      color: 'rgba(255, 255, 255, 0.85)',
                      maxWidth: '800px',
                      mx: 'auto',
                      lineHeight: 1.8,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      position: 'relative',
                      zIndex: 10,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '50%',
                        bottom: '-20px',
                        transform: 'translateX(-50%)',
                        width: '60px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                        borderRadius: '1px',
                      }
                    }}
                  >
                    Pioneering the future of artificial intelligence through innovative machine learning 
                    solutions and cutting-edge research. Transforming ideas into intelligent reality.
                  </Typography>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 2 }}
                >
                  <Grid container spacing={3} justifyContent="center" sx={{ mb: 6 }}>
                    <Grid>
                      <motion.div
                        whileHover={{ scale: 1.08, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<RocketLaunch />}
                          onClick={() => {
                            // Enhanced professional transition to portfolio
                            const portfolioTransition = () => {
                              // Professional loading effect
                              document.body.style.cursor = 'wait';
                              
                              // Add smooth visual feedback
                              const button = document.activeElement;
                              if (button) {
                                button.style.transform = 'scale(0.95)';
                                button.style.opacity = '0.8';
                              }
                              
                              // Trigger transition with professional timing
                              setTimeout(() => {
                                window.dispatchEvent(new CustomEvent('exploreMyWork'));
                                document.body.style.cursor = 'default';
                                
                                // Reset button style
                                if (button) {
                                  button.style.transform = '';
                                  button.style.opacity = '';
                                }
                              }, 300);
                            };
                            
                            portfolioTransition();
                          }}
                          sx={{
                            px: 8,
                            py: 3,
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                            border: '2px solid transparent',
                            borderRadius: '60px',
                            position: 'relative',
                            overflow: 'hidden',
                            textTransform: 'none',
                            letterSpacing: '0.5px',
                            boxShadow: '0 16px 50px rgba(99, 102, 241, 0.5), 0 6px 25px rgba(139, 92, 246, 0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #22d3ee 50%, #10b981 100%)',
                              boxShadow: '0 24px 70px rgba(99, 102, 241, 0.7), 0 10px 35px rgba(139, 92, 246, 0.5)',
                              border: '2px solid rgba(255, 255, 255, 0.3)',
                              transform: 'translateY(-6px)',
                            },
                            '&:active': {
                              transform: 'translateY(-2px) scale(0.98)',
                              boxShadow: '0 12px 40px rgba(99, 102, 241, 0.6), 0 4px 20px rgba(139, 92, 246, 0.4)',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: 0,
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                              transform: 'translateX(-100%)',
                              transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                            },
                            '&:hover::before': {
                              transform: 'translateX(100%)',
                            },
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              inset: '-3px',
                              background: 'linear-gradient(45deg, #6366f1, #8b5cf6, #22d3ee, #10b981, #6366f1)',
                              borderRadius: '60px',
                              zIndex: -1,
                              backgroundSize: '400% 400%',
                              animation: 'gradientShift 4s ease infinite',
                              opacity: 0.8,
                            },
                            '@keyframes gradientShift': {
                              '0%': { backgroundPosition: '0% 50%' },
                              '50%': { backgroundPosition: '100% 50%' },
                              '100%': { backgroundPosition: '0% 50%' },
                            }
                          }}
                        >
                          Explore My Work
                        </Button>
                      </motion.div>
                    </Grid>
                  </Grid>
                </motion.div>
              </EnterpriseMotion.HeroContainer>
            </Container>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedHero;

