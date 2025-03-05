import React, {
  useEffect,
  useState,
  memo,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { motion } from "framer-motion";
import profilePic from "../assets/GadingAdityaPerdana.jpg";
import { HERO_CONTENT } from "../constants/index";

// Lazy-load heavy effects
const AmbientBackground = lazy(() => import("./AmbientBackground.jsx"));
const ParticleEffect = lazy(() => import("./ParticleEffect.jsx"));

// Import our custom device/performance detection
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// ---------- 1) Tokenization Helpers (same as your original) ----------
const specialWords = [
  "Python",
  "machine",
  "learning",
  "AI",
  "research",
  "deep",
  "vision",
  "computer",
  "innovative",
  "recognition",
  "collaborative",
];

const multiWordPhrases = [
  "computer science",
  "facial recognition",
  "machine learning",
  "deep learning",
  "computer vision",
];

function isSpecialWord(word) {
  const cleanWord = word.replace(/[^\w\s]/g, "");
  return specialWords.some(
    (special) => cleanWord.toLowerCase() === special.toLowerCase()
  );
}

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
      isSpecial: isSpecialWord(current),
    });
    i++;
  }
  return tokens;
}

// ---------- 2) Framer Motion Variants ----------
// Full variants for high-tier, simpler ones for mid and low tiers

const outlineVariantsHigh = {
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

const outlineVariantsMid = {
  initial: { pathLength: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 1.8, ease: "easeInOut" },
      strokeOpacity: { duration: 1, delay: 1.5, ease: "easeOut" },
    },
  },
};

const outlineVariantsLow = {
  initial: {},
  animate: {},
};

const dotVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeInOut" },
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

const enhancedWordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.015,
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

const Hero = () => {
  // 1) Determine performance tier & device type using the system profile hook
  const { performanceTier, deviceType } = useSystemProfile();

  // 2) Decide which animations to enable based on performanceTier
  const showAmbient = performanceTier !== "low";       // Ambient background for mid/high devices
  const showParticles = performanceTier === "high";     // Particle effect only on high-tier
  const showDot = performanceTier === "high" || performanceTier === "mid"; // Dot animation for mid/high
  const outlineVariants =
    performanceTier === "high"
      ? outlineVariantsHigh
      : performanceTier === "mid"
      ? outlineVariantsMid
      : outlineVariantsLow;

  // 3) Decide whether to use scroll triggers (enabled for mid/high, immediate for low)
  const shouldUseScrollTrigger = performanceTier !== "low";

  // 4) Tokenize the HERO_CONTENT paragraph once
  const tokens = useMemo(() => tokenizeParagraph(HERO_CONTENT), []);

  // 5) Local state for controlling dot visibility
  const [dotVisible, setDotVisible] = useState(true);

  return (
    <motion.div
      className="relative w-full min-h-screen flex flex-col justify-center items-center py-12 px-4 md:py-16"
      initial="hidden"
      {...(shouldUseScrollTrigger
        ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
        : { animate: "visible" }
      )}
      transition={{ duration: 0.8 }}
      style={{ backgroundColor: "#0f0528", willChange: "opacity, transform" }}
    >
      {/* Global Styles */}
      <style>{`
        html, body {
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
      `}</style>

      {/* Lazy-load Ambient Background if allowed */}
      <Suspense fallback={null}>
        {showAmbient && <AmbientBackground />}
      </Suspense>

      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 md:gap-12 max-w-7xl mx-auto w-full relative z-10">
        {/* LEFT: Text Area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
          {/* Name + Animated Outline */}
          <div className="relative pb-6 mt-8 lg:mt-0">
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 600 100"
              style={{ overflow: "visible" }}
            >
              <motion.path
                id="heroPath"
                d="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
                fill="none"
                stroke="url(#heroGradient)"
                strokeWidth="4"
                strokeLinecap="butt"
                initial="initial"
                {...(shouldUseScrollTrigger
                  ? { whileInView: "animate", viewport: { once: true, amount: 0.3 } }
                  : { animate: "animate" }
                )}
                variants={outlineVariants}
                style={{ willChange: "stroke-dashoffset, strokeOpacity" }}
              />

              {/* The moving dot (skipped on low-tier devices) */}
              {showDot && dotVisible && (
                <motion.g
                  initial="hidden"
                  {...(shouldUseScrollTrigger
                    ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                    : { animate: "visible" }
                  )}
                  variants={dotVariants}
                  onAnimationComplete={() => setDotVisible(false)}
                  style={{ willChange: "opacity" }}
                >
                  <circle r="5" fill="#ec4899">
                    {/* Use native <animateMotion> to follow the path */}
                    <animateMotion dur="4s" repeatCount="1" fill="freeze">
                      <mpath xlinkHref="#heroPath" />
                    </animateMotion>
                  </circle>
                </motion.g>
              )}

              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>

            {/* Name */}
            <motion.h1
              className="text-4xl md:text-5xl xl:text-6xl tracking-tight text-center lg:text-left font-bold relative leading-normal whitespace-normal break-words"
              initial="initial"
              {...(shouldUseScrollTrigger
                ? { whileInView: "animate", viewport: { once: true, amount: 0.3 } }
                : { animate: "animate" }
              )}
              whileHover="hover"
              whileTap="hover"
              variants={nameVariants}
              style={{ willChange: "transform, filter, textShadow" }}
            >
              Gading Aditya Perdana
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
                initial={{ opacity: 0 }}
                {...(shouldUseScrollTrigger
                  ? {
                      whileInView: {
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.05, 1],
                      },
                      viewport: { once: true, amount: 0.3 },
                    }
                  : {
                      animate: {
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.05, 1],
                      },
                    }
                )}
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
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 0.5,
                  }}
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
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1,
                  }}
                  style={{ willChange: "opacity" }}
                />
              </motion.div>
            </div>
          </div>

          {/* Bio Paragraph */}
          <motion.div
            className="w-full my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg text-center lg:text-left relative break-words"
            variants={bioVariants}
            style={{ willChange: "opacity" }}
            {...(shouldUseScrollTrigger
              ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
              : { animate: "visible" }
            )}
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
                  {...(shouldUseScrollTrigger
                    ? { whileInView: "visible", viewport: { once: false, amount: 0.1 } }
                    : { animate: "visible" }
                  )}
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

        {/* RIGHT: Profile Image */}
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
              {...(shouldUseScrollTrigger
                ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                : { animate: "visible" }
              )}
              whileHover="hover"
              whileTap="hover"
              style={{ willChange: "transform, opacity, boxShadow" }}
            />

            {/* Glow behind image (rendered only on mid/high devices) */}
            {performanceTier !== "low" && (
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 -z-10"
                initial={{ opacity: 0 }}
                {...(shouldUseScrollTrigger
                  ? {
                      whileInView: {
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.08, 1],
                      },
                      viewport: { once: true, amount: 0.3 },
                    }
                  : {
                      animate: {
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.08, 1],
                      },
                    }
                )}
                transition={{
                  opacity: { duration: 3, repeat: Infinity, repeatType: "mirror" },
                  scale: { duration: 4, repeat: Infinity, repeatType: "mirror" },
                  delay: 1,
                }}
                style={{ mixBlendMode: "screen" }}
              />
            )}

            {/* Lazy-load Particle Effect only for high-tier devices */}
            <Suspense fallback={null}>
              {showParticles && <ParticleEffect />}
            </Suspense>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(Hero);
