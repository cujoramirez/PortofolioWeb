import React, { useState, useEffect, memo, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
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
import resumePDF from "../assets/Gading_Resume.pdf";

// Modern glassmorphism navbar with enterprise design
const ModernNavbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [navItemPositions, setNavItemPositions] = useState({});
  const [liquidIndicatorPosition, setLiquidIndicatorPosition] = useState({ x: 0, width: 0 });
  const navRef = useRef(null);
  const { performanceTier, deviceType } = useSystemProfile();
  
  // Enhanced motion values for liquid animations
  const liquidX = useMotionValue(0);
  const liquidWidth = useMotionValue(0);
  const liquidOpacity = useMotionValue(0);
  
  // Spring configurations for smooth liquid motion
  const springX = useSpring(liquidX, { 
    stiffness: 300, 
    damping: 30, 
    mass: 0.8 
  });
  const springWidth = useSpring(liquidWidth, { 
    stiffness: 280, 
    damping: 35, 
    mass: 0.9 
  });
  const springOpacity = useSpring(liquidOpacity, { 
    stiffness: 400, 
    damping: 40 
  });
  
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

  // Device detection with CSS fallback
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const shouldReduceMotion = performanceTier === "low" || isMobile;

  // Additional CSS-based mobile detection as fallback
  const [isMobileCSS, setIsMobileCSS] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileCSS(window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use either JavaScript or CSS detection for mobile
  const isMobileDevice = isMobile || isMobileCSS;
  const isTabletDevice = isTablet || (window.innerWidth > 768 && window.innerWidth < 1024 && (isMobile || isMobileCSS));

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
      tooltip: "View Resume",
      href: resumePDF,
      color: "#22c55e",
      label: "Resume",
      viewResume: true
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

  // Track active section with liquid animation support
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.href.replace("#", ""));
      const scrollPosition = window.scrollY + 100;
      
      let currentSection = "hero";
      let maxVisibleArea = 0;
      let interpolationData = [];

      // Calculate visibility percentage for each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          const viewportHeight = window.innerHeight;
          const scrollTop = window.scrollY;
          
          // Calculate visible area of this section
          const visibleTop = Math.max(scrollTop, offsetTop);
          const visibleBottom = Math.min(scrollTop + viewportHeight, offsetTop + offsetHeight);
          const visibleHeight = Math.max(0, visibleBottom - visibleTop);
          const visibilityRatio = visibleHeight / Math.min(offsetHeight, viewportHeight);
          
          interpolationData.push({
            section,
            visibilityRatio,
            index: i
          });
          
          if (visibilityRatio > maxVisibleArea) {
            maxVisibleArea = visibilityRatio;
            currentSection = section;
          }
        }
      }
      
      // Update active section
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
      
      // Update liquid indicator position with interpolation
      updateLiquidIndicator(interpolationData, currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems, activeSection, navItemPositions]);

  // Liquid indicator position calculation
  const updateLiquidIndicator = useCallback((interpolationData, primarySection) => {
    if (!navItemPositions[primarySection] || shouldReduceMotion) return;
    
    // Find two most visible sections for interpolation
    const sortedData = interpolationData
      .filter(data => data.visibilityRatio > 0)
      .sort((a, b) => b.visibilityRatio - a.visibilityRatio)
      .slice(0, 2);
    
    if (sortedData.length === 0) return;
    
    const primary = sortedData[0];
    const secondary = sortedData[1];
    
    const primaryPos = navItemPositions[primary.section];
    if (!primaryPos) return;
    
    let targetX = primaryPos.x;
    let targetWidth = primaryPos.width;
    
    // Interpolate between sections if we have a secondary visible section
    if (secondary && secondary.visibilityRatio > 0.1) {
      const secondaryPos = navItemPositions[secondary.section];
      if (secondaryPos) {
        const interpolationStrength = secondary.visibilityRatio / (primary.visibilityRatio + secondary.visibilityRatio);
        
        // Smooth interpolation with easing
        const easedInterpolation = 1 - Math.pow(1 - interpolationStrength, 3);
        
        if (secondary.index > primary.index) {
          // Moving forward
          targetX = primaryPos.x + (secondaryPos.x - primaryPos.x) * easedInterpolation * 0.3;
          targetWidth = primaryPos.width + (secondaryPos.width - primaryPos.width + Math.abs(secondaryPos.x - primaryPos.x) * 0.5) * easedInterpolation;
        } else {
          // Moving backward
          targetX = secondaryPos.x + (primaryPos.x - secondaryPos.x) * (1 - easedInterpolation * 0.3);
          targetWidth = secondaryPos.width + (primaryPos.width - secondaryPos.width + Math.abs(primaryPos.x - secondaryPos.x) * 0.5) * (1 - easedInterpolation);
        }
      }
    }
    
    // Update motion values
    liquidX.set(targetX);
    liquidWidth.set(Math.max(targetWidth, 60)); // Minimum width
    liquidOpacity.set(1);
  }, [navItemPositions, liquidX, liquidWidth, liquidOpacity, shouldReduceMotion]);

  // Measure nav item positions
  useEffect(() => {
    const measurePositions = () => {
      if (!navRef.current) return;
      
      const positions = {};
      const navItems = navRef.current.querySelectorAll('[data-nav-item]');
      
      navItems.forEach((item) => {
        const section = item.getAttribute('data-nav-item');
        const rect = item.getBoundingClientRect();
        const parentRect = navRef.current.getBoundingClientRect();
        
        positions[section] = {
          x: rect.left - parentRect.left,
          width: rect.width,
          height: rect.height
        };
      });
      
      setNavItemPositions(positions);
    };
    
    measurePositions();
    window.addEventListener('resize', measurePositions);
    
    // Measure after a short delay to ensure layout is complete
    const timer = setTimeout(measurePositions, 100);
    
    return () => {
      window.removeEventListener('resize', measurePositions);
      clearTimeout(timer);
    };
  }, [navItems]);

  // Original simple tracking (kept as fallback)
  useEffect(() => {
    if (shouldReduceMotion) {
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
    }
  }, [navItems, shouldReduceMotion]);

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
          // backdropFilter: 'blur(20px)', // Removed
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
                      // filter: 'blur(4px)', // Removed
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
                      Gading Aditya Perdana
                    </Box>
                    <Box sx={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      AI Researcher & Engineer
                    </Box>
                  </Box>
                )}
              </Box>
            </motion.div>

            {/* Desktop Navigation */}
            {!isMobileDevice && !isTabletDevice && (
              <motion.div 
                ref={navRef}
                variants={containerVariants} 
                initial="hidden" 
                animate="visible"
                style={{ position: 'relative' }}
              >
                {/* Liquid Indicator Background */}
                {!shouldReduceMotion && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: springX,
                      width: springWidth,
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(34, 211, 238, 0.2) 100%)',
                      borderRadius: '24px',
                      opacity: springOpacity,
                      zIndex: 0,
                      filter: 'blur(0.5px)',
                      boxShadow: '0 0 20px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 25,
                      mass: 1
                    }}
                  />
                )}
                
                {/* Navigation Items */}
                <Box sx={{ display: 'flex', gap: 1, position: 'relative', zIndex: 1 }}>
                  {navItems.map((item, index) => (
                    <motion.div key={item.name} variants={itemVariants}>
                      <Tooltip title={item.name} arrow>
                        <Chip
                          data-nav-item={item.href.replace("#", "")}
                          icon={<item.icon />}
                          label={item.name}
                          onClick={() => scrollToSection(item.href)}
                          clickable
                          variant={activeSection === item.href.replace("#", "") ? "filled" : "outlined"}
                          sx={{
                            color: '#ffffff',
                            borderColor: activeSection === item.href.replace("#", "") ? 'transparent' : 'rgba(99, 102, 241, 0.3)',
                            backgroundColor: activeSection === item.href.replace("#", "") ? 'rgba(99, 102, 241, 0.8)' : 'transparent',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            zIndex: 2,
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                              transform: shouldReduceMotion ? 'none' : 'translateY(-3px) scale(1.05)',
                              boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
                              backgroundColor: 'rgba(99, 102, 241, 0.9)',
                              borderColor: 'transparent',
                            },
                            '& .MuiChip-icon': { 
                              color: activeSection === item.href.replace("#", "") ? '#ffffff' : '#a855f7',
                              transition: 'color 0.3s ease'
                            },
                            '&:hover .MuiChip-icon': { 
                              color: '#ffffff'
                            },
                            // Add glow effect for active item
                            ...(activeSection === item.href.replace("#", "") && !shouldReduceMotion && {
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                inset: -2,
                                borderRadius: '24px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                                zIndex: -1,
                                opacity: 0.6,
                                filter: 'blur(8px)',
                              }
                            })
                          }}
                        />
                      </Tooltip>
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            {(isMobileDevice || isTabletDevice) && (
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
        {isMenuOpen && (isMobileDevice || isTabletDevice) && (
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
                left: isMobileDevice ? '16px' : 'auto',
                zIndex: 1300,
                width: isMobileDevice ? 'auto' : '320px',
                maxWidth: isMobileDevice ? 'calc(100vw - 32px)' : '320px',
                maxHeight: '80vh',
                overflowY: 'auto',
              }}
            >
              <Box
                sx={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  // backdropFilter: 'blur(20px)', // Removed
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

                {/* Resume Download Button for Mobile */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Chip
                      icon={<Description />}
                      label="View Resume"
                      onClick={() => {
                        // Open resume in new tab for viewing
                        const newWindow = window.open(resumePDF, '_blank');
                        
                        // Add download functionality to the new window
                        if (newWindow) {
                          newWindow.addEventListener('load', () => {
                            const style = newWindow.document.createElement('style');
                            style.textContent = `
                              .resume-download-btn {
                                position: fixed;
                                top: 20px;
                                right: 20px;
                                z-index: 9999;
                                background: #6366f1;
                                color: white;
                                border: none;
                                padding: 12px 24px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                                transition: all 0.3s ease;
                              }
                              .resume-download-btn:hover {
                                background: #4f46e5;
                                transform: translateY(-2px);
                                box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                              }
                            `;
                            newWindow.document.head.appendChild(style);
                            
                            const downloadBtn = newWindow.document.createElement('button');
                            downloadBtn.textContent = '📥 Download Resume';
                            downloadBtn.className = 'resume-download-btn';
                            downloadBtn.onclick = () => {
                              const link = newWindow.document.createElement('a');
                              link.href = resumePDF;
                              link.download = 'Gading_Aditya_Perdana_Resume.pdf';
                              link.click();
                            };
                            newWindow.document.body.appendChild(downloadBtn);
                          });
                        }
                        setIsMenuOpen(false);
                      }}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        py: 1.5,
                        cursor: 'pointer',
                        color: '#ffffff',
                        borderColor: '#22c55e',
                        backgroundColor: 'transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.4)',
                          backgroundColor: '#22c55e',
                        },
                        '& .MuiChip-icon': { 
                          color: '#22c55e'
                        },
                        '&:hover .MuiChip-icon': { 
                          color: '#ffffff'
                        }
                      }}
                    />
                  </motion.div>
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
