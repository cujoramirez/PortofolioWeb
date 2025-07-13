import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Text, Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Skills Visualization Spheres
export const SkillSpheres = ({ skills = [] }) => {
  const groupRef = useRef();
  const [hoveredSkill, setHoveredSkill] = useState(null);

  const skillPositions = useMemo(() => {
    return skills.map((_, index) => {
      const angle = (index / skills.length) * Math.PI * 2;
      const radius = 8;
      const height = Math.sin(angle * 3) * 2;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [skills.length]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {skills.map((skill, index) => (
        <Float key={skill} speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
          <motion.group
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: index * 0.1 }}
            whileHover={{ scale: 1.2 }}
          >
            <Sphere
              position={skillPositions[index]}
              scale={hoveredSkill === skill ? 1.3 : 1}
              onPointerOver={() => setHoveredSkill(skill)}
              onPointerOut={() => setHoveredSkill(null)}
            >
              <MeshDistortMaterial
                color={`hsl(${(index * 137.5) % 360}, 70%, 60%)`}
                transparent
                opacity={0.8}
                distort={hoveredSkill === skill ? 0.6 : 0.3}
                speed={2}
                roughness={0.1}
              />
            </Sphere>
            
            {/* Skill label */}
            <Text
              position={[skillPositions[index][0], skillPositions[index][1] + 2, skillPositions[index][2]]}
              fontSize={0.5}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {skill}
            </Text>
          </motion.group>
        </Float>
      ))}
    </group>
  );
};

// DNA Helix representing growth and learning
export const DNAHelix = () => {
  const helixRef = useRef();
  const particlesRef = useRef([]);

  useFrame((state) => {
    if (helixRef.current) {
      helixRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    
    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        particle.position.y = Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.1;
      }
    });
  });

  const helixPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 8;
      const radius = 3;
      const y = (i / 100) * 15 - 7.5;
      
      points.push({
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ],
        rotation: angle
      });
    }
    return points;
  }, []);

  return (
    <group ref={helixRef} position={[10, 0, 0]}>
      {helixPoints.map((point, i) => (
        <Cylinder
          key={i}
          ref={(el) => (particlesRef.current[i] = el)}
          position={point.position}
          args={[0.1, 0.1, 0.5]}
          rotation={[0, point.rotation, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </Cylinder>
      ))}
      
      {/* Central core */}
      <Cylinder args={[0.2, 0.2, 15]} position={[0, 0, 0]}>
        <MeshWobbleMaterial
          color="#6366f1"
          transparent
          opacity={0.3}
          factor={0.3}
          speed={2}
        />
      </Cylinder>
    </group>
  );
};

// Knowledge Tree
export const KnowledgeTree = () => {
  const treeRef = useRef();
  const [branches] = useState(() => {
    const temp = [];
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
      const radius = 2 + Math.random() * 3;
      const height = Math.random() * 8 + 2;
      
      temp.push({
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ],
        scale: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 2
      });
    }
    return temp;
  });

  useFrame((state) => {
    if (treeRef.current) {
      treeRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={treeRef} position={[-8, -5, 0]}>
      {/* Tree trunk */}
      <Cylinder args={[1, 2, 8]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </Cylinder>
      
      {/* Branches/Leaves representing different knowledge areas */}
      {branches.map((branch, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
          <motion.group
            initial={{ scale: 0 }}
            animate={{ scale: branch.scale }}
            transition={{ duration: 1.5, delay: branch.delay, ease: "backOut" }}
          >
            <Sphere position={branch.position} scale={1.5}>
              <meshStandardMaterial
                color={`hsl(${120 + i * 10}, 70%, 50%)`}
                transparent
                opacity={0.8}
                emissive={`hsl(${120 + i * 10}, 70%, 30%)`}
                emissiveIntensity={0.2}
              />
            </Sphere>
          </motion.group>
        </Float>
      ))}
    </group>
  );
};

// Main About 3D Scene
export const AboutScene3D = ({ scrollProgress = 0 }) => {
  const sceneRef = useRef();
  
  const skills = [
    'Leadership', 'Innovation', 'Problem Solving', 'Communication',
    'Adaptability', 'Creativity', 'Collaboration', 'Strategic Thinking'
  ];

  useFrame((state) => {
    if (sceneRef.current) {
      // Scroll-based animations
      sceneRef.current.position.y = scrollProgress * -2;
      sceneRef.current.rotation.x = scrollProgress * 0.2;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={0.8} color="#6366f1" />
      <pointLight position={[-15, -15, -15]} intensity={0.6} color="#22d3ee" />
      <directionalLight
        position={[0, 10, 5]}
        intensity={0.5}
        color="#8b5cf6"
        castShadow
      />
      
      {/* 3D Elements */}
      <SkillSpheres skills={skills} />
      <DNAHelix />
      <KnowledgeTree />
      
      {/* Background particles */}
      <group>
        {Array.from({ length: 30 }).map((_, i) => (
          <Float key={i} speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
            <Sphere
              position={[
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
              ]}
              scale={Math.random() * 0.3 + 0.1}
            >
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.1}
                emissive="#ffffff"
                emissiveIntensity={0.05}
              />
            </Sphere>
          </Float>
        ))}
      </group>
    </group>
  );
};

export default AboutScene3D;
