// Component added by Ansh - github.com/ansh-dhanani

import {
  memo,
  useMemo,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
} from 'react';

export type GradualBlurProps = PropsWithChildren<{
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  zIndex?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  opacity?: number;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  responsive?: boolean;
  mobileHeight?: string;
  tabletHeight?: string;
  desktopHeight?: string;
  mobileWidth?: string;
  tabletWidth?: string;
  desktopWidth?: string;
  preset?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'subtle'
    | 'intense'
    | 'smooth'
    | 'sharp'
    | 'header'
    | 'footer'
    | 'sidebar'
    | 'page-header'
    | 'page-footer';
  gpuOptimized?: boolean;
  hoverIntensity?: number;
  target?: 'parent' | 'page';
  onAnimationComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}>;

const DEFAULT_CONFIG: Partial<GradualBlurProps> = {
  position: 'bottom',
  strength: 1,
  height: '6rem',
  divCount: 5,
  exponential: false,
  zIndex: 1000,
  animated: false,
  duration: '0.3s',
  easing: 'ease-out',
  opacity: 1,
  curve: 'linear',
  responsive: false,
  target: 'parent',
  className: '',
  style: {},
};

const PRESETS: Record<string, Partial<GradualBlurProps>> = {
  top: { position: 'top', height: '6rem' },
  bottom: { position: 'bottom', height: '6rem' },
  left: { position: 'left', height: '6rem' },
  right: { position: 'right', height: '6rem' },
  subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
  intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
  smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
  sharp: { height: '5rem', curve: 'linear', divCount: 4 },
  header: { position: 'top', height: '8rem', curve: 'ease-out' },
  footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
  sidebar: { position: 'left', height: '6rem', strength: 2.5 },
  'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
  'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 },
};

const CURVE_FUNCTIONS: Record<string, (progress: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  'ease-in': (p) => p * p,
  'ease-out': (p) => 1 - Math.pow(1 - p, 2),
  'ease-in-out': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
};

const mergeConfigs = (...configs: Partial<GradualBlurProps>[]): Partial<GradualBlurProps> => {
  return configs.reduce((acc, config) => ({ ...acc, ...config }), {});
};

const getGradientDirection = (position: string): string => {
  const directions: Record<string, string> = {
    top: 'to top',
    bottom: 'to bottom',
    left: 'to left',
    right: 'to right',
  };
  return directions[position] || 'to bottom';
};

const debounce = <T extends (...args: any[]) => void>(fn: T, wait: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), wait);
  };
};

const RESPONSIVE_KEY_MAP = {
  height: { mobile: 'mobileHeight', tablet: 'tabletHeight', desktop: 'desktopHeight' },
  width: { mobile: 'mobileWidth', tablet: 'tabletWidth', desktop: 'desktopWidth' },
} as const satisfies Record<'height' | 'width', {
  mobile: keyof GradualBlurProps;
  tablet: keyof GradualBlurProps;
  desktop: keyof GradualBlurProps;
}>;

const useResponsiveDimension = (
  responsive: boolean | undefined,
  config: Required<GradualBlurProps>,
  key: 'height' | 'width',
) => {
  const [value, setValue] = useState<string | undefined>(config[key]);

  useEffect(() => {
    if (!responsive || typeof window === 'undefined') {
      return;
    }

    const calculate = () => {
      const width = window.innerWidth;
      let current = config[key];
      const responsiveKeys = RESPONSIVE_KEY_MAP[key];
      const mobileValue = config[responsiveKeys.mobile];
      const tabletValue = config[responsiveKeys.tablet];
      const desktopValue = config[responsiveKeys.desktop];

      if (width <= 480 && typeof mobileValue === 'string') {
        current = mobileValue;
      } else if (width <= 768 && typeof tabletValue === 'string') {
        current = tabletValue;
      } else if (width <= 1024 && typeof desktopValue === 'string') {
        current = desktopValue;
      }
      setValue(current);
    };

    const handler = debounce(calculate, 100);
    calculate();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [responsive, config, key]);

  return responsive ? value : config[key];
};

const useIntersectionObserver = (ref: RefObject<HTMLDivElement | null>, shouldObserve: boolean = false) => {
  const [isVisible, setIsVisible] = useState(!shouldObserve);

  useEffect(() => {
    if (!shouldObserve || !ref.current || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.1 });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, shouldObserve]);

  return isVisible;
};

const GradualBlurComponent = (props: GradualBlurProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const config = useMemo(() => {
    const presetConfig = props.preset && PRESETS[props.preset] ? PRESETS[props.preset] : {};
    return mergeConfigs(DEFAULT_CONFIG, presetConfig, props) as Required<GradualBlurProps>;
  }, [props]);

  const responsiveHeight = useResponsiveDimension(config.responsive, config, 'height');
  const responsiveWidth = useResponsiveDimension(config.responsive, config, 'width');
  const isVisible = useIntersectionObserver(containerRef, config.animated === 'scroll');

  const blurDivs = useMemo(() => {
  const divs: ReactNode[] = [];
    const safeDivCount = Math.max(1, config.divCount);
    const increment = 100 / safeDivCount;
    const currentStrength = isHovered && config.hoverIntensity ? config.strength * config.hoverIntensity : config.strength;
    const curveFunc = CURVE_FUNCTIONS[config.curve] || CURVE_FUNCTIONS.linear;

    for (let index = 1; index <= safeDivCount; index += 1) {
      let progress = index / safeDivCount;
      progress = curveFunc(progress);

      let blurValue: number;
      if (config.exponential) {
        blurValue = Math.pow(2, progress * 4) * 0.0625 * currentStrength;
      } else {
        blurValue = 0.0625 * (progress * safeDivCount + 1) * currentStrength;
      }

      const p1 = Math.round((increment * index - increment) * 10) / 10;
      const p2 = Math.round(increment * index * 10) / 10;
      const p3 = Math.round((increment * index + increment) * 10) / 10;
      const p4 = Math.round((increment * index + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) {
        gradient += `, black ${p3}%`;
      }
      if (p4 <= 100) {
        gradient += `, transparent ${p4}%`;
      }

      const direction = getGradientDirection(config.position);

      const divStyle: CSSProperties = {
        maskImage: `linear-gradient(${direction}, ${gradient})`,
        WebkitMaskImage: `linear-gradient(${direction}, ${gradient})`,
        backdropFilter: `blur(${blurValue.toFixed(3)}rem)`,
        opacity: config.opacity,
        transition:
          config.animated && config.animated !== 'scroll'
            ? `backdrop-filter ${config.duration} ${config.easing}`
            : undefined,
      };

      divs.push(<div key={index} className="absolute inset-0" style={divStyle} />);
    }

    return divs;
  }, [config, isHovered]);

  const containerStyle: CSSProperties = useMemo(() => {
    const isVertical = config.position === 'top' || config.position === 'bottom';
    const isHorizontal = config.position === 'left' || config.position === 'right';
    const isPageTarget = config.target === 'page';

    const baseStyle: CSSProperties = {
      position: isPageTarget ? 'fixed' : 'absolute',
      pointerEvents: config.hoverIntensity ? 'auto' : 'none',
      opacity: isVisible ? 1 : 0,
      transition: config.animated ? `opacity ${config.duration} ${config.easing}` : undefined,
      zIndex: isPageTarget ? config.zIndex + 100 : config.zIndex,
      ...config.style,
    };

    if (isVertical) {
      baseStyle.height = responsiveHeight;
      baseStyle.width = responsiveWidth || '100%';
      baseStyle.left = 0;
      baseStyle.right = 0;
      baseStyle[config.position] = 0;
    } else if (isHorizontal) {
      baseStyle.width = responsiveWidth || responsiveHeight;
      baseStyle.height = '100%';
      baseStyle.top = 0;
      baseStyle.bottom = 0;
      baseStyle[config.position] = 0;
    }

    if (isPageTarget) {
      baseStyle.left = baseStyle.left ?? 0;
      baseStyle.right = baseStyle.right ?? 0;
      baseStyle.top = baseStyle.top ?? undefined;
      baseStyle.bottom = baseStyle.bottom ?? undefined;
    }

    return baseStyle;
  }, [config, responsiveHeight, responsiveWidth, isVisible]);

  const { hoverIntensity, animated, onAnimationComplete, duration } = config;

  useEffect(() => {
    if (isVisible && animated === 'scroll' && onAnimationComplete) {
      const timeoutId = window.setTimeout(() => onAnimationComplete(), parseFloat(duration) * 1000);
      return () => window.clearTimeout(timeoutId);
    }
    return undefined;
  }, [isVisible, animated, onAnimationComplete, duration]);

  return (
    <div
      ref={containerRef}
      className={`gradual-blur relative isolate ${config.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} ${config.className ?? ''}`}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="relative h-full w-full">{blurDivs}</div>
      {props.children ? <div className="relative">{props.children}</div> : null}
    </div>
  );
};

const GradualBlur = memo(GradualBlurComponent);
GradualBlur.displayName = 'GradualBlur';
(GradualBlur as unknown as { PRESETS: typeof PRESETS }).PRESETS = PRESETS;
(GradualBlur as unknown as { CURVE_FUNCTIONS: typeof CURVE_FUNCTIONS }).CURVE_FUNCTIONS = CURVE_FUNCTIONS;
export default GradualBlur;

const injectStyles = () => {
  if (typeof document === 'undefined') {
    return;
  }
  const styleId = 'gradual-blur-styles';
  if (document.getElementById(styleId)) {
    return;
  }
  const element = document.createElement('style');
  element.id = styleId;
  element.textContent = '.gradual-blur{pointer-events:none;transition:opacity .3s ease-out}.gradual-blur-inner{pointer-events:none}';
  document.head.appendChild(element);
};

if (typeof document !== 'undefined') {
  injectStyles();
}
