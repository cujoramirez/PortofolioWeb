import { useState, useEffect, useMemo } from 'react';

type PerformanceTier = 'low' | 'medium' | 'high';
type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface DeviceDetectionState {
    isMobile: boolean;
    isTablet: boolean;
    isSafari: boolean;
    isIOS: boolean;
    isIOSSafari: boolean;
    performanceTier: PerformanceTier;
    deviceType: DeviceType;
}

const DEFAULT_STATE: DeviceDetectionState = {
    isMobile: false,
    isTablet: false,
    isSafari: false,
    isIOS: false,
    isIOSSafari: false,
    performanceTier: 'high',
    deviceType: 'desktop'
};

const getWindow = () => (typeof window !== 'undefined' ? window : undefined);
const getNavigator = () => (typeof navigator !== 'undefined' ? navigator : undefined);

const useDeviceDetection = (): DeviceDetectionState => {
    const [state, setState] = useState<DeviceDetectionState>(DEFAULT_STATE);

    useEffect(() => {
        const win = getWindow();
        const nav = getNavigator();

        if (!win || !nav) {
            return undefined;
        }

        const detectPerformanceTier = (): PerformanceTier => {
            const cores = nav.hardwareConcurrency ?? 4;
            if (cores <= 2) return 'low';
            if (cores <= 4) return 'medium';
            return 'high';
        };

        const evaluateDeviceType = () => {
            const width = win.innerWidth;
            const isMobileWidth = width < 640;
            const isTabletWidth = width >= 640 && width < 1024;

            const deviceType: DeviceType = isMobileWidth ? 'mobile' : isTabletWidth ? 'tablet' : 'desktop';

            return {
                isMobile: isMobileWidth,
                isTablet: isTabletWidth,
                deviceType
            };
        };

        const evaluateBrowser = () => {
            const ua = nav.userAgent;
            const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
            const isIOS = /iPad|iPhone|iPod/.test(ua) && !(win as typeof window & { MSStream?: unknown }).MSStream;
            return {
                isSafari,
                isIOS,
                isIOSSafari: isIOS && isSafari
            };
        };

        const updateState = () => {
            const deviceInfo = evaluateDeviceType();
            const browserInfo = evaluateBrowser();

            setState({
                ...deviceInfo,
                ...browserInfo,
                performanceTier: detectPerformanceTier()
            });
        };

        updateState();

        win.addEventListener('resize', updateState);
        return () => win.removeEventListener('resize', updateState);
    }, []);

    return useMemo(() => state, [state]);
};

export default useDeviceDetection;
