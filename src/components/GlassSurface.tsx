import React, { useEffect, useState, useId, useMemo } from 'react';

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
  className?: string;
  style?: React.CSSProperties;
  /** Enable liquid glass SVG displacement effect (Chrome-only, falls back gracefully) */
  liquidEffect?: boolean;
  /** Displacement scale for liquid effect (0-1) */
  displacementScale?: number;
  /** Specular highlight intensity (0-1) */
  specularIntensity?: number;
}

// SVG filter for liquid glass displacement effect
const LiquidGlassFilter: React.FC<{ 
  id: string; 
  scale: number;
  specular: number;
}> = ({ id, scale, specular }) => (
  <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
    <defs>
      {/* Main liquid glass displacement filter */}
      <filter
        id={id}
        x="-20%"
        y="-20%"
        width="140%"
        height="140%"
        filterUnits="objectBoundingBox"
        primitiveUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        {/* Generate subtle noise for organic distortion */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.015 0.015"
          numOctaves="2"
          seed="42"
          result="turbulence"
        />
        
        {/* Map turbulence to displacement channels */}
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="8" offset="0.5" />
          <feFuncG type="gamma" amplitude="1" exponent="8" offset="0.5" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        
        {/* Soften the displacement map */}
        <feGaussianBlur in="mapped" stdDeviation="0.02" result="softMap" />
        
        {/* Apply displacement to create refraction effect */}
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={scale * 0.08}
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        
        {/* Add subtle specular lighting for depth */}
        <feSpecularLighting
          in="softMap"
          surfaceScale={specular * 3}
          specularConstant="0.8"
          specularExponent="80"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="0.3" y="0.1" z="0.5" />
        </feSpecularLighting>
        
        {/* Composite specular with displaced image */}
        <feComposite
          in="specLight"
          in2="displaced"
          operator="arithmetic"
          k1="0"
          k2="0.15"
          k3="1"
          k4="0"
          result="litDisplaced"
        />
        
        {/* Final merge */}
        <feMerge>
          <feMergeNode in="litDisplaced" />
        </feMerge>
      </filter>

      {/* Simpler displacement filter for the backdrop */}
      <filter
        id={`${id}-backdrop`}
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
        primitiveUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves="1"
          seed="5"
          result="turbulence"
        />
        <feGaussianBlur in="turbulence" stdDeviation="0.015" result="softMap" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale={scale * 0.05}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  brightness = 50,
  opacity = 0.93,
  blur = 20,
  backgroundOpacity = 0.12,
  saturation = 1.5,
  className = '',
  style = {},
  liquidEffect = true,
  displacementScale = 0.5,
  specularIntensity = 0.4,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChrome, setIsChrome] = useState(false);
  const filterId = useId().replace(/:/g, '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Dark mode detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Chrome detection (SVG backdrop-filter only works in Chrome)
    const userAgent = navigator.userAgent.toLowerCase();
    setIsChrome(userAgent.includes('chrome') && !userAgent.includes('edg'));
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const supportsBackdropFilter = useMemo(() => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
    return CSS.supports('backdrop-filter', 'blur(10px)');
  }, []);

  const dimensions: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
  };

  // Glass reflex variables based on theme
  const glassReflexLight = isDarkMode ? 0.3 : 1;
  const glassReflexDark = isDarkMode ? 2 : 1;

  // Complex box-shadow for realistic glass edge lighting (Apple-style)
  const glassBoxShadow = `
    inset 0 0 0 1px rgba(255, 255, 255, ${0.1 * glassReflexLight}),
    inset 1.8px 3px 0px -2px rgba(255, 255, 255, ${0.9 * glassReflexLight}),
    inset -2px -2px 0px -2px rgba(255, 255, 255, ${0.8 * glassReflexLight}),
    inset -3px -8px 1px -6px rgba(255, 255, 255, ${0.6 * glassReflexLight}),
    inset -0.3px -1px 4px 0px rgba(0, 0, 0, ${0.12 * glassReflexDark}),
    inset -1.5px 2.5px 0px -2px rgba(0, 0, 0, ${0.2 * glassReflexDark}),
    inset 0px 3px 4px -2px rgba(0, 0, 0, ${0.2 * glassReflexDark}),
    inset 2px -6.5px 1px -4px rgba(0, 0, 0, ${0.1 * glassReflexDark}),
    0px 1px 5px 0px rgba(0, 0, 0, ${0.1 * glassReflexDark}),
    0px 6px 16px 0px rgba(0, 0, 0, ${0.08 * glassReflexDark})
  `;

  // Simplified shadow for fallback
  const simpleShadow = isDarkMode
    ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
       inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
       0 8px 32px rgba(0, 0, 0, 0.1)`
    : `0 8px 32px 0 rgba(31, 38, 135, 0.15),
       inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
       inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`;

  // Use liquid glass effect only on Chrome (SVG filters as backdrop-filter)
  const useLiquidEffect = liquidEffect && isChrome && supportsBackdropFilter;

  const containerStyles: React.CSSProperties = {
    ...dimensions,
    ...style,
    position: 'relative',
    overflow: 'hidden',
  };

  // Background tint color
  const bgColor = isDarkMode
    ? `rgba(${Math.round(187 * (brightness / 100))}, ${Math.round(187 * (brightness / 100))}, ${Math.round(188 * (brightness / 100))}, ${backgroundOpacity})`
    : `rgba(255, 255, 255, ${backgroundOpacity})`;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={containerStyles}
    >
      {/* SVG Filters (only rendered if liquid effect enabled) */}
      {liquidEffect && (
        <LiquidGlassFilter 
          id={filterId} 
          scale={displacementScale} 
          specular={specularIntensity}
        />
      )}

      {/* Layer 1: Liquid Glass Effect (backdrop blur + SVG displacement) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          backdropFilter: useLiquidEffect
            ? `blur(${blur * 0.3}px) url(#${filterId}-backdrop) saturate(${saturation * 100}%)`
            : `blur(${blur}px) saturate(${saturation * 100}%)`,
          WebkitBackdropFilter: useLiquidEffect
            ? `blur(${blur * 0.3}px) saturate(${saturation * 100}%)`
            : `blur(${blur}px) saturate(${saturation * 100}%)`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 2: Background Tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          backgroundColor: bgColor,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 3: Specular Shine (glass edge highlights) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          boxShadow: useLiquidEffect ? glassBoxShadow : simpleShadow,
          border: isDarkMode
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.25)',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 4: Top highlight gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, ${0.15 * glassReflexLight}) 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(0, 0, 0, ${0.05 * glassReflexDark}) 100%
          )`,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div 
        className="w-full h-full flex items-center justify-center p-2 relative"
        style={{ 
          borderRadius: `${borderRadius}px`,
          zIndex: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
