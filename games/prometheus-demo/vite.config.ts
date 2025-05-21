import { defineConfig } from 'vite';
import path from 'path';
import prometheusImports from '../../packages/engine-core/imports.js';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      // Legacy alias for backward compatibility
      'engine-core': path.resolve(__dirname, '../../packages/engine-core'),
      // New standardized import paths
      ...prometheusImports,
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
