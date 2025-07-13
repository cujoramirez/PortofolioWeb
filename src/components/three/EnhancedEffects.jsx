import React, { useMemo } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom Glow Shader Material
const GlowMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.2, 0.4, 1.0),
    intensity: 1.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform float intensity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      float glow = sin(time * 2.0) * 0.5 + 0.5;
      vec3 glowColor = color * intensity * (glow * 0.5 + 0.5);
      
      float alpha = smoothstep(0.0, 1.0, length(vUv - 0.5) * 2.0);
      alpha = 1.0 - alpha;
      
      gl_FragColor = vec4(glowColor, alpha * 0.8);
    }
  `
);

extend({ GlowMaterial });

// Animated Glow Effect Component
export const AnimatedGlow = ({ color = "#6366f1", intensity = 1.0, position = [0, 0, -5] }) => {
  const materialRef = React.useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry args={[20, 20]} />
      <glowMaterial
        ref={materialRef}
        color={color}
        intensity={intensity}
        transparent
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

// Particle Glow Effect
export const ParticleGlow = ({ count = 50, color = "#8b5cf6" }) => {
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ],
        scale: Math.random() * 0.5 + 0.1
      });
    }
    return temp;
  }, [count]);

  return (
    <group>
      {particles.map((particle, index) => (
        <mesh key={index} position={particle.position} scale={particle.scale}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

// CSS-based Post Processing Effects
export const CSSPostProcessing = ({ children, enableGlow = true, enableBlur = true }) => {
  const styles = {
    filter: [
      enableGlow ? 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' : '',
      enableBlur ? 'blur(0.5px)' : '',
      'brightness(1.1)',
      'contrast(1.05)',
      'saturate(1.1)'
    ].filter(Boolean).join(' ')
  };

  return (
    <div style={styles}>
      {children}
    </div>
  );
};

// Enhanced Scene Lighting
export const EnhancedLighting = () => {
  return (
    <>
      {/* Main lighting setup */}
      <ambientLight intensity={0.3} color="#4f46e5" />
      
      {/* Key light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill lights */}
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      <pointLight position={[10, -10, 10]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[0, 10, 0]} intensity={0.4} color="#22d3ee" />
      
      {/* Rim light */}
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#ec4899"
        castShadow
      />
      
      {/* Background rim lights */}
      <spotLight
        position={[-20, 0, -20]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.4}
        color="#3b82f6"
      />
      <spotLight
        position={[20, 0, -20]}
        angle={0.5}
        penumbra={0.8}
        intensity={0.4}
        color="#8b5cf6"
      />
    </>
  );
};

export default {
  AnimatedGlow,
  ParticleGlow,
  CSSPostProcessing,
  EnhancedLighting
};
