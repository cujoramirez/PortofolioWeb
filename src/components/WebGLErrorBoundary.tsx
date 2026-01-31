import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

interface WebGLErrorBoundaryProps {
  children: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isWebGLSupported: boolean;
  retryCount: number;
}

class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isWebGLSupported: this.checkWebGLSupport(),
      retryCount: 0,
    };
  }

  private checkWebGLSupport(): boolean {
    if (typeof document === 'undefined') {
      return true;
    }

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
      return gl != null;
    } catch {
      return false;
    }
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<WebGLErrorBoundaryState> | null {
    const message = error.message ?? '';
    const isWebGLError =
      message.includes('WebGL') ||
      message.includes('Context Lost') ||
      message.includes('getContext');

    return {
      hasError: true,
      error,
      isWebGLSupported: !isWebGLError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('WebGL Error caught by boundary:', error, errorInfo);

    if (typeof document === 'undefined') {
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
      if (!gl) {
        this.setState({ isWebGLSupported: false });
      }
    } catch {
      this.setState({ isWebGLSupported: false });
    }
  }

  private handleRetry = (): void => {
    if (this.state.retryCount >= 3) {
      return;
    }

    this.setState((prevState) => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
            color: 'white',
            padding: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Animated background for graceful fallback */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: `
                radial-gradient(circle at 20% 50%, rgba(30, 64, 175, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(34, 211, 238, 0.1) 0%, transparent 50%)
              `,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <Typography variant="h4" gutterBottom sx={{ color: '#22d3ee', mb: 2 }}>
              {this.state.isWebGLSupported
                ? '3D Experience Temporarily Unavailable'
                : 'WebGL Not Supported'}
            </Typography>

            <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, opacity: 0.8 }}>
              {this.state.isWebGLSupported
                ? 'There was a temporary issue with the 3D graphics. The portfolio will continue with enhanced 2D animations.'
                : "Your browser or device doesn't support WebGL. Don't worry - you'll still get the full portfolio experience with beautiful 2D animations."}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={this.handleRetry}
                sx={{
                  background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  },
                }}
              >
                {this.state.isWebGLSupported ? 'Retry 3D Mode' : 'Continue in 2D'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => this.setState({ hasError: false, error: null })}
                sx={{
                  borderColor: '#22d3ee',
                  color: '#22d3ee',
                  '&:hover': {
                    borderColor: '#0891b2',
                    backgroundColor: 'rgba(34, 211, 238, 0.1)',
                  },
                }}
              >
                Skip to Portfolio
              </Button>
            </Box>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 40,
                height: 40,
                border: '2px solid transparent',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                margin: '20px auto 0',
              }}
            />
          </motion.div>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;
