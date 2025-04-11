import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PROJECTS } from "../constants";
import { useSystemProfile } from "../components/useSystemProfile.jsx";

const Projects = () => {
  // Get device performance info (and optionally deviceType if provided)
  const { performanceTier } = useSystemProfile();

  // DEVICE & BROWSER DETECTION
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  // For the original branch: detect iOS Safari (legacy method)
  const [isSafariMobile, setIsSafariMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  // For the optimized branch (mobile/tablet) we use these states:
  const [contentReady, setContentReady] = useState(false);
  const [animationsComplete, setAnimationsComplete] = useState(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Check device type based on window width
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    // Check browser info (optimized method)
    const checkBrowser = () => {
      const isSafariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOSCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsSafari(isSafariCheck);
      setIsIOS(isIOSCheck);

      // Original branch: use a simpler UA check for iOS Safari
      const ua = window.navigator.userAgent;
      const originalIsIOS = /iPhone|iPad|iPod/.test(ua);
      const originalIsSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
      setIsSafariMobile(originalIsIOS && originalIsSafari);
    };

    checkDeviceType();
    checkBrowser();
    window.addEventListener("resize", checkDeviceType);
    return () => window.removeEventListener("resize", checkDeviceType);
  }, []);

  // Derived values
  const isIOSSafari = isIOS && isSafari;
  const isDesktop = !isMobile && !isTablet;

  // DETERMINE REDUCED MOTION
  // On desktop we mimic the original logic: reduced if performance is low.
  // On mobile/tablet we combine the framer-motion hook with extra conditions.
  const preferredReducedMotion = useReducedMotion();
  const reducedMotion = isDesktop
    ? performanceTier === "low"
    : (preferredReducedMotion || (isMobile && performanceTier === "low") || isIOSSafari);

  // ORIGINAL BRANCH EFFECT: For desktop, mark as loaded immediately.
  useEffect(() => {
    if (isDesktop) {
      setIsLoaded(true);
    }
  }, [isDesktop]);

  // OPTIMIZED BRANCH EFFECTS: For mobile/tablet only.
  useEffect(() => {
    if (!isDesktop) {
      isMountedRef.current = true;
      if (isIOSSafari) {
        setContentReady(true);
      } else {
        const timer = setTimeout(() => {
          if (isMountedRef.current) setContentReady(true);
        }, 200);
        return () => {
          clearTimeout(timer);
          isMountedRef.current = false;
        };
      }
      const animationTimer = setTimeout(() => {
        if (isMountedRef.current) setAnimationsComplete(true);
      }, isIOSSafari ? 800 : 2000);
      return () => {
        clearTimeout(animationTimer);
        isMountedRef.current = false;
      };
    }
  }, [isDesktop, isIOSSafari]);

  // OPTIMIZED: iOS Safari scroll fix for mobile/tablet.
  useEffect(() => {
    if (!isDesktop && isIOSSafari) {
      document.body.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      document.documentElement.style.overflowY = "auto";
      setTimeout(() => {
        window.scrollTo(0, window.scrollY + 1);
        setTimeout(() => window.scrollTo(0, window.scrollY - 1), 50);
      }, 100);
      return () => {
        document.body.style.overflow = "";
        document.body.style.overflowY = "";
        document.documentElement.style.overflowY = "";
      };
    }
  }, [isDesktop, isIOSSafari]);

  // COMMON STATE
  const initialVisibleTags = 4;
  const [expandedTags, setExpandedTags] = useState({});
  const toggleTags = useCallback((projectIndex) => {
    setExpandedTags((prev) => ({
      ...prev,
      [projectIndex]: !prev[projectIndex]
    }));
  }, []);

  // MERGED TECHTAG COMPONENT
  const MergedTechTag = React.memo(({ tech, index }) => {
    // Choose different animation delays and durations based on branch.
    const tagVariants = isDesktop
      ? {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { delay: reducedMotion ? 0 : 0.1 + index * 0.02, duration: 0.2 }
          },
          hover: {
            backgroundColor: "rgba(168,85,247,0.7)",
            color: "#ffffff",
            boxShadow: "0 0 8px rgba(168,85,247,0.6)",
            transition: { duration: 0.2 }
          }
        }
      : {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              delay: reducedMotion ? 0 : 0.1 + index * (isMobile ? 0.01 : 0.02),
              duration: isIOSSafari ? 0.1 : 0.2
            }
          },
          hover: {
            backgroundColor: "rgba(168,85,247,0.7)",
            color: "#ffffff",
            boxShadow: "0 0 8px rgba(168,85,247,0.6)",
            transition: { duration: 0.2 }
          }
        };

    const className = isDesktop
      ? "rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-purple-400 border border-purple-500/30"
      : `rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-purple-400 border border-purple-500/30 ${isIOSSafari ? "ios-fix" : ""}`;

    // For desktop we include whileTap as in the original; for mobile/tablet we omit it.
    const whileTapProp =
      isDesktop ? (reducedMotion ? undefined : "hover") : (!isMobile && !isTablet ? (reducedMotion || isIOSSafari ? undefined : "hover") : undefined);

    return (
      <motion.span
        className={className}
        variants={tagVariants}
        whileHover={reducedMotion ? undefined : "hover"}
        whileTap={whileTapProp}
        style={{ transform: "translateZ(0)" }}
      >
        {tech}
      </motion.span>
    );
  });

  // ANIMATION VARIANTS & STYLES (branch-dependent)
  const containerVariants = isDesktop
    ? reducedMotion
      ? { visible: { opacity: 1 } }
      : {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 }
          }
        }
    : reducedMotion || isIOSSafari
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : isMobile
    ? {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.04 } }
      }
    : isTablet
    ? {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut", staggerChildren: 0.06 } }
      }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.08 } }
      };

  const titleVariants = isDesktop
    ? {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        hover: {
          scale: 1.02,
          textShadow: "0px 0px 6px rgba(168,85,247,0.6)",
          transition: { duration: 0.2 }
        }
      }
    : {
        hidden: { opacity: 0, y: -10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: isMobile ? 0.2 : 0.3, ease: "easeOut" }
        },
        hover: {
          scale: 1.02,
          textShadow: "0px 0px 6px rgba(168,85,247,0.6)",
          transition: { duration: 0.2 }
        }
      };

  const projectContentVariants = isDesktop
    ? reducedMotion
      ? { visible: { opacity: 1 } }
      : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : reducedMotion || isIOSSafari
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : isMobile
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } };

  const containerProps = isDesktop
    ? reducedMotion
      ? { animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-5%" } }
    : reducedMotion || isIOSSafari
    ? { animate: "visible" }
    : isMobile
    ? { initial: "hidden", animate: contentReady ? "visible" : "hidden" }
    : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-5%" } };

  const gradientStyle = isDesktop
    ? {
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        animation: reducedMotion ? "none" : "gradientShift 6s ease-in-out infinite alternate"
      }
    : {
        backgroundSize: "200% 200%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        animation: reducedMotion ? "none" : "gradientShift 6s ease-in-out infinite alternate",
        WebkitTextFillColor: "transparent",
        paddingBottom: "10px"
      };

  const sectionPadding = isDesktop ? "pb-16 px-4 md:px-8 lg:px-12" : isMobile ? "pb-8 px-4" : "pb-12 px-6";

  return (
    <div
      id="projects"
      className={`${sectionPadding} max-w-7xl mx-auto`}
      style={{
        // For mobile/tablet we wait until contentReady/animationsComplete (adjust if needed)
        visibility: isDesktop ? "visible" : contentReady || animationsComplete ? "visible" : "visible"
      }}
    >
      {isDesktop ? (
        <>
          {isSafariMobile && !isLoaded && (
            <h2 className="my-16 text-center text-4xl md:text-5xl font-bold text-purple-500">
              My Projects
            </h2>
          )}
          <motion.h2
            className="my-16 text-center text-4xl md:text-5xl font-bold w-full bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-slate-300 to-purple-600 leading-normal"
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            whileHover={reducedMotion ? undefined : "hover"}
            whileTap={reducedMotion ? undefined : "hover"}
            style={gradientStyle}
          >
            My Projects
          </motion.h2>
        </>
      ) : (
        <motion.h2
          className="my-16 text-center text-4xl md:text-5xl font-bold w-full bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-slate-300 to-purple-600 leading-normal"
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          whileHover={reducedMotion || isIOSSafari || isMobile ? undefined : "hover"}
          {...((!isMobile && !isTablet) ? { whileTap: reducedMotion || isIOSSafari ? undefined : "hover" } : {})}
          style={gradientStyle}
        >
          My Projects
        </motion.h2>
      )}

      <motion.div
        className={isDesktop ? "grid gap-10" : "grid gap-8 md:gap-10"}
        variants={containerVariants}
        initial="hidden"
        {...containerProps}
        style={{
          transform: "translateZ(0)",
          opacity: isDesktop ? 1 : contentReady || animationsComplete ? 1 : 0,
          transition: "opacity 0.3s ease-out"
        }}
      >
        {PROJECTS.map((project, index) => (
          <motion.div
            key={index}
            className={
              isDesktop
                ? "bg-neutral-800/40 rounded-xl overflow-hidden shadow-lg border border-neutral-700/50 hover:border-purple-500/50 transition-colors duration-300"
                : `bg-neutral-800/40 rounded-xl overflow-hidden shadow-lg border border-neutral-700/50 hover:border-purple-500/50 transition-colors duration-300 ${isIOSSafari ? "project-card-ios" : ""}`
            }
            variants={containerVariants}
            style={{
              backgroundColor: "rgba(38, 38, 38, 0.9)",
              ...(isDesktop || reducedMotion || isMobile || isIOSSafari
                ? {}
                : {
                    backdropFilter: "blur(8px)",
                    backgroundColor: "rgba(38, 38, 38, 0.4)"
                  }),
              transform: "translateZ(0)"
            }}
          >
            <div className={`${isDesktop ? "p-6 md:p-8" : isMobile ? "p-4" : "p-6"} flex flex-col lg:flex-row gap-6 md:gap-8`}>
              <motion.div
                className="flex-shrink-0 flex justify-center lg:justify-start"
                variants={projectContentVariants}
              >
                <motion.div
                  className={
                    isDesktop
                      ? "relative w-40 h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shadow-lg"
                      : "relative w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-lg overflow-hidden shadow-lg"
                  }
                  whileHover={reducedMotion || isIOSSafari || isMobile ? undefined : {
                    scale: 1.03,
                    filter: "brightness(1.05)",
                    transition: { duration: 0.2 }
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </motion.div>
              </motion.div>

              <motion.div className="flex-grow space-y-3" variants={projectContentVariants}>
                <h3 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                  {project.title}
                </h3>
                <p className="text-neutral-300 leading-relaxed">{project.description}</p>
                <div className="pt-1 md:pt-2">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies
                      .slice(0, expandedTags[index] ? project.technologies.length : initialVisibleTags)
                      .map((tech, idx) => (
                        <MergedTechTag key={tech + idx} tech={tech} index={idx} />
                      ))}
                    {project.technologies.length > initialVisibleTags && (
                      <motion.button
                        onClick={() => toggleTags(index)}
                        className="rounded-full bg-neutral-900/70 px-3 py-1.5 text-sm font-medium text-purple-300 border border-purple-500/20 cursor-pointer"
                        whileHover={reducedMotion || isIOSSafari || isMobile ? undefined : { scale: 1.03 }}
                        {...((isDesktop || (!isMobile && !isTablet))
                          ? { whileTap: reducedMotion || isIOSSafari ? undefined : { scale: 0.97 } }
                          : {})}
                        initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: reducedMotion ? 0 : 0.3 }}
                        style={{ transform: "translateZ(0)" }}
                      >
                        {expandedTags[index]
                          ? <span className="flex items-center gap-1">Less <span className="text-xs">▲</span></span>
                          : <span className="flex items-center gap-1">
                              +{project.technologies.length - initialVisibleTags} <span className="text-xs">▼</span>
                            </span>}
                      </motion.button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-3 md:pt-4">
                  {project.title === "Deep Learning research on Ensemble Learning & Mutual Learning" ? (
                    <motion.div
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-800 to-indigo-900 text-white border border-purple-500/50 font-medium shadow-md flex items-center gap-2"
                      whileHover={reducedMotion || isIOSSafari || isMobile ? undefined : { scale: 1.02 }}
                      {...((isDesktop || (!isMobile && !isTablet))
                        ? { whileTap: reducedMotion || isIOSSafari ? undefined : { scale: 0.98 } }
                        : {})}
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Ongoing Research
                    </motion.div>
                  ) : (
                    project.links &&
                    project.links.length > 0 &&
                    project.links.map((link, idx) => {
                      let displayText = "View Project";
                      try {
                        if (typeof link === "string") {
                          const url = new URL(link);
                          displayText = url.hostname.replace("www.", "");
                        } else if (link.text) {
                          displayText = link.text;
                        }
                      } catch (e) {}
                      return (
                        <motion.a
                          key={idx}
                          href={typeof link === "string" ? link : link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium shadow-md flex items-center gap-2 relative overflow-hidden group"
                          whileHover={reducedMotion || isIOSSafari || isMobile ? undefined : { scale: 1.02 }}
                          {...((isDesktop || (!isMobile && !isTablet))
                            ? { whileTap: reducedMotion || isIOSSafari ? undefined : { scale: 0.98 } }
                            : {})}
                        >
                          {!(reducedMotion || isIOSSafari || isMobile || isTablet) && (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-full transition-all duration-500 ease-out"></div>
                          )}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {displayText}
                        </motion.a>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          ${isDesktop
            ? "100% { background-position: 100% 50%; }"
            : "50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }"}
        }

        /* Fix iOS Safari rendering issues */
        @supports (-webkit-touch-callout: none) {
          ${isDesktop
            ? `
            .project-card {
              transform: translateZ(0);
            }
          `
            : `
            .project-card-ios {
              transform: translate3d(0,0,0);
              -webkit-transform: translate3d(0,0,0);
              -webkit-overflow-scrolling: touch;
            }
            .ios-fix {
              transform: translate3d(0,0,0);
              -webkit-transform: translate3d(0,0,0);
            }
            body {
              -webkit-overflow-scrolling: touch;
              overflow-y: auto !important;
            }
          `}
        }

        /* Improve performance for animation on mobile */
        @media (max-width: 640px) {
          .project-card {
            will-change: transform, opacity;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(Projects);
