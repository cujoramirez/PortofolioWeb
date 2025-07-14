import React from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ABOUT_TEXT } from "../constants/index";
import aboutImg from "../assets/GadingAdityaPerdana2.jpg";

// Styled Components using MUI
const StyledSection = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
  paddingTop: '80px',
  paddingBottom: '80px',
  overflow: 'visible',
}));

const GradientTitle = styled(Typography)(() => ({
  background: 'linear-gradient(45deg, #e91e63 30%, #9c27b0 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  fontWeight: 'bold',
  textAlign: 'center',
  fontSize: '5rem',
  marginBottom: '64px',
  '@media (max-width: 768px)': {
    fontSize: '3rem',
    marginBottom: '32px',
  },
}));

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '& img': {
    borderRadius: '16px',
    objectFit: 'cover',
    zIndex: 10,
    position: 'relative',
    boxShadow: '0 20px 40px rgba(156, 39, 176, 0.3)',
    width: '320px',
    height: '400px',
    '@media (max-width: 768px)': {
      width: '240px',
      height: '300px',
    },
  },
}));

const BorderDecoration = styled(Box)(({ color, position }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  border: `2px solid ${color}`,
  zIndex: 0,
  ...(position === 'bottom-right' && {
    bottom: '-16px',
    right: '-16px',
  }),
  ...(position === 'top-left' && {
    top: '-16px',
    left: '-16px',
  }),
}));

const AchievementCard = styled(Card)(({ theme, gradientcolor }) => ({
  background: `linear-gradient(135deg, ${gradientcolor}20 0%, transparent 100%)`,
  border: `1px solid ${gradientcolor}40`,
  borderRadius: '12px',
  textAlign: 'center',
  padding: '24px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${gradientcolor}30`,
  },
}));

function About() {
  console.log("🚀 SIMPLE MUI About component is loading!");

  const achievements = [
    { number: "3+", label: "Years of Experience", color: "#2196f3", gradientColor: "#2196f3" },
    { number: "15+", label: "Projects Completed", color: "#00bcd4", gradientColor: "#00bcd4" },
    { number: "2+", label: "Research Papers", color: "#9c27b0", gradientColor: "#9c27b0" },
    { number: "15+", label: "Certifications", color: "#4caf50", gradientColor: "#4caf50" }
  ];

  return (
    <StyledSection id="about">
      <Container maxWidth="xl">
        {/* TITLE */}
        <GradientTitle variant="h1" component="h2">
          <Box component="span" sx={{ color: 'white' }}>About</Box> me
        </GradientTitle>
        
        {/* DIVIDER */}
        <Divider 
          sx={{ 
            background: 'linear-gradient(90deg, #9c27b0, #e91e63)',
            height: '4px',
            borderRadius: '2px',
            maxWidth: '400px',
            mx: 'auto',
            mb: 8
          }} 
        />

        {/* MAIN CONTENT */}
        <Grid container spacing={6} alignItems="center">
          {/* IMAGE SECTION */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <ImageContainer>
              <img
                src={aboutImg}
                alt="Gading Aditya Perdana"
                loading="eager"
              />
              <BorderDecoration color="rgba(156, 39, 176, 0.5)" position="bottom-right" />
              <BorderDecoration color="rgba(233, 30, 99, 0.5)" position="top-left" />
            </ImageContainer>
          </Grid>
          
          {/* TEXT CONTENT */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              padding: '32px'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'grey.300', 
                  lineHeight: 1.8, 
                  fontSize: '1.25rem',
                  maxWidth: '600px'
                }}
              >
                {ABOUT_TEXT}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* PROFESSIONAL ACHIEVEMENTS */}
        <Box sx={{ mt: 12 }}>
          <Typography 
            variant="h3" 
            component="h3"
            sx={{ 
              textAlign: 'center', 
              color: '#9c27b0', 
              fontWeight: 'bold',
              mb: 6,
              fontSize: '3rem'
            }}
          >
            Professional Achievements
          </Typography>
          <Grid container spacing={3}>
            {achievements.map((achievement, index) => (
              <Grid size={{ xs: 6, lg: 3 }} key={index}>
                <AchievementCard gradientcolor={achievement.gradientColor}>
                  <CardContent>
                    <Typography 
                      sx={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: achievement.color,
                        marginBottom: '8px'
                      }}
                    >
                      {achievement.number}
                    </Typography>
                    <Typography 
                      sx={{
                        fontSize: '0.875rem',
                        color: 'grey.400',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 500
                      }}
                    >
                      {achievement.label}
                    </Typography>
                  </CardContent>
                </AchievementCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </StyledSection>
  );
}

export default About;
