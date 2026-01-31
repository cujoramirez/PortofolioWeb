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
          gap: 2,
          py: 6,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i === 1 
                ? theme.palette.primary.main 
                : alpha(theme.palette.primary.main, 0.3),
              boxShadow: i === 1 
                ? `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}` 
                : 'none',
            }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'line') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 6,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 2,
            borderRadius: 1,
            background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
          }}
        />
      </Box>
    );
  }

  // Default: gradient
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
          ${alpha(theme.palette.primary.main, 0.1)} 20%, 
          ${alpha(theme.palette.primary.main, 0.3)} 50%, 
          ${alpha(theme.palette.primary.main, 0.1)} 80%, 
          transparent 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: theme.palette.primary.main,
          boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}, 0 0 30px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
      }}
    />
  );
});

SectionDivider.displayName = 'SectionDivider';

export default SectionDivider;
