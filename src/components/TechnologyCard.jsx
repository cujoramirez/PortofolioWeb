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
    contentReady,
    performanceTier
  }) => {
    // Check if we're on a mobile/tablet device
    const isHandheld = isMobile || isTablet;
    
    // Card dimensions based on device
    const cardSize = isTablet ? "130px" : isMobile ? "110px" : "150px";
    const iconSize = isTablet ? "text-4xl" : isMobile ? "text-3xl" : "text-5xl";
    const paddingSize = isTablet ? "p-3" : isMobile ? "p-2" : "p-4";

    // For desktop: Create animation variants
    const desktopContainerVariants = {
      hidden: { opacity: 0, y: 15 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
      hover: {
        scale: 1.05,
        boxShadow: `0 0 20px 3px ${tech.color}55`,
        transition: { duration: 0.3 }
      }
    };
    
    const desktopIconVariants = {
      animate: {
        y: [-2, 2, -2],
        filter: `drop-shadow(0 0 2px ${tech.color}33)`,
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
        filter: `drop-shadow(0 0 12px ${tech.color})`,
        transition: { duration: 0.3, ease: "easeOut" },
      }
    };

    // MOBILE & TABLET: Render static card with "shiny" appearance
    if (isHandheld || isIOSSafari) {
      return (
        <div
          className={`tech-card-static rounded-xl border-2 ${tech.borderColor} ${paddingSize}
            bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
            flex flex-col items-center justify-center`}
          style={{
            width: '100%',
            maxWidth: cardSize,
            aspectRatio: '1/1',
            boxShadow: `0 0 15px 1px ${tech.color}33, inset 0 0 10px rgba(0,0,0,0.3)`,
            opacity: contentReady ? 1 : 0,
            transition: "opacity 0.3s",
            position: "relative"
          }}
        >
          {/* Static Shine Effect */}
          <div 
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{
              background: `linear-gradient(120deg, transparent 30%, ${tech.color}20 38%, ${tech.color}30 42%, transparent 50%)`,
              pointerEvents: "none"
            }}
          />
          
          {/* Static Icon with Built-in Glow */}
          <div 
            className="relative flex-1 flex items-center justify-center"
            style={{ 
              position: "relative",
              zIndex: 2,
              padding: isMobile ? "6px" : "8px",
            }}
          >
            {/* Static Glow Effect */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${tech.color}22 0%, transparent 70%)`,
                opacity: 0.6,
                transform: "scale(1.2)",
              }}
            />
            
            {/* Icon */}
            <tech.icon
              className={`${iconSize} relative z-10`}
              style={{ 
                color: tech.color, 
                filter: `drop-shadow(0 0 3px ${tech.color}66)`,
                display: "block",
                fontSize: isTablet ? "2rem" : isMobile ? "1.5rem" : "2.5rem"
              }}
            />
          </div>
          
          {/* Name Label */}
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
    
    // DESKTOP: Render fully animated version
    return (
      <motion.div
        className={`tech-card relative rounded-xl border-2 ${tech.borderColor} ${paddingSize}
          bg-gradient-to-br from-neutral-900/80 to-neutral-900/40
          flex flex-col items-center justify-center`}
        variants={desktopContainerVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        style={{
          width: '100%',
          maxWidth: cardSize,
          aspectRatio: '1/1',
          boxShadow:
            hoveredTech === index
              ? `0 0 20px 3px ${tech.color}55`
              : `0 0 25px rgba(0, 0, 0, 0.4)`,
          transformOrigin: "center",
          opacity: contentReady ? 1 : 0,
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
        {/* Desktop animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-xl z-0"
          animate={{
            boxShadow: [
              `0 0 5px ${tech.color}33`, 
              `0 0 12px ${tech.color}44`, 
              `0 0 5px ${tech.color}33`
            ],
          }}
          transition={{
            duration: tech.pulseSpeed,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Icon with animations */}
        <motion.div
          className="relative flex-1 flex items-center justify-center"
          variants={desktopIconVariants}
          animate="animate"
          whileHover="hover"
          style={{ 
            position: "relative",
            zIndex: 2,
            padding: "8px",
          }}
        >
          {/* Desktop pulsing background glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${tech.color}33 0%, transparent 70%)`,
              zIndex: 0,
              transform: "scale(1.5)",
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1.4, 1.6, 1.4],
            }}
            transition={{
              duration: tech.pulseSpeed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <tech.icon
            className="text-5xl relative z-10"
            style={{ 
              color: tech.color, 
              display: "block",
              fontSize: "2.5rem"
            }}
          />
        </motion.div>
        
        {/* Technology name */}
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
      </motion.div>
    );
  },
  // Only re-render when needed
  (prevProps, nextProps) => {
    // For mobile/tablet, we only need to check content ready state
    if (prevProps.isMobile || prevProps.isTablet || prevProps.isIOSSafari) {
      return prevProps.contentReady === nextProps.contentReady;
    }
    
    // For desktop, check hover state too
    return (
      prevProps.contentReady === nextProps.contentReady &&
      prevProps.hoveredTech === nextProps.hoveredTech &&
      (prevProps.index === nextProps.hoveredTech) === (prevProps.hoveredTech === prevProps.index)
    );
  }
);

export default TechnologyCard;
