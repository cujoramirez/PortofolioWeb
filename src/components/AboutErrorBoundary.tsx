import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

type AboutErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

declare global {
    interface Window {
        reportError?: (error: Error, context?: Record<string, unknown>) => void;
    }
}

class AboutErrorBoundary extends Component<PropsWithChildren<unknown>, AboutErrorBoundaryState> {
    constructor(props: PropsWithChildren<unknown>) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): AboutErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('About Section Error:', error, errorInfo);

        window.reportError?.(error, { context: 'About Section', ...errorInfo });
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <Box
                    component="section"
                    id="about"
                    sx={{
                        py: { xs: 8, md: 12 },
                        pb: { xs: 12, md: 16 },
                        minHeight: '100vh',
                        background: 'radial-gradient(125% 125% at 50% 10%, #000 40%, #1e293b 70%, #334155 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: 3,
                            fontSize: { xs: '1.8rem', md: '2.5rem' },
                            fontWeight: 600
                        }}
                    >
                        About Section Temporarily Unavailable
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            mb: 4,
                            maxWidth: 600,
                            lineHeight: 1.6
                        }}
                    >
                        I'm a passionate AI/ML Engineer with 3+ years of experience in developing innovative solutions using machine
                        learning, deep learning, and computer vision technologies. I specialize in creating intelligent systems that solve
                        real-world problems.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={this.handleRetry}
                        sx={{
                            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                            color: 'white',
                            px: 4,
                            py: 1.5,
                            borderRadius: '12px',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                                boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        Reload About Section
                    </Button>

                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.5)',
                            mt: 3,
                            fontSize: '0.9rem'
                        }}
                    >
                        Error: {this.state.error?.message ?? 'Unknown error occurred'}
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default AboutErrorBoundary;

