import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  Box as ThreeBox, 
  Octahedron,
  Icosahedron,
  MeshDistortMaterial, 
  Float, 
  Text3D, 
  Center,
  Environment,
  PerspectiveCamera,
  OrbitControls
} from '@react-three/drei';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import { 
  Psychology,
  Code,
  School,
  EmojiEvents,
  TrendingUp,
  Science,
  AutoAwesome,
  Insights,
  Rocket,
  Favorite,
  Star,
  Timeline,
  Speed,
  Lightbulb,
  DataObject,
  Memory,
  Hub,
  Analytics,
  SmartToy,
  Computer,
  Storage,
  Api
} from '@mui/icons-material';
import * as THREE from 'three';
import EnterpriseMotion from './animations/EnterpriseMotion.jsx';

// Enhanced Skills Data with 3D models and colors
const skillsData = [
  { 
    name: "Machine Learning", 
    level: 95, 
    color: "#6366f1", 
    icon: Psychology,
    category: "AI/ML",
    description: "Advanced ML algorithms and model optimization",
    technologies: ["TensorFlow", "PyTorch", "Scikit-learn", "XGBoost"],
    shape: "sphere",
    complexity: "expert"
  },
  { 
    name: "Deep Learning", 
    level: 90, 
    color: "#8b5cf6", 
    icon: SmartToy,
    category: "AI/ML",
    description: "Neural networks and deep architectures",
    technologies: ["CNN", "RNN", "Transformers", "GANs"],
    shape: "octahedron",
    complexity: "expert"
  },
  { 
    name: "Computer Vision", 
    level: 88, 
    color: "#22d3ee", 
    icon: Insights,
    category: "AI/ML",
    description: "Image processing and visual recognition",
    technologies: ["OpenCV", "YOLO", "ResNet", "Vision API"],
    shape: "icosahedron",
    complexity: "expert"
  },
  { 
    name: "Python", 
    level: 92, 
    color: "#3776ab", 
    icon: Code,
    category: "Programming",
    description: "Advanced Python development and optimization",
    technologies: ["FastAPI", "Django", "NumPy", "Pandas"],
    shape: "box",
    complexity: "expert"
  },
  { 
    name: "Data Science", 
    level: 90, 
    color: "#10b981", 
    icon: Analytics,
    category: "Data",
    description: "Statistical analysis and data visualization",
    technologies: ["Pandas", "Matplotlib", "Seaborn", "Plotly"],
    shape: "sphere",
    complexity: "expert"
  },
  { 
    name: "Cloud Computing", 
    level: 85, 
    color: "#f59e0b", 
    icon: Storage,
    category: "Infrastructure",
    description: "Scalable cloud solutions and deployment",
    technologies: ["AWS", "GCP", "Docker", "Kubernetes"],
    shape: "octahedron",
    complexity: "advanced"
  },
  { 
    name: "API Development", 
    level: 88, 
    color: "#ef4444", 
    icon: Api,
    category: "Backend",
    description: "RESTful and GraphQL API design",
    technologies: ["FastAPI", "GraphQL", "REST", "WebSocket"],
    shape: "box",
    complexity: "expert"
  },
  { 
    name: "Database Systems", 
    level: 82, 
    color: "#14b8a6", 
    icon: Storage,
    category: "Data",
    description: "Database design and optimization",
    technologies: ["PostgreSQL", "MongoDB", "Redis", "Elasticsearch"],
    shape: "icosahedron",
    complexity: "advanced"
  }
];

// 3D Skill Shape Component
const SkillShape = ({ skill, position, isActive, onHover, onLeave }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Base rotation
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.05;
      
      // Hover effects
      if (hovered || isActive) {
        meshRef.current.scale.setScalar(0.9 + Math.sin(time * 3) * 0.1);
        meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.1;
      } else {
        meshRef.current.scale.setScalar(0.7);
        meshRef.current.position.y = position[1];
      }
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover(skill);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onLeave();
  };

  const getGeometry = () => {
    switch (skill.shape) {
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'octahedron':
        return <octahedronGeometry args={[0.8]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[0.8]} />;
      default:
        return <sphereGeometry args={[0.8, 32, 32]} />;
    }
  };

  return (
    <Float
      speed={2}
      rotationIntensity={hovered ? 1 : 0.5}
      floatIntensity={hovered ? 1 : 0.5}
      position={position}
    >
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {getGeometry()}
        <MeshDistortMaterial
          color={skill.color}
          attach="material"
          distort={hovered ? 0.6 : 0.3}
          speed={hovered ? 3 : 1}
          roughness={0.1}
          metalness={0.8}
          emissive={skill.color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </mesh>
    </Float>
  );
};

// Particle Field for Skills
const SkillsParticleField = ({ activeSkill }) => {
  const pointsRef = useRef();
  const particleCount = 800;
  
  const particles = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      // Position in sphere
      const radius = 5 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Colors based on active skill
      const color = new THREE.Color(activeSkill?.color || '#6366f1');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, [activeSkill]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += 0.0005;
      pointsRef.current.rotation.y += 0.001;
      
      // Update colors based on active skill
      if (activeSkill) {
        const colors = pointsRef.current.geometry.attributes.color.array;
        const color = new THREE.Color(activeSkill.color);
        
        for (let i = 0; i < particleCount; i++) {
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        }
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
      }
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Main 3D Skills Scene
const SkillsScene = ({ skills, activeSkill, onSkillHover, onSkillLeave }) => {
  const { camera } = useThree();
  
  // Arrange skills in 3D space
  const skillPositions = React.useMemo(() => {
    const positions = [];
    const radius = 4;
    const angleStep = (Math.PI * 2) / skills.length;
    
    skills.forEach((skill, index) => {
      const angle = index * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2;
      positions.push([x, y, z]);
    });
    
    return positions;
  }, [skills]);

  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 8;
    camera.position.z = Math.cos(state.clock.elapsedTime * 0.1) * 8;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 8]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#6366f1" />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#22d3ee" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#8b5cf6"
      />

      <Environment preset="night" />
      
      {/* Particle Field */}
      <SkillsParticleField activeSkill={activeSkill} />
      
      {/* Skill Shapes */}
      {skills.map((skill, index) => (
        <SkillShape
          key={skill.name}
          skill={skill}
          position={skillPositions[index]}
          isActive={activeSkill?.name === skill.name}
          onHover={onSkillHover}
          onLeave={onSkillLeave}
        />
      ))}
      
      {/* Center Holographic Text */}
      {activeSkill && (
        <Center position={[0, -2, 0]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={0.3}
            height={0.05}
            curveSegments={12}
            bevelEnabled
            bevelThickness={0.01}
            bevelSize={0.01}
          >
            {activeSkill.name}
            <meshPhysicalMaterial
              color={activeSkill.color}
              emissive={activeSkill.color}
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </Text3D>
        </Center>
      )}
    </>
  );
};

// Enhanced Skill Card Component
const EnhancedSkillCard = ({ skill, isActive, onHover, onLeave }) => {
  const cardRef = useRef();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      mouseX.set(x);
      mouseY.set(y);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    onLeave();
  };

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      whileHover={{ scale: 1.05, z: 50 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => onHover(skill)}
    >
      <Card
        sx={{
          background: isActive 
            ? `linear-gradient(135deg, ${skill.color}40, ${skill.color}20)`
            : `linear-gradient(135deg, ${skill.color}20, ${skill.color}10)`,
          backdropFilter: 'blur(20px)',
          border: isActive 
            ? `2px solid ${skill.color}` 
            : `1px solid ${skill.color}40`,
          borderRadius: '20px',
          p: 3,
          height: '300px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          '&:hover': {
            boxShadow: `0 25px 50px ${skill.color}30`,
            '& .skill-icon': {
              transform: 'scale(1.2) rotateY(180deg)',
            },
            '& .tech-chips': {
              opacity: 1,
              transform: 'translateY(0)',
            }
          }
        }}
      >
        {/* Animated Background */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at center, ${skill.color}20, transparent)`,
            opacity: isActive ? 1 : 0,
          }}
          animate={{
            scale: isActive ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Skill Icon */}
        <Box
          className="skill-icon"
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            transition: 'transform 0.5s ease',
            transformStyle: 'preserve-3d',
          }}
        >
          <skill.icon sx={{ 
            color: skill.color, 
            fontSize: '2.5rem',
            filter: `drop-shadow(0 4px 12px ${skill.color}60)`,
          }} />
        </Box>
        
        {/* Content */}
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
          {/* Category Badge */}
          <Chip
            label={skill.category}
            size="small"
            sx={{
              background: `${skill.color}30`,
              color: skill.color,
              border: `1px solid ${skill.color}50`,
              fontWeight: 600,
              mb: 2,
              alignSelf: 'flex-start',
            }}
          />
          
          {/* Skill Name */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 1,
              fontSize: '1.3rem',
            }}
          >
            {skill.name}
          </Typography>
          
          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2,
              lineHeight: 1.6,
            }}
          >
            {skill.description}
          </Typography>
          
          {/* Progress Bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Proficiency
              </Typography>
              <Typography variant="caption" sx={{ color: skill.color, fontWeight: 700 }}>
                {skill.level}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={skill.level}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${skill.color}, ${skill.color}cc)`,
                  borderRadius: 3,
                  boxShadow: isActive ? `0 0 20px ${skill.color}60` : 'none',
                }
              }}
            />
          </Box>
          
          {/* Technology Chips */}
          <Box
            className="tech-chips"
            sx={{
              mt: 'auto',
              opacity: 0,
              transform: 'translateY(20px)',
              transition: 'all 0.3s ease',
            }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {skill.technologies.slice(0, 3).map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: `${skill.color}60`,
                    color: skill.color,
                    fontSize: '0.7rem',
                    height: 24,
                    '&:hover': {
                      backgroundColor: `${skill.color}20`,
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        </CardContent>
        
        {/* Complexity Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            gap: 0.5,
          }}
        >
          {[...Array(skill.complexity === 'expert' ? 5 : 4)].map((_, i) => (
            <Star
              key={i}
              sx={{
                fontSize: '0.8rem',
                color: skill.color,
                opacity: 0.8,
              }}
            />
          ))}
        </Box>
      </Card>
    </motion.div>
  );
};

// Main Enhanced Skills Component
const EnhancedSkills = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef();
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });
  
  const [activeSkill, setActiveSkill] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(skillsData.map(skill => skill.category))];
  
  const filteredSkills = selectedCategory === 'All' 
    ? skillsData 
    : skillsData.filter(skill => skill.category === selectedCategory);

  const handleSkillHover = (skill) => {
    setActiveSkill(skill);
  };

  const handleSkillLeave = () => {
    setActiveSkill(null);
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="skills"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #0f172a 70%, #1e293b 100%)',
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
        <EnterpriseMotion.AboutContainer>
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '5rem', lg: '6rem' },
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                Technical <Box component="span" sx={{ color: 'white' }}>Skills</Box>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  maxWidth: '600px',
                  mx: 'auto',
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                Expertise across the full spectrum of AI/ML technologies and modern development practices
              </Typography>
              
              <Box
                sx={{
                  width: 120,
                  height: 6,
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)',
                  borderRadius: 3,
                  mx: 'auto'
                }}
              />
            </Box>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6, flexWrap: 'wrap', gap: 2 }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(category)}
                  sx={{
                    px: 3,
                    py: 1,
                    fontSize: '1rem',
                    fontWeight: 600,
                    background: selectedCategory === category 
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: selectedCategory === category ? 'white' : 'rgba(255, 255, 255, 0.8)',
                    border: selectedCategory === category 
                      ? '2px solid #6366f1' 
                      : '1px solid rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: selectedCategory === category 
                        ? 'linear-gradient(135deg, #8b5cf6, #22d3ee)' 
                        : 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
                    }
                  }}
                />
              ))}
            </Box>
          </motion.div>

          {/* 3D Skills Scene */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <Box
                sx={{
                  height: '400px',
                  mb: 8,
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Canvas
                  camera={{ position: [0, 2, 8], fov: 75 }}
                  gl={{ antialias: true, alpha: true }}
                >
                  <Suspense fallback={null}>
                    <SkillsScene
                      skills={filteredSkills}
                      activeSkill={activeSkill}
                      onSkillHover={handleSkillHover}
                      onSkillLeave={handleSkillLeave}
                    />
                  </Suspense>
                </Canvas>
              </Box>
            </motion.div>
          )}

          {/* Skills Grid */}
          <Grid container spacing={3}>
            {filteredSkills.map((skill, index) => (
              <Grid xs={12} md={6} lg={4} key={skill.name}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <EnhancedSkillCard
                    skill={skill}
                    isActive={activeSkill?.name === skill.name}
                    onHover={handleSkillHover}
                    onLeave={handleSkillLeave}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Active Skill Detail */}
          <AnimatePresence>
            {activeSkill && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${activeSkill.color}40, ${activeSkill.color}20)`,
                    backdropFilter: 'blur(30px)',
                    border: `2px solid ${activeSkill.color}`,
                    borderRadius: '16px',
                    p: 3,
                    minWidth: '280px',
                    boxShadow: `0 20px 40px ${activeSkill.color}30`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <activeSkill.icon sx={{ color: activeSkill.color, fontSize: '2rem', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      {activeSkill.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2 }}>
                    {activeSkill.description}
                  </Typography>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {activeSkill.technologies.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        sx={{
                          background: `${activeSkill.color}30`,
                          color: activeSkill.color,
                          fontSize: '0.75rem',
                        }}
                      />
                    ))}
                  </Stack>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </EnterpriseMotion.AboutContainer>
      </Container>
    </Box>
  );
};

export default EnhancedSkills;

