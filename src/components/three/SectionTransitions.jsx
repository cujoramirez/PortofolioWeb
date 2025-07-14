import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Plane, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Wave Transition Effect
export const WaveTransition = ({ progress = 0, direction = 'up' }) => {
  const waveRef = useRef();
  
  const waveGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(100, 20, 100, 20);
    const positions = geometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      positions.setZ(i, Math.sin(x * 0.1) * Math.cos(y * 0.1) * 2);
    }
    
    geometry.computeVertexNormals();
    return geometry;
  }, []);

  useFrame((state) => {
    if (waveRef.current) {
      const positions = waveRef.current.geometry.attributes.position;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const waveY = Math.sin(x * 0.1 + state.clock.elapsedTime * 2) * 
                     Math.cos(y * 0.1 + state.clock.elapsedTime) * 
                     (2 + progress * 3);
        positions.setZ(i, waveY);
      }
      
      positions.needsUpdate = true;
      waveRef.current.geometry.computeVertexNormals();
    }
  });

  return (
    <mesh
      ref={waveRef}
      geometry={waveGeometry}
      position={[0, direction === 'up' ? -10 + progress * 20 : 10 - progress * 20, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <MeshWobbleMaterial
        color="#6366f1"
        transparent
        opacity={0.6}
        factor={1}
        speed={2}
      />
    </mesh>
  );
};

// Portal Transition Effect
export const PortalTransition = ({ progress = 0 }) => {
  const portalRef = useRef();
  
  useFrame((state) => {
    if (portalRef.current) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 2;
      portalRef.current.scale.setScalar(progress * 5);
    }
  });

  const rings = Array.from({ length: 8 }, (_, i) => ({
    radius: 2 + i * 0.5,
    speed: 1 + i * 0.1,
    color: `hsl(${240 + i * 20}, 70%, 60%)`
  }));

  return (
    <group ref={portalRef}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[0, 0, i * 0.2]}>
          <torusGeometry args={[ring.radius, 0.1, 8, 32]} />
          <meshStandardMaterial
            color={ring.color}
            transparent
            opacity={0.8 - i * 0.1}
            emissive={ring.color}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      
      {/* Central vortex */}
      <Sphere args={[1]} scale={progress}>
        <MeshDistortMaterial
          color="#000000"
          transparent
          opacity={0.9}
          distort={0.8}
          speed={3}
        />
      </Sphere>
    </group>
  );
};

// Spiral Transition Effect
export const SpiralTransition = ({ progress = 0 }) => {
  const spiralRef = useRef();
  
  const spiralPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 200; i++) {
      const t = (i / 200) * Math.PI * 10;
      const radius = t * 0.3;
      const height = (i / 200) * 40 - 20;
      
      points.push({
        position: [
          Math.cos(t) * radius,
          height,
          Math.sin(t) * radius
        ],
        scale: Math.random() * 0.3 + 0.1
      });
    }
    return points;
  }, []);

  useFrame((state) => {
    if (spiralRef.current) {
      spiralRef.current.rotation.y = state.clock.elapsedTime * 2;
      spiralRef.current.scale.setScalar(progress);
    }
  });

  return (
    <group ref={spiralRef}>
      {spiralPoints.map((point, i) => (
        <Sphere key={i} position={point.position} scale={point.scale}>
          <meshStandardMaterial
            color={`hsl(${(i * 5) % 360}, 70%, 60%)`}
            transparent
            opacity={0.7}
            emissive={`hsl(${(i * 5) % 360}, 70%, 30%)`}
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Particle Burst Transition
export const ParticleBurstTransition = ({ progress = 0 }) => {
  const burstRef = useRef();
  
  const particles = useMemo(() => {
    return Array.from({ length: 100 }, () => ({
      position: [0, 0, 0],
      velocity: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6),
      size: Math.random() * 0.5 + 0.1
    }));
  }, []);

  useFrame((state) => {
    if (burstRef.current) {
      burstRef.current.children.forEach((particle, i) => {
        const data = particles[i];
        if (particle && data) {
          particle.position.x = data.velocity[0] * progress;
          particle.position.y = data.velocity[1] * progress;
          particle.position.z = data.velocity[2] * progress;
          particle.scale.setScalar(data.size * (1 - progress * 0.5));
        }
      });
    }
  });

  return (
    <group ref={burstRef}>
      {particles.map((particle, i) => (
        <Sphere key={i} scale={particle.size}>
          <meshStandardMaterial
            color={particle.color}
            transparent
            opacity={1 - progress * 0.5}
            emissive={particle.color}
            emissiveIntensity={0.5}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Geometric Morph Transition
export const GeometricMorphTransition = ({ progress = 0 }) => {
  const morphRef = useRef();
  
  useFrame((state) => {
    if (morphRef.current) {
      morphRef.current.rotation.x = state.clock.elapsedTime;
      morphRef.current.rotation.y = state.clock.elapsedTime * 0.7;
      morphRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      morphRef.current.scale.setScalar(1 + progress * 2);
    }
  });

  const shapes = [
    { Component: Box, args: [2, 2, 2], position: [0, 0, 0] },
    { Component: Sphere, args: [1.5], position: [4, 0, 0] },
    { Component: Cylinder, args: [1, 1, 2], position: [-4, 0, 0] }
  ];

  return (
    <group ref={morphRef}>
      {shapes.map((shape, i) => (
        <motion.group
          key={i}
          animate={{
            rotateX: progress * Math.PI * 2,
            rotateY: progress * Math.PI * 1.5,
            scale: 1 + progress * 0.5
          }}
          transition={{ duration: 1 }}
        >
          <shape.Component {...shape.args && { args: shape.args }} position={shape.position}>
            <MeshDistortMaterial
              color={`hsl(${120 * i}, 70%, 60%)`}
              transparent
              opacity={0.8}
              distort={progress}
              speed={2}
            />
          </shape.Component>
        </motion.group>
      ))}
    </group>
  );
};

// Main Transition Manager
export const SectionTransitions = ({ 
  currentSection = 0, 
  transitionProgress = 0, 
  transitionType = 'wave' 
}) => {
  const transitionComponents = {
    wave: WaveTransition,
    portal: PortalTransition,
    spiral: SpiralTransition,
    burst: ParticleBurstTransition,
    morph: GeometricMorphTransition
  };

  const TransitionComponent = transitionComponents[transitionType] || WaveTransition;

  return (
    <group>
      <TransitionComponent progress={transitionProgress} />
    </group>
  );
};

export default SectionTransitions;

