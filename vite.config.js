import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const manualChunkGroups = [
    {
        name: 'react-vendors',
        deps: [
            'react-dom',
            'react-icons',
            'react-spring',
            'react-window',
            'react-virtualized-auto-sizer'
        ]
    },
    {
        name: 'mui-vendors',
        deps: ['@mui', '@emotion']
    },
        {
            name: 'motion-vendors',
            deps: ['framer-motion', '@use-gesture', 'lottie-react']
        },
        {
            name: 'utils-vendors',
            deps: ['@emailjs', 'react-intersection-observer']
        }
];

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        return;
                    }

                    const normalizedId = id.replace(/\\/g, '/');

                                if (normalizedId.includes('/node_modules/three/')) {
                                    return 'three-core';
                                }

                                if (
                                    normalizedId.includes('/node_modules/@react-three/') ||
                                    normalizedId.includes('framer-motion-3d')
                                ) {
                                    return 'r3f-vendors';
                                }

                                if (normalizedId.includes('/node_modules/postprocessing/')) {
                                    return 'postprocessing-vendors';
                                }

                    for (const group of manualChunkGroups) {
                        if (group.deps.some(dep => normalizedId.includes(dep))) {
                            return group.name;
                        }
                    }
                }
            }
        }
    }
});