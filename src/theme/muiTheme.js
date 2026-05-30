import { createTheme } from '@mui/material/styles';

const fonts = {
  display: '"Sora", system-ui, sans-serif',
  body: '"DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

export const muiTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data', cssVarPrefix: 'app' },
  defaultColorScheme: 'dark',
  colorSchemes: {
    dark: {
      palette: {
        mode: 'dark',
        primary: { main: '#3b82f6', light: '#60a5fa', dark: '#1e40af', contrastText: '#fff' },
        secondary: { main: '#22d3ee', light: '#67e8f9', dark: '#0891b2', contrastText: '#0a0a0a' },
        background: { default: '#0a0b0d', paper: '#141518' },
        text: { primary: 'rgba(255,255,255,0.95)', secondary: 'rgba(255,255,255,0.62)', disabled: 'rgba(255,255,255,0.30)' },
        divider: 'rgba(255,255,255,0.10)',
        bg: { base: '#0a0b0d', elevated: '#141518', sunken: '#060708' },
        label: { primary: 'rgba(255,255,255,0.95)', secondary: 'rgba(255,255,255,0.62)', tertiary: 'rgba(255,255,255,0.38)', quaternary: 'rgba(255,255,255,0.20)' },
      },
    },
    light: {
      palette: {
        mode: 'light',
        primary: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#fff' },
        secondary: { main: '#0891b2', light: '#06b6d4', dark: '#0e7490', contrastText: '#fff' },
        background: { default: '#fbfbfd', paper: '#ffffff' },
        text: { primary: 'rgba(0,0,0,0.92)', secondary: 'rgba(0,0,0,0.58)', disabled: 'rgba(0,0,0,0.30)' },
        divider: 'rgba(0,0,0,0.10)',
        bg: { base: '#fbfbfd', elevated: '#ffffff', sunken: '#f1f1f4' },
        label: { primary: 'rgba(0,0,0,0.92)', secondary: 'rgba(0,0,0,0.58)', tertiary: 'rgba(0,0,0,0.48)', quaternary: 'rgba(0,0,0,0.22)' },
      },
    },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.06)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 16px 48px rgba(0,0,0,0.18)',
    ...Array(20).fill('0 16px 48px rgba(0,0,0,0.18)'),
  ],
  typography: {
    fontFamily: fonts.body,
    h1: { fontFamily: fonts.display, fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw + 1rem, 4rem)', lineHeight: 1.08, letterSpacing: '-0.03em' },
    h2: { fontFamily: fonts.display, fontWeight: 700, fontSize: 'clamp(2rem, 3vw + 0.75rem, 2.75rem)', lineHeight: 1.14, letterSpacing: '-0.025em' },
    h3: { fontFamily: fonts.display, fontWeight: 600, fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2rem)', lineHeight: 1.2, letterSpacing: '-0.02em' },
    h4: { fontFamily: fonts.display, fontWeight: 600, fontSize: 'clamp(1.25rem, 1.5vw + 0.5rem, 1.6rem)', lineHeight: 1.3 },
    h5: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.35 },
    h6: { fontFamily: fonts.display, fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.65, letterSpacing: '0.005em' },
    body2: { fontSize: '0.9rem', lineHeight: 1.6 },
    overline: { fontFamily: fonts.mono, fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', backgroundColor: 'var(--app-palette-bg-elevated)', border: '1px solid var(--app-palette-divider)', borderRadius: 16 } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 12, boxShadow: 'none' } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 8, fontWeight: 500 } } },
  },
});
