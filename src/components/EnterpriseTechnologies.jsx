import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  useTheme, 
  alpha, 
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar
} from "@mui/material";
import { 
  Code as CodeIcon,
  Psychology as AIIcon,
  DataObject as DataIcon,
  Web as WebIcon,
  CloudQueue as CloudIcon,
  Storage as DatabaseIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  AutoFixHigh as MagicIcon,
  Timeline as AnalyticsIcon,
  ViewInAr as ThreeDIcon,
  FilterVintage as FilterIcon
} from "@mui/icons-material";
import { useSystemProfile } from "./useSystemProfile";

// Enhanced technology data with proficiency levels and categories
const technologyCategories = [
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    icon: AIIcon,
    color: '#6366f1',
    description: 'Advanced artificial intelligence and deep learning technologies',
    technologies: [
      { name: 'TensorFlow', level: 95, icon: '🔥', description: 'Deep learning framework' },
      { name: 'PyTorch', level: 90, icon: '⚡', description: 'Neural network library' },
      { name: 'Scikit-learn', level: 88, icon: '🔬', description: 'Machine learning toolkit' },
      { name: 'OpenCV', level: 85, icon: '👁️', description: 'Computer vision library' },
      { name: 'Pandas', level: 92, icon: '🐼', description: 'Data manipulation tool' },
      { name: 'NumPy', level: 94, icon: '🔢', description: 'Numerical computing' }
    ]
  },
  {
    id: 'web-dev',
    title: 'Web Development',
    icon: WebIcon,
    color: '#22d3ee',
    description: 'Modern web technologies and frameworks',
    technologies: [
      { name: 'React', level: 92, icon: '⚛️', description: 'JavaScript library' },
      { name: 'Next.js', level: 88, icon: '🚀', description: 'React framework' },
      { name: 'TypeScript', level: 85, icon: '📘', description: 'Typed JavaScript' },
      { name: 'Node.js', level: 87, icon: '🟢', description: 'JavaScript runtime' },
      { name: 'Material-UI', level: 90, icon: '🎨', description: 'React UI library' },
      { name: 'Tailwind CSS', level: 86, icon: '💨', description: 'Utility-first CSS' }
    ]
  },
  {
    id: 'programming',
    title: 'Programming Languages',
    icon: CodeIcon,
    color: '#8b5cf6',
    description: 'Core programming languages and paradigms',
    technologies: [
      { name: 'Python', level: 96, icon: '🐍', description: 'General-purpose language' },
      { name: 'JavaScript', level: 90, icon: '🟨', description: 'Web scripting language' },
      { name: 'Java', level: 82, icon: '☕', description: 'Enterprise language' },
      { name: 'C++', level: 78, icon: '⚙️', description: 'Systems programming' },
      { name: 'SQL', level: 88, icon: '🗄️', description: 'Database query language' },
      { name: 'R', level: 80, icon: '📊', description: 'Statistical computing' }
    ]
  },
  {
    id: 'data-tools',
    title: 'Data & Analytics',
    icon: AnalyticsIcon,
    color: '#10b981',
    description: 'Data science and analytics platforms',
    technologies: [
      { name: 'Jupyter', level: 94, icon: '📓', description: 'Interactive notebooks' },
      { name: 'Matplotlib', level: 87, icon: '📈', description: 'Data visualization' },
      { name: 'Seaborn', level: 85, icon: '🌊', description: 'Statistical plots' },
      { name: 'Plotly', level: 83, icon: '📊', description: 'Interactive charts' },
      { name: 'Tableau', level: 80, icon: '📋', description: 'Business intelligence' },
      { name: 'Power BI', level: 78, icon: '⚡', description: 'Microsoft analytics' }
    ]
  },
  {
    id: 'cloud-devops',
    title: 'Cloud & DevOps',
    icon: CloudIcon,
    color: '#f59e0b',
    description: 'Cloud platforms and development operations',
    technologies: [
      { name: 'AWS', level: 85, icon: '☁️', description: 'Amazon Web Services' },
      { name: 'Docker', level: 82, icon: '🐳', description: 'Containerization' },
      { name: 'Git', level: 93, icon: '🔀', description: 'Version control' },
      { name: 'Linux', level: 88, icon: '🐧', description: 'Operating system' },
      { name: 'Firebase', level: 80, icon: '🔥', description: 'Google cloud platform' },
      { name: 'Heroku', level: 75, icon: '🟣', description: 'Cloud deployment' }
    ]
  }
];

// Floating particle component
const FloatingParticle = ({ delay = 0, duration = 20 }) => {
  const theme = useTheme();
  
  return (
    <motion.div
      style={{
        position: 'absolute',
        width: Math.random() * 6 + 2,
        height: Math.random() * 6 + 2,
        borderRadius: '50%',
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.4
      }}
      animate={{
        x: [0, Math.random() * 200 - 100],
        y: [0, Math.random() * 200 - 100],
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.2, 1]
      }}
      transition={{
        duration: duration + Math.random() * 10,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut"
      }}
    />
  );
};

// Technology card component with enhanced animations
const EnhancedTechnologyCard = ({ tech, index, isHovered, onHover, onLeave, categoryColor }) => {
  const theme = useTheme();
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, threshold: 0.3 });

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      rotateX: -15,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.25, 0.25, 0, 1]
      }
    },
    hover: {
      y: -12,
      rotateX: 5,
      rotateY: 5,
      scale: 1.05,
      transition: {
        duration: 0.3,
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
      whileHover="hover"
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      style={{ 
        height: '100%',
        perspective: '1000px'
      }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.paper, 0.8)}, 
            ${alpha(theme.palette.background.paper, 0.4)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(categoryColor, 0.2)}`,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: `1px solid ${alpha(categoryColor, 0.5)}`,
            boxShadow: `0 20px 40px ${alpha(categoryColor, 0.2)}, 0 0 0 1px ${alpha(categoryColor, 0.1)}`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(categoryColor, 0.1)}, transparent)`,
            transition: 'left 0.6s ease',
            zIndex: 1
          },
          '&:hover::before': {
            left: '100%'
          }
        }}
      >
        {/* Animated background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${alpha(categoryColor, 0.1)} 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(30%, -30%)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translate(20%, -20%) scale(1.2)'
            }
          }}
        />

        <CardContent sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Technology Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(categoryColor, 0.2)}, ${alpha(categoryColor, 0.1)})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                fontSize: '1.5rem',
                border: `2px solid ${alpha(categoryColor, 0.3)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {tech.icon}
              
              {/* Rotating border effect */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: -2,
                  borderRadius: '50%',
                  background: `conic-gradient(from 0deg, ${categoryColor}, transparent, ${categoryColor})`,
                  animation: isHovered ? 'rotate 2s linear infinite' : 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 2,
                    borderRadius: '50%',
                    background: theme.palette.background.paper
                  }
                }}
              />
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: categoryColor, mb: 0.5 }}>
                {tech.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tech.description}
              </Typography>
            </Box>
          </Box>

          {/* Proficiency Level */}
          <Box sx={{ mt: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Proficiency
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: categoryColor }}>
                {tech.level}%
              </Typography>
            </Box>
            
            <Box sx={{ position: 'relative' }}>
              <LinearProgress
                variant="determinate"
                value={tech.level}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(categoryColor, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${categoryColor}, ${alpha(categoryColor, 0.7)})`,
                    borderRadius: 4,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(90deg, transparent, ${alpha('white', 0.3)}, transparent)`,
                      animation: isHovered ? 'shimmer 1.5s ease-in-out infinite' : 'none'
                    }
                  }
                }}
              />
              
              {/* Skill level indicator */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -2,
                  left: `${tech.level}%`,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: categoryColor,
                  border: `2px solid ${theme.palette.background.paper}`,
                  transform: 'translateX(-50%)',
                  boxShadow: `0 2px 8px ${alpha(categoryColor, 0.4)}`,
                  transition: 'all 0.3s ease'
                }}
              />
            </Box>
          </Box>
        </CardContent>

        {/* Hover overlay effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at center, ${alpha(categoryColor, 0.1)}, transparent)`,
                pointerEvents: 'none'
              }}
            />
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

// Category header component
const CategoryHeader = ({ category, index, isVisible }) => {
  const theme = useTheme();
  const Icon = category.icon;

  const headerVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.2,
        ease: [0.25, 0.25, 0, 1]
      }
    }
  };

  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, 
            ${alpha(category.color, 0.1)}, 
            ${alpha(category.color, 0.05)})`,
          border: `1px solid ${alpha(category.color, 0.2)}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background animation */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(category.color, 0.05)}, transparent)`,
            animation: 'gradientShift 8s ease-in-out infinite'
          }}
        />

        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${category.color}, ${alpha(category.color, 0.8)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 3,
            boxShadow: `0 8px 24px ${alpha(category.color, 0.3)}`,
            position: 'relative',
            zIndex: 1
          }}
        >
          <Icon sx={{ fontSize: 32, color: 'white' }} />
        </Box>

        <Box sx={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800, 
              color: category.color,
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' }
            }}
          >
            {category.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {category.description}
          </Typography>
        </Box>

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 2} duration={15 + i * 5} />
        ))}
      </Box>
    </motion.div>
  );
};

const EnterpriseTechnologies = () => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });
  const [hoveredTech, setHoveredTech] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const { scrollYProgress } = useScroll();

  const useReducedMotion = performanceTier === 'low';

  // Parallax effects for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Main container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Box
      component="section"
      id="technologies"
      ref={containerRef}
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.default, 0.9)} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        overflow: 'hidden',
        minHeight: '100vh'
      }}
    >
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          y: backgroundY
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
            animation: !useReducedMotion ? 'float 20s ease-in-out infinite' : 'none'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 70%)`,
            animation: !useReducedMotion ? 'float 25s ease-in-out infinite reverse' : 'none'
          }}
        />
      </motion.div>

      {/* Floating particles */}
      {!useReducedMotion && (
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            y: particleY
          }}
        >
          {[...Array(15)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 3} duration={20 + i * 2} />
          ))}
        </motion.div>
      )}

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
          >
            <Box textAlign="center" mb={{ xs: 8, md: 12 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: 3,
                  p: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.1)}, 
                    ${alpha(theme.palette.secondary.main, 0.1)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <MagicIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="overline" sx={{ fontWeight: 600, letterSpacing: 2 }}>
                  Technical Arsenal
                </Typography>
              </Box>

              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  fontWeight: 900,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 3,
                  lineHeight: 1.1
                }}
              >
                Skills & Tools
              </Typography>

              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ 
                  maxWidth: 800, 
                  mx: 'auto', 
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                A comprehensive toolkit of cutting-edge technologies powering innovation 
                and delivering exceptional digital experiences
              </Typography>
            </Box>
          </motion.div>

          {/* Technology Categories */}
          {technologyCategories.map((category, categoryIndex) => (
            <Box key={category.id} sx={{ mb: 8 }}>
              <CategoryHeader 
                category={category} 
                index={categoryIndex} 
                isVisible={isInView} 
              />

              <Grid container spacing={3}>
                {category.technologies.map((tech, techIndex) => (
                  <Grid size={12} sm={6} md={4} key={tech.name}>
                    <EnhancedTechnologyCard
                      tech={tech}
                      index={techIndex}
                      isHovered={hoveredTech === `${category.id}-${tech.name}`}
                      onHover={() => setHoveredTech(`${category.id}-${tech.name}`)}
                      onLeave={() => setHoveredTech(null)}
                      categoryColor={category.color}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          {/* Summary Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 1, ease: [0.25, 0.25, 0, 1] }}
          >
            <Box
              sx={{
                mt: 8,
                p: 4,
                borderRadius: 4,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.8)}, 
                  ${alpha(theme.palette.background.paper, 0.4)})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                Technology Mastery Overview
              </Typography>
              
              <Grid container spacing={4}>
                <Grid size={6} md={3}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
                    25+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Technologies
                  </Typography>
                </Grid>
                <Grid size={6} md={3}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.secondary.main }}>
                    5
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Categories
                  </Typography>
                </Grid>
                <Grid size={6} md={3}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.success.main }}>
                    90%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Avg Proficiency
                  </Typography>
                </Grid>
                <Grid size={6} md={3}>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.warning.main }}>
                    3+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Years Experience
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      {/* Additional keyframes for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};

export default EnterpriseTechnologies;

