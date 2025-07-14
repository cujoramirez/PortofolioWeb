import React, { useRef, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper,
  LinearProgress,
  Chip
} from '@mui/material';
import { motion, useInView } from 'framer-motion';
import aboutImg from '../assets/GadingAdityaPerdana2.jpg';

// Animated counter component
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      const timer = setInterval(() => {
        start += end / (duration * 60);
        setCount(Math.floor(start));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        }
      }, 1000 / 60);
    }
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
};

const NewAbout = () => {
  const skills = [
    { name: 'Machine Learning', level: 92 },
    { name: 'Computer Vision', level: 88 },
    { name: 'Deep Learning', level: 85 },
    { name: 'Python', level: 90 },
    { name: 'TensorFlow', level: 82 },
    { name: 'React', level: 78 }
  ];

  const stats = [
    { label: 'Projects Completed', value: '15', icon: '🚀' },
    { label: 'AI Models Trained', value: '25', icon: '🤖' },
    { label: 'Research Papers', value: '3', icon: '📚' },
    { label: 'Years Experience', value: '4', icon: '⭐' }
  ];

  return (
    <Box
      id="about"
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: { xs: 8, md: 12 },
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip 
            label="About Me" 
            sx={{ 
              background: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              mb: 3
            }} 
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              lineHeight: 1.2,
            }}
          >
            Passionate About AI Innovation
          </Typography>
          <Box
            sx={{
              width: 100,
              height: 4,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              mx: 'auto',
              borderRadius: 2,
            }}
          />
        </Box>

        {/* Main Content - Flexbox Layout for GUARANTEED Left-Right positioning */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 6 },
            alignItems: { xs: 'center', md: 'flex-start' },
            maxWidth: '1400px',
            mx: 'auto'
          }}
        >
          {/* LEFT SIDE - IMAGE FIRST */}
          <Box 
            sx={{ 
              flex: { xs: 'none', md: '0 0 400px' },
              width: { xs: '100%', md: '400px' },
              maxWidth: { xs: '400px', md: 'none' },
              mx: { xs: 'auto', md: 0 }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              whileHover={{ scale: 1.02 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 25px 45px rgba(0, 0, 0, 0.3)',
                }}
              >
                <Box
                  component="img"
                  src={aboutImg}
                  alt="Gading Aditya Perdana"
                  sx={{
                    width: '100%',
                    height: { xs: '400px', md: '500px' },
                    objectFit: 'cover',
                    display: 'block',
                    filter: 'brightness(1.1) contrast(1.05)',
                  }}
                />
              </Box>
            </motion.div>
          </Box>

          {/* RIGHT SIDE - CONTENT */}
          <Box 
            sx={{ 
              flex: 1,
              minWidth: 0,
              pl: { md: 4 }
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.8,
                  color: 'rgba(255, 255, 255, 0.85)',
                  mb: 4,
                  textAlign: 'justify'
                }}
              >
                I have a strong focus on deep learning and AI research, particularly in computer vision. 
                My journey in technology started from a genuine curiosity to understand how things work, 
                leading me to develop innovative projects like a Diabetic Retinopathy Detector, a Facial 
                Recognition system for airport security, and a customizable T-shirt design website. 
                My internship at OJK provided valuable insights into regulatory frameworks, while my volunteer 
                work at Bagi Dunia enhanced my leadership and organizational skills. I thrive in collaborative 
                environments, continuously seeking new challenges to sharpen my technical expertise and deliver 
                impactful solutions.
              </Typography>

              {/* Stats Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat, index) => (
                  <Grid size={6} sm={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    >
                      <Paper
                        sx={{
                          p: 2.5,
                          textAlign: 'center',
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '16px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.3)',
                          }
                        }}
                      >
                        <Typography variant="h3" sx={{ fontSize: '1.8rem', mb: 1 }}>
                          {stat.icon}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            mb: 0.5,
                            fontSize: '1.5rem'
                          }}
                        >
                          <AnimatedCounter value={stat.value} />+
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {stat.label}
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Skills Section */}
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: 'white',
                    fontSize: '1.4rem'
                  }}
                >
                  Technical Expertise
                </Typography>
                <Grid container spacing={2}>
                  {skills.map((skill, index) => (
                    <Grid size={12} sm={6} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                      >
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: 'rgba(255, 255, 255, 0.9)' }}>
                              {skill.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64b5f6', fontWeight: 600 }}>
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
                                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                borderRadius: 3,
                              }
                            }}
                          />
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NewAbout;

