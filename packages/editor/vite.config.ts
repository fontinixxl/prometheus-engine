import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'src/renderer'),
  base: './', // Emit relative asset URLs so file:// works
  server: {
    port: 5173,
    strictPort: true,
    hmr: true, // Enable HMR websocket
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/renderer/index.html'),
    },
  },
});
