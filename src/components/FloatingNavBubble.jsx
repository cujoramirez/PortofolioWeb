import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  Box, 
  Fab, 
  Paper, 
  IconButton, 
  Tooltip,
  useTheme, 
  alpha,
  ClickAwayListener,
  Fade
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
  KeyboardArrowUp as UpIcon
} from "@mui/icons-material";

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

const FloatingNavBubble = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();
  
  // Show the bubble when user scrolls down
  const bubbleOpacity = useTransform(scrollY, [300, 400], [0, 1]);
  const bubbleScale = useTransform(scrollY, [300, 400], [0.8, 1]);

  useEffect(() => {
    const handleScroll = () => {
      // Show bubble after scrolling past the main navbar
      setIsVisible(window.scrollY > 400);
      
      // Track active section
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

  const handleNavClick = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsOpen(false);
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false);
  };

  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      x: 100,
      y: 100
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1
      }
    }
  };

  const menuVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: -180
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      x: 50
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    }
  };

  if (!isVisible) return null;

  return (
    <ClickAwayListener onClickAway={() => setIsOpen(false)}>
      <motion.div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1200,
          opacity: bubbleOpacity,
          scale: bubbleScale
        }}
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                position: 'absolute',
                bottom: 80,
                right: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'flex-end'
              }}
            >
              {/* Scroll to Top Button */}
              <motion.div variants={itemVariants}>
                <Tooltip title="Scroll to Top" placement="left" arrow>
                  <Fab
                    size="small"
                    onClick={handleScrollToTop}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                      color: 'white',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('white', 0.2)}`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.primary.dark})`,
                        transform: 'scale(1.1)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                      }
                    }}
                  >
                    <UpIcon />
                  </Fab>
                </Tooltip>
              </motion.div>

              {/* Navigation Items */}
              {navigationItems.reverse().map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.div key={item.id} variants={itemVariants}>
                    <Tooltip title={item.label} placement="left" arrow>
                      <Fab
                        size="small"
                        onClick={() => handleNavClick(item.href)}
                        sx={{
                          background: isActive 
                            ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                            : `rgba(${theme.palette.mode === 'dark' ? '255,255,255' : '0,0,0'}, 0.1)`,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${alpha(isActive ? theme.palette.primary.main : 'white', 0.2)}`,
                          color: isActive ? 'white' : theme.palette.text.primary,
                          boxShadow: isActive 
                            ? `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                            : '0 8px 32px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: isActive 
                              ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.secondary.main, 0.2)})`,
                            transform: 'scale(1.1)',
                            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
                          }
                        }}
                      >
                        <Icon fontSize="small" />
                      </Fab>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Fab
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              width: 64,
              height: 64,
              boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(20px)',
              border: `2px solid ${alpha('white', 0.2)}`,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: '0 16px 50px rgba(0,0,0,0.4)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${alpha('white', 0.2)}, transparent)`,
                transition: 'left 0.6s ease',
              },
              '&:hover::before': {
                left: '100%',
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'menu'}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isOpen ? <CloseIcon /> : <MenuIcon />}
              </motion.div>
            </AnimatePresence>
          </Fab>
        </motion.div>

        {/* Active Section Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            border: `2px solid ${theme.palette.background.paper}`,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'white',
              animation: 'pulse 2s infinite',
            }}
          />
        </Box>

        {/* Pulse Animation */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
        `}</style>
      </motion.div>
    </ClickAwayListener>
  );
};

export default FloatingNavBubble;
