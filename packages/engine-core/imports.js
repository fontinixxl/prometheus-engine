/**
 * This configuration file sets up paths and makes them available
 * for import using the @prometheus/* namespace.
 *
 * Used to simplify imports in games and applications that use the engine.
 *
 * Usage example:
 * In your vite.config.ts:
 * ```
 * import prometheusImports from '../../packages/engine-core/imports.js';
 *
 * export default defineConfig({
 *   // other config...
 *   resolve: {
 *     alias: {
 *       ...prometheusImports
 *     }
 *   }
 * });
 * ```
 *
 * Then in your files:
 * ```
 * import { Engine, Scene } from '@prometheus/engine-core';
 * ```
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name of the current module (works in both ESM and CommonJS)
const __filename = typeof __filename !== 'undefined' ? __filename : fileURLToPath(import.meta.url);
const __dirname = typeof __dirname !== 'undefined' ? __dirname : dirname(__filename);

const projectRoot = path.resolve(__dirname, '../../');

const imports = {
  '@prometheus/engine-core': path.resolve(projectRoot, 'packages/engine-core/dist/'),
  '@prometheus/cli': path.resolve(projectRoot, 'packages/cli/dist/'),
  '@prometheus/editor': path.resolve(projectRoot, 'packages/editor/dist/'),
};

// Export in a way that works with both ESM and CommonJS
export default imports;
