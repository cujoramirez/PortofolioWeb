import { memo } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Box } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

export interface DetectionFrameProps {
  children?: ReactNode;
  /** Render a one-shot scanline sweep (top -> bottom) when `active` flips true. */
  scan?: boolean;
  /** Drives the scanline (e.g. from useInView). */
  active?: boolean;
  /** Small mono confidence-style tag (e.g. "0.98"), pinned top-right. Decorative. */
  tag?: string;
  /** Corner bracket arm length in px. */
  bracket?: number;
  /** Brighten brackets + subtle tint/lift on hover (for "selectable" rows). */
  interactive?: boolean;
  sx?: SxProps<Theme>;
}

const STROKE_REST = 'color-mix(in srgb, var(--app-palette-primary-main) 48%, transparent)';
const STROKE_HOVER = 'color-mix(in srgb, var(--app-palette-primary-main) 92%, transparent)';

const DetectionFrame = memo(function DetectionFrame({
  children,
  scan = false,
  active = false,
  tag,
  bracket = 11,
  interactive = false,
  sx,
}: DetectionFrameProps) {
  const prefersReducedMotion = useReducedMotion();
  const showScan = scan && active && !prefersReducedMotion;

  // Brackets read the --df-stroke custom property so hover can brighten them with a transition.
  const cornerBase = {
    position: 'absolute' as const,
    width: bracket,
    height: bracket,
    borderColor: 'var(--df-stroke)',
    borderStyle: 'solid',
    borderWidth: 0,
    pointerEvents: 'none' as const,
    transition: 'border-color 0.25s ease',
  };

  const baseSx: SxProps<Theme> = {
    position: 'relative',
    borderRadius: '6px',
    '--df-stroke': STROKE_REST,
    ...(interactive
      ? {
          transition: 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1), background-color 0.25s ease',
          // Hover affordance only where hover is real; on touch it would stick after a tap.
          '@media (hover: hover)': {
            '&:hover': {
              '--df-stroke': STROKE_HOVER,
              backgroundColor: 'color-mix(in srgb, var(--app-palette-primary-main) 6%, transparent)',
              transform: 'translateX(3px)',
            },
          },
        }
      : {}),
  };

  return (
    <Box sx={[baseSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}

      {/* Detection corner brackets */}
      <Box aria-hidden sx={{ ...cornerBase, top: -1, left: -1, borderTopWidth: 1.5, borderLeftWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, top: -1, right: -1, borderTopWidth: 1.5, borderRightWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, bottom: -1, left: -1, borderBottomWidth: 1.5, borderLeftWidth: 1.5 }} />
      <Box aria-hidden sx={{ ...cornerBase, bottom: -1, right: -1, borderBottomWidth: 1.5, borderRightWidth: 1.5 }} />

      {/* Confidence tag */}
      {tag && (
        <Box
          aria-hidden
          component="span"
          sx={{
            position: 'absolute',
            top: -8,
            right: 8,
            px: 0.5,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            lineHeight: 1.5,
            letterSpacing: '0.05em',
            color: 'var(--df-stroke)',
            bgcolor: 'var(--app-palette-bg-elevated)',
            borderRadius: '3px',
          }}
        >
          {tag}
        </Box>
      )}

      {/* One-shot scanline */}
      {showScan && (
        <motion.div
          aria-hidden
          initial={{ top: '0%', opacity: 0 }}
          animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, transparent, color-mix(in srgb, var(--app-palette-secondary-main) 80%, transparent), transparent)',
            boxShadow: '0 0 12px color-mix(in srgb, var(--app-palette-secondary-main) 55%, transparent)',
          }}
        />
      )}
    </Box>
  );
});

export default DetectionFrame;
