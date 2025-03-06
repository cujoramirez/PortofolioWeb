// TechnologyCard.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";

const TechnologyCard = memo(
  ({ 
    tech, 
    index, 
    hoveredTech, 
    setHoveredTech, 
    hoveredTechRef, 
    isMobile, 
    isTablet, 
    isIOSSafari, 
    reducedMotion, 
    contentReady,
    performanceTier
  }) => {
    // Adjust animation speeds based on device
    const pulseSpeed = tech.pulseSpeed * (isIOSSafari ? 1.5 : isMobile ? 1.2 : 1);
    
    // Size adjustments for different devices
    const cardSize = isTablet ? "130px" : isMobile ? "110px" : "150px";
    const iconSize = isTablet ? "text-4xl" : isMobile ? "text-3xl" : "text-5xl";
    const paddingSize = isTablet ? "p-3" : isMobile ? "p-2" : "p-4";

    // Get icon container variants for animations
    const getIconContainerVariants = (isMobile, isIOSSafari) => ({
      hidden: { opacity: 0, y: isIOSSafari ? 5 : isMobile ? 8 : 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { 
          duration: isIOSSafari ? 0.3 : isMobile ? 0.4 : 0.6, 
          ease: "easeOut" 
        },
      },
      hover: isIOSSafari ? {} : {
        scale: isMobile ? 1.03 : 1.05,
        transition: {
          duration: 0.3,
          ease: "easeOut",
          type: "tween",
        },
      },
    });

    // Get icon animation based on device type
    const getIconAnimation = (color, isMobile, isTablet, isIOSSafari, reducedMotion) => {
      // Disabled animations for iOS Safari and reduced motion
      if (isIOSSafari || reducedMotion) {
        return {
          animate: {
            filter: `drop-shadow(0 0 2px ${color}33)`,
          },
          hover: isIOSSafari ? {} : {
            scale: 1.03,
            filter: `drop-shadow(0 0 6px ${color})`,
            transition: { duration: 0.2 },
          },
        };
      }
      
      // Tablet-specific animations (lighter than desktop)
      if (isTablet) {
        return {
          animate: {
            y: [-1, 1, -1],
            filter: `drop-shadow(0 0 1px ${color}33)`,
            transition: {
              y: {
                duration: 3.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            },
          },
          hover: {
            scale: 1.04,
            filter: `drop-shadow(0 0 8px ${color})`,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
        };
      }
      
      // Desktop animations (kept intact as requested)
      return {
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
            ease: "easeOut",
          },
        },
      };
    };
    
    return (
      <motion.div
        className={`relative rounded-xl border-2 ${tech.borderColor} ${paddingSize}
          bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
          backdrop-blur-sm shadow-lg cursor-pointer flex flex-col items-center justify-center`}
        variants={getIconContainerVariants(isMobile, isIOSSafari)}
        whileHover={isIOSSafari ? undefined : "hover"}
        // Removed whileTap for mobile/tablet as requested
        {...(!isMobile && !isTablet ? { whileTap: isIOSSafari ? undefined : "hover" } : {})}
        style={{
          width: '100%',
          maxWidth: cardSize,
          aspectRatio: '1/1',
          boxShadow:
            hoveredTech === index
              ? `0 0 ${isMobile ? "16px 2px" : "20px 3px"} ${tech.color}${isMobile ? "44" : "55"}`
              : `0 0 ${isMobile ? "15px" : "25px"} rgba(0, 0, 0, ${isMobile ? "0.3" : "0.4"})`,
          transition: "all 0.3s ease-in-out",
          overflow: "visible",
          transformOrigin: "center",
          opacity: contentReady ? 1 : 0,
          transform: "translateZ(0)", // Hardware acceleration
        }}
        onHoverStart={() => {
          if (isIOSSafari) return;
          setHoveredTech(index);
          hoveredTechRef.current = index;
        }}
        onHoverEnd={() => {
          if (isIOSSafari) return;
          setHoveredTech(null);
          hoveredTechRef.current = null;
        }}
      >
        {/* Conditionally render animated border glow based on performance */}
        {!reducedMotion && !isIOSSafari && (
          <motion.div
            className="absolute inset-0 rounded-xl z-0"
            style={{ boxShadow: `0 0 0px ${tech.color}00` }}
            animate={{
              boxShadow: isMobile 
                ? [`0 0 3px ${tech.color}22`, `0 0 5px ${tech.color}33`, `0 0 3px ${tech.color}22`]
                : [`0 0 5px ${tech.color}33`, `0 0 12px ${tech.color}44`, `0 0 5px ${tech.color}33`],
            }}
            transition={{
              duration: pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Icon with optimized animations */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          variants={getIconAnimation(tech.color, isMobile, isTablet, isIOSSafari, reducedMotion)}
          animate={contentReady ? "animate" : ""}
          whileHover={isIOSSafari ? undefined : "hover"}
          // Removed whileTap for mobile/tablet as requested
          {...(!isMobile && !isTablet ? { whileTap: isIOSSafari ? undefined : "hover" } : {})}
          style={{ 
            position: "relative", 
            zIndex: 2, 
            padding: isMobile ? "6px" : "8px",
          }}
        >
          {/* Desktop pulsing background glow - only for desktop with good performance */}
          {!reducedMotion && !isMobile && !isTablet && !isIOSSafari && performanceTier !== "low" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tech.color}33 0%, transparent 70%)`,
                filter: "blur(10px)",
                zIndex: 0,
                transform: "scale(1.5)",
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1.4, 1.6, 1.4],
              }}
              transition={{
                duration: pulseSpeed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          
          {/* Simplified background glow for tablet */}
          {!reducedMotion && isTablet && !isIOSSafari && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tech.color}22 0%, transparent 70%)`,
                filter: "blur(5px)",
                zIndex: 0,
                transform: "scale(1.2)",
                opacity: 0.4,
              }}
            />
          )}

          {/* FIXED: Ensuring icon is visible by adding display block and explicit size */}
          <tech.icon
            className={`${iconSize} relative z-10`}
            style={{ 
              color: tech.color, 
              display: "block",
              fontSize: isTablet ? "2rem" : isMobile ? "1.5rem" : "2.5rem"
            }}
          />
        </motion.div>
        
        {/* Technology name with optimized text effects */}
        <div
          className={`text-center mt-1 sm:mt-2 font-medium ${
            isMobile ? "text-xs" : isTablet ? "text-sm" : "text-base"
          }`}
          style={{
            color: tech.color,
            textShadow: `0 0 ${isMobile ? "4px" : "6px"} ${tech.color}${isMobile ? "33" : "44"}`,
            letterSpacing: "0.5px",
          }}
        >
          {tech.name}
        </div>
      </motion.div>
    );
  },
  // Advanced memo comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.index === nextProps.index &&
      prevProps.hoveredTech === nextProps.hoveredTech &&
      prevProps.isMobile === nextProps.isMobile &&
      prevProps.isTablet === nextProps.isTablet &&
      prevProps.isIOSSafari === nextProps.isIOSSafari &&
      prevProps.reducedMotion === nextProps.reducedMotion &&
      prevProps.contentReady === nextProps.contentReady &&
      prevProps.performanceTier === nextProps.performanceTier
    );
  }
);

export default TechnologyCard;