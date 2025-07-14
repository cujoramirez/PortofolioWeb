import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const EnterpriseParticleField = ({ 
  count = 2000, 
  spread = 50, 
  speed = 0.001,
  color = '#6366f1',
  opacity = 0.6,
  size = 1.5,
  animationType = 'galaxy' // 'galaxy', 'wave', 'spiral', 'constellation'
}) => {
  const pointsRef = useRef();
  const timeRef = useRef(0);

  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      switch (animationType) {
        case 'galaxy':
          const radius = Math.random() * spread;
          const angle = Math.random() * Math.PI * 2;
          const height = (Math.random() - 0.5) * 10;
          positions[i3] = Math.cos(angle) * radius;
          positions[i3 + 1] = height;
          positions[i3 + 2] = Math.sin(angle) * radius;
          break;
          
        case 'wave':
          positions[i3] = (Math.random() - 0.5) * spread;
          positions[i3 + 1] = Math.sin(i * 0.1) * 5;
          positions[i3 + 2] = (Math.random() - 0.5) * spread;
          break;
          
        case 'spiral':
          const spiralAngle = i * 0.1;
          const spiralRadius = i * 0.01;
          positions[i3] = Math.cos(spiralAngle) * spiralRadius;
          positions[i3 + 1] = (i - count / 2) * 0.02;
          positions[i3 + 2] = Math.sin(spiralAngle) * spiralRadius;
          break;
          
        case 'constellation':
        default:
          positions[i3] = (Math.random() - 0.5) * spread;
          positions[i3 + 1] = (Math.random() - 0.5) * spread;
          positions[i3 + 2] = (Math.random() - 0.5) * spread;
      }
    }
    
    return positions;
  }, [count, spread, animationType]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    timeRef.current += speed;
    const positions = pointsRef.current.geometry.attributes.position.array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      switch (animationType) {
        case 'galaxy':
          const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
          const currentAngle = Math.atan2(positions[i3 + 2], positions[i3]);
          const newAngle = currentAngle + speed * (1 + radius * 0.01);
          positions[i3] = Math.cos(newAngle) * radius;
          positions[i3 + 2] = Math.sin(newAngle) * radius;
          break;
          
        case 'wave':
          positions[i3 + 1] = Math.sin(i * 0.1 + timeRef.current * 10) * 5;
          break;
          
        case 'spiral':
          const spiralSpeed = timeRef.current * 2;
          const spiralAngle = i * 0.1 + spiralSpeed;
          const spiralRadius = (i * 0.01) + Math.sin(timeRef.current * 5) * 2;
          positions[i3] = Math.cos(spiralAngle) * spiralRadius;
          positions[i3 + 2] = Math.sin(spiralAngle) * spiralRadius;
          break;
          
        case 'constellation':
          positions[i3] += Math.sin(timeRef.current * 2 + i * 0.1) * 0.01;
          positions[i3 + 1] += Math.cos(timeRef.current * 1.5 + i * 0.05) * 0.01;
          positions[i3 + 2] += Math.sin(timeRef.current * 1.8 + i * 0.08) * 0.01;
          break;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = timeRef.current * 0.1;
  });

  return (
    <Points ref={pointsRef} positions={positions}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation={true}
        opacity={opacity}
        vertexColors={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

export default EnterpriseParticleField;

