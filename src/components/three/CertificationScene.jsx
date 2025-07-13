import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Box as DreiBox } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const FloatingCertificate = ({ 
  certificate, 
  position = [0, 0, 0], 
  index = 0 
}) => {
  const certRef = useRef();

  useFrame((state) => {
    if (!certRef.current) return;
    
    certRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.2;
    certRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3 + index) * 0.1;
  });

  return (
    <motion.group
      position={position}
      initial={{ scale: 0, rotateX: -90 }}
      animate={{ scale: 1, rotateX: 0 }}
      transition={{ 
        duration: 1.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 60
      }}
    >
      <Float speed={1 + index * 0.1} rotationIntensity={0.1} floatIntensity={0.2}>
        <DreiBox ref={certRef} args={[2, 1.5, 0.1]}>
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.1}
            metalness={0.1}
            transparent
            opacity={0.9}
            emissive="#1e293b"
            emissiveIntensity={0.05}
          />
        </DreiBox>
        
        <Center position={[0, 0.3, 0.1]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.12}
            height={0.01}
            curveSegments={8}
          >
            {certificate.name}
            <meshStandardMaterial 
              color="#1e293b" 
              emissive="#1e293b"
              emissiveIntensity={0.1}
            />
          </Text3D>
        </Center>
        
        <Center position={[0, 0, 0.1]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.08}
            height={0.005}
            curveSegments={6}
          >
            {certificate.issuer}
            <meshStandardMaterial 
              color="#64748b" 
              emissive="#64748b"
              emissiveIntensity={0.05}
            />
          </Text3D>
        </Center>
        
        <Center position={[0, -0.3, 0.1]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.06}
            height={0.005}
            curveSegments={6}
          >
            {certificate.year}
            <meshStandardMaterial 
              color="#94a3b8" 
            />
          </Text3D>
        </Center>
      </Float>
    </motion.group>
  );
};

export const CertificationGallery3D = ({ certificates = [] }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  const positions = useMemo(() => {
    return certificates.map((_, index) => {
      const layer = Math.floor(index / 6);
      const posInLayer = index % 6;
      const angle = (posInLayer / 6) * Math.PI * 2;
      const radius = 5 + layer * 2;
      
      return [
        Math.cos(angle) * radius,
        layer * 3 - certificates.length * 0.2,
        Math.sin(angle) * radius
      ];
    });
  }, [certificates]);

  return (
    <group ref={groupRef}>
      {certificates.map((cert, index) => (
        <FloatingCertificate
          key={cert.id || index}
          certificate={cert}
          position={positions[index]}
          index={index}
        />
      ))}
      
      {/* Central achievement beacon */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

export const AchievementStars = () => {
  const starsRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      positions[i3] = (Math.random() - 0.5) * 30;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 30;
      
      const brightness = Math.random();
      colors[i3] = 1;
      colors[i3 + 1] = 0.8 + brightness * 0.2;
      colors[i3 + 2] = 0.3 + brightness * 0.2;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      starsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default FloatingCertificate;
