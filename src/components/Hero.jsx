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
const AmbientBackground = lazy(() => import("./AmbientBackground"));
const ParticleEffect = lazy(() => import("./ParticleEffect"));

// Import our custom device/performance detection
import { useSystemProfile } from "../components/useSystemProfile.jsx";

// ---------- 1) Tokenization Helpers ----------
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

// Improved tokenization to fix spacing issues
function tokenizeParagraph(paragraph) {
  // First clean the text by ensuring proper spaces between words
  const cleanedText = paragraph.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  const words = cleanedText.split(" ").filter(word => word.length > 0);
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
  initial: { pathLength: 0, strokeOpacity: 1 },
  animate: {
    pathLength: 1,
    strokeOpacity: [1, 1, 0],
    transition: {
      pathLength: { duration: 1.5, ease: "easeInOut" },
      strokeOpacity: { duration: 0.8, delay: 1.2, ease: "easeOut" },
    },
  },
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

// Re-enabled hover effect for title lines
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

// Helper to generate enhanced word variants with a configurable delay multiplier.
const getEnhancedWordVariants = (delayMultiplier, isMobile) => ({
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * delayMultiplier,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: isMobile ? 1.04 : 1.08, // Smaller scale for mobile
    color: "#a855f7",
    textShadow: isMobile ? "0px 0px 4px rgba(168,85,247,0.4)" : "0px 0px 8px rgba(168,85,247,0.5)",
    transition: { duration: 0.2, ease: "easeOut" },
  },
});

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
  // 1) Determine performance tier & device type using our system profile hook
  const { performanceTier, deviceType } = useSystemProfile();

  // 2) Set appropriate effects based on device and performance
  const isMobile = deviceType === "mobile" || deviceType === "tablet";
  
  // Performance adaptations
  const showAmbient = performanceTier !== "low" && !isMobile;
  const showParticles = performanceTier === "high" && !isMobile;
  const showDot = performanceTier === "high" || performanceTier === "mid";
  
  // Browser detection for iOS Safari optimization
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOSSafari = isIOS && isSafari;
  
  // Select appropriate animation variants
  const outlineVariants = 
    performanceTier === "high" ? outlineVariantsHigh :
    performanceTier === "mid" || isIOSSafari ? outlineVariantsMid : outlineVariantsLow;

  // 3) Decide if we should use scroll-triggered animations
  const shouldUseScrollTrigger = performanceTier !== "low" && !isIOSSafari;

  // 4) Tokenize HERO_CONTENT once with improved tokenization
  const tokens = useMemo(() => tokenizeParagraph(HERO_CONTENT), []);

  // Only animate tokens on desktop with adequate performance
  const shouldAnimateTokens = deviceType === "desktop" && performanceTier !== "low";

  // 5) Local state for controlling dot visibility
  const [dotVisible, setDotVisible] = useState(true);

  // 6) Delay multiplier for staggered animations
  const delayMultiplier = shouldAnimateTokens ? 0.015 : 0;
  const enhancedWordVariants = getEnhancedWordVariants(delayMultiplier, isMobile);

  // 7) Fix iOS Safari viewport height issues
  useEffect(() => {
    // Fix for mobile viewport height (especially iOS Safari)
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set initial height
    updateHeight();
    
    // Update on resize and orientation change
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  // 8) Improve touch scrolling performance
  useEffect(() => {
    if (isMobile) {
      document.body.style.touchAction = 'pan-y';
      
      // Prevent rubber-banding/overscroll on iOS
      document.body.style.overscrollBehaviorY = 'none';
      
      // Disable text selection on mobile to improve performance
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.body.style.touchAction = '';
      document.body.style.overscrollBehaviorY = '';
      document.body.style.userSelect = '';
    };
  }, [isMobile]);

  // 9) Prepare container style with optimized properties
  const containerStyle = {
    backgroundColor: "#0f0528",
    willChange: deviceType === "desktop" ? "opacity, transform" : "auto",
    height: isMobile ? 'auto' : "calc(var(--vh, 1vh) * 100)",
    minHeight: isMobile ? 'calc(var(--vh, 1vh) * 100)' : undefined,
    WebkitOverflowScrolling: 'touch', // Improve iOS scrolling
    overflowX: 'hidden', // Prevent horizontal scrolling
    padding: isMobile ? '3rem 1rem' : '4rem 1rem', // Pre-allocate space for content
  };

  // 10) Pre-allocate space for elements to prevent layout shifts
  const titleContainerHeight = isMobile ? '180px' : '200px';
  const bioContainerHeight = isMobile ? 'auto' : '180px';

  return (
    <motion.div
      className="relative w-full flex flex-col justify-center items-center"
      style={containerStyle}
      initial="hidden"
      {...(shouldUseScrollTrigger
        ? { whileInView: "visible", viewport: { once: true, amount: 0.2 } }
        : { animate: "visible" }
      )}
    >
      {/* Global Styles */}
      <style>{`
        :root {
          --vh: 1vh;
        }
        html, body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          scroll-behavior: smooth;
          background: #0f0528;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: none;
        }
        ::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes lightGradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        /* Pre-allocate space for content containers to prevent layout shifts */
        .title-container {
          height: ${titleContainerHeight};
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .bio-container {
          min-height: ${bioContainerHeight};
        }
        /* Fix iOS Safari issues */
        @supports (-webkit-touch-callout: none) {
          .ios-fix {
            height: -webkit-fill-available;
          }
        }
      `}</style>

      {/* Lazy-load Ambient Background */}
      <Suspense fallback={null}>
        {showAmbient && <AmbientBackground />}
      </Suspense>

      <div className="flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-10 max-w-7xl mx-auto w-full relative z-10">
        {/* LEFT: Text Area */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start mt-6 lg:mt-0">
          {/* Name + Animated Outline - Fixed height to prevent layout shifts */}
          <div className="relative pb-6 h-24 flex items-center justify-center lg:justify-start w-full">
            <svg
              className="absolute top-0 left-0 w-full h-full"
              viewBox="0 0 600 100"
              style={{ overflow: "visible", transform: "translateZ(0)" }}
              aria-hidden="true"
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
              />

              {/* The moving dot */}
              {showDot && dotVisible && (
                <motion.g
                  initial="hidden"
                  {...(shouldUseScrollTrigger
                    ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                    : { animate: "visible" }
                  )}
                  variants={dotVariants}
                  onAnimationComplete={() => setDotVisible(false)}
                >
                  <circle r="5" fill="#ec4899">
                    <animateMotion 
                      dur={isIOSSafari ? "2.5s" : "3.5s"} 
                      repeatCount="1" 
                      fill="freeze"
                      calcMode="linear"
                    >
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
              className="text-4xl md:text-5xl xl:text-6xl tracking-tight text-center lg:text-left font-bold relative z-10 no-select"
              initial="initial"
              {...(shouldUseScrollTrigger
                ? { whileInView: "animate", viewport: { once: true, amount: 0.3 } }
                : { animate: "animate" }
              )}
              whileHover="hover"
              whileTap="hover"
              variants={nameVariants}
            >
              Gading Aditya Perdana
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg blur-lg -z-10"
                initial={{ opacity: 0 }}
                {...(shouldUseScrollTrigger
                  ? {
                      whileInView: {
                        opacity: isIOSSafari ? 0.2 : [0.1, 0.3, 0.1],
                        scale: isIOSSafari ? 1 : [1, 1.05, 1],
                      },
                      viewport: { once: true, amount: 0.3 },
                    }
                  : {
                      animate: {
                        opacity: isIOSSafari ? 0.2 : [0.1, 0.3, 0.1],
                        scale: isIOSSafari ? 1 : [1, 1.05, 1],
                      },
                    }
                )}
                transition={isIOSSafari ? { duration: 0.5 } : { duration: 3, repeat: Infinity, repeatType: "mirror" }}
              />
            </motion.h1>
          </div>

          {/* Titles - Fixed height container to prevent layout shifts */}
          <div className="title-container relative w-full mb-4">
            <div className="text-xl md:text-2xl xl:text-3xl tracking-tight text-center lg:text-left relative space-y-3 no-select">
              {/* Title line 1 - Re-enabled hover motion */}
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
                initial="hidden"
                {...(shouldUseScrollTrigger
                  ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                  : { animate: "visible" }
                )}
                whileHover="hover"
                whileTap="hover"
              >
                Computer Science Undergraduate
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg blur-md -z-10"
                  initial={{ opacity: 0 }}
                  animate={isMobile ? { opacity: 0.15 } : { opacity: [0.1, 0.2, 0.1] }}
                  transition={isMobile ? { duration: 0.5 } : { duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
                />
              </motion.div>

              {/* Title line 2 - Re-enabled hover motion */}
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
                initial="hidden"
                {...(shouldUseScrollTrigger
                  ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                  : { animate: "visible" }
                )}
                transition={{ delay: 0.15 }}
                whileHover="hover"
                whileTap="hover"
              >
                Aspiring AI & Deep Learning Researcher
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  initial={{ opacity: 0 }}
                  animate={isMobile ? { opacity: 0.15 } : { opacity: [0.1, 0.2, 0.1] }}
                  transition={isMobile ? { duration: 0.5 } : { 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 0.5,
                  }}
                />
              </motion.div>

              {/* Title line 3 - Re-enabled hover motion */}
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
                initial="hidden"
                {...(shouldUseScrollTrigger
                  ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
                  : { animate: "visible" }
                )}
                transition={{ delay: 0.3 }}
                whileHover="hover"
                whileTap="hover"
              >
                (Computer Vision Focus)
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-pink-500/10 rounded-lg blur-md -z-10"
                  initial={{ opacity: 0 }}
                  animate={isMobile ? { opacity: 0.15 } : { opacity: [0.1, 0.2, 0.1] }}
                  transition={isMobile ? { duration: 0.5 } : {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    delay: 1,
                  }}
                />
              </motion.div>
            </div>
          </div>

          {/* Bio Paragraph - Fixed size container to prevent layout shifts */}
          <motion.div
            className="bio-container w-full my-2 max-w-xl py-6 text-gray-300 leading-relaxed text-lg text-center lg:text-left relative"
            variants={bioVariants}
            initial="hidden"
            {...(shouldUseScrollTrigger
              ? { whileInView: "visible", viewport: { once: true, amount: 0.3 } }
              : { animate: "visible" }
            )}
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 rounded-xl blur-xl -z-10"
              initial={{ opacity: 0 }}
              animate={isMobile ? { opacity: 0.1 } : { opacity: [0.05, 0.15, 0.05] }}
              transition={isMobile ? { duration: 0.5 } : { duration: 5, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.p className="break-words">
              {tokens.map((token, index) =>
                shouldAnimateTokens ? (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={enhancedWordVariants}
                    initial="hidden"
                    {...(shouldUseScrollTrigger
                      ? { 
                          whileInView: "visible", 
                          viewport: { once: true, amount: 0.1 } // Changed to once:true to prevent re-animation
                        }
                      : { animate: "visible" }
                    )}
                    whileHover="hover"
                    whileTap="hover"
                    className={`inline mr-1 ${
                      token.isSpecial
                        ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                        : ""
                    }`}
                  >
                    {token.text}{" "}
                  </motion.span>
                ) : (
                  <span
                    key={index}
                    className={`inline-block mr-1 ${
                      token.isSpecial
                        ? "font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
                        : ""
                    }`}
                  >
                    {token.text}{" "}
                  </span>
                )
              )}
            </motion.p>
          </motion.div>
        </div>

        {/* RIGHT: Profile Image - Fixed dimensions to prevent layout shifts */}
        <div className="w-full lg:w-1/2 flex justify-center items-center">
          <div className="relative w-full max-w-xs md:max-w-sm lg:max-w-md" style={{ aspectRatio: "1/1" }}>
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
              style={{ transform: "translateZ(0)" }} // Hardware acceleration
            />

            {/* Optimized glow behind image */}
            <motion.div
              className={`absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-lg ${isMobile ? 'blur-sm opacity-20' : 'blur opacity-30'} -z-10`}
              initial={{ opacity: 0 }}
              {...(shouldUseScrollTrigger
                ? {
                    whileInView: isMobile 
                      ? { opacity: 0.15 }
                      : { opacity: [0.2, 0.4, 0.2] },
                    viewport: { once: true, amount: 0.3 },
                  }
                : {
                    animate: isMobile 
                      ? { opacity: 0.15 }
                      : { opacity: [0.2, 0.4, 0.2] },
                  }
              )}
              transition={isMobile 
                ? { duration: 0.5 }
                : { 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }
              }
              style={{ 
                mixBlendMode: "screen",
                transform: "translateZ(0)",
                backgroundSize: "200% 200%",
                animation: isMobile ? "lightGradientShift 3s ease-in-out infinite alternate" : "none"
              }}
            />

            {/* Lazy-load Particle Effect */}
            <Suspense fallback={null}>
              {showParticles && <ParticleEffect />}
            </Suspense>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(Hero);