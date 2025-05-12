import React from "react";

const ResearchLogoLeft = () => (
  <svg 
    width="120" 
    height="120" 
    viewBox="0 0 120 120" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="opacity-25 hover:opacity-50 transition-opacity duration-500" // Slightly increased base opacity
  >
    <defs>
      <linearGradient id="gradLeft_Research" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" /> {/* Purple-500 */}
        <stop offset="100%" stopColor="#06b6d4" /> {/* Cyan-500 */}
      </linearGradient>
      <filter id="glowLeft_Research" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Outer orbital paths */}
    <circle cx="60" cy="60" r="50" stroke="url(#gradLeft_Research)" strokeWidth="1.5" strokeOpacity="0.7" fill="none"/>
    <ellipse cx="60" cy="60" rx="50" ry="25" transform="rotate(45 60 60)" stroke="url(#gradLeft_Research)" strokeWidth="1" strokeOpacity="0.5" fill="none"/>
    <ellipse cx="60" cy="60" rx="50" ry="15" transform="rotate(-45 60 60)" stroke="url(#gradLeft_Research)" strokeWidth="1" strokeOpacity="0.5" fill="none"/>
    
    {/* Central nucleus/core element */}
    <circle cx="60" cy="60" r="8" fill="url(#gradLeft_Research)" filter="url(#glowLeft_Research)"/>
    
    {/* Smaller orbiting particles/nodes */}
    <circle cx="60" cy="25" r="3" fill="#c084fc" /> {/* Light Purple */}
    <circle cx="25" cy="60" r="3" fill="#c084fc" />
    <circle cx="95" cy="60" r="3" fill="#22d3ee" /> {/* Light Cyan */}
    <circle cx="60" cy="95" r="3" fill="#22d3ee" />

    <circle cx="36.3" cy="36.3" r="2.5" fill="#a855f7" /> {/* Purple */}
    <circle cx="83.7" cy="36.3" r="2.5" fill="#a855f7" />
    <circle cx="36.3" cy="83.7" r="2.5" fill="#06b6d4" /> {/* Cyan */}
    <circle cx="83.7" cy="83.7" r="2.5" fill="#06b6d4" />
  </svg>
);

export default React.memo(ResearchLogoLeft);
