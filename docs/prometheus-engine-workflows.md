# Prometheus Engine Workflows

## Scene, Asset and Responsive Layout Workflow

This document explains how the Prometheus Engine handles scenes, assets, and responsive layouts to create games that work well across different devices.

## Scene System

### Scene Lifecycle

Scenes in Prometheus Engine represent distinct visual states in your game (like a main menu, gameplay screen, or results screen). Each scene has a defined lifecycle:

1. **Creation**: Create a scene with `engine.createScene(name)` or by extending the `Scene` class
2. **Initialization**: `init()` is called once when the scene is first added to the stage
3. **Activation**: `enter()` is called when the scene becomes active
4. **Updates**: `update(deltaTime)` is called each frame while the scene is active
5. **Resizing**: `resize(width, height)` is called when the viewport size changes
6. **Deactivation**: `exit()` is called when the scene becomes inactive
7. **Destruction**: `destroy()` is called when the scene is permanently removed

### Scene Structure

Each scene contains two main containers:

- `container`: The main container for all visual elements
- `ui`: A special container for UI elements that supports layout capabilities

### Creating Custom Scenes

To create a custom scene, extend the base `Scene` class:

```typescript
import { Scene } from '@prometheus/engine-core';

export class GameplayScene extends Scene {
  constructor() {
    super('gameplay');
  }

  init(): void {
    // Initialize scene objects, load assets, etc.
  }

  enter(): void {
    super.enter();
    // Start animations, music, etc.
  }

  update(deltaTime: number): void {
    // Update game logic each frame
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    // Handle responsive layout updates
  }

  exit(): void {
    super.exit();
    // Pause animations, music, etc.
  }
}
```

### Scene Management

The `SceneManager` handles scene transitions and updates:

```typescript
// Create and register scenes
const mainMenu = engine.createScene('mainMenu');
const gameplay = new GameplayScene();
engine.sceneManager.addScene(gameplay);

// Switch between scenes
engine.switchScene('mainMenu');
engine.switchScene('gameplay');
```

## Asset Management System

The Asset Manager provides a structured way to load and manage game assets.

### Asset Bundles

Assets are organized into bundles for efficient loading:

```typescript
// Register an asset bundle
engine.registerAssetBundle({
  name: 'gameAssets',
  assets: [
    { name: 'bunny', url: 'assets/bunny.png' },
    { name: 'background', url: 'assets/background.jpg' },
    { name: 'music', url: 'assets/music.mp3' },
  ],
});

// Load the bundle with progress tracking
await engine.loadAssetBundle('gameAssets', (progress) => {
  console.log(`Loading: ${progress * 100}%`);
});
```

### Direct Asset Loading

For simpler use cases, assets can be loaded directly:

```typescript
// Load assets directly
await engine.loadAssets(
  [
    { name: 'bunny', url: 'assets/bunny.png' },
    { name: 'background', url: 'assets/background.jpg' },
  ],
  (progress) => {
    console.log(`Loading: ${progress * 100}%`);
  },
);

// Access loaded assets using PixiJS Assets
const bunnyTexture = await Assets.get('bunny');
const sprite = new Sprite(bunnyTexture);
```

### Asset Loading Best Practices

1. **Preload Critical Assets**: Load essential assets before showing gameplay
2. **Bundle Related Assets**: Group assets by when they're needed
3. **Show Loading Progress**: Always provide visual feedback during loading
4. **Handle Errors**: Add error handling for asset loading failures
5. **Use Asset Names**: Reference assets by name rather than URL for flexibility

## Responsive Layout System

The Prometheus Engine integrates with @pixi/layout to handle responsive layouts across different devices and orientations.

### Device Detection

The `ViewportManager` automatically detects:

- **Device Type**: Mobile, Tablet, or Desktop
- **Orientation**: Portrait or Landscape

```typescript
// Get the current device information
const deviceType = engine.getDeviceType();
const orientation = engine.getOrientation();

console.log(`Running on ${deviceType} in ${orientation} mode`);
```

### Responsive Layout Workflow

1. **Design for Multiple Devices**: Plan your layouts for different screen sizes
2. **Use Device Detection**: Adapt your UI based on device type and orientation
3. **Handle Resize Events**: Update layouts when the viewport changes
4. **Test on Various Devices**: Regularly test on different screen sizes

### Layout Techniques

#### Using Background Colors for Device Type Indication

```typescript
// Set different backgrounds based on device type
resize(width: number, height: number): void {
  super.resize(width, height);

  const deviceType = this.engine.getDeviceType();
  const orientation = this.engine.getOrientation();

  // Set background color based on device type
  if (deviceType === DeviceType.Mobile) {
    this.container.backgroundColor = orientation === Orientation.Portrait
      ? 0x5C6BC0 // Mobile portrait
      : 0x7986CB; // Mobile landscape
  } else if (deviceType === DeviceType.Tablet) {
    this.container.backgroundColor = orientation === Orientation.Portrait
      ? 0x43A047 // Tablet portrait
      : 0x66BB6A; // Tablet landscape
  } else {
    this.container.backgroundColor = 0x1E88E5; // Desktop
  }
}
```

#### Device-Specific Layouts

```typescript
// Position elements based on device type and orientation
resize(width: number, height: number): void {
  super.resize(width, height);

  const deviceType = this.engine.getDeviceType();
  const orientation = this.engine.getOrientation();

  if (deviceType === DeviceType.Mobile) {
    if (orientation === Orientation.Portrait) {
      // Mobile portrait layout
      this.infoPanel.x = 10;
      this.infoPanel.y = 10;
      this.infoPanel.width = width - 20;
    } else {
      // Mobile landscape layout
      this.infoPanel.x = width - 200;
      this.infoPanel.y = 10;
      this.infoPanel.width = 190;
    }
  } else {
    // Desktop/tablet layout
    this.infoPanel.x = 20;
    this.infoPanel.y = 20;
    this.infoPanel.width = 300;
  }
}
```

### Responding to Orientation and Device Changes

The `ViewportManager` allows you to respond to changes in device orientation or type:

```typescript
// Custom viewport manager with event handling
class MyViewportManager extends ViewportManager {
  onOrientationChange(orientation: Orientation): void {
    super.onOrientationChange(orientation);
    console.log(`Orientation changed to ${orientation}`);

    // Update layouts based on new orientation
    this.updateLayout();
  }

  onDeviceTypeChange(deviceType: DeviceType): void {
    super.onDeviceTypeChange(deviceType);
    console.log(`Device type changed to ${deviceType}`);

    // Update UI components based on new device type
    this.updateUI();
  }

  private updateLayout(): void {
    // Apply layout changes
  }

  private updateUI(): void {
    // Update UI components
  }
}
```

## Integration Example: Creating a Responsive Game

Here's a complete example showing the workflow of scenes, assets, and responsive layouts:

```typescript
import { Engine, Scene, DeviceType, Orientation } from '@prometheus/engine-core';
import { Assets, Sprite, Text, TextStyle } from 'pixi.js';

// Create a responsive game scene
class ResponsiveScene extends Scene {
  private bunny: Sprite;
  private infoText: Text;
  private assetsLoaded: boolean = false;

  constructor() {
    super('responsive-demo');
  }

  async init(): Promise<void> {
    // Load assets
    try {
      await Assets.load([{ name: 'bunny', url: 'assets/bunny.png' }]);

      // Create bunny sprite
      const bunnyTexture = Assets.get('bunny');
      this.bunny = new Sprite(bunnyTexture);
      this.bunny.anchor.set(0.5);
      this.container.addChild(this.bunny);

      // Create info text
      const style = new TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fill: '#FFFFFF',
      });

      this.infoText = new Text('Device Info', style);
      this.container.addChild(this.infoText);

      this.assetsLoaded = true;
      this.updateLayout();
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  update(deltaTime: number): void {
    if (this.assetsLoaded) {
      // Rotate the bunny
      this.bunny.rotation += 0.05 * deltaTime;

      // Update info text
      const deviceType = this.engine.getDeviceType();
      const orientation = this.engine.getOrientation();
      this.infoText.text = `Device: ${deviceType}\nOrientation: ${orientation}\nSize: ${window.innerWidth}x${window.innerHeight}`;
    }
  }

  resize(width: number, height: number): void {
    super.resize(width, height);
    this.updateLayout();
  }

  private updateLayout(): void {
    if (!this.assetsLoaded) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();

    // Center the bunny
    this.bunny.x = width / 2;
    this.bunny.y = height / 2;

    // Scale bunny based on device type
    if (deviceType === DeviceType.Mobile) {
      this.bunny.scale.set(0.5);
    } else if (deviceType === DeviceType.Tablet) {
      this.bunny.scale.set(0.75);
    } else {
      this.bunny.scale.set(1.0);
    }

    // Position info text based on orientation
    if (orientation === Orientation.Portrait) {
      this.infoText.x = 10;
      this.infoText.y = 10;
    } else {
      this.infoText.x = 10;
      this.infoText.y = 10;
    }

    // Set background color based on device type and orientation
    if (deviceType === DeviceType.Mobile) {
      this.container.backgroundColor =
        orientation === Orientation.Portrait
          ? 0x5c6bc0 // Mobile portrait
          : 0x7986cb; // Mobile landscape
    } else if (deviceType === DeviceType.Tablet) {
      this.container.backgroundColor =
        orientation === Orientation.Portrait
          ? 0x43a047 // Tablet portrait
          : 0x66bb6a; // Tablet landscape
    } else {
      this.container.backgroundColor = 0x1e88e5; // Desktop
    }
  }
}

// Initialize the engine and game
export async function init(container: HTMLElement): Promise<void> {
  // Create the engine
  const engine = new Engine({
    debug: true,
    backgroundColor: '#1099bb',
  });

  // Initialize the engine
  await engine.init(container);

  // Create and switch to the responsive scene
  const scene = new ResponsiveScene();
  engine.sceneManager.addScene(scene);
  engine.switchScene('responsive-demo');
}
```

## Conclusion

The Prometheus Engine provides a robust framework for creating games that work well across different devices:

1. **Scene System**: Manages game states with a clear lifecycle
2. **Asset Management**: Efficiently loads and manages game resources
3. **Responsive Layout**: Adapts to different device types and orientations

By following the workflows outlined in this document, you can create games that provide an optimal experience regardless of the device they're played on.
