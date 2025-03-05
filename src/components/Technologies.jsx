import React, { useEffect, useRef, useState, memo } from "react";
import {
  SiPytorch,
  SiTensorflow,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiKaggle,
  SiHtml5,
  SiCss3,
} from "react-icons/si";
import { FaAtom, FaChartBar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// Container variant: fade in & slide up with conditional stagger
const optimizedContainerVariants = (staggerValue) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: staggerValue,
      when: "beforeChildren",
    },
  },
});

// Title variant: animated gradient with purple/pink hover glow
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    textShadow: "0px 0px 16px rgba(168, 85, 247, 0.7)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

// Icon container variants: color-based glow on hover
const iconContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  hover: {
    scale: 1.08,
    transition: {
      duration: 0.4,
      ease: "easeInOut",
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
};

// Baseline icon animation: slight vertical bobbing with drop shadow
const getIconAnimation = (color) => ({
  animate: {
    y: [-2, 2, -2],
    filter: `drop-shadow(0 0 2px ${color}33)`,
    transition: {
      y: {
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      },
    },
  },
  hover: {
    scale: 1.1,
    filter: `drop-shadow(0 0 12px ${color})`,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      type: "spring",
      stiffness: 300,
      damping: 15,
    },
  },
});

// Technology icon configuration with enhanced colors and glow effects
const technologies = [
  { name: "HTML", icon: SiHtml5, color: "#E34F26", borderColor: "border-orange-600/30", pulseSpeed: 3.1 },
  { name: "CSS", icon: SiCss3, color: "#1572B6", borderColor: "border-blue-500/30", pulseSpeed: 3.4 },
  { name: "PyTorch", icon: SiPytorch, color: "#EE4C2C", borderColor: "border-orange-500/30", pulseSpeed: 3.4 },
  { name: "TensorFlow", icon: SiTensorflow, color: "#FF6F00", borderColor: "border-orange-400/30", pulseSpeed: 3.2 },
  { name: "React", icon: SiReact, color: "#61DAFB", borderColor: "border-cyan-400/30", pulseSpeed: 3.7 },
  { name: "Node.js", icon: SiNodedotjs, color: "#539E43", borderColor: "border-green-500/30", pulseSpeed: 3.5 },
  { name: "Python", icon: SiPython, color: "#3776AB", borderColor: "border-blue-500/30", pulseSpeed: 3.3 },
  { name: "Kaggle", icon: SiKaggle, color: "#20BEFF", borderColor: "border-blue-400/30", pulseSpeed: 3.6 },
  { name: "Physics", icon: FaAtom, color: "#9C27B0", borderColor: "border-purple-500/30", pulseSpeed: 3.2 },
  { name: "Statistics", icon: FaChartBar, color: "#FF9800", borderColor: "border-amber-500/30", pulseSpeed: 3.5 },
];

// Memoized Technology Card Component
const TechnologyCard = memo(
  ({ tech, index, hoveredTech, setHoveredTech, hoveredTechRef }) => {
    return (
      <motion.div
        className={`relative rounded-xl border-2 ${tech.borderColor} p-4
          bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
          backdrop-blur-sm shadow-lg cursor-pointer flex flex-col items-center justify-center
          w-full max-w-[150px] sm:max-w-[160px] aspect-square`}
        variants={iconContainerVariants}
        whileHover="hover"
        whileTap="hover"
        style={{
          boxShadow:
            hoveredTech === index
              ? `0 0 20px 3px ${tech.color}55`
              : "0 0 25px rgba(0, 0, 0, 0.4)",
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
        }}
        onHoverStart={() => {
          setHoveredTech(index);
          hoveredTechRef.current = index;
        }}
        onHoverEnd={() => {
          setHoveredTech(null);
          hoveredTechRef.current = null;
        }}
      >
        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl z-0"
          style={{ boxShadow: `0 0 0px ${tech.color}00` }}
          animate={{
            boxShadow: [
              `0 0 5px ${tech.color}33`,
              `0 0 15px ${tech.color}55`,
              `0 0 5px ${tech.color}33`,
            ],
          }}
          transition={{
            duration: tech.pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {/* Icon with subtle pulsing glow */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          variants={getIconAnimation(tech.color)}
          animate="animate"
          whileHover="hover"
          whileTap="hover"
          style={{ position: "relative", zIndex: 2, padding: "8px" }}
        >
          {/* Pulsing background glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${tech.color}33 0%, transparent 70%)`,
              filter: "blur(10px)",
              zIndex: 0,
              transform: "scale(1.5)",
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1.4, 1.6, 1.4],
            }}
            transition={{
              duration: tech.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${tech.color}22 0%, transparent 60%)`,
              filter: "blur(5px)",
              zIndex: 0,
              transform: "scale(1.2)",
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [1.2, 1.3, 1.2],
            }}
            transition={{
              duration: tech.pulseSpeed * 0.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <tech.icon
            className="text-4xl sm:text-5xl md:text-6xl relative z-10"
            style={{ color: tech.color, display: "block" }}
          />
        </motion.div>
        {/* Technology name */}
        <motion.div
          className="text-center mt-2 font-medium text-xs sm:text-sm md:text-base"
          style={{
            color: tech.color,
            textShadow: `0 0 8px ${tech.color}66`,
            letterSpacing: "0.5px",
          }}
        >
          {tech.name}
        </motion.div>
      </motion.div>
    );
  }
);

const Technologies = () => {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);

  // Use our unified system profile hook
  const { performanceTier, deviceType } = useSystemProfile();
  const shouldUseScrollTrigger = performanceTier !== "low";

  // For smoother stagger on non-desktop devices, disable staggering.
  const staggerMultiplier = deviceType === "desktop" ? 0.2 : 0;

  // Get optimized container variants with conditional stagger.
  const containerVars = optimizedContainerVariants(staggerMultiplier);

  // Canvas animation: only run on mid/high‑tier devices.
  useEffect(() => {
    if (performanceTier === "low") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const resizeCanvas = () => {
      if (canvas.parentNode) {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    resizeCanvas();

    // Create a light for each technology.
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

    const lightSources = technologies.map((tech, index) => {
      const pos = positions[index] || {
        x: Math.random(),
        y: Math.random(),
        radius: 250,
        speed: { x: 0.3, y: 0.3 },
        direction: { x: 1, y: 1 },
      };
      return {
        x: canvas.width * pos.x,
        y: canvas.height * pos.y,
        radius: pos.radius,
        color: tech.color + "18",
        speed: { ...pos.speed },
        direction: { ...pos.direction },
        baseSpeed: { ...pos.speed },
      };
    });

    let animationFrameId;
    const animate = () => {
      ctx.fillStyle = "rgba(15, 5, 40, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentHovered = hoveredTechRef.current;
      lightSources.forEach((light, index) => {
        if (currentHovered !== null && index === currentHovered) {
          light.speed.x = light.baseSpeed.x * 2.5;
          light.speed.y = light.baseSpeed.y * 2.5;
        } else {
          light.speed.x = light.baseSpeed.x;
          light.speed.y = light.baseSpeed.y;
        }

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

        light.x += light.speed.x * light.direction.x;
        light.y += light.speed.y * light.direction.y;

        const blendMargin = 50;
        if (
          light.x - light.radius < -blendMargin ||
          light.x + light.radius > canvas.width + blendMargin
        ) {
          light.direction.x *= -1;
          if (light.x - light.radius < -blendMargin)
            light.x = -blendMargin + light.radius;
          if (light.x + light.radius > canvas.width + blendMargin)
            light.x = canvas.width + blendMargin - light.radius;
        }
        if (
          light.y - light.radius < -blendMargin ||
          light.y + light.radius > canvas.height + blendMargin
        ) {
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
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      lightSources.forEach((light, i) => {
        const pos = positions[i] || { x: Math.random(), y: Math.random() };
        light.x = canvas.width * pos.x;
        light.y = canvas.height * pos.y;
      });
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [performanceTier]);

  return (
    <section
      ref={sectionRef}
      id="technologies"
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #0f0528, #130a35, #1a0d40)",
        minHeight: "80vh",
        padding: "6rem 0 8rem 0",
        position: "relative",
        clipPath: "polygon(0 0, 100% 0, 100% 92%, 0 100%)",
      }}
    >
      <div
        className="absolute top-0 left-0 w-full h-20 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15, 5, 40, 0) 0%, rgba(15, 5, 40, 0.8) 100%)",
          transform: "translateY(-100%)",
          opacity: 0.8,
        }}
      />
      <div
        className="absolute inset-0 overflow-visible"
        style={{ margin: "-50px" }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full pointer-events-none opacity-60"
          style={{
            mixBlendMode: "lighten",
            margin: "50px",
          }}
        />
      </div>
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 h-full flex flex-col"
        variants={containerVars}
        initial="hidden"
        {...(shouldUseScrollTrigger
          ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
          : { animate: "visible" }
        )}
        style={{ willChange: "opacity, transform" }}
      >
        <motion.h2
          className="mb-12 sm:mb-16 md:mb-20 mt-4 text-center text-4xl sm:text-5xl md:text-6xl font-bold"
          variants={titleVariants}
          whileHover="hover"
          whileTap="hover"
          style={{
            background:
              "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7, #ec4899)",
            backgroundSize: "300% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "gradientShift 6s ease-in-out infinite",
            textShadow: "0 2px 30px rgba(236, 72, 153, 0.3)",
            paddingBottom: "10px",
          }}
        >
          Skills & Tools
        </motion.h2>
        <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 justify-items-center max-w-7xl mx-auto">
          {technologies.map((tech, index) => (
            <TechnologyCard
              key={index}
              tech={tech}
              index={index}
              hoveredTech={hoveredTech}
              setHoveredTech={setHoveredTech}
              hoveredTechRef={hoveredTechRef}
            />
          ))}
        </motion.div>
        <div className="w-full max-w-5xl mx-auto mt-16 sm:mt-20">
          <div
            className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent opacity-70"
            style={{ boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)" }}
          />
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 w-full h-16 z-10 overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to top, rgba(26, 13, 64, 0.8) 0%, rgba(26, 13, 64, 0) 100%)",
            transform: "translateY(50%)",
          }}
        />
      </div>
    </section>
  );
};

export default memo(Technologies);
