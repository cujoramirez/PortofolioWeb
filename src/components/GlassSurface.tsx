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
  isMobile: boolean;
}> = ({ id, scale, specular, isMobile }) => {
  // More extreme refraction on mobile/tablet for visibility
  const effectiveScale = isMobile ? scale * 4 : scale;
  const effectiveSpecular = isMobile ? specular * 2.5 : specular;
  
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* Main liquid glass displacement filter */}
        <filter
          id={id}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
          colorInterpolationFilters="sRGB"
        >
          {/* Generate noise for organic distortion - higher frequency on mobile */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency={isMobile ? "0.008 0.008" : "0.015 0.015"}
            numOctaves={isMobile ? 3 : 2}
            seed="42"
            result="turbulence"
          />
          
          {/* Map turbulence to displacement channels */}
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude="1" exponent={isMobile ? 5 : 8} offset="0.5" />
            <feFuncG type="gamma" amplitude="1" exponent={isMobile ? 5 : 8} offset="0.5" />
            <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
          </feComponentTransfer>
          
          {/* Soften the displacement map */}
          <feGaussianBlur in="mapped" stdDeviation={isMobile ? "0.015" : "0.02"} result="softMap" />
          
          {/* Apply displacement to create refraction effect - much stronger on mobile */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale={effectiveScale * 0.15}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          
          {/* Add specular lighting for depth - more intense on mobile */}
          <feSpecularLighting
            in="softMap"
            surfaceScale={effectiveSpecular * 4}
            specularConstant={isMobile ? "1.2" : "0.8"}
            specularExponent={isMobile ? "60" : "80"}
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x="0.3" y="0.1" z={isMobile ? "0.7" : "0.5"} />
          </feSpecularLighting>
          
          {/* Composite specular with displaced image */}
          <feComposite
            in="specLight"
            in2="displaced"
            operator="arithmetic"
            k1="0"
            k2={isMobile ? "0.25" : "0.15"}
            k3="1"
            k4="0"
            result="litDisplaced"
          />
          
          {/* Final merge */}
          <feMerge>
            <feMergeNode in="litDisplaced" />
          </feMerge>
        </filter>

        {/* Simpler displacement filter for the backdrop - stronger on mobile */}
        <filter
          id={`${id}-backdrop`}
          x="-10%"
          y="-10%"
          width="120%"
          height="120%"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={isMobile ? "0.006 0.006" : "0.01 0.01"}
            numOctaves={isMobile ? 2 : 1}
            seed="5"
            result="turbulence"
          />
          <feGaussianBlur in="turbulence" stdDeviation={isMobile ? "0.01" : "0.015"} result="softMap" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softMap"
            scale={effectiveScale * 0.1}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
};

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  brightness = 50,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [isMobile, setIsMobile] = useState(false);
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
    
    // Mobile/tablet detection
    const mobileQuery = window.matchMedia('(max-width: 1024px)');
    setIsMobile(mobileQuery.matches);
    const mobileHandler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mobileQuery.addEventListener('change', mobileHandler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
      mobileQuery.removeEventListener('change', mobileHandler);
    };
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

  // Glass reflex variables based on theme - stronger on mobile
  const mobileMultiplier = isMobile ? 1.8 : 1;
  const glassReflexLight = (isDarkMode ? 0.3 : 1) * mobileMultiplier;
  const glassReflexDark = (isDarkMode ? 2 : 1) * mobileMultiplier;

  // Complex box-shadow for realistic glass edge lighting (Apple-style) - more prominent on mobile
  const glassBoxShadow = `
    inset 0 0 0 ${isMobile ? '1.5px' : '1px'} rgba(255, 255, 255, ${0.15 * glassReflexLight}),
    inset ${isMobile ? '2.5px 4px' : '1.8px 3px'} 0px -2px rgba(255, 255, 255, ${0.95 * glassReflexLight}),
    inset ${isMobile ? '-3px -3px' : '-2px -2px'} 0px -2px rgba(255, 255, 255, ${0.85 * glassReflexLight}),
    inset ${isMobile ? '-4px -10px' : '-3px -8px'} 1px -6px rgba(255, 255, 255, ${0.7 * glassReflexLight}),
    inset -0.3px -1px ${isMobile ? '6px' : '4px'} 0px rgba(0, 0, 0, ${0.15 * glassReflexDark}),
    inset ${isMobile ? '-2px 3px' : '-1.5px 2.5px'} 0px -2px rgba(0, 0, 0, ${0.25 * glassReflexDark}),
    inset 0px ${isMobile ? '4px 6px' : '3px 4px'} -2px rgba(0, 0, 0, ${0.25 * glassReflexDark}),
    inset ${isMobile ? '3px -8px' : '2px -6.5px'} 1px -4px rgba(0, 0, 0, ${0.12 * glassReflexDark}),
    0px 1px ${isMobile ? '8px' : '5px'} 0px rgba(0, 0, 0, ${0.12 * glassReflexDark}),
    0px ${isMobile ? '8px 24px' : '6px 16px'} 0px rgba(0, 0, 0, ${0.1 * glassReflexDark})
  `;

  // Simplified shadow for fallback - also stronger on mobile
  const simpleShadow = isDarkMode
    ? `inset 0 ${isMobile ? '2px' : '1px'} 0 0 rgba(255, 255, 255, ${isMobile ? 0.35 : 0.25}),
       inset 0 ${isMobile ? '-2px' : '-1px'} 0 0 rgba(255, 255, 255, ${isMobile ? 0.2 : 0.15}),
       0 ${isMobile ? '12px 40px' : '8px 32px'} rgba(0, 0, 0, ${isMobile ? 0.15 : 0.1})`
    : `0 ${isMobile ? '12px 40px' : '8px 32px'} 0 rgba(31, 38, 135, ${isMobile ? 0.2 : 0.15}),
       inset 0 ${isMobile ? '2px' : '1px'} 0 0 rgba(255, 255, 255, ${isMobile ? 0.5 : 0.4}),
       inset 0 ${isMobile ? '-2px' : '-1px'} 0 0 rgba(255, 255, 255, ${isMobile ? 0.25 : 0.2})`;

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
    ? `rgba(${Math.round(187 * (brightness / 100))}, ${Math.round(187 * (brightness / 100))}, ${Math.round(188 * (brightness / 100))}, ${isMobile ? backgroundOpacity * 1.3 : backgroundOpacity})`
    : `rgba(255, 255, 255, ${isMobile ? backgroundOpacity * 1.3 : backgroundOpacity})`;

  // Effective blur and saturation - reduced on mobile for clearer view
  const effectiveBlur = isMobile ? blur * 0.5 : blur;
  const effectiveSaturation = isMobile ? saturation * 1.3 : saturation;

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
          isMobile={isMobile}
        />
      )}

      {/* Layer 1: Liquid Glass Effect (backdrop blur + SVG displacement) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          backdropFilter: useLiquidEffect
            ? `blur(${effectiveBlur * 0.4}px) url(#${filterId}-backdrop) saturate(${effectiveSaturation * 100}%)`
            : `blur(${effectiveBlur}px) saturate(${effectiveSaturation * 100}%)`,
          WebkitBackdropFilter: useLiquidEffect
            ? `blur(${effectiveBlur * 0.4}px) saturate(${effectiveSaturation * 100}%)`
            : `blur(${effectiveBlur}px) saturate(${effectiveSaturation * 100}%)`,
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
            ? `${isMobile ? '1.5px' : '1px'} solid rgba(255, 255, 255, ${isMobile ? 0.2 : 0.15})`
            : `${isMobile ? '1.5px' : '1px'} solid rgba(255, 255, 255, ${isMobile ? 0.3 : 0.25})`,
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 4: Top highlight gradient - more visible on mobile */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: `${borderRadius}px`,
          background: `linear-gradient(
            180deg,
            rgba(255, 255, 255, ${(isMobile ? 0.25 : 0.15) * glassReflexLight}) 0%,
            rgba(255, 255, 255, 0) ${isMobile ? '50%' : '40%'},
            rgba(0, 0, 0, ${(isMobile ? 0.08 : 0.05) * glassReflexDark}) 100%
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
