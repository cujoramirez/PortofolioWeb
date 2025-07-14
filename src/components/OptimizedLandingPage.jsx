import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import ModernNavbar from './ModernNavbar.jsx';
import ModernAbout from './ModernAbout.jsx';
import ModernTechnologies from './ModernTechnologies.jsx';
import ModernExperience from './ModernExperience.jsx';
import ModernResearch from './ModernResearch.jsx';
import ModernProjects from './ModernProjects.jsx';
import Certifications from './certificates.jsx';
import ModernContact from './ModernContact.jsx';
import IntroAnimationOverhauled from './IntroAnimationOverhauled.jsx';
import LandingPage from './LandingPage.jsx';
import FloatingNavBubble from './FloatingNavBubble.jsx';
import EnhancedScrollToTop from './EnhancedScrollToTop.jsx';

const OptimizedLandingPage = ({ onNavbarVisibilityChange }) => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Overhauled Intro Animation - Show first */}
      {!introComplete && (
        <div className="fixed inset-0 z-50">
          <IntroAnimationOverhauled 
            onComplete={() => {
              console.log('Overhauled intro animation completed');
              setIntroComplete(true);
            }}
          />
        </div>
      )}

      {/* Landing Page - Show after intro */}
      {introComplete && (
        <LandingPage 
          introComplete={introComplete}
          onNavbarVisibilityChange={onNavbarVisibilityChange}
        />
      )}
    </div>
  );
  };
