import { Container } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Component } from '../entity/Component';

/**
 * Component for managing Spine animations
 */
export class SpineComponent extends Component {
  static readonly TYPE: string = 'spine';

  /**
   * The Spine instance
   */
  spine: Spine | null = null;

  /**
   * The container the spine is added to
   */
  container: Container | null = null;

  /**
   * Set the spine instance and container
   * @param spine - The spine instance
   * @param container - The container to add the spine to
   */
  setSpine(spine: Spine, container: Container): void {
    this.spine = spine;
    this.container = container;

    if (this.spine && this.container && !this.container.children.includes(this.spine)) {
      this.container.addChild(this.spine);
    }
  }

  /**
   * Play an animation
   * @param animationName - The name of the animation to play
   * @param loop - Whether to loop the animation (default: true)
   */
  play(animationName: string, loop: boolean = true): void {
    if (this.spine) {
      this.spine.state.setAnimation(0, animationName, loop);
    }
  }

  /**
   * Set the skin
   * @param skinName - The name of the skin to set
   */
  setSkin(skinName: string): void {
    if (this.spine) {
      this.spine.skeleton.setSkinByName(skinName);
      this.spine.skeleton.setSlotsToSetupPose();
    }
  }

  /**
   * Set the playback speed
   * @param speed - The speed to set (1 is normal speed)
   */
  setSpeed(speed: number): void {
    if (this.spine) {
      this.spine.state.timeScale = speed;
    }
  }

  /**
   * Update the spine animation
   * @param deltaTime - The time elapsed since the last update
   */
  update(deltaTime: number): void {
    if (this.spine) {
      this.spine.update(deltaTime);
    }
  }
}
