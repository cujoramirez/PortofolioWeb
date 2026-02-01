import React, { useEffect, useState } from 'react';

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
}

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  backgroundOpacity = 0,
  saturation = 1,
  className = '',
  style = {}
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const supportsBackdropFilter = () => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
    return CSS.supports('backdrop-filter', 'blur(10px)');
  };

  const dimensions: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: `${borderRadius}px`,
  };

  const backdropSupported = supportsBackdropFilter();

  const containerStyles: React.CSSProperties = backdropSupported
    ? {
        ...dimensions,
        ...style,
        background: isDarkMode
          ? `rgba(${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${backgroundOpacity * 0.9})`
          : `rgba(255, 255, 255, ${backgroundOpacity * 0.85})`,
        backdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`,
        border: isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.2)'
          : '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: isDarkMode
          ? `inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
             inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
             0 8px 32px rgba(0, 0, 0, 0.1)`
          : `0 8px 32px 0 rgba(31, 38, 135, 0.15),
             inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
             inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`,
      }
    : {
        ...dimensions,
        ...style,
        background: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
      };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={containerStyles}
    >
      <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
