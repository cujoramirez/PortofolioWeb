// hooks/useSystemProfile.js
import { useState, useEffect } from "react";

export function useSystemProfile() {
  const [profile, setProfile] = useState({
    performanceTier: "mid", // "low" | "mid" | "high"
    deviceType: "desktop",   // "mobile" | "tablet" | "desktop"
  });

  useEffect(() => {
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
    const isMobileUA =
      /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isIpad = /ipad/i.test(userAgent);

    if (isIpad || (isMobileUA && width >= 768 && width < 1024)) {
      deviceType = "tablet";
    } else if (isMobileUA && width < 768) {
      deviceType = "mobile";
    }

    setProfile({ performanceTier, deviceType });
  }, []);

  return profile;
}
