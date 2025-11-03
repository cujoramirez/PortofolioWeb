import type { JSX, MutableRefObject } from "react";
import { memo, useMemo } from "react";
import { motion, type ForwardRefComponent, type HTMLMotionProps } from "framer-motion";

import type { Technology } from "./techData";

type HoverSetter = (value: number | null) => void;

interface TechnologyCardProps {
  tech: Technology;
  index: number;
  hoveredTech: number | null;
  setHoveredTech: HoverSetter;
  hoveredTechRef?: MutableRefObject<number | null> | null;
  isMobile: boolean;
  isTablet: boolean;
  isIOSSafari: boolean;
  contentReady: boolean;
  enableHoverFx?: boolean;
}

type MotionDivProps = HTMLMotionProps<'div'> & { className?: string };

const MotionDiv = motion.div as ForwardRefComponent<HTMLDivElement, MotionDivProps>;

const TechnologyCardComponent = ({
  tech,
  index,
  hoveredTech,
  setHoveredTech,
  hoveredTechRef,
  isMobile,
  isTablet,
  isIOSSafari,
  contentReady,
  enableHoverFx = true,
}: TechnologyCardProps): JSX.Element => {
  const isHandheld = isMobile || isTablet;
  const cardSize = isTablet ? "130px" : isMobile ? "110px" : "150px";
  const iconSize = isTablet ? "text-4xl" : isMobile ? "text-3xl" : "text-5xl";
  const paddingSize = isTablet ? "p-3" : isMobile ? "p-2" : "p-4";

  const isActive = useMemo(
    () => enableHoverFx && hoveredTech === index,
    [enableHoverFx, hoveredTech, index],
  );

  if (isHandheld || isIOSSafari) {
    return (
      <div
        className={`tech-card-static rounded-xl border-2 ${tech.borderColor} ${paddingSize}
            bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
            flex flex-col items-center justify-center`}
        style={{
          width: "100%",
          maxWidth: cardSize,
          aspectRatio: "1/1",
          boxShadow: `0 0 15px 1px ${tech.color}33, inset 0 0 10px rgba(0,0,0,0.3)` ,
          opacity: contentReady ? 1 : 0,
          transition: "opacity 0.3s",
          position: "relative",
        }}
      >
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            background: `linear-gradient(120deg, transparent 30%, ${tech.color}20 38%, ${tech.color}30 42%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />

        <div
          className="relative flex-1 flex items-center justify-center"
          style={{
            position: "relative",
            zIndex: 2,
            padding: isMobile ? "6px" : "8px",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${tech.color}22 0%, transparent 70%)`,
              opacity: 0.6,
              transform: "scale(1.2)",
            }}
          />

          <tech.icon
            className={`${iconSize} relative z-10`}
            style={{
              color: tech.color,
              filter: `drop-shadow(0 0 3px ${tech.color}66)` ,
              display: "block",
              fontSize: isTablet ? "2rem" : isMobile ? "1.5rem" : "2.5rem",
            }}
          />
        </div>

        <div
          className={`text-center mt-1 font-medium ${
            isMobile ? "text-xs" : isTablet ? "text-sm" : "text-base"
          }`}
          style={{
            color: tech.color,
            textShadow: `0 0 4px ${tech.color}44`,
            letterSpacing: "0.5px",
          }}
        >
          {tech.name}
        </div>
      </div>
    );
  }

  return (
    <MotionDiv
      className={`tech-card relative rounded-xl border-2 ${tech.borderColor} ${paddingSize}
          bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
          flex flex-col items-center justify-center`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        enableHoverFx
          ? { 
              scale: 1.04, 
              boxShadow: `0 0 20px 3px ${tech.color}40`,
              transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 }
            }
          : undefined
      }
      style={{
        width: "100%",
        maxWidth: cardSize,
        aspectRatio: "1/1",
        boxShadow: enableHoverFx && hoveredTech === index
          ? `0 0 20px 3px ${tech.color}55`
          : "0 0 25px rgba(0, 0, 0, 0.4)",
        transformOrigin: "center",
        opacity: contentReady ? 1 : 0,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
      onHoverStart={
        enableHoverFx
          ? () => {
              setHoveredTech(index);
              if (hoveredTechRef) {
                hoveredTechRef.current = index;
              }
            }
          : undefined
      }
      onHoverEnd={
        enableHoverFx
          ? () => {
              setHoveredTech(null);
              if (hoveredTechRef) {
                hoveredTechRef.current = null;
              }
            }
          : undefined
      }
    >
      <div
        className="absolute inset-0 rounded-xl z-0"
        style={{
          boxShadow: isActive
            ? `0 0 18px ${tech.color}40`
            : `0 0 8px ${tech.color}22`,
          transition: "box-shadow 0.12s ease",
          willChange: isActive ? "box-shadow" : "auto",
        }}
      />

      <div
        className="relative flex-1 flex items-center justify-center"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "8px",
          transition: "transform 0.35s ease, filter 0.35s ease",
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${tech.color}2b 0%, transparent 70%)`,
            zIndex: 0,
            transform: isActive ? "scale(1.45)" : "scale(1.25)",
            opacity: isActive ? 0.55 : 0.35,
            transition: "transform 0.4s ease, opacity 0.4s ease",
          }}
        />

        <tech.icon
          className="text-5xl relative z-10"
          style={{
            color: tech.color,
            display: "block",
            fontSize: "2.5rem",
            transform: isActive ? "translateY(-4px) scale(1.04)" : "translateY(0) scale(1)",
            filter: isActive
              ? `drop-shadow(0 0 10px ${tech.color}90)`
              : `drop-shadow(0 0 4px ${tech.color}40)`,
            transition: "transform 0.35s ease, filter 0.35s ease",
          }}
        />
      </div>

      <div
        className="text-center mt-2 font-medium text-base"
        style={{
          color: tech.color,
          textShadow: `0 0 6px ${tech.color}44`,
          letterSpacing: "0.5px",
        }}
      >
        {tech.name}
      </div>
    </MotionDiv>
  );
};

const TechnologyCard = memo(
  TechnologyCardComponent,
  (prevProps, nextProps) => {
    if (prevProps.isMobile || prevProps.isTablet || prevProps.isIOSSafari) {
      return (
        prevProps.contentReady === nextProps.contentReady &&
        prevProps.enableHoverFx === nextProps.enableHoverFx &&
        prevProps.tech === nextProps.tech
      );
    }

    return (
      prevProps.contentReady === nextProps.contentReady &&
      prevProps.hoveredTech === nextProps.hoveredTech &&
      prevProps.enableHoverFx === nextProps.enableHoverFx &&
      prevProps.tech === nextProps.tech
    );
  },
);

export default TechnologyCard;
