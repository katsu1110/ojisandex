import { defineConfig } from 'vite';

export default defineConfig({
    // For GitHub Pages: set base to repo name
    // Change this if deploying to a custom domain
    base: '/ojisandex/',
    publicDir: 'public',
    build: {
        outDir: 'dist',
    },
});
