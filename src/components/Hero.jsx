import React, { useEffect, useState, memo, useMemo } from "react";
import { motion } from "framer-motion";
import profilePic from "../assets/GadingAdityaPerdana.jpg";
import { HERO_CONTENT } from "../constants/index";

// Enhanced special words that align with your AI/ML focus
const specialWords = [
  "Python", "machine", "learning", "AI", "research", "deep", 
  "vision", "computer", "innovative", "recognition", "collaborative"
];

// Multi-word phrases
const multiWordPhrases = [
  "computer science",
  "facial recognition",
  "machine learning",
  "deep learning",
  "computer vision"
];

// Single-word checker
const isSpecialWord = (word) => {
  const cleanWord = word.replace(/[^\w\s]/g, "");
  return specialWords.some(
    (special) => cleanWord.toLowerCase() === special.toLowerCase()
  );
};

// Tokenize paragraph for multi-word phrases
function tokenizeParagraph(paragraph) {
  const words = paragraph.split(" ");
  const tokens = [];
  let i = 0;
  while (i < words.length) {
    const current = words[i];
    const cleanCurrent = current.replace(/[^\w\s]/g, "").toLowerCase();
    if (i + 1 < words.length) {
      const next = words[i + 1];
      const cleanNext = next.replace(/[^\w\s]/g, "").toLowerCase();
      const combined = `${cleanCurrent} ${cleanNext}`;
      if (multiWordPhrases.includes(combined)) {
        tokens.push({ text: `${current} ${next}`, isSpecial: true });
        i += 2;
        continue;
      }
    }
    tokens.push({
      text: current,
      isSpecial: isSpecialWord(current)
    });
    i++;
  }
  return tokens;
}

// Word-by-word animation variants with stagger effect restored
const enhancedWordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 1 + i * 0.015, // staggered delay
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.08,
    color: "#a855f7",
    textShadow: "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const nameVariants = {
  initial: { fontWeight: 200, textShadow: "0 0 0 rgba(255,255,255,0)" },
  animate: {
    fontWeight: 700,
    textShadow: "0 0 8px rgba(255,255,255,0.3)",
    transition: { duration: 1.2, ease: "easeOut" },
  },
  hover: {
    textShadow:
      "0 0 12px rgba(236,72,153,0.6), 0 0 20px rgba(168,85,247,0.4)",
    filter: "brightness(1.5)",
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const dotVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    pathOffset: [0, 1],
    transition: {
      pathOffset: { repeat: 0, duration: 5, ease: "linear" },
      opacity: { duration: 5, times: [0, 0.9, 1], values: [1, 1, 0] },
    },
  },
};

const outlineVariants = {
  initial: { pathLength: 0, pathOffset: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    pathOffset: [0, 0.5, 1],
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 2.5, ease: "easeInOut" },
      pathOffset: { duration: 2.5, ease: "easeInOut", times: [0, 0.5, 1] },
      strokeOpacity: { duration: 1, delay: 2, ease: "easeOut" },
    },
  },
};

const titleContainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: 0.5 },
  },
};

const titleLineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.2 },
  },
};

const bioVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, delay: 0.9, ease: "easeOut" },
  },
};

const profilePicVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    boxShadow: "0 20px 30px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

const profileAnimationVariants = {
  initial: { filter: "brightness(1) contrast(1)", y: 0, rotate: 0 },
  animate: {
    filter: [
      "brightness(1) contrast(1)",
      "brightness(1.1) contrast(1.05)",
      "brightness(1) contrast(1)",
    ],
    y: [-5, 5, -5],
    rotate: [-0.5, 0.5, -0.5],
    transition: {
      y: { duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
      filter: { duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
      rotate: { duration: 9, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
    },
  },
};

const ambientBlobVariants = {
  initial: { scale: 0.8, opacity: 0.1 },
  animate: (i) => ({
    scale: [0.8, 1.2, 0.9, 1.1, 0.8],
    opacity: [0.1, 0.2, 0.15, 0.25, 0.1],
    x: [0, 50, -30, 20, 0],
    y: [0, -30, 50, -20, 0],
    transition: {
      duration: 25 + i * 5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    },
  }),
};

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [nameAnimated, setNameAnimated] = useState(false);
  const [dotVisible, setDotVisible] = useState(true);

  // Memoize tokenization for performance & consistent rendering on all devices
  const tokens = useMemo(() => tokenizeParagraph(HERO_CONTENT), []);

  useEffect(() => {
    setIsVisible(true);
    const nameTimer = setTimeout(() => setNameAnimated(true), 3000);
    const dotTimer = setTimeout(() => setDotVisible(false), 5000);
    return () => {
      clearTimeout(nameTimer);
      clearTimeout(dotTimer);
    };
  }, []);

  return (
    <motion.div
      className="
        relative
        w-full
        min-h-screen
        flex
        flex-col
        justify-center
        items-center
        py-12
        px-4
        md:py-16
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        backgroundColor: "#0f0528",
        willChange: "opacity, transform",
      }}
    >
    <style>{`
      html,
      body {
        margin: 0;
        padding: 0;
        scroll-behavior: smooth;
        background: #0f0528;
      }
      ::-webkit-scrollbar {
        width: 0;
        background: transparent;
      }
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        100% { background-position: 100% 50%; }
      }
      @keyframes pulseGlow {
        0% { filter: brightness(0.8) contrast(1.2); }
        50% { filter: brightness(1.2) contrast(1); }
        100% { filter: brightness(0.8) contrast(1.2); }
      }
    `}</style>

      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background:
                i % 2 === 0
                  ? "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(236,72,153,0) 70%)"
                  : "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0) 70%)",
              width: `${400 + i * 100}px`,
              height: `${400 + i * 100}px`,
              top: `${i * 10}%`,
              left: `${(i * 25) % 100}%`,
              filter: "blur(60px)",
              mixBlendMode: "normal",
            }}
            custom={i}
            variants={ambientBlobVariants}
            initial="initial"
            animate="animate"
          />
        ))}
      </div>

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
          opacity: 0.2,
        }}
      ></div>

      {/* Animated gradient mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg width="100%" height="100%" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168,85,247,0.05)" />
              <stop offset="50%" stopColor="rgba(236,72,153,0.05)" />
              <stop offset="100%" stopColor="rgba(124,58,237,0.05)" />
            </linearGradient>
          </defs>
          <motion.rect
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            fill="url(#meshGradient)"
            initial={{ rotate: 0, scale: 1 }}
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
              filter: "blur(80px)",
            }}
            transition={{
              rotate: { duration: 60, ease: "linear", repeat: Infinity },
              scale: { duration: 20, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" },
            }}
          />
        </svg>
      </div>

      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 md:gap-12 max-w-7xl mx-auto w-full relative z-10">
        {/* Left: Text area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
          {/* Name + Outline */}
          <div className="relative pb-6 mt-8 lg:mt-0">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 600 100" style={{ overflow: "visible" }}>
              <motion.path
                d="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
                fill="none"
                stroke="url(#heroGradient)"
                strokeWidth="4"
                strokeLinecap="butt"
                initial="initial"
                animate={isVisible ? "animate" : "initial"}
                variants={outlineVariants}
                style={{ willChange: "stroke-dashoffset, strokeOpacity" }}
              />
              {dotVisible && (
                <motion.circle
                  r="5"
                  fill="#ec4899"
                  initial="initial"
                  animate="animate"
                  variants={dotVariants}
                  onAnimationComplete={() => setDotVisible(false)}
                  style={{ willChange: "opacity" }}
                >
                  <motion.animateMotion
                    path="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
                    dur="5s"
                    repeatCount="0"
                  />
                </motion.circle>
              )}
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <motion.h1
              className="text-4xl md:text-5xl xl:text-6xl tracking-tight text-center lg:text-left font-bold relative leading-normal whitespace-normal break-words"
              initial="initial"
              animate={nameAnimated ? "animate" : "initial"}
              whileHover="hover"
              whileTap="hover"
              variants={nameVariants}
              style={{ willChange: "transform, filter, textShadow" }}
            >
              Gading Aditya Perdana
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror" }}
                style={{ willChange: "opacity, transform" }}
              />
            </motion.h1>
          </div>

          {/* Titles */}
          <div className="relative">
            <div className="text-xl md:text-2xl xl:text-3xl tracking-tight text-center lg:text-left relative space-y-3">
              <motion.div
                className="text-transparent bg-clip-text relative"
                style={{
                  background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 2s ease-in-out infinite alternate",
                }}
                variants={titleLineVariants}
                whileHover="hover"
                whileTap="hover"
              >
                Computer Science Undergraduate
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur-md -z-10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
                  style={{ willChange: "opacity" }}
                />
              </motion.div>
              <motion.div
                className="text-transparent bg-clip-text relative"
                style={{
                  background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 2s ease-in-out infinite alternate",
                }}
                variants={titleLineVariants}
                whileHover="hover"
                whileTap="hover"
              >
                Aspiring AI & Deep Learning Researcher
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
                  style={{ willChange: "opacity" }}
                />
              </motion.div>
              <motion.div
                className="text-transparent bg-clip-text relative"
                style={{
                  background: "linear-gradient(90deg, #ec4899, #cbd5e1, #a855f7)",
                  backgroundSize: "200% 200%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 2s ease-in-out infinite alternate",
                }}
                variants={titleLineVariants}
                whileHover="hover"
                whileTap="hover"
              >
                (Computer Vision Focus)
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", delay: 1 }}
                  style={{ willChange: "opacity" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Bio paragraph */}
          <motion.div
            className="w-full my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg text-center lg:text-left relative break-words"
            variants={bioVariants}
            style={{ willChange: "opacity" }}
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
              style={{ willChange: "opacity" }}
            />
            <motion.p>
              {tokens.map((token, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={enhancedWordVariants}
                  initial="hidden"
                  whileInView="visible"
                  // Lowered the viewport threshold so even small tokens trigger their animation
                  viewport={{ once: false, amount: 0.1 }}
                  whileHover="hover"
                  whileTap="hover"
                  className={`inline-block mr-1 ${
                    token.isSpecial
                      ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                      : ""
                  }`}
                  style={{ willChange: "transform, color, textShadow" }}
                >
                  {token.text}{" "}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        </div>

        {/* RIGHT: Profile image */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <motion.div
            className="relative w-full max-w-xs md:max-w-sm lg:max-w-md"
            style={{ willChange: "transform, opacity" }}
          >
            <motion.img
              src={profilePic}
              alt="Gading Aditya Perdana"
              className="rounded-lg shadow-md w-full object-cover relative z-10"
              variants={profilePicVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              whileHover="hover"
              whileTap="hover"
              style={{ willChange: "transform, opacity, boxShadow" }}
            />
            {/* Enhanced glow effect behind the image */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.08, 1],
              }}
              transition={{
                opacity: { duration: 3, repeat: Infinity, repeatType: "mirror" },
                scale: { duration: 4, repeat: Infinity, repeatType: "mirror" },
                delay: 1,
              }}
              style={{ mixBlendMode: "screen" }}
            />
            {/* Dynamic particle effect around image */}
            <div className="absolute -inset-16 z-0 opacity-60">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-purple-500"
                  style={{
                    width: 6 + Math.random() * 8,
                    height: 6 + Math.random() * 8,
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    filter: "blur(3px)",
                    willChange: "transform, opacity",
                  }}
                  animate={{
                    x: [0, Math.random() * 40 - 20, 0],
                    y: [0, Math.random() * 40 - 20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: i * 0.5,
                  }}
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i + 6}
                  className="absolute rounded-full bg-pink-500"
                  style={{
                    width: 5 + Math.random() * 6,
                    height: 5 + Math.random() * 6,
                    top: `${20 + Math.random() * 60}%`,
                    left: `${20 + Math.random() * 60}%`,
                    filter: "blur(2px)",
                    willChange: "transform, opacity",
                  }}
                  animate={{
                    x: [0, Math.random() * 30 - 15, 0],
                    y: [0, Math.random() * 30 - 15, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: i * 0.5 + 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(Hero);
