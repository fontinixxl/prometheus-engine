# Entity Component System (ECS)

The Prometheus Engine implements an Entity Component System (ECS) architecture that provides a flexible and modular way to build game objects. This document explains how the ECS works and how to use it effectively in your games.

## Core Concepts

The ECS architecture consists of three main parts:

1. **Entities**: Container objects that represent game objects
2. **Components**: Reusable modules that add functionality to entities
3. **Systems**: Logic that operates on entities with specific components

## Entity System

### Creating Entities

Entities in Prometheus Engine are container objects that can have components attached to them. Each entity has a unique ID, a name, and a visual container.

```typescript
// Create an entity using the EntityManager
const player = engine.entityManager.createEntity('player');

// Position the entity
player.setPosition(100, 200);

// Set other properties
player.setRotation(0.5);
player.setScale(2);
player.setVisible(true);
```

### Entity Lifecycle

Entities have a simple lifecycle:

1. **Creation**: Created through `EntityManager.createEntity()`
2. **Updates**: Automatically updated each frame if active
3. **Removal**: Removed through `EntityManager.scheduleEntityRemoval()` or `EntityManager.removeEntity()`

### Entity Properties

Each entity has several built-in properties and methods:

- `id`: Unique identifier
- `name`: Display name
- `container`: Visual container (PixiJS Container)
- `active`: Whether the entity is updated
- `setPosition(x, y)`: Set position
- `setRotation(rotation)`: Set rotation
- `setScale(x, y)`: Set scale
- `setVisible(visible)`: Set visibility

## Component System

Components are modular pieces of functionality that can be attached to entities. By combining different components, you can create complex game objects without deep inheritance hierarchies.

### Creating Components

To create a component, extend the base `Component` class:

```typescript
import { Component } from '@prometheus/engine-core';

// Define component type
export class SpriteComponent extends Component {
  // Define a unique type identifier for this component
  static readonly TYPE: string = 'sprite';

  // Component properties
  sprite: Sprite;

  constructor(texture: Texture) {
    super();
    this.sprite = new Sprite(texture);
  }

  // Called when added to an entity
  init(): void {
    // Add sprite to entity container
    (this.entity as Entity).container.addChild(this.sprite);
  }

  // Called each frame
  update(deltaTime: number): void {
    // Component-specific update logic
    this.sprite.rotation += 0.01 * deltaTime;
  }

  // Called when removed from entity
  destroy(): void {
    // Cleanup resources
    this.sprite.destroy();
  }
}
```

### Using Components

Components are added to entities and managed through the entity:

```typescript
// Create an entity
const player = engine.entityManager.createEntity('player');

// Create and add a sprite component
const texture = await Assets.load('player.png');
const spriteComponent = new SpriteComponent(texture);
player.addComponent(spriteComponent, SpriteComponent.TYPE);

// Get a component
const sprite = player.getComponent<SpriteComponent>(SpriteComponent.TYPE);

// Check if entity has component
if (player.hasComponent(SpriteComponent.TYPE)) {
  // Do something with the component
}

// Remove a component
player.removeComponent(SpriteComponent.TYPE);
```

### Component Lifecycle

Components have a well-defined lifecycle:

1. **Creation**: Created with `new ComponentClass()`
2. **Initialization**: `init()` called when added to an entity
3. **Updates**: `update(deltaTime)` called each frame if enabled
4. **Destruction**: `destroy()` called when removed or entity is destroyed

## Common Component Types

Here are some examples of common component types you might implement:

### TransformComponent

```typescript
export class TransformComponent extends Component {
  static readonly TYPE: string = 'transform';

  position: Point = new Point(0, 0);
  rotation: number = 0;
  scale: Point = new Point(1, 1);

  init(): void {
    this.updateTransform();
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
    this.updateTransform();
  }

  setRotation(rotation: number): void {
    this.rotation = rotation;
    this.updateTransform();
  }

  setScale(x: number, y: number = x): void {
    this.scale.x = x;
    this.scale.y = y;
    this.updateTransform();
  }

  private updateTransform(): void {
    const entity = this.entity as Entity;
    entity.container.position.copyFrom(this.position);
    entity.container.rotation = this.rotation;
    entity.container.scale.copyFrom(this.scale);
  }
}
```

### PhysicsComponent

```typescript
export class PhysicsComponent extends Component {
  static readonly TYPE: string = 'physics';

  velocity: Point = new Point(0, 0);
  acceleration: Point = new Point(0, 0);
  mass: number = 1;

  update(deltaTime: number): void {
    // Apply acceleration to velocity
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;

    // Apply velocity to position
    const entity = this.entity as Entity;
    entity.setPosition(
      entity.container.x + this.velocity.x * deltaTime,
      entity.container.y + this.velocity.y * deltaTime,
    );
  }
}
```

### AnimationComponent

```typescript
export class AnimationComponent extends Component {
  static readonly TYPE: string = 'animation';

  animations: Map<string, AnimatedSprite> = new Map();
  currentAnimation: AnimatedSprite | null = null;

  addAnimation(name: string, textures: Texture[]): void {
    const anim = new AnimatedSprite(textures);
    this.animations.set(name, anim);
  }

  play(name: string, loop: boolean = true): boolean {
    const anim = this.animations.get(name);
    if (!anim) return false;

    // Stop current animation if any
    if (this.currentAnimation) {
      this.currentAnimation.stop();
      (this.entity as Entity).container.removeChild(this.currentAnimation);
    }

    // Play new animation
    this.currentAnimation = anim;
    this.currentAnimation.loop = loop;
    (this.entity as Entity).container.addChild(this.currentAnimation);
    this.currentAnimation.play();

    return true;
  }

  destroy(): void {
    for (const anim of this.animations.values()) {
      anim.destroy();
    }
    this.animations.clear();
    this.currentAnimation = null;
  }
}
```

## Entity Manager

The `EntityManager` handles the creation, management, and destruction of entities:

```typescript
// Create an entity manager (usually done by the Engine)
const entityManager = new EntityManager(container);

// Create entities
const player = entityManager.createEntity('player');
const enemy = entityManager.createEntity('enemy');

// Schedule entity for removal next frame
entityManager.scheduleEntityRemoval(enemy.id);

// Remove entity immediately
entityManager.removeEntity(player.id);

// Get all entities
const allEntities = entityManager.getAllEntities();
```

The `EntityManager` also handles the update loop for all entities, calling their `update` methods each frame.

## Component Communication

Components can communicate with each other through their shared entity:

```typescript
// Get another component from the same entity
init(): void {
  const health = (this.entity as Entity).getComponent<HealthComponent>('health');
  if (health) {
    health.onDamage = this.handleDamage.bind(this);
  }
}

handleDamage(amount: number): void {
  // React to damage event
}
```

## Advanced ECS Patterns

### Component Composition

Build complex game objects by composing multiple components:

```typescript
// Create a player entity with multiple components
const player = engine.entityManager.createEntity('player');

// Add various components
player.addComponent(new TransformComponent(), 'transform');
player.addComponent(new SpriteComponent(texture), 'sprite');
player.addComponent(new PhysicsComponent(), 'physics');
player.addComponent(new HealthComponent(100), 'health');
player.addComponent(new InputComponent(), 'input');
```

### Component Dependencies

Components can depend on other components:

```typescript
export class PlayerController extends Component {
  static readonly TYPE: string = 'player-controller';

  private physics: PhysicsComponent | null = null;
  private health: HealthComponent | null = null;

  init(): void {
    const entity = this.entity as Entity;

    // Get required components
    this.physics = entity.getComponent<PhysicsComponent>('physics');
    this.health = entity.getComponent<HealthComponent>('health');

    if (!this.physics || !this.health) {
      console.warn('PlayerController requires Physics and Health components');
      this.enabled = false;
    }
  }

  update(deltaTime: number): void {
    if (!this.physics || !this.health) return;

    // Use other components
    if (this.health.current <= 0) {
      // Player is defeated
      this.physics.velocity.set(0, 0);
    }
  }
}
```

## Best Practices

1. **Keep Components Focused**: Each component should have a single responsibility
2. **Use Type Constants**: Always define and use `static TYPE` properties
3. **Check Dependencies**: Verify required components in the `init` method
4. **Clean Up Resources**: Properly clean up in the `destroy` method
5. **Avoid Deep Inheritance**: Prefer composition over inheritance
6. **Component Communication**: Use events or direct component references
7. **Lazy Initialization**: Only initialize resources when needed

## Example: Creating a Game Character

Here's a complete example showing how to create a game character using the ECS:

```typescript
import { Engine, Entity, Component } from '@prometheus/engine-core';
import { Assets, Texture, Sprite, Point } from 'pixi.js';

// Define components
class SpriteComponent extends Component {
  static readonly TYPE: string = 'sprite';
  sprite: Sprite;

  constructor(texture: Texture) {
    super();
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
  }

  init(): void {
    (this.entity as Entity).container.addChild(this.sprite);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

class MovementComponent extends Component {
  static readonly TYPE: string = 'movement';
  velocity: Point = new Point(0, 0);
  speed: number = 5;

  update(deltaTime: number): void {
    const entity = this.entity as Entity;
    entity.setPosition(
      entity.container.x + this.velocity.x * this.speed * deltaTime,
      entity.container.y + this.velocity.y * this.speed * deltaTime,
    );
  }
}

class InputComponent extends Component {
  static readonly TYPE: string = 'input';
  private movement: MovementComponent | null = null;
  private keysDown: Set<string> = new Set();

  init(): void {
    const entity = this.entity as Entity;
    this.movement = entity.getComponent<MovementComponent>(MovementComponent.TYPE);

    // Set up input handlers
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(event: KeyboardEvent): void {
    this.keysDown.add(event.key);
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.keysDown.delete(event.key);
  }

  update(): void {
    if (!this.movement) return;

    // Update velocity based on keys
    const velocity = this.movement.velocity;
    velocity.x = 0;
    velocity.y = 0;

    if (this.keysDown.has('ArrowUp')) velocity.y = -1;
    if (this.keysDown.has('ArrowDown')) velocity.y = 1;
    if (this.keysDown.has('ArrowLeft')) velocity.x = -1;
    if (this.keysDown.has('ArrowRight')) velocity.x = 1;

    // Normalize velocity for diagonal movement
    if (velocity.x !== 0 && velocity.y !== 0) {
      const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      velocity.x /= length;
      velocity.y /= length;
    }
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}

// Game initialization
async function createCharacter(engine: Engine): Promise<Entity> {
  // Load texture
  const texture = await Assets.load('character.png');

  // Create character entity
  const character = engine.entityManager.createEntity('player');
  character.setPosition(400, 300);

  // Add components
  character.addComponent(new SpriteComponent(texture), SpriteComponent.TYPE);
  character.addComponent(new MovementComponent(), MovementComponent.TYPE);
  character.addComponent(new InputComponent(), InputComponent.TYPE);

  return character;
}
```

## Conclusion

The Entity Component System in Prometheus Engine provides a flexible architecture for building game objects. By composing entities from reusable components, you can create complex behaviors without deep inheritance hierarchies, making your code more maintainable and easier to extend.
