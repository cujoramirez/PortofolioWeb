import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Billboard } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const ProjectCard3D = ({ 
  project, 
  position = [0, 0, 0], 
  index = 0 
}) => {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!cardRef.current) return;
    
    cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
    
    if (hovered) {
      cardRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
    } else {
      cardRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  return (
    <motion.group
      position={position}
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ 
        duration: 1, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
    >
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={cardRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <boxGeometry args={[3, 4, 0.2]} />
          <meshStandardMaterial
            color={project.color || '#1e293b'}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
            emissive={project.color || '#1e293b'}
            emissiveIntensity={hovered ? 0.3 : 0.1}
          />
        </mesh>
        
        <Billboard position={[0, 1, 0.2]}>
          <Center>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.2}
              height={0.02}
              curveSegments={12}
            >
              {project.title}
              <meshStandardMaterial 
                color="white" 
                emissive="white"
                emissiveIntensity={0.2}
              />
            </Text3D>
          </Center>
        </Billboard>
        
        <Billboard position={[0, 0, 0.2]}>
          <Center>
            <Text3D
              font="/fonts/helvetiker_regular.typeface.json"
              size={0.1}
              height={0.01}
              curveSegments={8}
            >
              {project.category}
              <meshStandardMaterial 
                color="#94a3b8" 
                emissive="#94a3b8"
                emissiveIntensity={0.1}
              />
            </Text3D>
          </Center>
        </Billboard>
      </Float>
    </motion.group>
  );
};

export const ProjectGallery3D = ({ projects = [] }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const positions = useMemo(() => {
    return projects.map((_, index) => {
      const angle = (index / projects.length) * Math.PI * 2;
      const radius = 6;
      return [
        Math.cos(angle) * radius,
        Math.sin(index * 0.5) * 2,
        Math.sin(angle) * radius
      ];
    });
  }, [projects]);

  return (
    <group ref={groupRef}>
      {projects.map((project, index) => (
        <ProjectCard3D
          key={project.id || index}
          project={project}
          position={positions[index]}
          index={index}
        />
      ))}
    </group>
  );
};

export const DataVisualization = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  const points = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    
    for (let i = 0; i < 1000; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      positions.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5);
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, []);

  return (
    <points ref={meshRef} geometry={points}>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ProjectCard3D;
