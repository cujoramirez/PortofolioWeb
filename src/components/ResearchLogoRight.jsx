import React from 'react';

const ResearchLogoRight = () => {
  return (
    <svg 
      width="180" 
      height="180" 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="opacity-80" // Slightly less opaque by default
    >
      <defs>
        <radialGradient id="rightLogoGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: "rgba(107, 33, 168, 0.7)", stopOpacity: 1 }} /> 
          <stop offset="70%" style={{ stopColor: "rgba(126, 34, 206, 0.4)", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "rgba(168, 85, 247, 0.1)", stopOpacity: 1 }} />
        </radialGradient>
        <filter id="rightLogoGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Abstract DNA/Helix-like structure */}
      <g filter="url(#rightLogoGlow)">
        <path 
          d="M60 30 Q80 50 60 70 T60 110 Q80 130 60 150 T60 190" 
          stroke="url(#rightLogoGradient)" 
          strokeWidth="5" 
          strokeLinecap="round"
          fill="none"
        />
        <path 
          d="M140 30 Q120 50 140 70 T140 110 Q120 130 140 150 T140 190" 
          stroke="url(#rightLogoGradient)" 
          strokeWidth="5" 
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Connecting elements - more organic */}
        {[40, 60, 80, 100, 120, 140, 160].map(y => (
          <path
            key={y}
            d={`M${60 + 10 * Math.sin(y / 20)} ${y} Q100 ${y + 10 * Math.cos(y/15)} ${140 - 10 * Math.sin(y / 20)} ${y}`}
            stroke="rgba(168, 85, 247, 0.3)"
            strokeWidth="1.5"
            fill="none"
          />
        ))}

        {/* Subtle orbiting particles */}
        <circle cx="70" cy="50" r="3" fill="rgba(200, 160, 255, 0.6)" />
        <circle cx="130" cy="90" r="2.5" fill="rgba(200, 160, 255, 0.5)" />
        <circle cx="80" cy="150" r="3.5" fill="rgba(200, 160, 255, 0.7)" />
      </g>
    </svg>
  );
};

export default React.memo(ResearchLogoRight);

