import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        react(),
        // Gzip compression for production
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
        }),
        // Brotli compression (better compression ratio)
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
        }),
    ],
    build: {
        // Target modern browsers for smaller bundles
        target: 'es2020',
        // Inline assets smaller than 4kb
        assetsInlineLimit: 4096,
        // CSS code splitting
        cssCodeSplit: true,
        // Minification
        minify: 'esbuild',
        // Source maps only in development
        sourcemap: false,
        // Chunk size warning
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                // Optimized manual chunks for better caching
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return undefined;
                    }

                    const normalizedId = id.replace(/\\/g, '/');

                    // Core React - rarely changes, cache long
                    if (normalizedId.includes('/node_modules/react/') || 
                        normalizedId.includes('/node_modules/react-dom/')) {
                        return 'react-core';
                    }

                    // Let Rollup handle MUI and Emotion automatically to preserve initialization order
                    // Do NOT manually chunk @mui or @emotion - they have complex interdependencies
                    if (normalizedId.includes('/node_modules/@mui/') ||
                        normalizedId.includes('/node_modules/@emotion/')) {
                        return undefined;
                    }

                    // Animation libraries
                    if (normalizedId.includes('/node_modules/framer-motion/') ||
                        normalizedId.includes('/node_modules/gsap/') ||
                        normalizedId.includes('/node_modules/@use-gesture/')) {
                        return 'animation-vendors';
                    }

                    // Icons - can be large
                    if (normalizedId.includes('/node_modules/react-icons/') ||
                        normalizedId.includes('/node_modules/lucide-react/')) {
                        return 'icon-vendors';
                    }

                    // Form handling
                    if (normalizedId.includes('/node_modules/react-hook-form/') ||
                        normalizedId.includes('/node_modules/@hookform/') ||
                        normalizedId.includes('/node_modules/zod/')) {
                        return 'form-vendors';
                    }

                    // Utilities
                    if (normalizedId.includes('/node_modules/@emailjs/') ||
                        normalizedId.includes('/node_modules/react-intersection-observer/') ||
                        normalizedId.includes('/node_modules/lenis/')) {
                        return 'utils-vendors';
                    }

                    // OGL for orb effect
                    if (normalizedId.includes('/node_modules/ogl/')) {
                        return 'ogl-vendors';
                    }

                    return undefined;
                },
                // Asset file naming for better caching
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name?.split('.') || [];
                    const ext = info[info.length - 1];
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
                        return 'assets/images/[name]-[hash][extname]';
                    }
                    if (/woff2?|eot|ttf|otf/i.test(ext)) {
                        return 'assets/fonts/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },
    },
    // Optimize dependencies
    optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion', '@mui/material'],
        exclude: ['@react-three/fiber', '@react-three/drei'],
    },
});
