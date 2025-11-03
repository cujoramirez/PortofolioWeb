import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type ElementType,
  type FC,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { alpha, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import { motion, useSpring } from 'framer-motion';
import type { Theme } from '@mui/material/styles';

const MotionBox = motion(Box);

export type MagicBentoVariant =
  | 'featured'
  | 'primary'
  | 'secondary'
  | 'highlight'
  | 'vertical'
  | 'standard'
  | 'wide'
  | 'tall';

export type MagicBentoItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: ElementType | null;
  accentColor?: string;
  gradient?: string;
  badge?: string;
  badgeColor?: string;
  chips?: string[];
  variant?: MagicBentoVariant;
  data?: unknown;
};

export type MagicBentoProps = {
  items: MagicBentoItem[];
  onItemClick?: (item: MagicBentoItem) => void;
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  glowColor?: string;
};

const FALLBACK_GLOW = '132, 99, 255';

const variantStyles: Record<MagicBentoVariant, { gridColumn: any; gridRow?: any; minHeight: any }> = {
  featured: {
    gridColumn: { xs: 'span 12', md: 'span 6' },
    gridRow: { xs: 'span 2', md: 'span 2' },
    minHeight: { xs: 260, md: 360 },
  },
  primary: {
    gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
    minHeight: { xs: 220, md: 240 },
  },
  secondary: {
    gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
    minHeight: { xs: 200, md: 220 },
  },
  highlight: {
    gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
    minHeight: { xs: 200, md: 220 },
  },
  vertical: {
    gridColumn: { xs: 'span 12', md: 'span 3' },
    gridRow: { xs: 'span 1', md: 'span 2' },
    minHeight: { xs: 220, md: 320 },
  },
  standard: {
    gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' },
    minHeight: { xs: 200, md: 210 },
  },
  wide: {
    gridColumn: { xs: 'span 12', md: 'span 6' },
    minHeight: { xs: 220, md: 260 },
  },
  tall: {
    gridColumn: { xs: 'span 12', md: 'span 3' },
    gridRow: { xs: 'span 1', md: 'span 2' },
    minHeight: { xs: 220, md: 320 },
  },
};

const MotionCard: FC<{
  item: MagicBentoItem;
  textAutoHide: boolean;
  enableTilt: boolean;
  enableMagnetism: boolean;
  clickEffect: boolean;
  disableAnimations: boolean;
  onClick?: (item: MagicBentoItem) => void;
}> = memo(({ item, textAutoHide, enableTilt, enableMagnetism, clickEffect, disableAnimations, onClick }) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const tiltX = useSpring(0, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const tiltY = useSpring(0, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const magnetX = useSpring(0, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const magnetY = useSpring(0, { stiffness: 300, damping: 30, restDelta: 0.001 });
  const [isHovered, setIsHovered] = useState(false);

  const resolvedVariant = item.variant && variantStyles[item.variant] ? item.variant : 'standard';
  const variantStyle = variantStyles[resolvedVariant];

  const accentColor = item.accentColor ?? theme.palette.primary.main;
  const gradientBackground = item.gradient
    ?? `linear-gradient(135deg, ${alpha(accentColor, 0.18)}, ${alpha(theme.palette.background.paper, 0.92)})`;

  const IconComponent = item.icon ?? AutoAwesomeIcon;

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if ((!enableTilt && !enableMagnetism) || !cardRef.current) {
      return;
    }

    const bounds = cardRef.current.getBoundingClientRect();
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;
    const normalizedX = Math.max(Math.min(offsetX / bounds.width, 1), 0);
    const normalizedY = Math.max(Math.min(offsetY / bounds.height, 1), 0);

    if (enableTilt) {
      tiltX.set((0.5 - normalizedY) * 35);
      tiltY.set((normalizedX - 0.5) * 35);
    }

    if (enableMagnetism) {
      magnetX.set((normalizedX - 0.5) * 32);
      magnetY.set((normalizedY - 0.5) * 32);
    }
  }, [enableTilt, enableMagnetism, magnetX, magnetY, tiltX, tiltY]);

  const resetTransforms = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
    magnetX.set(0);
    magnetY.set(0);
  }, [magnetX, magnetY, tiltX, tiltY]);

  useEffect(() => {
    if (disableAnimations) {
      resetTransforms();
    }
  }, [disableAnimations, resetTransforms]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(item);
    }
  }, [item, onClick]);

  return (
    <MotionBox
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setIsHovered(false);
        resetTransforms();
      }}
      onPointerEnter={() => {
        setIsHovered(true);
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={clickEffect ? { scale: 0.96 } : undefined}
      style={enableTilt ? { 
        transformStyle: 'preserve-3d' as const, 
        rotateX: tiltX, 
        rotateY: tiltY,
      } : undefined}
      initial={disableAnimations ? undefined : { opacity: 0, y: 32, scale: 0.94 }}
      animate={disableAnimations ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={disableAnimations ? undefined : { duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      sx={{
        ...variantStyle,
        position: 'relative',
        cursor: 'pointer',
        p: { xs: 2.5, md: 3.5 },
        borderRadius: 5,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1.5, md: 2 },
        height: '100%',
        background: gradientBackground,
        border: `1.5px solid ${alpha(accentColor, isHovered ? 0.4 : 0.2)}`,
        boxShadow: isHovered
          ? `0 28px 48px -24px rgba(0, 0, 0, 0.55), 0 0 0 1px ${alpha(accentColor, 0.35)}, inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`
          : `0 14px 28px -20px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`,
        transition: 'box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1), border-color 280ms ease',
        backdropFilter: 'blur(8px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${alpha(accentColor, 0.15)}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 320ms ease',
          pointerEvents: 'none',
        },
      }}
    >
      {item.badge && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.8,
            px: 1.6,
            py: 0.7,
            borderRadius: 999,
            alignSelf: 'flex-start',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
            background: `linear-gradient(135deg, ${alpha(item.badgeColor ?? accentColor, 0.18)}, ${alpha(item.badgeColor ?? accentColor, 0.08)})`,
            color: item.badgeColor ?? accentColor,
            fontWeight: 700,
            transform: 'translateZ(16px)',
            border: `1px solid ${alpha(item.badgeColor ?? accentColor, 0.3)}`,
            boxShadow: `0 4px 12px -8px ${alpha(item.badgeColor ?? accentColor, 0.6)}`,
          }}
        >
          <BlurOnIcon sx={{ fontSize: 14 }} />
          {item.badge}
        </Box>
      )}

      <Stack direction="row" spacing={2} alignItems="center" sx={{ transform: 'translateZ(20px)', minHeight: 0 }}>
        <MotionBox
          animate={isHovered ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
          transition={{ duration: 0.5 }}
          style={enableMagnetism ? { x: magnetX, y: magnetY } : undefined}
          sx={{
            width: 56,
            height: 56,
            minWidth: 56,
            minHeight: 56,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${alpha(accentColor, 0.2)}, ${alpha(accentColor, 0.12)})`,
            color: accentColor,
            boxShadow: `0 16px 32px -20px ${alpha(accentColor, 0.9)}, inset 0 1px 0 0 ${alpha(accentColor, 0.3)}`,
            border: `1px solid ${alpha(accentColor, 0.2)}`,
            transition: 'all 280ms ease',
          }}
        >
          <IconComponent sx={{ fontSize: 28 }} />
        </MotionBox>

        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {item.subtitle && (
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: alpha(accentColor, 0.85),
                fontWeight: 700,
                fontSize: '0.7rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.subtitle}
            </Typography>
          )}
          <Typography 
            variant="h5" 
            component="h3" 
            sx={{ 
              fontWeight: 800, 
              color: theme.palette.text.primary,
              fontSize: { xs: '1.1rem', md: '1.2rem' },
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {item.title}
          </Typography>
        </Box>
      </Stack>

      {item.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            transform: 'translateZ(12px)',
            lineHeight: 1.65,
            fontSize: '0.875rem',
            opacity: 0.85,
            minHeight: 0,
            overflow: 'hidden',
            ...(textAutoHide
              ? {
                  display: '-webkit-box',
                  WebkitLineClamp: resolvedVariant === 'featured' ? 4 : 3,
                  WebkitBoxOrient: 'vertical' as const,
                  textOverflow: 'ellipsis',
                }
              : null),
          }}
        >
          {item.description}
        </Typography>
      )}

      {item.chips && item.chips.length > 0 && (
        <Stack 
          direction="row" 
          spacing={1} 
          flexWrap="wrap" 
          useFlexGap
          sx={{ 
            transform: 'translateZ(10px)',
            mt: 'auto',
          }}
        >
          {item.chips.slice(0, resolvedVariant === 'featured' ? 5 : 3).map((chip) => (
            <Chip
              key={`${item.id}-${chip}`}
              label={chip}
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: alpha(accentColor, 0.15),
                color: accentColor,
                fontWeight: 600,
                fontSize: '0.72rem',
                border: `1px solid ${alpha(accentColor, 0.25)}`,
                height: 26,
                transition: 'all 220ms ease',
                '&:hover': {
                  backgroundColor: alpha(accentColor, 0.22),
                  transform: 'translateY(-1px)',
                },
              }}
            />
          ))}
          {item.chips.length > 3 && resolvedVariant !== 'featured' && (
            <Chip
              key={`${item.id}-more`}
              label={`+${item.chips.length - 3}`}
              size="small"
              sx={{
                borderRadius: 999,
                backgroundColor: alpha(accentColor, 0.2),
                color: accentColor,
                fontWeight: 700,
                fontSize: '0.72rem',
                border: `1px solid ${alpha(accentColor, 0.3)}`,
                height: 26,
              }}
            />
          )}
        </Stack>
      )}

    </MotionBox>
  );
});

MotionCard.displayName = 'MotionCard';

const MagicBento: FC<MagicBentoProps> = ({
  items,
  onItemClick,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  disableAnimations = false,
  spotlightRadius = 320,
  particleCount = 12,
  glowColor,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });

  const resolvedGlow = glowColor ?? FALLBACK_GLOW;

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    setPointer({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setPointer({ x: 0.5, y: 0.5 });
  }, []);

  const starParticles = useMemo(() => {
    if (!enableStars || particleCount <= 0) {
      return [] as Array<{ left: number; top: number; delay: number; size: number }>;
    }

    return Array.from({ length: particleCount }, (_, index) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: index * 0.35,
      size: 2 + Math.random() * 3,
    }));
  }, [enableStars, particleCount]);

  const normalizedItems = useMemo(() => items.filter(Boolean), [items]);

  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <Box
      ref={containerRef}
      onPointerMove={enableSpotlight ? handlePointerMove : undefined}
      onPointerLeave={enableSpotlight ? handlePointerLeave : undefined}
      sx={{
        width: '100%',
        position: 'relative',
        borderRadius: 5,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.85)}, ${alpha(theme.palette.background.default, 0.92)})`,
        border: `1.5px solid ${alpha(theme.palette.primary.main, 0.22)}`,
        boxShadow: `0 2px 0 0 rgba(255, 255, 255, 0.06) inset, 0 80px 160px -100px rgba(0, 0, 0, 0.7), 0 20px 40px -20px rgba(0, 0, 0, 0.4)`,
        p: { xs: 3, md: 4 },
        backdropFilter: 'blur(12px)',
      }}
    >
      {enableBorderGlow && (
        <Box
          sx={{
            position: 'absolute',
            inset: -2,
            borderRadius: 6,
            pointerEvents: 'none',
            background: `linear-gradient(135deg, rgba(${resolvedGlow}, 0.15), transparent, rgba(${resolvedGlow}, 0.08))`,
            opacity: 0.6,
            filter: 'blur(20px)',
          }}
        />
      )}

      {enableSpotlight && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            mixBlendMode: 'soft-light',
            transition: 'background 180ms cubic-bezier(0.4, 0, 0.2, 1)',
            background: `radial-gradient(${spotlightRadius}px circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(${resolvedGlow}, 0.45), transparent 65%)`,
            opacity: 0.9,
          }}
        />
      )}

      {enableStars && (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {starParticles.map((particle, index) => (
            <motion.span
              key={`star-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, delay: particle.delay, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                background: `rgba(${resolvedGlow}, 0.5)`,
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
            />
          ))}
        </Box>
      )}

      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(12, minmax(0, 1fr))', md: 'repeat(12, minmax(0, 1fr))' },
          gap: { xs: 2.5, md: 3 },
          alignItems: 'stretch',
        }}
      >
        {normalizedItems.map((item) => (
          <MotionCard
            key={item.id}
            item={item}
            textAutoHide={textAutoHide}
            enableTilt={enableTilt}
            enableMagnetism={enableMagnetism}
            clickEffect={clickEffect}
            disableAnimations={disableAnimations}
            onClick={onItemClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default memo(MagicBento);
