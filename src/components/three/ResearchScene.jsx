import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text3D, Center, Plane } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

export const ResearchVisualization = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const networkNodes = useMemo(() => {
    const nodes = [];
    const nodeCount = 50;
    
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      
      nodes.push({
        position: [
          5 * Math.cos(theta) * Math.sin(phi),
          5 * Math.cos(phi),
          5 * Math.sin(theta) * Math.sin(phi)
        ],
        connections: Math.floor(Math.random() * 4) + 1
      });
    }
    
    return nodes;
  }, []);

  return (
    <group ref={meshRef}>
      {/* Research network nodes */}
      {networkNodes.map((node, index) => (
        <motion.group
          key={index}
          position={node.position}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: index * 0.02 }}
        >
          <Float speed={1 + index * 0.01} rotationIntensity={0.1}>
            <mesh>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial
                color="#3b82f6"
                emissive="#3b82f6"
                emissiveIntensity={0.3}
                transparent
                opacity={0.8}
              />
            </mesh>
          </Float>
        </motion.group>
      ))}
      
      {/* Central research hub */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Research title */}
      <Center position={[0, -3, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.4}
          height={0.1}
          curveSegments={12}
        >
          Research
          <meshStandardMaterial 
            color="white" 
            emissive="white"
            emissiveIntensity={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
};

export const DataFlow = () => {
  const flowRef = useRef();
  
  const { positions, colors } = useMemo(() => {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const t = i / count;
      
      // Create flowing data streams
      const streamIndex = Math.floor(t * 5);
      const streamT = (t * 5) % 1;
      
      const angle = streamIndex * (Math.PI * 2 / 5);
      const radius = 3 + Math.sin(streamT * Math.PI * 4) * 1;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (streamT - 0.5) * 10;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      // Color based on stream
      colors[i3] = 0.2 + streamIndex * 0.15;
      colors[i3 + 1] = 0.5 + streamT * 0.3;
      colors[i3 + 2] = 0.8 + Math.sin(streamT * Math.PI) * 0.2;
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <points ref={flowRef}>
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
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const PublicationCards = ({ publications = [] }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {publications.map((pub, index) => {
        const angle = (index / publications.length) * Math.PI * 2;
        const radius = 7;
        const position = [
          Math.cos(angle) * radius,
          Math.sin(index * 0.5) * 2,
          Math.sin(angle) * radius
        ];

        return (
          <motion.group
            key={pub.id || index}
            position={position}
            initial={{ scale: 0, rotateY: -180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ 
              duration: 1.5, 
              delay: index * 0.2,
              type: "spring"
            }}
          >
            <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
              <Plane args={[2, 3]}>
                <meshStandardMaterial
                  color="#1e293b"
                  transparent
                  opacity={0.8}
                  emissive="#1e293b"
                  emissiveIntensity={0.1}
                />
              </Plane>
              
              <Center position={[0, 1, 0.1]}>
                <Text3D
                  font="/fonts/helvetiker_regular.typeface.json"
                  size={0.1}
                  height={0.01}
                  curveSegments={8}
                >
                  {pub.title?.substring(0, 20) || `Publication ${index + 1}`}
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

export default ResearchVisualization;

