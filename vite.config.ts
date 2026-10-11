import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import heroShell from './vite-plugins/heroShell';

/**
 * Whether the résumé's page pictures were made from the PDF being shipped: their file names
 * carry its hash (scripts/build-images.mjs). A phone previews the résumé from those pictures;
 * if the PDF was replaced without `npm run images`, it opens the PDF instead of old pages.
 */
function resumePagesCurrent(): boolean {
    try {
        const hash = createHash('sha1').update(readFileSync('public/Gading_Resume.pdf')).digest('hex').slice(0, 8);
        const pages: { avif: string[] }[] = JSON.parse(readFileSync('src/data/images.json', 'utf8')).resume ?? [];
        const current = pages.length > 0 && pages.every((page) => page.avif.every((file) => file.includes(`-${hash}-`)));
        if (!current) console.warn('\nThe résumé PDF has changed since its pages were rendered: run `npm run images`. Until then phones open the PDF in a new tab.\n');
        return current;
    } catch {
        return false;
    }
}

export default defineConfig({
    define: { __RESUME_PAGES__: JSON.stringify(resumePagesCurrent()) },
    plugins: [
        react(),
        heroShell(),
        // No precompressed .gz/.br copies: Vercel compresses each response itself (Brotli, seen on
        // gadingap.com) and never served the 74 files the build used to add.
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
                // Long-lived vendor chunks: React and GSAP. Lenis is a chunk of its own, fetched
                // only where it runs (lib/scroll.ts), so it is left out of both.
                manualChunks(id) {
                    if (!id.includes('node_modules')) return undefined;
                    const n = id.replace(/\\/g, '/');
                    if (n.includes('/node_modules/react/') || n.includes('/node_modules/react-dom/') || n.includes('/node_modules/scheduler/')) {
                        return 'react-core';
                    }
                    if (n.includes('/node_modules/gsap/')) {
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
