import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  base: './', // ← tell Vite to emit "./assets/..." instead of "/assets/..."
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
    },
  },
});
