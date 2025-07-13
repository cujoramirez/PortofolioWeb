import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import aboutImg from '../assets/GadingAdityaPerdana2.jpg';

// Animated counter component
const AnimatedCounter = ({ value, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Skill progress bar
const SkillBar = ({ skill, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.95rem'
            }}
          >
            {skill.name}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#64b5f6',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}
          >
            {skill.level}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={isInView ? skill.level : 0}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              transition: 'transform 1.5s ease-in-out',
            }
          }}
        />
      </Box>
    </motion.div>
  );
};

const BulletproofAbout = () => {
  const skills = [
    { name: 'Machine Learning & AI', level: 95 },
    { name: 'Computer Vision', level: 92 },
    { name: 'Deep Learning', level: 88 },
    { name: 'Python & Data Science', level: 94 },
    { name: 'Cloud Architecture', level: 85 },
    { name: 'Full-Stack Development', level: 82 }
  ];

  const achievements = [
    { label: 'Projects', value: '25', icon: '🚀' },
    { label: 'AI Models', value: '40', icon: '🤖' },
    { label: 'Publications', value: '8', icon: '📊' },
    { label: 'Years Exp', value: '6', icon: '⚡' }
  ];

  return (
    <Box
      id="about"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1b3e 30%, #2d1b69 70%, #0f172a 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 6, md: 10 },
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: '1600px', width: '100%' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="About Me" 
              sx={{ 
                background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                px: 3,
                py: 0.5,
                mb: 4,
                borderRadius: '25px',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)'
              }} 
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.1,
                letterSpacing: '-0.02em'
              }}
            >
              AI Innovation Leader
            </Typography>
            <Box
              sx={{
                width: 120,
                height: 4,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
                mx: 'auto',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
              }}
            />
          </Box>
        </motion.div>

        {/* MAIN CONTENT - CENTERED SINGLE COLUMN LAYOUT */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            width: '100%',
            maxWidth: '800px',
            mx: 'auto'
          }}
        >
          {/* CENTERED IMAGE SECTION */}
          <Box
            sx={{
              width: '100%',
              maxWidth: '400px',
              mx: 'auto'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <Paper
                sx={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                  backdropFilter: 'blur(25px)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '32px',
                  overflow: 'hidden',
                  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: '0 40px 80px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                    '&::before': {
                      opacity: 1
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }
                }}
              >
                {/* Profile Image - Original Aspect Ratio */}
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={aboutImg}
                    alt="Gading Aditya Perdana"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      filter: 'brightness(1.15) contrast(1.1) saturate(1.05)',
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        filter: 'brightness(1.25) contrast(1.15) saturate(1.1)',
                      }
                    }}
                  />
                  
                  {/* Elegant Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      p: 3,
                      color: 'white'
                    }}
                  >
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: '1.4rem',
                        mb: 0.5,
                        textShadow: '0 2px 10px rgba(0,0,0,0.7)'
                      }}
                    >
                      Gading Aditya Perdana
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        opacity: 0.95, 
                        fontSize: '1rem',
                        fontWeight: 500,
                        background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        textShadow: 'none'
                      }}
                    >
                      Senior AI Research Engineer
                    </Typography>
                  </Box>
                </Box>

                {/* Achievement Stats - Horizontal Layout */}
                <Box sx={{ p: 4 }}>
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 3
                    }}
                  >
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '16px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }
                        }}>
                          <Typography variant="h3" sx={{ fontSize: '1.8rem', mb: 1 }}>
                            {achievement.icon}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              color: 'transparent',
                              fontSize: '1.5rem',
                              mb: 0.5
                            }}
                          >
                            <AnimatedCounter value={achievement.value} />+
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              display: 'block',
                              lineHeight: 1.2
                            }}
                          >
                            {achievement.label}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Box>
          </Box>

          {/* CONTENT SECTION - BELOW IMAGE */}
          <Box sx={{ width: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Paper
                sx={{
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '24px',
                  p: { xs: 4, md: 5 },
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }
                }}
              >
                {/* About Text */}
                <Box sx={{ mb: 5 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1.15rem', md: '1.3rem' },
                      lineHeight: 1.8,
                      color: 'rgba(255, 255, 255, 0.95)',
                      textAlign: 'center',
                      fontWeight: 400,
                      mb: 4,
                      letterSpacing: '0.02em'
                    }}
                  >
                    As a <strong style={{color: '#60a5fa'}}>Senior AI Research Engineer</strong> with over 6 years of experience, 
                    I specialize in developing enterprise-grade artificial intelligence solutions that drive digital transformation. 
                    My expertise spans <strong style={{color: '#a78bfa'}}>computer vision, deep learning, and cloud-native AI architectures</strong>, 
                    with a proven track record of delivering scalable solutions for Fortune 500 companies.
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1.15rem', md: '1.3rem' },
                      lineHeight: 1.8,
                      color: 'rgba(255, 255, 255, 0.9)',
                      textAlign: 'center',
                      fontWeight: 400,
                      mb: 4,
                      letterSpacing: '0.02em'
                    }}
                  >
                    My portfolio includes breakthrough projects like a <strong style={{color: '#34d399'}}>Diabetic Retinopathy Detection System</strong>, 
                    an <strong style={{color: '#fbbf24'}}>AI-powered Facial Recognition platform</strong> for airport security, and innovative e-commerce solutions. 
                    I thrive in collaborative environments where cutting-edge technology meets real-world impact.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1.15rem', md: '1.3rem' },
                      lineHeight: 1.8,
                      color: 'rgba(255, 255, 255, 0.85)',
                      textAlign: 'center',
                      fontWeight: 400,
                      letterSpacing: '0.02em'
                    }}
                  >
                    My internship at <strong style={{color: '#f472b6'}}>OJK (Financial Services Authority)</strong> provided valuable insights into regulatory frameworks, 
                    while my volunteer work at <strong style={{color: '#06b6d4'}}>Bagi Dunia</strong> enhanced my leadership skills. 
                    I continuously seek new challenges to deliver impactful solutions that bridge cutting-edge research with practical applications.
                  </Typography>
                </Box>

                {/* Technical Skills */}
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 4,
                      fontSize: { xs: '1.8rem', md: '2.2rem' },
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }}
                  >
                    🚀 Technical Expertise
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 3,
                      maxWidth: '700px',
                      mx: 'auto'
                    }}
                  >
                    {skills.map((skill, index) => (
                      <SkillBar key={index} skill={skill} index={index} />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BulletproofAbout;
