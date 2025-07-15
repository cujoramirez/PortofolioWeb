import React, { useRef, useState, useCallback, useMemo } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from "@mui/material";
import { 
  Code,
  Psychology,
  Speed,
  Star,
  TrendingUp,
  Lightbulb
} from "@mui/icons-material";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import { technologies } from "./techData.jsx";
import EnterpriseMotion from "./animations/EnterpriseMotion.jsx";

// Enhanced technology card component
const ModernTechCard = ({ tech, index, isHovered, onHover, onHoverEnd, shouldReduceMotion }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });
  
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      filter: `drop-shadow(0 0 8px ${tech.color}40)`
    },
    hover: {
      scale: 1.2,
      rotate: [0, -10, 10, 0],
      filter: `drop-shadow(0 0 20px ${tech.color}80)`,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  const glowVariants = {
    idle: {
      opacity: 0.3,
      scale: 1
    },
    hover: {
      opacity: 0.8,
      scale: 1.3,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={shouldReduceMotion ? {} : { y: -8, scale: 1.05 }}
      onHoverStart={() => !shouldReduceMotion && onHover(index)}
      onHoverEnd={() => !shouldReduceMotion && onHoverEnd()}
    >
      <Card
        sx={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.02)',
          // backdropFilter: 'blur(20px)', // Removed
          border: `1px solid ${tech.color}30`,
          borderRadius: '1.5rem',
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: `${tech.color}60`,
            boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px ${tech.color}40`,
          }
        }}
      >
        {/* Animated background glow */}
        <motion.div
          variants={glowVariants}
          initial="idle"
          animate={isHovered ? "hover" : "idle"}
          style={{
            position: 'absolute',
            inset: -20,
            background: `radial-gradient(circle, ${tech.color}20 0%, transparent 70%)`,
            borderRadius: '50%',
            // filter: 'blur(20px)', // Removed
            zIndex: 0
          }}
        />
        
        {/* Icon container */}
        <Box sx={{ position: 'relative', zIndex: 2, mb: 2 }}>
          <motion.div
            variants={iconVariants}
            initial="idle"
            animate={isHovered ? "hover" : "idle"}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${tech.color}20, ${tech.color}40)`,
                border: `2px solid ${tech.color}60`,
                mb: 2
              }}
            >
              <tech.icon 
                sx={{ 
                  fontSize: '2.5rem', 
                  color: tech.color 
                }} 
              />
            </Avatar>
          </motion.div>
        </Box>
        
        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              mb: 1,
              color: tech.color,
              textShadow: `0 0 10px ${tech.color}40`
            }}
          >
            {tech.name}
          </Typography>
          
          {/* Skill level indicator */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mb: 2 }}>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { 
                  opacity: i < Math.floor(Math.random() * 2) + 4 ? 1 : 0.3, 
                  scale: 1 
                } : {}}
                transition={{ delay: index * 0.1 + i * 0.1 }}
              >
                <Star 
                  sx={{ 
                    fontSize: '1rem', 
                    color: tech.color,
                    filter: `drop-shadow(0 0 2px ${tech.color}60)`
                  }} 
                />
              </motion.div>
            ))}
          </Box>
          
          {/* Experience badge */}
          <Chip
            label={`${Math.floor(Math.random() * 3) + 2}+ years`}
            size="small"
            sx={{
              background: `${tech.color}20`,
              color: tech.color,
              border: `1px solid ${tech.color}40`,
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {/* Pulse animation for popular techs */}
        {['React', 'Python', 'TensorFlow'].includes(tech.name) && (
          <motion.div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 3
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <TrendingUp 
              sx={{ 
                fontSize: '1.25rem', 
                color: '#10b981',
                filter: 'drop-shadow(0 0 4px #10b98160)'
              }} 
            />
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

// Floating particles for background
const TechParticles = ({ shouldReduceMotion }) => {
  if (shouldReduceMotion) return null;

  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {technologies.slice(0, 8).map((tech, i) => (
        <motion.div
          key={tech.name}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: tech.color,
            //            // filter: `blur(1px)`, // Removed// Removed
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2
          }}
        />
      ))}
    </Box>
  );
};

// Stats component
const TechStats = () => {
  const stats = [
    { label: "Technologies", value: technologies.length, icon: Code, color: "#6366f1" },
    { label: "Years Experience", value: 3, icon: Speed, color: "#22d3ee" },
    { label: "Projects Built", value: 15, icon: Lightbulb, color: "#10b981" },
    { label: "Skills Mastered", value: 8, icon: Psychology, color: "#8b5cf6" },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      {stats.map((stat, index) => (
        <Grid xs={6} md={3} key={stat.label}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                // backdropFilter: 'blur(20px)', // Removed
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                p: 2,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${stat.color}, ${stat.color}aa)`,
                }
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: `${stat.color}20`,
                  border: `2px solid ${stat.color}40`,
                  mx: 'auto',
                  mb: 1
                }}
              >
                <stat.icon sx={{ color: stat.color }} />
              </Avatar>
              
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: stat.color,
                  mb: 0.5
                }}
              >
                {stat.value}+
              </Typography>
              
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: 1
                }}
              >
                {stat.label}
              </Typography>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

const ModernTechnologies = () => {
  const [hoveredTech, setHoveredTech] = useState(null);
  const { performanceTier, deviceType } = useSystemProfile();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const shouldReduceMotion = performanceTier === "low" || isMobile;
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const handleTechHover = useCallback((index) => {
    setHoveredTech(index);
  }, []);

  const handleTechHoverEnd = useCallback(() => {
    setHoveredTech(null);
  }, []);

  // Memoized tech categories
  const techCategories = useMemo(() => {
    const categories = {};
    technologies.forEach(tech => {
      const category = getCategory(tech.name);
      if (!categories[category]) categories[category] = [];
      categories[category].push(tech);
    });
    return categories;
  }, []);

  function getCategory(techName) {
    const categories = {
      'Frontend': ['HTML', 'CSS', 'React'],
      'Backend': ['Python', 'C'],
      'AI/ML': ['PyTorch', 'TensorFlow', 'Kaggle'],
      'Science': ['Physics', 'Statistics']
    };
    
    for (const [category, techs] of Object.entries(categories)) {
      if (techs.includes(techName)) return category;
    }
    return 'Other';
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="technologies"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3Cpath d="M30 1v28m0 2v28M1 30h28m2 0h28"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }}
    >
      {/* Background particles */}
      <TechParticles shouldReduceMotion={shouldReduceMotion} />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
        <EnterpriseMotion.TechContainer>
          {/* Section Header */}
          <EnterpriseMotion.TechTitle>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip
                icon={<Code />}
                label="Technologies & Skills"
                sx={{
                  mb: 3,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(34, 211, 238, 0.2))',
                  // backdropFilter: 'blur(10px)', // Removed
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
              
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2,
                }}
              >
                Technical 
                <br />
                <span style={{ color: '#22d3ee' }}>Expertise</span>
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  color: 'text.secondary',
                  maxWidth: '600px',
                  mx: 'auto',
                  mb: 4
                }}
              >
                Mastering cutting-edge technologies to build intelligent systems and solve complex problems
              </Typography>
              
              <Box
                sx={{
                  width: 100,
                  height: 4,
                  background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                  borderRadius: 2,
                  mx: 'auto'
                }}
              />
            </Box>
          </EnterpriseMotion.TechTitle>

          {/* Stats Section */}
          <TechStats />

          {/* Technologies Grid */}
          <Grid container spacing={3}>
            {technologies.map((tech, index) => (
              <Grid xs={6} sm={4} md={3} lg={2.4} key={tech.name}>
                <ModernTechCard
                  tech={tech}
                  index={index}
                  isHovered={hoveredTech === index}
                  onHover={handleTechHover}
                  onHoverEnd={handleTechHoverEnd}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </Grid>
            ))}
          </Grid>

          {/* Technology Categories */}
          <motion.div
            variants={headerVariants}
            style={{ marginTop: '4rem' }}
          >
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 600,
                mb: 4,
                color: 'primary.main'
              }}
            >
              Skill Categories
            </Typography>
            
            <Grid container spacing={2} justifyContent="center">
              {Object.entries(techCategories).map(([category, techs]) => (
                <Grid key={category}>
                  <motion.div
                    whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -4 }}
                  >
                    <Chip
                      label={`${category} (${techs.length})`}
                      sx={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'primary.main',
                        fontWeight: 500,
                        px: 2,
                        py: 1,
                        fontSize: '0.9rem',
                        '&:hover': {
                          background: 'rgba(99, 102, 241, 0.2)',
                          boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </EnterpriseMotion.TechContainer>
      </Container>
    </Box>
  );
};

export default ModernTechnologies;

