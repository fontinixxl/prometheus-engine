import { Assets } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

/**
 * Configuration for loading a Spine asset
 */
export interface SpineAssetConfig {
  /**
   * Key to use for accessing the loaded spine
   */
  key: string;

  /**
   * URL to the skeleton file (.json or .skel)
   */
  skeletonUrl: string;

  /**
   * URL to the atlas file
   */
  atlasUrl: string;

  /**
   * Whether the skeleton is in binary format (.skel)
   * Default: false (JSON format)
   */
  isBinary?: boolean;

  /**
   * Scale to apply to the spine instance
   * Default: 1
   */
  scale?: number;
}

/**
 * Helper for loading Spine assets
 */
export class SpineLoader {
  /**
   * Register a spine asset for loading
   * @param config - Spine asset configuration
   */
  static register(config: SpineAssetConfig): void {
    const { key, skeletonUrl, atlasUrl } = config;

    // Register the atlas and skeleton assets for preloading
    Assets.add({ alias: `${key}Atlas`, src: atlasUrl });
    Assets.add({ alias: `${key}Skeleton`, src: skeletonUrl });
  }

  /**
   * Load a spine asset
   * @param key - Key of the spine asset to load
   * @param scale - Optional scale to apply to the spine instance
   * @returns Promise for the Spine instance
   */
  static async load(key: string, scale?: number): Promise<Spine> {
    // Load both atlas and skeleton
    await Assets.load([`${key}Atlas`, `${key}Skeleton`]);

    // Create the spine instance using the Spine.from factory method
    const spine = Spine.from({
      atlas: `${key}Atlas`,
      skeleton: `${key}Skeleton`,
      scale: scale || 1,
    });

    if (!spine) {
      throw new Error(`Failed to load spine asset with key '${key}'`);
    }

    return spine;
  }
}
