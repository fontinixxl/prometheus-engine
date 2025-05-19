/**
 * Base class for all components in the entity system
 */
export abstract class Component {
  /** Unique component type identifier */
  static readonly TYPE: string;

  /** Entity that owns this component - type is defined later to avoid circular dependency */
  entity?: object;

  /** Whether the component is enabled */
  enabled: boolean = true;

  /**
   * Creates a component instance
   */
  constructor() {
    // Entity will be set when the component is added to an entity
  }

  /**
   * Initialize the component with any required data
   * Called when component is added to an entity
   */
  init(): void {
    // Override in subclass
  }

  /**
   * Update component logic
   * @param deltaTime - Time elapsed since last update in seconds
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(deltaTime: number): void {
    // Override in subclass
  }

  /**
   * Clean up resources used by this component
   * Called when component is removed from entity or entity is destroyed
   */
  destroy(): void {
    // Override in subclass to clean up resources
  }
}
