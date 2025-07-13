import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const GalaxyField = ({ count = 5000 }) => {
  const points = useRef();
  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Galaxy spiral pattern
      const radius = Math.random() * 50;
      const angle = Math.random() * Math.PI * 2;
      const spinAngle = radius * 0.1;
      
      positions[i3] = Math.cos(angle + spinAngle) * radius + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = Math.sin(angle + spinAngle) * radius + (Math.random() - 0.5) * 2;
      
      // Color based on distance from center
      const colorIntensity = Math.max(0.2, 1 - radius / 50);
      colors[i3] = colorIntensity;
      colors[i3 + 1] = colorIntensity * 0.8;
      colors[i3 + 2] = colorIntensity * 1.2;
    }
    
    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <Points ref={points} positions={particlesPosition.positions} colors={particlesPosition.colors}>
      <PointMaterial
        transparent
        color="#6366f1"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        vertexColors={true}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export const HeroOrbs = ({ count = 20 }) => {
  const orbsRef = useRef();
  const [startTime, setStartTime] = useState(null);
  
  const orbPositions = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30
      ],
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.02 + 0.01
    }));
  }, [count]);

  useFrame((state) => {
    if (!orbsRef.current) return;
    
    // Initialize start time after first frame
    if (!startTime) {
      setStartTime(state.clock.elapsedTime);
      return;
    }
    
    // Wait 250ms before starting animation
    const elapsed = state.clock.elapsedTime - startTime;
    if (elapsed < 0.25) return;
    
    orbsRef.current.children.forEach((orb, i) => {
      const orbData = orbPositions[i];
      orb.position.y += Math.sin(state.clock.elapsedTime * orbData.speed + i) * 0.005; // Reduced speed
      orb.rotation.x += orbData.speed * 0.5; // Reduced speed
      orb.rotation.y += orbData.speed * 0.3; // Reduced speed
    });
  });

  return (
    <group ref={orbsRef}>
      {orbPositions.map((orbData, index) => (
        <mesh key={index} position={orbData.position} scale={orbData.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default GalaxyField;
