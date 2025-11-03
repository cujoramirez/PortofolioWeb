// @ts-nocheck
/* eslint-disable */
import { memo, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Optimized Interactive Particle System
const QuantumParticlesBase = ({ count = 12, lowPerformanceMode = false, mousePositionRef, mousePosition = { x: 0, y: 0 } }) => {
  const particlesRef = useRef();
  const startTimeRef = useRef(null);
  const targetPositionsRef = useRef([]);

  // Optimized particle count
  const optimizedCount = lowPerformanceMode ? 6 : count;

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < optimizedCount; i++) {
      const angle = (i / optimizedCount) * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      const basePos = [
        Math.cos(angle) * radius,
        Math.sin(i * 1.5) * 3,
        Math.sin(angle) * radius
      ];
      temp.push({
        position: basePos,
        basePosition: basePos,
        scale: Math.random() * 0.4 + 0.3,
        speed: Math.random() * 0.01 + 0.008,
        color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.75, 0.65)
      });
      targetPositionsRef.current[i] = basePos;
    }
    return temp;
  }, [optimizedCount]);

  useFrame((state) => {
    if (!particlesRef.current) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
      return;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    if (elapsed < 0.3) return;
    
    particles.forEach((particle, i) => {
      const child = particlesRef.current.children[i];
      if (child) {
        // Magnetism effect - particles move away from cursor
        const pointer = mousePositionRef?.current ?? mousePosition;
        const magnetStrength = lowPerformanceMode ? 2 : 3.5;
        const offsetX = -pointer.x * magnetStrength;
        const offsetY = pointer.y * magnetStrength;
        
        // Smooth orbital motion with cursor influence
        const time = state.clock.elapsedTime * particle.speed;
        const targetX = particle.basePosition[0] + offsetX + Math.cos(time) * 1.5;
        const targetY = particle.basePosition[1] + offsetY + Math.sin(time * 1.3) * 1.2;
        const targetZ = particle.basePosition[2] + Math.sin(time * 0.8) * 1.5;
        
        // Smooth interpolation
        child.position.x += (targetX - child.position.x) * 0.05;
        child.position.y += (targetY - child.position.y) * 0.05;
        child.position.z += (targetZ - child.position.z) * 0.05;
        
        // Rotation
        child.rotation.y += particle.speed * 0.5;
        child.rotation.x += particle.speed * 0.3;
        
        // Pulse effect
        const pulseScale = 1 + Math.sin(time * 2) * 0.15;
        child.scale.setScalar(particle.scale * pulseScale);
        
        // Dynamic opacity
        if (child.material) {
          child.material.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;
        }
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <Sphere
          key={i}
          position={particle.position}
          scale={particle.scale}
        >
          <MeshDistortMaterial
            color={particle.color}
            transparent
            opacity={0.7}
            emissive={particle.color}
            emissiveIntensity={0.4}
            distort={lowPerformanceMode ? 0 : 0.2}
            speed={2}
          />
        </Sphere>
      ))}
    </group>
  );
};

export const QuantumParticles = memo(QuantumParticlesBase);
QuantumParticles.displayName = 'QuantumParticles';

// Morphing Geometric Shapes with Magnetism
const MorphingShapesBase = ({ lowPerformanceMode = false, reducedMotion = false, mousePositionRef, mousePosition = { x: 0, y: 0 } }) => {
  const groupRef = useRef();
  const shapeRefs = useRef([]);

  useFrame((state) => {
    if (groupRef.current) {
      // Interactive rotation based on cursor - magnetism effect
      const pointer = mousePositionRef?.current ?? mousePosition;
      const targetRotationY = state.clock.elapsedTime * 0.08 - pointer.x * 0.4;
      const targetRotationX = -pointer.y * 0.3;
      
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      
      shapeRefs.current.forEach((shape, i) => {
        if (shape) {
          const time = state.clock.elapsedTime * 0.5 + i * 2;
          
          // Cursor influence on individual shapes
          const pointer = mousePositionRef?.current ?? mousePosition;
          const cursorInfluenceX = pointer.x * (i % 2 === 0 ? 1.5 : -1.5);
          const cursorInfluenceY = -pointer.y * 1.2;
          
          // Smooth position transitions
          const targetY = Math.sin(time) * 2 + cursorInfluenceY;
          const targetX = shape.userData.baseX + cursorInfluenceX;
          
          shape.position.y += (targetY - shape.position.y) * 0.05;
          shape.position.x += (targetX - shape.position.x) * 0.05;
          
          // Rotation
          shape.rotation.x = Math.cos(time * 0.5) * 0.5;
          shape.rotation.z = Math.sin(time * 0.3) * 0.3;
          
          // Scale pulse
          const scaleValue = 1 + Math.sin(time * 1.5) * 0.15;
          shape.scale.setScalar(scaleValue);
        }
      });
    }
  });

  // Simplified and optimized shapes
  const shapes = lowPerformanceMode ? 
    [{ Component: Sphere, position: [0, 0, 0], color: '#6366f1', args: [1, 16, 16] }] :
    [
      { Component: Octahedron, position: [-5, 0, -2], color: '#6366f1', args: [1.2] },
      { Component: Torus, position: [0, 0, 0], color: '#22d3ee', args: [1.5, 0.5, 16, 32] },
      { Component: Sphere, position: [5, 0, -2], color: '#a78bfa', args: [1, 24, 24] }
    ];

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float 
          key={i} 
          speed={lowPerformanceMode ? 0.5 : 1.2} 
          rotationIntensity={lowPerformanceMode ? 0.1 : 0.6} 
          floatIntensity={lowPerformanceMode ? 0.3 : 1}
        >
          <motion.group
            initial={reducedMotion ? { scale: 1 } : { scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              duration: reducedMotion ? 0.3 : 1.2, 
              delay: reducedMotion ? 0 : i * 0.25, 
              ease: "easeOut" 
            }}
          >
            <shape.Component
              ref={(el) => {
                if (el) {
                  shapeRefs.current[i] = el;
                  el.userData.baseX = shape.position[0];
                }
              }}
              position={shape.position}
              args={shape.args}
            >
              <MeshDistortMaterial
                color={shape.color}
                transparent
                opacity={lowPerformanceMode ? 0.5 : 0.7}
                emissive={shape.color}
                emissiveIntensity={0.3}
                distort={lowPerformanceMode ? 0 : 0.3}
                speed={lowPerformanceMode ? 1 : 2}
              />
            </shape.Component>
          </motion.group>
        </Float>
      ))}
      
      {/* Optimized sparkles */}
      {!lowPerformanceMode && !reducedMotion && (
        <Sparkles 
          count={25} 
          scale={15} 
          size={2} 
          speed={0.4} 
          opacity={0.6}
          color="#8b5cf6"
        />
      )}
    </group>
  );
};

export const MorphingShapes = memo(MorphingShapesBase);
MorphingShapes.displayName = 'MorphingShapes';

// Main Hero 3D Scene - Optimized with Interactive Magnetism
const HeroScene3DBase = ({ 
  mousePositionRef,
  mousePosition = { x: 0, y: 0 }, 
  lowPerformanceMode = false,
  reducedMotion = false 
}) => {
  const sceneRef = useRef();
  const smoothMouseRef = useRef({ x: 0, y: 0 });
  
  useFrame((state) => {
    if (sceneRef.current && !reducedMotion) {
      const pointer = mousePositionRef?.current ?? mousePosition;
      // Smooth mouse tracking with interpolation
      smoothMouseRef.current.x += (pointer.x - smoothMouseRef.current.x) * 0.05;
      smoothMouseRef.current.y += (pointer.y - smoothMouseRef.current.y) * 0.05;
      
      // 3D Magnetism effect - scene pans opposite to cursor
      // When cursor moves right (+x), scene rotates left (-y)
      // When cursor moves down (+y), scene tilts up (-x)
      const parallaxStrength = lowPerformanceMode ? 0.15 : 0.25;
      const targetRotationY = -smoothMouseRef.current.x * parallaxStrength;
      const targetRotationX = smoothMouseRef.current.y * parallaxStrength * 0.5;
      
      sceneRef.current.rotation.y += (targetRotationY - sceneRef.current.rotation.y) * 0.08;
      sceneRef.current.rotation.x += (targetRotationX - sceneRef.current.rotation.x) * 0.08;
      
      // Subtle depth effect
      const targetZ = smoothMouseRef.current.x * 0.5;
      sceneRef.current.position.z += (targetZ - sceneRef.current.position.z) * 0.05;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Optimized lighting */}
      <ambientLight intensity={lowPerformanceMode ? 0.6 : 0.5} />
      {!lowPerformanceMode && (
        <>
          <pointLight position={[10, 10, 10]} intensity={0.8} color="#6366f1" />
          <pointLight position={[-10, -5, -5]} intensity={0.4} color="#22d3ee" />
          <spotLight
            position={[0, 15, 0]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            color="#a78bfa"
            castShadow={false}
          />
        </>
      )}
      
      {/* Interactive 3D Elements with cursor influence */}
      <QuantumParticles 
        count={lowPerformanceMode ? 6 : 12} 
        lowPerformanceMode={lowPerformanceMode}
        mousePositionRef={mousePositionRef}
        mousePosition={smoothMouseRef.current}
      />
      <MorphingShapes 
        lowPerformanceMode={lowPerformanceMode}
        reducedMotion={reducedMotion}
        mousePositionRef={mousePositionRef}
        mousePosition={smoothMouseRef.current}
      />
    </group>
  );
};
export const HeroScene3D = memo(HeroScene3DBase);
HeroScene3D.displayName = 'HeroScene3D';

export default HeroScene3D;

