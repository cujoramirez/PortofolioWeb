import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  Sphere,
  PerspectiveCamera,
  Stars,
  Sparkles,
  shaderMaterial,
  useDetectGPU,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Box as MuiBox, Typography, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import * as THREE from 'three';
import { EffectComposer, ShaderPass, RenderPass } from "three-stdlib";

// Extend with Three.js postprocessing components
extend({ EffectComposer, ShaderPass, RenderPass });

// Gravitational Lensing Shader
const GravitationalLensingShader = {
  uniforms: {
    tDiffuse: { value: null },
    blackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
    blackHoleRadius: { value: 0.05 },
    lensStrength: { value: 0.5 },
    distortion: { value: 4.0 },
    curvature: { value: 3.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 blackHolePosition;
    uniform float blackHoleRadius;
    uniform float lensStrength;
    uniform float distortion;
    uniform float curvature;
    
    varying vec2 vUv;
    
    void main() {
      // Calculate distance from current pixel to black hole center
      vec2 delta = vUv - blackHolePosition;
      float dist = length(delta);
      
      // Check if we're inside the event horizon
      if (dist < blackHoleRadius) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }
      
      // Calculate deflection based on distance
      // Gravitational lensing uses inverse square law (1/r²)
      float deflectionStrength = lensStrength * pow(blackHoleRadius / max(dist - blackHoleRadius, 0.001), curvature);
      
      // Apply photon sphere effect (intense ring of light)
      float photonSphereEffect = smoothstep(blackHoleRadius, blackHoleRadius * 1.1, dist) * 
                                smoothstep(blackHoleRadius * 1.3, blackHoleRadius * 1.2, dist);
                                
      // Apply relativistic deflection of light
      vec2 deflection = normalize(delta) * deflectionStrength;
      vec2 distortedUv = vUv - deflection;
      
      // Add chromatic aberration (gravitational redshift effect)
      vec4 colorR = texture2D(tDiffuse, distortedUv - deflection * 0.01);
      vec4 colorG = texture2D(tDiffuse, distortedUv);
      vec4 colorB = texture2D(tDiffuse, distortedUv + deflection * 0.01);
      
      vec4 color = vec4(colorR.r, colorG.g, colorB.b, 1.0);
      
      // Add photon sphere (Einstein ring) glow
      vec3 ringColor = vec3(1.0, 0.8, 0.4) * photonSphereEffect * 3.0;
      color.rgb += ringColor;
      
      gl_FragColor = color;
    }
  `
};

// Enhanced Accretion Disk Material with relativistic effects
const AccretionDiskMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    isOutro: 0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float progress;
    uniform float isOutro;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    const float PI = 3.14159265359;
    
    // Hash function for noise
    float hash(vec3 p) {
      p = fract(p * vec3(0.1031, 0.1030, 0.0973));
      p += dot(p, p.yxz + 33.33);
      return fract((p.x + p.y) * p.z);
    }
    
    // Simplex-like noise
    float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f*f*(3.0-2.0*f);
      
      return mix(
        mix(
          mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x),
          f.y
        ),
        mix(
          mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x),
          f.y
        ),
        f.z
      );
    }
    
    // Fractal Brownian Motion
    float fbm(vec3 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      
      for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    // Relativistic Doppler effect (red/blue shift)
    vec3 dopplerShift(vec3 color, float velocity) {
      // Approximate relativistic Doppler effect
      float redShift = 1.0 + velocity * 0.5;
      float blueShift = 1.0 - velocity * 0.5;
      
      return vec3(
        color.r * redShift,
        color.g,
        color.b * blueShift
      );
    }
    
    // Temperature to RGB (blackbody radiation)
    vec3 temperatureToColor(float temp) {
      // Approximate blackbody radiation
      vec3 color;
      temp = clamp(temp, 0.0, 1.0);
      
      if (temp < 0.4) {
        // Deep red to orange
        float t = temp / 0.4;
        color = mix(vec3(0.7, 0.3, 0.1), vec3(1.0, 0.6, 0.0), t);
      } else if (temp < 0.7) {
        // Orange to yellow-white
        float t = (temp - 0.4) / 0.3;
        color = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 0.9, 0.6), t);
      } else {
        // Yellow-white to white-blue
        float t = (temp - 0.7) / 0.3;
        color = mix(vec3(1.0, 0.9, 0.6), vec3(0.9, 0.9, 1.0), t);
      }
      
      return color;
    }
    
    void main() {
      // Calculate polar coordinates
      float radius = length(vPosition.xz);
      float angle = atan(vPosition.z, vPosition.x);
      
      // Disk parameters - ENHANCED BRIGHTNESS
      float innerRadius = 1.2;
      float outerRadius = 5.0;
      float diskThickness = 0.15; // Slightly thicker for better visibility
      
      // Create disk shape with sharper edge definition
      float diskShape = smoothstep(innerRadius, innerRadius + 0.1, radius) * 
                      (1.0 - smoothstep(outerRadius - 0.3, outerRadius, radius)) *
                      (1.0 - smoothstep(diskThickness * 0.7, diskThickness * 1.5, abs(vPosition.y)));
      
      // Create orbital velocity (Keplerian)
      float orbitalVelocity = sqrt(1.0 / radius) * 0.6; // Increased for more dramatic effect
      
      // Create time-varying turbulence
      float timeScale = time * 0.3; // Slower for better visibility
      float flowAngle = angle + timeScale * orbitalVelocity * 3.0;
      
      // Multi-layered noise for complex detail
      float noise1 = fbm(vec3(radius * 1.5, flowAngle * 3.0, timeScale), 3);
      float noise2 = fbm(vec3(radius * 5.0, flowAngle * 8.0, timeScale * 1.2), 2);
      float noise3 = fbm(vec3(radius * 0.5, flowAngle * 1.0, timeScale * 0.7), 1);
      
      // Combine noise layers
      float combinedNoise = noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1;
      
      // Temperature profile (decreases with radius) - ENHANCED BRIGHTNESS
      float temperature = (1.0 / (radius * 0.4)) * 0.9; // Hotter profile
      temperature = clamp(temperature, 0.0, 1.0);
      
      // Apply noise to temperature
      temperature *= 0.8 + combinedNoise * 0.5; // More variation
      
      // Get color from temperature - ENHANCED BRIGHTNESS
      vec3 diskColor = temperatureToColor(temperature) * 1.5; // Increased brightness
      
      // Apply doppler shift based on angle
      float doppler = sin(angle) * orbitalVelocity;
      diskColor = dopplerShift(diskColor, doppler);
      
      // Hot spots and flares - ENHANCED BRIGHTNESS
      float hotSpots = smoothstep(0.7, 0.9, noise2) * smoothstep(0.6, 0.0, radius - innerRadius) * 2.0;
      
      // Add bright streaks along orbital paths
      float streaks = smoothstep(0.7, 0.9, sin(angle * 8.0 + time * 2.0) * 0.5 + 0.5) * 0.5;
      
      // Intensify based on progress - ENHANCED BRIGHTNESS
      float intensity = diskShape * (1.0 + progress * 2.0) * (1.0 + hotSpots * 3.0 + streaks);
      
      // Boost during outro
      if (isOutro > 0.5) {
        intensity *= 2.0 + 0.5 * sin(time * 8.0);
        diskColor = mix(diskColor, vec3(1.0, 0.9, 0.8) * 1.5, hotSpots * 0.5);
      }
      
      // ENHANCED BRIGHTNESS - Final boost
      diskColor *= 2.5; // Even brighter for better visibility
      
      gl_FragColor = vec4(diskColor * intensity, intensity * 0.95); // Slightly more opaque
    }
  `
);

// Star Field with Distortion Material
const StarFieldMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(1024, 1024),
    blackHolePosition: new THREE.Vector2(0.5, 0.5),
    blackHoleStrength: 0.0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec2 resolution;
    uniform vec2 blackHolePosition;
    uniform float blackHoleStrength;
    
    varying vec2 vUv;
    
    // Hash function
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Star field function
    vec3 starField(vec2 uv) {
      vec3 color = vec3(0.0);
      
      // Create multiple layers of stars
      for (int i = 0; i < 3; i++) {
        float scale = pow(2.0, float(i));
        vec2 seedUv = uv * scale + float(i) * 20.0;
        vec2 cell = floor(seedUv);
        vec2 cellUv = fract(seedUv);
        
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 cellOffset = vec2(float(x), float(y));
            vec2 cellPos = cell + cellOffset;
            
            float cellHash = hash(cellPos);
            if (cellHash > 0.99) { // Rare stars
              vec2 starPos = cellOffset + vec2(hash(cellPos + 0.1), hash(cellPos + 0.2)) - cellUv;
              float star = 1.0 - smoothstep(0.0, 0.1 / scale, length(starPos));
              
              // Star color based on temperature
              float temp = hash(cellPos + 0.3);
              vec3 starColor;
              if (temp < 0.3) {
                starColor = vec3(1.0, 0.7, 0.5); // Red-orange
              } else if (temp < 0.6) {
                starColor = vec3(1.0, 0.9, 0.6); // Yellow-white
              } else {
                starColor = vec3(0.8, 0.9, 1.0); // Blue-white
              }
              
              // Twinkle effect
              float twinkle = sin(time * (cellHash * 5.0) + cellHash * 20.0) * 0.5 + 0.5;
              star *= 0.7 + 0.3 * twinkle;
              
              color += star * starColor * (0.5 - float(i) * 0.1);
            }
          }
        }
      }
      
      return color;
    }
    
    void main() {
      // Calculate distance from current pixel to black hole center
      vec2 uv = vUv;
      vec2 delta = uv - blackHolePosition;
      float dist = length(delta);
      
      // Apply gravitational lensing effect
      if (blackHoleStrength > 0.0) {
        float deflection = blackHoleStrength / max(dist * 20.0, 0.1);
        uv = uv - normalize(delta) * deflection;
      }
      
      // Generate star field with distorted UVs
      vec3 color = starField(uv * 5.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Register custom materials
extend({ AccretionDiskMaterial, StarFieldMaterial });

// Post-processing effects setup
const Effects = ({ blackHoleRef, progress, outroProgress, isOutro }) => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef();
  const lensPass = useRef();
  
  // Create the effect passes
  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));
    
    // Add gravitational lensing pass
    const lensingShader = GravitationalLensingShader;
    lensPass.current = new ShaderPass(lensingShader);
    lensPass.current.enabled = true;
    composer.current.addPass(lensPass.current);
  }, [gl, scene, camera]);
  
  // Update composer on resize
  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height);
    }
  }, [size]);
  
  // Update shader uniforms each frame
  useFrame(({ clock }) => {
    if (lensPass.current && blackHoleRef.current) {
      // Project black hole position to screen space
      const vector = new THREE.Vector3();
      vector.setFromMatrixPosition(blackHoleRef.current.matrixWorld);
      vector.project(camera);
      
      // Convert to normalized device coordinates
      const x = (vector.x + 1) / 2;
      const y = (vector.y + 1) / 2;
      
      // Update shader uniforms - use combined progress for seamless transition
      const progressFactor = progress / 100;
      const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
      
      lensPass.current.uniforms.blackHolePosition.value.set(x, y);
      lensPass.current.uniforms.blackHoleRadius.value = 0.03 + combinedProgress * 0.02;
      
      // Apply stronger lensing during outro while maintaining continuity
      if (isOutro) {
        lensPass.current.uniforms.lensStrength.value = 0.5 + outroProgress * 0.5;
        lensPass.current.uniforms.distortion.value = 4.0 + outroProgress * 2.0;
      } else {
        lensPass.current.uniforms.lensStrength.value = 0.2 + progressFactor * 0.3;
      }
    }
    
    // Render with the composer
    if (composer.current) {
      composer.current.render();
    }
  }, 1);
  
  return null;
};

// Black Hole System
const BlackHoleSystem = ({ progress, outroProgress, isOutro, isMobile }) => {
  const blackHoleRef = useRef();
  const accretionDiskRef = useRef();
  const photonSphereRef = useRef();
  const glowRef = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    // Calculate combined progress for seamless transition
    // This ensures the black hole doesn't "restart" when outro begins
    const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
    
    // Update black hole
    if (blackHoleRef.current) {
      // Scale based on progress
      const scale = 0.7 + combinedProgress * 0.6;
      blackHoleRef.current.scale.setScalar(isOutro ? scale * 1.3 : scale);
    }
    
    // Update accretion disk
    if (accretionDiskRef.current) {
      accretionDiskRef.current.material.uniforms.time.value = time;
      accretionDiskRef.current.material.uniforms.progress.value = combinedProgress;
      accretionDiskRef.current.material.uniforms.isOutro.value = isOutro ? 1.0 : 0.0;
      
      // Rotate disk
      accretionDiskRef.current.rotation.z += 0.002 + combinedProgress * 0.002;
      
      // Slight wobble
      accretionDiskRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.3) * 0.05;
    }
    
    // Update photon sphere (Einstein ring)
    if (photonSphereRef.current) {
      // Pulsate with subtle glow
      const glowIntensity = 0.8 + 0.4 * Math.sin(time * 3.0) + (isOutro ? outroProgress * 0.4 : 0);
      photonSphereRef.current.material.emissiveIntensity = glowIntensity;
    }
    
    // Update outer glow
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.3 + 0.1 * Math.sin(time * 0.5) + (isOutro ? outroProgress * 0.2 : 0);
    }
  });
  
  return (
    <group>
      {/* Black Hole Event Horizon */}
      <Sphere ref={blackHoleRef} args={[1, isMobile ? 32 : 64, isMobile ? 32 : 64]}>
        <meshBasicMaterial color="black" />
      </Sphere>
      
      {/* Photon Sphere (Einstein Ring) - ENHANCED BRIGHTNESS */}
      <Sphere ref={photonSphereRef} args={[1.05, isMobile ? 32 : 64, isMobile ? 32 : 64]}>
        <meshPhongMaterial 
          color="black" 
          emissive="#ffdd88" 
          emissiveIntensity={1.2} // Brighter
          transparent 
          opacity={0.8} // More visible
        />
      </Sphere>
      
      {/* Accretion Disk - ENHANCED FOR BETTER VISIBILITY */}
      <mesh ref={accretionDiskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 5, isMobile ? 64 : 128, isMobile ? 4 : 8]} />
        <accretionDiskMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Outer Glow - ENHANCED BRIGHTNESS */}
      <Sphere ref={glowRef} args={[2, isMobile ? 16 : 32, isMobile ? 16 : 32]}>
        <meshBasicMaterial 
          color="#4422cc" 
          transparent 
          opacity={0.3} // Brighter
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Post-processing effects */}
      <Effects blackHoleRef={blackHoleRef} progress={progress} outroProgress={outroProgress} isOutro={isOutro} />
    </group>
  );
};

// Gravitational Particles System - with device optimization
const GravitationalParticles = ({ progress, outroProgress, isOutro, isMobile, gpuTier }) => {
  const meshRef = useRef();
  // Adjust particle count based on device capability
  const count = useMemo(() => {
    if (isMobile) return 2000;
    if (gpuTier.tier < 2) return 3000;
    return 5000;
  }, [isMobile, gpuTier]);
  
  const particleSystem = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute particles in a disk
      const radius = Math.pow(Math.random(), 1.5) * 15 + 1.0;
      const theta = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 0.5 * (radius / 15);
      
      positions[i3] = radius * Math.cos(theta);
      positions[i3 + 1] = height;
      positions[i3 + 2] = radius * Math.sin(theta);
      
      // Color based on radius - hotter inner particles
      const temperature = 1 - Math.min(1, radius / 15);
      const h = 0.6 + temperature * 0.3; // Blue to purple hue
      const s = 0.8 + temperature * 0.2;
      const l = 0.3 + temperature * 0.6;
      
      const color = new THREE.Color().setHSL(h, s, l);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      
      // Varied sizes
      sizes[i] = (0.05 + Math.random() * 0.15) * (1 + temperature);
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, colors, sizes, phases };
  }, [count]);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const positions = meshRef.current.geometry.attributes.position.array;
      const progressFactor = progress / 100;
      
      // Calculate combined progress for seamless transition
      const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
      
      // Process fewer particles per frame on mobile for better performance
      const processingStep = isMobile ? 3 : 1; 
      
      for (let i = 0; i < count; i += processingStep) {
        const i3 = i * 3;
        const phase = particleSystem.phases[i];
        
        // Current position
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Calculate radius and angle
        const radius = Math.sqrt(x * x + z * z);
        const angle = Math.atan2(z, x);
        
        if (isOutro) {
          // Continue from intro state with enhanced gravity
          const gravitationalPull = 1.0 / Math.max(radius, 0.5);
          const spiralSpeed = 0.5 + gravitationalPull * combinedProgress;
          
          // Keplerian orbital velocity (faster when closer)
          const orbitalVelocity = Math.sqrt(1.0 / Math.max(radius, 0.1)) * 0.2;
          
          // New angle with precession effect
          const newAngle = angle + time * 0.01 * orbitalVelocity * spiralSpeed;
          
          // Radius decreases faster as particles get closer (gravitational acceleration)
          const newRadius = radius * (1.0 - 0.01 * outroProgress * gravitationalPull);
          
          // Update positions
          positions[i3] = newRadius * Math.cos(newAngle);
          positions[i3 + 2] = newRadius * Math.sin(newAngle);
          
          // Height decreases toward accretion plane
          positions[i3 + 1] *= 0.98;
        } else {
          // Regular orbital motion during intro
          // Keplerian orbital velocity (faster when closer)
          const orbitalVelocity = Math.sqrt(1.0 / Math.max(radius, 0.1)) * 0.1;
          
          // New angle
          const newAngle = angle + time * 0.01 * orbitalVelocity;
          
          // Update positions
          positions[i3] = radius * Math.cos(newAngle);
          positions[i3 + 2] = radius * Math.sin(newAngle);
          
          // Add subtle vertical oscillation
          positions[i3 + 1] = y + Math.sin(time * 0.5 + phase) * 0.01;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleSystem.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleSystem.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particleSystem.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.15 : 0.1} // Larger points on mobile for better visibility
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
};

// Relativistic Jets - with continuous state between intro and outro
const RelativisticJets = ({ progress, outroProgress, isOutro, isMobile }) => {
  const jet1Ref = useRef();
  const jet2Ref = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    // Calculate combined progress for seamless transition
    const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
    
    if (jet1Ref.current && jet2Ref.current) {
      // Only show jets when progress is high enough
      const jetVisibility = Math.max(0, combinedProgress - 0.5) * 2;
      jet1Ref.current.material.opacity = jetVisibility * 0.7;
      jet2Ref.current.material.opacity = jetVisibility * 0.7;
      
      // Scale jets - continuous growth through intro and outro
      const jetScale = jetVisibility * (isOutro ? 1.5 + outroProgress * 0.5 : 1.0);
      jet1Ref.current.scale.set(jetScale, jetScale, jetScale);
      jet2Ref.current.scale.set(jetScale, jetScale, jetScale);
      
      // Add pulsing effect - intensify during outro
      const pulse = 1.0 + 0.2 * Math.sin(time * 5.0) + (isOutro ? outroProgress * 0.3 : 0);
      jet1Ref.current.material.emissiveIntensity = pulse;
      jet2Ref.current.material.emissiveIntensity = pulse;
    }
  });
  
  if (progress / 100 < 0.3 && !isOutro) return null;
  
  return (
    <group>
      {/* North Jet */}
      <mesh ref={jet1Ref} position={[0, 5, 0]}>
        <coneGeometry args={[0.5, 10, isMobile ? 8 : 16, 1, true]} />
        <meshPhongMaterial 
          color="#4466ff"
          emissive="#8899ff" 
          transparent 
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* South Jet */}
      <mesh ref={jet2Ref} position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 10, isMobile ? 8 : 16, 1, true]} />
        <meshPhongMaterial 
          color="#4466ff"
          emissive="#8899ff" 
          transparent 
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Custom Starfield background
const StarfieldBackground = ({ progress, outroProgress, isOutro, isMobile }) => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      const progressFactor = progress / 100;
      
      // Calculate combined progress for seamless transition
      const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
      
      // Update uniforms
      meshRef.current.material.uniforms.time.value = time;
      
      // Apply stronger lensing effect during outro while maintaining continuity
      if (isOutro) {
        meshRef.current.material.uniforms.blackHoleStrength.value = 0.2 + outroProgress * 0.3;
      } else {
        meshRef.current.material.uniforms.blackHoleStrength.value = combinedProgress * 0.2;
      }
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[50, 50]} />
      <starFieldMaterial side={THREE.BackSide} />
    </mesh>
  );
};

// Main 3D Scene - with device optimizations and seamless transitions
const Scene3D = ({ progress, outroProgress, onComplete, isOutro }) => {
  const { camera } = useThree();
  const blackHoleSystemRef = useRef();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const gpuTier = useDetectGPU();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    if (isOutro) {
      // Dramatic zoom directly into the black hole - start from current camera position
      const zoomFactor = Math.pow(outroProgress, 3) * 15;
      
      // Move camera directly toward the black hole along z-axis
      // Start from wherever the camera ended during the intro
      camera.position.z = Math.max(2, camera.position.z - zoomFactor * 0.2);
      
      // Gradually center the camera on the black hole
      camera.position.x *= (1 - outroProgress * 0.2);
      camera.position.y *= (1 - outroProgress * 0.2);
      
      // Add subtle camera shake as we approach event horizon
      if (outroProgress > 0.3 && outroProgress < 0.8) {
        const shakeIntensity = 0.05 * Math.sin((outroProgress - 0.3) / 0.5 * Math.PI);
        camera.position.x += Math.sin(time * 50) * shakeIntensity;
        camera.position.y += Math.cos(time * 70) * shakeIntensity;
      }
      
      // Field of view change for dramatic effect - more dramatic on mobile
      camera.fov = 75 + outroProgress * (isMobile ? 25 : 20);
      camera.updateProjectionMatrix();
      
      // Look directly at the black hole
      camera.lookAt(0, 0, 0);
      
      // Complete the animation
      if (outroProgress >= 0.99 && onComplete) {
        setTimeout(() => onComplete(), 100);
      }
    } else {
      // Orbit around the black hole system during intro
      // Closer orbit on mobile for better visibility
      const radius = isMobile ? (12 - progressFactor * 5) : (15 - progressFactor * 5);
      const speed = 0.1 + progressFactor * 0.1;
      const height = Math.sin(time * 0.2) * (2 - progressFactor);
      
      camera.position.x = Math.cos(time * speed) * radius;
      camera.position.y = height;
      camera.position.z = Math.sin(time * speed) * radius;
      camera.lookAt(0, 0, 0);
      
      // Complete intro
      if (progressFactor >= 1 && onComplete) {
        setTimeout(() => onComplete(), 100);
      }
    }
  });
  
  // Determine if we should reduce effects based on device/GPU
  const shouldReduceEffects = isMobile || isTablet || (gpuTier && gpuTier.tier < 2);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={75} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffffff" distance={20} />
      
      {/* Star field background */}
      <StarfieldBackground 
        progress={progress} 
        outroProgress={outroProgress} 
        isOutro={isOutro} 
        isMobile={shouldReduceEffects} 
      />
      
      {/* Black hole system */}
      <group ref={blackHoleSystemRef}>
        <BlackHoleSystem 
          progress={progress} 
          outroProgress={outroProgress} 
          isOutro={isOutro} 
          isMobile={shouldReduceEffects} 
        />
        <GravitationalParticles 
          progress={progress} 
          outroProgress={outroProgress} 
          isOutro={isOutro} 
          isMobile={shouldReduceEffects} 
          gpuTier={gpuTier} 
        />
        <RelativisticJets 
          progress={progress} 
          outroProgress={outroProgress} 
          isOutro={isOutro} 
          isMobile={shouldReduceEffects} 
        />
      </group>
      
      {/* Additional ambient effects - reduced on mobile/low-end devices */}
      <Sparkles 
        count={shouldReduceEffects ? 500 : 1000} 
        scale={25} 
        size={shouldReduceEffects ? 1.5 : 1} // Larger on mobile for visibility
        speed={0.3} 
        opacity={0.5} 
      />
      <Stars 
        radius={80} 
        depth={50} 
        count={shouldReduceEffects ? 1500 : 3000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
    </>
  );
};

// Progress Indicator with enhanced animations - responsive for all devices
const ProgressIndicator = ({ progress, isOutro }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  if (isOutro) return null;
  
  return (
    <MuiBox 
      sx={{ 
        position: 'absolute', 
        bottom: isMobile ? 40 : 60, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: isMobile ? '90%' : (isTablet ? '80%' : 600), 
        textAlign: 'center', 
        zIndex: 10 
      }}
    >
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <motion.div
          animate={{ 
            textShadow: [
              '0 0 30px rgba(99, 102, 241, 0.8)', 
              '0 0 60px rgba(139, 92, 246, 1)', 
              '0 0 90px rgba(34, 211, 238, 0.8)', 
              '0 0 30px rgba(99, 102, 241, 0.8)'
            ] 
          }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.98)', 
              fontWeight: 100, 
              letterSpacing: isMobile ? 4 : 6, 
              textTransform: 'uppercase', 
              mb: isMobile ? 1 : 2, 
              fontSize: isMobile ? '1.5rem' : (isTablet ? '1.7rem' : '1.8rem'), 
              fontFamily: 'monospace' 
            }}
          >
            Initializing
          </Typography>
        </motion.div>
        
        <MuiBox sx={{ position: 'relative', mb: isMobile ? 1 : 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: isMobile ? 3 : 4,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 25%, #22d3ee 50%, #f59e0b 75%, #ffffff 100%)',
                boxShadow: '0 0 40px rgba(99, 102, 241, 1)',
                transition: 'all 0.1s ease'
              }
            }}
          />
          
          {/* Animated glow effect */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 3,
              filter: 'blur(8px)',
              background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.6) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['100% 0%', '0% 0%'],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </MuiBox>
        
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.85)', 
            fontWeight: 200, 
            letterSpacing: isMobile ? 1 : 2, 
            fontSize: isMobile ? '0.7rem' : (isTablet ? '0.8rem' : '0.9rem'), 
            fontFamily: 'monospace' 
          }}
        >
          {isMobile ? 
            `Quantum Processing • Neural Networks` : 
            `Quantum Processing • Neural Networks • Data Synthesis`}
        </Typography>
      </motion.div>
    </MuiBox>
  );
};

// Main component with mobile/tablet optimizations and seamless intro-outro transition
const EnhancedBlackHoleIntroAnimation = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [outroProgress, setOutroProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isOutro, setIsOutro] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const gpuTier = useDetectGPU();
  
  // Adjust animation timing based on device capability
  const getAnimationTiming = useCallback(() => {
    // Base timing for high-end devices
    let introDuration = 4000; // 4 seconds
    let outroDuration = 1500; // 1.5 seconds

    // Adjust for lower-end devices
    if (isMobile || (gpuTier && gpuTier.tier < 2)) {
      introDuration = 1750; // Faster on mobile
      outroDuration = 1500;
    }

    return { introDuration, outroDuration };
  }, [isMobile, gpuTier]);
  
  // Transition to outro phase without resetting black hole state
  const handleIntroComplete = useCallback(() => {
    setIsOutro(true);
    
    const { outroDuration } = getAnimationTiming();
    const stepTime = 16; // ~120fps
    const steps = outroDuration / stepTime;
    const increment = 8 / steps;
    
    let currentOutroProgress = 0;
    const outroInterval = setInterval(() => {
      currentOutroProgress += increment;
      setOutroProgress(Math.min(currentOutroProgress, 1));
      
      if (currentOutroProgress >= 1) {
        clearInterval(outroInterval);
        setIsComplete(true);
        if (onComplete) setTimeout(() => onComplete(), 100);
      }
    }, stepTime);
  }, [onComplete, getAnimationTiming]);
  
  // Progress the intro phase
  useEffect(() => {
    const { introDuration } = getAnimationTiming();
    const stepTime = 8; // ~60fps
    const steps = introDuration / stepTime;
    const increment = 50 / steps;
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        handleIntroComplete();
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [handleIntroComplete, getAnimationTiming]);
  
  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'brightness(3) blur(20px)' }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            background: 'radial-gradient(circle at center, #090921 0%, #000000 100%)',
            overflow: 'hidden'
          }}
        >
          <Canvas
            dpr={[1, isMobile ? 1.5 : 2]} // Lower resolution on mobile
            gl={{
              antialias: !isMobile, // Disable antialiasing on mobile for performance
              alpha: false,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
          >
            <React.Suspense fallback={null}>
              <Scene3D 
                progress={progress} 
                outroProgress={outroProgress} 
                onComplete={handleIntroComplete} 
                isOutro={isOutro} 
              />
            </React.Suspense>
          </Canvas>
          <ProgressIndicator progress={progress} isOutro={isOutro} />
          
          {/* User info in corner with updated time */}
          <MuiBox
            sx={{
              position: 'absolute',
              bottom: isMobile ? 10 : 20,
              right: isMobile ? 10 : 20,
              fontSize: isMobile ? '0.6rem' : '0.7rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'monospace',
              textAlign: 'right'
            }}
          >
            {/* Updated time as requested */}
            2025-07-14 16:07:21 UTC
            <br />
            User: cujoramirez
          </MuiBox>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedBlackHoleIntroAnimation;