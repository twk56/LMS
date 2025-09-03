import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        manifest: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    router: ['@inertiajs/react'],
                    ui: ['lucide-react'],
                },
            },
        },
        cssMinify: true,
        cssCodeSplit: true,
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react', 'lucide-react'],
    },
    server: {
        hmr: {
            host: 'localhost',
        },
        // เพิ่มการตั้งค่าเพื่อเพิ่มประสิทธิภาพ
        watch: {
            usePolling: false,
        },
    },
    // เพิ่มการตั้งค่าเพื่อเพิ่มประสิทธิภาพ
    define: {
        __DEV__: process.env.NODE_ENV === 'development',
    },
});
