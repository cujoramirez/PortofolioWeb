/**
 * Enterprise-level Lenis coordination utility
 * Ensures smooth scroll and hover interactions across the entire application
 */

type LenisInstance = {
  stop: () => void;
  start: () => void;
  destroy: () => void;
  raf: (time: number) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
};

declare global {
  interface Window {
    lenis?: LenisInstance | null;
  }
}

/**
 * Safely pause Lenis smooth scrolling
 * Used during landing overlay to prevent conflicts
 */
export const pauseLenis = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const lenis = window.lenis;
  if (lenis?.stop) {
    lenis.stop();
    return true;
  }
  
  return false;
};

/**
 * Safely resume Lenis smooth scrolling
 * Includes RAF-based delay for DOM stability
 */
export const resumeLenis = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const lenis = window.lenis;
  if (lenis?.start) {
    requestAnimationFrame(() => {
      lenis.start();
    });
    return true;
  }
  
  return false;
};

/**
 * Check if Lenis is currently active
 */
export const isLenisActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!window.lenis;
};

/**
 * Enterprise frame budget monitor
 * Logs warnings if frame time exceeds budget
 */
export class FrameBudgetMonitor {
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 60;
  private targetFrameTime: number = 16.67; // 60fps = ~16.67ms per frame
  private enabled: boolean = false;

  constructor(enabled: boolean = false) {
    this.enabled = enabled && typeof window !== 'undefined' && process.env.NODE_ENV === 'development';
  }

  start(): void {
    if (!this.enabled) return;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  private tick = (): void => {
    if (!this.enabled) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    
    if (delta > this.targetFrameTime * 1.5) {
      console.warn(`⚠️ Frame budget exceeded: ${delta.toFixed(2)}ms (target: ${this.targetFrameTime.toFixed(2)}ms)`);
    }

    this.frameCount++;
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1000 / delta);
      if (this.fps < 55) {
        console.warn(`⚠️ FPS drop detected: ${this.fps}fps`);
      }
    }

    this.lastFrameTime = now;
    requestAnimationFrame(this.tick);
  };

  stop(): void {
    this.enabled = false;
  }
}
