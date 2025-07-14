import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Text, Float, RoundedBox, MeshReflectorMaterial } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Floating Certificate Displays
export const Certificate3D = ({ 
  certificate, 
  position, 
  index, 
  isHovered, 
  onHover 
}) => {
  const certRef = useRef();
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (certRef.current) {
      // Gentle floating animation
      certRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.2;
      certRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + index) * 0.1;
      
      // Scale on hover
      if (isHovered) {
        certRef.current.scale.lerp(new THREE.Vector3(1.15, 1.15, 1.15), 0.1);
      } else {
        certRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.3}>
      <motion.group
        ref={certRef}
        position={position}
        initial={{ scale: 0, rotateX: -90 }}
        animate={{ scale: 1, rotateX: 0 }}
        transition={{ duration: 1.5, delay: index * 0.2, ease: "backOut" }}
        onClick={() => setClicked(!clicked)}
        onPointerOver={() => onHover(certificate)}
        onPointerOut={() => onHover(null)}
      >
        {/* Certificate frame */}
        <RoundedBox args={[4, 5, 0.3]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color={isHovered ? "#d4af37" : "#2d3748"}
            transparent
            opacity={0.9}
            roughness={0.1}
            metalness={0.8}
            emissive={isHovered ? "#d4af37" : "#000000"}
            emissiveIntensity={isHovered ? 0.2 : 0}
          />
        </RoundedBox>
        
        {/* Certificate content background */}
        <Box args={[3.5, 4.5, 0.1]} position={[0, 0, 0.2]}>
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.95}
          />
        </Box>
        
        {/* Certificate title */}
        <Text
          position={[0, 1.5, 0.3]}
          fontSize={0.3}
          color="#1a202c"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          fontWeight="bold"
        >
          {certificate.title || certificate.name}
        </Text>
        
        {/* Issuer */}
        <Text
          position={[0, 0.5, 0.3]}
          fontSize={0.2}
          color="#4a5568"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
        >
          {certificate.issuer || certificate.organization}
        </Text>
        
        {/* Date */}
        <Text
          position={[0, -0.5, 0.3]}
          fontSize={0.15}
          color="#718096"
          anchorX="center"
          anchorY="middle"
        >
          {certificate.date || certificate.year}
        </Text>
        
        {/* Achievement badge */}
        <Sphere args={[0.4]} position={[0, -1.5, 0.4]}>
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.3}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
        
        {/* Star decoration on badge */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <Sphere
              key={i}
              args={[0.05]}
              position={[
                Math.cos(angle) * 0.3,
                -1.5 + Math.sin(angle) * 0.3,
                0.5
              ]}
            >
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.5}
              />
            </Sphere>
          );
        })}
        
        {/* Glow effect when hovered */}
        {isHovered && (
          <Sphere args={[4]} position={[0, 0, -1]}>
            <meshStandardMaterial
              color="#d4af37"
              transparent
              opacity={0.1}
              emissive="#d4af37"
              emissiveIntensity={0.3}
            />
          </Sphere>
        )}
      </motion.group>
    </Float>
  );
};

// Achievement Constellation
export const AchievementConstellation = () => {
  const constellationRef = useRef();
  const [achievements] = useState(() => {
    const temp = [];
    for (let i = 0; i < 15; i++) {
      const phi = Math.acos(-1 + (2 * i) / 15);
      const theta = Math.sqrt(15 * Math.PI) * phi;
      const radius = 8;
      
      temp.push({
        position: [
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.cos(phi),
          radius * Math.sin(theta) * Math.sin(phi)
        ],
        size: Math.random() * 0.3 + 0.2
      });
    }
    return temp;
  });

  useFrame((state) => {
    if (constellationRef.current) {
      constellationRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      constellationRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
    }
  });

  return (
    <group ref={constellationRef} position={[12, 0, 0]}>
      {achievements.map((achievement, i) => (
        <Float key={i} speed={0.8} rotationIntensity={0.2} floatIntensity={0.5}>
          <Sphere position={achievement.position} scale={achievement.size}>
            <meshStandardMaterial
              color="#f7fafc"
              emissive="#f7fafc"
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </Sphere>
        </Float>
      ))}
      
      {/* Connecting lines */}
      {achievements.map((achievement, i) => 
        achievements.slice(i + 1, i + 3).map((other, j) => (
          <line key={`${i}-${j}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([...achievement.position, ...other.position])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color="#d4af37"
              transparent
              opacity={0.3}
            />
          </line>
        ))
      )}
    </group>
  );
};

// Trophy Pedestal
export const TrophyPedestal = () => {
  const trophyRef = useRef();

  useFrame((state) => {
    if (trophyRef.current) {
      trophyRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      trophyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group position={[-12, -3, 0]}>
      {/* Pedestal base */}
      <Cylinder args={[3, 4, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2d3748"
          roughness={0.1}
          metalness={0.8}
        />
      </Cylinder>
      
      {/* Trophy cup */}
      <group ref={trophyRef} position={[0, 3, 0]}>
        <Cylinder args={[1.5, 1, 2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.05}
            metalness={0.95}
            emissive="#d4af37"
            emissiveIntensity={0.2}
          />
        </Cylinder>
        
        {/* Trophy handles */}
        {[-1, 1].map((side, i) => (
          <Cylinder
            key={i}
            args={[0.1, 0.1, 1]}
            position={[side * 1.8, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.05}
              metalness={0.95}
            />
          </Cylinder>
        ))}
        
        {/* Trophy base */}
        <Cylinder args={[1, 1, 0.5]} position={[0, -1.5, 0]}>
          <meshStandardMaterial
            color="#d4af37"
            roughness={0.05}
            metalness={0.95}
          />
        </Cylinder>
      </group>
      
      {/* Engraving text */}
      <Text
        position={[0, 0.5, 4.1]}
        fontSize={0.3}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
      >
        Excellence
      </Text>
    </group>
  );
};

// Main Certificates 3D Scene
export const CertificatesScene3D = ({ 
  certificates = [], 
  hoveredCertificate, 
  setHoveredCertificate 
}) => {
  const sceneRef = useRef();

  const certificatePositions = useMemo(() => {
    return certificates.slice(0, 8).map((_, index) => {
      const angle = (index / 8) * Math.PI * 2;
      const radius = 10;
      const height = Math.sin(angle * 2) * 2;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [certificates.length]);

  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Luxury lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={1.2} color="#d4af37" />
      <pointLight position={[-15, -15, -15]} intensity={0.8} color="#f7fafc" />
      <spotLight
        position={[0, 25, 0]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        color="#ffffff"
        castShadow
      />
      
      {/* Reflective floor */}
      <Box args={[50, 0.1, 50]} position={[0, -8, 0]}>
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={3}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#1a202c"
          metalness={0.6}
        />
      </Box>
      
      {/* Certificate displays */}
      {certificates.slice(0, 8).map((certificate, index) => (
        <Certificate3D
          key={certificate.id || index}
          certificate={certificate}
          position={certificatePositions[index]}
          index={index}
          isHovered={hoveredCertificate === certificate}
          onHover={setHoveredCertificate}
        />
      ))}
      
      {/* Background elements */}
      <AchievementConstellation />
      <TrophyPedestal />
      
      {/* Floating achievement badges */}
      <group>
        {Array.from({ length: 20 }).map((_, i) => (
          <Float key={i} speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <Sphere
              position={[
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 30
              ]}
              scale={Math.random() * 0.2 + 0.1}
            >
              <meshStandardMaterial
                color="#d4af37"
                transparent
                opacity={0.3}
                emissive="#d4af37"
                emissiveIntensity={0.2}
              />
            </Sphere>
          </Float>
        ))}
      </group>
    </group>
  );
};

export default CertificatesScene3D;

