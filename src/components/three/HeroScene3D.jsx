import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Float, Trail, Sparkles, Preload } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Ultra-Optimized Particle System for Hero
export const QuantumParticles = ({ count = 25, lowPerformanceMode = false }) => {
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [startTime, setStartTime] = useState(null);

  // Reduced particle count for performance
  const optimizedCount = lowPerformanceMode ? Math.min(count, 10) : Math.min(count, 25);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < optimizedCount; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20, // Reduced range
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ],
        scale: Math.random() * 0.3 + 0.1, // Reduced size
        speed: lowPerformanceMode ? 0.005 : (Math.random() * 0.015 + 0.005), // Slower
        color: new THREE.Color().setHSL(Math.random() * 0.2 + 0.65, 0.7, 0.6) // Less variation
      });
    }
    return temp;
  }, [optimizedCount, lowPerformanceMode]);

  useFrame((state) => {
    if (!particlesRef.current || lowPerformanceMode) return;
    
    // Initialize start time after first frame
    if (!startTime) {
      setStartTime(state.clock.elapsedTime);
      return;
    }
    
    // Wait 300ms before starting animation
    const elapsed = state.clock.elapsedTime - startTime;
    if (elapsed < 0.3) return;
    
    // Skip frames for better performance
    if (state.frameloop === 'demand' && Math.floor(state.clock.elapsedTime * 30) % 3 !== 0) return;
    
    particles.forEach((particle, i) => {
      const child = particlesRef.current.children[i];
      if (child) {
        child.position.y += Math.sin(state.clock.elapsedTime * particle.speed + i) * 0.005; // Ultra reduced speed
        child.position.x += Math.cos(state.clock.elapsedTime * particle.speed + i) * 0.002; // Ultra reduced speed
        child.rotation.y += particle.speed * 0.3; // Ultra reduced rotation
        child.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.8 + i) * 0.2; // Ultra reduced opacity variation
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
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            color={particle.color}
            transparent
            opacity={0.6}
            emissive={particle.color}
            emissiveIntensity={hovered ? 0.5 : 0.2}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Morphing Geometric Shapes
export const MorphingShapes = ({ lowPerformanceMode = false, reducedMotion = false }) => {
  const groupRef = useRef();
  const shapeRefs = useRef([]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      
      shapeRefs.current.forEach((shape, i) => {
        if (shape) {
          const time = state.clock.elapsedTime + i * 2;
          shape.position.y = Math.sin(time) * 2;
          shape.rotation.x = Math.cos(time * 0.5) * 0.5;
          shape.rotation.z = Math.sin(time * 0.3) * 0.3;
          shape.scale.setScalar(1 + Math.sin(time * 2) * 0.2);
        }
      });
    }
  });

  // Ultra-optimized shapes - reduced complexity
  const shapes = lowPerformanceMode ? 
    [{ Component: Sphere, position: [0, 0, 0], color: '#6366f1' }] :
    [
      { Component: Octahedron, position: [-6, 0, 0], color: '#6366f1' },
      { Component: Torus, position: [0, 0, 0], color: '#22d3ee', args: [1.5, 0.3, 8, 16] }, // Reduced segments
      { Component: Sphere, position: [6, 0, 0], color: '#8b5cf6' }
    ];

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float 
          key={i} 
          speed={lowPerformanceMode ? 0.5 : 1.5} 
          rotationIntensity={lowPerformanceMode ? 0.2 : 0.8} 
          floatIntensity={lowPerformanceMode ? 0.5 : 1.5}
        >
          <motion.group
            initial={reducedMotion ? { scale: 1 } : { scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              duration: reducedMotion ? 0.3 : 1.5, 
              delay: reducedMotion ? 0 : i * 0.3, 
              ease: "easeOut" 
            }}
          >
            <shape.Component
              ref={(el) => (shapeRefs.current[i] = el)}
              position={shape.position}
              args={shape.args}
            >
              <meshBasicMaterial // Changed to meshBasicMaterial for better performance
                color={shape.color}
                transparent
                opacity={lowPerformanceMode ? 0.4 : 0.6}
              />
            </shape.Component>
            
            {/* Conditional trailing effects - only for high performance */}
            {!lowPerformanceMode && !reducedMotion && (
              <Trail
                width={1}
                length={4}
                color={shape.color}
                attenuation={(t) => t * t}
              >
                <Sphere scale={0.2} position={shape.position}>
                  <meshBasicMaterial color={shape.color} />
                </Sphere>
              </Trail>
            )}
          </motion.group>
        </Float>
      ))}
      
      {/* Sparkle effects */}
      <Sparkles count={50} scale={20} size={3} speed={0.5} />
    </group>
  );
};

// Neural Network Background
export const NeuralNetwork = () => {
  const networkRef = useRef();
  const { size } = useThree();
  
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 25,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10
        ],
        connections: []
      });
    }
    
    // Create connections between nearby nodes
    temp.forEach((node, i) => {
      temp.forEach((otherNode, j) => {
        if (i !== j) {
          const distance = new THREE.Vector3(...node.position)
            .distanceTo(new THREE.Vector3(...otherNode.position));
          if (distance < 8 && Math.random() > 0.7) {
            node.connections.push(j);
          }
        }
      });
    });
    
    return temp;
  }, []);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      networkRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={networkRef}>
      {nodes.map((node, i) => (
        <group key={i}>
          {/* Node */}
          <Sphere position={node.position} scale={0.2}>
            <meshStandardMaterial
              color="#22d3ee"
              emissive="#22d3ee"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </Sphere>
          
          {/* Connections */}
          {node.connections.map((connectionIndex) => {
            const targetNode = nodes[connectionIndex];
            const start = new THREE.Vector3(...node.position);
            const end = new THREE.Vector3(...targetNode.position);
            const mid = start.clone().lerp(end, 0.5);
            mid.y += Math.sin(Date.now() * 0.001 + i) * 0.5;
            
            return (
              <line key={`${i}-${connectionIndex}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array([
                      ...node.position,
                      ...mid.toArray(),
                      ...targetNode.position
                    ])}
                    count={3}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#6366f1"
                  transparent
                  opacity={0.3}
                />
              </line>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// Main Hero 3D Scene - Ultra Optimized
export const HeroScene3D = ({ 
  mousePosition = { x: 0, y: 0 }, 
  lowPerformanceMode = false,
  reducedMotion = false 
}) => {
  const sceneRef = useRef();
  
  useFrame((state) => {
    if (sceneRef.current && !reducedMotion && !lowPerformanceMode) {
      // Reduced parallax effect for better performance
      sceneRef.current.rotation.y = mousePosition.x * 0.05;
      sceneRef.current.rotation.x = mousePosition.y * 0.025;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Optimized lighting - reduced complexity */}
      <ambientLight intensity={lowPerformanceMode ? 0.5 : 0.4} />
      {!lowPerformanceMode && (
        <>
          <pointLight position={[8, 8, 8]} intensity={0.6} color="#6366f1" />
          <pointLight position={[-8, -8, -8]} intensity={0.3} color="#22d3ee" />
        </>
      )}
      
      {/* Ultra-optimized 3D Elements */}
      <QuantumParticles 
        count={lowPerformanceMode ? 10 : 30} 
        lowPerformanceMode={lowPerformanceMode} 
      />
      <MorphingShapes 
        lowPerformanceMode={lowPerformanceMode}
        reducedMotion={reducedMotion}
      />
      {!lowPerformanceMode && <NeuralNetwork />}
      
      {/* Conditional preload */}
      {!lowPerformanceMode && <Preload all />}
    </group>
  );
};

export default HeroScene3D;

