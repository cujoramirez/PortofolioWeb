import type { ComponentType, ElementType, JSX, MutableRefObject, RefObject } from "react";
import {
  memo,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import { Architecture, Code, Memory, Psychology, Science } from "@mui/icons-material";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionStyle,
} from "framer-motion";

import TechnologyCard from "./TechnologyCard";
import { technologies } from "./techData";
import useDeviceDetection from "./useDeviceDetection";
import { useSystemProfile } from "./useSystemProfile";
import { useLenis } from "../hooks/useLenis";
import ScrollFloat from "./ScrollFloat";

interface LightEffectsProps {
  hoveredTech: number | null;
  hoveredTechRef: MutableRefObject<number | null>;
}

const LightEffects = lazy<ComponentType<LightEffectsProps>>(async () => {
  const module = await import("./LightEffects");
  return { default: module.default as ComponentType<LightEffectsProps> };
});

interface CategoryDefinition {
  name: string;
  icon: ElementType;
  color: string;
}

const CATEGORY_DEFINITIONS = [
  { name: "All", icon: Architecture, color: "#ffffff" },
  { name: "AI/ML", icon: Psychology, color: "#6366f1" },
  { name: "Frontend", icon: Code, color: "#22d3ee" },
  { name: "Backend", icon: Memory, color: "#10b981" },
  { name: "Other", icon: Science, color: "#8b5cf6" },
] as const satisfies readonly CategoryDefinition[];

type CategoryName = (typeof CATEGORY_DEFINITIONS)[number]["name"];

const TechnologiesComponent = (): JSX.Element => {
  const { performanceTier } = useSystemProfile();
  const { isMobile, isTablet, isIOSSafari } = useDeviceDetection();
  const { lenis } = useLenis();

  const containerRef = useRef<HTMLElement | null>(null);
  const hoveredTechRef = useRef<number | null>(null);
  const dormantHoverRef = useRef<number | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<CategoryName>("All");
  const [hoveredTech, setHoveredTech] = useState<number | null>(null);
  const [isContentReady, setIsContentReady] = useState(false);
  const [devicePixelRatio, setDevicePixelRatio] = useState<number>(() =>
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updatePixelRatio = () => {
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };

    window.addEventListener("resize", updatePixelRatio);
    window.addEventListener("orientationchange", updatePixelRatio);

    return () => {
      window.removeEventListener("resize", updatePixelRatio);
      window.removeEventListener("orientationchange", updatePixelRatio);
    };
  }, []);

  const scrollTargetRef = containerRef as unknown as RefObject<HTMLElement>;
  const inViewRef = containerRef as unknown as RefObject<Element>;

  const { scrollYProgress } = useScroll({
    target: scrollTargetRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const titleY = useTransform(scrollYProgress, [0, 0.5], [20, 0]);

  const isSectionInView = useInView(inViewRef, { amount: 0.3, margin: "-15% 0px" });

  const isHandheld = useMemo(() => isMobile || isTablet, [isMobile, isTablet]);

  const shouldRenderInteractiveFx = useMemo(
    () =>
      isSectionInView &&
      !isHandheld &&
      !isIOSSafari &&
      performanceTier === "high" &&
      devicePixelRatio <= 1.6,
    [devicePixelRatio, isHandheld, isIOSSafari, isSectionInView, performanceTier],
  );

  const shouldAnimateBackdrop = useMemo(
    () => isSectionInView && !isHandheld && performanceTier !== "low",
    [isHandheld, isSectionInView, performanceTier],
  );

  const shouldUseScrollTrigger = useMemo(
    () => performanceTier !== "low" && !isIOSSafari && !isHandheld,
    [isHandheld, isIOSSafari, performanceTier],
  );

  useEffect(() => {
    if (isHandheld || isIOSSafari) {
      setIsContentReady(true);
      return;
    }

    const frame = requestAnimationFrame(() => setIsContentReady(true));
    return () => cancelAnimationFrame(frame);
  }, [isHandheld, isIOSSafari]);

  const filteredTechnologies = useMemo(() => {
    if (selectedCategory === "All") {
      return technologies;
    }

    return technologies.filter((tech) => tech.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (!isIOSSafari) {
      return undefined;
    }

    const { body, documentElement } = document;
    body.style.overflow = "auto";
    body.style.overflowY = "auto";
    documentElement.style.overflowY = "auto";

    const currentLenis = lenis;
    const currentScroll = currentLenis && typeof (currentLenis as unknown as { scroll?: number }).scroll === "number"
      ? (currentLenis as unknown as { scroll: number }).scroll
      : window.scrollY;

    let secondaryTimeoutId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      if (currentLenis) {
        currentLenis.scrollTo(currentScroll + 1, { immediate: true });
        secondaryTimeoutId = window.setTimeout(
          () => currentLenis.scrollTo(currentScroll, { immediate: true }),
          50,
        );
      } else {
        window.scrollTo(0, currentScroll + 1);
        secondaryTimeoutId = window.setTimeout(() => window.scrollTo(0, currentScroll), 50);
      }
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
      if (typeof secondaryTimeoutId === "number") {
        window.clearTimeout(secondaryTimeoutId);
      }
      body.style.overflow = "";
      body.style.overflowY = "";
      documentElement.style.overflowY = "";
    };
  }, [isIOSSafari, lenis]);

  const effectiveHoveredTech = shouldRenderInteractiveFx ? hoveredTech : null;
  const hoverRef = shouldRenderInteractiveFx ? hoveredTechRef : dormantHoverRef;

  const handleHoverChange = useCallback(
    (value: number | null) => {
      if (shouldRenderInteractiveFx) {
        setHoveredTech(value);
      }
    },
    [shouldRenderInteractiveFx],
  );

  const supportsBackgroundClip =
    typeof window !== "undefined" &&
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("-webkit-background-clip", "text");

  const headingMotionStyle: MotionStyle = {
    textAlign: "center",
    marginBottom: 48,
    paddingTop: 32,
    paddingBottom: 32,
    opacity: 1,
  };

  if (shouldUseScrollTrigger) {
    headingMotionStyle.y = titleY;
  }

  const interactiveGlowStyle: MotionStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    mixBlendMode: "screen",
    pointerEvents: "none",
    y: backgroundY,
  };

  const lightOverlayStyle: MotionStyle = {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    y: backgroundY,
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="technologies"
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)",
        "&::before": {
          content: "\"\"",
          position: "absolute",
          inset: 0,
          background:
            'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%2322d3ee" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.5,
        },
        "&::after": {
          content: "\"\"",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.15), transparent 50%), radial-gradient(circle at 70% 80%, rgba(34, 211, 238, 0.15), transparent 50%)",
          animation: shouldAnimateBackdrop ? "backgroundPulse 8s ease-in-out infinite alternate" : "none",
        },
      }}
    >
      {shouldRenderInteractiveFx && (
        <motion.div
          style={interactiveGlowStyle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background:
                "radial-gradient(60% 80% at 20% 30%, rgba(99, 102, 241, 0.15), transparent), radial-gradient(80% 60% at 80% 70%, rgba(34, 211, 238, 0.15), transparent)",
              opacity: shouldAnimateBackdrop ? 0.6 : 0.35,
              transition: "opacity 0.6s ease",
            }}
          />
        </motion.div>
      )}

      {shouldRenderInteractiveFx && (
        <>
          <motion.div style={lightOverlayStyle}>
            <Suspense fallback={null}>
              <LightEffects hoveredTech={hoveredTech} hoveredTechRef={hoveredTechRef} />
            </Suspense>
          </motion.div>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              zIndex: 1,
              opacity: shouldAnimateBackdrop ? 0.6 : 0.35,
              transition: "opacity 0.6s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "200%",
                height: "200%",
                background:
                  "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)",
                animation: "floatSlow 20s ease-in-out infinite",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                width: "150%",
                height: "150%",
                background:
                  "radial-gradient(circle at 60% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 40%), radial-gradient(circle at 30% 30%, rgba(245, 101, 101, 0.06) 0%, transparent 30%)",
                animation: "floatReverse 15s ease-in-out infinite",
              },
            }}
          />
        </>
      )}

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={headingMotionStyle}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <ScrollFloat
              as="h1"
              containerClassName="my-0"
              containerStyle={{
                marginBottom: '28px',
              }}
              textClassName="font-extrabold tracking-tight text-center"
              textStyle={{
                fontSize: "clamp(3.8rem, 8.5vw, 6.4rem)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                position: "relative",
                zIndex: 2,
                display: "inline-block",
                color: "transparent",
                ...(supportsBackgroundClip
                  ? {
                      background: "linear-gradient(135deg, #6b7cff 0%, #a855f7 50%, #38bdf8 100%)",
                      backgroundSize: "200% 100%",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation:
                        performanceTier !== "low" && !isHandheld
                          ? "gradientFlow 8s ease-in-out infinite"
                          : "none",
                    }
                  : {
                      color: "#e2e8f0",
                    }),
              }}
            >
              Skills & Technologies
            </ScrollFloat>
          </Box>
          <Box sx={{ position: "relative", display: "flex", justifyContent: "center", mt: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 4,
                background:
                  "linear-gradient(90deg, transparent 0%, #6366f1 20%, #22d3ee 50%, #8b5cf6 80%, transparent 100%)",
                borderRadius: 2,
                opacity: 0.8,
              }}
            />
          </Box>
        </motion.div>

        <Box sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: { xs: 1.5, sm: 2 },
              px: { xs: 2, sm: 0 },
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            {CATEGORY_DEFINITIONS.map((category, index) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.name;
              const categoryShimmerActive = isSelected && performanceTier !== "low" && !isHandheld;

              return (
                <Box
                  key={category.name}
                  sx={{
                    flex: { xs: "1 1 calc(50% - 6px)", sm: "0 1 auto" },
                    minWidth: { xs: "calc(50% - 6px)", sm: "100px" },
                    maxWidth: { xs: "calc(50% - 6px)", sm: "140px" },
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ width: "100%" }}
                  >
                    <Paper
                      onClick={() => setSelectedCategory(category.name)}
                      elevation={isSelected ? 12 : 4}
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        borderRadius: 3,
                        background: isSelected
                          ? `linear-gradient(135deg, ${category.color}40, ${category.color}20)`
                          : "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
                        border: isSelected
                          ? `2px solid ${category.color}`
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        width: "100%",
                        minHeight: { xs: "70px", sm: "80px" },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": categoryShimmerActive
                          ? {
                              content: '""',
                              position: "absolute",
                              inset: 0,
                              background: `linear-gradient(45deg, transparent 30%, ${category.color}20 50%, transparent 70%)`,
                              animation: "categoryShimmer 2s ease-in-out infinite",
                              zIndex: 0,
                            }
                          : undefined,
                        "&:hover": {
                          transform: "translateY(-2px)",
                          background: `linear-gradient(135deg, ${category.color}30, ${category.color}15)` ,
                          boxShadow: `0 8px 32px ${category.color}30`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: { xs: 1, sm: 2 },
                          flexDirection: { xs: "column", sm: "row" },
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <IconComponent
                          sx={{
                            color: isSelected ? category.color : "rgba(255, 255, 255, 0.7)",
                            fontSize: { xs: 24, sm: 28 },
                            transition: "all 0.3s ease",
                            filter: isSelected ? `drop-shadow(0 0 8px ${category.color}50)` : "none",
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            color: isSelected ? "white" : "rgba(255, 255, 255, 0.8)",
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: { xs: "0.8rem", sm: "1.25rem" },
                            transition: "all 0.3s ease",
                            textAlign: "center",
                            textShadow: isSelected ? `0 0 8px ${category.color}50` : "none",
                          }}
                        >
                          {category.name}
                        </Typography>
                      </Box>
                    </Paper>
                  </motion.div>
                </Box>
              );
            })}
          </Box>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                  xl: "repeat(6, minmax(0, 1fr))",
                },
                gap: { xs: 2, sm: 3 },
                justifyItems: "center",
                alignItems: "stretch",
              }}
            >
              {filteredTechnologies.map((tech, index) => (
                <Box key={tech.name} sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                  <TechnologyCard
                    tech={tech}
                    index={index}
                    hoveredTech={effectiveHoveredTech}
                    setHoveredTech={handleHoverChange}
                    hoveredTechRef={hoverRef}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    isIOSSafari={isIOSSafari}
                    contentReady={isContentReady}
                    enableHoverFx={shouldRenderInteractiveFx}
                  />
                </Box>
              ))}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Container>

      <style>{`
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes backgroundPulse { 0% { opacity: 0.5; transform: scale(1); } 100% { opacity: 0.8; transform: scale(1.1); } }
        @keyframes gradientFlow { 0% { background-position: 0% 0%; } 25% { background-position: 100% 0%; } 50% { background-position: 100% 100%; } 75% { background-position: 0% 100%; } 100% { background-position: 0% 0%; } }
        @keyframes titleGlow { 0% { opacity: 0.8; transform: scale(1); } 50% { opacity: 1; transform: scale(1.02); } 100% { opacity: 0.8; transform: scale(1); } }
        @keyframes titlePulse { 0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); } 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); } }
        @keyframes dividerGlow { 0% { opacity: 0.6; } 100% { opacity: 1; } }
        @keyframes dividerPulse { 0% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); } 50% { opacity: 0.3; transform: translate(-50%, -50%) scale(1.1); } 100% { opacity: 0.1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes floatSlow { 0% { transform: translate(0%, 0%) rotate(0deg); opacity: 0.3; } 33% { transform: translate(2%, -2%) rotate(120deg); opacity: 0.5; } 66% { transform: translate(-1%, 1%) rotate(240deg); opacity: 0.3; } 100% { transform: translate(0%, 0%) rotate(360deg); opacity: 0.3; } }
        @keyframes floatReverse { 0% { transform: translate(0%, 0%) rotate(0deg); opacity: 0.2; } 50% { transform: translate(-3%, 2%) rotate(-180deg); opacity: 0.4; } 100% { transform: translate(0%, 0%) rotate(-360deg); opacity: 0.2; } }
        @keyframes categoryShimmer { 0% { transform: translateX(-100%); opacity: 0; } 50% { transform: translateX(0%); opacity: 1; } 100% { transform: translateX(100%); opacity: 0; } }
        .tech-grid { perspective: 1000px; transform-style: preserve-3d; }
        .floating-card { transform: translate3d(0, 0, 0); will-change: transform; }
        @media (prefers-reduced-motion: reduce) { .floating-symbol, [style*="animation"] { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; } }
      `}</style>
    </Box>
  );
};

export default memo(TechnologiesComponent);
