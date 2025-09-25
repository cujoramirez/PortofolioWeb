import React, { useRef, useState, useEffect, memo, useMemo, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Link,
  Tooltip,
  Chip,
  alpha
} from "@mui/material";
import { 
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  LocationOn as LocationIcon,
  ContactMail as ContactIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
  Rocket as RocketIcon,
  Business as BusinessIcon,
  Code as CodeIcon,
  Analytics as AnalyticsIcon,
  Science as ScienceIcon
} from "@mui/icons-material";
import { useSystemProfile } from './useSystemProfile';

// Optimized contact methods - memoized to prevent recreations
const contactMethods = [
  {
    icon: EmailIcon,
    label: "Email",
    value: "gadingadityaperdana@gmail.com",
    href: "mailto:gadingadityaperdana@gmail.com",
    color: "#6366f1",
    description: "Best for detailed inquiries"
  },
  {
    icon: LinkedInIcon,
    label: "LinkedIn",
    value: "gadingadityaperdana",
    href: "https://www.linkedin.com/in/gadingadityaperdana/",
    color: "#0077b5",
    description: "Professional networking"
  },
  {
    icon: GitHubIcon,
    label: "GitHub", 
    value: "cujoramirez",
    href: "https://github.com/cujoramirez",
    color: "#333",
    description: "View my code repositories"
  },
  {
    icon: LocationIcon,
    label: "Location",
    value: "Central Jakarta, Indonesia",
    href: null,
    color: "#10b981",
    description: "Available globally for remote work"
  }
];

const stats = [
  { icon: WorkIcon, value: "3+", label: "Years Experience" },
  { icon: BusinessIcon, value: "20+", label: "Projects Completed" },
  { icon: CodeIcon, value: "10+", label: "Technologies" },
  { icon: AnalyticsIcon, value: "24/7", label: "Availability" },
  { icon: ScienceIcon, value: "AI/ML", label: "Specialization" }
];

const expertise = [
  { icon: PsychologyIcon, label: "AI Strategy", color: "#6366f1" },
  { icon: AutoAwesomeIcon, label: "Machine Learning", color: "#8b5cf6" },
  { icon: RocketIcon, label: "Digital Innovation", color: "#22d3ee" },
  { icon: BusinessIcon, label: "Enterprise Solutions", color: "#10b981" },
  { icon: CodeIcon, label: "Full-Stack Development", color: "#f59e0b" },
  { icon: AnalyticsIcon, label: "Data Analytics", color: "#ef4444" }
];

// Lightweight CSS-only background decoration
const OptimizedBackground = memo(({ theme, shouldAnimate }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: `
        radial-gradient(circle at 30% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)
      `,
      '&::after': shouldAnimate ? {
        content: '""',
        position: 'absolute',
        top: '10%',
        left: '20%',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: theme.palette.primary.main,
        opacity: 0.3,
        animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0) scale(0.8)', opacity: 0.2 },
          '50%': { transform: 'translate(30px, -30px) scale(1.2)', opacity: 0.6 }
        }
      } : {}
    }}
  />
));

// Memoized contact method card
const ContactMethodCard = memo(({ method, index, theme, shouldAnimate }) => {
  const IconComponent = method.icon;
  
  const handleClick = useCallback(() => {
    if (method.href) {
      window.open(method.href, '_blank', 'noopener,noreferrer');
    }
  }, [method.href]);

  return (
    <motion.div
      key={method.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={shouldAnimate ? { scale: 1.02, y: -2 } : {}}
      style={{ display: 'flex', width: '100%' }}
    >
      <Card
        elevation={3}
        sx={{
          p: 3,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          background: alpha(theme.palette.background.paper, 0.78),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          backdropFilter: 'blur(14px)',
          cursor: method.href ? 'pointer' : 'default',
          transition: 'all 0.25s ease-in-out',
          borderRadius: 3,
          boxShadow: '0 24px 40px rgba(15, 23, 42, 0.18)',
          '&:hover': method.href ? {
            borderColor: alpha(method.color, 0.4),
            boxShadow: '0 28px 50px rgba(99, 102, 241, 0.25)',
            transform: 'translateY(-4px) scale(1.01)',
            '& .contact-icon': {
              color: method.color,
              transform: 'scale(1.12)'
            }
          } : {}
        }}
        onClick={handleClick}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              bgcolor: alpha(method.color, 0.15),
              color: method.color,
              width: 52,
              height: 52,
              boxShadow: `0 12px 24px ${alpha(method.color, 0.25)}`
            }}
          >
            <IconComponent 
              className="contact-icon"
              sx={{ 
                fontSize: 26,
                transition: 'all 0.25s ease-in-out'
              }}
            />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.2 }}>
              {method.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {method.description}
            </Typography>
          </Box>
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.primary" 
          fontWeight={600}
          sx={{ wordBreak: 'break-word', fontSize: '1.05rem' }}
        >
          {method.value}
        </Typography>

        {method.href && (
          <Box display="flex" alignItems="center" gap={1} sx={{ color: method.color, fontSize: '0.95rem', fontWeight: 500 }}>
            <ScheduleIcon sx={{ fontSize: 18 }} />
            <Typography component="span">Available for quick introductions</Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
});

// Memoized stats card
const StatCard = memo(({ stat, index, theme, shouldAnimate }) => {
  const IconComponent = stat.icon;
  
  return (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{ width: '100%' }}
    >
      <Box
        textAlign="center"
        sx={{
          p: { xs: 2.5, sm: 3 },
          background: alpha(theme.palette.background.paper, 0.08),
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          transition: shouldAnimate ? 'all 0.25s ease-in-out' : 'none',
          boxShadow: '0 20px 30px rgba(15, 23, 42, 0.16)',
          '&:hover': shouldAnimate ? {
            borderColor: alpha(theme.palette.primary.main, 0.35),
            transform: 'translateY(-3px)',
            boxShadow: '0 26px 36px rgba(99, 102, 241, 0.22)'
          } : {}
        }}
      >
        <IconComponent
          sx={{
            fontSize: { xs: 28, sm: 34 },
            color: theme.palette.primary.main,
            mb: 1
          }}
        />
        <Typography 
          variant="h4" 
          fontWeight={700}
          sx={{ 
            fontSize: { xs: '1.6rem', sm: '2.1rem' },
            color: theme.palette.primary.main,
            mb: 0.5 
          }}
        >
          {stat.value}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}
        >
          {stat.label}
        </Typography>
      </Box>
    </motion.div>
  );
});

// Memoized expertise chip
const ExpertiseChip = memo(({ item, index, shouldAnimate }) => {
  const IconComponent = item.icon;
  
  return (
    <motion.div
      key={item.label}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Chip
        icon={<IconComponent sx={{ fontSize: 18 }} />}
        label={item.label}
        variant="outlined"
        sx={{
          borderColor: alpha(item.color, 0.3),
          color: item.color,
          backgroundColor: alpha(item.color, 0.05),
          fontWeight: 500,
          fontSize: '0.875rem',
          height: 36,
          transition: shouldAnimate ? 'all 0.2s ease-in-out' : 'none',
          '&:hover': shouldAnimate ? {
            backgroundColor: alpha(item.color, 0.1),
            borderColor: alpha(item.color, 0.5),
            transform: 'scale(1.05)'
          } : {}
        }}
      />
    </motion.div>
  );
});

const OptimizedModernContact = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { performanceTier } = useSystemProfile();
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, threshold: 0.1 });
  
  const shouldAnimate = performanceTier !== "low" && !isMobile;

  // Memoized callbacks to prevent re-renders
  const memoizedContactMethods = useMemo(() => contactMethods, []);
  const memoizedStats = useMemo(() => stats, []);
  const memoizedExpertise = useMemo(() => expertise, []);

  return (
    <Box
      ref={containerRef}
      component="section"
      id="contact"
      sx={{
        py: { xs: 6, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(135deg, 
          ${theme.palette.background.default} 0%, 
          ${alpha(theme.palette.primary.main, 0.02)} 50%,
          ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        color: 'white'
      }}
    >
      {/* Optimized background */}
      <OptimizedBackground theme={theme} shouldAnimate={shouldAnimate} />

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Header Section */}
        {isInView && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <Chip
                icon={<ContactIcon />}
                label="Get In Touch"
                sx={{
                  mb: 3,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.1)}, 
                    ${alpha(theme.palette.secondary.main, 0.1)})`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 1,
                  px: 2
                }}
              />
              
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  fontWeight: 700,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main}, 
                    ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  mb: { xs: 1, md: 2 },
                  lineHeight: 1.2
                }}
              >
                Let's Work Together
              </Typography>
              
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ 
                  maxWidth: 600, 
                  mx: 'auto',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.6
                }}
              >
                Ready to bring your ideas to life with cutting-edge AI and development solutions
              </Typography>
            </Box>
          </motion.div>
        )}

        {/* Contact Methods */}
        <Box mb={{ xs: 6, md: 8 }} sx={{ width: '100%' }}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Contact Methods
          </Typography>
          
          <Box
            sx={{
              maxWidth: 1080,
              mx: 'auto',
              display: 'grid',
              gap: { xs: 2.5, md: 3 },
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))'
              },
              justifyItems: 'stretch'
            }}
          >
            {memoizedContactMethods.map((method, index) => {
              const isLocation = method.label === 'Location';
              return (
                <Box
                  key={method.label}
                  sx={{
                    display: 'flex',
                    gridColumn: isLocation ? {
                      xs: 'auto',
                      sm: '1 / span 2',
                      lg: '2 / span 1'
                    } : 'auto',
                    justifySelf: isLocation ? 'center' : 'stretch',
                    maxWidth: isLocation ? { xs: '100%', sm: 420, lg: '100%' } : '100%'
                  }}
                >
                  <ContactMethodCard
                    method={method}
                    index={index}
                    theme={theme}
                    shouldAnimate={shouldAnimate}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Stats Section */}
        <Box mb={{ xs: 6, md: 8 }} sx={{ width: '100%' }}>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Quick Stats
          </Typography>
          
          <Box
            sx={{
              maxWidth: 960,
              mx: 'auto',
              display: 'grid',
              gap: { xs: 2, sm: 2.5 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))'
              },
              justifyItems: 'stretch'
            }}
          >
            {memoizedStats.map((stat, index) => (
              <StatCard
                key={stat.label}
                stat={stat}
                index={index}
                theme={theme}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </Box>
        </Box>

        {/* Expertise Section */}
        <Box textAlign="center" sx={{ width: '100%' }}>
          <Typography 
            variant="h4" 
            fontWeight={600}
            sx={{ mb: 4, color: theme.palette.text.primary }}
          >
            Areas of Expertise
          </Typography>
          
          <Box 
            display="flex" 
            flexWrap="wrap" 
            justifyContent="center" 
            gap={1.5}
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            {memoizedExpertise.map((item, index) => (
              <ExpertiseChip
                key={item.label}
                item={item}
                index={index}
                shouldAnimate={shouldAnimate}
              />
            ))}
          </Box>

          {/* Call to Action */}
          <Box mt={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button
                variant="contained"
                size="large"
                component="a"
                href="mailto:gadingadityaperdana@gmail.com"
                sx={{
                  backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  fontSize: '1.12rem',
                  py: 1.6,
                  px: 4.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 22px 34px rgba(99, 102, 241, 0.28)',
                  '&:hover': {
                    boxShadow: '0 26px 40px rgba(99, 102, 241, 0.35)',
                    transform: shouldAnimate ? 'translateY(-3px)' : 'none'
                  },
                  transition: 'all 0.25s ease-in-out'
                }}
              >
                Start a Project
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Container>
    </Box>
  );
});

OptimizedModernContact.displayName = 'OptimizedModernContact';

export default OptimizedModernContact;