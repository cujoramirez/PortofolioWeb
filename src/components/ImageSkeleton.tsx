import { memo } from 'react';
import { Box, keyframes, alpha, useTheme } from '@mui/material';

interface ImageSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  aspectRatio?: string;
}

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const ImageSkeleton = memo(({ 
  width = '100%', 
  height = '100%',
  borderRadius = 2,
  aspectRatio,
}: ImageSkeletonProps) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        width,
        height: aspectRatio ? 'auto' : height,
        aspectRatio: aspectRatio || 'auto',
        borderRadius,
        background: `linear-gradient(
          90deg,
          ${alpha(theme.palette.text.primary, 0.04)} 25%,
          ${alpha(theme.palette.text.primary, 0.08)} 50%,
          ${alpha(theme.palette.text.primary, 0.04)} 75%
        )`,
        backgroundSize: '200% 100%',
        animation: `${shimmer} 1.5s ease-in-out infinite`,
      }}
    />
  );
});

ImageSkeleton.displayName = 'ImageSkeleton';

export default ImageSkeleton;
