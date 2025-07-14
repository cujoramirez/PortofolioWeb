import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Text3D, Center } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const MorphingShape = ({ 
  geometry = 'sphere', 
  position = [0, 0, 0], 
  color = '#6366f1',
  size = 1 
}) => {
  const meshRef = useRef();
  const [currentGeometry, setCurrentGeometry] = useState(geometry);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    
    // Morph between geometries every 5 seconds
    const morphTime = Math.floor(state.clock.elapsedTime / 5) % 4;
    const geometries = ['sphere', 'box', 'octahedron', 'torus'];
    if (geometries[morphTime] !== currentGeometry) {
      setCurrentGeometry(geometries[morphTime]);
    }
  });

  const renderGeometry = () => {
    switch (currentGeometry) {
      case 'box':
        return <boxGeometry args={[size, size, size]} />;
      case 'octahedron':
        return <octahedronGeometry args={[size]} />;
      case 'torus':
        return <torusGeometry args={[size, size * 0.3, 16, 100]} />;
      default:
        return <sphereGeometry args={[size, 32, 32]} />;
    }
  };

  return (
    <motion.group
      position={position}
      initial={{ scale: 0, rotateY: -180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          {renderGeometry()}
          <MeshDistortMaterial
            color={color}
            roughness={0.1}
            metalness={0.9}
            distort={0.3}
            speed={1.5}
            transparent
            opacity={0.8}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      </Float>
    </motion.group>
  );
};

export const SkillsVisualization = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const skills = [
    { name: 'Frontend', color: '#3b82f6', position: [-4, 2, 0] },
    { name: 'Backend', color: '#10b981', position: [4, 2, 0] },
    { name: 'AI/ML', color: '#8b5cf6', position: [0, 2, 4] },
    { name: 'Mobile', color: '#f59e0b', position: [0, 2, -4] },
    { name: 'DevOps', color: '#ef4444', position: [-2, -1, 2] },
    { name: 'Design', color: '#ec4899', position: [2, -1, -2] }
  ];

  return (
    <group ref={groupRef}>
      {skills.map((skill, index) => (
        <group key={skill.name}>
          <MorphingShape
            position={skill.position}
            color={skill.color}
            size={0.8}
          />
          <Center position={[skill.position[0], skill.position[1] - 2, skill.position[2]]}>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.3}
              height={0.05}
              curveSegments={12}
            >
              {skill.name}
              <meshStandardMaterial 
                color="white" 
                emissive="white"
                emissiveIntensity={0.1}
              />
            </Text3D>
          </Center>
        </group>
      ))}
      
      {/* Central connecting sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.3}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export default MorphingShape;

