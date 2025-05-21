import { Scene, Container, Text, TextStyle, Entity, Engine } from '@prometheus/engine-core';
import { SpineComponent } from '../../packages/engine-core/src/components/SpineComponent';
import { SpineLoader } from '../../packages/engine-core/src/loaders/SpineLoader';

/**
 * Demo scene for showcasing Spine animations
 */
export class SpineDemoScene extends Scene {
  static readonly KEY = 'spine-demo';

  private spineContainer: Container = new Container();
  private infoText: Text = new Text('');
  private animations: string[] = ['idle', 'run', 'jump', 'walk'];
  private currentAnimationIndex = 0;
  private engine!: Engine;

  constructor() {
    super(SpineDemoScene.KEY);
  }

  // Set the engine properly when the scene is added to the scene manager
  setEngine(engine: Engine): void {
    this.engine = engine;
  }

  /**
   * Initialize the scene
   */
  async init(): Promise<void> {
    // Engine should already be set via setEngine method
    // Create a container for the spine animations
    this.spineContainer = new Container();
    this.container.addChild(this.spineContainer);

    // Add some instructional text
    const textStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 0xffffff,
      align: 'center',
    });

    this.infoText = new Text('Loading Spine animation...', textStyle);
    this.infoText.position.set(10, 10);
    this.container.addChild(this.infoText);

    try {
      // Register the spine asset
      SpineLoader.register({
        key: 'spineboy',
        skeletonUrl: './assets/spineboy-pro.skel',
        atlasUrl: './assets/spineboy-pma.atlas',
        isBinary: true,
        scale: 0.5,
      });

      // Load the spine asset
      const spineboy = await SpineLoader.load('spineboy');

      // Center the spine object
      spineboy.x = window.innerWidth / 2;
      spineboy.y = window.innerHeight / 1.5;

      // Set default mix time for smooth transitions
      spineboy.state.data.defaultMix = 0.2;

      // Create an entity with a spine component
      const spineEntity = new Entity('spineboy-entity', 'SpineBoy');
      const spineComponent = new SpineComponent();
      spineComponent.setSpine(spineboy, this.spineContainer);
      spineEntity.addComponent(spineComponent, SpineComponent.TYPE);

      // If we have access to the engine, add the entity to it
      if (this.engine) {
        this.engine.entityManager.addEntity(spineEntity);
      } else {
        console.warn('Engine not available, entity not added to entity manager.');
        // Still add the spine to the scene directly
        this.spineContainer.addChild(spineboy);
      }

      // Play the initial animation
      spineComponent.play('run', true);

      // Update the info text
      this.updateInfoText();

      // Add click event to change animation
      this.container.eventMode = 'static';
      this.container.on('pointerdown', this.changeAnimation.bind(this));
    } catch (error) {
      console.error('Failed to load spine asset:', error);
      this.infoText.text = `Error loading Spine animation: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  /**
   * Change to the next animation
   */
  private changeAnimation(): void {
    // Find entities with spine components
    const entities = this.engine.entityManager
      .getAllEntities()
      .filter((entity) => entity.getComponent(SpineComponent.TYPE) !== null);
    if (entities.length === 0) return;

    const spineComponent = entities[0].getComponent(SpineComponent.TYPE) as SpineComponent;
    if (!spineComponent) return;

    // Advance to the next animation
    this.currentAnimationIndex = (this.currentAnimationIndex + 1) % this.animations.length;
    const animationName = this.animations[this.currentAnimationIndex];

    // Play the new animation
    spineComponent.play(animationName, true);

    // Update the info text
    this.updateInfoText();
  }

  /**
   * Update the information text
   */
  private updateInfoText(): void {
    this.infoText.text = `Current Animation: ${this.animations[this.currentAnimationIndex]}\nClick anywhere to change animation.`;
  }
}
