import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative paths for GitLab Pages (if it's not at the root domain)
  server: {
    host: true,
  },
  build: {
    outDir: 'public', // GitLab Pages expects a folder named 'public' by default if using specifically configured CI
  },
});
