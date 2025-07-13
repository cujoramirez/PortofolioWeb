import React, { useState, useEffect, memo, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Fab, 
  Tooltip, 
  Box, 
  useScrollTrigger,
  Zoom,
  Backdrop,
  Chip
} from "@mui/material";
import { 
  LinkedIn, 
  GitHub, 
  Email, 
  Description,
  Menu as MenuIcon,
  Close as CloseIcon,
  Home,
  Person,
  Code,
  Work,
  Science,
  School,
  ContactMail
} from "@mui/icons-material";
import { useSystemProfile } from "../components/useSystemProfile.jsx";
import resumePDF from "../assets/GadingAdityaPerdana-resume.pdf";

// Modern glassmorphism navbar with enterprise design
const ModernNavbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { performanceTier, deviceType } = useSystemProfile();
  
  const { scrollY, scrollYProgress } = useScroll({
    layoutEffect: false
  });
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  // Enhanced scroll-based transformations  
  const navOpacity = useTransform(scrollY, [0, 50, 100], [0.95, 0.98, 1]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Device detection
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const shouldReduceMotion = performanceTier === "low" || isMobile;

  // Navigation items with modern icons - Updated to include Certificates
  const navItems = [
    { name: "Home", href: "#hero", icon: Home },
    { name: "About", href: "#about", icon: Person },
    { name: "Tech", href: "#technologies", icon: Code },
    { name: "Experience", href: "#experience", icon: Work },
    { name: "Research", href: "#research", icon: Science },
    { name: "Projects", href: "#projects", icon: School },
    { name: "Certificates", href: "#certifications", icon: School },
    { name: "Contact", href: "#contact", icon: ContactMail },
  ];

  // Social links with enhanced styling
  const socialLinks = [
    {
      icon: LinkedIn,
      tooltip: "LinkedIn Profile",
      href: "https://www.linkedin.com/in/gadingadityaperdana/",
      color: "#0077b5",
      label: "LinkedIn"
    },
    {
      icon: GitHub,
      tooltip: "GitHub Repository",
      href: "https://github.com/cujoramirez",
      color: "#6e5494",
      label: "GitHub"
    },
    {
      icon: Email,
      tooltip: "Send Email",
      href: "#contact",
      color: "#ef4444",
      label: "Contact"
    },
    {
      icon: Description,
      tooltip: "Download Resume",
      href: resumePDF,
      color: "#22c55e",
      label: "Resume",
      download: true
    },
  ];

  // Smooth scroll function
  const scrollToSection = useCallback((sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
      setActiveSection(sectionId.replace("#", ""));
      setIsMenuOpen(false);
    }
  }, [shouldReduceMotion]);

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.href.replace("#", ""));
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" }
    },
    open: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const mobileMenuItemVariants = {
    closed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      {/* Main Navigation Bar - Always Visible and Sticky */}
      <AppBar
        position="fixed"
        elevation={0}
        id="main-navbar"
        sx={{
          backgroundColor: trigger ? 'rgba(10, 10, 10, 0.95)' : 'rgba(10, 10, 10, 0.4)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
          color: '#ffffff',
        }}
        style={{
          opacity: shouldReduceMotion ? 1 : (scrollY <= 0 ? 0.4 : 0.95),
        }}
      >
          <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
            {/* Logo Section */}
            <motion.div
              variants={itemVariants}
              style={{ scale: shouldReduceMotion ? 1 : logoScale }}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            >
              <Box 
                onClick={() => scrollToSection("#hero")}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2, 
                  cursor: 'pointer',
                  py: 1
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                      zIndex: -1,
                      opacity: 0.5,
                      filter: 'blur(4px)',
                    }
                  }}
                >
                  G
                </Box>
                {!isMobile && (
                  <Box>
                    <Box 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: '1.25rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}
                    >
                      Gading Aditya
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      AI Researcher & Engineer
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>

            {/* Desktop Navigation */}
            {!isMobile && !isTablet && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {navItems.map((item, index) => (
                    <motion.div key={item.name} variants={itemVariants}>
                      <Tooltip title={item.name} arrow>
                        <Chip
                          icon={<item.icon />}
                          label={item.name}
                          onClick={() => scrollToSection(item.href)}
                          clickable
                          variant={activeSection === item.href.replace("#", "") ? "filled" : "outlined"}
                          sx={{
                            color: '#ffffff',
                            borderColor: '#6366f1',
                            backgroundColor: activeSection === item.href.replace("#", "") ? '#6366f1' : 'transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                              backgroundColor: '#6366f1',
                            },
                            '& .MuiChip-icon': { 
                              color: activeSection === item.href.replace("#", "") ? '#ffffff' : '#6366f1'
                            },
                            '&:hover .MuiChip-icon': { 
                              color: '#ffffff'
                            }
                          }}
                        />
                      </Tooltip>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            {(isMobile || isTablet) && (
              <IconButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                sx={{
                  color: '#6366f1',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <motion.div
                  animate={{ rotate: isMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </motion.div>
              </IconButton>
            )}

          </Toolbar>

          {/* Progress Bar */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
              transformOrigin: 'left',
              scaleX: shouldReduceMotion ? 0.1 : scrollYProgress,
            }}
          />
        </AppBar>

      {/* Mobile/Tablet Menu */}
      <AnimatePresence>
        {isMenuOpen && (isMobile || isTablet) && (
          <>
            <Backdrop
              open={isMenuOpen}
              onClick={() => setIsMenuOpen(false)}
              sx={{ zIndex: 1200 }}
            />
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                position: 'fixed',
                top: '80px',
                right: '16px',
                zIndex: 1300,
                width: isMobile ? '280px' : '320px',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <Box
                sx={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* Navigation Items */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {navItems.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={mobileMenuItemVariants}
                    >
                      <Chip
                        icon={<item.icon />}
                        label={item.name}
                        onClick={() => scrollToSection(item.href)}
                        variant={activeSection === item.href.replace("#", "") ? "filled" : "outlined"}
                        sx={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 1.5,
                          cursor: 'pointer',
                          color: activeSection === item.href.replace("#", "") ? '#ffffff' : '#ffffff',
                          borderColor: '#6366f1',
                          backgroundColor: activeSection === item.href.replace("#", "") ? '#6366f1' : 'transparent',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                            backgroundColor: '#6366f1',
                          },
                          '& .MuiChip-icon': { 
                            color: activeSection === item.href.replace("#", "") ? '#ffffff' : '#6366f1'
                          },
                          '&:hover .MuiChip-icon': { 
                            color: '#ffffff'
                          }
                        }}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button for Quick Contact */}
      {!isMenuOpen && (
        <Zoom in={trigger}>
          <Fab
            component={motion.div}
            whileHover={shouldReduceMotion ? {} : { scale: 1.1, rotate: 5 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.9 }}
            onClick={() => scrollToSection("#contact")}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
              backgroundColor: '#6366f1',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#4f46e5',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.5)',
              }
            }}
          >
            <ContactMail />
          </Fab>
        </Zoom>
      )}
    </>
  );
});

ModernNavbar.displayName = "ModernNavbar";

export default ModernNavbar;
