// Prometheus Engine Core Exports

// Export the main Engine class
export { Engine, EngineConfig } from './PrometheusEngine';

// Re-export commonly used PixiJS types for convenience
export { 
  Application, 
  Container, 
  Sprite, 
  Graphics, 
  Text,
  TextStyle,
  Texture,
  Assets
} from 'pixi.js';

// Legacy export for backward compatibility
export const helloEngine = () => 'Hello from Prometheus Engine!';
