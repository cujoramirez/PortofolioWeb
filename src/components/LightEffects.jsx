// LightEffects.jsx
import React, { useRef, useEffect, memo } from 'react';

const LightEffects = memo(({ simplified = false }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    let animationFrameId;
    
    // Set canvas dimensions to match container
    const setCanvasDimensions = () => {
      const container = canvas.parentElement;
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    // Initialize the particles with optimized parameters
    const initializeParticles = () => {
      const particleCount = simplified ? 20 : 35; // Reduced for simplified version
      particles.length = 0;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: simplified ? 
            Math.random() * 1 + 0.5 :
            Math.random() * 1.5 + 0.5,
          color: `rgba(${
            Math.floor(Math.random() * 100) + 155
          }, ${
            Math.floor(Math.random() * 100) + 155
          }, ${
            Math.floor(Math.random() * 155) + 100
          }, ${
            simplified ? 0.3 : 0.5
          })`,
          vx: (Math.random() - 0.5) * (simplified ? 0.3 : 0.5),
          vy: (Math.random() - 0.5) * (simplified ? 0.3 : 0.5),
          sinOffset: Math.random() * Math.PI * 2,
          sinAmplitude: simplified ? 0.3 : 0.5,
          sinFrequency: 0.02 + Math.random() * 0.01,
          connectionDistance: simplified ? 100 : 150,
        });
      }
    };

    // Draw the particles and connections
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Update particle position with sinusoidal motion
        p.x += p.vx + Math.sin(p.sinOffset + Date.now() * p.sinFrequency) * p.sinAmplitude;
        p.y += p.vy;
        
        // Boundary check - wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      
      // Draw connections only in non-simplified mode
      if (!simplified) {
        drawConnections();
      }
      
      animationFrameId = requestAnimationFrame(drawParticles);
    };
    
    // Draw connections between particles
    const drawConnections = () => {
      particles.forEach((p1, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < p1.connectionDistance) {
            const opacity = 1 - distance / p1.connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(180, 180, 255, ${opacity * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
    };

    // Handle window resize
    const handleResize = () => {
      setCanvasDimensions();
      initializeParticles();
    };

    // Setup
    setCanvasDimensions();
    initializeParticles();
    drawParticles();

    // Listen for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [simplified]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.5 }}
    />
  );
});

export default LightEffects;