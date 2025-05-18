import { Application, Assets, Container, Graphics, Text } from 'pixi.js';

// Make sure to export the types

/**
 * Configuration options for the Prometheus Engine
 */
export interface EngineConfig {
  /** Enable debug mode with performance metrics overlay */
  debug?: boolean;
  /** Background color of the canvas */
  backgroundColor?: string;
}

/**
 * Main class for the Prometheus Engine
 */
export class Engine {
  /** The PixiJS application instance */
  app: Application;

  /** Root container for the game content */
  root: Container;

  /** Debug overlay container */
  private debugContainer?: Container;

  /** Whether debug mode is enabled */
  private readonly debug: boolean;

  /** FPS counter for debug overlay */
  private fpsText?: Text;

  /** Frame counter for FPS calculation */
  private frames = 0;

  /** Last timestamp for FPS calculation */
  private lastTime = 0;

  /**
   * Creates a new Engine instance
   * @param config - Engine configuration options
   */
  constructor(config: EngineConfig = {}) {
    this.app = new Application();
    this.root = new Container();
    this.debug = config.debug || false;
  }

  /**
   * Initialize the engine and attach it to the DOM
   * @param container - HTML element to attach the canvas to
   */
  async init(container: HTMLElement): Promise<void> {
    // Initialize the application
    await this.app.init({
      background: '#1099bb',
      resizeTo: window,
    });

    // Add the canvas to the container
    container.appendChild(this.app.canvas);

    // Add the root container to the stage
    this.app.stage.addChild(this.root);

    // Set up debug overlay if enabled
    if (this.debug) {
      this.setupDebugOverlay();
    }

    // Start the update loop
    this.app.ticker.add(this.update);

    console.log('Prometheus Engine initialized');
  }

  /**
   * Main update loop called each frame
   */
  private update = (): void => {
    // Update FPS counter if debug mode is enabled
    if (this.debug && this.fpsText) {
      this.frames++;

      const now = performance.now();
      if (now - this.lastTime >= 1000) {
        const fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.fpsText.text = `FPS: ${fps}`;
        this.frames = 0;
        this.lastTime = now;
      }
    }
  };

  /**
   * Set up the debug overlay with performance metrics
   */
  private setupDebugOverlay(): void {
    // Create debug container
    this.debugContainer = new Container();
    this.debugContainer.zIndex = 1000;
    this.app.stage.addChild(this.debugContainer);

    // Create background
    const background = new Graphics();
    background.beginFill(0x000000, 0.5);
    background.drawRect(0, 0, 100, 30);
    background.endFill();
    this.debugContainer.addChild(background);

    // Create FPS text
    this.fpsText = new Text('FPS: 0', {
      fontSize: 16,
      fill: 0xffffff,
    });
    this.fpsText.position.set(10, 5);
    this.debugContainer.addChild(this.fpsText);

    console.log('Debug overlay initialized');
  }

  /**
   * Load assets using PixiJS Assets system
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
        await Assets.load(assets as string[]);
      } else {
        // Array of named assets
        const assetMap: Record<string, string> = {};
        for (const asset of assets as { name: string; url: string }[]) {
          assetMap[asset.name] = asset.url;
        }
        // In PixiJS v8, we need to use the right signature for add
        Assets.add(assetMap);
        await Assets.load((assets as { name: string; url: string }[]).map((a) => a.name));
      }

      // Call progress callback if provided (currently not supported in the simple implementation)
      if (onProgress) {
        onProgress(1);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  /**
   * Create a simple scene with a container
   * @returns A new container for the scene
   */
  createScene(): Container {
    const scene = new Container();
    this.root.addChild(scene);
    return scene;
  }

  /**
   * Handles window resize events
   */
  resize(): void {
    // Add any resize logic here
    console.log(`Resized: ${window.innerWidth}x${window.innerHeight}`);
  }

  /**
   * Cleanup and destroy the engine
   */
  destroy(): void {
    this.app.ticker.remove(this.update);
    this.app.destroy();
  }
}
