// LightEffects.jsx
import React, { useEffect, useRef } from "react";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import { technologies } from "./Technologies.jsx";

const LightEffects = ({ simplified }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Optionally reduce resolution for simplified mode
    const resizeCanvas = () => {
      if (canvas.parentNode) {
        const rect = canvas.parentNode.getBoundingClientRect();
        // For simplified mode, we scale down the canvas resolution
        const scaleFactor = simplified ? 0.5 : 1;
        canvas.width = rect.width * scaleFactor;
        canvas.height = rect.height * scaleFactor;
      }
    };

    resizeCanvas();

    // Define positions for light sources.
    const positions = [
      { x: 0.2, y: 0.3, radius: 220, speed: { x: 0.3, y: 0.4 }, direction: { x: 1, y: 1 } },
      { x: 0.8, y: 0.2, radius: 240, speed: { x: 0.2, y: 0.5 }, direction: { x: -1, y: 1 } },
      { x: 0.5, y: 0.7, radius: 260, speed: { x: 0.4, y: 0.3 }, direction: { x: 1, y: -1 } },
      { x: 0.3, y: 0.6, radius: 280, speed: { x: 0.5, y: 0.2 }, direction: { x: -1, y: -1 } },
      { x: 0.1, y: 0.5, radius: 250, speed: { x: 0.3, y: 0.3 }, direction: { x: 1, y: -1 } },
      { x: 0.7, y: 0.8, radius: 230, speed: { x: 0.2, y: 0.4 }, direction: { x: -1, y: -1 } },
      { x: 0.6, y: 0.4, radius: 270, speed: { x: 0.4, y: 0.5 }, direction: { x: 1, y: 1 } },
      { x: 0.4, y: 0.3, radius: 245, speed: { x: 0.3, y: 0.4 }, direction: { x: -1, y: 1 } },
      { x: 0.25, y: 0.75, radius: 255, speed: { x: 0.35, y: 0.45 }, direction: { x: 1, y: -1 } },
      { x: 0.75, y: 0.35, radius: 235, speed: { x: 0.25, y: 0.35 }, direction: { x: -1, y: 1 } },
    ];

    // In simplified mode, use fewer light sources.
    const effectivePositions = simplified
      ? positions.slice(0, Math.ceil(positions.length / 2))
      : positions;

    const lightSources = effectivePositions.map((pos, index) => ({
      x: canvas.width * pos.x,
      y: canvas.height * pos.y,
      radius: pos.radius,
      color: technologies[index]?.color + "18" || "#ffffff18",
      speed: { ...pos.speed },
      direction: { ...pos.direction },
      baseSpeed: { ...pos.speed },
    }));

    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = "rgba(15, 5, 40, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      lightSources.forEach((light) => {
        // Create a radial gradient for each light.
        const gradient = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius
        );
        gradient.addColorStop(0, light.color);
        gradient.addColorStop(0.6, light.color.replace("18", "08"));
        gradient.addColorStop(1, "rgba(15, 5, 40, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update light position.
        light.x += light.speed.x * light.direction.x;
        light.y += light.speed.y * light.direction.y;

        const blendMargin = 50;
        if (light.x - light.radius < -blendMargin || light.x + light.radius > canvas.width + blendMargin) {
          light.direction.x *= -1;
          if (light.x - light.radius < -blendMargin)
            light.x = -blendMargin + light.radius;
          if (light.x + light.radius > canvas.width + blendMargin)
            light.x = canvas.width + blendMargin - light.radius;
        }
        if (light.y - light.radius < -blendMargin || light.y + light.radius > canvas.height + blendMargin) {
          light.direction.y *= -1;
          if (light.y - light.radius < -blendMargin)
            light.y = -blendMargin + light.radius;
          if (light.y + light.radius > canvas.height + blendMargin)
            light.y = canvas.height + blendMargin - light.radius;
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (canvas.parentNode) {
        const rect = canvas.parentNode.getBoundingClientRect();
        const scaleFactor = simplified ? 0.5 : 1;
        canvas.width = rect.width * scaleFactor;
        canvas.height = rect.height * scaleFactor;
      }
      lightSources.forEach((light, i) => {
        const pos = effectivePositions[i] || { x: Math.random(), y: Math.random() };
        light.x = canvas.width * pos.x;
        light.y = canvas.height * pos.y;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [simplified]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none opacity-60"
      style={{ mixBlendMode: "lighten", margin: "50px" }}
    />
  );
};

export default LightEffects;
