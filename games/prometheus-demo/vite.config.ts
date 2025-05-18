import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      'engine-core': path.resolve(__dirname, '../../packages/engine-core'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
