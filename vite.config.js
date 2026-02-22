import { defineConfig } from 'vite';

export default defineConfig({
    // For Vercel: set base to root
    base: '/',
    publicDir: 'public',
    build: {
        outDir: 'dist',
    },
});
