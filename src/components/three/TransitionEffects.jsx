import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const SectionTransition = ({ 
  type = 'wave', 
  color1 = '#6366f1', 
  color2 = '#8b5cf6',
  position = [0, 0, 0]
}) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    if (type === 'wave') {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      meshRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    } else if (type === 'portal') {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  const waveShader = {
    uniforms: {
      time: { value: 0 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) }
    },
    vertexShader: `
      varying vec2 vUv;
      uniform float time;
      
      void main() {
        vUv = uv;
        vec3 pos = position;
        
        // Create wave effect
        pos.z += sin(pos.x * 2.0 + time) * 0.1;
        pos.z += cos(pos.y * 3.0 + time * 0.5) * 0.05;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 color1;
      uniform vec3 color2;
      varying vec2 vUv;
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float distance = length(vUv - center);
        
        float wave = sin(distance * 10.0 - time * 2.0) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, wave);
        
        float alpha = 1.0 - smoothstep(0.3, 0.5, distance);
        
        gl_FragColor = vec4(color, alpha * 0.8);
      }
    `
  };

  if (type === 'wave') {
    return (
      <motion.group 
        position={position}
        initial={{ scale: 0, rotateX: -90 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20, 50, 50]} />
          <shaderMaterial
            uniforms={waveShader.uniforms}
            vertexShader={waveShader.vertexShader}
            fragmentShader={waveShader.fragmentShader}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      </motion.group>
    );
  }

  if (type === 'portal') {
    return (
      <motion.group 
        position={position}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <mesh ref={meshRef}>
          <torusGeometry args={[5, 1, 16, 100]} />
          <meshStandardMaterial
            color={color1}
            emissive={color1}
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[3, 0.5, 16, 100]} />
          <meshStandardMaterial
            color={color2}
            emissive={color2}
            emissiveIntensity={0.4}
            transparent
            opacity={0.5}
          />
        </mesh>
      </motion.group>
    );
  }

  // Default spiral transition
  return (
    <motion.group 
      position={position}
      initial={{ scale: 0, rotateY: -180 }}
      animate={{ scale: 1, rotateY: 0 }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      <mesh ref={meshRef}>
        <cylinderGeometry args={[0, 8, 2, 32]} />
        <meshStandardMaterial
          color={color1}
          emissive={color1}
          emissiveIntensity={0.2}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>
    </motion.group>
  );
};

export const ParticleField = ({ 
  count = 1000, 
  spread = 20, 
  color = '#6366f1' 
}) => {
  const pointsRef = useRef();
  
  const positions = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    return positions;
  }, [count, spread]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default SectionTransition;

