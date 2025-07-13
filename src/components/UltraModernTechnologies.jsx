import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from "framer-motion";
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
  Avatar,
  Paper,
  useMediaQuery
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
  AutoAwesome,
  Rocket,
  Science,
  Computer,
  Memory,
  Architecture,
  BuildCircle,
  Category
} from "@mui/icons-material";
import { useSystemProfile } from "./useSystemProfile";
import LightEffects from './LightEffects';

// Enhanced technology categories with 3D icons and animations
const techCategories = [
  {
    id: 'ai-ml',
    title: 'Artificial Intelligence & Machine Learning',
    icon: AIIcon,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Cutting-edge AI and ML technologies for intelligent solutions',
    technologies: [
      { name: 'TensorFlow', level: 95, color: '#ff6f00', experience: '3+ years' },
      { name: 'PyTorch', level: 90, color: '#ee4c2c', experience: '2+ years' },
      { name: 'Scikit-learn', level: 88, color: '#f7931e', experience: '3+ years' },
      { name: 'OpenCV', level: 85, color: '#5c3ee8', experience: '2+ years' },
      { name: 'Hugging Face', level: 82, color: '#ffd21e', experience: '1+ years' },
      { name: 'LangChain', level: 78, color: '#2d5be3', experience: '1+ years' }
    ]
  },
  {
    id: 'programming',
    title: 'Programming Languages',
    icon: CodeIcon,
    color: '#22d3ee',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Modern programming languages for scalable applications',
    technologies: [
      { name: 'Python', level: 95, color: '#3776ab', experience: '4+ years' },
      { name: 'JavaScript', level: 88, color: '#f7df1e', experience: '3+ years' },
      { name: 'TypeScript', level: 85, color: '#3178c6', experience: '2+ years' },
      { name: 'C++', level: 80, color: '#00599c', experience: '2+ years' },
      { name: 'Java', level: 75, color: '#ed8b00', experience: '2+ years' },
      { name: 'Go', level: 70, color: '#00add8', experience: '1+ years' }
    ]
  },
  {
    id: 'web-frontend',
    title: 'Web Development & Frontend',
    icon: WebIcon,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Modern frontend technologies and frameworks',
    technologies: [
      { name: 'React', level: 90, color: '#61dafb', experience: '3+ years' },
      { name: 'Next.js', level: 85, color: '#000000', experience: '2+ years' },
      { name: 'Vue.js', level: 82, color: '#4fc08d', experience: '2+ years' },
      { name: 'Tailwind CSS', level: 88, color: '#06b6d4', experience: '2+ years' },
      { name: 'Material-UI', level: 85, color: '#0081cb', experience: '2+ years' },
      { name: 'Framer Motion', level: 80, color: '#0055ff', experience: '1+ years' }
    ]
  },
  {
    id: 'data-analytics',
    title: 'Data Science & Analytics',
    icon: AnalyticsIcon,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Data processing, analysis, and visualization tools',
    technologies: [
      { name: 'Pandas', level: 92, color: '#150458', experience: '3+ years' },
      { name: 'NumPy', level: 90, color: '#013243', experience: '3+ years' },
      { name: 'Matplotlib', level: 85, color: '#11557c', experience: '3+ years' },
      { name: 'Seaborn', level: 83, color: '#4c72b0', experience: '2+ years' },
      { name: 'Plotly', level: 80, color: '#3f4f75', experience: '2+ years' },
      { name: 'Jupyter', level: 88, color: '#f37626', experience: '3+ years' }
    ]
  },
  {
    id: 'cloud-tools',
    title: 'Cloud & DevOps Tools',
    icon: CloudIcon,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: 'Modern cloud platforms and development tools',
    technologies: [
      { name: 'Docker', level: 85, color: '#2496ed', experience: '2+ years' },
      { name: 'AWS', level: 80, color: '#ff9900', experience: '2+ years' },
      { name: 'Git', level: 90, color: '#f05032', experience: '4+ years' },
      { name: 'VS Code', level: 95, color: '#007acc', experience: '4+ years' },
      { name: 'Linux', level: 85, color: '#fcc624', experience: '3+ years' },
      { name: 'Kubernetes', level: 70, color: '#326ce5', experience: '1+ years' }
    ]
  }
];

// 3D Floating Tech Card Component
const FloatingTechCard = ({ tech, index, categoryColor, onHover, onLeave }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
          setMousePosition({ x: x * 15, y: y * 15 });
        }
      };

      const element = ref.current;
      if (element) {
        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', () => setMousePosition({ x: 0, y: 0 }));
      }

      return () => {
        if (element) {
          element.removeEventListener('mousemove', handleMouseMove);
          element.removeEventListener('mouseleave', () => setMousePosition({ x: 0, y: 0 }));
        }
      };
    }
  }, [isMobile]);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 };
  const x = useSpring(mousePosition.x, springConfig);
  const y = useSpring(mousePosition.y, springConfig);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { delay: index * 0.1, duration: 0.6 }
      } : {}}
      style={{
        x: isMobile ? 0 : x,
        y: isMobile ? 0 : y,
        rotateX: isMobile ? 0 : useTransform(y, [-15, 15], [5, -5]),
        rotateY: isMobile ? 0 : useTransform(x, [-15, 15], [-5, 5]),
        perspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover && onHover(tech);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onLeave && onLeave();
      }}
    >
      <Card
        sx={{
          background: isHovered 
            ? `linear-gradient(135deg, ${alpha(categoryColor, 0.2)}, ${alpha(tech.color, 0.1)})`
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: isHovered 
            ? `1px solid ${tech.color}` 
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transformStyle: 'preserve-3d',
          '&:hover': {
            boxShadow: `0 25px 50px ${alpha(tech.color, 0.3)}`,
            transform: isMobile ? 'translateY(-5px)' : 'translateZ(20px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: `conic-gradient(from 180deg, transparent, ${alpha(tech.color, 0.3)}, transparent)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
            borderRadius: '20px',
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha(tech.color, 0.4)}, transparent)`,
            transition: 'left 0.6s ease',
            ...(isHovered && { left: '100%' })
          }
        }}
      >
        {/* Animated Progress Ring */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `conic-gradient(${tech.color} ${tech.level * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 4,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.8)',
            }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: 'relative',
              color: tech.color,
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          >
            {tech.level}%
          </Typography>
        </Box>

        {/* Tech Icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(tech.color, 0.2)}, ${alpha(tech.color, 0.1)})`,
            border: `1px solid ${alpha(tech.color, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at center, ${alpha(tech.color, 0.3)}, transparent)`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: tech.color,
              fontWeight: 'bold',
              fontSize: '1.5rem',
              position: 'relative',
              textShadow: `0 0 20px ${tech.color}`,
            }}
          >
            {tech.name.slice(0, 2)}
          </Typography>
        </Box>

        {/* Tech Info */}
        <Typography
          variant="h6"
          sx={{
            color: 'white',
            fontWeight: 600,
            mb: 1,
            fontSize: '1.1rem'
          }}
        >
          {tech.name}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            fontSize: '0.85rem'
          }}
        >
          {tech.experience}
        </Typography>

        {/* Animated Skill Bar */}
        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={isInView ? tech.level : 0}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${tech.color}, ${alpha(tech.color, 0.7)})`,
                boxShadow: `0 0 20px ${alpha(tech.color, 0.5)}`,
                transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              }
            }}
          />
        </Box>

        {/* Floating Particles */}
        {!isMobile && isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-current rounded-full"
                style={{
                  color: tech.color,
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                }}
              />
            ))}
          </>
        )}
      </Card>
    </motion.div>
  );
};

// Category Header Component
const CategoryHeader = ({ category, index, isActive, onClick }) => {
  const theme = useTheme();
  const IconComponent = category.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        sx={{
          background: isActive 
            ? `linear-gradient(135deg, ${alpha(category.color, 0.3)}, ${alpha(category.color, 0.1)})`
            : 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: isActive 
            ? `1px solid ${category.color}` 
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          p: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(category.color, 0.2)}, ${alpha(category.color, 0.05)})`,
            border: `1px solid ${alpha(category.color, 0.6)}`,
            boxShadow: `0 10px 30px ${alpha(category.color, 0.2)}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: isActive ? 0 : '-100%',
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, ${category.color}, transparent)`,
            transition: 'left 0.3s ease',
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${alpha(category.color, 0.2)}, ${alpha(category.color, 0.1)})`,
              border: `1px solid ${alpha(category.color, 0.3)}`,
            }}
          >
            <IconComponent sx={{ color: category.color, fontSize: 24 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 600,
                fontSize: '1.1rem',
                mb: 0.5
              }}
            >
              {category.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.85rem'
              }}
            >
              {category.description}
            </Typography>
          </Box>
          <Chip
            label={category.technologies.length}
            size="small"
            sx={{
              background: category.color,
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>
      </Card>
    </motion.div>
  );
};

// Main Component
const UltraModernTechnologies = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const { performanceTier } = useSystemProfile();
  
  const [activeCategory, setActiveCategory] = useState(techCategories[0]);
  const [hoveredTech, setHoveredTech] = useState(null);
  const hoveredTechRef = useRef(null);
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const headerScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  // Update hovered tech ref
  useEffect(() => {
    hoveredTechRef.current = hoveredTech;
  }, [hoveredTech]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="technologies"
      sx={{
        minHeight: '100vh',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        // Mobile scrolling fixes
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y'
      }}
    >
      {/* Enhanced Background with LightEffects */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: -2
        }}
      >
        <LightEffects 
          hoveredTech={hoveredTech} 
          hoveredTechRef={hoveredTechRef}
        />
      </Box>

      {/* Dynamic Gradient Background */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 30% 20%, ${alpha(activeCategory.color, 0.15)} 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, ${alpha(activeCategory.color, 0.1)} 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)
          `,
          y: backgroundY,
          zIndex: -1
        }}
      />

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Enhanced Header */}
          <motion.div 
            variants={itemVariants}
            style={{ scale: headerScale }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${activeCategory.color}, #8b5cf6, #22d3ee)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  mb: 2,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '4px',
                    background: `linear-gradient(90deg, ${activeCategory.color}, #8b5cf6)`,
                    borderRadius: '2px',
                    animation: performanceTier !== 'low' ? 'expandWidth 2s ease-out' : 'none'
                  }
                }}
              >
                Skills & Tools
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 400,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Cutting-edge technologies powering innovative solutions
              </Typography>
            </Box>
          </motion.div>

          {/* Category Navigation */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: { xs: 4, md: 6 } }}>
              <Grid container spacing={2}>
                {techCategories.map((category, index) => (
                  <Grid 
                    item
                    xs={12} 
                    sm={6} 
                    md={4} 
                    lg={2.4}
                    key={category.id}
                  >
                    <CategoryHeader
                      category={category}
                      index={index}
                      isActive={activeCategory.id === category.id}
                      onClick={() => setActiveCategory(category)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>

          {/* Technologies Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {activeCategory.technologies.map((tech, index) => (
                  <Grid 
                    item
                    xs={12} 
                    sm={6} 
                    md={4} 
                    lg={3}
                    key={tech.name}
                  >
                    <FloatingTechCard
                      tech={tech}
                      index={index}
                      categoryColor={activeCategory.color}
                      onHover={setHoveredTech}
                      onLeave={() => setHoveredTech(null)}
                    />
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </AnimatePresence>

          {/* Statistics Bar */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mt: { xs: 6, md: 8 }, textAlign: 'center' }}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  p: 4,
                  display: 'inline-block'
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h4" sx={{ color: activeCategory.color, fontWeight: 'bold' }}>
                      25+
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Technologies
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h4" sx={{ color: '#22d3ee', fontWeight: 'bold' }}>
                      4+
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Years Experience
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                      15+
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Projects Built
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Box>
          </motion.div>
        </motion.div>
      </Container>

      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes expandWidth {
          0% { width: 0; }
          100% { width: 120px; }
        }
        
        @keyframes morphBackground {
          0%, 100% { 
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          50% { 
            background-position: 100% 50%;
            filter: hue-rotate(180deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default UltraModernTechnologies;
