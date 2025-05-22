import { defineConfig } from 'vite';
import path from 'path';
import prometheusImports from '../engine-core/imports.js';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  resolve: {
    alias: {
      '@games': path.resolve(__dirname, '../../games'),
      '@': path.resolve(__dirname, 'src/renderer'),
      ...prometheusImports,
    },
  },
  base: './', // Emit relative asset URLs so file:// works
  server: {
    port: 5173,
    strictPort: false, // Allow fallback to another port if 5173 is in use
    host: '127.0.0.1', // Restrict to localhost only
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    fs: {
      // Allow Vite dev server to serve files from these locations
      allow: [
        // Add the Vite project root
        path.resolve(__dirname, 'src/renderer'),
        // Allow access to games directory
        path.resolve(__dirname, '../../games'),
        // Allow access to node_modules
        path.resolve(__dirname, 'node_modules'),
      ],
    },
    watch: {
      usePolling: false, // Set to true if you have issues with file watching
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
      external: ['@prometheus/engine-core'],
    },
  },
  plugins: [react()],
});
