import { Engine } from '@prometheus/engine-core';
import { ResponsiveScene } from './ResponsiveScene.js';
import { SpineDemoScene } from './SpineDemoScene.js';

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

  // Create scenes
  const responsiveScene = new ResponsiveScene(engine);
  const spineScene = new SpineDemoScene();
  spineScene.setEngine(engine);

  // Add scenes to scene manager
  engine.sceneManager.addScene(responsiveScene);
  engine.sceneManager.addScene(spineScene);

  // Create UI for scene switching
  createSceneSwitcher(engine);

  // Start with the spine demo scene
  console.log('Starting with spine demo scene');
  engine.switchScene('spine-demo');

  // Handle window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('Prometheus Responsive Demo initialized');
}

/**
 * Creates a simple UI for switching between scenes
 * @param engine - The Prometheus engine instance
 */
function createSceneSwitcher(engine: Engine): void {
  const switcherContainer = document.createElement('div');
  switcherContainer.style.position = 'fixed';
  switcherContainer.style.top = '10px';
  switcherContainer.style.right = '10px';
  switcherContainer.style.zIndex = '1000';
  switcherContainer.style.display = 'flex';
  switcherContainer.style.flexDirection = 'column';
  switcherContainer.style.gap = '5px';

  // Create button for responsive demo scene
  const responsiveBtn = document.createElement('button');
  responsiveBtn.textContent = 'Responsive Demo';
  responsiveBtn.style.padding = '8px 12px';
  responsiveBtn.style.cursor = 'pointer';
  responsiveBtn.onclick = () => engine.switchScene('responsive-demo');

  // Create button for spine demo scene
  const spineBtn = document.createElement('button');
  spineBtn.textContent = 'Spine Demo';
  spineBtn.style.padding = '8px 12px';
  spineBtn.style.cursor = 'pointer';
  spineBtn.onclick = () => engine.switchScene('spine-demo');

  // Add buttons to container
  switcherContainer.appendChild(responsiveBtn);
  switcherContainer.appendChild(spineBtn);

  // Add container to document body
  document.body.appendChild(switcherContainer);
}
