import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site under /dbm-gpu-lab/; a custom domain at the root needs no BASE_PATH
  base: process.env.BASE_PATH || '/',
  server: { port: 5173 },
});
