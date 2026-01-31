import { createTheme } from '@mui/material/styles';

// Create a sophisticated Material-UI theme for enterprise portfolio
export const muiTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#1e40af',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#22d3ee',
            light: '#67e8f9',
            dark: '#0891b2',
            contrastText: '#ffffff',
        },
        error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#b91c1c',
        },
        warning: {
            main: '#eab308',
            light: '#facc15',
            dark: '#a16207',
        },
        info: {
            main: '#06b6d4',
            light: '#22d3ee',
            dark: '#0e7490',
        },
        success: {
            main: '#22c55e',
            light: '#4ade80',
            dark: '#15803d',
        },
        background: {
            default: '#0a0a0a',
            paper: 'rgba(38, 38, 38, 0.4)',
        },
        text: {
            primary: '#ffffff',
            secondary: '#d4d4d4',
            disabled: '#525252',
        },
        divider: 'rgba(255, 255, 255, 0.1)',
        action: {
            active: '#60a5fa',
            hover: 'rgba(59, 130, 246, 0.08)',
            selected: 'rgba(59, 130, 246, 0.16)',
            disabled: '#525252',
            disabledBackground: '#262626',
        },
    },

    typography: {
        fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        h1: {
            fontSize: '3.5rem',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        },
        h2: {
            fontSize: '2.75rem',
            fontWeight: 600,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '2.25rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h4: {
            fontSize: '1.875rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        h6: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#e5e5e5',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            color: '#d4d4d4',
        },
        subtitle1: {
            fontSize: '1.125rem',
            fontWeight: 500,
            lineHeight: 1.5,
        },
        subtitle2: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.4,
        },
        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.4,
            color: '#a3a3a3',
        },
        overline: {
            fontSize: '0.75rem',
            fontWeight: 600,
            lineHeight: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
        },
    },

    shape: {
        borderRadius: 12,
    },

    shadows: [
        'none',
        '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
        '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
        '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
        '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
        '0 0 20px rgba(59, 130, 246, 0.25)',
        '0 0 30px rgba(34, 211, 238, 0.25)',
        '0 0 40px rgba(59, 130, 246, 0.19), 0 0 80px rgba(34, 211, 238, 0.13)',
        '0px 24px 48px rgba(0, 0, 0, 0.35), 0px 24px 24px rgba(0, 0, 0, 0.25)',
        '0px 32px 64px rgba(0, 0, 0, 0.40), 0px 32px 32px rgba(0, 0, 0, 0.30)',
        '0px 40px 80px rgba(0, 0, 0, 0.45), 0px 40px 40px rgba(0, 0, 0, 0.35)',
        '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        '0 0 20px rgba(59, 130, 246, 0.13), 0 0 40px rgba(34, 211, 238, 0.09), 0 0 60px rgba(30, 64, 175, 0.06)',
        '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 20px rgba(59, 130, 246, 0.19)',
        '0 32px 96px rgba(0, 0, 0, 0.25), 0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1)',
        '0 40px 120px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.13), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        '0 0 60px rgba(59, 130, 246, 0.25), 0 0 120px rgba(34, 211, 238, 0.19), 0 40px 120px rgba(0, 0, 0, 0.4)',
        '0 60px 180px rgba(0, 0, 0, 0.4), 0 0 80px rgba(59, 130, 246, 0.19), 0 0 160px rgba(34, 211, 238, 0.13)',
        '0 80px 240px rgba(0, 0, 0, 0.5), 0 0 100px rgba(59, 130, 246, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
        '0 100px 300px rgba(0, 0, 0, 0.6), 0 0 120px rgba(59, 130, 246, 0.31), 0 0 240px rgba(34, 211, 238, 0.19)',
        '0 120px 360px rgba(0, 0, 0, 0.7), 0 0 140px rgba(59, 130, 246, 0.38), inset 0 4px 0 rgba(255, 255, 255, 0.2)',
        '0 140px 420px rgba(0, 0, 0, 0.8), 0 0 160px rgba(59, 130, 246, 0.44), 0 0 320px rgba(34, 211, 238, 0.25)',
        '0 160px 480px rgba(0, 0, 0, 0.9), 0 0 180px rgba(59, 130, 246, 0.5), inset 0 8px 0 rgba(255, 255, 255, 0.25)'
    ],

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #0a0a0a 0%, #1e293b 25%, #0f172a 50%, #0a0a0a 75%, #000000 100%)',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#3b82f6 #171717',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#171717',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: 'linear-gradient(45deg, #1e40af, #22d3ee)',
                        borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: 'linear-gradient(45deg, #3b82f6, #67e8f9)',
                    },
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(59, 130, 246, 0.31)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
                    color: '#ffffff',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
                    },
                },
                outlined: {
                    borderColor: '#3b82f6',
                    color: '#60a5fa',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    '&:hover': {
                        borderColor: '#60a5fa',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.25)',
                    },
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundColor: 'rgba(38, 38, 38, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.19)',
                    },
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    fontWeight: 500,
                },
                outlined: {
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.13), rgba(34, 211, 238, 0.13))',
                    border: '1px solid rgba(59, 130, 246, 0.19)',
                    color: '#93c5fd',
                    '&:hover': {
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(34, 211, 238, 0.25))',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)',
                    },
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(10, 10, 10, 0.9)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },

        MuiFab: {
            styleOverrides: {
                root: {
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.13)',
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)',
                    },
                },
                primary: {
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)',
                    color: '#ffffff',
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'rgba(38, 38, 38, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    fontSize: '0.875rem',
                },
            },
        },

        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
            },
        },
    },

    transitions: {
        duration: {
            shortest: 150,
            shorter: 200,
            short: 250,
            standard: 300,
            complex: 375,
            enteringScreen: 225,
            leavingScreen: 195,
        },
        easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
    },

    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
        },
    },

    spacing: 8,

    zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 1300,
        snackbar: 1400,
        tooltip: 1500,
    },
});