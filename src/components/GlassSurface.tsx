import React, { useEffect, useState, useRef, useCallback } from 'react';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  backgroundOpacity?: number;
  saturation?: number;
  /** Enable liquid/interactive highlight effect */
  liquid?: boolean;
  /** Accent color for the liquid highlight */
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(true); // Default to dark for portfolio

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setIsDark(event.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
};

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  backgroundOpacity = 0.1,
  saturation = 1.2,
  liquid = true,
  accentColor = 'rgba(59, 130, 246, 0.5)',
  className = '',
  style = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const isDarkMode = useDarkMode();

  // Track mouse position for liquid highlight effect
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!liquid || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, [liquid]);

  const handleMouseLeave = useCallback(() => {
    // Smoothly return to center
    setMousePosition({ x: 50, y: 50 });
  }, []);

  // Check if backdrop-filter is supported
  const supportsBackdropFilter = () => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
    return CSS.supports('backdrop-filter', 'blur(10px)');
  };

  const dimensions: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
  };

  const backdropFilterSupported = supportsBackdropFilter();

  // CSS variables for liquid effect
  const liquidVars = {
    '--liquid-x': `${mousePosition.x}%`,
    '--liquid-y': `${mousePosition.y}%`,
    '--accent-color': accentColor,
  } as React.CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`liquid-glass-container ${className}`}
      style={{
        ...dimensions,
        ...liquidVars,
        ...style,
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Base glass layer */}
      <div
        className="liquid-glass-base"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: isDarkMode
            ? `linear-gradient(
                135deg,
                rgba(15, 23, 42, ${backgroundOpacity + 0.6}) 0%,
                rgba(30, 41, 59, ${backgroundOpacity + 0.4}) 50%,
                rgba(15, 23, 42, ${backgroundOpacity + 0.5}) 100%
              )`
            : `rgba(255, 255, 255, ${backgroundOpacity + 0.3})`,
          backdropFilter: backdropFilterSupported
            ? `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`
            : undefined,
          WebkitBackdropFilter: backdropFilterSupported
            ? `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`
            : undefined,
        }}
      />

      {/* Liquid highlight gradient - follows mouse */}
      {liquid && (
        <div
          className="liquid-glass-highlight"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `
              radial-gradient(
                ellipse 80% 50% at var(--liquid-x) var(--liquid-y),
                var(--accent-color) 0%,
                transparent 50%
              )
            `,
            opacity: 0.4,
            transition: 'background 0.3s ease-out',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Top shine/reflection */}
      <div
        className="liquid-glass-shine"
        style={{
          position: 'absolute',
          top: 0,
          left: '5%',
          right: '5%',
          height: '50%',
          borderRadius: `${borderRadius}px ${borderRadius}px 50% 50%`,
          background: isDarkMode
            ? `linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.15) 0%,
                rgba(255, 255, 255, 0.05) 40%,
                transparent 100%
              )`
            : `linear-gradient(
                180deg,
                rgba(255, 255, 255, 0.5) 0%,
                rgba(255, 255, 255, 0.1) 40%,
                transparent 100%
              )`,
          pointerEvents: 'none',
        }}
      />

      {/* Chromatic aberration / refraction effect */}
      <div
        className="liquid-glass-refraction"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: liquid
            ? `
              radial-gradient(
                ellipse 100% 80% at var(--liquid-x) var(--liquid-y),
                transparent 30%,
                rgba(255, 100, 100, 0.03) 45%,
                transparent 50%
              ),
              radial-gradient(
                ellipse 100% 80% at calc(var(--liquid-x) + 2%) calc(var(--liquid-y) + 2%),
                transparent 30%,
                rgba(100, 100, 255, 0.03) 45%,
                transparent 50%
              )
            `
            : 'none',
          transition: 'background 0.3s ease-out',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
        }}
      />

      {/* Inner border glow */}
      <div
        className="liquid-glass-border"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isDarkMode
            ? `
              inset 0 1px 1px rgba(255, 255, 255, 0.1),
              inset 0 -1px 1px rgba(0, 0, 0, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.2),
              0 2px 8px rgba(0, 0, 0, 0.1)
            `
            : `
              inset 0 1px 1px rgba(255, 255, 255, 0.6),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05),
              0 8px 32px rgba(31, 38, 135, 0.1)
            `,
          pointerEvents: 'none',
        }}
      />

      {/* Bottom edge highlight */}
      <div
        className="liquid-glass-edge"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: isDarkMode
            ? 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div
        className="liquid-glass-content"
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          borderRadius: 'inherit',
        }}
      >
        {children}
      </div>

      {/* Inject keyframes for subtle animation */}
      <style>{`
        .liquid-glass-container {
          transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
        }
        .liquid-glass-container:hover {
          transform: translateY(-1px);
        }
        .liquid-glass-highlight {
          animation: liquid-pulse 4s ease-in-out infinite;
        }
        @keyframes liquid-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.5; }
        }
        @media (prefers-reduced-motion: reduce) {
          .liquid-glass-container,
          .liquid-glass-container:hover {
            transform: none;
            transition: none;
          }
          .liquid-glass-highlight {
            animation: none;
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default GlassSurface;
