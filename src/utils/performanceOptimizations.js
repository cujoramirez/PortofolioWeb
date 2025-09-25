// Performance optimization utilities for memory management

/**
 * Debounced function to limit excessive function calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit function execution frequency
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memory-efficient particle pool to reuse particle objects
 */
export class ParticlePool {
  constructor(maxSize = 100) {
    this.pool = [];
    this.maxSize = maxSize;
  }

  getParticle() {
    return this.pool.pop() || {};
  }

  releaseParticle(particle) {
    if (this.pool.length < this.maxSize) {
      // Clear particle data
      Object.keys(particle).forEach(key => delete particle[key]);
      this.pool.push(particle);
    }
  }

  clear() {
    this.pool.length = 0;
  }
}

/**
 * Check if device supports high performance features
 */
export const getPerformanceProfile = () => {
  const isLowEnd = () => {
    // Check memory (if available)
    const memory = navigator.deviceMemory;
    if (memory && memory < 4) return true;

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency;
    if (cores && cores < 4) return true;

    // Check user agent for low-end indicators
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndDevices = ['android 4', 'android 5', 'android 6'];
    return lowEndDevices.some(device => userAgent.includes(device));
  };

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const supportsWebGL = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  return {
    isLowEnd: isLowEnd(),
    isMobile: isMobile(),
    supportsWebGL: supportsWebGL(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };
};

/**
 * Cleanup function for animations and event listeners
 */
export class PerformanceManager {
  constructor() {
    this.animationFrames = new Set();
    this.intervals = new Set();
    this.timeouts = new Set();
    this.eventListeners = new Map();
  }

  addAnimationFrame(id) {
    this.animationFrames.add(id);
    return id;
  }

  addInterval(id) {
    this.intervals.add(id);
    return id;
  }

  addTimeout(id) {
    this.timeouts.add(id);
    return id;
  }

  addEventListener(element, event, handler, options) {
    const key = `${element.constructor.name}-${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    this.eventListeners.get(key).push({ element, event, handler, options });
    element.addEventListener(event, handler, options);
  }

  cleanup() {
    // Cancel animation frames
    this.animationFrames.forEach(id => cancelAnimationFrame(id));
    this.animationFrames.clear();

    // Clear intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Clear timeouts
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts.clear();

    // Remove event listeners
    this.eventListeners.forEach(listeners => {
      listeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
    });
    this.eventListeners.clear();
  }
}

/**
 * Optimize animation frame rate based on performance
 */
export const createOptimizedRaf = (callback, maxFPS = 60) => {
  const performance = getPerformanceProfile();
  const targetFPS = performance.isLowEnd ? 30 : maxFPS;
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;

  const optimizedCallback = (currentTime) => {
    if (currentTime - lastFrameTime >= frameInterval) {
      callback(currentTime);
      lastFrameTime = currentTime;
    }
    return requestAnimationFrame(optimizedCallback);
  };

  return requestAnimationFrame(optimizedCallback);
};

/**
 * Memory usage monitoring (when available)
 */
export const getMemoryInfo = () => {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

/**
 * Preload critical resources
 */
export const preloadResource = (src, type = 'image') => {
  return new Promise((resolve, reject) => {
    let resource;
    
    switch (type) {
      case 'image':
        resource = new Image();
        resource.onload = () => resolve(resource);
        resource.onerror = reject;
        resource.src = src;
        break;
      case 'script':
        resource = document.createElement('script');
        resource.onload = () => resolve(resource);
        resource.onerror = reject;
        resource.src = src;
        document.head.appendChild(resource);
        break;
      default:
        reject(new Error('Unsupported resource type'));
    }
  });
};