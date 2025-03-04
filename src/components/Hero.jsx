import { HERO_CONTENT } from "../constants/index";
import profilePic from "../assets/GadingAdityaPerdana.jpg";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Enhanced special words that align with your AI/ML focus
const specialWords = [
  "Python", "machine", "learning", "AI", "research", "deep", 
  "vision", "computer", "innovative", "recognition", "collaborative"
];

// NEW: Multi-word phrases to highlight
const multiWordPhrases = [
  "computer science",
  "facial recognition",
  "machine learning",
  "deep learning",
  "computer vision"
];

// Keep your existing single-word checker (unchanged)
const isSpecialWord = (word) => {
  // Remove punctuation for matching
  const cleanWord = word.replace(/[^\w\s]/g, "");
  return specialWords.some(
    (special) => cleanWord.toLowerCase() === special.toLowerCase()
  );
};

// NEW: Tokenize paragraph to handle multi-word phrases
function tokenizeParagraph(paragraph) {
  const words = paragraph.split(" ");
  const tokens = [];
  let i = 0;

  while (i < words.length) {
    const current = words[i];
    const cleanCurrent = current.replace(/[^\w\s]/g, "").toLowerCase();

    // Check if there's a next word to form a multi-word phrase
    if (i + 1 < words.length) {
      const next = words[i + 1];
      const cleanNext = next.replace(/[^\w\s]/g, "").toLowerCase();
      const combined = `${cleanCurrent} ${cleanNext}`;

      if (multiWordPhrases.includes(combined)) {
        // Merge both words into a single token
        tokens.push({
          text: `${current} ${next}`, 
          isSpecial: true
        });
        i += 2;
        continue;
      }
    }

    // Otherwise, treat it as a single token
    tokens.push({
      text: current,
      isSpecial: isSpecialWord(current) // fall back to single-word check
    });
    i++;
  }

  return tokens;
}

// Word-by-word animation variants
const enhancedWordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 1 + i * 0.015,
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

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [nameAnimated, setNameAnimated] = useState(false);
  const [dotVisible, setDotVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const nameTimer = setTimeout(() => {
      setNameAnimated(true);
    }, 3000);
    const dotTimer = setTimeout(() => {
      setDotVisible(false);
    }, 5000);

    return () => {
      clearTimeout(nameTimer);
      clearTimeout(dotTimer);
    };
  }, []);

  // Name text variants
  const nameVariants = {
    initial: {
      fontWeight: 200,
      textShadow: "0 0 0 rgba(255,255,255,0)",
    },
    animate: {
      fontWeight: 700,
      textShadow: "0 0 8px rgba(255,255,255,0.3)",
      transition: { duration: 1.2, ease: "easeOut" },
    },
    hover: {
      textShadow: "0 0 12px rgba(236,72,153,0.6), 0 0 20px rgba(168,85,247,0.4)",
      filter: "brightness(1.5)",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  // Animated dot that moves around the name
  const dotVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      pathOffset: [0, 1],
      transition: {
        pathOffset: { repeat: 0, duration: 5, ease: "linear" },
        opacity: {
          duration: 5,
          times: [0, 0.9, 1],
          values: [1, 1, 0],
        },
      },
    },
  };

  // Outline animation
  const outlineVariants = {
    initial: { pathLength: 0, pathOffset: 0, strokeOpacity: 1 },
    animate: {
      pathLength: 1,
      pathOffset: [0, 0.5, 1],
      strokeOpacity: [1, 1, 0],
      transition: {
        pathLength: { duration: 2.5, ease: "easeInOut" },
        pathOffset: {
          duration: 2.5,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        },
        strokeOpacity: {
          duration: 1,
          delay: 2,
          ease: "easeOut",
        },
      },
    },
  };

  // Title text container
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

  // Bio paragraph container
  const bioVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, delay: 0.9, ease: "easeOut" },
    },
  };

  // Profile pic
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

  // Subtle float + brightness filter for the image
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
        y: {
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
        filter: {
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
        rotate: {
          duration: 9,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      },
    },
  };

  // NEW: Ambient background animations
  const ambientBlobVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0.1,
    },
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

  // REPLACED: Instead of simply splitting by space, we tokenize:
  const paragraphTokens = tokenizeParagraph(HERO_CONTENT);

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
        overflow-x-hidden
        py-12
        px-4
        md:py-16
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Hide scrollbar & keyframes */}
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          scroll-behavior: smooth;
        }
        /* Hide the scrollbar while allowing scrolling */
        ::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
        @keyframes pulseGlow {
          0% {
            filter: brightness(0.8) contrast(1.2);
          }
          50% {
            filter: brightness(1.2) contrast(1);
          }
          100% {
            filter: brightness(0.8) contrast(1.2);
          }
        }
      `}</style>

      {/* NEW: Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: i % 2 === 0 
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

      {/* NEW: Subtle grid background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(168,85,247,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "center center",
          opacity: 0.2,
        }}
      ></div>

      {/* NEW: Animated gradient mesh */}
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
              filter: "blur(80px)"
            }}
            transition={{ 
              rotate: { 
                duration: 60, 
                ease: "linear", 
                repeat: Infinity,
              },
              scale: {
                duration: 20,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }
            }}
          />
        </svg>
      </div>

      <div className="flex flex-col-reverse lg:flex-row items-center gap-8 md:gap-12 max-w-7xl mx-auto w-full relative z-10">
        {/* Left: Text area */}
        <motion.div
          className="w-full lg:w-1/2 flex flex-col items-center lg:items-start"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {/* Name + Outline */}
          <div className="relative pb-6 mt-8 lg:mt-0">
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 600 100"
              style={{ overflow: "visible" }}
            >
              <motion.path
                d="M10,50 C100,10 200,90 300,50 C400,10 500,90 590,50"
                fill="none"
                stroke="url(#heroGradient)"
                strokeWidth="4"
                strokeLinecap="butt"
                initial="initial"
                animate={isVisible ? "animate" : "initial"}
                variants={outlineVariants}
              />
              {dotVisible && (
                <motion.circle
                  r="5"
                  fill="#ec4899"
                  initial="initial"
                  animate="animate"
                  variants={dotVariants}
                  onAnimationComplete={() => setDotVisible(false)}
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
              className="
                text-4xl md:text-5xl xl:text-6xl
                tracking-tight
                text-center
                lg:text-left
                font-bold
                whitespace-nowrap
                relative
              "
              initial="initial"
              animate={nameAnimated ? "animate" : "initial"}
              whileHover="hover"
              variants={nameVariants}
            >
              Gading Aditya Perdana
              {/* NEW: Subtle glow effect behind the name */}
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror", 
                }}
              />
            </motion.h1>
          </div>

          {/* Titles */}
          <motion.div className="relative" variants={titleContainerVariants}>
            <motion.div className="text-xl md:text-2xl xl:text-3xl tracking-tight text-center lg:text-left relative space-y-3">
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
              >
                Computer Science Undergraduate
                {/* NEW: Title glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur-md -z-10"
                  animate={{ 
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "mirror", 
                  }}
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
              >
                Aspiring AI & Deep Learning Researcher
                {/* NEW: Title glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  animate={{ 
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror", 
                    delay: 0.5,
                  }}
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
              >
                (Computer Vision Focus)
                {/* NEW: Title glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  animate={{ 
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror", 
                    delay: 1,
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Bio paragraph with word-by-word animation */}
          <motion.div
            className="
              my-2 max-w-xl py-6
              text-gray-300
              leading-relaxed
              text-lg
              text-center
              lg:text-left
              relative
            "
            variants={bioVariants}
          >
            {/* NEW: Bio paragraph glow effect */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10"
              animate={{ 
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "mirror", 
              }}
            />
            <motion.p>
              {paragraphTokens.map((token, index) => (
                <motion.span
                  key={index}
                  custom={index}
                  variants={enhancedWordVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  className={`inline-block mr-1 ${
                    token.isSpecial
                      ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                      : ""
                  }`}
                >
                  {token.text}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        </motion.div>

        {/* RIGHT: Profile image */}
        <motion.div
          className="w-full lg:w-1/2 flex justify-center items-center"
          variants={profileAnimationVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md">
            <motion.img
              src={profilePic}
              alt="Gading Aditya Perdana"
              className="rounded-lg shadow-md w-full object-cover relative z-10"
              variants={profilePicVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              whileHover="hover"
            />
            {/* Enhanced glow effect behind the image */}
            <motion.div
              className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg blur opacity-30 -z-10"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror"
                },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "mirror"
                },
                delay: 1
              }}
            />
            
            {/* NEW: Dynamic particle effect around image */}
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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero;
