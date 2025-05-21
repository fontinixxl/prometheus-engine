import { Assets, Texture, Spritesheet } from 'pixi.js';

// ResolverManifest type for compatibility
interface ResolverManifest {
  bundles: Record<string, Record<string, string>>;
}

/** Asset types supported by the asset manager */
export enum AssetType {
  Texture = 'texture',
  SpriteSheet = 'spritesheet',
  Sound = 'sound',
  Data = 'data',
  Font = 'font',
  Spine = 'spine',
}

/** Asset definition */
export interface AssetDefinition {
  /** Unique asset name */
  name: string;

  /** URL to the asset */
  url: string;

  /** Asset type */
  type?: AssetType;
}

/** Asset bundle definition */
export interface AssetBundleDefinition {
  /** Unique bundle name */
  name: string;

  /** Assets in this bundle */
  assets: AssetDefinition[];
}

/** Asset loading progress information */
export interface LoadingProgress {
  /** Bundle being loaded */
  bundle: string;

  /** Progress value from 0 to 1 */
  progress: number;

  /** Currently loading asset */
  currentAsset?: AssetDefinition;
}

/**
 * Handles asset loading and management
 */
export class AssetManager {
  /** Map of registered asset bundles */
  private bundles: Map<string, AssetBundleDefinition> = new Map();

  /** Map of loaded assets by name */
  private loadedAssets: Map<string, unknown> = new Map();

  /** Map of loaded bundles by name */
  private loadedBundles: Map<string, boolean> = new Map();

  /** Whether the asset manager has been initialized */
  private initialized = false;

  /**
   * Initialize the asset manager
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    // Initialize PixiJS Assets
    await Assets.init();

    this.initialized = true;
  }

  /**
   * Register an asset bundle
   * @param bundle - Bundle definition
   */
  registerBundle(bundle: AssetBundleDefinition): void {
    if (this.bundles.has(bundle.name)) {
      console.warn(`Asset bundle '${bundle.name}' already registered. Replacing.`);
    }

    this.bundles.set(bundle.name, bundle);

    // Add to PixiJS Assets resolver
    const assetMap: Record<string, string> = {};
    for (const asset of bundle.assets) {
      assetMap[asset.name] = asset.url;
    }

    // Add assets to PixiJS resolver
    Assets.addBundle(bundle.name, assetMap);
  }

  /**
   * Register multiple bundles
   * @param bundles - Array of bundle definitions
   */
  registerBundles(bundles: AssetBundleDefinition[]): void {
    for (const bundle of bundles) {
      this.registerBundle(bundle);
    }
  }

  /**
   * Register bundles from a manifest
   * @param manifest - Asset manifest
   */
  registerManifest(manifest: ResolverManifest): void {
    // Add bundles from the manifest
    for (const [bundleName, bundleAssets] of Object.entries(manifest.bundles)) {
      const assets: AssetDefinition[] = [];

      // Convert to our bundle format
      for (const [assetName, assetUrl] of Object.entries(bundleAssets)) {
        assets.push({
          name: assetName,
          url: assetUrl as string,
        });
      }

      this.registerBundle({
        name: bundleName,
        assets,
      });
    }
  }

  /**
   * Load an asset bundle
   * @param bundleName - Name of the bundle to load
   * @param onProgress - Optional progress callback
   * @returns Promise that resolves when loading is complete
   */
  async loadBundle(
    bundleName: string,
    onProgress?: (progress: LoadingProgress) => void,
  ): Promise<void> {
    if (!this.bundles.has(bundleName)) {
      throw new Error(`Asset bundle '${bundleName}' not found.`);
    }

    // Skip if already loaded
    if (this.loadedBundles.get(bundleName)) {
      return;
    }

    try {
      // Load the bundle using PixiJS Assets
      await Assets.loadBundle(bundleName, (progress) => {
        if (onProgress) {
          onProgress({
            bundle: bundleName,
            progress,
          });
        }
      });

      // Mark bundle as loaded
      this.loadedBundles.set(bundleName, true);

      console.log(`Asset bundle '${bundleName}' loaded.`);
    } catch (error) {
      console.error(`Error loading bundle '${bundleName}':`, error);
      throw error;
    }
  }

  /**
   * Get an asset by name
   * @param name - Asset name
   * @returns The asset or null if not found
   */
  getAsset<T>(name: string): T | null {
    // Check if already in our cache
    if (this.loadedAssets.has(name)) {
      return this.loadedAssets.get(name) as T;
    }

    // Try to get from PixiJS Assets
    try {
      const asset = Assets.get(name);
      if (asset) {
        // Cache for future use
        this.loadedAssets.set(name, asset);
        return asset as T;
      }
    } catch {
      console.warn(`Asset '${name}' not found.`);
    }

    return null;
  }

  /**
   * Get a texture by name
   * @param name - Texture name
   * @returns The texture or null if not found
   */
  getTexture(name: string): Texture | null {
    return this.getAsset<Texture>(name);
  }

  /**
   * Get a spritesheet by name
   * @param name - Spritesheet name
   * @returns The spritesheet or null if not found
   */
  getSpritesheet(name: string): Spritesheet | null {
    return this.getAsset<Spritesheet>(name);
  }

  /**
   * Unload a bundle
   * @param bundleName - Name of the bundle to unload
   */
  unloadBundle(bundleName: string): void {
    if (!this.bundles.has(bundleName)) {
      console.warn(`Asset bundle '${bundleName}' not found.`);
      return;
    }

    // Skip if not loaded
    if (!this.loadedBundles.get(bundleName)) {
      return;
    }

    // Get the bundle definition
    const bundle = this.bundles.get(bundleName)!;

    // Unload each asset in the bundle
    for (const asset of bundle.assets) {
      // Remove from our cache
      this.loadedAssets.delete(asset.name);

      // Unload from PixiJS Assets
      Assets.unload(asset.name);
    }

    // Mark bundle as not loaded
    this.loadedBundles.set(bundleName, false);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Unload all bundles
    for (const bundleName of this.loadedBundles.keys()) {
      if (this.loadedBundles.get(bundleName)) {
        this.unloadBundle(bundleName);
      }
    }

    this.bundles.clear();
    this.loadedAssets.clear();
    this.loadedBundles.clear();
  }
}
