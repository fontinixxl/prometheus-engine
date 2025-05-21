// Prometheus Engine Core Exports

// Export the main Engine class
export { Engine, EngineConfig } from './Engine';

// Export managers
export { SceneManager } from './managers/SceneManager';
export {
  ViewportManager,
  ViewportConfig,
  Orientation,
  DeviceType,
} from './managers/ViewportManager';
export { EntityManager } from './managers/EntityManager';
export {
  AssetManager,
  AssetType,
  AssetBundleDefinition,
  AssetDefinition,
  LoadingProgress,
} from './managers/AssetManager';

// Export scene classes
export { Scene } from './scene/Scene';

// Export entity system
export { Entity } from './entity/Entity';
export { Component } from './entity/Component';

// Export components
export { SpineComponent } from './components/SpineComponent';

// Export loaders
export { SpineLoader, SpineAssetConfig } from './loaders/SpineLoader';

// Export debug tools
export { DebugOverlay, DebugOverlayConfig, DebugPanelPosition } from './debug/DebugOverlay';

// Export common types
export * from './types/config';

// Re-export commonly used PixiJS types for convenience
export {
  Application,
  Container,
  Sprite,
  Graphics,
  Text,
  TextStyle,
  Texture,
  Assets,
  FederatedPointerEvent,
  FederatedEvent,
  Ticker,
} from 'pixi.js';
