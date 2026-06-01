import { forwardRef, memo, useCallback, useRef } from 'react';
import type { CSSProperties, ElementType, MutableRefObject, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { useGlassCapabilities } from '../hooks/useGlassCapabilities';
import './liquidGlass.css';

export interface LiquidGlassProps {
  children?: ReactNode;
  /** Visual weight: 'bold' = brighter specular, 'subtle' = lighter. */
  intensity?: 'bold' | 'subtle';
  /** Corner radius override (px). */
  radius?: number;
  /** Requested blur (px) before device capping. Defaults to 18. */
  blur?: number;
  /** Enable pointer-reactive specular (auto-gated to desktop + motion). */
  interactive?: boolean;
  component?: ElementType;
  className?: string;
  sx?: SxProps<Theme>;
  style?: CSSProperties;
}

const BOLD_SPEC = 0.5;
const SUBTLE_SPEC = 0.3;

const LiquidGlass = memo(
  forwardRef<HTMLDivElement, LiquidGlassProps>(function LiquidGlass(
    { children, intensity = 'bold', radius, blur, interactive = false, component = 'div', className, sx, style },
    ref,
  ) {
    const { canBlur, canRefract, reactiveSpecular, maxBlur } = useGlassCapabilities();
    const elRef = useRef<HTMLElement | null>(null);

    const wantsInteractive = interactive && reactiveSpecular;

    // Track the pointer as pixel coords on the host; the specular layer reads them and
    // moves via GPU transform (no per-frame gradient repaint). On leave we do NOTHING —
    // CSS :hover fades the layer out IN PLACE (no position reset, so it can't drift to center).
    const updateSpec = useCallback((e: ReactPointerEvent<HTMLElement>) => {
      const el = elRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--px', `${e.clientX - rect.left}px`);
      el.style.setProperty('--py', `${e.clientY - rect.top}px`);
    }, []);

    const effectiveBlur = canBlur ? Math.min(blur ?? 18, maxBlur) : 0;

    const classes = [
      'liquid-glass',
      canRefract ? 'liquid-glass--refract' : '',
      wantsInteractive ? 'liquid-glass--interactive' : '',
      canBlur ? '' : 'liquid-glass--no-blur',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    const cssVars = {
      '--lg-spec': intensity === 'bold' ? BOLD_SPEC : SUBTLE_SPEC,
      '--lg-blur': `${effectiveBlur}px`,
      ...(radius != null ? { '--lg-radius': `${radius}px` } : {}),
    } as CSSProperties;

    const setRefs = (node: HTMLElement | null) => {
      elRef.current = node;
      if (typeof ref === 'function') ref(node as HTMLDivElement);
      else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node as HTMLDivElement;
    };

    return (
      <Box
        ref={setRefs}
        component={component}
        className={classes}
        onPointerEnter={wantsInteractive ? updateSpec : undefined}
        onPointerMove={wantsInteractive ? updateSpec : undefined}
        style={{ ...cssVars, ...style }}
        sx={sx}
      >
        {wantsInteractive && (
          <span className="liquid-glass__specwrap" aria-hidden="true">
            <span className="liquid-glass__spec" />
          </span>
        )}
        {children}
      </Box>
    );
  }),
);

LiquidGlass.displayName = 'LiquidGlass';
export default LiquidGlass;
