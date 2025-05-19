import { Container } from 'pixi.js';
import { Container as LayoutContainer } from 'pixi.js';

/**
 * Scene class representing a distinct visual state in the game
 */
export class Scene {
  /** The container that holds all visual elements in the scene */
  container: Container;

  /** Layout container for responsive UI elements */
  ui: Container;

  /** Flag indicating if the scene is active/visible */
  active = false;

  /** Scene name for identification */
  readonly name: string;

  /**
   * Creates a new Scene
   * @param name - Unique identifier for the scene
   */
  constructor(name: string) {
    this.name = name;
    this.container = new Container();
    this.container.name = `scene-${name}`;

    // Create a UI container with layout capabilities
    this.ui = new LayoutContainer();
    this.ui.name = `ui-${name}`;
    this.container.addChild(this.ui);
  }

  /**
   * Lifecycle method called once when the scene is first added to the stage
   */
  init(): void {
    // Override in subclass to initialize the scene
  }

  /**
   * Lifecycle method called when the scene becomes active
   */
  enter(): void {
    this.active = true;
  }

  /**
   * Lifecycle method called when the scene becomes inactive
   */
  exit(): void {
    this.active = false;
  }

  /**
   * Lifecycle method called each frame while the scene is active
   * @param deltaTime - Time elapsed since the last update
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(deltaTime: number): void {
    // Override in subclass to update the scene
  }

  /**
   * Lifecycle method called when the viewport size changes
   * @param width - The new viewport width
   * @param height - The new viewport height
   */
  resize(width: number, height: number): void {
    // Update layout container
    this.ui.width = width;
    this.ui.height = height;

    // For now, just update the container size
    // Later we can add proper layout handling when we add @pixi/layout integration
  }

  /**
   * Cleanup resources when the scene is destroyed
   */
  destroy(): void {
    this.container.destroy({ children: true });
  }
}
