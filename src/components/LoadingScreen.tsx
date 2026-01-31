import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, LinearProgress, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const LoadingContainer = styled(Box)(() => ({
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 10000,
  overflow: "hidden",
}));

const GlowProgress = styled(LinearProgress)(() => ({
  width: "60%",
  height: 8,
  borderRadius: 4,
  backgroundColor: "rgba(59, 130, 246, 0.2)",
  "& .MuiLinearProgress-bar": {
    background: "linear-gradient(90deg, #1e40af, #3b82f6, #60a5fa)",
    borderRadius: 4,
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    animation: "glow 2s ease-in-out infinite alternate",
  },
  "@keyframes glow": {
    "0%": {
      boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    },
    "100%": {
      boxShadow: "0 0 30px rgba(59, 130, 246, 0.7), 0 0 40px rgba(30, 64, 175, 0.3)",
    },
  },
}));

interface LoadingParticleProps {
  index: number;
}

const colorPalette = ["#1e40af", "#3b82f6", "#60a5fa", "#38bdf8"] as const;

const LoadingParticle = ({ index }: LoadingParticleProps): JSX.Element => {
  const randomDelay = useMemo(() => Math.random() * 2, []);
  const randomDuration = useMemo(() => 3 + Math.random() * 2, []);
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomY = useMemo(() => Math.random() * 100, []);
  const driftX = useMemo(() => randomX + (Math.random() - 0.5) * 20, [randomX]);
  const driftY = useMemo(() => randomY + (Math.random() - 0.5) * 20, [randomY]);
  const particleColor = colorPalette[index % colorPalette.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: `${randomX}vw`, y: `${randomY}vh` }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: `${driftX}vw`, y: `${driftY}vh` }}
      transition={{ duration: randomDuration, delay: randomDelay, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "absolute",
        width: 4,
        height: 4,
        background: `radial-gradient(circle, ${particleColor}, transparent)`,
        borderRadius: "50%",
        pointerEvents: "none",
      }}
    />
  );
};

interface NeuralNode {
  id: number;
  x: number;
  y: number;
}

const NeuralNetwork = (): JSX.Element => {
  const nodes = useMemo<NeuralNode[]>(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        x: Math.random() * 100,
        y: Math.random() * 100,
      })),
    [],
  );

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.3,
      }}
    >
      {nodes.map((node, i) =>
        nodes.slice(i + 1).map((otherNode, j) => {
          const distance = Math.hypot(node.x - otherNode.x, node.y - otherNode.y);
          if (distance >= 30) {
            return null;
          }

          return (
            <motion.line
              key={`line-${node.id}-${otherNode.id}-${j}`}
              x1={`${node.x}%`}
              y1={`${node.y}%`}
              x2={`${otherNode.x}%`}
              y2={`${otherNode.y}%`}
              stroke="url(#gradient)"
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, delay: Math.random() * 2 }}
            />
          );
        }),
      )}

      {nodes.map((node, i) => (
        <motion.circle
          key={node.id}
          cx={`${node.x}%`}
          cy={`${node.y}%`}
          r={2}
          fill={colorPalette[i % colorPalette.length]}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 1, delay: i * 0.1 }}
        />
      ))}

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity={0.6} />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
        </linearGradient>
      </defs>
    </svg>
  );
};

const EnhancedGLogo = (): JSX.Element => (
  <motion.div
    initial={{ scale: 0, rotateY: 180, opacity: 0 }}
    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
    transition={{ duration: 2, type: "spring", stiffness: 100, damping: 15 }}
    style={{
      position: "relative",
      width: "200px",
      height: "200px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <motion.div
      animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
      transition={{
        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{
        position: "absolute",
        inset: -20,
        border: "2px solid transparent",
        borderRadius: "50%",
        background: "linear-gradient(45deg, #1e40af, #3b82f6, #60a5fa, #38bdf8) border-box",
        WebkitMask: "linear-gradient(white 0 0) padding-box, linear-gradient(white 0 0)",
        WebkitMaskComposite: "subtract",
        opacity: 0.6,
      }}
    />

    <motion.div
      animate={{ rotate: [360, 0], scale: [0.9, 1.05, 0.9] }}
      transition={{
        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
        scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{
        position: "absolute",
        inset: -10,
        border: "1px solid rgba(59, 130, 246, 0.4)",
        borderRadius: "50%",
        boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
      }}
    />

    <motion.div
      animate={{ rotateY: [0, 15, 0, -15, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        fontSize: "120px",
        fontWeight: 900,
        background:
          "linear-gradient(135deg, #1e40af 0%, #3b82f6 35%, #60a5fa 65%, #38bdf8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 0 50px rgba(59, 130, 246, 0.5)",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        zIndex: 2,
      }}
    >
      G
    </motion.div>

    {[...Array(8)].map((_, index) => {
      const angle = (index * Math.PI * 2) / 8;
      const color = colorPalette[index % colorPalette.length];
      return (
        <motion.div
          key={`particle-${index}`}
          animate={{ rotate: [0, 360], scale: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
          transition={{
            rotate: { duration: 5 + index * 0.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 2 + index * 0.2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + index * 0.3, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: "absolute",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: color,
            left: `${50 + 35 * Math.cos(angle)}%`,
            top: `${50 + 35 * Math.sin(angle)}%`,
            transform: "translate(-50%, -50%)",
            boxShadow: `0 0 15px ${color}`,
          }}
        />
      );
    })}

    <motion.div
      animate={{ scale: [0, 2, 0], opacity: [0, 0.3, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent)",
      }}
    />

    {(["AI", "ML", "Code", "Tech"] as const).map((text, index) => {
      const angle = (index * Math.PI * 2) / 4;
      const color = colorPalette[index];
      return (
        <motion.div
          key={text}
          animate={{ rotate: [0, 360], y: [-5, 5, -5], opacity: [0.4, 0.8, 0.4] }}
          transition={{
            rotate: { duration: 10 + index * 2, repeat: Infinity, ease: "linear" },
            y: { duration: 2 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
          }}
          style={{
            position: "absolute",
            left: `${50 + 60 * Math.cos(angle)}%`,
            top: `${50 + 60 * Math.sin(angle)}%`,
            transform: "translate(-50%, -50%)",
            fontSize: "12px",
            fontWeight: 600,
            color,
            textShadow: `0 0 10px ${color}`,
            pointerEvents: "none",
          }}
        >
          {text}
        </motion.div>
      );
    })}
  </motion.div>
);

const LOADING_STEPS = [
  "Initializing AI Systems...",
  "Loading Neural Networks...",
  "Calibrating Machine Learning Models...",
  "Optimizing Performance...",
  "Preparing Portfolio Experience...",
  "Almost Ready...",
] as const;

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps): JSX.Element => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState<string>(LOADING_STEPS[0]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setProgress((previous) => {
        const nextProgress = previous + Math.random() * 15;
        const stepIndex = Math.floor((nextProgress / 100) * LOADING_STEPS.length);
        if (stepIndex < LOADING_STEPS.length) {
          setLoadingText(LOADING_STEPS[stepIndex]);
        }

        if (nextProgress >= 100) {
          window.clearInterval(timerId);
          setIsFadingOut(true);
          fadeTimeoutRef.current = window.setTimeout(() => {
            onLoadingComplete();
          }, 500);
          return 100;
        }

        return nextProgress;
      });
    }, 100);

    return () => {
      window.clearInterval(timerId);
      if (fadeTimeoutRef.current !== null) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isFadingOut ? 0 : 1, backgroundColor: isFadingOut ? "#000000" : "transparent" }}
        transition={{ duration: 0.5 }}
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 10001 }}
      >
        <LoadingContainer>
          <NeuralNetwork />

          {Array.from({ length: 50 }, (_, index) => (
            <LoadingParticle key={index} index={index} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2rem",
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ scale: 0, rotateY: 180 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <EnhancedGLogo />
            </motion.div>

            <Box sx={{ textAlign: "center", color: "#e2e8f0" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: "0.05em" }}>
                Unleashing Innovation
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.8 }}>
                {loadingText}
              </Typography>
            </Box>

            <GlowProgress variant="determinate" value={Math.min(progress, 100)} />
          </motion.div>
        </LoadingContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
