import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Torus, Text, Float, Trail, Sparkles } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Academic Network Visualization
export const AcademicNetwork = ({ publications = [] }) => {
  const networkRef = useRef();
  const [hoveredPub, setHoveredPub] = useState(null);

  const pubPositions = useMemo(() => {
    return publications.slice(0, 8).map((_, index) => {
      const phi = Math.acos(-1 + (2 * index) / 8);
      const theta = Math.sqrt(8 * Math.PI) * phi;
      const radius = 10;
      
      return [
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi)
      ];
    });
  }, [publications.length]);

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = state.clock.elapsedTime * 0.1;
      networkRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <group ref={networkRef}>
      {publications.slice(0, 8).map((pub, index) => (
        <Float key={index} speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
          <motion.group
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: index * 0.3, ease: "backOut" }}
            whileHover={{ scale: 1.2 }}
          >
            {/* Publication node */}
            <Sphere
              position={pubPositions[index]}
              scale={hoveredPub === pub ? 1.5 : 1}
              onPointerOver={() => setHoveredPub(pub)}
              onPointerOut={() => setHoveredPub(null)}
            >
              <meshStandardMaterial
                color={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                transparent
                opacity={0.8}
                emissive={`hsl(${(index * 45) % 360}, 70%, 30%)`}
                emissiveIntensity={hoveredPub === pub ? 0.5 : 0.2}
                roughness={0.1}
                metalness={0.8}
              />
            </Sphere>
            
            {/* Publication title */}
            <Text
              position={[
                pubPositions[index][0] * 1.3,
                pubPositions[index][1] * 1.3,
                pubPositions[index][2] * 1.3
              ]}
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={4}
            >
              {pub.title || `Publication ${index + 1}`}
            </Text>
            
            {/* Impact visualization */}
            {hoveredPub === pub && (
              <Sphere args={[2]} position={pubPositions[index]}>
                <meshStandardMaterial
                  color={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                  transparent
                  opacity={0.1}
                  emissive={`hsl(${(index * 45) % 360}, 70%, 60%)`}
                  emissiveIntensity={0.3}
                />
              </Sphere>
            )}
          </motion.group>
        </Float>
      ))}
      
      {/* Connection lines between publications */}
      {pubPositions.map((pos, i) => 
        pubPositions.slice(i + 1).map((otherPos, j) => {
          const distance = new THREE.Vector3(...pos).distanceTo(new THREE.Vector3(...otherPos));
          if (distance < 15) {
            return (
              <line key={`${i}-${j}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array([...pos, ...otherPos])}
                    count={2}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#22d3ee"
                  transparent
                  opacity={0.2}
                />
              </line>
            );
          }
          return null;
        })
      )}
    </group>
  );
};

// DNA-like Research Spiral
export const ResearchSpiral = () => {
  const spiralRef = useRef();
  const particleRefs = useRef([]);

  useFrame((state) => {
    if (spiralRef.current) {
      spiralRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    
    particleRefs.current.forEach((particle, i) => {
      if (particle) {
        particle.position.y += Math.sin(state.clock.elapsedTime * 2 + i * 0.3) * 0.02;
        particle.rotation.z = state.clock.elapsedTime + i * 0.1;
      }
    });
  });

  const spiralPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const t = (i / 50) * Math.PI * 6;
      const radius = 5;
      const height = (i / 50) * 20 - 10;
      
      points.push({
        position: [
          Math.cos(t) * radius,
          height,
          Math.sin(t) * radius
        ],
        scale: Math.random() * 0.3 + 0.2
      });
    }
    return points;
  }, []);

  return (
    <group ref={spiralRef} position={[15, 0, 0]}>
      {spiralPoints.map((point, i) => (
        <Box
          key={i}
          ref={(el) => (particleRefs.current[i] = el)}
          position={point.position}
          scale={point.scale}
          args={[0.5, 0.5, 0.5]}
        >
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </Box>
      ))}
      
      {/* Trail effect */}
      <Trail
        width={1}
        length={10}
        color="#8b5cf6"
        attenuation={(t) => t * t}
      >
        <Sphere scale={0.5} position={[0, 0, 0]}>
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" />
        </Sphere>
      </Trail>
    </group>
  );
};

// Knowledge Atoms
export const KnowledgeAtoms = () => {
  const atomsRef = useRef();
  const [atoms] = useState(() => {
    const temp = [];
    for (let i = 0; i < 12; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20
        ],
        electrons: Array.from({ length: 3 }, (_, j) => ({
          angle: (j / 3) * Math.PI * 2,
          radius: 2 + Math.random(),
          speed: 0.5 + Math.random() * 0.5
        }))
      });
    }
    return temp;
  });

  useFrame((state) => {
    if (atomsRef.current) {
      atomsRef.current.children.forEach((atom, i) => {
        const atomData = atoms[i];
        if (atom && atomData) {
          atom.rotation.y = state.clock.elapsedTime * 0.2;
          
          // Animate electrons
          atom.children.forEach((electron, j) => {
            if (j > 0 && atomData.electrons[j - 1]) { // Skip nucleus (first child)
              const electronData = atomData.electrons[j - 1];
              const angle = electronData.angle + state.clock.elapsedTime * electronData.speed;
              electron.position.x = Math.cos(angle) * electronData.radius;
              electron.position.z = Math.sin(angle) * electronData.radius;
            }
          });
        }
      });
    }
  });

  return (
    <group ref={atomsRef}>
      {atoms.map((atom, i) => (
        <group key={i} position={atom.position}>
          {/* Nucleus */}
          <Sphere scale={0.5}>
            <meshStandardMaterial
              color="#6366f1"
              emissive="#6366f1"
              emissiveIntensity={0.5}
            />
          </Sphere>
          
          {/* Electrons */}
          {atom.electrons.map((electron, j) => (
            <Sphere key={j} scale={0.2} position={[electron.radius, 0, 0]}>
              <meshStandardMaterial
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={0.3}
              />
            </Sphere>
          ))}
          
          {/* Orbital paths */}
          {atom.electrons.map((electron, j) => (
            <Torus key={`orbit-${j}`} args={[electron.radius, 0.02, 8, 32]}>
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.1}
              />
            </Torus>
          ))}
        </group>
      ))}
    </group>
  );
};

// Main Research 3D Scene
export const ResearchScene3D = ({ publications = [], scrollProgress = 0 }) => {
  const sceneRef = useRef();

  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.position.y = scrollProgress * -3;
      sceneRef.current.rotation.x = scrollProgress * 0.1;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Scientific lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[20, 20, 20]} intensity={1} color="#6366f1" />
      <pointLight position={[-20, -20, -20]} intensity={0.8} color="#22d3ee" />
      <spotLight
        position={[0, 25, 10]}
        angle={0.4}
        penumbra={1}
        intensity={0.8}
        color="#8b5cf6"
        castShadow
      />
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.3}
        color="#ffffff"
      />
      
      {/* 3D Research Elements */}
      <AcademicNetwork publications={publications} />
      <ResearchSpiral />
      <KnowledgeAtoms />
      
      {/* Sparkle effects for inspiration */}
      <Sparkles count={100} scale={30} size={2} speed={0.3} />
      
      {/* Background research symbols */}
      <group>
        {['α', 'β', 'γ', 'δ', 'λ', 'μ', 'π', 'σ', 'φ', 'ψ', 'ω'].map((symbol, i) => (
          <Float key={symbol} speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
            <Text
              position={[
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 25
              ]}
              fontSize={2}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {symbol}
            </Text>
          </Float>
        ))}
      </group>
    </group>
  );
};

export default ResearchScene3D;

