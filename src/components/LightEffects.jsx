import React, { useRef, useEffect, memo, useCallback } from 'react';
import { technologies } from "./techData";

const clampChannel = (value) => Math.max(0, Math.min(255, value));
const clampAlpha = (value) => Math.max(0, Math.min(1, value));

const createColorComponents = (r, g, b, a) => ({
  r: clampChannel(r),
  g: clampChannel(g),
  b: clampChannel(b),
  a: clampAlpha(a)
});

const cloneColorComponents = (color) => ({
  r: color.r,
  g: color.g,
  b: color.b,
  a: color.a
});

const colorToString = (color, alphaOverride) => {
  const alpha = typeof alphaOverride === "number" ? clampAlpha(alphaOverride) : color.a;
  return `rgba(${Math.round(clampChannel(color.r))}, ${Math.round(clampChannel(color.g))}, ${Math.round(clampChannel(color.b))}, ${alpha})`;
};

const applyColor = (target, colorComponents) => {
  target.colorComponents = colorComponents;
  target.color = colorToString(colorComponents);
};

const applyBaseColor = (target, colorComponents) => {
  target.baseColorComponents = cloneColorComponents(colorComponents);
  target.baseColor = colorToString(target.baseColorComponents);
};

const MAX_DEVICE_PIXEL_RATIO = 1.35;

// Professional 3D-inspired atomic visualization with interactive particles
const LightEffects = memo(({ hoveredTech, hoveredTechRef }) => {
  const canvasRef = useRef(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const techElementsRef = useRef([]);
  const isNestHubMaxRef = useRef(false);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const orbitalsRef = useRef([]);
  const molecularStructuresRef = useRef([]);
  const strayParticlesRef = useRef([]);
  const mousePositionRef = useRef({ x: null, y: null });
  const scrollStateRef = useRef({ isScrolling: false, lastEventTime: 0 });
  const activeColorSchemeRef = useRef(null);
  const transitioningColorsRef = useRef(false);
  const colorTransitionProgressRef = useRef(0);
  const frameCountRef = useRef(0);
  const performanceStateRef = useRef({
    quality: 'high',
    profile: null,
    initialQuality: null,
    lowFpsFrames: 0,
    highFpsFrames: 0
  });
  const pendingProfileUpdateRef = useRef(false);
  
  // Extract technology colors - compute once
  const techColorsMap = useRef(technologies.map((tech, index) => {
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };
    
    return {
      index,
      color: hexToRgb(tech.color),
      name: tech.name
    };
  })).current;

  // Check for Nest Hub Max resolution
  const checkNestHubMax = useCallback(() => {
    const isNestHubSize = window.innerWidth === 1280 && window.innerHeight === 800;
    const isNearNestHubSize = 
      (window.innerWidth >= 1270 && window.innerWidth <= 1290) && 
      (window.innerHeight >= 790 && window.innerHeight <= 810);
    
    isNestHubMaxRef.current = isNestHubSize || isNearNestHubSize;
  }, []);
  
  // Setup mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePositionRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      scrollStateRef.current.isScrolling = true;
      scrollStateRef.current.lastEventTime = now;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    techElementsRef.current = Array.from(document.querySelectorAll('.tech-card'));
  }, []);

  useEffect(() => {
    if (hoveredTech !== null && !techElementsRef.current[hoveredTech]) {
      techElementsRef.current = Array.from(document.querySelectorAll('.tech-card'));
    }
  }, [hoveredTech]);
  
  // Update color scheme when hoveredTech changes
  useEffect(() => {
    if (hoveredTech !== null && techColorsMap[hoveredTech]) {
      activeColorSchemeRef.current = techColorsMap[hoveredTech].color;
      transitioningColorsRef.current = true;
      colorTransitionProgressRef.current = 0;
    } else {
      activeColorSchemeRef.current = null;
      transitioningColorsRef.current = true;
      colorTransitionProgressRef.current = 0;
    }
  }, [hoveredTech, techColorsMap]);

  // Main canvas animation setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    checkNestHubMax();
    
    const ctx = canvas.getContext('2d', { alpha: true });
    const particles = [];
    const orbitals = [];
    const strayParticles = [];
    const molecularStructures = [];
    let lastFrameTime = 0;
    let targetFPS = 60;
    let frameInterval = 1000 / targetFPS;

    const PERFORMANCE_PROFILES = {
      high: {
        particleCount: 20,
        strayParticleCount: 18,
        orbitalSystemCount: 3,
        molecularStructureCount: 2,
        heavyTaskModulo: 2,
        connectionStride: 2,
        hoverRippleThreshold: 0.975,
        hoverEmissionThreshold: 0.78,
        mouseParticleThreshold: 0.97,
        maxStrayParticles: 24,
        additionalOrbitalSpawnThreshold: 0.78,
        maxConnectionsPerParticle: 3,
        useConnectionGradients: true,
        targetFps: 55,
        scrollHeavyTaskStride: 2
      },
      medium: {
        particleCount: 14,
        strayParticleCount: 12,
        orbitalSystemCount: 2,
        molecularStructureCount: 1,
        heavyTaskModulo: 3,
        connectionStride: 3,
        hoverRippleThreshold: 0.985,
        hoverEmissionThreshold: 0.84,
        mouseParticleThreshold: 0.978,
        maxStrayParticles: 18,
        additionalOrbitalSpawnThreshold: 0.84,
        maxConnectionsPerParticle: 2,
        useConnectionGradients: false,
        targetFps: 42,
        scrollHeavyTaskStride: 3
      },
      low: {
        particleCount: 9,
        strayParticleCount: 9,
        orbitalSystemCount: 1,
        molecularStructureCount: 1,
        heavyTaskModulo: 4,
        connectionStride: 4,
        hoverRippleThreshold: 0.992,
        hoverEmissionThreshold: 0.92,
        mouseParticleThreshold: 0.985,
        maxStrayParticles: 12,
        additionalOrbitalSpawnThreshold: 0.9,
        maxConnectionsPerParticle: 1,
        useConnectionGradients: false,
        targetFps: 30,
        scrollHeavyTaskStride: 4
      }
    };

    const selectInitialProfile = () => {
      const prefersReducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return 'low';
      }

      const deviceMemory = typeof navigator !== 'undefined' && 'deviceMemory' in navigator ? navigator.deviceMemory : 8;
      const hardwareConcurrency = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 8;
      const isSmallViewport = window.innerWidth < 1024 || window.innerHeight < 720;

      if (deviceMemory <= 3 || hardwareConcurrency <= 4 || isSmallViewport) {
        return 'medium';
      }

      return 'high';
    };

    const applyProfile = (quality) => {
      const profile = PERFORMANCE_PROFILES[quality] ?? PERFORMANCE_PROFILES.high;
      performanceStateRef.current.profile = profile;
      performanceStateRef.current.quality = quality;
      if (!performanceStateRef.current.initialQuality) {
        performanceStateRef.current.initialQuality = quality;
      }
      performanceStateRef.current.lowFpsFrames = 0;
      performanceStateRef.current.highFpsFrames = 0;
      targetFPS = profile.targetFps ?? 60;
      frameInterval = 1000 / targetFPS;
    };

    const getCurrentProfile = () => performanceStateRef.current.profile ?? PERFORMANCE_PROFILES.high;

    applyProfile(selectInitialProfile());

    const scheduleProfileRefresh = () => {
      pendingProfileUpdateRef.current = true;
    };

    const qualityOrder = ['low', 'medium', 'high'];

    const adjustQuality = (direction) => {
      const state = performanceStateRef.current;
      const currentIndex = qualityOrder.indexOf(state.quality);
      if (currentIndex === -1) return false;

      let targetIndex = direction === 'down' ? currentIndex - 1 : currentIndex + 1;
      const initialIndex = qualityOrder.indexOf(state.initialQuality ?? 'high');

      if (direction === 'up' && initialIndex >= 0) {
        targetIndex = Math.min(targetIndex, initialIndex);
      }

      if (targetIndex < 0 || targetIndex >= qualityOrder.length || targetIndex === currentIndex) {
        return false;
      }

      const nextQuality = qualityOrder[targetIndex];
      applyProfile(nextQuality);
      scheduleProfileRefresh();
      return true;
    };

    const recordPerformanceSample = (fps) => {
      if (!Number.isFinite(fps) || fps <= 0) {
        return;
      }

      const state = performanceStateRef.current;
      const lowThreshold = 48;
      const recoveryThreshold = 58;

      if (fps < lowThreshold) {
        state.lowFpsFrames = Math.min(state.lowFpsFrames + 1, 240);
        state.highFpsFrames = Math.max(0, state.highFpsFrames - 2);

        if (state.lowFpsFrames > 45) {
          if (adjustQuality('down')) {
            state.lowFpsFrames = 0;
          }
        }
      } else if (fps > recoveryThreshold) {
        state.highFpsFrames = Math.min(state.highFpsFrames + 1, 1200);
        state.lowFpsFrames = Math.max(0, state.lowFpsFrames - 1);

        if (state.highFpsFrames > 600) {
          if (adjustQuality('up')) {
            state.highFpsFrames = 0;
          }
        }
      } else {
        state.lowFpsFrames = Math.max(0, state.lowFpsFrames - 1);
        state.highFpsFrames = Math.max(0, state.highFpsFrames - 1);
      }
    };

    const ensureStrayParticleBudget = () => {
      const maxStray = getCurrentProfile().maxStrayParticles;
      while (strayParticles.length > maxStray) {
        strayParticles.shift();
      }
    };
    
    // Set canvas dimensions with high DPI support
    const setCanvasDimensions = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const deviceDpr = window.devicePixelRatio || 1;
      const quality = performanceStateRef.current.quality ?? 'high';
      const isScrolling = scrollStateRef.current.isScrolling;
      let dprCap = MAX_DEVICE_PIXEL_RATIO;

      if (quality === 'medium') {
        dprCap = 1.2;
      } else if (quality === 'low') {
        dprCap = 1;
      }

      if (isScrolling) {
        dprCap = Math.min(dprCap, 1);
      }

      const dpr = Math.min(deviceDpr, dprCap);
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const scaledWidth = Math.round(width * dpr);
      const scaledHeight = Math.round(height * dpr);

      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }

      if (canvas.style.width !== `${width}px`) {
        canvas.style.width = `${width}px`;
      }

      if (canvas.style.height !== `${height}px`) {
        canvas.style.height = `${height}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimensionsRef.current = { width, height, dpr };
      checkNestHubMax();
    };

    // Get particle color
    const getParticleColor = (i, opacity, z = 1, isIonized = false) => {
      // Scale opacity based on z-position and ionization
      const adjustedOpacity = opacity * (0.3 + (z * 0.7)) * (isIonized ? 1.2 : 1);

      // If we have an active color scheme from hover
      if (activeColorSchemeRef.current) {
        const { r, g, b } = activeColorSchemeRef.current;

        // Add subtle variation but keep it professional
        const variation = Math.sin(i * 0.3) * 10;

        if (isIonized) {
          return createColorComponents(r + variation - 30, g + variation, b + variation + 50, adjustedOpacity);
        }

        return createColorComponents(r + variation, g + variation, b + variation, adjustedOpacity);
      }

      // Otherwise use a tech color
      const colorIndex = Math.floor(i % techColorsMap.length);
      const baseColor = techColorsMap[colorIndex].color;

      // Slightly adjust color based on particle properties
      const desaturationFactor = isIonized ? 0.7 : 0.85;
      const r = baseColor.r * desaturationFactor + 255 * (1 - desaturationFactor);
      const g = baseColor.g * desaturationFactor + 255 * (1 - desaturationFactor);
      const b = baseColor.b * desaturationFactor + (isIonized ? 50 : 0) + 255 * (1 - desaturationFactor);

      return createColorComponents(r, g, b, adjustedOpacity);
    };  
    
    // Create molecular structures (DNA, crystal lattices, etc.)
    const createMolecularStructures = () => {
      const profile = getCurrentProfile();
      const baseStructureCount = profile.molecularStructureCount;
      const structureCount = isNestHubMaxRef.current
        ? Math.min(1, baseStructureCount)
        : baseStructureCount;
      molecularStructures.length = 0;
      
      for (let s = 0; s < structureCount; s++) {
        // Randomly choose structure type: 0 = DNA, 1 = Crystal, 2 = Molecule
        const structureType = Math.floor(Math.random() * 3);
        const centerX = Math.random() * dimensionsRef.current.width;
        const centerY = Math.random() * dimensionsRef.current.height;
        const colorIndex = Math.floor(Math.random() * techColorsMap.length);
        
        const baseStructure = {
          x: centerX,
          y: centerY,
          z: Math.random() * 0.5 + 0.5, // Z-depth for perspective
          vx: (Math.random() - 0.5) * 0.05,
          vy: (Math.random() - 0.5) * 0.05,
          vz: (Math.random() - 0.5) * 0.002,
          rotationX: Math.random() * Math.PI * 2,
          rotationY: Math.random() * Math.PI * 2,
          rotationZ: Math.random() * Math.PI * 2,
          rotationSpeedX: (Math.random() - 0.5) * 0.002,
          rotationSpeedY: (Math.random() - 0.5) * 0.001,
          rotationSpeedZ: (Math.random() - 0.5) * 0.0015,
          colorIndex,
          structureType,
          age: 0,
          lifetime: 500 + Math.random() * 500, // Structure lifetime before morphing
          energyLevel: Math.random(),
          interactionTimer: 0
        };
        
        // Structure-specific properties
        if (structureType === 0) {
          // DNA Helix
          baseStructure.helixRadius = 15 + Math.random() * 10;
          baseStructure.helixHeight = 60 + Math.random() * 40;
          baseStructure.helixTurns = 3 + Math.random() * 2;
          baseStructure.helixPoints = [];
          
          // Calculate helix points
          const pointsPerTurn = 8;
          const totalPoints = Math.floor(baseStructure.helixTurns * pointsPerTurn);
          
          for (let i = 0; i < totalPoints; i++) {
            const ratio = i / totalPoints;
            const angle = ratio * Math.PI * 2 * baseStructure.helixTurns;
            
            // First strand
            baseStructure.helixPoints.push({
              x: Math.cos(angle) * baseStructure.helixRadius,
              y: (ratio - 0.5) * baseStructure.helixHeight,
              z: Math.sin(angle) * baseStructure.helixRadius,
              size: 2 + Math.random(),
              color: Math.random() > 0.5 ? 0 : 1 // Alternating colors for nucleotides
            });
            
            // Second strand (offset by 180 degrees)
            baseStructure.helixPoints.push({
              x: Math.cos(angle + Math.PI) * baseStructure.helixRadius,
              y: (ratio - 0.5) * baseStructure.helixHeight,
              z: Math.sin(angle + Math.PI) * baseStructure.helixRadius,
              size: 2 + Math.random(),
              color: Math.random() > 0.5 ? 0 : 1
            });
            
            // Add connecting rungs between strands (base pairs)
            if (i % 2 === 0) {
              baseStructure.helixPoints.push({
                isRung: true,
                angle: angle,
                y: (ratio - 0.5) * baseStructure.helixHeight,
                size: 1 + Math.random() * 0.5
              });
            }
          }
        } else if (structureType === 1) {
          // Crystal Lattice
          baseStructure.gridSize = 3 + Math.floor(Math.random() * 2);
          baseStructure.spacing = 12 + Math.random() * 8;
          baseStructure.nodes = [];
          
          // Create lattice points
          for (let x = 0; x < baseStructure.gridSize; x++) {
            for (let y = 0; y < baseStructure.gridSize; y++) {
              for (let z = 0; z < baseStructure.gridSize; z++) {
                baseStructure.nodes.push({
                  x: (x - (baseStructure.gridSize - 1) / 2) * baseStructure.spacing,
                  y: (y - (baseStructure.gridSize - 1) / 2) * baseStructure.spacing,
                  z: (z - (baseStructure.gridSize - 1) / 2) * baseStructure.spacing,
                  size: 2 + Math.random(),
                  pulsePhase: Math.random() * Math.PI * 2,
                  pulseSpeed: 0.03 + Math.random() * 0.02
                });
              }
            }
          }
        } else {
          // Complex Molecule
          baseStructure.atomCount = 5 + Math.floor(Math.random() * 6);
          baseStructure.atoms = [];
          baseStructure.bonds = [];
          
          // Create atoms in 3D space around center
          for (let i = 0; i < baseStructure.atomCount; i++) {
            const distance = 10 + Math.random() * 15;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            baseStructure.atoms.push({
              x: Math.sin(phi) * Math.cos(theta) * distance,
              y: Math.sin(phi) * Math.sin(theta) * distance,
              z: Math.cos(phi) * distance,
              size: 3 + Math.random() * 2,
              element: Math.floor(Math.random() * 4), // Different "elements"
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.02 + Math.random() * 0.02
            });
          }
          
          // Create bonds between atoms (not all atoms are connected)
          for (let i = 0; i < baseStructure.atomCount; i++) {
            const connectionCount = 1 + Math.floor(Math.random() * 2);
            
            for (let j = 0; j < connectionCount; j++) {
              const targetIndex = (i + 1 + Math.floor(Math.random() * (baseStructure.atomCount - 2))) % baseStructure.atomCount;
              
              // Avoid duplicate bonds
              const bondExists = baseStructure.bonds.some(bond => 
                (bond.from === i && bond.to === targetIndex) || 
                (bond.from === targetIndex && bond.to === i)
              );
              
              if (!bondExists) {
                baseStructure.bonds.push({
                  from: i,
                  to: targetIndex,
                  strength: 0.5 + Math.random() * 0.5,
                  bondType: Math.floor(Math.random() * 3) // 0=single, 1=double, 2=triple
                });
              }
            }
          }
        }
        
        molecularStructures.push(baseStructure);
      }
      
      molecularStructuresRef.current = molecularStructures;
    };
    
    // Create orbital systems with enhanced behaviors
    const createOrbitalSystems = () => {
      const profile = getCurrentProfile();
      const configuredCount = profile.orbitalSystemCount;
      const systemCount = isNestHubMaxRef.current
        ? Math.min(2, configuredCount)
        : configuredCount;
      orbitals.length = 0;
      
      for (let s = 0; s < systemCount; s++) {
        // Create the system center
        const centerX = Math.random() * dimensionsRef.current.width;
        const centerY = Math.random() * dimensionsRef.current.height;
        const baseSize = Math.random() * 30 + 40;
        const orbitalCount = Math.floor(Math.random() * 2) + 2;
        
        const system = {
          x: centerX,
          y: centerY,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.1,
          size: baseSize,
          colorIndex: Math.floor(Math.random() * techColorsMap.length),
          orbitalRings: [],
          angle: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.001,
          phase: Math.random() * Math.PI * 2,
          charge: Math.random() > 0.5 ? 1 : -1, // Positive or negative charge
          energyLevel: Math.random(),
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.01,
          electronTransferCooldown: 0,
          canTransferElectron: true,
          isExcited: false, // For quantum excitation simulation
          excitationTime: 0,
        };
        
        // Create orbital rings
        for (let i = 0; i < orbitalCount; i++) {
          const ringRadius = baseSize * (1 + i * 0.8);
          const particleCount = Math.floor(Math.random() * 5) + 5;
          const speed = 0.001 + Math.random() * 0.002;
          const ringAngle = Math.random() * Math.PI * 2;
          const inclination = Math.random() * Math.PI / 4;
          
          const ring = {
            radius: ringRadius,
            particles: [],
            rotationSpeed: speed,
            angle: ringAngle,
            inclination,
            energy: i + 1, // Energy level increases with orbital distance
            quantumState: Math.floor(Math.random() * 3), // Quantum state affects appearance
          };
          
          // Create electrons on the ring
          for (let p = 0; p < particleCount; p++) {
            const particleAngle = (p / particleCount) * Math.PI * 2;
            const particleSize = Math.random() * 2 + 1;
            
            ring.particles.push({
              angle: particleAngle,
              size: particleSize,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.03 + Math.random() * 0.02,
              colorOffset: Math.random() * 20,
              opacity: Math.random() * 0.3 + 0.5,
              ionized: Math.random() > 0.85, // Occasionally create ionized particles
              canJump: true, // Can jump orbits
              jumpCooldown: 0,
              targetSystem: null, // For electron transfer
              transferProgress: 0,
              isTransferring: false
            });
          }
          
          system.orbitalRings.push(ring);
        }
        
        orbitals.push(system);
      }
      
      orbitalsRef.current = orbitals;
    };

    // Create stray particles (free electrons, ions)
    const createStrayParticles = () => {
      const profile = getCurrentProfile();
      const baseCount = profile.strayParticleCount;
      const particleCount = isNestHubMaxRef.current
        ? Math.min(10, baseCount)
        : baseCount;
      strayParticles.length = 0;
      
      for (let i = 0; i < particleCount; i++) {
        const isIon = Math.random() > 0.7; // 30% chance to be an ion
        const charge = isIon ? (Math.random() > 0.5 ? 1 : -1) : 0; // Ions have charge
        const z = Math.random() * 0.8 + 0.2;
        const size = (isIon ? 2 : 1) * (Math.random() + 0.5);
        const opacity = Math.random() * 0.25 + (isIon ? 0.3 : 0.15);
        const speed = 0.2 + Math.random() * 0.4;
        
        const colorComponents = getParticleColor(i, opacity, z, isIon);
        const baseColorComponents = cloneColorComponents(colorComponents);

        const particle = {
          x: Math.random() * dimensionsRef.current.width,
          y: Math.random() * dimensionsRef.current.height,
          z, // z-position for pseudo-3D
          radius: size * z,
          originRadius: size,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          vz: (Math.random() - 0.5) * 0.01,
          charge, // Electric charge affects interactions
          isIon,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.02 + Math.random() * 0.02,
          energyState: Math.random(),
          lifespan: 0,
          maxLifespan: 500 + Math.random() * 1000, // Particles transform over time
          attractedToSystem: null, // Track if particle is attracted to a system
          repelledFromSystem: null, // Track if particle is repelled from a system
          interactionForce: 0, // Strength of attraction/repulsion
          trailPoints: [], // Trail for visual effect
          trailMaxLength: Math.floor(Math.random() * 5) + 3
        };

        applyColor(particle, colorComponents);
        applyBaseColor(particle, baseColorComponents);

        strayParticles.push(particle);
      }
      
      ensureStrayParticleBudget();
      strayParticlesRef.current = strayParticles;
    };

    // Initialize standalone particles
    const initializeParticles = () => {
      const profile = getCurrentProfile();
      const baseCount = profile.particleCount;
      const particleCount = isNestHubMaxRef.current
        ? Math.min(15, baseCount)
        : baseCount;
      particles.length = 0;

      for (let i = 0; i < particleCount; i++) {
        const z = Math.random() * 0.8 + 0.2;
        const size = Math.random() * 2 + 1;
        const opacity = Math.random() * 0.2 + 0.2;
        const colorComponents = getParticleColor(i, opacity, z);
        const baseColorComponents = cloneColorComponents(colorComponents);

        const particle = {
          x: Math.random() * dimensionsRef.current.width,
          y: Math.random() * dimensionsRef.current.height,
          z,
          radius: size * z,
          originRadius: size,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          vz: (Math.random() - 0.5) * 0.01,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.0005,
          orbitRadius: Math.random() * 50 + 20,
          orbitCenterX: Math.random() * dimensionsRef.current.width,
          orbitCenterY: Math.random() * dimensionsRef.current.height,
          useOrbit: Math.random() > 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.01,
          colorTransitionProgress: 0,
          // New properties for enhanced interactions
          bondPartner: null, // For temporary molecular bonds
          bondStrength: 0,
          bondDuration: 0,
          canBond: true,
          bondCooldown: 0
        };

        applyColor(particle, colorComponents);
        applyBaseColor(particle, baseColorComponents);
        particle.isIon = false;

        particles.push(particle);
      }
      
      particlesRef.current = particles;
    };

    const refreshSimulation = () => {
      initializeParticles();
      createOrbitalSystems();
      createStrayParticles();
      createMolecularStructures();
      pendingProfileUpdateRef.current = false;
    };
    
    // Draw glowing effect
    const drawGlow = (x, y, radius, colorComponents, intensity = 0.5) => {
      if (!colorComponents) return;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
      const { r, g, b, a } = colorComponents;
      const innerAlpha = clampAlpha(a * intensity);
      const midAlpha = clampAlpha(innerAlpha * 0.4);

      gradient.addColorStop(0, colorToString(colorComponents, innerAlpha));
      gradient.addColorStop(0.5, colorToString(colorComponents, midAlpha));
      gradient.addColorStop(1, colorToString(colorComponents, 0));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
      ctx.fill();
    };
    
    // Update particle color with smooth transition
    const updateParticleColor = (particle, progress) => {
      if (!particle || !particle.colorComponents || !particle.baseColorComponents) {
        return particle?.color;
      }

      const current = particle.colorComponents;

      if (activeColorSchemeRef.current) {
        const { r, g, b } = activeColorSchemeRef.current;
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (particle.isIon) {
          current.r += (r - 30 - current.r) * easeProgress;
          current.g += (g - current.g) * easeProgress;
          current.b += (b + 50 - current.b) * easeProgress;
        } else {
          current.r += (r - current.r) * easeProgress;
          current.g += (g - current.g) * easeProgress;
          current.b += (b - current.b) * easeProgress;
        }
      } else {
        const base = particle.baseColorComponents;
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        current.r += (base.r - current.r) * easeOutProgress;
        current.g += (base.g - current.g) * easeOutProgress;
        current.b += (base.b - current.b) * easeOutProgress;
        current.a += (base.a - current.a) * easeOutProgress;
      }

      particle.color = colorToString(current);
      return particle.color;
    };
    
    // Process electron transfers between orbital systems
    const processElectronTransfers = () => {
      const profile = getCurrentProfile();
      const allowHeavyTransfers = !scrollStateRef.current.isScrolling && frameCountRef.current % profile.heavyTaskModulo === 0;
      orbitals.forEach((system, systemIndex) => {
        // Only allow transfers if cooldown is complete
        if (allowHeavyTransfers && system.electronTransferCooldown <= 0 && system.canTransferElectron) {
          // Find an orbital ring with particles
          const sourceRingIndex = system.orbitalRings.findIndex(ring => ring.particles.length > 0);
          if (sourceRingIndex >= 0) {
            const sourceRing = system.orbitalRings[sourceRingIndex];
            
            // Chance of electron transfer increases with energy level
            if (Math.random() < 0.001 * sourceRing.energy) {
              // Find a target system (not self)
              const targetSystems = orbitals.filter((_, i) => i !== systemIndex);
              if (targetSystems.length > 0) {
                // Pick a random target system
                const targetSystem = targetSystems[Math.floor(Math.random() * targetSystems.length)];
                
                // Only transfer if systems aren't too far apart
                const dx = system.x - targetSystem.x;
                const dy = system.y - targetSystem.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) {
                  // Pick a random electron to transfer
                  const particleIndex = Math.floor(Math.random() * sourceRing.particles.length);
                  const electron = sourceRing.particles[particleIndex];
                  
                  // Set up the transfer
                  electron.isTransferring = true;
                  electron.transferProgress = 0;
                  electron.sourceX = system.x + sourceRing.radius * Math.cos(electron.angle);
                  electron.sourceY = system.y + sourceRing.radius * Math.sin(electron.angle) * Math.cos(sourceRing.inclination);
                  electron.targetSystem = targetSystem;
                  
                  // Remove from source and prepare for animation
                  sourceRing.particles.splice(particleIndex, 1);
                  
                  // Add to an in-transit array
                  system.inTransitElectrons = system.inTransitElectrons || [];
                  system.inTransitElectrons.push(electron);
                  
                  // Set cooldown to prevent constant transfers
                  system.electronTransferCooldown = 100;
                }
              }
            }
          }
        } else if (system.electronTransferCooldown > 0) {
          // Decrease cooldown
          system.electronTransferCooldown = Math.max(0, system.electronTransferCooldown - 1);
        }
        
        // Process any in-transit electrons
        if (system.inTransitElectrons && system.inTransitElectrons.length > 0) {
          for (let i = system.inTransitElectrons.length - 1; i >= 0; i--) {
            const electron = system.inTransitElectrons[i];
            
            // Update transfer progress
            electron.transferProgress += 0.02;
            
            if (electron.transferProgress >= 1) {
              // Transfer complete - add to target system
              const targetSystem = electron.targetSystem;
              if (targetSystem && targetSystem.orbitalRings.length > 0) {
                // Pick a target ring (preferably outermost)
                const targetRing = targetSystem.orbitalRings[targetSystem.orbitalRings.length - 1];
                
                // Add to the target ring with a random angle
                electron.angle = Math.random() * Math.PI * 2;
                electron.isTransferring = false;
                targetRing.particles.push(electron);
                
                // Sometimes transfer creates energy release
                if (Math.random() > 0.7) {
                  createEnergyRelease(
                    targetSystem.x + targetRing.radius * Math.cos(electron.angle),
                    targetSystem.y + targetRing.radius * Math.sin(electron.angle) * Math.cos(targetRing.inclination),
                    electron.size,
                    targetSystem.colorIndex
                  );
                }
                
                // Remove from in-transit
                system.inTransitElectrons.splice(i, 1);
              }
            }
          }
        }
      });
    };
    
    // Create energy release particles (when electrons jump orbits or transfer)
    const createEnergyRelease = (x, y, size, colorIndex) => {
      const particleCount = Math.floor(Math.random() * 5) + 3;
      
      for (let i = 0; i < particleCount; i++) {
        const baseColor = techColorsMap[colorIndex].color;
        const speed = 0.5 + Math.random() * 1;
        const angle = Math.random() * Math.PI * 2;
        const primaryColor = createColorComponents(baseColor.r + 30, baseColor.g + 30, baseColor.b + 50, 0.7);
        const secondaryColor = createColorComponents(baseColor.r, baseColor.g, baseColor.b, 0.4);
        
        const particle = {
          x,
          y,
          z: Math.random() * 0.5 + 0.5,
          radius: (size * 0.8) + Math.random(),
          originRadius: size,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          vz: (Math.random() - 0.5) * 0.05,
          charge: 0,
          isIon: false,
          isEnergyParticle: true,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.1 + Math.random() * 0.1,
          energyState: 1.0, // High energy state
          lifespan: 0,
          maxLifespan: 50 + Math.random() * 30, // Short lifespan
          trailPoints: [],
          trailMaxLength: 5 + Math.floor(Math.random() * 3)
        };

        applyColor(particle, primaryColor);
        applyBaseColor(particle, secondaryColor);

        strayParticles.push(particle);
        ensureStrayParticleBudget();
      }
    };

    // Process molecular structures
    const updateMolecularStructures = (currentTime) => {
      if (scrollStateRef.current.isScrolling && performanceStateRef.current.quality !== 'high') {
        return;
      }
      molecularStructures.forEach(structure => {
        // Update position and rotation
        structure.x += structure.vx;
        structure.y += structure.vy;
        structure.z += structure.vz;
        
        // Keep in bounds
        if (structure.z < 0.2) structure.z = 0.2;
        if (structure.z > 1) structure.z = 1;
        if (structure.x < -100) structure.x = dimensionsRef.current.width + 100;
        if (structure.x > dimensionsRef.current.width + 100) structure.x = -100;
        if (structure.y < -100) structure.y = dimensionsRef.current.height + 100;
        if (structure.y > dimensionsRef.current.height + 100) structure.y = -100;
        
        // Update rotation angles
        structure.rotationX += structure.rotationSpeedX;
        structure.rotationY += structure.rotationSpeedY;
        structure.rotationZ += structure.rotationSpeedZ;
        
        // Age the structure
        structure.age++;
        if (structure.age > structure.lifetime) {
          // Morph to a different structure type
          structure.structureType = (structure.structureType + 1) % 3;
          structure.age = 0;
          
          // Reset specific properties based on new type
          if (structure.structureType === 0) {
            // Convert to DNA
            structure.helixRadius = 15 + Math.random() * 10;
            structure.helixHeight = 60 + Math.random() * 40;
            structure.helixTurns = 3 + Math.random() * 2;
            structure.helixPoints = [];
            
            const pointsPerTurn = 8;
            const totalPoints = Math.floor(structure.helixTurns * pointsPerTurn);
            
            for (let i = 0; i < totalPoints; i++) {
              const ratio = i / totalPoints;
              const angle = ratio * Math.PI * 2 * structure.helixTurns;
              
              // First strand
              structure.helixPoints.push({
                x: Math.cos(angle) * structure.helixRadius,
                y: (ratio - 0.5) * structure.helixHeight,
                z: Math.sin(angle) * structure.helixRadius,
                size: 2 + Math.random(),
                color: Math.random() > 0.5 ? 0 : 1
              });
              
              // Second strand
              structure.helixPoints.push({
                x: Math.cos(angle + Math.PI) * structure.helixRadius,
                y: (ratio - 0.5) * structure.helixHeight,
                z: Math.sin(angle + Math.PI) * structure.helixRadius,
                size: 2 + Math.random(),
                color: Math.random() > 0.5 ? 0 : 1
              });
              
              // Add connecting rungs
              if (i % 2 === 0) {
                structure.helixPoints.push({
                  isRung: true,
                  angle: angle,
                  y: (ratio - 0.5) * structure.helixHeight,
                  size: 1 + Math.random() * 0.5
                });
              }
            }
          } else if (structure.structureType === 1) {
            // Convert to Crystal Lattice
            structure.gridSize = 3 + Math.floor(Math.random() * 2);
            structure.spacing = 12 + Math.random() * 8;
            structure.nodes = [];
            
            for (let x = 0; x < structure.gridSize; x++) {
              for (let y = 0; y < structure.gridSize; y++) {
                for (let z = 0; z < structure.gridSize; z++) {
                  structure.nodes.push({
                    x: (x - (structure.gridSize - 1) / 2) * structure.spacing,
                    y: (y - (structure.gridSize - 1) / 2) * structure.spacing,
                    z: (z - (structure.gridSize - 1) / 2) * structure.spacing,
                    size: 2 + Math.random(),
                    pulsePhase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.03 + Math.random() * 0.02
                  });
                }
              }
            }
          } else {
            // Convert to Complex Molecule
            structure.atomCount = 5 + Math.floor(Math.random() * 6);
            structure.atoms = [];
            structure.bonds = [];
            
            for (let i = 0; i < structure.atomCount; i++) {
              const distance = 10 + Math.random() * 15;
              const theta = Math.random() * Math.PI * 2;
              const phi = Math.random() * Math.PI;
              
              structure.atoms.push({
                x: Math.sin(phi) * Math.cos(theta) * distance,
                y: Math.sin(phi) * Math.sin(theta) * distance,
                z: Math.cos(phi) * distance,
                size: 3 + Math.random() * 2,
                element: Math.floor(Math.random() * 4),
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
              });
            }
            
            for (let i = 0; i < structure.atomCount; i++) {
              const connectionCount = 1 + Math.floor(Math.random() * 2);
              
              for (let j = 0; j < connectionCount; j++) {
                const targetIndex = (i + 1 + Math.floor(Math.random() * (structure.atomCount - 2))) % structure.atomCount;
                
                const bondExists = structure.bonds.some(bond => 
                  (bond.from === i && bond.to === targetIndex) || 
                  (bond.from === targetIndex && bond.to === i)
                );
                
                if (!bondExists) {
                  structure.bonds.push({
                    from: i,
                    to: targetIndex,
                    strength: 0.5 + Math.random() * 0.5,
                    bondType: Math.floor(Math.random() * 3)
                  });
                }
              }
            }
          }
        }
        
        // Render the structure based on its type
        const baseColor = techColorsMap[structure.colorIndex].color;
        let color;
        
        // If we have an active hover color, use it
        if (activeColorSchemeRef.current) {
          color = activeColorSchemeRef.current;
        } else {
          color = baseColor;
        }
        
        const opacity = 0.4 + structure.z * 0.6; // Adjust opacity by depth
        const scaleFactor = 0.6 + structure.z * 0.4; // Scale by z-depth
        
        if (structure.structureType === 0) {
          // Render DNA Helix
          const renderHelixPoint = (point, pointColor) => {
            // Apply 3D rotation to the point
            const rotatedPoint = rotate3D(
              point.x, point.y, point.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            
            const screenX = structure.x + rotatedPoint.x * scaleFactor;
            const screenY = structure.y + rotatedPoint.y * scaleFactor;
            const depth = (rotatedPoint.z + structure.helixRadius) / (structure.helixRadius * 2);
            const pointOpacity = opacity * depth;
            
            if (!point.isRung) {
              // Draw nucleotide
              const nucleotideColor = point.color === 0 ? 
                `rgba(${color.r}, ${color.g}, ${color.b}, ${pointOpacity})` : 
                `rgba(${Math.min(255, color.r + 40)}, ${Math.min(255, color.g + 20)}, ${Math.min(255, color.b - 20)}, ${pointOpacity})`;
              
              ctx.fillStyle = nucleotideColor;
              ctx.beginPath();
              ctx.arc(screenX, screenY, point.size * scaleFactor, 0, Math.PI * 2);
              ctx.fill();
              
              // Add highlight
              ctx.fillStyle = `rgba(255, 255, 255, ${pointOpacity * 0.4})`;
              ctx.beginPath();
              ctx.arc(screenX - point.size * 0.3, screenY - point.size * 0.3, point.size * 0.4 * scaleFactor, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Draw connecting rung
              const rungStartX = structure.x + Math.cos(point.angle) * structure.helixRadius * scaleFactor;
              const rungStartY = structure.y + point.y * scaleFactor;
              const rungEndX = structure.x + Math.cos(point.angle + Math.PI) * structure.helixRadius * scaleFactor;
              const rungEndY = rungStartY;
              
              ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${pointOpacity * 0.6})`;
              ctx.lineWidth = point.size * scaleFactor;
              ctx.beginPath();
              ctx.moveTo(rungStartX, rungStartY);
              ctx.lineTo(rungEndX, rungEndY);
              ctx.stroke();
            }
          };
          
          // Sort points by depth before rendering
          const pointsWithDepth = structure.helixPoints.map(point => {
            if (point.isRung) return { point, depth: 0 };
            
            const rotated = rotate3D(
              point.x, point.y, point.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            return { point, depth: rotated.z };
          });
          
          // Draw back-to-front
          pointsWithDepth
            .sort((a, b) => a.depth - b.depth)
            .forEach(({ point }) => renderHelixPoint(point));
            
        } else if (structure.structureType === 1) {
          // Render Crystal Lattice
          const renderLatticeNode = (node) => {
            // Apply 3D rotation to the node
            const rotated = rotate3D(
              node.x, node.y, node.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            
            // Project to 2D screen space
            const screenX = structure.x + rotated.x * scaleFactor;
            const screenY = structure.y + rotated.y * scaleFactor;
            
            // Calculate depth factor (0-1) for opacity
            const depth = (rotated.z + structure.spacing) / (structure.spacing * 2);
            const nodeOpacity = opacity * Math.max(0.3, depth);
            
            // Draw node
            ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${nodeOpacity})`;
            
            // Pulse effect
            node.pulsePhase += node.pulseSpeed;
            const pulseFactor = 1 + Math.sin(node.pulsePhase) * 0.2;
            
            ctx.beginPath();
            ctx.arc(screenX, screenY, node.size * pulseFactor * scaleFactor, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight for 3D effect
            ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(
              screenX - node.size * 0.3, 
              screenY - node.size * 0.3, 
              node.size * 0.4 * scaleFactor, 
              0, Math.PI * 2
            );
            ctx.fill();
            
            return { screenX, screenY, depth, size: node.size * pulseFactor * scaleFactor };
          };
          
          // Draw bonds between nodes
          const nodePositions = [];
          
          // Sort nodes by z-depth for proper rendering
          const nodesWithDepth = structure.nodes.map(node => {
            const rotated = rotate3D(
              node.x, node.y, node.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            return { node, depth: rotated.z };
          });
          
          // Render back-to-front
          nodesWithDepth
            .sort((a, b) => a.depth - b.depth)
            .forEach(({ node }) => {
              nodePositions.push(renderLatticeNode(node));
            });
          
          // Draw bonds between adjacent nodes
          ctx.lineWidth = 0.5 * scaleFactor;
          nodePositions.forEach((node1, i) => {
            nodePositions.forEach((node2, j) => {
              if (i >= j) return; // Skip duplicate bonds
              
              const dx = node1.screenX - node2.screenX;
              const dy = node1.screenY - node2.screenY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Only connect nearby nodes
              if (distance < structure.spacing * 1.5 * scaleFactor) {
                const bondOpacity = (node1.depth + node2.depth) / 2 * opacity * 0.6;
                
                // Create gradient for bonds
                const gradient = ctx.createLinearGradient(
                  node1.screenX, node1.screenY,
                  node2.screenX, node2.screenY
                );
                gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${bondOpacity})`);
                gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${bondOpacity})`);
                
                ctx.strokeStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(node1.screenX, node1.screenY);
                ctx.lineTo(node2.screenX, node2.screenY);
                ctx.stroke();
              }
            });
          });
          
        } else {
          // Render Molecule
          const renderAtom = (atom, index) => {
            // Apply 3D rotation
            const rotated = rotate3D(
              atom.x, atom.y, atom.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            
            // Project to screen
            const screenX = structure.x + rotated.x * scaleFactor;
            const screenY = structure.y + rotated.y * scaleFactor;
            
            // Calculate depth factor for rendering
            const depth = (rotated.z + 20) / 40;
            const atomOpacity = opacity * Math.max(0.4, depth);
            
            // Element color variations
            let atomColor;
            switch (atom.element) {
              case 0: // "Carbon"
                atomColor = `rgba(${color.r * 0.8}, ${color.g * 0.8}, ${color.b * 0.8}, ${atomOpacity})`;
                break;
              case 1: // "Oxygen"
                atomColor = `rgba(${Math.min(255, color.r * 0.7)}, ${Math.min(255, color.g * 1.2)}, ${Math.min(255, color.b * 1.3)}, ${atomOpacity})`;
                break;
              case 2: // "Nitrogen"
                atomColor = `rgba(${Math.min(255, color.r * 0.7)}, ${Math.min(255, color.g * 0.7)}, ${Math.min(255, color.b * 1.4)}, ${atomOpacity})`;
                break;
              case 3: // "Hydrogen"
                atomColor = `rgba(${Math.min(255, color.r * 1.2)}, ${Math.min(255, color.g * 1.2)}, ${Math.min(255, color.b * 1.2)}, ${atomOpacity})`;
                break;
              default:
                atomColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${atomOpacity})`;
            }
            
            // Pulse effect
            atom.pulsePhase += atom.pulseSpeed;
            const pulseFactor = 1 + Math.sin(atom.pulsePhase) * 0.15;
            const finalSize = atom.size * pulseFactor * scaleFactor;
            
            // Draw atom glow
            const glowRadius = finalSize * 1.5;
            const glowGradient = ctx.createRadialGradient(
              screenX, screenY, finalSize * 0.5,
              screenX, screenY, glowRadius
            );
            glowGradient.addColorStop(0, atomColor);
            glowGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(screenX, screenY, glowRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw atom
            ctx.fillStyle = atomColor;
            ctx.beginPath();
            ctx.arc(screenX, screenY, finalSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight for 3D effect
            ctx.fillStyle = `rgba(255, 255, 255, ${atomOpacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(
              screenX - finalSize * 0.3, 
              screenY - finalSize * 0.3, 
              finalSize * 0.4, 
              0, Math.PI * 2
            );
            ctx.fill();
            
            return { screenX, screenY, depth, size: finalSize, index };
          };
          
          // Sort atoms by depth
          const atomsWithDepth = structure.atoms.map((atom, index) => {
            const rotated = rotate3D(
              atom.x, atom.y, atom.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            return { atom, index, depth: rotated.z };
          });
          
          // Render bonds first (behind atoms)
          const atomPositions = [];
          
          // Pre-calculate atom positions for bonds
          structure.atoms.forEach((atom, index) => {
            const rotated = rotate3D(
              atom.x, atom.y, atom.z,
              structure.rotationX, structure.rotationY, structure.rotationZ
            );
            
            atomPositions[index] = {
              x: structure.x + rotated.x * scaleFactor,
              y: structure.y + rotated.y * scaleFactor,
              z: rotated.z
            };
          });
          
          // Draw bonds
          structure.bonds.forEach(bond => {
            const fromPos = atomPositions[bond.from];
            const toPos = atomPositions[bond.to];
            
            if (!fromPos || !toPos) return;
            
            // Calculate average depth for bond opacity
            const avgDepth = ((fromPos.z + 20) / 40 + (toPos.z + 20) / 40) / 2;
            const bondOpacity = opacity * Math.max(0.3, avgDepth) * 0.8;
            
            // Draw different bond types
            const bondWidth = 1.5 * scaleFactor * bond.strength;
            const bondSpacing = 1.2 * scaleFactor;
            
            // Bond direction vector
            const dx = toPos.x - fromPos.x;
            const dy = toPos.y - fromPos.y;
            const bondLength = Math.sqrt(dx * dx + dy * dy);
            const nx = dy / bondLength; // Perpendicular normal
            const ny = -dx / bondLength;
            
            // Create gradient for bonds
            const gradient = ctx.createLinearGradient(fromPos.x, fromPos.y, toPos.x, toPos.y);
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${bondOpacity})`);
            gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${bondOpacity})`);
            
            ctx.strokeStyle = gradient;
            
            // Draw different bond types (single, double, triple)
            if (bond.bondType === 0 || bond.bondType === 1 || bond.bondType === 2) {
              // First/single bond
              ctx.lineWidth = bondWidth;
              ctx.beginPath();
              
              if (bond.bondType === 0) {
                // Single bond is centered
                ctx.moveTo(fromPos.x, fromPos.y);
                ctx.lineTo(toPos.x, toPos.y);
              } else {
                // Offset for double/triple bonds
                const offset = bondSpacing * (bond.bondType === 1 ? 0.5 : 1);
                ctx.moveTo(fromPos.x + nx * offset, fromPos.y + ny * offset);
                ctx.lineTo(toPos.x + nx * offset, toPos.y + ny * offset);
              }
              
              ctx.stroke();
            }
            
            // Second bond for double/triple
            if (bond.bondType === 1 || bond.bondType === 2) {
              const offset = bondSpacing * (bond.bondType === 1 ? -0.5 : -1);
              
              ctx.beginPath();
              ctx.moveTo(fromPos.x + nx * offset, fromPos.y + ny * offset);
              ctx.lineTo(toPos.x + nx * offset, toPos.y + ny * offset);
              ctx.stroke();
            }
            
            // Third bond for triple
            if (bond.bondType === 2) {
              ctx.beginPath();
              ctx.moveTo(fromPos.x, fromPos.y);
              ctx.lineTo(toPos.x, toPos.y);
              ctx.stroke();
            }
          });
          
          // Now render atoms in back-to-front order
          atomsWithDepth
            .sort((a, b) => a.depth - b.depth)
            .forEach(({ atom, index }) => {
              renderAtom(atom, index);
            });
        }
      });
    };

    // 3D rotation function
    const rotate3D = (x, y, z, rotX, rotY, rotZ) => {
      // Rotate around X axis
      let tempY = y * Math.cos(rotX) - z * Math.sin(rotX);
      let tempZ = y * Math.sin(rotX) + z * Math.cos(rotX);
      y = tempY;
      z = tempZ;
      
      // Rotate around Y axis
      let tempX = x * Math.cos(rotY) + z * Math.sin(rotY);
      tempZ = -x * Math.sin(rotY) + z * Math.cos(rotY);
      x = tempX;
      z = tempZ;
      
      // Rotate around Z axis
      tempX = x * Math.cos(rotZ) - y * Math.sin(rotZ);
      tempY = x * Math.sin(rotZ) + y * Math.cos(rotZ);
      x = tempX;
      y = tempY;
      
      return { x, y, z };
    };

    // Process interactions between particles and systems
    const processParticleInteractions = () => {
      const profile = getCurrentProfile();
      const heavyModulo = profile.heavyTaskModulo;
      const runHeavyInteractions = !scrollStateRef.current.isScrolling && frameCountRef.current % heavyModulo === 0;
      
      strayParticles.forEach(particle => {
        // Update lifespan
        particle.lifespan++;
        
        // Add point to trail
        if (particle.isEnergyParticle || particle.isIon) {
          particle.trailPoints.unshift({ x: particle.x, y: particle.y, opacity: 1 });
          if (particle.trailPoints.length > particle.trailMaxLength) {
            particle.trailPoints.pop();
          }
          
          // Fade trail points
          particle.trailPoints.forEach((point, i) => {
            point.opacity = 1 - (i / particle.trailMaxLength);
          });
        }
        
        if (runHeavyInteractions) {
          // Process interactions with orbital systems
          orbitals.forEach(system => {
            const dx = particle.x - system.x;
            const dy = particle.y - system.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxInfluence = 150;
            
            if (distance < maxInfluence) {
              // Calculate attraction or repulsion based on charges
              let force = 0;
              
              if (particle.charge && system.charge) {
                // Opposite charges attract, same charges repel
                force = (particle.charge * system.charge) * -0.002 / Math.max(1, distance * 0.5);
              } else {
                // Subtle attraction to systems for neutral particles
                force = -0.0005 / Math.max(1, distance * 0.5);
              }
              
              // Apply force
              const angle = Math.atan2(dy, dx);
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
              
              // Limit max velocity
              const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
              const maxSpeed = particle.isIon ? 1.5 : 0.8;
              if (speed > maxSpeed) {
                particle.vx = (particle.vx / speed) * maxSpeed;
                particle.vy = (particle.vy / speed) * maxSpeed;
              }
              
              // Occasionally, ions may be captured into orbits
              if (particle.isIon && Math.random() > 0.995 && distance < 50) {
                if (system.orbitalRings.length > 0) {
                  const targetRing = system.orbitalRings[Math.floor(Math.random() * system.orbitalRings.length)];
                  
                  targetRing.particles.push({
                    angle: Math.atan2(dy, dx),
                    size: particle.originRadius * 1.2,
                    pulsePhase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.03 + Math.random() * 0.02,
                    colorOffset: Math.random() * 20,
                    opacity: 0.6 + Math.random() * 0.4,
                    ionized: true,
                    canJump: true,
                    jumpCooldown: 0
                  });
                  
                  // Remove the captured particle
                  const index = strayParticles.indexOf(particle);
                  if (index !== -1) {
                    strayParticles.splice(index, 1);
                  }
                  
                  // Create energy flash on capture
                  createEnergyRelease(particle.x, particle.y, particle.radius * 2, system.colorIndex);
                }
              }
            }
          });
        }
        
        // Interactions with molecular structures
        if (runHeavyInteractions) {
          molecularStructures.forEach(structure => {
            const dx = particle.x - structure.x;
            const dy = particle.y - structure.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxInfluence = 100;
            
            if (distance < maxInfluence) {
              // Subtle attraction or deflection
              const force = -0.001 / Math.max(1, distance * 0.5);
              const angle = Math.atan2(dy, dx);
              
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
              
              // Occasionally create energy effects when particles interact with structures
              if (Math.random() > 0.99 && distance < 30) {
                createEnergyRelease(
                  particle.x,
                  particle.y,
                  particle.radius,
                  structure.colorIndex
                );
              }
            }
          });
        }
        
        // Apply decay for energy particles
        if (particle.isEnergyParticle) {
          particle.radius *= 0.98;
          
          // Remove when too small or expired
          if (particle.radius < 0.3 || particle.lifespan > particle.maxLifespan) {
            const index = strayParticles.indexOf(particle);
            if (index !== -1) {
              strayParticles.splice(index, 1);
            }
          }
        }
        
        // Transform particles over time
        // Transform particles over time
        if (particle.lifespan > particle.maxLifespan && !particle.isEnergyParticle) {
          // Either transform the particle to something else or reset it
          if (Math.random() > 0.5) {
            // Transform from ion to neutral or vice versa
            particle.isIon = !particle.isIon;
            particle.charge = particle.isIon ? (Math.random() > 0.5 ? 1 : -1) : 0;
            
            // Update appearance
            const opacity = Math.random() * 0.25 + (particle.isIon ? 0.3 : 0.15);
            const index = strayParticles.indexOf(particle);
            const updatedColor = getParticleColor(index, opacity, particle.z, particle.isIon);
            applyColor(particle, updatedColor);
            applyBaseColor(particle, updatedColor);
            
            // Reset lifespan
            particle.lifespan = 0;
            particle.maxLifespan = 500 + Math.random() * 1000;
          } else {
            // Reset to a new position
            particle.x = Math.random() * dimensionsRef.current.width;
            particle.y = Math.random() * dimensionsRef.current.height;
            particle.vx = (Math.random() - 0.5) * (particle.isIon ? 0.5 : 0.3);
            particle.vy = (Math.random() - 0.5) * (particle.isIon ? 0.5 : 0.3);
            particle.lifespan = 0;
          }
        }
      });
      
      // Process interactions between regular particles and bonding
      particles.forEach((p1, i) => {
        if (p1.bondCooldown > 0) {
          p1.bondCooldown--;
        }
        
        if (runHeavyInteractions && p1.bondPartner === null && p1.canBond && p1.bondCooldown === 0) {
          // Look for a nearby particle to bond with
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            
            if (p2.bondPartner === null && p2.canBond && p2.bondCooldown === 0) {
              const dx = p1.x - p2.x;
              const dy = p1.y - p2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              // Short-range bonds only
              if (distance < 30) {
                // Create temporary molecular bond
                p1.bondPartner = j;
                p2.bondPartner = i;
                p1.bondStrength = p2.bondStrength = 0.1 + Math.random() * 0.3;
                p1.bondDuration = p2.bondDuration = Math.floor(Math.random() * 200) + 100;
                
                // Slight attraction
                const angle = Math.atan2(dy, dx);
                const force = 0.02;
                p1.vx -= Math.cos(angle) * force;
                p1.vy -= Math.sin(angle) * force;
                p2.vx += Math.cos(angle) * force;
                p2.vy += Math.sin(angle) * force;
                
                break;
              }
            }
          }
        }
        
        // Maintain bonds
        if (p1.bondPartner !== null) {
          const p2 = particles[p1.bondPartner];
          
          if (p2) {
            p1.bondDuration--;
            
            // Attractive force to maintain bond
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            // Strength decreases as bond ages
            const remainingStrength = p1.bondStrength * (p1.bondDuration / (p1.bondDuration + 50));
            const force = Math.min(0.05, remainingStrength * distance * 0.01);
            
            p1.vx -= Math.cos(angle) * force;
            p1.vy -= Math.sin(angle) * force;
            p2.vx += Math.cos(angle) * force;
            p2.vy += Math.sin(angle) * force;
            
            // Break bond if expired or too distant
            if (p1.bondDuration <= 0 || distance > 100) {
              p1.bondPartner = null;
              p2.bondPartner = null;
              
              p1.bondCooldown = p2.bondCooldown = 50; // Cooldown before new bonds
            }
          } else {
            // Partner particle no longer exists
            p1.bondPartner = null;
          }
        }
      });
    };

    // Render orbitals with enhanced visual effects and electron transfers
    const updateOrbitals = (currentTime) => {
      orbitals.forEach(system => {
        // Update system position (very slow drift)
        system.x += system.vx;
        system.y += system.vy;
        
        // Wrap around screen edges
        if (system.x < -system.size) system.x = dimensionsRef.current.width + system.size;
        if (system.x > dimensionsRef.current.width + system.size) system.x = -system.size;
        if (system.y < -system.size) system.y = dimensionsRef.current.height + system.size;
        if (system.y > dimensionsRef.current.height + system.size) system.y = -system.size;
        
        // Pulsing effect
        system.pulsePhase += system.pulseSpeed;
        const pulseFactor = 1 + Math.sin(system.pulsePhase) * 0.1;
        
        // Random quantum excitation
        if (!system.isExcited && Math.random() > 0.997) {
          system.isExcited = true;
          system.excitationTime = 0;
        }
        
        // Handle excitation visual effects
        if (system.isExcited) {
          system.excitationTime++;
          
          if (system.excitationTime > 30) {
            system.isExcited = false;
            system.excitationTime = 0;
            
            // Release energy particle when de-exciting
            createEnergyRelease(system.x, system.y, system.size * 0.2, system.colorIndex);
          }
        }
        
        // Get base color
        let systemColor;
        if (activeColorSchemeRef.current) {
          const { r, g, b } = activeColorSchemeRef.current;
          systemColor = { r, g, b };
        } else {
          systemColor = techColorsMap[system.colorIndex].color;
        }
        
        // Enhanced nucleus with quantum effects
        const nucleusRadius = system.size * 0.15 * pulseFactor;
        ctx.beginPath();
        ctx.arc(system.x, system.y, nucleusRadius, 0, Math.PI * 2);
        
        // Nucleus gradient with quantum state visualization
        const nucleusGradient = ctx.createRadialGradient(
          system.x, system.y, 0,
          system.x, system.y, nucleusRadius
        );
        
        // Excited state has brighter core
        const coreOpacity = system.isExcited ? 0.9 : 0.7;
        const outerOpacity = system.isExcited ? 0.5 : 0.3;
        
        nucleusGradient.addColorStop(0, `rgba(${systemColor.r + (system.isExcited ? 50 : 0)}, 
                                            ${systemColor.g + (system.isExcited ? 50 : 0)}, 
                                            ${systemColor.b + (system.isExcited ? 80 : 0)}, 
                                            ${coreOpacity})`);
        nucleusGradient.addColorStop(0.7, `rgba(${systemColor.r}, ${systemColor.g}, ${systemColor.b}, ${outerOpacity})`);
        nucleusGradient.addColorStop(1, `rgba(${systemColor.r}, ${systemColor.g}, ${systemColor.b}, 0.1)`);
        
        ctx.fillStyle = nucleusGradient;
        ctx.fill();
        
        // Enhanced glow for excited state
        const glowRadius = system.isExcited ? nucleusRadius * 5 : nucleusRadius * 4;
        const glowGradient = ctx.createRadialGradient(
          system.x, system.y, nucleusRadius,
          system.x, system.y, glowRadius
        );
        
        glowGradient.addColorStop(0, `rgba(${systemColor.r}, ${systemColor.g}, ${systemColor.b}, ${system.isExcited ? 0.15 : 0.1})`);
        glowGradient.addColorStop(1, `rgba(${systemColor.r}, ${systemColor.g}, ${systemColor.b}, 0)`);
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(system.x, system.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Update system rotation
        system.angle += system.rotationSpeed;
        
        // Draw each orbital ring with quantum-inspired effects
        system.orbitalRings.forEach(ring => {
          // Update ring rotation with variable speed
          ring.rotationSpeed = 0.001 + (ring.energy * 0.0003) - (system.isExcited ? 0.0005 : 0); // Excited state affects rotation
          ring.angle += ring.rotationSpeed;
          
          // Draw quantum orbital path (probability density function inspired)
          ctx.beginPath();
          
          // Orbital shape varies with quantum state
          if (ring.quantumState === 0) {
            // Circular orbit
            ctx.ellipse(
              system.x, 
              system.y, 
              ring.radius * pulseFactor, 
              ring.radius * Math.cos(ring.inclination) * pulseFactor, 
              system.angle + ring.angle, 
              0, 
              Math.PI * 2
            );
          } else if (ring.quantumState === 1) {
            // Slightly elongated orbit
            ctx.ellipse(
              system.x, 
              system.y, 
              ring.radius * pulseFactor * 1.1, 
              ring.radius * Math.cos(ring.inclination) * pulseFactor * 0.9, 
              system.angle + ring.angle, 
              0, 
              Math.PI * 2
            );
          } else {
            // Figure-8 inspired shape (approximated)
            const steps = 50;
            
            for (let i = 0; i <= steps; i++) {
              const t = (i / steps) * Math.PI * 2;
              const variation = Math.sin(t * 2) * 0.15;
              
              const x = system.x + (ring.radius * (1 + variation)) * Math.cos(t) * pulseFactor;
              const y = system.y + (ring.radius * (1 + variation)) * Math.sin(t) * Math.cos(ring.inclination) * pulseFactor;
              
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
          }
          
          // Orbital path appearance
          const orbitalOpacity = system.isExcited ? 0.15 : 0.1;
          ctx.strokeStyle = `rgba(${systemColor.r}, ${systemColor.g}, ${systemColor.b}, ${orbitalOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
          
          // Draw electrons in this orbital
          ring.particles.forEach(particle => {
            // Particle position with quantum effects
            let angle = particle.angle + ring.rotationSpeed * currentTime * 0.1;
            
            // Quantum tunneling effect - occasional position jumps
            if (Math.random() > 0.995) {
              angle += (Math.random() - 0.5) * Math.PI * 0.3;
              particle.angle = angle; // Update particle's actual angle
              
              if (Math.random() > 0.7 && particle.canJump) {
                // Quantum jump between orbitals
                const currentRingIndex = system.orbitalRings.indexOf(ring);
                
                if (currentRingIndex >= 0 && system.orbitalRings.length > 1 && particle.jumpCooldown === 0) {
                  // Determine target ring
                  let targetRingIndex;
                  
                  if (system.isExcited) {
                    // More likely to jump outward when excited
                    targetRingIndex = Math.min(system.orbitalRings.length - 1, currentRingIndex + 1);
                  } else {
                    // More likely to jump inward when not excited
                    targetRingIndex = Math.max(0, currentRingIndex - 1);
                  }
                  
                  if (targetRingIndex !== currentRingIndex) {
                    // Perform the jump
                    const targetRing = system.orbitalRings[targetRingIndex];
                    
                    // Remove from current ring
                    const particleIndex = ring.particles.indexOf(particle);
                    if (particleIndex !== -1) {
                      ring.particles.splice(particleIndex, 1);
                    }
                    
                    // Add to target ring
                    targetRing.particles.push(particle);
                    
                    // Add cooldown before next jump
                    particle.jumpCooldown = 100;
                    
                    // Create energy effect for quantum jump
                    const jumpX = system.x + ring.radius * Math.cos(angle);
                    const jumpY = system.y + ring.radius * Math.sin(angle) * Math.cos(ring.inclination);
                    
                    createEnergyRelease(jumpX, jumpY, particle.size, system.colorIndex);
                  }
                }
              }
            }
            
            // Reduce jump cooldown
            if (particle.jumpCooldown > 0) {
              particle.jumpCooldown--;
            }
            
            // Calculate 3D projected position (elliptical orbit)
            const orbitRadius = ring.radius * pulseFactor;
            const x = system.x + orbitRadius * Math.cos(angle);
            const y = system.y + orbitRadius * Math.sin(angle) * Math.cos(ring.inclination);
            
            // Depth calculation for 3D effect
            const depth = Math.sin(angle) * Math.sin(ring.inclination);
            const zIndex = (1 + depth) / 2; // 0-1 range
            
            // Size and opacity adjusted by depth and quantum state
            const sizeAdjust = 0.7 + (zIndex * 0.6);
            const adjustedSize = particle.size * sizeAdjust;
            
            // Pulse effect
            particle.pulsePhase += particle.pulseSpeed;
            const pulseScale = 1 + Math.sin(particle.pulsePhase) * 0.2;
            const finalSize = adjustedSize * pulseScale;
            
            // Color based on system with variation
            const r = Math.min(255, systemColor.r + particle.colorOffset + (particle.ionized ? 30 : 0));
            const g = Math.min(255, systemColor.g + particle.colorOffset);
            const b = Math.min(255, systemColor.b + particle.colorOffset + (particle.ionized ? 50 : 0));
            
            // Opacity by depth and particle state
            const opacityAdjust = 0.3 + (zIndex * 0.7);
            const finalOpacity = particle.opacity * opacityAdjust * (particle.ionized ? 1.2 : 1);
            
            // Draw particle glow (more intense for ionized)
            const glowIntensity = particle.ionized ? 0.7 : 0.5;
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, finalSize * 3);
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${finalOpacity * glowIntensity})`);
            glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, finalSize * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw particle core
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
            ctx.beginPath();
            ctx.arc(x, y, finalSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight for 3D effect
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity * 0.5})`;
            ctx.beginPath();
            ctx.arc(x - finalSize * 0.3, y - finalSize * 0.3, finalSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            // Occasionally draw quantum entanglement lines between particles in same orbital
            if (Math.random() > 0.99) {
              const nextParticleIndex = (ring.particles.indexOf(particle) + 1) % ring.particles.length;
              if (nextParticleIndex >= 0) {
                const nextParticle = ring.particles[nextParticleIndex];
                
                if (nextParticle) {
                  const nextAngle = nextParticle.angle + ring.rotationSpeed * currentTime * 0.1;
                  const nextX = system.x + orbitRadius * Math.cos(nextAngle);
                  const nextY = system.y + orbitRadius * Math.sin(nextAngle) * Math.cos(ring.inclination);
                  
                  // Draw entanglement as dashed line
                  ctx.beginPath();
                  ctx.setLineDash([2, 3]);
                  ctx.moveTo(x, y);
                  ctx.lineTo(nextX, nextY);
                  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.5})`;
                  ctx.lineWidth = 0.5;
                  ctx.stroke();
                  ctx.setLineDash([]);
                }
              }
            }
          });
        });
        
        // Draw in-transit electrons (transferring between atoms)
        if (system.inTransitElectrons && system.inTransitElectrons.length > 0) {
          system.inTransitElectrons.forEach(electron => {
            if (!electron.targetSystem) return;
            
            const progress = electron.transferProgress;
            
            // Bezier curve path for more interesting motion
            const targetSystem = electron.targetSystem;
            const sourceX = electron.sourceX;
            const sourceY = electron.sourceY;
            const targetX = targetSystem.x;
            const targetY = targetSystem.y;
            
            // Control point offset (makes path arc outward)
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
            
            // Direction perpendicular to path
            const dirX = (targetY - sourceY) / distance;
            const dirY = -(targetX - sourceX) / distance;
            
            // Control point (perpendicular to midpoint)
            const ctrlX = midX + dirX * distance * 0.3;
            const ctrlY = midY + dirY * distance * 0.3;
            
            // Calculate position along bezier curve
            const t = progress;
            const mt = 1 - t;
            const x = mt * mt * sourceX + 2 * mt * t * ctrlX + t * t * targetX;
            const y = mt * mt * sourceY + 2 * mt * t * ctrlY + t * t * targetY;
            
            // Electron size pulsing during transfer
            const transferPulse = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
            const size = electron.size * transferPulse;
            
            // Color based on source and target systems
            const sourceColor = techColorsMap[system.colorIndex].color;
            const targetColor = techColorsMap[targetSystem.colorIndex].color;
            
            // Interpolate colors
            const r = Math.round(sourceColor.r + (targetColor.r - sourceColor.r) * progress);
            const g = Math.round(sourceColor.g + (targetColor.g - sourceColor.g) * progress);
            const b = Math.round(sourceColor.b + (targetColor.b - sourceColor.b) * progress);
            
            // Draw electron trail
            for (let i = 0; i < 5; i++) {
              const trailProgress = Math.max(0, progress - i * 0.03);
              if (trailProgress <= 0) continue;
              
              const trailT = trailProgress;
              const trailMt = 1 - trailT;
              const trailX = trailMt * trailMt * sourceX + 2 * trailMt * trailT * ctrlX + trailT * trailT * targetX;
              const trailY = trailMt * trailMt * sourceY + 2 * trailMt * trailT * ctrlY + trailT * trailT * targetY;
              
              const trailOpacity = (1 - i * 0.2) * 0.5;
              const trailSize = size * (1 - i * 0.15);
              
              ctx.beginPath();
              ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailOpacity})`;
              ctx.fill();
            }
            
            // Draw transferring electron
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            
            // Glow effect
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
            glowGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            ctx.fillStyle = glowGradient;
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
            ctx.fill();
            
            // Add highlight
            ctx.beginPath();
            ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
            ctx.fill();
          });
        }
      });
    };

    // Helper for drawing connections between particles
    const drawConnections = () => {
      const profile = getCurrentProfile();
      if (scrollStateRef.current.isScrolling && performanceStateRef.current.quality !== 'high') {
        return;
      }
      const connectionStride = profile.connectionStride;
      if (connectionStride > 1 && frameCountRef.current % connectionStride !== 0) {
        return;
      }
      const step = connectionStride > 1 ? connectionStride : 1;
      const offset = connectionStride > 1 ? frameCountRef.current % connectionStride : 0;
      const maxConnectionsPerParticle = profile.maxConnectionsPerParticle ?? particles.length;
      const useGradients = profile.useConnectionGradients !== false && !scrollStateRef.current.isScrolling;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        let connectionsDrawn = 0;

        for (let j = i + 1 + offset; j < particles.length; j += step) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Professional connection distance based on z-depth
          const maxDistance = 120 * ((p1.z + p2.z) / 2);
          
          if (distance < maxDistance) {
            // More subtle opacity based on distance
            const opacity = Math.pow(1 - distance / maxDistance, 2) * 0.15;
            
            // Create gradient for connection
            let strokeStyle;
            if (useGradients) {
              const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              gradient.addColorStop(0, colorToString(p1.colorComponents ?? createColorComponents(255, 255, 255, opacity), opacity));
              gradient.addColorStop(1, colorToString(p2.colorComponents ?? createColorComponents(255, 255, 255, opacity), opacity));
              strokeStyle = gradient;
            } else {
              strokeStyle = colorToString(p1.colorComponents ?? createColorComponents(200, 200, 255, opacity), opacity);
            }

            // Thinner lines
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = Math.min(0.5, ((p1.radius + p2.radius) * 0.2));
            ctx.stroke();

            connectionsDrawn++;
            if (connectionsDrawn >= maxConnectionsPerParticle) {
              break;
            }
          }
        }
        
        // Draw molecular bonds (stronger connections)
        if (p1.bondPartner !== null) {
          const p2 = particles[p1.bondPartner];
          
          if (p2) {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Bond strength visual effect
            const bondOpacity = 0.3 + (p1.bondStrength * 0.5);
            
            // Create gradient for bond
            const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            const startColor = p1.colorComponents ?? createColorComponents(255, 255, 255, bondOpacity);
            const endColor = p2.colorComponents ?? createColorComponents(255, 255, 255, bondOpacity);

            gradient.addColorStop(0, colorToString(startColor, bondOpacity));
            gradient.addColorStop(1, colorToString(endColor, bondOpacity));
              
              // Thicker line for bond
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1 + p1.bondStrength * 2;
              ctx.stroke();
              
              // Add small glowing points along the bond
              const steps = 3;
              for (let i = 1; i < steps; i++) {
                const ratio = i / steps;
                const pointX = p1.x + (p2.x - p1.x) * ratio;
                const pointY = p1.y + (p2.y - p1.y) * ratio;
                const interpolatedColor = createColorComponents(
                  startColor.r * (1 - ratio) + endColor.r * ratio,
                  startColor.g * (1 - ratio) + endColor.g * ratio,
                  startColor.b * (1 - ratio) + endColor.b * ratio,
                  bondOpacity * 1.5
                );
                ctx.beginPath();
                ctx.arc(pointX, pointY, 1, 0, Math.PI * 2);
                ctx.fillStyle = colorToString(interpolatedColor);
                ctx.fill();
              }
          }
        }
      }
    };

    // Draw stray particles with enhanced effects
    const drawStrayParticles = () => {
      strayParticles.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Wrap around screen edges
        if (particle.x < -50) particle.x = dimensionsRef.current.width + 50;
        if (particle.x > dimensionsRef.current.width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = dimensionsRef.current.height + 50;
        if (particle.y > dimensionsRef.current.height + 50) particle.y = -50;
        if (particle.z < 0.2) particle.z = 1;
        if (particle.z > 1) particle.z = 0.2;
        
        // Update radius based on z-depth
        particle.radius = particle.originRadius * particle.z;
        
        // Pulse effect
        particle.pulsePhase += particle.pulseSpeed;
        const pulseFactor = 1 + Math.sin(particle.pulsePhase) * 0.2;
        const finalSize = particle.radius * pulseFactor;
        
        // Fade trail for energy particles
        if (particle.trailPoints && particle.trailPoints.length > 0) {
          // Draw trail
          particle.trailPoints.forEach((point, i) => {
            const trailSize = finalSize * (1 - i / particle.trailMaxLength);
            
            const colorComponents = particle.colorComponents;
            if (colorComponents) {
              ctx.fillStyle = colorToString(colorComponents, point.opacity * 0.3);
              ctx.beginPath();
              ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
        
        // Draw main particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Add glow effect for ions and energy particles
        if (particle.isIon || particle.isEnergyParticle) {
          drawGlow(particle.x, particle.y, finalSize, particle.colorComponents, 0.5);
        }
      });
    };

    // Main animation loop
    const animate = (currentTime) => {
      animationRef.current = requestAnimationFrame(animate);
      frameCountRef.current++;
      
      // Frame rate control
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = currentTime;

      const fps = elapsed > 0 ? 1000 / elapsed : targetFPS;
      recordPerformanceSample(fps);

      if (scrollStateRef.current.isScrolling) {
        const scrollDelta = currentTime - scrollStateRef.current.lastEventTime;
        if (scrollDelta > 240) {
          scrollStateRef.current.isScrolling = false;
        }
      }

      const isScrolling = scrollStateRef.current.isScrolling;
      const currentProfile = getCurrentProfile();
      const heavyTaskStride = isScrolling ? (currentProfile.scrollHeavyTaskStride ?? 3) : 1;
      const shouldRunHeavySystems = frameCountRef.current % heavyTaskStride === 0;

      if (pendingProfileUpdateRef.current) {
        refreshSimulation();
      }
      
      // Semi-transparent clear for subtle trails
      ctx.fillStyle = 'rgba(15, 5, 40, 0.2)';
  const { width: canvasWidth = canvas.width, height: canvasHeight = canvas.height } = dimensionsRef.current;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      // Update color transition progress with easing
      if (transitioningColorsRef.current) {
        colorTransitionProgressRef.current += 0.015; // Slower transitions
        if (colorTransitionProgressRef.current >= 1) {
          colorTransitionProgressRef.current = 1;
          transitioningColorsRef.current = false;
        }
      }
      
      // Update particle positions
      const deferColorUpdates = isScrolling && !shouldRunHeavySystems;

      particles.forEach((particle, index) => {
        // Apply color transition if needed
        if (transitioningColorsRef.current) {
          if (!deferColorUpdates || (frameCountRef.current + index) % 2 === 0) {
            updateParticleColor(particle, colorTransitionProgressRef.current);
          }
        }
        
        if (particle.useOrbit) {
          // Orbital motion
          particle.orbitAngle += particle.orbitSpeed;
          particle.x = particle.orbitCenterX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
          particle.y = particle.orbitCenterY + Math.sin(particle.orbitAngle) * particle.orbitRadius;
        } else {
          // Free motion
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.z += particle.vz;
          
          // Wrap around screen edges with buffer
          if (particle.x < -50) particle.x = dimensionsRef.current.width + 50;
          if (particle.x > dimensionsRef.current.width + 50) particle.x = -50;
          if (particle.y < -50) particle.y = dimensionsRef.current.height + 50;
          if (particle.y > dimensionsRef.current.height + 50) particle.y = -50;
          if (particle.z < 0.2) particle.z = 1;
          if (particle.z > 1) particle.z = 0.2;
          
          // Update radius based on z-depth
          particle.radius = particle.originRadius * particle.z;

          if (deferColorUpdates) {
            particle.vx *= 0.96;
            particle.vy *= 0.96;
          }
        }
        
        // Pulse effect
        particle.pulsePhase += particle.pulseSpeed;
        const pulseFactor = 1 + Math.sin(particle.pulsePhase) * 0.15;
        
        // Draw the particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * pulseFactor, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Draw connections between particles
      if (shouldRunHeavySystems) {
        drawConnections();
      }

      // Update orbital systems
      if (shouldRunHeavySystems || frameCountRef.current % 2 === 0) {
        updateOrbitals(currentTime);
      }

      // Update and draw stray particles
      drawStrayParticles();

      if (shouldRunHeavySystems || (!isScrolling && frameCountRef.current % 2 === 0)) {
        // Process particle interactions
        processParticleInteractions();
      }

      if (shouldRunHeavySystems) {
        // Process electron transfers
        processElectronTransfers();
      }

      if (shouldRunHeavySystems || (!isScrolling && frameCountRef.current % 3 === 0)) {
        // Update molecular structures
        updateMolecularStructures(currentTime);
      }
      
      // Special subtle effect for hovered tech
      if (hoveredTech !== null && hoveredTechRef && hoveredTechRef.current !== null && !isNestHubMaxRef.current) {
        const techElements = techElementsRef.current;
        let hoveredElement = techElements[hoveredTech];

        if (!hoveredElement && frameCountRef.current % 60 === 0) {
          techElementsRef.current = Array.from(document.querySelectorAll('.tech-card'));
          hoveredElement = techElementsRef.current[hoveredTech];
        }

        if (hoveredElement) {
          const rect = hoveredElement.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          
          const profile = getCurrentProfile();

          // Create elegant ripple effect
          if (Math.random() > profile.hoverRippleThreshold) {
            const tech = technologies[hoveredTech];
            
            // Multiple concentric ripples
            for (let i = 0; i < 4; i++) {
              const rippleSize = 20 + i * 15;
              const opacity = 0.15 - (i * 0.03);
              
              ctx.beginPath();
              ctx.arc(centerX, centerY, rippleSize, 0, Math.PI * 2);
              ctx.strokeStyle = `${tech.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }
            
            // Occasionally emit particles from the tech card
            if (Math.random() > profile.hoverEmissionThreshold) {
              const baseColor = techColorsMap[hoveredTech % techColorsMap.length].color;
              const angle = Math.random() * Math.PI * 2;
              const speed = 0.5 + Math.random() * 1;
              const primaryColor = createColorComponents(baseColor.r + 30, baseColor.g + 30, baseColor.b + 50, 0.6);
              const baseColorComponents = createColorComponents(baseColor.r, baseColor.g, baseColor.b, 0.4);
              
              const particle = {
                x: centerX,
                y: centerY,
                z: Math.random() * 0.3 + 0.7,
                radius: 1 + Math.random(),
                originRadius: 1 + Math.random(),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 0.01,
                charge: 0,
                isIon: false,
                isEnergyParticle: true,
                pulsePhase: Math.random() * Math.PI * 2,
                pulseSpeed: 0.1 + Math.random() * 0.1,
                energyState: 1.0,
                lifespan: 0,
                maxLifespan: 60 + Math.random() * 30,
                trailPoints: [],
                trailMaxLength: 5 + Math.floor(Math.random() * 3)
              };

              applyColor(particle, primaryColor);
              applyBaseColor(particle, baseColorComponents);
              strayParticles.push(particle);
              ensureStrayParticleBudget();
            }
          }
          
          // Create attraction effect toward hovered tech
          if (frameCountRef.current % 3 === 0) {
            particles.forEach(particle => {
              const dx = centerX - particle.x;
              const dy = centerY - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 300) {
                const force = 0.015 * (1 - distance / 300);
                const angle = Math.atan2(dy, dx);
                
                particle.vx += Math.cos(angle) * force;
                particle.vy += Math.sin(angle) * force;
                
                // Limit max velocity
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                const maxSpeed = 1.5;
                if (speed > maxSpeed) {
                  particle.vx = (particle.vx / speed) * maxSpeed;
                  particle.vy = (particle.vy / speed) * maxSpeed;
                }
              }
            });
            
            strayParticles.forEach(particle => {
              const dx = centerX - particle.x;
              const dy = centerY - particle.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance < 250) {
                const force = 0.02 * (1 - distance / 250);
                const angle = Math.atan2(dy, dx);
                
                particle.vx += Math.cos(angle) * force;
                particle.vy += Math.sin(angle) * force;
              }
            });
          }
        }
      }
      
      // Mouse interaction with particles
      if (mousePositionRef.current.x !== null && mousePositionRef.current.y !== null) {
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        const influenceRadius = 150;
        
        if (frameCountRef.current % 2 === 0) {
          // Add subtle influence to nearby particles
          particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < influenceRadius) {
              const force = 0.05 * (1 - distance / influenceRadius);
              const angle = Math.atan2(dy, dx);
              
              // Subtle attraction
              particle.vx += Math.cos(angle) * force;
              particle.vy += Math.sin(angle) * force;
            }
          });
          
          // Maybe create a new energy particle on mouse movement
          const profile = getCurrentProfile();
          if (Math.random() > profile.mouseParticleThreshold) {
            const randIndex = Math.floor(Math.random() * techColorsMap.length);
            const baseColor = techColorsMap[randIndex].color;
            const primaryColor = createColorComponents(baseColor.r, baseColor.g, baseColor.b, 0.6);
            const secondaryColor = createColorComponents(baseColor.r, baseColor.g, baseColor.b, 0.4);

            const particle = {
              x: mouseX + (Math.random() - 0.5) * 20,
              y: mouseY + (Math.random() - 0.5) * 20,
              z: Math.random() * 0.3 + 0.7,
              radius: 1 + Math.random(),
              originRadius: 1 + Math.random(),
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              vz: (Math.random() - 0.5) * 0.01,
              charge: 0,
              isIon: Math.random() > 0.7,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.05 + Math.random() * 0.05,
              energyState: Math.random(),
              lifespan: 0,
              maxLifespan: 100 + Math.random() * 100,
              trailPoints: [],
              trailMaxLength: 3 + Math.floor(Math.random() * 2)
            };

            applyColor(particle, primaryColor);
            applyBaseColor(particle, secondaryColor);
            strayParticles.push(particle);
            ensureStrayParticleBudget();
          }
        }
      }
      
      // Periodically refresh some particles for variety
      if (frameCountRef.current % 300 === 0) {
        // Ensure fresh energy particles are created
        const maxStray = getCurrentProfile().maxStrayParticles;
        if (strayParticles.length < maxStray) {
          const randIndex = Math.floor(Math.random() * techColorsMap.length);
          const baseColor = techColorsMap[randIndex].color;
          const x = Math.random() * dimensionsRef.current.width;
          const y = Math.random() * dimensionsRef.current.height;
          
          createEnergyRelease(x, y, 2, randIndex);
        }
        
        // Random chance to create a new orbital system if few exist
        const profile = getCurrentProfile();
        const targetOrbitals = profile.orbitalSystemCount;
        if (orbitals.length < targetOrbitals && Math.random() > profile.additionalOrbitalSpawnThreshold) {
          const system = {
            x: Math.random() * dimensionsRef.current.width,
            y: Math.random() * dimensionsRef.current.height,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            size: Math.random() * 30 + 40,
            colorIndex: Math.floor(Math.random() * techColorsMap.length),
            orbitalRings: [],
            angle: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.001,
            phase: Math.random() * Math.PI * 2,
            charge: Math.random() > 0.5 ? 1 : -1,
            energyLevel: Math.random(),
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.01 + Math.random() * 0.01,
            electronTransferCooldown: 0,
            canTransferElectron: true,
            isExcited: false,
            excitationTime: 0,
          };
          
          // Add a single orbital ring
          const ringRadius = system.size * 1.2;
          const particleCount = Math.floor(Math.random() * 3) + 2;
          const speed = 0.001 + Math.random() * 0.002;
          const ringAngle = Math.random() * Math.PI * 2;
          const inclination = Math.random() * Math.PI / 4;
          
          const ring = {
            radius: ringRadius,
            particles: [],
            rotationSpeed: speed,
            angle: ringAngle,
            inclination,
            energy: 1,
            quantumState: Math.floor(Math.random() * 3),
          };
          
          // Create electrons on the ring
          for (let p = 0; p < particleCount; p++) {
            const particleAngle = (p / particleCount) * Math.PI * 2;
            const particleSize = Math.random() * 2 + 1;
            
            ring.particles.push({
              angle: particleAngle,
              size: particleSize,
              pulsePhase: Math.random() * Math.PI * 2,
              pulseSpeed: 0.03 + Math.random() * 0.02,
              colorOffset: Math.random() * 20,
              opacity: Math.random() * 0.3 + 0.5,
              ionized: Math.random() > 0.7,
              canJump: true,
              jumpCooldown: 0
            });
          }
          
          system.orbitalRings.push(ring);
          orbitals.push(system);
        }
      }
    };

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions();
      refreshSimulation();
    };

    // Initial setup
    setCanvasDimensions();
    refreshSimulation();
    animate(0);
    
    // Event listeners
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleResize();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationRef.current);
    };
  }, []); // Empty dependency array ensures setup runs only once

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
});

export default LightEffects;
