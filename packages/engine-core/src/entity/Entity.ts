import { Container } from 'pixi.js';
import { Component } from './Component';

/**
 * Base entity class that can hold components
 */
export class Entity {
  /** Unique identifier for this entity */
  readonly id: string;

  /** Display name for this entity */
  name: string;

  /** Visual container for this entity */
  container: Container;

  /** Whether this entity is active */
  active: boolean = true;

  /** Components attached to this entity */
  private components: Map<string, Component> = new Map();

  /**
   * Creates a new entity
   * @param id - Unique identifier for this entity
   * @param name - Display name for this entity
   */
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.container = new Container();
    this.container.name = `entity-${name}`;
  }

  /**
   * Add a component to this entity
   * @param component - The component to add
   * @param componentType - Type identifier for the component
   * @returns The added component
   */
  addComponent<T extends Component>(component: T, componentType: string): T {
    if (this.components.has(componentType)) {
      console.warn(`Entity ${this.name} already has component ${componentType}. Replacing.`);
      this.removeComponent(componentType);
    }

    // Set the entity reference in the component
    (component as Component).entity = this;

    // Add to components map
    this.components.set(componentType, component);

    // Initialize the component
    component.init();

    return component;
  }

  /**
   * Get a component by type
   * @param componentType - Type identifier for the component
   * @returns The component or null if not found
   */
  getComponent<T extends Component>(componentType: string): T | null {
    const component = this.components.get(componentType);
    return (component as T) || null;
  }

  /**
   * Check if entity has a component
   * @param componentType - Type identifier for the component
   * @returns True if the entity has the component
   */
  hasComponent(componentType: string): boolean {
    return this.components.has(componentType);
  }

  /**
   * Remove a component from this entity
   * @param componentType - Type identifier for the component
   * @returns True if component was removed
   */
  removeComponent(componentType: string): boolean {
    const component = this.components.get(componentType);
    if (!component) return false;

    // Destroy the component
    component.destroy();

    // Remove from components map
    this.components.delete(componentType);

    // Clear the entity reference
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).entity = null;

    return true;
  }

  /**
   * Update all components
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    if (!this.active) return;

    // Update all components
    for (const component of this.components.values()) {
      if (component.enabled) {
        component.update(deltaTime);
      }
    }
  }

  /**
   * Set the position of the entity
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  setPosition(x: number, y: number): void {
    this.container.position.set(x, y);
  }

  /**
   * Set the rotation of the entity
   * @param rotation - Rotation in radians
   */
  setRotation(rotation: number): void {
    this.container.rotation = rotation;
  }

  /**
   * Set the scale of the entity
   * @param x - X scale
   * @param y - Y scale
   */
  setScale(x: number, y: number = x): void {
    this.container.scale.set(x, y);
  }

  /**
   * Set the visibility of the entity
   * @param visible - Whether the entity is visible
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  /**
   * Clean up resources used by this entity
   */
  destroy(): void {
    // Destroy all components
    for (const [type, component] of this.components.entries()) {
      component.destroy();
      this.components.delete(type);
    }

    // Destroy the container
    this.container.destroy({ children: true });
  }
}
