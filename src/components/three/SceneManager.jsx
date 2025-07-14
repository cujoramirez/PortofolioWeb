import React, { createContext, useContext, useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, Stats } from '@react-three/drei';
import { useSystemProfile } from '../useSystemProfile';

const SceneContext = createContext();

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};

export const SceneProvider = forwardRef(({ children }, ref) => {
  const [activeScene, setActiveScene] = useState(null);
  const [sceneData, setSceneData] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { performanceTier } = useSystemProfile();
  
  const canvasRef = useRef();
  const scenesRef = useRef(new Map());

  const registerScene = useCallback((id, component, config = {}) => {
    scenesRef.current.set(id, { component, config, id });
  }, []);

  const unregisterScene = useCallback((id) => {
    scenesRef.current.delete(id);
  }, []);

  const switchScene = useCallback(async (sceneId, data = {}, transition = 'fade') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSceneData(data);
    
    // Transition animation based on type
    switch (transition) {
      case 'morphDissolve':
        await new Promise(resolve => setTimeout(resolve, 800));
        break;
      case 'spiralWarp':
        await new Promise(resolve => setTimeout(resolve, 1200));
        break;
      case 'quantumShift':
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      default:
        await new Promise(resolve => setTimeout(resolve, 600));
    }
    
    setActiveScene(sceneId);
    setIsTransitioning(false);
  }, [isTransitioning]);

  const getCanvasSettings = () => {
    const baseSettings = {
      gl: { 
        antialias: performanceTier !== 'low',
        alpha: true,
        powerPreference: performanceTier === 'high' ? 'high-performance' : 'default'
      },
      camera: { 
        position: [0, 0, 5], 
        fov: 45,
        near: 0.1,
        far: 1000 
      },
      shadows: performanceTier === 'high',
      dpr: performanceTier === 'high' ? [1, 2] : 1
    };

    return baseSettings;
  };

  const value = {
    activeScene,
    sceneData,
    isTransitioning,
    registerScene,
    unregisterScene,
    switchScene,
    canvasRef,
    scenes: scenesRef.current,
    performanceTier
  };

  return (
    <div ref={ref}>
      <SceneContext.Provider value={value}>
        {children}
      </SceneContext.Provider>
    </div>
  );
});

SceneProvider.displayName = 'SceneProvider';

// Enhanced Canvas Component with Global Three.js Scene
export const GlobalCanvas = ({ children, className = "" }) => {
  const { performanceTier } = useSystemProfile();
  const canvasSettings = {
    gl: { 
      antialias: performanceTier !== 'low',
      alpha: true,
      powerPreference: performanceTier === 'high' ? 'high-performance' : 'default',
      preserveDrawingBuffer: true
    },
    camera: { 
      position: [0, 0, 5], 
      fov: 45,
      near: 0.1,
      far: 1000 
    },
    shadows: performanceTier === 'high',
    dpr: performanceTier === 'high' ? [1, 2] : 1,
    frameloop: 'demand'
  };

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`} style={{ zIndex: 0 }}>
      <Canvas {...canvasSettings}>
        <Preload all />
        {performanceTier === 'high' && <Stats />}
        {children}
      </Canvas>
    </div>
  );
};

// Export SceneProvider as SceneManager for consistency
export const SceneManager = SceneProvider;

export default SceneProvider;

