import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Torus, Octahedron, Float, Trail, Sparkles, Preload } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Quantum Particle System for Hero
export const QuantumParticles = ({ count = 100 }) => {
  const particlesRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30
        ],
        scale: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.02 + 0.01,
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.8, 0.7)
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!particlesRef.current) return;
    
    // Initialize start time after first frame
    if (!startTime) {
      setStartTime(state.clock.elapsedTime);
      return;
    }
    
    // Wait 300ms before starting animation
    const elapsed = state.clock.elapsedTime - startTime;
    if (elapsed < 0.3) return;
    
    particles.forEach((particle, i) => {
      const child = particlesRef.current.children[i];
      if (child) {
        child.position.y += Math.sin(state.clock.elapsedTime * particle.speed + i) * 0.01; // Reduced speed
        child.position.x += Math.cos(state.clock.elapsedTime * particle.speed + i) * 0.005; // Reduced speed
        child.rotation.y += particle.speed * 0.5; // Reduced speed
        child.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.4; // Reduced speed
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
export const MorphingShapes = () => {
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

  const shapes = [
    { Component: Octahedron, position: [-8, 0, 0], color: '#6366f1' },
    { Component: Torus, position: [0, 0, 0], color: '#22d3ee', args: [2, 0.5, 16, 32] },
    { Component: Sphere, position: [8, 0, 0], color: '#8b5cf6' }
  ];

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <Float key={i} speed={2} rotationIntensity={1} floatIntensity={2}>
          <motion.group
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 2, delay: i * 0.5, ease: "backOut" }}
          >
            <shape.Component
              ref={(el) => (shapeRefs.current[i] = el)}
              position={shape.position}
              args={shape.args}
            >
              <meshStandardMaterial
                color={shape.color}
                transparent
                opacity={0.8}
                emissive={shape.color}
                emissiveIntensity={0.3}
                roughness={0.1}
                metalness={0.8}
              />
            </shape.Component>
            
            {/* Trailing effects */}
            <Trail
              width={2}
              length={8}
              color={shape.color}
              attenuation={(t) => t * t}
            >
              <Sphere scale={0.3} position={shape.position}>
                <meshStandardMaterial color={shape.color} emissive={shape.color} />
              </Sphere>
            </Trail>
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

// Main Hero 3D Scene
export const HeroScene3D = ({ mousePosition = { x: 0, y: 0 } }) => {
  const sceneRef = useRef();
  
  useFrame((state) => {
    if (sceneRef.current) {
      // Parallax effect based on mouse movement
      sceneRef.current.rotation.y = mousePosition.x * 0.1;
      sceneRef.current.rotation.x = mousePosition.y * 0.05;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#8b5cf6"
        castShadow
      />
      
      {/* 3D Elements */}
      <QuantumParticles count={80} />
      <MorphingShapes />
      <NeuralNetwork />
      
      {/* Preload for performance */}
      <Preload all />
    </group>
  );
};

export default HeroScene3D;

