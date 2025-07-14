import React, { useState, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  LinearProgress,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Styled components with pure CSS
const GlowCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  },
}));

const ProfileImage = styled(Avatar)(({ theme }) => ({
  width: 300,
  height: 300,
  border: '4px solid rgba(99, 102, 241, 0.3)',
  boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
  transition: 'all 0.3s ease',
  position: 'relative',
  '&:hover': {
    transform: 'scale(1.05) rotate(2deg)',
    boxShadow: '0 0 50px rgba(99, 102, 241, 0.5)',
    border: '4px solid rgba(99, 102, 241, 0.5)',
  },
  [theme.breakpoints.down('md')]: {
    width: 250,
    height: 250,
  },
}));

const SkillChip = styled(Chip)(({ theme, level }) => ({
  background: `linear-gradient(135deg, 
    rgba(99, 102, 241, ${0.3 + level * 0.2}) 0%, 
    rgba(34, 211, 238, ${0.3 + level * 0.2}) 100%)`,
  color: 'white',
  fontWeight: 600,
  fontSize: '0.9rem',
  height: '36px',
  borderRadius: '18px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
    background: `linear-gradient(135deg, 
      rgba(99, 102, 241, ${0.5 + level * 0.2}) 0%, 
      rgba(34, 211, 238, ${0.5 + level * 0.2}) 100%)`,
  },
}));

const AnimatedProgressBar = ({ skill, level, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="mb-4"
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
          {skill}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(34, 211, 238, 1)', fontWeight: 600 }}>
          {level}%
        </Typography>
      </Box>
      <Box sx={{ position: 'relative' }}>
        <LinearProgress
          variant="determinate"
          value={isInView ? level : 0}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #6366f1 0%, #22d3ee 100%)',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            },
          }}
        />
      </Box>
    </motion.div>
  );
};

const FloatingIcon = ({ children, delay = 0 }) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
      className="absolute opacity-20"
    >
      {children}
    </motion.div>
  );
};

const PureAbout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const skills = [
    { name: 'React & Next.js', level: 95 },
    { name: 'JavaScript/TypeScript', level: 90 },
    { name: 'Python & Machine Learning', level: 88 },
    { name: 'Node.js & APIs', level: 85 },
    { name: 'Three.js & WebGL', level: 82 },
    { name: 'Data Science & AI', level: 87 },
  ];

  const technologies = [
    { name: 'React', level: 0.9 },
    { name: 'TypeScript', level: 0.8 },
    { name: 'Python', level: 0.85 },
    { name: 'Machine Learning', level: 0.8 },
    { name: 'Three.js', level: 0.75 },
    { name: 'Node.js', level: 0.8 },
    { name: 'WebGL', level: 0.7 },
    { name: 'Data Science', level: 0.85 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
      component="section"
      id="about"
      ref={containerRef}
      className="relative min-h-screen py-16 md:py-24"
      sx={{
        background: `
          radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
          radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Background Elements */}
      <FloatingIcon delay={0}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-10" 
             style={{ position: 'absolute', top: '10%', left: '10%' }} />
      </FloatingIcon>
      <FloatingIcon delay={2}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 opacity-10" 
             style={{ position: 'absolute', top: '60%', right: '15%' }} />
      </FloatingIcon>
      <FloatingIcon delay={4}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-10" 
             style={{ position: 'absolute', bottom: '20%', left: '20%' }} />
      </FloatingIcon>

      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Section Title */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <Typography
              variant="h2"
              className="text-4xl md:text-6xl font-bold mb-4"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 50%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: 'center',
              }}
            >
              About Me
            </Typography>
            <motion.div
              className="w-24 h-1 mx-auto rounded-full"
              style={{
                background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
              }}
              animate={{
                scaleX: isInView ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: 0.5 }}
            />
          </motion.div>

          <Grid container spacing={6} alignItems="center">
            {/* Profile Section */}
            <Grid xs={12} md={5}>
              <motion.div variants={itemVariants} className="text-center">
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                  <ProfileImage
                    src="/src/assets/GadingAdityaPerdana2.jpg"
                    alt="Gading Aditya Perdana"
                  />
                  
                  {/* Floating Skills around Image */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    {['AI', 'ML', 'React', 'Python'].map((tech, index) => (
                      <motion.div
                        key={tech}
                        className="absolute w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          top: '50%',
                          left: '50%',
                          transformOrigin: '0 0',
                          transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-180px) rotate(-${index * 90}deg)`,
                        }}
                        whileHover={{ scale: 1.2 }}
                      >
                        {tech}
                      </motion.div>
                    ))}
                  </motion.div>
                </Box>

                <Typography
                  variant="h4"
                  className="text-white font-bold mb-2"
                >
                  Gading Aditya Perdana
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(45deg, #6366f1, #22d3ee)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  AI Researcher & Full-Stack Engineer
                </Typography>
              </motion.div>
            </Grid>

            {/* Content Section */}
            <Grid xs={12} md={7}>
              <motion.div variants={itemVariants}>
                <GlowCard>
                  <CardContent sx={{ p: 4 }}>
                    <Typography
                      variant="h5"
                      className="text-white font-semibold mb-4"
                    >
                      Passionate About Innovation
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      className="text-gray-300 leading-relaxed mb-6"
                      sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                    >
                      I'm a dedicated AI researcher and full-stack engineer with a passion for pushing 
                      the boundaries of technology. My expertise spans across machine learning, computer vision, 
                      natural language processing, and modern web development. I love creating innovative 
                      solutions that bridge the gap between cutting-edge research and practical applications.
                    </Typography>

                    <Typography
                      variant="body1"
                      className="text-gray-300 leading-relaxed mb-6"
                      sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}
                    >
                      When I'm not coding or researching, you'll find me exploring the latest developments 
                      in AI, contributing to open-source projects, or experimenting with new technologies 
                      that can make a positive impact on society.
                    </Typography>

                    {/* Technologies */}
                    <Typography
                      variant="h6"
                      className="text-white font-semibold mb-3"
                    >
                      Core Technologies
                    </Typography>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {technologies.map((tech, index) => (
                        <motion.div
                          key={tech.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          <SkillChip
                            label={tech.name}
                            level={tech.level}
                            sx={{ mb: 1 }}
                          />
                        </motion.div>
                      ))}
                    </Stack>
                  </CardContent>
                </GlowCard>
              </motion.div>
            </Grid>
          </Grid>

          {/* Skills Section */}
          <motion.div variants={itemVariants} className="mt-16">
            <GlowCard>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  className="text-white font-semibold mb-6 text-center"
                >
                  Technical Expertise
                </Typography>
                
                <Grid container spacing={4}>
                  {skills.map((skill, index) => (
                    <Grid xs={12} md={6} key={skill.name}>
                      <AnimatedProgressBar
                        skill={skill.name}
                        level={skill.level}
                        index={index}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </GlowCard>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

export default PureAbout;

