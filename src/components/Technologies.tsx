import { useState, useMemo, memo, useRef, type JSX, type RefObject } from "react";
import { Box, Container, Typography, Chip, alpha, useTheme, useMediaQuery } from "@mui/material";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { technologies, type TechnologyCategory } from "./techData";
import { useSystemProfile } from "./useSystemProfile";

type CategoryFilter = TechnologyCategory | "All";

const CATEGORIES: CategoryFilter[] = ["All", "AI/ML", "Frontend", "Backend", "Other"];

const Technologies = (): JSX.Element => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  
  // Scroll animation setup
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef as RefObject<Element>, { once: true, margin: "-100px" });
  const { performanceTier } = useSystemProfile();
  const shouldReduceMotion = performanceTier === "low";

  const filteredTechnologies = useMemo(() => {
    if (activeCategory === "All") return technologies;
    return technologies.filter((tech) => tech.category === activeCategory);
  }, [activeCategory]);

  // Group technologies by category for display
  const groupedByCategory = useMemo(() => {
    const groups: Record<TechnologyCategory, typeof technologies> = {
      "AI/ML": [],
      Frontend: [],
      Backend: [],
      Other: [],
    };
    
    filteredTechnologies.forEach((tech) => {
      groups[tech.category].push(tech);
    });
    
    return groups;
  }, [filteredTechnologies]);

  const cardSize = isMobile ? 100 : isTablet ? 120 : 140;

  return (
    <Box
      component="section"
      id="technologies"
      ref={sectionRef}
      sx={{
        py: { xs: 10, md: 16 },
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, 
          ${alpha(theme.palette.background.default, 1)} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.background.default, 1)} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="overline"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              letterSpacing: 3,
              mb: 2,
              display: "block",
            }}
          >
            Tech Stack
          </Typography>
          
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Skills & Technologies
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 600,
              mx: "auto",
              mb: 4,
              lineHeight: 1.7,
            }}
          >
            The tools and technologies I use to build intelligent systems and applications
          </Typography>

          {/* Decorative Line */}
          <Box
            sx={{
              width: 48,
              height: 2,
              bgcolor: "primary.main",
              mx: "auto",
              mb: 6,
              borderRadius: 1,
            }}
          />

          {/* Category Filters */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              const count = category === "All" 
                ? technologies.length 
                : technologies.filter(t => t.category === category).length;

              return (
                <Chip
                  key={category}
                  label={`${category} (${count})`}
                  onClick={() => setActiveCategory(category)}
                  sx={{
                    px: 1.5,
                    py: 2.5,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    borderRadius: 2,
                    bgcolor: isActive
                      ? "primary.main"
                      : alpha(theme.palette.background.paper, 0.6),
                    color: isActive ? "primary.contrastText" : "text.primary",
                    border: `1px solid ${
                      isActive
                        ? "transparent"
                        : alpha(theme.palette.divider, 0.1)
                    }`,
                    backdropFilter: "blur(8px)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: isActive
                        ? "primary.dark"
                        : alpha(theme.palette.primary.main, 0.1),
                      transform: "translateY(-2px)",
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
        </motion.div>

        {/* Technologies Grid */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.7, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
        {activeCategory === "All" ? (
          // Show grouped by category
          <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(Object.entries(groupedByCategory) as [TechnologyCategory, typeof technologies][])
              .filter(([, techs]) => techs.length > 0)
              .map(([category, techs]) => (
                <Box key={category} sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 3,
                      color: "text.secondary",
                      display: "inline-block",
                    }}
                  >
                    {category}
                  </Typography>
                  
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: { xs: 2, md: 3 },
                    }}
                  >
                    {techs.map((tech, index) => (
                      <TechCard
                        key={tech.name}
                        tech={tech}
                        index={index}
                        cardSize={cardSize}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
          </Box>
        ) : (
          // Show flat grid for filtered view
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: { xs: 2, md: 3 },
                }}
              >
                {filteredTechnologies.map((tech, index) => (
                  <TechCard
                    key={tech.name}
                    tech={tech}
                    index={index}
                    cardSize={cardSize}
                  />
                ))}
              </Box>
            </motion.div>
          </AnimatePresence>
        )}
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.6, delay: shouldReduceMotion ? 0 : 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
            mt: 8,
            pt: 6,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          {[
            { value: technologies.filter(t => t.category === "AI/ML").length, label: "AI/ML Tools" },
            { value: technologies.filter(t => t.category === "Frontend" || t.category === "Backend").length, label: "Dev Technologies" },
            { value: "3+", label: "Years Experience" },
          ].map((stat, index) => (
            <Box key={index} sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  mb: 0.5,
                }}
              >
                {stat.value}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary" }}
              >
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

// Separate TechCard component - memoized for performance
interface TechCardProps {
  tech: typeof technologies[0];
  index: number;
  cardSize: number;
}

const TechCard = memo(({ tech, index, cardSize }: TechCardProps): JSX.Element => {
  const theme = useTheme();
  const Icon = tech.icon;
  
  // Create wave-like stagger effect based on grid position
  const columns = 6; // Approximate columns in grid
  const row = Math.floor(index / columns);
  const col = index % columns;
  const waveDelay = (row * 0.08) + (col * 0.03); // Wave from top-left

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: waveDelay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -10,
        scale: 1.02,
        transition: { duration: 0.25 }
      }}
      style={{ width: "100%", maxWidth: cardSize }}
    >
      <Box
        sx={{
          width: "100%",
          aspectRatio: "1",
          borderRadius: 3,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          cursor: "pointer",
          transition: "all 0.35s ease",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            bgcolor: alpha(theme.palette.background.paper, 0.85),
            borderColor: alpha(tech.color, 0.4),
            boxShadow: `0 15px 40px ${alpha(tech.color, 0.2)}, 0 0 20px ${alpha(tech.color, 0.1)}`,
            "& .tech-icon": {
              transform: "scale(1.15)",
              filter: `drop-shadow(0 0 12px ${tech.color})`,
            },
            "& .tech-glow": {
              opacity: 0.2,
            },
          },
        }}
      >
        {/* Subtle glow effect on hover */}
        <Box
          className="tech-glow"
          sx={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at center, ${tech.color} 0%, transparent 70%)`,
            opacity: 0,
            transition: "opacity 0.3s ease",
          }}
        />

        {/* Icon */}
        <Box
          className="tech-icon"
          sx={{
            fontSize: { xs: 32, sm: 40, md: 48 },
            color: tech.color,
            transition: "all 0.3s ease",
            mb: 1.5,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Icon />
        </Box>

        {/* Name */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.8rem" },
          }}
        >
          {tech.name}
        </Typography>
      </Box>
    </motion.div>
  );
});

TechCard.displayName = 'TechCard';

export default Technologies;
