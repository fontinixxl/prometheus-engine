import { defineConfig } from 'vite';
import path from 'path';
import prometheusImports from '../engine-core/imports.js';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  resolve: {
    alias: {
      '@games': path.resolve(__dirname, '../../games'),
      ...prometheusImports,
    },
  },
  base: './', // Emit relative asset URLs so file:// works
  server: {
    port: 5173,
    strictPort: true,
    hmr: true, // Enable HMR websocket
    fs: {
      // allow Vite dev server to serve files from /games
      allow: [
        path.resolve(__dirname, 'src/renderer'), // Add the Vite project root
        path.resolve(__dirname, '../../games'),
      ],
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
      external: ['@prometheus/engine-core', /^@games\/.*/],
    },
  },
  plugins: [],
});
