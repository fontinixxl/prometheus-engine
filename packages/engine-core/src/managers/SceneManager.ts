import { Container } from 'pixi.js';
import { Scene } from '../scene/Scene';

/**
 * Manages all scenes in the game
 */
export class SceneManager {
  /** Container that holds all scenes */
  private container: Container;

  /** Currently active scene */
  private activeScene: Scene | null = null;

  /** Map of all registered scenes */
  private scenes: Map<string, Scene> = new Map();

  /**
   * Creates a new SceneManager
   * @param container - The container that will hold all scenes
   */
  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Adds a scene to the manager
   * @param scene - The scene to add
   */
  addScene(scene: Scene): void {
    if (this.scenes.has(scene.name)) {
      console.warn(`Scene '${scene.name}' already exists and will be replaced.`);
      const oldScene = this.scenes.get(scene.name);
      if (oldScene === this.activeScene) {
        this.activeScene = null;
      }
      oldScene?.destroy();
    }

    this.scenes.set(scene.name, scene);

    // Initialize the scene but don't automatically make it visible
    scene.init();
  }

  /**
   * Changes the active scene
   * @param sceneName - Name of the scene to activate
   * @returns True if scene was activated, false if not found
   */
  switchScene(sceneName: string): boolean {
    const newScene = this.scenes.get(sceneName);
    if (!newScene) {
      console.error(`Scene '${sceneName}' not found.`);
      return false;
    }

    // Exit and remove current scene from display
    if (this.activeScene) {
      this.activeScene.exit();
      this.container.removeChild(this.activeScene.container);
    }

    // Add and activate new scene
    this.container.addChild(newScene.container);
    newScene.enter();
    this.activeScene = newScene;

    return true;
  }

  /**
   * Gets a scene by name
   * @param sceneName - Name of the scene to get
   * @returns The scene or null if not found
   */
  getScene(sceneName: string): Scene | null {
    return this.scenes.get(sceneName) || null;
  }

  /**
   * Gets the currently active scene
   * @returns The currently active scene, or null if none is active
   */
  getActiveScene(): Scene | null {
    return this.activeScene;
  }

  /**
   * Updates the active scene
   * @param deltaTime - Time elapsed since the last update
   */
  update(deltaTime: number): void {
    if (this.activeScene) {
      this.activeScene.update(deltaTime);
    }
  }

  /**
   * Resizes all scenes
   * @param width - The new viewport width
   * @param height - The new viewport height
   */
  resize(width: number, height: number): void {
    // Update all scenes, not just the active one
    for (const scene of this.scenes.values()) {
      scene.resize(width, height);
    }
  }

  /**
   * Destroys all scenes and cleans up resources
   */
  destroy(): void {
    for (const scene of this.scenes.values()) {
      scene.destroy();
    }
    this.scenes.clear();
    this.activeScene = null;
  }
}
