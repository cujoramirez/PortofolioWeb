import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// Import all 3D scenes
import HeroScene3D from './HeroScene3D';
import AboutScene3D from './AboutScene3D';
import ProjectsScene3D from './ProjectsScene3D';
import ResearchScene3D from './ResearchScene3D';
import CertificatesScene3D from './CertificatesScene3D';
import ContactScene3D from './ContactScene3D';
import SectionTransitions from './SectionTransitions';
import { EnhancedLighting, AnimatedGlow, CSSPostProcessing } from './EnhancedEffects';

// Loading fallback
const SceneLoader = () => (
  <mesh>
    <sphereGeometry args={[1, 16, 16]} />
    <meshStandardMaterial color="#6366f1" wireframe />
  </mesh>
);

// Main Scene Manager Component
const EnterpriseSceneManager = ({ 
  currentSection = 'hero',
  isVisible = true,
  mousePosition = { x: 0, y: 0 },
  scrollProgress = 0,
  transitionProgress = 0,
  enableInteractions = true,
  enablePostProcessing = true
}) => {
  const [activeScene, setActiveScene] = useState(currentSection);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState('wave');

  // Scene configurations
  const sceneConfigs = useMemo(() => ({
    hero: {
      component: HeroScene3D,
      camera: { position: [0, 0, 10], fov: 75 },
      environment: 'city',
      transition: 'wave'
    },
    about: {
      component: AboutScene3D,
      camera: { position: [5, 5, 15], fov: 60 },
      environment: 'studio',
      transition: 'spiral'
    },
    projects: {
      component: ProjectsScene3D,
      camera: { position: [0, 2, 12], fov: 70 },
      environment: 'warehouse',
      transition: 'portal'
    },
    research: {
      component: ResearchScene3D,
      camera: { position: [3, 3, 10], fov: 65 },
      environment: 'forest',
      transition: 'morph'
    },
    certificates: {
      component: CertificatesScene3D,
      camera: { position: [0, 8, 15], fov: 55 },
      environment: 'sunset',
      transition: 'burst'
    },
    contact: {
      component: ContactScene3D,
      camera: { position: [0, 0, 8], fov: 80 },
      environment: 'night',
      transition: 'wave'
    }
  }), []);

  // Handle section changes with transitions
  useEffect(() => {
    if (currentSection !== activeScene) {
      setIsTransitioning(true);
      setTransitionType(sceneConfigs[currentSection]?.transition || 'wave');
      
      const timer = setTimeout(() => {
        setActiveScene(currentSection);
        setTimeout(() => setIsTransitioning(false), 500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSection, activeScene, sceneConfigs]);

  // Get current scene configuration
  const currentConfig = sceneConfigs[activeScene] || sceneConfigs.hero;
  const CurrentSceneComponent = currentConfig.component;

  return (
    <CSSPostProcessing enableGlow={enablePostProcessing && false} enableBlur={false}>
      <div 
        className="fixed inset-0 w-full h-full" 
        style={{ 
          zIndex: -1, 
          pointerEvents: 'none'
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{ 
            antialias: false, 
            alpha: true,
            powerPreference: "default",
            preserveDrawingBuffer: false,
            stencil: false,
            depth: true,
            failIfMajorPerformanceCaveat: false
          }}
          shadows={false}
          camera={{
            position: currentConfig.camera.position,
            fov: currentConfig.camera.fov,
            near: 0.1,
            far: 100
          }}
          onCreated={(state) => {
            // Disable auto-clear to prevent flashing
            state.gl.autoClear = true;
            
            // Handle WebGL context loss properly
            const canvas = state.gl.domElement;
            const handleContextLost = (event) => {
              console.warn('WebGL context lost, attempting recovery...');
              event.preventDefault();
            };
            
            const handleContextRestored = () => {
              console.log('WebGL context restored successfully');
            };
            
            canvas.addEventListener('webglcontextlost', handleContextLost);
            canvas.addEventListener('webglcontextrestored', handleContextRestored);
            
            // Store cleanup function
            state.gl._contextCleanup = () => {
              canvas.removeEventListener('webglcontextlost', handleContextLost);
              canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            };
          }}
        >
          <EnhancedLighting />
          <Environment preset="city" />

          {enablePostProcessing && false && (
            <AnimatedGlow 
              color={currentConfig.camera.position[0] > 0 ? "#8b5cf6" : "#6366f1"}
              intensity={0.1}
              position={[0, 0, -8]}
            />
          )}

          {enableInteractions && false && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={false}
              autoRotate={false}
            />
          )}

          <Suspense fallback={<SceneLoader />}>
            <AnimatePresence mode="wait">
              {!isTransitioning && (
                <motion.group
                  key={activeScene}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  <CurrentSceneComponent
                    mousePosition={mousePosition}
                    scrollProgress={scrollProgress}
                    isVisible={isVisible}
                  />
                </motion.group>
              )}
            </AnimatePresence>

            {isTransitioning && (
              <SectionTransitions
                currentSection={activeScene}
                transitionProgress={transitionProgress}
                transitionType={transitionType}
              />
            )}
          </Suspense>
        </Canvas>

        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3">
            <div className="text-white text-sm font-mono">
              Scene: {activeScene.toUpperCase()}
              {isTransitioning && (
                <div className="text-xs text-blue-300 mt-1">
                  Transitioning... ({transitionType})
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2">
            <div className="text-white text-xs font-mono">
              FPS: {Math.round(60 - scrollProgress * 10)}
            </div>
          </div>
        </div>
      </div>
    </CSSPostProcessing>
  );
};

// Hook for managing scene state - separated into its own file to avoid issues
export const useSceneManager = () => {
  const [currentSection, setCurrentSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [transitionProgress, setTransitionProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const progress = Math.min(scrollY / (documentHeight - windowHeight), 1);
    setScrollProgress(progress);

    const sections = ['hero', 'about', 'projects', 'research', 'certificates', 'contact'];
    
    // Improved section detection with better thresholds
    let sectionIndex;
    if (progress >= 0.95) {
      // Ensure contact section is reached when near bottom
      sectionIndex = sections.length - 1;
    } else if (progress >= 0.85) {
      sectionIndex = 4; // certificates
    } else if (progress >= 0.68) {
      sectionIndex = 3; // research
    } else if (progress >= 0.50) {
      sectionIndex = 2; // projects
    } else if (progress >= 0.25) {
      sectionIndex = 1; // about
    } else {
      sectionIndex = 0; // hero
    }
    
    const newSection = sections[sectionIndex];
    
    if (newSection !== currentSection) {
      setCurrentSection(newSection);
      setTransitionProgress(1); // Set to complete immediately to avoid animation loop
    }
  }, [currentSection]);

  const handleMouseMove = useCallback((event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleScroll, handleMouseMove]);

  return {
    currentSection,
    scrollProgress,
    mousePosition,
    transitionProgress,
    setCurrentSection
  };
};

export default EnterpriseSceneManager;
