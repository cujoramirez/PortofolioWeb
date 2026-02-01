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

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

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
  backgroundOpacity = 0,
  saturation = 1,
  className = '',
  style = {}
}) => {
  const isDarkMode = useDarkMode();

  // Check if backdrop-filter is supported
  const supportsBackdropFilter = () => {
    if (typeof window === 'undefined' || typeof CSS === 'undefined') return false;
    return CSS.supports('backdrop-filter', 'blur(10px)');
  };

  const getContainerStyles = (): React.CSSProperties => {
    const dimensions: React.CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
    };

    const backdropFilterSupported = supportsBackdropFilter();

    if (isDarkMode) {
      if (!backdropFilterSupported) {
        return {
          ...dimensions,
          ...style,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
        };
      }

      return {
        ...dimensions,
        ...style,
        background: `rgba(${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${backgroundOpacity * 0.9})`,
        backdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${opacity})`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.15),
                    0 8px 32px rgba(0, 0, 0, 0.1)`,
      };
    }

    if (!backdropFilterSupported) {
      return {
        ...dimensions,
        ...style,
        background: 'rgba(255, 255, 255, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.5),
                    inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)`
      };
    }

    return {
      ...dimensions,
      ...style,
      background: `rgba(${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${Math.round(255 * (brightness / 100))}, ${backgroundOpacity * 0.85})`,
      backdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${1 - (1 - opacity) * 0.5})`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}) brightness(${1 - (1 - opacity) * 0.5})`,
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.15),
                  0 2px 16px 0 rgba(31, 38, 135, 0.1),
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`,
    };
  };

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={getContainerStyles()}
    >
      <div className="w-full h-full flex items-center justify-center p-2 rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassSurface;
