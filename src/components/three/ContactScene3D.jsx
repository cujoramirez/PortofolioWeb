import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Cylinder, Torus, Text, Float, Html, Trail } from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import * as THREE from 'three';

// Interactive Contact Orbs
export const ContactOrb = ({ 
  contact, 
  position, 
  index, 
  isHovered, 
  onHover,
  onClick 
}) => {
  const orbRef = useRef();
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
      orbRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.3;
      
      if (isHovered) {
        orbRef.current.scale.lerp(new THREE.Vector3(1.3, 1.3, 1.3), 0.1);
      } else {
        orbRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const colors = {
    email: '#ea4335',
    linkedin: '#0077b5',
    github: '#333333',
    twitter: '#1da1f2',
    phone: '#25d366',
    default: '#6366f1'
  };

  const contactColor = colors[contact.type] || colors.default;

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <motion.group
        ref={orbRef}
        position={position}
        initial={{ scale: 0, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ duration: 1.5, delay: index * 0.3, ease: "backOut" }}
        onClick={() => {
          setClicked(!clicked);
          onClick?.(contact);
        }}
        onPointerOver={() => onHover(contact)}
        onPointerOut={() => onHover(null)}
      >
        {/* Main contact orb */}
        <Sphere args={[1.5]}>
          <meshStandardMaterial
            color={contactColor}
            transparent
            opacity={0.8}
            emissive={contactColor}
            emissiveIntensity={isHovered ? 0.5 : 0.2}
            roughness={0.1}
            metalness={0.8}
          />
        </Sphere>
        
        {/* Icon representation */}
        <Box args={[0.8, 0.8, 0.2]} position={[0, 0, 1.6]}>
          <meshStandardMaterial
            color="white"
            emissive="white"
            emissiveIntensity={0.3}
          />
        </Box>
        
        {/* Contact label */}
        <Text
          position={[0, -2.5, 0]}
          fontSize={0.4}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {contact.label || contact.type}
        </Text>
        
        {/* Orbiting particles */}
        {[...Array(3)].map((_, i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <Sphere
              key={i}
              args={[0.1]}
              position={[
                Math.cos(angle + state.clock?.elapsedTime || 0) * 2.5,
                Math.sin(angle + state.clock?.elapsedTime || 0) * 0.5,
                Math.sin(angle + state.clock?.elapsedTime || 0) * 2.5
              ]}
            >
              <meshStandardMaterial
                color={contactColor}
                emissive={contactColor}
                emissiveIntensity={0.5}
              />
            </Sphere>
          );
        })}
        
        {/* Pulse effect when hovered */}
        {isHovered && (
          <Sphere args={[3]}>
            <meshStandardMaterial
              color={contactColor}
              transparent
              opacity={0.1}
              emissive={contactColor}
              emissiveIntensity={0.3}
            />
          </Sphere>
        )}
        
        {/* Trail effect */}
        <Trail
          width={0.5}
          length={8}
          color={contactColor}
          attenuation={(t) => t * t}
        >
          <Sphere scale={0.2} position={[0, 0, 2]}>
            <meshStandardMaterial color={contactColor} emissive={contactColor} />
          </Sphere>
        </Trail>
      </motion.group>
    </Float>
  );
};

// Communication Waves
export const CommunicationWaves = () => {
  const wavesRef = useRef();
  const [waves] = useState(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      radius: 5 + i * 2,
      speed: 0.5 + i * 0.1,
      opacity: 0.8 - i * 0.1
    }));
  });

  useFrame((state) => {
    if (wavesRef.current) {
      wavesRef.current.children.forEach((wave, i) => {
        if (wave) {
          wave.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * waves[i].speed) * 0.3);
          wave.material.opacity = waves[i].opacity * (0.5 + Math.sin(state.clock.elapsedTime * waves[i].speed) * 0.5);
        }
      });
    }
  });

  return (
    <group ref={wavesRef} position={[0, 5, 0]}>
      {waves.map((wave, i) => (
        <Torus key={i} args={[wave.radius, 0.1, 8, 32]}>
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={wave.opacity}
            emissive="#22d3ee"
            emissiveIntensity={0.3}
          />
        </Torus>
      ))}
    </group>
  );
};

// Message Particles
export const MessageParticles = () => {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    return Array.from({ length: 30 }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      ],
      velocity: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ],
      size: Math.random() * 0.3 + 0.1
    }));
  });

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((particle, i) => {
        const data = particles[i];
        if (particle && data) {
          // Update position
          particle.position.x += data.velocity[0];
          particle.position.y += data.velocity[1];
          particle.position.z += data.velocity[2];
          
          // Wrap around boundaries
          if (Math.abs(particle.position.x) > 15) data.velocity[0] *= -1;
          if (Math.abs(particle.position.y) > 10) data.velocity[1] *= -1;
          if (Math.abs(particle.position.z) > 10) data.velocity[2] *= -1;
          
          // Pulsing effect
          particle.scale.setScalar(data.size * (1 + Math.sin(state.clock.elapsedTime * 3 + i) * 0.3));
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <Sphere key={i} position={particle.position} scale={particle.size}>
          <meshStandardMaterial
            color="#8b5cf6"
            transparent
            opacity={0.6}
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Network Connections
export const NetworkConnections = ({ contactPositions = [] }) => {
  const networkRef = useRef();

  useFrame((state) => {
    if (networkRef.current) {
      networkRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={networkRef}>
      {contactPositions.map((pos, i) => 
        contactPositions.slice(i + 1).map((otherPos, j) => {
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
                  color="#6366f1"
                  transparent
                  opacity={0.3}
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

// Interactive Hologram
export const ContactHologram = ({ hoveredContact }) => {
  const hologramRef = useRef();

  useFrame((state) => {
    if (hologramRef.current) {
      hologramRef.current.rotation.y = state.clock.elapsedTime * 0.8;
      hologramRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  if (!hoveredContact) return null;

  return (
    <group ref={hologramRef} position={[0, 8, 0]}>
      {/* Hologram base */}
      <Cylinder args={[3, 3, 0.2]} position={[0, -2, 0]}>
        <meshStandardMaterial
          color="#22d3ee"
          transparent
          opacity={0.3}
          emissive="#22d3ee"
          emissiveIntensity={0.5}
        />
      </Cylinder>
      
      {/* Hologram content */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="#22d3ee"
        anchorX="center"
        anchorY="middle"
      >
        {hoveredContact.label}
      </Text>
      
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.3}
        color="#8b5cf6"
        anchorX="center"
        anchorY="middle"
      >
        {hoveredContact.value}
      </Text>
      
      {/* Hologram particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sphere key={i} args={[0.05]} position={[
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 4
        ]}>
          <meshStandardMaterial
            color="#22d3ee"
            transparent
            opacity={0.6}
            emissive="#22d3ee"
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Main Contact 3D Scene
export const ContactScene3D = ({ 
  contacts = [], 
  hoveredContact, 
  setHoveredContact,
  onContactClick 
}) => {
  const sceneRef = useRef();

  const contactPositions = useMemo(() => {
    return contacts.slice(0, 6).map((_, index) => {
      const angle = (index / 6) * Math.PI * 2;
      const radius = 8;
      const height = Math.sin(angle * 2) * 2;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [contacts.length]);

  useFrame((state) => {
    if (sceneRef.current) {
      sceneRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Dynamic lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[15, 15, 15]} intensity={1} color="#22d3ee" />
      <pointLight position={[-15, -15, -15]} intensity={0.8} color="#8b5cf6" />
      <spotLight
        position={[0, 20, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#6366f1"
        castShadow
      />
      
      {/* Contact orbs */}
      {contacts.slice(0, 6).map((contact, index) => (
        <ContactOrb
          key={contact.id || index}
          contact={contact}
          position={contactPositions[index]}
          index={index}
          isHovered={hoveredContact === contact}
          onHover={setHoveredContact}
          onClick={onContactClick}
        />
      ))}
      
      {/* Interactive elements */}
      <CommunicationWaves />
      <MessageParticles />
      <NetworkConnections contactPositions={contactPositions} />
      <ContactHologram hoveredContact={hoveredContact} />
      
      {/* Background elements */}
      <group>
        {['@', '#', '&', '*', '+', '='].map((symbol, i) => (
          <Float key={symbol} speed={0.3} rotationIntensity={0.1} floatIntensity={0.2}>
            <Text
              position={[
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
              ]}
              fontSize={1}
              color="white"
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

export default ContactScene3D;

