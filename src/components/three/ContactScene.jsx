import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Plane } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const ContactSphere = ({ position = [0, 0, 0] }) => {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
      <mesh ref={sphereRef} position={position}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.7}
          emissive="#3b82f6"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
};

export const EmailParticles = () => {
  const particlesRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create email envelope shape pattern
      const t = i / count;
      const angle = t * Math.PI * 8;
      const radius = Math.sin(t * Math.PI) * 5;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(t * Math.PI * 2) * 3;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      colors[i3] = 0.2 + Math.random() * 0.3;
      colors[i3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
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
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const SocialIcons3D = ({ socialLinks = [] }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {socialLinks.map((social, index) => {
        const angle = (index / socialLinks.length) * Math.PI * 2;
        const radius = 4;
        const position = [
          Math.cos(angle) * radius,
          Math.sin(angle * 2) * 1,
          Math.sin(angle) * radius
        ];

        return (
          <motion.group
            key={social.name}
            position={position}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 1, 
              delay: index * 0.2,
              type: "spring"
            }}
          >
            <Float speed={1 + index * 0.2} rotationIntensity={0.3}>
              <mesh>
                <boxGeometry args={[1, 1, 0.2]} />
                <meshStandardMaterial
                  color={social.color || '#6366f1'}
                  roughness={0.2}
                  metalness={0.8}
                  emissive={social.color || '#6366f1'}
                  emissiveIntensity={0.2}
                />
              </mesh>
              
              <Center position={[0, 0, 0.2]}>
                <Text3D
                  font="/fonts/helvetiker_regular.typeface.json"
                  size={0.15}
                  height={0.02}
                  curveSegments={8}
                >
                  {social.name}
                  <meshStandardMaterial 
                    color="white" 
                    emissive="white"
                    emissiveIntensity={0.1}
                  />
                </Text3D>
              </Center>
            </Float>
          </motion.group>
        );
      })}
    </group>
  );
};

export const ContactForm3D = () => {
  const formRef = useRef();
  
  useFrame((state) => {
    if (formRef.current) {
      formRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <motion.group
      ref={formRef}
      initial={{ opacity: 0, z: -10 }}
      animate={{ opacity: 1, z: 0 }}
      transition={{ duration: 1.5 }}
    >
      <Plane args={[6, 8]} position={[0, 0, -0.1]}>
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.1}
          roughness={0.8}
        />
      </Plane>
      
      <Center position={[0, 3, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.5}
          height={0.1}
          curveSegments={12}
        >
          Let's Connect
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6"
            emissiveIntensity={0.3}
          />
        </Text3D>
      </Center>
    </motion.group>
  );
};

export default ContactSphere;
