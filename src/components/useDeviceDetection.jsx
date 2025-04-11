// useDeviceDetection.jsx
import { useState, useEffect, useMemo } from 'react';

const useDeviceDetection = () => {
  // State variables
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Performance tier mock (replace with your actual implementation)
  const [performanceTier, setPerformanceTier] = useState("high"); // "low", "medium", "high"
  const [deviceType, setDeviceType] = useState("desktop"); // "mobile", "tablet", "desktop"
  
  // Detect iOS Safari for specific optimizations
  const isIOSSafari = useMemo(() => isIOS && isSafari, [isIOS, isSafari]);
  
  useEffect(() => {
    // Mock performance detection
    // In a real implementation, you'd use more sophisticated detection
    if (window.navigator.hardwareConcurrency) {
      if (window.navigator.hardwareConcurrency <= 2) {
        setPerformanceTier("low");
      } else if (window.navigator.hardwareConcurrency <= 4) {
        setPerformanceTier("medium");
      } else {
        setPerformanceTier("high");
      }
    }
    
    // Check if it's a mobile device or tablet
    const checkDeviceType = () => {
      const width = window.innerWidth;
      // Mobile: less than 640px
      const mobileCheck = width < 640;
      // Tablet: between 640px and 1024px
      const tabletCheck = width >= 640 && width < 1024;
      
      setIsMobile(mobileCheck);
      setIsTablet(tabletCheck);
      
      // Set device type
      if (mobileCheck) {
        setDeviceType("mobile");
      } else if (tabletCheck) {
        setDeviceType("tablet");
      } else {
        setDeviceType("desktop");
      }
    };
    
    // Check if it's Safari and/or iOS
    const checkBrowser = () => {
      const isSafariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOSCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      setIsSafari(isSafariCheck);
      setIsIOS(isIOSCheck);
    };
    
    checkDeviceType();
    checkBrowser();
    
    // Add resize listener for responsive behavior
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
  return {
    isMobile,
    isTablet, 
    isSafari,
    isIOS,
    isIOSSafari,
    performanceTier,
    deviceType
  };
};

export default useDeviceDetection;