import { Container } from 'pixi.js';
import { Entity } from '../entity/Entity';

/**
 * Manages game entities and their lifecycle
 */
export class EntityManager {
  /** Container that holds all entities */
  private container: Container;

  /** Map of all entities by ID */
  private entities: Map<string, Entity> = new Map();

  /** Queue of entities to add next frame */
  private entitiesToAdd: Entity[] = [];

  /** Queue of entity IDs to remove next frame */
  private entitiesToRemove: string[] = [];

  /**
   * Creates a new EntityManager
   * @param container - Container to hold all entity containers
   */
  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Create a new entity
   * @param name - Name for the entity
   * @param addImmediately - Whether to add the entity immediately or queue for next frame
   * @returns The created entity
   */
  createEntity(name: string, addImmediately = true): Entity {
    // Generate a unique ID
    const id = `entity_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const entity = new Entity(id, name);

    if (addImmediately) {
      this.addEntity(entity);
    } else {
      this.entitiesToAdd.push(entity);
    }

    return entity;
  }

  /**
   * Add an existing entity
   * @param entity - The entity to add
   */
  addEntity(entity: Entity): void {
    if (this.entities.has(entity.id)) {
      console.warn(`Entity with ID ${entity.id} already exists. Replacing.`);
      this.removeEntity(entity.id);
    }

    this.entities.set(entity.id, entity);
    this.container.addChild(entity.container);
  }

  /**
   * Get an entity by ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  getEntity(id: string): Entity | null {
    return this.entities.get(id) || null;
  }

  /**
   * Schedule an entity for removal
   * @param id - ID of the entity to remove
   */
  scheduleEntityRemoval(id: string): void {
    if (this.entities.has(id) && !this.entitiesToRemove.includes(id)) {
      this.entitiesToRemove.push(id);
    }
  }

  /**
   * Remove an entity immediately
   * @param id - ID of the entity to remove
   * @returns True if entity was removed
   */
  removeEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remove from display tree
    this.container.removeChild(entity.container);

    // Destroy and remove from entities map
    entity.destroy();
    this.entities.delete(id);

    return true;
  }

  /**
   * Get all entities
   * @returns Array of all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.entities.values());
  }

  /**
   * Process entity additions and removals
   */
  processEntityQueues(): void {
    // Add queued entities
    for (const entity of this.entitiesToAdd) {
      this.addEntity(entity);
    }
    this.entitiesToAdd = [];

    // Remove queued entities
    for (const id of this.entitiesToRemove) {
      this.removeEntity(id);
    }
    this.entitiesToRemove = [];
  }

  /**
   * Update all active entities
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    // Process the entity queues first
    this.processEntityQueues();

    // Update all entities
    for (const entity of this.entities.values()) {
      if (entity.active) {
        entity.update(deltaTime);
      }
    }
  }

  /**
   * Clean up all entities
   */
  destroy(): void {
    for (const entity of this.entities.values()) {
      entity.destroy();
    }
    this.entities.clear();
    this.entitiesToAdd = [];
    this.entitiesToRemove = [];
  }
}
