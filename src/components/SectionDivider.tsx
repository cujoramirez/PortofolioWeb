import { memo } from 'react';
import { Box, alpha, useTheme } from '@mui/material';

interface SectionDividerProps {
  variant?: 'gradient' | 'line' | 'dots';
}

const SectionDivider = memo(({ variant = 'gradient' }: SectionDividerProps) => {
  const theme = useTheme();

  if (variant === 'dots') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2.5,
          py: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: i === 1 ? 5 : 3,
              height: i === 1 ? 5 : 3,
              borderRadius: '50%',
              background: i === 1
                ? alpha(theme.palette.primary.main, 0.5)
                : alpha(theme.palette.primary.main, 0.15),
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'line') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Box
          sx={{
            width: 60,
            height: 1,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
          }}
        />
      </Box>
    );
  }

  // Default: gradient - more subtle
  return (
    <Box
      sx={{
        position: 'relative',
        height: 1,
        my: 4,
        mx: 'auto',
        maxWidth: 'lg',
        background: `linear-gradient(90deg,
          transparent 0%,
          ${alpha(theme.palette.primary.main, 0.06)} 20%,
          ${alpha(theme.palette.primary.main, 0.12)} 50%,
          ${alpha(theme.palette.primary.main, 0.06)} 80%,
          transparent 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    />
  );
});

SectionDivider.displayName = 'SectionDivider';

export default SectionDivider;
