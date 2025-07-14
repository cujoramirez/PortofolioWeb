/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./index.html"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                    950: '#1e1b4b'
                },
                secondary: {
                    50: '#ecfeff',
                    100: '#cffafe',
                    200: '#a5f3fc',
                    300: '#67e8f9',
                    400: '#22d3ee',
                    500: '#06b6d4',
                    600: '#0891b2',
                    700: '#0e7490',
                    800: '#155e75',
                    900: '#164e63'
                },
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d'
                },
                warning: {
                    50: '#fefce8',
                    100: '#fef9c3',
                    200: '#fef08a',
                    300: '#fde047',
                    400: '#facc15',
                    500: '#eab308',
                    600: '#ca8a04',
                    700: '#a16207',
                    800: '#854d0e',
                    900: '#713f12'
                },
                error: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d'
                },
                neutral: {
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a'
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
                display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif']
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
                '7xl': ['4.5rem', { lineHeight: '1' }],
                '8xl': ['6rem', { lineHeight: '1' }],
                '9xl': ['8rem', { lineHeight: '1' }]
            },
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
                '5xl': '2.5rem',
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(99, 102, 241, 0.4)',
                'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
                'glow-lg': '0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(34, 211, 238, 0.2)',
                'enterprise': '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                'neural': '0 0 20px rgba(99, 102, 241, 0.2), 0 0 40px rgba(34, 211, 238, 0.15), 0 0 60px rgba(99, 102, 241, 0.1)',
                'glass': '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                'interactive': '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 20px rgba(99, 102, 241, 0.3)',
            },
            backdropBlur: {
                'xs': '2px',
                '4xl': '72px',
            },
            animation: {
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-up': 'slideUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'scale-in': 'scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
                'gradient-x': 'gradientX 3s ease infinite',
                'gradient-y': 'gradientY 3s ease infinite',
                'gradient-xy': 'gradientXY 3s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'spin-slow': 'spin 3s linear infinite',
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(60px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.8)' },
                    '100%': { opacity: '1', transform: 'scale(1)' }
                },
                glowPulse: {
                    '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
                    '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8), 0 0 80px rgba(34, 211, 238, 0.4)' }
                },
                gradientX: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' }
                },
                gradientY: {
                    '0%, 100%': { backgroundPosition: '50% 0%' },
                    '50%': { backgroundPosition: '50% 100%' }
                },
                gradientXY: {
                    '0%, 100%': { backgroundPosition: '0% 0%' },
                    '25%': { backgroundPosition: '100% 0%' },
                    '50%': { backgroundPosition: '100% 100%' },
                    '75%': { backgroundPosition: '0% 100%' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' }
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                'gradient-accent': 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
                'gradient-aurora': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
                'gradient-enterprise': 'linear-gradient(135deg, #1e293b 0%, #334155 25%, #475569 50%, #64748b 75%, #94a3b8 100%)',
                'gradient-neural': 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
                'mesh-gradient': 'radial-gradient(at 40% 20%, #6366f1 0px, transparent 50%), radial-gradient(at 80% 0%, #22d3ee 0px, transparent 50%), radial-gradient(at 40% 50%, #8b5cf6 0px, transparent 50%), radial-gradient(at 80% 50%, #ec4899 0px, transparent 50%), radial-gradient(at 40% 80%, #10b981 0px, transparent 50%), radial-gradient(at 80% 80%, #f59e0b 0px, transparent 50%)',
                'circuit-pattern': `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Cpath d='M30 1v28m0 2v28M1 30h28m2 0h28'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                'dots-pattern': `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322d3ee' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`
            },
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }
        }
    },
    plugins: [
        function({ addUtilities }) {
            const newUtilities = {
                '.text-gradient-primary': {
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text'
                },
                '.text-gradient-secondary': {
                    background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text'
                },
                '.text-gradient-accent': {
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #6366f1 100%)',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                    'background-clip': 'text'
                },
                '.bg-glass': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    // 'backdrop-filter': 'blur(5px)', // Removed
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                },
                '.bg-glass-dark': {
                    background: 'rgba(0, 0, 0, 0.2)',
                    // 'backdrop-filter': 'blur(5px)', // Removed
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                },
                '.bg-enterprise': {
                    background: 'rgba(38, 38, 38, 0.4)',
                    // 'backdrop-filter': 'blur(5px)', // Removed
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }
            addUtilities(newUtilities, ['responsive', 'hover'])
        }
    ],
}