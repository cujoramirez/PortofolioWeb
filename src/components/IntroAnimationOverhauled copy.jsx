import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import {
  Sphere,
  PerspectiveCamera,
  Stars,
  Sparkles,
  shaderMaterial,
  useDetectGPU,
  Cloud,
  Billboard,
  useTexture,
} from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Box as MuiBox, Typography, LinearProgress, useMediaQuery, useTheme } from '@mui/material';
import * as THREE from 'three';
import { EffectComposer, ShaderPass, RenderPass } from "three-stdlib";
import { MathUtils } from 'three';

// Extend with Three.js postprocessing components
extend({ EffectComposer, ShaderPass, RenderPass });

// Gravitational Lensing Shader with enhanced brightness
const GravitationalLensingShader = {
  uniforms: {
    tDiffuse: { value: null },
    blackHolePosition: { value: new THREE.Vector2(0.5, 0.5) },
    blackHoleRadius: { value: 0.05 },
    lensStrength: { value: 0.5 },
    distortion: { value: 4.0 },
    curvature: { value: 3.0 },
    ringBrightness: { value: 5.0 }, // Enhanced brightness
    time: { value: 0.0 },
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
    uniform float ringBrightness;
    uniform float time;
    
    varying vec2 vUv;
    
    // Noise function for adding subtle variations
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
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
      
      // Apply photon sphere effect (intense ring of light) with time-based variations
      float photonSphereEffect = smoothstep(blackHoleRadius, blackHoleRadius * 1.1, dist) * 
                               smoothstep(blackHoleRadius * 1.3, blackHoleRadius * 1.2, dist);
      
      // Add time-based variations to photon sphere
      float variation = noise(vec2(dist * 30.0, time * 0.5)) * 0.3 + 0.7;
      photonSphereEffect *= variation;
                                
      // Apply relativistic deflection of light
      vec2 deflection = normalize(delta) * deflectionStrength;
      vec2 distortedUv = vUv - deflection;
      
      // Add enhanced chromatic aberration (gravitational redshift effect)
      vec4 colorR = texture2D(tDiffuse, distortedUv - deflection * 0.015);
      vec4 colorG = texture2D(tDiffuse, distortedUv);
      vec4 colorB = texture2D(tDiffuse, distortedUv + deflection * 0.015);
      
      vec4 color = vec4(colorR.r, colorG.g, colorB.b, 1.0);
      
      // Add photon sphere (Einstein ring) glow with enhanced brightness
      vec3 ringColor = vec3(1.0, 0.8, 0.4) * photonSphereEffect * ringBrightness;
      
      // Add subtle blue-shift on one side, red-shift on the other (relativistic beaming)
      float angleEffect = 0.5 + 0.5 * sin(atan(delta.y, delta.x));
      ringColor = mix(
        ringColor * vec3(1.0, 0.7, 0.4), // Red shift
        ringColor * vec3(0.7, 0.8, 1.2), // Blue shift
        angleEffect
      );
      
      color.rgb += ringColor;
      
      // Add subtle glow around black hole
      float outerGlow = smoothstep(blackHoleRadius * 1.5, blackHoleRadius, dist) * 0.5;
      color.rgb += vec3(0.3, 0.4, 0.9) * outerGlow;
      
      gl_FragColor = color;
    }
  `
};

// Enhanced Multi-Layer Accretion Disk Material with relativistic effects
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
      float redShift = 1.0 + velocity * 0.7; // Enhanced effect
      float blueShift = 1.0 - velocity * 0.7; // Enhanced effect
      
      return vec3(
        color.r * redShift,
        color.g,
        color.b * blueShift
      );
    }
    
    // Temperature to RGB (blackbody radiation)
    vec3 temperatureToColor(float temp) {
      // Approximate blackbody radiation with brighter colors
      vec3 color;
      temp = clamp(temp, 0.0, 1.0);
      
      if (temp < 0.4) {
        // Deep red to orange
        float t = temp / 0.4;
        color = mix(vec3(0.9, 0.3, 0.1), vec3(1.0, 0.6, 0.0), t);
      } else if (temp < 0.7) {
        // Orange to yellow-white
        float t = (temp - 0.4) / 0.3;
        color = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 0.9, 0.6), t);
      } else {
        // Yellow-white to blue-white (hotter core)
        float t = (temp - 0.7) / 0.3;
        color = mix(vec3(1.0, 0.9, 0.6), vec3(0.9, 0.95, 1.2), t);
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
      float diskThickness = 0.2; // Even thicker for better visibility
      
      // Create disk shape with sharper edge definition
      float diskShape = smoothstep(innerRadius, innerRadius + 0.1, radius) * 
                      (1.0 - smoothstep(outerRadius - 0.3, outerRadius, radius)) *
                      (1.0 - smoothstep(diskThickness * 0.7, diskThickness * 1.5, abs(vPosition.y)));
      
      // Create orbital velocity (Keplerian)
      float orbitalVelocity = sqrt(1.0 / radius) * 0.8; // Even more dramatic effect
      
      // Add asymmetry to make the disk more realistic (influenced by magnetic fields)
      float asymmetry = sin(angle * 2.0 + time * 0.1) * 0.2;
      
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
      float temperature = (1.0 / (radius * 0.35)) * 0.95; // Even hotter profile
      temperature = clamp(temperature, 0.0, 1.0);
      
      // Apply asymmetry to temperature
      temperature *= 1.0 + asymmetry * 0.3;
      
      // Apply noise to temperature
      temperature *= 0.8 + combinedNoise * 0.6; // More variation
      
      // Get color from temperature - ENHANCED BRIGHTNESS
      vec3 diskColor = temperatureToColor(temperature) * 2.0; // Increased brightness
      
      // Apply doppler shift based on angle (enhanced effect)
      float doppler = sin(angle) * orbitalVelocity;
      diskColor = dopplerShift(diskColor, doppler);
      
      // Add chaotic hot spots and flares - ENHANCED BRIGHTNESS
      float hotSpots = smoothstep(0.7, 0.9, noise2) * smoothstep(0.6, 0.0, radius - innerRadius) * 3.0;
      
      // Simulate magnetic reconnection flares
      float flares = pow(noise3, 4.0) * 8.0 * smoothstep(0.7, 0.1, radius - innerRadius);
      
      // Add bright streaks along orbital paths
      float streaks = smoothstep(0.7, 0.9, sin(angle * 8.0 + time * 2.0) * 0.5 + 0.5) * 0.7;
      
      // Add plasma filaments
      float filaments = smoothstep(0.6, 0.9, sin(angle * 16.0 + radius * 4.0 + time) * 0.5 + 0.5) * 0.5;
      
      // Intensify based on progress - ENHANCED BRIGHTNESS
      float intensity = diskShape * (1.0 + progress * 2.0) * (1.0 + hotSpots + flares + streaks + filaments);
      
      // Boost during outro
      if (isOutro > 0.5) {
        intensity *= 2.0 + 0.5 * sin(time * 8.0);
        diskColor = mix(diskColor, vec3(1.0, 0.9, 0.8) * 2.0, hotSpots * 0.5);
      }
      
      // ENHANCED BRIGHTNESS - Final boost
      diskColor *= 3.0; // Even brighter for dramatic effect
      
      gl_FragColor = vec4(diskColor * intensity, intensity * 0.95); // Slightly more opaque
    }
  `
);

// Enhanced Starfield Material with gravitational lensing effect
const StarFieldMaterial = shaderMaterial(
  {
    time: 0,
    blackHoleStrength: 0,
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
    uniform float blackHoleStrength;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    const float PI = 3.14159265359;
    
    // Hash function for generating stars
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    // Star field generation
    float starField(vec2 uv, float threshold) {
      vec2 gridUv = floor(uv * 200.0);
      float h = hash(gridUv);
      
      if (h > threshold) {
        vec2 offset = fract(uv * 200.0);
        float dist = length(offset - vec2(0.5));
        return smoothstep(0.1, 0.0, dist) * (h - threshold) / (1.0 - threshold);
      }
      
      return 0.0;
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Apply gravitational lensing distortion
      vec2 center = vec2(0.5, 0.5);
      vec2 delta = uv - center;
      float dist = length(delta);
      
      // Distort UV coordinates based on black hole strength
      float lensStrength = blackHoleStrength * 0.5;
      vec2 distortedUv = uv + normalize(delta) * lensStrength * (1.0 / max(dist, 0.1));
      
      // Generate multiple layers of stars
      float stars1 = starField(distortedUv, 0.99);
      float stars2 = starField(distortedUv * 0.5 + time * 0.001, 0.995);
      float stars3 = starField(distortedUv * 2.0 - time * 0.002, 0.998);
      
      // Combine star layers with reduced intensity
      float starIntensity = stars1 + stars2 * 0.5 + stars3 * 0.3;
      
      // Add subtle color variation to stars
      vec3 starColor = mix(
        vec3(0.8, 0.9, 1.0), // Blue-white
        vec3(1.0, 0.9, 0.7), // Yellow-white
        hash(distortedUv + time * 0.1)
      );
      
      // Add twinkle effect (dimmed)
      float twinkle = sin(time * 3.0 + hash(distortedUv) * 10.0) * 0.5 + 0.5;
      starIntensity *= (0.5 + 0.2 * twinkle); // Reduced from 0.7 + 0.3 to 0.5 + 0.2
      
      // Apply gravitational redshift effect near the center
      float redshift = smoothstep(0.3, 0.0, dist) * blackHoleStrength;
      starColor.r += redshift * 0.3;
      starColor.gb *= (1.0 - redshift * 0.2);
      
      vec3 finalColor = starColor * starIntensity * 0.7; // Additional 30% dimming
      
      gl_FragColor = vec4(finalColor, starIntensity * 0.7);
    }
  `
);

// Cosmic Dust Material
const CosmicDustMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    isOutro: 0,
    blackHolePosition: new THREE.Vector3(0, 0, 0),
  },
  // Vertex shader
  `
    uniform float time;
    uniform float progress;
    uniform float isOutro;
    uniform vec3 blackHolePosition;
    
    attribute float size;
    attribute float opacity;
    attribute vec3 velocity;
    attribute float turbulence;
    
    varying float vOpacity;
    varying vec3 vColor;
    
    void main() {
      vOpacity = opacity;
      
      // Dynamic color based on distance from black hole
      float dist = length(position - blackHolePosition);
      float temperature = 1.0 - min(1.0, dist / 10.0);
      
      // Blue/white for hot dust near black hole, orange/red for cooler dust
      if (temperature > 0.7) {
        vColor = mix(vec3(0.8, 0.9, 1.0), vec3(0.9, 0.8, 1.0), (temperature - 0.7) / 0.3);
      } else if (temperature > 0.4) {
        vColor = mix(vec3(1.0, 0.8, 0.3), vec3(0.8, 0.9, 1.0), (temperature - 0.4) / 0.3);
      } else {
        vColor = mix(vec3(0.8, 0.3, 0.1), vec3(1.0, 0.8, 0.3), temperature / 0.4);
      }
      
      // Apply spiral movement toward black hole
      vec3 toCenter = normalize(blackHolePosition - position);
      float distFactor = max(0.1, min(1.0, 1.0 / dist));
      
      // More chaotic movement with progress
      float chaos = progress * turbulence;
      
      // Calculate new position
      vec3 newPos = position;
      
      // Apply gravitational pull toward black hole - CALMER
      float pullStrength = isOutro > 0.5 ? 0.02 : 0.005; // Reduced pull strength
      pullStrength *= (1.0 + progress);
      newPos += toCenter * distFactor * pullStrength;
      
      // Apply original velocity with less chaos - CALMER
      newPos += velocity * (0.002 + 0.005 * chaos) * (sin(time + turbulence * 5.0) * 0.5 + 0.5);
      
      // Apply much gentler turbulence - CALMER
      newPos.x += sin(time * 0.2 + position.z * 0.05 + turbulence * 5.0) * 0.01 * chaos;
      newPos.y += cos(time * 0.15 + position.x * 0.05 + turbulence * 5.0) * 0.01 * chaos;
      newPos.z += sin(time * 0.1 + position.y * 0.05 + turbulence * 5.0) * 0.01 * chaos;
      
      // Calculate final position
      vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size based on distance and progress
      float sizeFactor = isOutro > 0.5 ? (1.0 + isOutro * 0.5) : (0.6 + progress * 0.4);
      gl_PointSize = size * sizeFactor * (1000.0 / -mvPosition.z);
    }
  `,
  // Fragment shader
  `
    varying float vOpacity;
    varying vec3 vColor;
    
    void main() {
      // Create soft dust particle
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      
      // Softer edges
      float opacity = vOpacity * (1.0 - smoothstep(0.3, 0.5, dist));
      
      gl_FragColor = vec4(vColor, opacity);
    }
  `
);

// X-Ray Corona Material
const XRayCoronaMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    isOutro: 0,
  },
  // Vertex shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      // Add undulation for more dynamic corona
      float undulation = sin(position.x * 5.0 + time * 2.0) * cos(position.z * 4.0 + time) * 0.1;
      vec3 newPos = position;
      newPos.y += undulation;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform float progress;
    uniform float isOutro;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise function
    float hash(vec3 p) {
      p = fract(p * vec3(0.1031, 0.1030, 0.0973));
      p += dot(p, p.yxz + 33.33);
      return fract((p.x + p.y) * p.z);
    }
    
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
    
    void main() {
      // Radial falloff
      float dist = length(vPosition.xz);
      float falloff = 1.0 - smoothstep(0.5, 3.0, dist);
      
      // Dynamic corona pattern
      float pattern = noise(vec3(vPosition.xz * 0.5, time * 0.3));
      pattern += noise(vec3(vPosition.xz * 2.0, time * 0.5)) * 0.5;
      pattern += noise(vec3(vPosition.xz * 4.0, time * 0.7)) * 0.25;
      
      // Create hot spots
      float hotspots = pow(pattern, 3.0) * 3.0;
      
      // X-ray emissions are bright blue/white
      vec3 xrayColor = mix(
        vec3(0.3, 0.4, 1.0), // Blue base
        vec3(1.0, 1.0, 1.0), // White hot spots
        hotspots
      );
      
      // Final intensity (dimmed)
      float intensity = falloff * (0.3 + pattern * 0.7 + hotspots) * progress;
      if (isOutro > 0.5) intensity *= 1.5;
      
      // Brighter core (reduced brightness)
      intensity *= 1.8; // Reduced from 2.5 to 1.8
      
      gl_FragColor = vec4(xrayColor * intensity, intensity * falloff);
    }
  `
);

// Magnetic Field Lines Material
const MagneticFieldMaterial = shaderMaterial(
  {
    time: 0,
    progress: 0,
    isOutro: 0,
  },
  // Vertex shader
  `
    attribute float offset;
    attribute float speed;
    attribute float brightness;
    
    uniform float time;
    uniform float progress;
    uniform float isOutro;
    
    varying float vBrightness;
    
    void main() {
      vBrightness = brightness;
      
      // Calculate phase based on offset and time
      float phase = offset + time * speed;
      
      // Create animated magnetic field lines
      vec3 newPosition = position;
      
      // Add spiraling motion
      float spiralFactor = sin(phase + position.y * 0.5) * 0.2;
      newPosition.x += spiralFactor * sin(phase * 2.0);
      newPosition.z += spiralFactor * cos(phase * 2.0);
      
      // Add pulsation
      float scale = 0.9 + 0.1 * sin(phase * 3.0);
      newPosition *= scale;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float progress;
    uniform float isOutro;
    
    varying float vBrightness;
    
    void main() {
      // Purplish blue color for magnetic field lines
      vec3 color = mix(
        vec3(0.2, 0.4, 1.0), // Blue
        vec3(0.8, 0.3, 1.0), // Purple
        vBrightness
      );
      
      // Enhanced brightness (dimmed)
      float intensity = vBrightness * progress * 1.5; // Reduced from 2.0 to 1.5
      if (isOutro > 0.5) intensity *= 1.3; // Reduced from 1.5 to 1.3
      
      gl_FragColor = vec4(color * intensity, intensity);
    }
  `
);

// Register custom materials
extend({ AccretionDiskMaterial, StarFieldMaterial, CosmicDustMaterial, XRayCoronaMaterial, MagneticFieldMaterial });

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
      const time = clock.getElapsedTime();
      
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
      lensPass.current.uniforms.time.value = time;
      
      // Apply stronger lensing during outro while maintaining continuity
      if (isOutro) {
        lensPass.current.uniforms.lensStrength.value = 0.5 + outroProgress * 0.5;
        lensPass.current.uniforms.distortion.value = 4.0 + outroProgress * 2.0;
        lensPass.current.uniforms.ringBrightness.value = 5.0 + outroProgress * 3.0;
      } else {
        lensPass.current.uniforms.lensStrength.value = 0.2 + progressFactor * 0.3;
        lensPass.current.uniforms.ringBrightness.value = 5.0;
      }
    }
    
    // Render with the composer
    if (composer.current) {
      composer.current.render();
    }
  }, 1);
  
  return null;
};

// Improved Black Hole System
const BlackHoleSystem = ({ progress, outroProgress, isOutro, isMobile }) => {
  const blackHoleRef = useRef();
  const accretionDiskRef = useRef();
  const secondaryDiskRef = useRef();
  const thirdDiskRef = useRef();
  const rotationMarker1Ref = useRef(); // For white rotation marker
  const rotationMarker2Ref = useRef(); // For yellow rotation marker
  const photonSphereRef = useRef();
  const glowRef = useRef();
  const coronaRef = useRef();
  const coronaMeshRef = useRef();
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    // Calculate combined progress for seamless transition
    const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
    
    // Update black hole
    if (blackHoleRef.current) {
      // Scale based on progress
      const scale = 0.7 + combinedProgress * 0.6;
      blackHoleRef.current.scale.setScalar(isOutro ? scale * 1.3 : scale);
      
      // Add subtle rotation to the black hole itself for enhanced spinning effect
      blackHoleRef.current.rotation.z += 0.03;
    }
    
    // Update accretion disk
    if (accretionDiskRef.current && accretionDiskRef.current.material && accretionDiskRef.current.material.uniforms) {
      accretionDiskRef.current.material.uniforms.time.value = time;
      accretionDiskRef.current.material.uniforms.progress.value = combinedProgress;
      accretionDiskRef.current.material.uniforms.isOutro.value = isOutro ? 1.0 : 0.0;
      
      // Rotate disk with NEAR-LIGHTSPEED ROTATION - INSANELY FAST
      const baseRotationSpeed = 3.0 + combinedProgress * 2.0; // EXTREME SPEED - much faster than before
      const chaosVariation = Math.sin(time * 3.0) * 0.5; // Increased chaos variation  
      const violentPulse = Math.sin(time * 8.0) * 0.3; // Much more violent pulsing
      const eventHorizonPull = isOutro ? outroProgress * 1.5 : 0; // MASSIVE speed increase during outro
      const rotationSpeed = baseRotationSpeed + chaosVariation + violentPulse + eventHorizonPull;
      
      // Always apply rotation regardless of progress
      accretionDiskRef.current.rotation.z += rotationSpeed;
      
      // Also rotate the secondary disk (ORANGE #ffaa00) - INSANELY FAST
      if (secondaryDiskRef.current) {
        secondaryDiskRef.current.rotation.z += rotationSpeed * 5.0; // EXTREMELY FAST - 5x base speed
      }
      
      // Rotate the third spiral arm (ORANGE #ff6600) - VIOLENTLY FAST  
      if (thirdDiskRef.current) {
        thirdDiskRef.current.rotation.z += rotationSpeed * 8.0; // VIOLENT SPEED - 8x base speed
      }
      
      // Rotation markers - ABSOLUTELY INSANE SPEEDS for maximum violence
      if (rotationMarker1Ref.current) {
        rotationMarker1Ref.current.rotation.z += rotationSpeed * 12.0; // WHITE MARKER - 12x speed
      }
      
      if (rotationMarker2Ref.current) {
        rotationMarker2Ref.current.rotation.z += rotationSpeed * 15.0; // YELLOW MARKER - 15x speed (FASTEST)
      }
      
      // Much more violent wobble based on chaos level
      const baseWobble = 0.08 + combinedProgress * 0.05; // Increased base wobble
      const wobblePulse = Math.sin(time * 1.5) * 0.04; // Added violent pulsing (renamed to avoid conflict)
      const chaoticTilt = Math.cos(time * 2.2) * 0.03; // Added chaotic tilting
      const wobbleAmount = baseWobble + wobblePulse + chaoticTilt;
      accretionDiskRef.current.rotation.x = Math.PI / 2 + 
        Math.sin(time * 0.3) * wobbleAmount + 
        Math.sin(time * 1.7) * wobbleAmount * 0.5 +
        Math.cos(time * 2.8) * wobbleAmount * 0.3; // Added third wobble component
    }
    
    // Update photon sphere (Einstein ring)
    if (photonSphereRef.current) {
      // Pulsate with enhanced glow
      const baseGlow = 0.8 + 0.4 * Math.sin(time * 3.0) + (isOutro ? outroProgress * 0.4 : 0);
      
      // Add chaotic flares
      const flares = 0.5 * Math.pow(Math.sin(time * 7.0 + Math.sin(time * 3.0)), 2);
      
      photonSphereRef.current.material.emissiveIntensity = baseGlow + flares;
    }
    
    // Update outer glow (dimmed)
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.2 + 0.08 * Math.sin(time * 0.5) + (isOutro ? outroProgress * 0.2 : 0); // Reduced intensity
    }
    
    // Update X-ray corona
    if (coronaMeshRef.current && coronaMeshRef.current.material && coronaMeshRef.current.material.uniforms) {
      coronaMeshRef.current.material.uniforms.time.value = time;
      coronaMeshRef.current.material.uniforms.progress.value = combinedProgress;
      coronaMeshRef.current.material.uniforms.isOutro.value = isOutro ? 1.0 : 0.0;
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
          emissiveIntensity={1.2} // Reduced from 1.5 to 1.2
          transparent 
          opacity={0.8} // More visible
        />
      </Sphere>
      
      {/* X-Ray Corona - New addition for realistic quasar */}
      <group ref={coronaRef} position={[0, 0, 0]}>
        <mesh ref={coronaMeshRef} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6, 6, 32, 32]} />
          <xRayCoronaMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      
      {/* Accretion Disk - ENHANCED FOR BETTER VISIBILITY */}
      <mesh ref={accretionDiskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 5, isMobile ? 256 : 512, isMobile ? 16 : 32]} />
        <accretionDiskMaterial transparent blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Visible Spiral Arms - to make rotation obvious */}
      <mesh ref={secondaryDiskRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 4.5, isMobile ? 128 : 256, isMobile ? 12 : 24]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Additional spiral pattern for maximum visibility */}
      <mesh ref={thirdDiskRef} rotation={[Math.PI / 2, 0, Math.PI * 0.3]}>
        <ringGeometry args={[1.4, 4.0, isMobile ? 64 : 128, isMobile ? 8 : 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* ROTATION MARKER DISKS - Bright spots to show rotation clearly */}
      <mesh ref={rotationMarker1Ref} rotation={[Math.PI / 2, 0, Math.PI * 0.1]}>
        <ringGeometry args={[2.0, 3.5, isMobile ? 8 : 16, isMobile ? 2 : 4]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* More rotation markers at different angles */}
      <mesh ref={rotationMarker2Ref} rotation={[Math.PI / 2, 0, Math.PI * 0.6]}>
        <ringGeometry args={[2.2, 3.0, isMobile ? 6 : 12, isMobile ? 2 : 3]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer Glow - ENHANCED BRIGHTNESS */}
      <Sphere ref={glowRef} args={[2, isMobile ? 16 : 32, isMobile ? 16 : 32]}>
        <meshBasicMaterial 
          color="#4422ee" 
          transparent 
          opacity={0.4} // Brighter
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

// Cosmic Dust Clouds
const CosmicDust = ({ progress, outroProgress, isOutro, isMobile, gpuTier }) => {
  const dustRef = useRef();
  
  // Adjust particle count based on device capability
  const count = useMemo(() => {
    if (isMobile) return 5000;
    if (gpuTier.tier < 2) return 8000;
    return 15000;
  }, [isMobile, gpuTier]);
  
  // Generate dust particles
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const turbulences = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Distribute dust in a torus around the black hole
      const radius = 4 + Math.random() * 15;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 8;
      
      // Apply some spiral structure
      const spiralFactor = 0.2;
      const spiralAngle = angle + radius * spiralFactor;
      
      positions[i3] = radius * Math.cos(spiralAngle);
      positions[i3 + 1] = height * (1 - Math.min(1, radius / 20) * 0.8); // Flatter at outer edges
      positions[i3 + 2] = radius * Math.sin(spiralAngle);
      
      // Varied sizes
      sizes[i] = 0.1 + Math.random() * 0.4;
      
      // Varied opacities
      opacities[i] = 0.1 + Math.random() * 0.4;
      
      // Initial velocities - create orbital motion
      const speed = 0.1 + Math.random() * 0.2;
      velocities[i3] = -Math.sin(angle) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
      velocities[i3 + 2] = Math.cos(angle) * speed;
      
      // Turbulence factor
      turbulences[i] = Math.random();
    }
    
    return { positions, sizes, opacities, velocities, turbulences };
  }, [count]);
  
  useFrame(({ clock }) => {
    if (dustRef.current && dustRef.current.material && dustRef.current.material.uniforms) {
      const time = clock.getElapsedTime();
      const progressFactor = progress / 100;
      
      // Update dust cloud
      dustRef.current.material.uniforms.time.value = time;
      dustRef.current.material.uniforms.progress.value = progressFactor;
      dustRef.current.material.uniforms.isOutro.value = isOutro ? 1.0 : 0.0;
    }
  });
  
  return (
    <points ref={dustRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particles.sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={count}
          array={particles.opacities}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-velocity"
          count={count}
          array={particles.velocities}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-turbulence"
          count={count}
          array={particles.turbulences}
          itemSize={1}
        />
      </bufferGeometry>
      <cosmicDustMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        blackHolePosition={new THREE.Vector3(0, 0, 0)}
      />
    </points>
  );
};

// Magnetic Field Lines
const MagneticField = ({ progress, outroProgress, isOutro }) => {
  const fieldRef = useRef();
  const fieldCount = 200; // Number of field lines
  
  // Generate field lines
  const fieldData = useMemo(() => {
    // Create array to hold all vertices for all lines
    const positions = [];
    const offsets = [];
    const speeds = [];
    const brightnesses = [];
    
    for (let i = 0; i < fieldCount; i++) {
      // Parameters for this field line
      const startRadius = 1.2 + Math.random() * 0.3;
      const startAngle = Math.random() * Math.PI * 2;
      const startHeight = (Math.random() - 0.5) * 0.4;
      
      // Create a curved field line
      const points = 20; // Points per line
      
      for (let j = 0; j < points; j++) {
        const t = j / (points - 1); // 0 to 1
        
        // Field lines start at disk, curve up/down, then back to disk
        const radius = startRadius + t * 3 * (1 - t) * 2;
        const angle = startAngle + t * Math.PI * (0.1 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1);
        const height = startHeight + Math.sin(t * Math.PI) * (2 + Math.random() * 2) * (startHeight >= 0 ? 1 : -1);
        
        // Add point
        positions.push(
          radius * Math.cos(angle),
          height,
          radius * Math.sin(angle)
        );
        
        // Same offset for entire line
        offsets.push(i * 0.1);
        
        // Same speed for entire line
        speeds.push(0.2 + Math.random() * 0.3);
        
        // Brightness varies along line - brightest at center
        brightnesses.push(Math.sin(t * Math.PI));
      }
    }
    
    return {
      positions: new Float32Array(positions),
      offsets: new Float32Array(offsets),
      speeds: new Float32Array(speeds),
      brightnesses: new Float32Array(brightnesses),
      count: positions.length / 3
    };
  }, [fieldCount]);
  
  useFrame(({ clock }) => {
    if (fieldRef.current && fieldRef.current.material && fieldRef.current.material.uniforms) {
      const time = clock.getElapsedTime();
      const progressFactor = progress / 100;
      
      // Calculate combined progress for seamless transition
      const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
      
      // Update field lines
      fieldRef.current.material.uniforms.time.value = time;
      fieldRef.current.material.uniforms.progress.value = combinedProgress;
      fieldRef.current.material.uniforms.isOutro.value = isOutro ? 1.0 : 0.0;
    }
  });
  
  return (
    <points ref={fieldRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={fieldData.count}
          array={fieldData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-offset"
          count={fieldData.count}
          array={fieldData.offsets}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-speed"
          count={fieldData.count}
          array={fieldData.speeds}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-brightness"
          count={fieldData.count}
          array={fieldData.brightnesses}
          itemSize={1}
        />
      </bufferGeometry>
      <magneticFieldMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        size={0.1}
      />
    </points>
  );
};

// Enhanced Relativistic Jets
const RelativisticJets = ({ progress, outroProgress, isOutro, isMobile }) => {
  const jet1Ref = useRef();
  const jet2Ref = useRef();
  const particlesRef1 = useRef();
  const particlesRef2 = useRef();
  
  // Particle count for jets (increased for more violence)
  const jetParticleCount = isMobile ? 1500 : 4000; // Increased from 1000/2500
  
  // Generate jet particles
  const jetParticles = useMemo(() => {
    const positions1 = new Float32Array(jetParticleCount * 3);
    const positions2 = new Float32Array(jetParticleCount * 3);
    const sizes = new Float32Array(jetParticleCount);
    const offsets = new Float32Array(jetParticleCount);
    
    for (let i = 0; i < jetParticleCount; i++) {
      const i3 = i * 3;
      
      // Distance along jet axis (much longer and more violent)
      const distance = Math.pow(Math.random(), 1.2) * 30; // Increased from 15 to 30 (double length)
      
      // Radial distance from jet axis (more chaotic spread)
      const baseRadius = 0.15 + (distance / 30) * 1.2 * Math.random(); // Increased spread
      const chaosRadius = baseRadius * (1 + Math.random() * 0.5); // Added 50% chaos variation
      const angle = Math.random() * Math.PI * 2;
      
      // Add violent turbulence to jet structure
      const turbulence = Math.sin(Math.random() * 10) * 0.3;
      
      // Jet 1 (upward) - more violent and longer
      positions1[i3] = chaosRadius * Math.cos(angle) + turbulence;
      positions1[i3 + 1] = distance;
      positions1[i3 + 2] = chaosRadius * Math.sin(angle) + turbulence;
      
      // Jet 2 (downward) - more violent and longer
      positions2[i3] = chaosRadius * Math.cos(angle) + turbulence;
      positions2[i3 + 1] = -distance;
      positions2[i3 + 2] = chaosRadius * Math.sin(angle) + turbulence;
      
      // Varied sizes (larger particles for more violent look)
      sizes[i] = 0.15 + (1 - distance / 30) * 0.35; // Increased size and adjusted ratio
      
      // Offset for animation
      offsets[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions1, positions2, sizes, offsets };
  }, [jetParticleCount, isMobile]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    // Calculate combined progress for seamless transition
    const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
    
    // Show jets earlier to display their violence longer
    const jetVisibility = Math.max(0, combinedProgress - 0.3) * 1.5; // Start at 30% instead of 50%
    
    if (jet1Ref.current && jet2Ref.current) {
      jet1Ref.current.material.opacity = jetVisibility * 0.5; // Reduced from 0.7 to 0.5
      jet2Ref.current.material.opacity = jetVisibility * 0.5; // Reduced from 0.7 to 0.5
      
      // Scale jets - much larger and more violent growth
      const baseScale = jetVisibility * 1.5; // Increased base scale
      const outroScale = isOutro ? 2.5 + outroProgress * 1.5 : 1.0; // Increased outro scaling
      const jetScale = baseScale * outroScale;
      jet1Ref.current.scale.set(jetScale, jetScale * 2, jetScale); // Elongated in Y direction
      jet2Ref.current.scale.set(jetScale, jetScale * 2, jetScale); // Elongated in Y direction
      
      // Add pulsing effect - intensify during outro
      const pulse = 1.0 + 0.2 * Math.sin(time * 5.0) + (isOutro ? outroProgress * 0.3 : 0);
      jet1Ref.current.material.emissiveIntensity = pulse;
      jet2Ref.current.material.emissiveIntensity = pulse;
    }
    
    // Update jet particles with violent, chaotic motion
    if (particlesRef1.current && particlesRef2.current) {
      const positions1 = particlesRef1.current.geometry.attributes.position.array;
      const positions2 = particlesRef2.current.geometry.attributes.position.array;
      
      for (let i = 0; i < jetParticleCount; i++) {
        const i3 = i * 3;
        const offset = jetParticles.offsets[i];
        
        // Gentler flowing motion along jet - CALMER
        const baseSpeed = 0.8 + Math.abs(positions1[i3 + 1]) * 0.1; // Reduced base speed
        const chaosSpeed = Math.sin(time * 1.5 + offset * 3) * 0.3; // Reduced chaos variation
        const flow = (time * (baseSpeed + chaosSpeed) + offset) % 30; // Same range but calmer speed
        const originalY1 = jetParticles.positions1[i3 + 1];
        const originalY2 = jetParticles.positions2[i3 + 1];
        
        // Gentler turbulence and motion - CALMER
        const gentleTurbulence = Math.sin(time * 2 + offset * 4) * 0.1; // Reduced turbulence
        const gentleWobble = Math.cos(time * 3 + offset * 6) * 0.05; // Much gentler wobble
        const gentlePulse = Math.sin(time * 4 + offset * 2) * 0.03; // Gentle pulse
        
        // Jet 1 (upward) - much calmer
        positions1[i3] = jetParticles.positions1[i3] + gentleTurbulence + gentleWobble;
        positions1[i3 + 1] = originalY1 + flow - Math.floor(flow);
        positions1[i3 + 2] = jetParticles.positions1[i3 + 2] + gentleTurbulence + gentlePulse;
        
        // Jet 2 (downward) - much calmer
        positions2[i3] = jetParticles.positions2[i3] + gentleTurbulence + gentleWobble;
        positions2[i3 + 1] = originalY2 - flow + Math.floor(flow);
        positions2[i3 + 2] = jetParticles.positions2[i3 + 2] + gentleTurbulence + gentlePulse;
      }
      
      particlesRef1.current.geometry.attributes.position.needsUpdate = true;
      particlesRef2.current.geometry.attributes.position.needsUpdate = true;
      
      // Set visibility (dimmed)
      particlesRef1.current.material.opacity = jetVisibility * 0.6; // Reduced from 0.8 to 0.6
      particlesRef2.current.material.opacity = jetVisibility * 0.6; // Reduced from 0.8 to 0.6
    }
  });
  
  if (progress / 100 < 0.25 && !isOutro) return null; // Show jets earlier
  
  return (
    <group>
      {/* North Jet Core */}
      <mesh ref={jet1Ref} position={[0, 5, 0]}>
        <coneGeometry args={[0.5, 10, isMobile ? 8 : 16, 1, true]} />
        <meshPhongMaterial 
          color="#5588ff"
          emissive="#aaddff" 
          transparent 
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* South Jet Core */}
      <mesh ref={jet2Ref} position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.5, 10, isMobile ? 8 : 16, 1, true]} />
        <meshPhongMaterial 
          color="#5588ff"
          emissive="#aaddff" 
          transparent 
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* North Jet Particles */}
      <points ref={particlesRef1}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={jetParticleCount}
            array={jetParticles.positions1}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            attach="attributes-size"
            count={jetParticleCount}
            array={jetParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#aaddff"
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
      
      {/* South Jet Particles */}
      <points ref={particlesRef2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={jetParticleCount}
            array={jetParticles.positions2}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
          />
          <bufferAttribute
            attach="attributes-size"
            count={jetParticleCount}
            array={jetParticles.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#aaddff"
          transparent
          opacity={0.8}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Enhanced Starfield background with more astronomical detail
const EnhancedStarfield = ({ progress, outroProgress, isOutro, isMobile }) => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material && meshRef.current.material.uniforms) {
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

// Light Flares for added visual impact
const LightFlares = ({ progress, outroProgress, isOutro }) => {
  const flareCount = 6;
  const flares = useRef([]);
  
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const progressFactor = progress / 100;
    
    // Calculate combined progress for seamless transition
    const combinedProgress = isOutro ? Math.max(progressFactor, outroProgress) : progressFactor;
    
    // Update each flare
    flares.current.forEach((flare, i) => {
      if (flare) {
        // Pulse with different phases
        const pulse = Math.sin(time * 2 + i * 1.5) * 0.5 + 0.5;
        
        // Scale based on progress and pulse
        const scale = combinedProgress * (0.5 + pulse * 0.5) * (isOutro ? 1.5 : 1.0);
        flare.scale.setScalar(scale);
        
        // Rotate flares
        flare.rotation.z = time * (0.2 + i * 0.1);
        
        // Vary opacity
        if (flare.material) {
          flare.material.opacity = combinedProgress * (0.3 + pulse * 0.2);
        }
      }
    });
  });
  
  return (
    <group>
      {Array.from({ length: flareCount }).map((_, i) => {
        const angle = (i / flareCount) * Math.PI * 2;
        const radius = 1.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <Billboard key={i} ref={el => flares.current[i] = el} position={[x, y, 0]}>
            <mesh rotation={[0, 0, Math.random() * Math.PI * 2]}>
              <planeGeometry args={[2, 2]} />
              <meshBasicMaterial
                color={i % 2 === 0 ? "#ffcc66" : "#66ccff"}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </Billboard>
        );
      })}
    </group>
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
      // MUCH slower and more dramatic zoom into the black hole's event horizon
      const slowZoomFactor = Math.pow(outroProgress, 5) * 8; // Much slower zoom (power 5 instead of 3, reduced multiplier)
      
      // Move camera directly toward the black hole along z-axis - SLOWER
      // Start from wherever the camera ended during the intro
      camera.position.z = Math.max(1, camera.position.z - slowZoomFactor * 0.1); // Slower approach
      
      // Gradually center the camera on the black hole - SLOWER
      camera.position.x *= (1 - outroProgress * 0.1); // Slower centering
      camera.position.y *= (1 - outroProgress * 0.1); // Slower centering
      
      // Add INTENSE dramatic camera shake as we approach event horizon - longer duration
      if (outroProgress > 0.2 && outroProgress < 0.9) { // Longer shake period
        const shakeIntensity = 0.15 * Math.sin((outroProgress - 0.2) / 0.7 * Math.PI); // Increased intensity
        const violentShake = Math.pow(outroProgress, 2) * 0.1; // Additional violent shake that increases
        camera.position.x += Math.sin(time * 80) * (shakeIntensity + violentShake); // Faster, more violent shake
        camera.position.y += Math.cos(time * 100) * (shakeIntensity + violentShake); // Faster, more violent shake
        camera.position.z += Math.sin(time * 90) * (shakeIntensity + violentShake) * 0.7; // More Z-axis shake
      }
      
      // Field of view change for dramatic effect - more dramatic on mobile
      camera.fov = 75 + outroProgress * (isMobile ? 30 : 25);
      camera.updateProjectionMatrix();
      
      // Look directly at the black hole
      camera.lookAt(0, 0, 0);
      
      // Complete the animation
      if (outroProgress >= 0.99 && onComplete) {
        setTimeout(() => onComplete(), 100);
      }
    } else {
      // Orbit around the black hole system during intro
      // Start from much further away for dramatic zoom effect
      const radius = isMobile ? (25 - progressFactor * 18) : (35 - progressFactor * 25); // Increased from 12-15 to 25-35
      const speed = 0.1 + progressFactor * 0.15; // Slightly faster orbit as we get closer
      const height = Math.sin(time * 0.2) * (3 - progressFactor * 2); // More dramatic height variation
      
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
      <PerspectiveCamera makeDefault position={[0, 0, 120]} fov={75} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.15} /> {/* Slightly brighter ambient */}
      <pointLight position={[0, 0, 0]} intensity={3} color="#ffffff" distance={20} />
      
      {/* Enhanced star field background */}
      <EnhancedStarfield 
        progress={progress} 
        outroProgress={outroProgress} 
        isOutro={isOutro} 
        isMobile={shouldReduceEffects} 
      />
      
      {/* Cosmic dust clouds */}
      <CosmicDust
        progress={progress}
        outroProgress={outroProgress}
        isOutro={isOutro}
        isMobile={shouldReduceEffects}
        gpuTier={gpuTier}
      />
      
      {/* Black hole system */}
      <group ref={blackHoleSystemRef}>
        <BlackHoleSystem 
          progress={progress} 
          outroProgress={outroProgress} 
          isOutro={isOutro} 
          isMobile={shouldReduceEffects} 
        />
        <MagneticField
          progress={progress}
          outroProgress={outroProgress}
          isOutro={isOutro}
        />
        <RelativisticJets 
          progress={progress} 
          outroProgress={outroProgress} 
          isOutro={isOutro} 
          isMobile={shouldReduceEffects} 
        />
        <LightFlares
          progress={progress}
          outroProgress={outroProgress}
          isOutro={isOutro}
        />
      </group>
      
      {/* Additional ambient effects - enhanced and optimized */}
      <Sparkles 
        count={shouldReduceEffects ? 1000 : 2000} 
        scale={25} 
        size={shouldReduceEffects ? 1.5 : 1} 
        speed={0.3} 
        opacity={0.7} // Brighter sparkles
        color="#aaccff" // Blueish tint
      />
      
      {/* Volumetric clouds around outer regions for dust visualization */}
      {!shouldReduceEffects && (
        <Cloud
          segments={8}
          bounds={[10, 10, 10]}
          volume={15}
          color="#334455"
          opacity={0.15}
          speed={0.1}
          position={[0, 0, 0]}
        />
      )}
      
      <Stars 
        radius={80} 
        depth={50} 
        count={shouldReduceEffects ? 3000 : 5000} // More stars
        factor={5} // Brighter stars
        saturation={0.2} // Slight color variation
        fade         speed={shouldReduceEffects ? 0.5 : 1} // Faster star movement
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
  const [isFadingOut, setIsFadingOut] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const gpuTier = useDetectGPU();
  
  // Adjust animation timing based on device capability
  const getAnimationTiming = useCallback(() => {
    // Base timing for high-end devices
    let introDuration = 2500; // 4 seconds
    let outroDuration = 1500; // 1.5 seconds

    // Adjust for lower-end devices
    if (isMobile || (gpuTier && gpuTier.tier < 2)) {
      introDuration = 1500; // Faster on mobile
      outroDuration = 1500;
    }

    return { introDuration, outroDuration };
  }, [isMobile, gpuTier]);
  
  // Transition to outro phase without resetting black hole state
  const handleIntroComplete = useCallback(() => {
    setIsOutro(true);
    
    const { outroDuration } = getAnimationTiming();
    const stepTime = 8; // ~120fps
    const steps = outroDuration / stepTime;
    const increment = 2 / steps;
    
    let currentOutroProgress = 0;
    const outroInterval = setInterval(() => {
      currentOutroProgress += increment;
      setOutroProgress(Math.min(currentOutroProgress, 1));
      
      if (currentOutroProgress >= 1) {
        clearInterval(outroInterval);
        // Start fade out before completing
        setIsFadingOut(true);
        // Complete after fade out duration (200ms)
        setTimeout(() => {
          setIsComplete(true);
          if (onComplete) setTimeout(() => onComplete(), 100);
        }, 200);
      }
    }, stepTime);
  }, [onComplete, getAnimationTiming]);
  
  // Progress the intro phase
  useEffect(() => {
    const { introDuration } = getAnimationTiming();
    const stepTime = 32; // ~60fps
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
          animate={{ 
            opacity: isFadingOut ? 0 : 1,
            transition: { 
              duration: 0.2, 
              ease: "easeInOut" 
            }
          }}
          exit={{ 
            opacity: 0,
            transition: { 
              duration: 0.2, 
              ease: "easeInOut" 
            }
          }}
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
          
          {/* User info in corner with exact timestamp and username */}
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
            {/* Exact timestamp and username as requested */}
            2025-07-14 16:20:04 UTC
            <br />
            User: cujoramirez
          </MuiBox>
          
          {/* Radial blur vignette for edge darkening */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.8) 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedBlackHoleIntroAnimation;
