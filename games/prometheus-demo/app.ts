import { Engine } from '@prometheus/engine-core';
import { ResponsiveScene } from './ResponsiveScene.js';

// Main application entry point
export async function init(container: HTMLElement): Promise<void> {
  // Create and initialize the engine with responsive design support
  const engine = new Engine({
    debug: true, // Enable debug overlay
    viewport: {
      designWidth: 1920,
      designHeight: 1080,
      maintainAspectRatio: true,
    },
  });

  // Initialize the engine
  await engine.init(container);

  // Preload assets before creating the scene
  console.log('Preloading bunny texture...');
  await engine.loadAssets(['https://pixijs.com/assets/bunny.png']);
  console.log('Bunny texture preloaded');

  // Create a responsive demo scene and add it directly to the scene manager
  const mainScene = new ResponsiveScene(engine);

  // Add scene to scene manager and switch to it
  engine.sceneManager.addScene(mainScene);
  console.log('Scene added with name:', mainScene.name);
  engine.switchScene('responsive-demo');

  // Handle window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Prometheus Responsive Demo initialized');
}
