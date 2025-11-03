import { useState, useEffect } from 'react';

type PerformanceTier = 'low' | 'mid' | 'high';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface SystemProfile {
    performanceTier: PerformanceTier;
    deviceType: DeviceType;
}

const DEFAULT_PROFILE: SystemProfile = {
    performanceTier: 'mid',
    deviceType: 'desktop'
};

const getNavigator = () => (typeof navigator !== 'undefined' ? navigator : undefined);
const getWindow = () => (typeof window !== 'undefined' ? window : undefined);

export function useSystemProfile(): SystemProfile {
    const [profile, setProfile] = useState<SystemProfile>(DEFAULT_PROFILE);

    useEffect(() => {
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

            setProfile({ performanceTier, deviceType });
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

