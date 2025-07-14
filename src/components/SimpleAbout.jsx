import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const SimpleAbout = () => {
  const skills = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
    'Machine Learning', 'Data Science', 'Three.js', 'WebGL', 'GLSL'
  ];

  return (
    <Box
      component="section"
      id="about"
      sx={{
        py: { xs: 8, md: 12 },
        minHeight: '100vh',
        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '3rem', md: '4rem' },
              fontWeight: 800,
              textAlign: 'center',
              mb: 6,
              background: 'linear-gradient(45deg, #6366f1 30%, #22d3ee 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            About Me
          </Typography>

          <Grid container spacing={4} alignItems="center">
            {/* Profile Image */}
            <Grid xs={12} md={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    width: { xs: 200, md: 300 },
                    height: { xs: 200, md: 300 },
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mx: 'auto',
                    border: '4px solid rgba(99, 102, 241, 0.3)',
                    boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <img
                    src="/src/assets/GadingAdityaPerdana2.jpg"
                    alt="Gading Aditya Perdana"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>

            {/* Content */}
            <Grid xs={12} md={8}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 4,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      mb: 3,
                      fontWeight: 600,
                    }}
                  >
                    AI Researcher & Engineer
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1.1rem',
                      lineHeight: 1.7,
                      mb: 4,
                    }}
                  >
                    Passionate about pushing the boundaries of artificial intelligence and machine learning. 
                    I specialize in developing innovative solutions that bridge the gap between cutting-edge 
                    research and practical applications. My work spans across deep learning, computer vision, 
                    natural language processing, and interactive web technologies.
                  </Typography>

                  {/* Skills */}
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'white',
                      mb: 2,
                      fontWeight: 600,
                    }}
                  >
                    Core Technologies
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Chip
                          label={skill}
                          sx={{
                            background: 'linear-gradient(45deg, #6366f1 30%, #22d3ee 90%)',
                            color: 'white',
                            fontWeight: 500,
                            '&:hover': {
                              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                            },
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SimpleAbout;

