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
                        minHeight: '100dvh',
                        backgroundColor: 'var(--app-palette-bg-base)',
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
                            color: 'var(--app-palette-text-primary)',
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
                            color: 'var(--app-palette-text-secondary)',
                            mb: 4,
                            maxWidth: 600,
                            lineHeight: 1.6
                        }}
                    >
                        First-generation undergraduate AI Researcher specializing in Computer Vision and Deep Learning. 
                        Author of five peer-reviewed publications with expertise in Vision Transformers, Ensemble Learning, 
                        and Model Calibration. Currently an Apple Developer Academy Scholar.
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={this.handleRetry}
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            px: 4,
                            py: 1.5,
                            borderRadius: '12px',
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 10px 25px color-mix(in srgb, var(--app-palette-primary-main) 35%, transparent)',
                            '&:hover': {
                                backgroundColor: 'primary.dark',
                                boxShadow: '0 15px 35px color-mix(in srgb, var(--app-palette-primary-main) 45%, transparent)',
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
                            color: 'var(--app-palette-label-tertiary)',
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

