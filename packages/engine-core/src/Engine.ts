import { Application, Assets, Container } from 'pixi.js';
import { SceneManager } from './managers/SceneManager';
import {
  ViewportManager,
  ViewportConfig,
  Orientation,
  DeviceType,
} from './managers/ViewportManager';
import { EntityManager } from './managers/EntityManager';
import { AssetManager, AssetBundleDefinition } from './managers/AssetManager';
import { DebugOverlay, DebugOverlayConfig } from './debug/DebugOverlay';
import { Scene } from './scene/Scene';

/**
 * Configuration options for the Prometheus Engine
 */
export interface EngineConfig {
  /** Enable debug mode with performance metrics overlay */
  debug?: boolean /** Background color of the canvas */;
  backgroundColor?: string;

  /** Viewport configuration */
  viewport?: ViewportConfig;

  /** Debug overlay configuration */
  debugOverlay?: DebugOverlayConfig;

  /** PixiJS application options */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pixiOptions?: Record<string, any>;
}

/**
 * Main class for the Prometheus Engine
 */
export class Engine {
  /** The PixiJS application instance */
  app: Application;

  /** Root container for the game content */
  root: Container; /** Scene manager */
  sceneManager: SceneManager;

  /** Viewport manager */
  viewportManager!: ViewportManager;

  /** Entity manager */
  entityManager: EntityManager;

  /** Asset manager */
  assetManager: AssetManager;

  /** Debug overlay */
  private debugOverlay?: DebugOverlay;

  /** Whether debug mode is enabled */
  private readonly debug: boolean;

  /** Default background color */
  private backgroundColor: string;

  /**
   * Creates a new Engine instance
   * @param config - Engine configuration options
   */
  constructor(config: EngineConfig = {}) {
    // Store configuration options
    this.debug = config.debug || false;
    this.backgroundColor = config.backgroundColor || '#1099bb';

    // Create the Pixi Application
    this.app = new Application();

    // Create root container
    this.root = new Container();
    this.root.name = 'prometheus-root';

    // Create managers
    this.sceneManager = new SceneManager(this.root);
    this.entityManager = new EntityManager(this.root);
    this.assetManager = new AssetManager();
  }

  /**
   * Initialize the engine and attach it to the DOM
   * @param container - HTML element to attach the canvas to
   */
  async init(container: HTMLElement): Promise<void> {
    // Initialize the PixiJS application
    await this.app.init({
      background: this.backgroundColor,
      resizeTo: window,
    });

    // Add the canvas to the container
    container.appendChild(this.app.canvas);

    // Add the root container to the stage
    this.app.stage.addChild(this.root);

    // Create viewport manager now that we have an initialized app
    this.viewportManager = new ViewportManager(this.app);

    // Initialize asset manager
    await this.assetManager.init();

    // Set up debug overlay if enabled
    if (this.debug) {
      this.setupDebugOverlay();
    }

    // Start the update loop
    this.app.ticker.add(this.update);

    // Listen for resize events
    window.addEventListener('resize', this.handleResize.bind(this));

    console.log('Prometheus Engine initialized');
  }

  /**
   * Handle window resize events
   */
  private handleResize(): void {
    // Update viewport manager
    this.viewportManager.resize(window.innerWidth, window.innerHeight);

    // Update scene manager
    this.sceneManager.resize(window.innerWidth, window.innerHeight);

    // Update debug overlay
    this.debugOverlay?.resize();

    // Call the public resize method for any additional custom logic
    this.resize();
  }

  /**
   * Main update loop called each frame
   */
  private update = (ticker: { deltaTime: number }): void => {
    const deltaTime = ticker.deltaTime * 0.01; // Convert to seconds

    // Update scene manager
    this.sceneManager.update(deltaTime);

    // Update entity manager
    this.entityManager.update(deltaTime);

    // Update debug overlay
    this.debugOverlay?.update(deltaTime);
  };

  /**
   * Set up the debug overlay with performance metrics
   */
  private setupDebugOverlay(): void {
    // Create debug overlay
    this.debugOverlay = new DebugOverlay({
      showFPS: true,
      showMemory: true,
      visible: true,
    });

    // Add to stage with high z-index to be on top
    this.app.stage.addChild(this.debugOverlay.container);

    console.log('Debug overlay initialized');
  }

  /**
   * Create a new scene
   * @param name - Unique name for the scene
   * @returns The created scene
   */
  createScene(name: string): Scene {
    const scene = new Scene(name);
    this.sceneManager.addScene(scene);
    return scene;
  }

  /**
   * Switch to a scene
   * @param sceneName - Name of the scene to switch to
   * @returns True if successful, false if scene not found
   */
  switchScene(sceneName: string): boolean {
    return this.sceneManager.switchScene(sceneName);
  }

  /**
   * Register an asset bundle for later loading
   * @param bundle - Asset bundle definition
   */
  registerAssetBundle(bundle: AssetBundleDefinition): void {
    this.assetManager.registerBundle(bundle);
  }

  /**
   * Load an asset bundle
   * @param bundleName - Name of the bundle to load
   * @param onProgress - Optional progress callback
   */
  async loadAssetBundle(
    bundleName: string,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    await this.assetManager.loadBundle(bundleName, (progress) => {
      if (onProgress) {
        onProgress(progress.progress);
      }
    });
  }

  /**
   * Load assets using PixiJS Assets system
   * This is a simplified version of assetManager.loadBundle
   * @param assets - Array of asset URLs or asset definitions
   * @param onProgress - Optional progress callback
   */
  async loadAssets(
    assets: string[] | { name: string; url: string }[],
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    try {
      if (Array.isArray(assets) && typeof assets[0] === 'string') {
        // Simple array of URLs
        await Assets.load(assets as string[], (progress) => {
          if (onProgress) {
            onProgress(progress);
          }
        });
      } else {
        // Array of named assets
        const assetMap: Record<string, string> = {};
        for (const asset of assets as { name: string; url: string }[]) {
          assetMap[asset.name] = asset.url;
        }
        // In PixiJS v8, we need to use the right signature for add
        Assets.add(assetMap);
        await Assets.load(
          (assets as { name: string; url: string }[]).map((a) => a.name),
          (progress) => {
            if (onProgress) {
              onProgress(progress);
            }
          },
        );
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  /**
   * Get the current device type
   * @returns The current device type
   */
  getDeviceType(): DeviceType {
    return this.viewportManager.deviceType;
  }

  /**
   * Get the current orientation
   * @returns The current orientation
   */
  getOrientation(): Orientation {
    return this.viewportManager.orientation;
  }

  /**
   * Toggle the debug overlay visibility
   * @param visible - If provided, set to this value, otherwise toggle
   */
  toggleDebug(visible?: boolean): void {
    this.debugOverlay?.toggleVisibility(visible);
  }

  /**
   * Add a custom stat to the debug overlay
   * @param name - Unique name for the stat
   * @param value - Initial value
   */
  addDebugStat(name: string, value: string): void {
    this.debugOverlay?.addStat(name, value);
  }

  /**
   * Update a debug stat
   * @param name - Name of the stat to update
   * @param value - New value
   */
  updateDebugStat(name: string, value: string): void {
    this.debugOverlay?.updateStat(name, value);
  }

  /**
   * Public resize method that can be overridden by game implementations
   */
  resize(): void {
    // This can be overridden by the game implementation
    console.log(`Resized: ${window.innerWidth}x${window.innerHeight}`);
  }

  /**
   * Cleanup and destroy the engine
   */
  destroy(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize.bind(this));

    // Remove update ticker
    this.app.ticker.remove(this.update);

    // Destroy managers
    this.sceneManager.destroy();
    this.entityManager.destroy();
    this.assetManager.destroy();
    this.viewportManager.destroy();
    this.debugOverlay?.destroy();

    // Destroy app
    this.app.destroy();
  }
}
