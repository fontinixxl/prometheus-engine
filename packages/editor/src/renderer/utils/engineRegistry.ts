/**
 * Engine Registry - Direct access to Prometheus engine modules
 * This helps avoid path resolution issues in imports
 */

// Re-export the engine core
export * from '../../../../packages/engine-core/dist';

// If needed, we can provide specific direct imports here
import { Engine } from '@prometheus/engine-core'; // Corrected import
export { Engine };

/**
 * Get the engine version
 */
export function getEngineVersion(): string {
  return '0.1.0'; // This should match the actual engine version
}

/**
 * Initializes the Prometheus Engine in a given HTML container.
 * @param container The HTMLElement to render the engine into.
 * @param options Engine initialization options.
 * @returns A promise that resolves with the Engine instance.
 */
export async function initializeEngine(
  container: HTMLElement,
  options: Record<string, unknown> = {},
) {
  // Use Record<string, unknown> or a specific options type
  if (!container) {
    throw new Error('Engine container not found or not provided.');
  }
  try {
    // Ensure Engine is a class that can be instantiated
    const engineInstance = new Engine({ ...options, view: container });
    await engineInstance.init(); // Assuming an init method
    // engineInstance.start(); // Assuming a start method
    return engineInstance;
  } catch (error) {
    console.error('Failed to initialize Prometheus Engine:', error);
    container.innerHTML = `<div style="color: red; padding: 20px;">Error initializing engine: ${error instanceof Error ? error.message : String(error)}</div>`;
    throw error;
  }
}
