import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Plane, Text, Float, Html, MeshReflectorMaterial, Environment } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Floating Project Cards in 3D space
export const ProjectCard3D = ({ 
  project, 
  position, 
  index, 
  isHovered, 
  onHover 
}) => {
  const cardRef = useRef();
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (cardRef.current) {
      cardRef.current.rotation.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
      cardRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.3;
      
      if (isHovered) {
        cardRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
      } else {
        cardRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <motion.group
        ref={cardRef}
        position={position}
        initial={{ scale: 0, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 1.5, delay: index * 0.2, ease: "backOut" }}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => onHover(project)}
        onPointerOut={() => onHover(null)}
      >
        {/* Main card body */}
        <Box args={[4, 6, 0.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={isHovered ? "#6366f1" : "#1e293b"}
            transparent
            opacity={0.9}
            roughness={0.1}
            metalness={0.8}
            emissive={isHovered ? "#6366f1" : "#000000"}
            emissiveIntensity={isHovered ? 0.2 : 0}
          />
        </Box>
        
        {/* Project title */}
        <Text
          position={[0, 2, 0.2]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
        >
          {project.title}
        </Text>
        
        {/* Project description */}
        <Text
          position={[0, 0.5, 0.2]}
          fontSize={0.2}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.5}
        >
          {project.description}
        </Text>
        
        {/* Tech stack indicators */}
        {project.tech && project.tech.slice(0, 3).map((tech, i) => (
          <Sphere key={tech} args={[0.2]} position={[-1 + i * 1, -2, 0.3]}>
            <meshStandardMaterial
              color={`hsl(${(i * 120) % 360}, 70%, 60%)`}
              emissive={`hsl(${(i * 120) % 360}, 70%, 30%)`}
              emissiveIntensity={0.3}
            />
          </Sphere>
        ))}
        
        {/* Glow effect when hovered */}
        {isHovered && (
          <Sphere args={[3]} position={[0, 0, -1]}>
            <meshStandardMaterial
              color="#6366f1"
              transparent
              opacity={0.1}
              emissive="#6366f1"
              emissiveIntensity={0.5}
            />
          </Sphere>
        )}
      </motion.group>
    </Float>
  );
};

// Data Flow Visualization
export const DataFlowLines = () => {
  const linesRef = useRef();
  const [flowData] = useState(() => {
    const flows = [];
    for (let i = 0; i < 20; i++) {
      flows.push({
        start: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20
        ],
        end: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 20
        ],
        color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.6),
        speed: Math.random() * 0.02 + 0.01
      });
    }
    return flows;
  });

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((line, i) => {
        const flow = flowData[i];
        if (line && flow) {
          line.material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * flow.speed * 10) * 0.3;
        }
      });
    }
  });

  return (
    <group ref={linesRef}>
      {flowData.map((flow, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([...flow.start, ...flow.end])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={flow.color}
            transparent
            opacity={0.3}
            linewidth={2}
          />
        </line>
      ))}
    </group>
  );
};

// Code Matrix Background
export const CodeMatrix = () => {
  const matrixRef = useRef();
  const [codeElements] = useState(() => {
    const elements = [];
    const codeSymbols = ['<', '>', '{', '}', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';'];
    
    for (let i = 0; i < 100; i++) {
      elements.push({
        position: [
          (Math.random() - 0.5) * 50,
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 30
        ],
        symbol: codeSymbols[Math.floor(Math.random() * codeSymbols.length)],
        speed: Math.random() * 0.02 + 0.005,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    return elements;
  });

  useFrame((state) => {
    if (matrixRef.current) {
      matrixRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      matrixRef.current.children.forEach((element, i) => {
        const data = codeElements[i];
        if (element && data) {
          element.position.y -= data.speed;
          if (element.position.y < -15) {
            element.position.y = 15;
          }
          element.material.opacity = data.opacity + Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        }
      });
    }
  });

  return (
    <group ref={matrixRef}>
      {codeElements.map((element, i) => (
        <Text
          key={i}
          position={element.position}
          fontSize={0.5}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
        >
          {element.symbol}
        </Text>
      ))}
    </group>
  );
};

// Main Projects 3D Scene
export const ProjectsScene3D = ({ projects = [], hoveredProject, setHoveredProject }) => {
  const sceneRef = useRef();

  const projectPositions = useMemo(() => {
    return projects.slice(0, 6).map((_, index) => {
      const angle = (index / 6) * Math.PI * 2;
      const radius = 12;
      const height = Math.sin(angle * 2) * 3;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [projects.length]);

  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Enhanced lighting for projects */}
      <ambientLight intensity={0.3} />
      <pointLight position={[20, 20, 20]} intensity={1} color="#6366f1" />
      <pointLight position={[-20, -20, -20]} intensity={0.8} color="#22d3ee" />
      <spotLight
        position={[0, 30, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        color="#8b5cf6"
        castShadow
      />
      
      {/* Reflective floor */}
      <Plane args={[100, 100]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]}>
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={50}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.8}
        />
      </Plane>
      
      {/* Project cards */}
      {projects.slice(0, 6).map((project, index) => (
        <ProjectCard3D
          key={project.id || index}
          project={project}
          position={projectPositions[index]}
          index={index}
          isHovered={hoveredProject === project}
          onHover={setHoveredProject}
        />
      ))}
      
      {/* Background effects */}
      <DataFlowLines />
      <CodeMatrix />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
    </group>
  );
};

export default ProjectsScene3D;
