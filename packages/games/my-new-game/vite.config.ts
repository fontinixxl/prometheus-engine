import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Entry point for bundling
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});
