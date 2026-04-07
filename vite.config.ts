import { defineConfig } from 'vite';

export default defineConfig({
  base: '/thrust-game/', // Matches your repository name for GitHub Pages
  server: {
    host: true,
  },
  build: {
    outDir: 'dist', // Standard output directory
  },
});
