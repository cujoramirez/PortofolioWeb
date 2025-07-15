import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
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
  Typography
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

// Liquid morphing navigation indicator component
const LiquidIndicator = memo(({ 
  activeIndex, 
  sectionsProgress, 
  navItems, 
  containerRef,
  isMobile 
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0
  });

  // Spring configurations for smooth animations
  const springConfig = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 0.8
  };

  const liquidSpring = useSpring(indicatorStyle.left, springConfig);
  const widthSpring = useSpring(indicatorStyle.width, springConfig);
  const opacitySpring = useSpring(indicatorStyle.opacity, { 
    ...springConfig, 
    stiffness: 400 
  });

  // Calculate liquid morphing position based on scroll progress
  useEffect(() => {
    if (!containerRef.current || isMobile) return;

    const buttons = containerRef.current.querySelectorAll('[data-nav-item]');
    if (buttons.length === 0) return;

    // Calculate weighted position based on section progress
    let weightedLeft = 0;
    let weightedWidth = 0;
    let totalWeight = 0;

    sectionsProgress.forEach((progress, index) => {
      if (progress > 0 && buttons[index]) {
        const button = buttons[index];
        const rect = button.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const buttonLeft = rect.left - containerRect.left;
        const buttonWidth = rect.width;
        
        weightedLeft += (buttonLeft + buttonWidth * 0.1) * progress;
        weightedWidth += (buttonWidth * 0.8) * progress;
        totalWeight += progress;
      }
    });

    if (totalWeight > 0) {
      setIndicatorStyle({
        left: weightedLeft / totalWeight,
        width: Math.max(weightedWidth / totalWeight, 40),
        opacity: Math.min(totalWeight, 1)
      });
    } else if (buttons[activeIndex]) {
      // Fallback to active button position
      const button = buttons[activeIndex];
      const rect = button.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      setIndicatorStyle({
        left: rect.left - containerRect.left + rect.width * 0.1,
        width: rect.width * 0.8,
        opacity: 1
      });
    }
  }, [activeIndex, sectionsProgress, containerRef, isMobile]);

  if (isMobile) return null;

  return (
    <>
      {/* Main liquid indicator */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '36px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 50%, rgba(34, 211, 238, 0.8) 100%)',
          borderRadius: '18px',
          left: liquidSpring,
          width: widthSpring,
          opacity: opacitySpring,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          zIndex: 1,
        }}
        transition={springConfig}
      />
      
      {/* Liquid glow effect */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '44px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(34, 211, 238, 0.3) 100%)',
          borderRadius: '22px',
          left: liquidSpring,
          width: widthSpring,
          opacity: opacitySpring,
          filter: 'blur(8px)',
          zIndex: 0,
        }}
        transition={springConfig}
      />
      
      {/* Particle effects for transitions */}
      <AnimatePresence>
        {sectionsProgress.some((progress, index) => {
          const nextProgress = sectionsProgress[index + 1] || 0;
          return progress > 0.3 && progress < 0.7 && nextProgress > 0.3;
        }) && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: liquidSpring,
              transform: 'translate(-50%, -50%)',
              width: '6px',
              height: '6px',
              background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)',
              borderRadius: '50%',
              zIndex: 2,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

// Enhanced navigation button with liquid interactions
const LiquidNavButton = memo(({ 
  item, 
  index, 
  isActive, 
  sectionProgress, 
  onClick, 
  shouldReduceMotion 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate button state based on progress
  const isInTransition = sectionProgress > 0 && sectionProgress < 1;
  const buttonOpacity = Math.max(0.5, 1 - Math.abs(sectionProgress - 1) * 0.5);
  
  return (
    <motion.div
      data-nav-item
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.05,
        y: -2,
      }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      style={{
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Tooltip title={item.name} arrow placement="bottom">
        <IconButton
          onClick={onClick}
          sx={{
            position: 'relative',
            color: 'white',
            mx: 0.5,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: buttonOpacity,
            transform: isInTransition ? 'scale(1.1)' : 'scale(1)',
            '&:hover': {
              backgroundColor: 'transparent',
            }
          }}
        >
          <motion.div
            animate={{
              scale: isActive ? 1.1 : 1,
              filter: isActive ? 
                'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))' : 
                'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
            }}
            transition={{ duration: 0.3 }}
          >
            <item.icon 
              sx={{ 
                fontSize: '1.4rem',
                color: isActive ? '#ffffff' : '#e2e8f0',
              }} 
            />
          </motion.div>
          
          {/* Ripple effect for interactions */}
          <AnimatePresence>
            {(isHovered || isInTransition) && (
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.6) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </IconButton>
      </Tooltip>
      
      {/* Label for active/hovered state */}
      <AnimatePresence>
        {(isActive || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {item.name}
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Main Liquid Navbar Component
const LiquidNavbar = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionsProgress, setSectionsProgress] = useState([]);
  const [navContainerRef, setNavContainerRef] = useState(null);
  
  const { performanceTier, deviceType } = useSystemProfile();
  
  const { scrollY, scrollYProgress } = useScroll({
    layoutEffect: false
  });
  
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  // Enhanced scroll-based transformations
  const navOpacity = useTransform(scrollY, [0, 50, 100], [0.85, 0.95, 1]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  // Device detection
  const isMobile = deviceType === "mobile";
  const isTablet = deviceType === "tablet";
  const shouldReduceMotion = performanceTier === "low" || isMobile;

  // Navigation items
  const navItems = useMemo(() => [
    { name: "Home", href: "#hero", icon: Home },
    { name: "About", href: "#about", icon: Person },
    { name: "Tech", href: "#technologies", icon: Code },
    { name: "Experience", href: "#experience", icon: Work },
    { name: "Research", href: "#research", icon: Science },
    { name: "Projects", href: "#projects", icon: School },
    { name: "Certificates", href: "#certifications", icon: School },
    { name: "Contact", href: "#contact", icon: ContactMail },
  ], []);

  // Enhanced scroll tracking with section progress
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => item.href.replace("#", ""));
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate progress for each section
      const progress = sections.map((sectionId, index) => {
        const element = document.getElementById(sectionId);
        if (!element) return 0;

        const rect = element.getBoundingClientRect();
        const elementTop = scrollPosition + rect.top;
        const elementHeight = rect.height;
        const elementBottom = elementTop + elementHeight;

        // Calculate how much of the section is visible
        const viewportTop = scrollPosition;
        const viewportBottom = scrollPosition + windowHeight;

        // Section is before viewport
        if (elementBottom < viewportTop) return 0;
        
        // Section is after viewport
        if (elementTop > viewportBottom) return 0;
        
        // Calculate intersection
        const intersectionTop = Math.max(elementTop, viewportTop);
        const intersectionBottom = Math.min(elementBottom, viewportBottom);
        const intersectionHeight = Math.max(0, intersectionBottom - intersectionTop);
        
        // Calculate progress based on how much of the section is in view
        const sectionProgress = intersectionHeight / Math.min(elementHeight, windowHeight);
        
        return Math.min(1, Math.max(0, sectionProgress));
      });

      setSectionsProgress(progress);

      // Find the section with the highest progress
      let maxProgress = 0;
      let maxIndex = 0;
      progress.forEach((prog, index) => {
        if (prog > maxProgress) {
          maxProgress = prog;
          maxIndex = index;
        }
      });

      const newActiveSection = sections[maxIndex];
      if (newActiveSection !== activeSection) {
        setActiveSection(newActiveSection);
        setActiveIndex(maxIndex);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 16); // ~60fps
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener("scroll", throttledHandleScroll);
  }, [navItems, activeSection]);

  // Throttle function for performance
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Smooth scroll function
  const scrollToSection = useCallback((sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
      setIsMenuOpen(false);
    }
  }, [shouldReduceMotion]);

  // Social links
  const socialLinks = [
    {
      icon: LinkedIn,
      tooltip: "LinkedIn Profile",
      href: "https://www.linkedin.com/in/gadingadityaperdana/",
      color: "#0077b5",
    },
    {
      icon: GitHub,
      tooltip: "GitHub Repository", 
      href: "https://github.com/cujoramirez",
      color: "#6e5494",
    },
    {
      icon: Email,
      tooltip: "Send Email",
      href: "#contact",
      color: "#ef4444",
      onClick: () => scrollToSection("#contact")
    },
    {
      icon: Description,
      tooltip: "View Resume",
      href: resumePDF,
      color: "#22c55e",
      target: "_blank"
    },
  ];

  return (
    <>
      {/* Main Navigation Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
        }}
        style={{
          opacity: shouldReduceMotion ? 1 : navOpacity.get(),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          {/* Logo Section */}
          <motion.div
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
              <motion.div
                animate={{
                  rotateY: activeIndex * 45,
                  filter: `hue-rotate(${activeIndex * 30}deg)`,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
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
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)',
                      zIndex: -1,
                      opacity: 0.3,
                      filter: 'blur(6px)',
                    }
                  }}
                >
                  G
                </Box>
              </motion.div>
              
              {!isMobile && (
                <Box>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontWeight: 600, 
                      background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontSize: '1.25rem',
                    }}
                  >
                    Gading Aditya
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                    }}
                  >
                    AI Researcher & Engineer
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Desktop Navigation with Liquid Indicator */}
          {!isMobile && !isTablet && (
            <Box 
              ref={setNavContainerRef}
              sx={{ 
                position: 'relative',
                display: 'flex', 
                alignItems: 'center',
                px: 2,
                py: 1,
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Liquid Indicator */}
              <LiquidIndicator
                activeIndex={activeIndex}
                sectionsProgress={sectionsProgress}
                navItems={navItems}
                containerRef={{ current: navContainerRef }}
                isMobile={isMobile}
              />
              
              {/* Navigation Buttons */}
              {navItems.map((item, index) => (
                <LiquidNavButton
                  key={item.name}
                  item={item}
                  index={index}
                  isActive={activeSection === item.href.replace("#", "")}
                  sectionProgress={sectionsProgress[index] || 0}
                  onClick={() => scrollToSection(item.href)}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </Box>
          )}

          {/* Social Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {socialLinks.map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Tooltip title={link.tooltip} arrow>
                    <IconButton
                      href={link.href}
                      target={link.target}
                      onClick={link.onClick}
                      sx={{
                        color: 'white',
                        '&:hover': {
                          color: link.color,
                          backgroundColor: `${link.color}20`,
                        }
                      }}
                    >
                      <link.icon />
                    </IconButton>
                  </Tooltip>
                </motion.div>
              ))}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {(isMobile || isTablet) && (
            <IconButton
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              sx={{
                color: '#6366f1',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
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

        {/* Enhanced Progress Bar */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 50%, #22d3ee 100%)',
            transformOrigin: 'left',
            scaleX: scrollYProgress,
          }}
        />
      </AppBar>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (isMobile || isTablet) && (
          <>
            <Backdrop
              open={isMenuOpen}
              onClick={() => setIsMenuOpen(false)}
              sx={{ zIndex: 1200 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              style={{
                position: 'fixed',
                top: '80px',
                right: '16px',
                left: isMobile ? '16px' : 'auto',
                zIndex: 1300,
                width: isMobile ? 'auto' : '320px',
              }}
            >
              <Box
                sx={{
                  background: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  p: 3,
                }}
              >
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box
                      onClick={() => scrollToSection(item.href)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        py: 1.5,
                        px: 2,
                        mb: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        color: activeSection === item.href.replace("#", "") ? '#6366f1' : 'white',
                        backgroundColor: activeSection === item.href.replace("#", "") ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          transform: 'translateX(8px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <item.icon />
                      <Typography>{item.name}</Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isMenuOpen && (
        <Zoom in={trigger}>
          <Fab
            component={motion.div}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollToSection("#contact")}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
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

LiquidNavbar.displayName = "LiquidNavbar";

export default LiquidNavbar;
