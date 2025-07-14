import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Sphere, 
  Box as ThreeBox, 
  MeshDistortMaterial, 
  Float, 
  Text3D, 
  Center,
  Environment,
  PerspectiveCamera,
  Html
} from '@react-three/drei';
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  TextField,
  Button,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Paper,
  Snackbar,
  Alert,
  Fade,
  Tooltip,
  Stack,
  Divider
} from '@mui/material';
import { 
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  GitHub,
  Twitter,
  Send,
  Rocket,
  Psychology,
  Code,
  AutoAwesome,
  ConnectWithoutContact,
  Language,
  Schedule,
  WorkOutline,
  School,
  EmojiEvents
} from '@mui/icons-material';
import * as THREE from 'three';
import EnterpriseMotion from './animations/EnterpriseMotion.jsx';

// Contact Information
const contactInfo = [
  {
    icon: Email,
    label: "Email",
    value: "gading@example.com",
    description: "Professional inquiries welcome",
    action: "mailto:gading@example.com",
    color: "#6366f1"
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    description: "Available during business hours",
    action: "tel:+15551234567",
    color: "#22d3ee"
  },
  {
    icon: LocationOn,
    label: "Location",
    value: "San Francisco, CA",
    description: "Open to remote opportunities",
    action: null,
    color: "#8b5cf6"
  },
  {
    icon: Schedule,
    label: "Response Time",
    value: "24 hours",
    description: "Quick response guaranteed",
    action: null,
    color: "#10b981"
  }
];

// Social Links
const socialLinks = [
  {
    icon: LinkedIn,
    platform: "LinkedIn",
    username: "@gadingaditya",
    url: "https://linkedin.com/in/gadingaditya",
    color: "#0077b5",
    description: "Professional network"
  },
  {
    icon: GitHub,
    platform: "GitHub",
    username: "@gadingaditya",
    url: "https://github.com/gadingaditya",
    color: "#333",
    description: "Code repositories"
  },
  {
    icon: Twitter,
    platform: "Twitter",
    username: "@gadingaditya",
    url: "https://twitter.com/gadingaditya",
    color: "#1da1f2",
    description: "Tech thoughts & insights"
  }
];

// 3D Contact Orb Component
const ContactOrb = ({ position, color, onClick, isActive }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(time * 2 + position[0]) * 0.2;
      
      // Rotation
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.005;
      
      // Pulsing effect when active
      if (isActive || hovered) {
        meshRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
      } else {
        meshRef.current.scale.setScalar(0.8);
      }
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh
        ref={meshRef}
        position={position}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={hovered ? 0.4 : 0.2}
          speed={hovered ? 3 : 1}
          roughness={0.1}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

// Contact Form 3D Scene
const ContactScene = ({ formData, onFieldFocus }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#6366f1" />
      <pointLight position={[-5, -5, 2]} intensity={0.5} color="#22d3ee" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#8b5cf6"
      />

      <Environment preset="night" />
      
      <group ref={groupRef}>
        {/* Contact Orbs */}
        <ContactOrb
          position={[-2, 1, 0]}
          color="#6366f1"
          isActive={formData.name}
        />
        <ContactOrb
          position={[2, 1, 0]}
          color="#22d3ee"
          isActive={formData.email}
        />
        <ContactOrb
          position={[0, -1, 0]}
          color="#8b5cf6"
          isActive={formData.message}
        />
        
        {/* Central Connection Hub */}
        <Float speed={1} rotationIntensity={0.2}>
          <mesh position={[0, 0.5, 0]}>
            <icosahedronGeometry args={[0.3, 1]} />
            <meshPhysicalMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.2}
              metalness={0.8}
              roughness={0.2}
              transparent
              opacity={0.9}
            />
          </mesh>
        </Float>
        
        {/* Connecting Lines */}
        <Html center>
          <svg width="400" height="300" style={{ position: 'absolute', top: '-150px', left: '-200px' }}>
            <line x1="100" y1="100" x2="200" y2="150" stroke="#6366f1" strokeWidth="2" opacity="0.6" />
            <line x1="300" y1="100" x2="200" y2="150" stroke="#22d3ee" strokeWidth="2" opacity="0.6" />
            <line x1="200" y1="200" x2="200" y2="150" stroke="#8b5cf6" strokeWidth="2" opacity="0.6" />
          </svg>
        </Html>
      </group>
    </>
  );
};

// Enhanced Contact Form
const EnhancedContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setShowSuccess(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setShowSuccess(false), 5000);
    
    if (onSubmit) onSubmit(formData);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* 3D Background Scene */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <Canvas>
          <Suspense fallback={null}>
            <ContactScene formData={formData} onFieldFocus={setFocusedField} />
          </Suspense>
        </Canvas>
      </Box>
      
      {/* Form Content */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          p: 4,
          mt: '250px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: 'center',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Let's Connect
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <TextField
                  fullWidth
                  label="Your Name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6366f1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6366f1',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            </Grid>
            
            <Grid xs={12} md={6}>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#22d3ee',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#22d3ee',
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            </Grid>
            
            <Grid xs={12}>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <TextField
                  fullWidth
                  label="Subject"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  onFocus={() => setFocusedField('subject')}
                  onBlur={() => setFocusedField(null)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8b5cf6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            </Grid>
            
            <Grid xs={12}>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <TextField
                  fullWidth
                  label="Your Message"
                  multiline
                  rows={5}
                  value={formData.message}
                  onChange={handleChange('message')}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '12px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#10b981',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#10b981',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                    },
                  }}
                />
              </motion.div>
            </Grid>
            
            <Grid xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <AutoAwesome /> : <Send />}
                    sx={{
                      px: 6,
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      borderRadius: '50px',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.6s',
                      },
                      '&:hover::before': {
                        transform: 'translateX(100%)',
                      }
                    }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={5000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            }
          }}
        >
          Message sent successfully! I'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Contact Info Card
const ContactInfoCard = ({ info, index }) => {
  const IconComponent = info.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <Card
        sx={{
          background: `linear-gradient(135deg, ${info.color}20, ${info.color}10)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${info.color}40`,
          borderRadius: '20px',
          p: 3,
          height: '140px',
          cursor: info.action ? 'pointer' : 'default',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: `linear-gradient(135deg, ${info.color}30, ${info.color}15)`,
            border: `1px solid ${info.color}60`,
            boxShadow: `0 20px 40px ${info.color}20`,
            '& .info-icon': {
              transform: 'scale(1.2) rotate(10deg)',
            }
          }
        }}
        onClick={info.action ? () => window.open(info.action, '_blank') : undefined}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', height: '100%' }}>
          <Box
            className="info-icon"
            sx={{
              mr: 2,
              transition: 'transform 0.3s ease',
            }}
          >
            <IconComponent
              sx={{
                color: info.color,
                fontSize: '2rem',
                filter: `drop-shadow(0 4px 8px ${info.color}40)`,
              }}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'white',
                mb: 0.5,
                fontSize: '1.1rem',
              }}
            >
              {info.label}
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                color: info.color,
                fontWeight: 600,
                mb: 1,
              }}
            >
              {info.value}
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: 1.4,
              }}
            >
              {info.description}
            </Typography>
          </Box>
        </Box>
        
        {/* Animated accent */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 4,
            height: '100%',
            background: `linear-gradient(to bottom, ${info.color}, transparent)`,
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </Card>
    </motion.div>
  );
};

// Social Link Component
const SocialLinkCard = ({ social, index }) => {
  const IconComponent = social.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      <Tooltip title={social.description} arrow>
        <IconButton
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            width: 80,
            height: 80,
            background: `linear-gradient(135deg, ${social.color}40, ${social.color}20)`,
            backdropFilter: 'blur(20px)',
            border: `2px solid ${social.color}30`,
            borderRadius: '50%',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              background: `linear-gradient(135deg, ${social.color}60, ${social.color}40)`,
              border: `2px solid ${social.color}`,
              boxShadow: `0 15px 30px ${social.color}40`,
              '&::before': {
                transform: 'scale(1)',
                opacity: 1,
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle, ${social.color}30, transparent)`,
              transform: 'scale(0)',
              opacity: 0,
              transition: 'all 0.3s ease',
            }
          }}
        >
          <IconComponent
            sx={{
              fontSize: '2rem',
              color: social.color,
              zIndex: 1,
              position: 'relative',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          />
        </IconButton>
      </Tooltip>
    </motion.div>
  );
};

// Main Enhanced Contact Component
const EnhancedContact = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const containerRef = useRef();
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const handleFormSubmit = (formData) => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <Box
      ref={containerRef}
      component="section"
      id="contact"
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
                Get In <Box component="span" sx={{ color: 'white' }}>Touch</Box>
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
                Ready to collaborate on innovative AI solutions? Let's discuss your next project.
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

          <Grid container spacing={6}>
            {/* Contact Information */}
            <Grid xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    mb: 4,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Contact Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {contactInfo.map((info, index) => (
                    <Grid xs={12} sm={6} key={info.label}>
                      <ContactInfoCard info={info} index={index} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Social Links */}
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: 600,
                      color: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    Connect on Social Media
                  </Typography>
                  
                  <Stack direction="row" spacing={3} justifyContent="center">
                    {socialLinks.map((social, index) => (
                      <SocialLinkCard key={social.platform} social={social} index={index} />
                    ))}
                  </Stack>
                </Box>
                
                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Paper
                    sx={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, textAlign: 'center' }}>
                      Why Work With Me?
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {[
                        { icon: Psychology, label: 'AI Expertise', value: '5+ Years' },
                        { icon: Code, label: 'Projects', value: '50+ Completed' },
                        { icon: School, label: 'Research', value: 'Published' },
                        { icon: EmojiEvents, label: 'Success Rate', value: '98%' }
                      ].map((stat, index) => (
                        <Grid xs={6} key={stat.label}>
                          <Box sx={{ textAlign: 'center' }}>
                            <stat.icon sx={{ color: '#6366f1', fontSize: '1.5rem', mb: 1 }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block' }}>
                              {stat.label}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6366f1', fontWeight: 700 }}>
                              {stat.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </motion.div>
              </motion.div>
            </Grid>

            {/* Contact Form */}
            <Grid xs={12} lg={7}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <EnhancedContactForm onSubmit={handleFormSubmit} />
              </motion.div>
            </Grid>
          </Grid>
        </EnterpriseMotion.AboutContainer>
      </Container>
    </Box>
  );
};

export default EnhancedContact;

