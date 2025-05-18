import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  external: ['pixi.js', '@pixi/layout'],
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  noExternal: [],
  platform: 'browser',
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
    };
  },
  esbuildOptions(options) {
    // Needed to ignore native modules
    options.mainFields = ['browser', 'module', 'main'];
    options.packages = 'external';
  },
});
