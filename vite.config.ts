import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import heroShell from './vite-plugins/heroShell';

export default defineConfig({
    plugins: [
        react(),
        heroShell(),
        compression({ algorithm: 'gzip', ext: '.gz', threshold: 1024 }),
        compression({ algorithm: 'brotliCompress', ext: '.br', threshold: 1024 }),
    ],
    build: {
        target: 'es2020',
        assetsInlineLimit: 4096,
        cssCodeSplit: true,
        minify: 'esbuild',
        sourcemap: false,
        chunkSizeWarningLimit: 500,
        rollupOptions: {
            output: {
                // Long-lived vendor chunks: React, and the scroll stack (GSAP + Lenis).
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    const n = id.replace(/\\/g, '/');
                    if (n.includes('/node_modules/react/') || n.includes('/node_modules/react-dom/') || n.includes('/node_modules/scheduler/')) {
                        return 'react-core';
                    }
                    if (n.includes('/node_modules/gsap/') || n.includes('/node_modules/lenis/')) {
                        return 'scroll-vendors';
                    }
                    return undefined;
                },
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.names?.[0]?.split('.') ?? [];
                    const ext = info[info.length - 1] ?? '';
                    if (/png|jpe?g|svg|gif|webp|avif/i.test(ext)) return 'assets/images/[name]-[hash][extname]';
                    if (/woff2?|ttf|otf/i.test(ext)) return 'assets/fonts/[name]-[hash][extname]';
                    return 'assets/[name]-[hash][extname]';
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
});
