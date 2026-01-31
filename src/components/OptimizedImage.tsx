import { useState, useRef, useEffect, memo, type CSSProperties, type ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with:
 * - Native lazy loading
 * - Loading state with blur placeholder
 * - Error handling
 * - CSS transition animations
 * - Responsive sizing
 */
const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  objectFit = 'cover',
  onLoad,
  onError,
  ...imgProps
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already loaded (cached)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate a simple blur placeholder color based on the filename
  const defaultBlurColor = 'rgba(59, 130, 246, 0.1)';
  const placeholderStyle: CSSProperties = placeholder === 'blur' && !isLoaded ? {
    background: blurDataURL || defaultBlurColor,
    filter: 'blur(20px)',
    transform: 'scale(1.1)',
  } : {};

  const baseStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || 'auto',
    objectFit,
    ...style,
  };

  const imageStyle: CSSProperties = {
    ...baseStyle,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  if (hasError) {
    return (
      <div 
        className={className}
        style={{
          ...baseStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(59, 130, 246, 0.1)',
          color: 'rgba(148, 163, 184, 0.8)',
          fontSize: '0.875rem',
        }}
        role="img"
        aria-label={`Failed to load: ${alt}`}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div 
      className={className} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        width: baseStyle.width,
        height: baseStyle.height,
      }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            ...placeholderStyle,
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyle}
        {...imgProps}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
