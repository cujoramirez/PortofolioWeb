import { useState, useEffect } from 'react';

type PerformanceTier = 'low' | 'mid' | 'high';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface SystemProfile {
    performanceTier: PerformanceTier;
    deviceType: DeviceType;
}

// Default to high performance to avoid blocking animations on first render
const DEFAULT_PROFILE: SystemProfile = {
    performanceTier: 'high',
    deviceType: 'desktop'
};

const getNavigator = () => (typeof navigator !== 'undefined' ? navigator : undefined);
const getWindow = () => (typeof window !== 'undefined' ? window : undefined);

// Cache the profile to avoid recalculating
let cachedProfile: SystemProfile | null = null;

export function useSystemProfile(): SystemProfile {
    const [profile, setProfile] = useState<SystemProfile>(() => cachedProfile || DEFAULT_PROFILE);

    useEffect(() => {
        // If already cached, skip calculation
        if (cachedProfile) {
            setProfile(cachedProfile);
            return;
        }

        const nav = getNavigator();
        const win = getWindow();

        if (!nav || !win) {
            return undefined;
        }

        const withDeviceMemory = nav as Navigator & { deviceMemory?: number };

        const updateProfile = () => {
            let performanceTier: PerformanceTier = 'high';
            let deviceType: DeviceType = 'desktop';

            const deviceMemory = withDeviceMemory.deviceMemory ?? 6;

            if (deviceMemory <= 4) {
                performanceTier = 'low';
            } else if (deviceMemory <= 6) {
                performanceTier = 'mid';
            }

            const userAgent = nav.userAgent.toLowerCase();
            const { innerWidth: width, innerHeight: height } = win;

            const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
            const isIpad = /ipad/i.test(userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
            const isTouchDevice = 'ontouchstart' in win || nav.maxTouchPoints > 0;
            const hasSmallScreen = width <= 768;
            const hasPortraitOrientation = height > width;

            if (isMobileUA || (isTouchDevice && (hasSmallScreen || hasPortraitOrientation))) {
                deviceType = 'mobile';
            } else if (isIpad || (isTouchDevice && width >= 768 && width < 1024)) {
                deviceType = 'tablet';
            } else if (width < 1024 && isTouchDevice) {
                deviceType = 'tablet';
            }

            const newProfile = { performanceTier, deviceType };
            cachedProfile = newProfile;
            setProfile(newProfile);
        };

        updateProfile();

        win.addEventListener('resize', updateProfile);
        win.addEventListener('orientationchange', updateProfile);

        return () => {
            win.removeEventListener('resize', updateProfile);
            win.removeEventListener('orientationchange', updateProfile);
        };
    }, []);

    return profile;
}

