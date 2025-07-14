import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Text } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const InteractiveTechSphere = ({ 
  technology, 
  position = [0, 0, 0], 
  onHover, 
  isHovered = false 
}) => {
  const sphereRef = useRef();
  const [clicked, setClicked] = useState(false);
  const [startTime, setStartTime] = useState(null);

  useFrame((state) => {
    if (!sphereRef.current) return;
    
    // Initialize start time after first frame
    if (!startTime) {
      setStartTime(state.clock.elapsedTime);
      return;
    }
    
    // Wait 200ms before starting animation to prevent initial fast spinning
    const elapsed = state.clock.elapsedTime - startTime;
    if (elapsed < 0.2) return;
    
    try {
      sphereRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1; // Reduced speed
      sphereRef.current.rotation.y += 0.005; // Reduced speed
      
      if (isHovered) {
        sphereRef.current.scale.setScalar(
          1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1 // Reduced speed
        );
      } else {
        sphereRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    } catch (error) {
      console.warn('Animation frame error:', error);
    }
  });

  return (
    <motion.group
      position={position}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => onHover?.(technology)}
      onPointerOut={() => onHover?.(null)}
      initial={{ scale: 0, rotateY: -180 }}
      animate={{ 
        scale: 1, 
        rotateY: 0,
        rotateX: clicked ? 360 : 0
      }}
      transition={{ 
        duration: 1.5, 
        ease: [0.175, 0.885, 0.32, 1.275],
        rotateX: { duration: 2, ease: "linear" }
      }}
    >
      <Float
        speed={1.5}
        rotationIntensity={0.5}
        floatIntensity={0.3}
      >
        <Sphere
          ref={sphereRef}
          args={[1, 64, 64]}
          scale={isHovered ? 1.2 : 1}
        >
          <MeshDistortMaterial
            color={technology.color || '#6366f1'}
            roughness={0.2}
            metalness={0.8}
            distort={isHovered ? 0.4 : 0.2}
            speed={2}
            transparent
            opacity={0.8}
            emissive={technology.color || '#6366f1'}
            emissiveIntensity={isHovered ? 0.3 : 0.1}
          />
        </Sphere>
        
        {/* Simple Text Label */}
        <Text
          position={[0, 0, 1.5]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {technology.name}
        </Text>
      </Float>
    </motion.group>
  );
};

export const TechConstellation = ({ technologies, hoveredTech, setHoveredTech }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      try {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      } catch (error) {
        console.warn('TechConstellation animation error:', error);
      }
    }
  });

  // Safety check for technologies array
  if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
    return null;
  }

  const positions = technologies.map((_, index) => {
    const angle = (index / technologies.length) * Math.PI * 2;
    const radius = 8;
    const height = Math.sin(angle * 2) * 2;
    return [
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    ];
  });

  return (
    <group ref={groupRef}>
      {technologies.map((tech, index) => (
        <InteractiveTechSphere
          key={tech.name}
          technology={tech}
          position={positions[index]}
          onHover={setHoveredTech}
          isHovered={hoveredTech === tech.name}
        />
      ))}
      
      {/* Simplified Connecting Lines */}
      {positions.length > 1 && (
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(positions.slice(0, 6).flat())} // Limit to first 6 positions
              count={Math.min(positions.length, 6)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#6366f1" 
            transparent 
            opacity={0.2}
          />
        </lineSegments>
      )}
    </group>
  );
};

export default InteractiveTechSphere;

