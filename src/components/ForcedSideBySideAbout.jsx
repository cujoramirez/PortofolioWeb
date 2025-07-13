import React, { useRef, useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper,
  LinearProgress,
  Chip,
  useTheme,
  alpha
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

const ForcedSideBySideAbout = () => {
  const theme = useTheme();
  
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
    <>
      {/* Custom CSS to FORCE the layout */}
      <style jsx global>{`
        .forced-side-by-side {
          display: flex !important;
          flex-direction: row !important;
          align-items: flex-start !important;
          gap: 40px !important;
          width: 100% !important;
          max-width: none !important;
        }
        
        .forced-left-panel {
          flex: 0 0 320px !important;
          width: 320px !important;
          min-width: 320px !important;
          max-width: 320px !important;
        }
        
        .forced-right-panel {
          flex: 1 !important;
          min-width: 0 !important;
          width: calc(100% - 360px) !important;
          min-height: 700px !important;
        }
        
        @media (max-width: 960px) {
          .forced-side-by-side {
            flex-direction: column !important;
            gap: 24px !important;
          }
          
          .forced-left-panel {
            flex: none !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }
          
          .forced-right-panel {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>

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
        <Container maxWidth={false} sx={{ maxWidth: '1600px !important', width: '100%' }}>
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

          {/* FORCED SIDE-BY-SIDE LAYOUT */}
          <Box className="forced-side-by-side">
            {/* LEFT PANEL - IMAGE */}
            <Box className="forced-left-panel">
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <Paper
                  sx={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 35px 70px rgba(99, 102, 241, 0.3)'
                    }
                  }}
                >
                  {/* Profile Image */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={aboutImg}
                      alt="Gading Aditya Perdana"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        aspectRatio: 'auto',
                        objectFit: 'cover',
                        filter: 'brightness(1.1) contrast(1.05)',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        p: 2,
                        color: 'white'
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                        Gading Aditya Perdana
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                        Senior AI Research Engineer
                      </Typography>
                    </Box>
                  </Box>

                  {/* Achievement Stats */}
                  <Box sx={{ p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr',
                        gap: 2
                      }}
                    >
                      {achievements.map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                        >
                          <Box sx={{ 
                            textAlign: 'center', 
                            p: 1.5, 
                            background: 'rgba(255,255,255,0.05)', 
                            borderRadius: '12px' 
                          }}>
                            <Typography variant="h4" sx={{ fontSize: '1.3rem', mb: 0.5 }}>
                              {achievement.icon}
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent',
                                fontSize: '1.2rem',
                                mb: 0.5
                              }}
                            >
                              <AnimatedCounter value={achievement.value} />+
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                                display: 'block'
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

            {/* RIGHT PANEL - CONTENT */}
            <Box className="forced-right-panel">
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Paper
                  sx={{
                    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    p: { xs: 3, md: 4 },
                    minHeight: '650px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  {/* About Text */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.15rem' },
                        lineHeight: 1.8,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textAlign: 'justify',
                        fontWeight: 400,
                        mb: 3
                      }}
                    >
                      As a <strong>Senior AI Research Engineer</strong> with over 6 years of experience, I specialize in developing 
                      enterprise-grade artificial intelligence solutions that drive digital transformation. My expertise spans 
                      <strong> computer vision, deep learning, and cloud-native AI architectures</strong>, with a proven track record 
                      of delivering scalable solutions for Fortune 500 companies.
                    </Typography>
                    
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.15rem' },
                        lineHeight: 1.8,
                        color: 'rgba(255, 255, 255, 0.85)',
                        textAlign: 'justify',
                        fontWeight: 400,
                        mb: 3
                      }}
                    >
                      My portfolio includes breakthrough projects like a <strong>Diabetic Retinopathy Detection System</strong>, 
                      an <strong>AI-powered Facial Recognition platform</strong> for airport security, and innovative e-commerce solutions. 
                      I thrive in collaborative environments where cutting-edge technology meets real-world impact, consistently delivering 
                      solutions that exceed performance benchmarks.
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1.1rem', md: '1.15rem' },
                        lineHeight: 1.8,
                        color: 'rgba(255, 255, 255, 0.8)',
                        textAlign: 'justify',
                        fontWeight: 400
                      }}
                    >
                      My internship at <strong>OJK (Financial Services Authority)</strong> provided valuable insights into regulatory frameworks 
                      and compliance requirements for financial technology. Additionally, my volunteer work at <strong>Bagi Dunia</strong> 
                      enhanced my leadership and organizational skills while contributing to meaningful community initiatives. 
                      I continuously seek new challenges to sharpen my technical expertise and deliver impactful solutions that 
                      bridge the gap between cutting-edge research and practical applications.
                    </Typography>
                  </Box>

                  {/* Technical Skills */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 800,
                        mb: 3,
                        fontSize: '1.4rem',
                        background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
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
                        gap: 2
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
    </>
  );
};

export default ForcedSideBySideAbout;
