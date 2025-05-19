// Type definitions for Prometheus Engine imports module
// This file provides TypeScript type definitions for the imports.js module

/**
 * Import path mappings for the Prometheus Engine
 */
interface ImportPathMappings {
  /**
   * Path to the engine-core package
   */
  '@prometheus/engine-core': string;

  /**
   * Path to the CLI package
   */
  '@prometheus/cli': string;

  /**
   * Path to the editor package
   */
  '@prometheus/editor': string;

  /**
   * Additional dynamic paths that may be added in the future
   */
  [key: string]: string;
}

/**
 * A mapping of module names to their file paths
 * Used for configuring import aliases in both TypeScript and bundlers
 * @type {ImportPathMappings}
 */
declare const imports: ImportPathMappings;

export default imports;

// Allow importing from relative paths
declare module '../../packages/engine-core/imports.js' {
  import imports from './imports';
  export default imports;
}

// Allow importing from the package directly
declare module '@prometheus/engine-core/imports' {
  import imports from './imports';
  export default imports;
}
