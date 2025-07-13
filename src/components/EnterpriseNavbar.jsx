import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  AppBar, 
  Toolbar, 
  Box, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  useTheme, 
  alpha, 
  Chip,
  Tooltip,
  useMediaQuery,
  Paper,
  Fab,
  Container
} from "@mui/material";
import { 
  Menu as MenuIcon, 
  Close as CloseIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  Work as WorkIcon,
  Science as ScienceIcon,
  FolderSpecial as ProjectsIcon,
  School as CertIcon,
  ContactMail as ContactIcon,
  Download as DownloadIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  KeyboardArrowUp as UpIcon
} from "@mui/icons-material";
import { useSystemProfile } from "./useSystemProfile";
import resumePDF from "../assets/GadingAdityaPerdana-resume.pdf";

const navigationItems = [
  { id: 'home', label: 'Home', icon: HomeIcon, href: '#home' },
  { id: 'about', label: 'About', icon: PersonIcon, href: '#about' },
  { id: 'skills', label: 'Skills', icon: CodeIcon, href: '#technologies' },
  { id: 'experience', label: 'Experience', icon: WorkIcon, href: '#experience' },
  { id: 'research', label: 'Research', icon: ScienceIcon, href: '#research' },
  { id: 'projects', label: 'Projects', icon: ProjectsIcon, href: '#projects' },
  { id: 'certifications', label: 'Certificates', icon: CertIcon, href: '#certifications' },
  { id: 'contact', label: 'Contact', icon: ContactIcon, href: '#contact' }
];

const socialLinks = [
  { icon: LinkedInIcon, href: 'https://linkedin.com/in/gadinggadx', label: 'LinkedIn' },
  { icon: GitHubIcon, href: 'https://github.com/cujoramirez', label: 'GitHub' },
  { icon: ContactIcon, href: '#contact', label: 'Email Me', isInternal: true }
];

const EnterpriseNavbar = memo(() => {
  const theme = useTheme();
  const { performanceTier } = useSystemProfile();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredItem, setHoveredItem] = useState(null);
  const { scrollY } = useScroll();
  
  const useReducedMotion = performanceTier === 'low';

  // Navbar background opacity based on scroll
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.8, 0.95]);
  const navbarBlur = useTransform(scrollY, [0, 100], [10, 20]);

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems.map(item => document.querySelector(item.href));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navigationItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback((href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Logo animation variants
  const logoVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.05,
      rotate: [0, -2, 2, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    }
  };

  // Navigation item variants
  const navItemVariants = {
    initial: { y: 0, scale: 1 },
    hover: {
      y: -2,
      scale: 1.05,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    tap: {
      y: 0,
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Floating action button variants
  const fabVariants = {
    initial: { scale: 1, boxShadow: theme.shadows[6] },
    hover: {
      scale: 1.1,
      boxShadow: theme.shadows[12],
      transition: { duration: 0.3 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Background particle animation
  const ParticleBackground = () => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}
    >
      {!useReducedMotion && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 4,
            height: 4,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: '50%',
            left: `${20 + i * 30}%`,
            top: '50%'
          }}
          animate={{
            x: [0, 20, -20, 0],
            y: [0, -10, 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </Box>
  );

  // Desktop navigation
  const DesktopNav = () => {
    return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
      {navigationItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        
        return (
          <motion.div
            key={item.id}
            variants={navItemVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            style={{ position: 'relative' }}
            onHoverStart={() => setHoveredItem(item.id)}
            onHoverEnd={() => setHoveredItem(null)}
          >
            <Tooltip title={item.label} arrow placement="bottom">
              <Button
                onClick={() => handleNavClick(item.href)}
                sx={{
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.8,
                  borderRadius: 3,
                  background: isActive 
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`
                    : item.id === 'certifications' ? 'linear-gradient(135deg, rgba(255,0,0,0.3), rgba(255,100,100,0.3))' : 'transparent',
                  border: isActive 
                    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    : '1px solid transparent',
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.1)}, transparent)`,
                    transition: 'left 0.5s ease'
                  },
                  '&:hover::before': {
                    left: '100%'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon sx={{ fontSize: 18 }} />
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {item.label}
                  </Box>
                </Box>
                
                {/* Active indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      exit={{ scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: '80%',
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        borderRadius: 1,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Hover glow effect */}
                <AnimatePresence>
                  {hoveredItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 0.2, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle, ${theme.palette.primary.main}, transparent)`,
                        borderRadius: 12,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </AnimatePresence>
              </Button>
            </Tooltip>
          </motion.div>
        );
      })}
    </Box>
    );
  };

  // Mobile drawer
  const MobileDrawer = () => (
    <Drawer
      variant="temporary"
      anchor="right"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: 280,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <motion.div
            variants={logoVariants}
            whileHover="hover"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: theme.shadows[4]
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                G
              </Box>
            </Box>
          </motion.div>
          
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.div
                key={item.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <ListItem
                  component="button"
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    background: isActive 
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`
                      : 'transparent',
                    border: `1px solid ${isActive ? alpha(theme.palette.primary.main, 0.2) : 'transparent'}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                      transform: 'translateX(8px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Icon 
                    sx={{ 
                      mr: 2, 
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary 
                    }} 
                  />
                  <ListItemText 
                    primary={item.label}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.primary
                      }
                    }}
                  />
                </ListItem>
              </motion.div>
            );
          })}
        </List>

        {/* Social links in mobile drawer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.div
                  key={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconButton
                    component={social.isInternal ? "button" : "a"}
                    href={social.isInternal ? undefined : social.href}
                    onClick={social.isInternal ? () => handleNavClick(social.href) : undefined}
                    target={social.isInternal ? undefined : "_blank"}
                    rel={social.isInternal ? undefined : "noopener noreferrer"}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        color: 'white'
                      }
                    }}
                  >
                    <Icon />
                  </IconButton>
                </motion.div>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          opacity: navbarOpacity,
          backdropFilter: `blur(${navbarBlur}px)`
        }}
      >
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.8)})`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            backdropFilter: 'blur(20px)'
          }}
        >
          <ParticleBackground />
          
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              {/* Logo */}
              <motion.div
                variants={logoVariants}
                whileHover="hover"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: { xs: 36, md: 42 },
                    height: { xs: 36, md: 42 },
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    boxShadow: theme.shadows[6],
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(45deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                      transform: 'translateX(-100%)',
                      animation: 'shine 3s infinite'
                    }
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      fontSize: { xs: '1.2rem', md: '1.5rem' },
                      fontWeight: 800,
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    G
                  </Box>
                </Box>
                
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Box
                    component="span"
                    sx={{
                      fontSize: '1.2rem',
                      fontWeight: 600,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Gading Aditya
                  </Box>
                  <Chip
                    label="AI Expert"
                    size="small"
                    sx={{
                      ml: 2,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                      color: theme.palette.primary.main,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      fontSize: '0.7rem'
                    }}
                  />
                </Box>
              </motion.div>

              {/* Desktop Navigation */}
              <DesktopNav />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Social Links - Desktop Only */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 2 }}>
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <motion.div
                        key={social.label}
                        variants={fabVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Tooltip title={social.label} arrow>
                          <IconButton
                            component={social.isInternal ? "button" : "a"}
                            href={social.isInternal ? undefined : social.href}
                            onClick={social.isInternal ? () => handleNavClick(social.href) : undefined}
                            target={social.isInternal ? undefined : "_blank"}
                            rel={social.isInternal ? undefined : "noopener noreferrer"}
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                color: 'white',
                                boxShadow: theme.shadows[8]
                              }
                            }}
                          >
                            <Icon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </motion.div>
                    );
                  })}
                </Box>

                {/* Download Resume Button */}
                <motion.div
                  variants={fabVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    component="a"
                    href={resumePDF}
                    download="Gading_Aditya_Perdana_Resume.pdf"
                    startIcon={<DownloadIcon />}
                    variant="contained"
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      borderRadius: 3,
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      textTransform: 'none',
                      boxShadow: theme.shadows[6],
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                        boxShadow: theme.shadows[12],
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Resume</Box>
                  </Button>
                </motion.div>

                {/* Mobile Menu Button */}
                <Box sx={{ display: { md: 'none' } }}>
                  <IconButton
                    onClick={handleDrawerToggle}
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`
                      }
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                </Box>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
      </motion.div>

      {/* Mobile Drawer */}
      <MobileDrawer />

      {/* Add keyframes for logo shine effect */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
});

EnterpriseNavbar.displayName = 'EnterpriseNavbar';

export default EnterpriseNavbar;
