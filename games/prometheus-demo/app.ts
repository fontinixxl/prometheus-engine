import {
  Engine,
  Sprite,
  Graphics,
  Text,
  TextStyle,
} from '../../packages/engine-core/dist/index.js';

// Main application entry point
export async function init(container: HTMLElement): Promise<void> {
  // Create and initialize the engine
  const engine = new Engine({
    debug: true, // Enable debug overlay
  });

  // Initialize the engine
  await engine.init(container);

  // Create a scene
  const scene = engine.createScene();

  // Create background
  const background = new Graphics();
  background.beginFill(0x1099bb);
  background.drawRect(0, 0, window.innerWidth, window.innerHeight);
  background.endFill();
  scene.addChild(background);

  // Load bunny texture
  await engine.loadAssets(['https://pixijs.com/assets/bunny.png']);

  // Create bunny sprite
  const bunny = Sprite.from('https://pixijs.com/assets/bunny.png');

  // Center the bunny's anchor point
  bunny.anchor.set(0.5);

  // Position the bunny in the center of the screen
  bunny.x = window.innerWidth / 2;
  bunny.y = window.innerHeight / 2;

  // Add the bunny to the scene
  scene.addChild(bunny);

  // Create a title text
  const textStyle = new TextStyle({
    fontSize: 24,
    fill: 0xffffff,
  });
  const title = new Text('Prometheus Engine Demo', textStyle);
  title.anchor.set(0.5, 0);
  title.x = window.innerWidth / 2;
  title.y = 20;
  scene.addChild(title);

  // Create a button to change rotation direction
  const buttonContainer = new Graphics();
  buttonContainer.beginFill(0x5555ff);
  buttonContainer.lineStyle(2, 0xffffff);
  buttonContainer.drawRect(0, 0, 200, 50);
  buttonContainer.endFill();
  buttonContainer.x = window.innerWidth / 2 - 100;
  buttonContainer.y = window.innerHeight - 70;
  buttonContainer.eventMode = 'static';
  buttonContainer.cursor = 'pointer';
  scene.addChild(buttonContainer);

  const buttonTextStyle = new TextStyle({
    fontSize: 16,
    fill: 0xffffff,
  });
  const buttonText = new Text('Change Direction', buttonTextStyle);
  buttonText.anchor.set(0.5);
  buttonText.x = buttonContainer.width / 2;
  buttonText.y = buttonContainer.height / 2;
  buttonContainer.addChild(buttonText);

  // Add rotation to the bunny
  let rotationSpeed = 0.1;

  // Use the correct ticker callback format for PixiJS v8
  engine.app.ticker.add((ticker) => {
    bunny.rotation += rotationSpeed * ticker.deltaTime;
  });

  // Handle button click to change rotation direction
  buttonContainer.on('pointertap', () => {
    rotationSpeed = -rotationSpeed;
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    background.clear();
    background.beginFill(0x1099bb);
    background.drawRect(0, 0, window.innerWidth, window.innerHeight);
    background.endFill();

    bunny.x = window.innerWidth / 2;
    bunny.y = window.innerHeight / 2;

    title.x = window.innerWidth / 2;

    buttonContainer.x = window.innerWidth / 2 - 100;
    buttonContainer.y = window.innerHeight - 70;

    engine.resize();
  });

  console.log('Game initialized');
}
