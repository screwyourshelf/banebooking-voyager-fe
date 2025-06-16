import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    base: '/banebooking/',
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    shadcn: ['@radix-ui/react-slot', '@radix-ui/react-tabs', '@radix-ui/react-popover'],
                    lucide: ['lucide-react'],
                },
            },
        },
    },
    server: {
        open: '/banebooking/aas-tennisklubb',
        proxy: {
            '/api': {
                target: 'http://localhost:5015',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
