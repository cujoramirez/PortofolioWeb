// hooks/useSystemProfile.js
import { useState, useEffect } from "react";

export function useSystemProfile() {
  const [profile, setProfile] = useState({
    performanceTier: "mid", // "low" | "mid" | "high"
    deviceType: "desktop",   // "mobile" | "tablet" | "desktop"
  });

  useEffect(() => {
    const updateProfile = () => {
      let performanceTier = "high";
      let deviceType = "desktop";

      // ----- PERFORMANCE TIER DETECTION -----
      const deviceMemory = navigator.deviceMemory || 6;
      // You can add more checks (e.g., CPU cores, older iOS versions, etc.)
      if (deviceMemory <= 4) {
        performanceTier = "low";
      } else if (deviceMemory <= 6) {
        performanceTier = "mid";
      } else {
        performanceTier = "high";
      }

      // ----- DEVICE TYPE DETECTION -----
      const userAgent = navigator.userAgent.toLowerCase();
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Improved mobile detection that works even in desktop mode
      const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isIpad = /ipad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasSmallScreen = width <= 768;
      const hasPortraitOrientation = height > width;
      
      // Force mobile detection for touch devices with small screens or mobile user agents
      if (isMobileUA || (isTouchDevice && (hasSmallScreen || hasPortraitOrientation))) {
        deviceType = "mobile";
      } else if (isIpad || (isTouchDevice && width >= 768 && width < 1024)) {
        deviceType = "tablet";
      } else if (width < 1024 && isTouchDevice) {
        // Catch tablets in portrait mode
        deviceType = "tablet";
      }

      setProfile({ performanceTier, deviceType });
    };

    // Initial detection
    updateProfile();

    // Update on resize/orientation change
    window.addEventListener('resize', updateProfile);
    window.addEventListener('orientationchange', updateProfile);
    
    return () => {
      window.removeEventListener('resize', updateProfile);
      window.removeEventListener('orientationchange', updateProfile);
    };
  }, []);

  return profile;
}

