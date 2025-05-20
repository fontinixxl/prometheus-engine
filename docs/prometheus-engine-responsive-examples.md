# Responsive Layout Examples

This document provides detailed examples of responsive layout techniques using the Prometheus Engine. These examples showcase how to create games and interactive applications that adapt to different device types and screen orientations.

## Color-Coded Device Type Detection

One simple and effective way to visualize how your game responds to different devices is to use color-coded backgrounds:

```typescript
import { Scene, DeviceType, Orientation, Graphics } from '@prometheus/engine-core';

export class ResponsiveColorScene extends Scene {
  private background: Graphics;

  constructor() {
    super('responsive-color-demo');
    this.background = new Graphics();
    this.container.addChild(this.background);
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();

    // Clear previous background
    this.background.clear();

    // Set color based on device type and orientation
    let color = 0x1099bb; // Default blue

    if (deviceType === DeviceType.Mobile) {
      color =
        orientation === Orientation.Portrait
          ? 0x5c6bc0 // Mobile portrait - indigo
          : 0x7986cb; // Mobile landscape - lighter indigo
    } else if (deviceType === DeviceType.Tablet) {
      color =
        orientation === Orientation.Portrait
          ? 0x43a047 // Tablet portrait - green
          : 0x66bb6a; // Tablet landscape - lighter green
    } else {
      color = 0x1e88e5; // Desktop - blue
    }

    // Draw new background
    this.background.beginFill(color);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
  }
}
```

This approach makes it immediately obvious which device type and orientation the engine has detected, which is invaluable during testing.

## Responsive UI Layout Patterns

### Pattern 1: Stack vs. Row Layout

Different layouts based on orientation:

```typescript
class StackRowScene extends Scene {
  private container: Container;
  private leftPanel: Container;
  private rightPanel: Container;

  constructor() {
    super('stack-row-demo');

    // Create panels
    this.leftPanel = this.createPanel(0x3949ab, 'Left Panel');
    this.rightPanel = this.createPanel(0x388e3c, 'Right Panel');

    // Add to main container
    this.container = new Container();
    this.container.addChild(this.leftPanel);
    this.container.addChild(this.rightPanel);
    this.ui.addChild(this.container);
  }

  private createPanel(color: number, label: string): Container {
    const panel = new Container();

    // Background
    const bg = new Graphics();
    bg.beginFill(color);
    bg.drawRect(0, 0, 300, 200);
    bg.endFill();
    panel.addChild(bg);

    // Label
    const text = new Text(label, {
      fontSize: 24,
      fill: 0xffffff,
    });
    text.anchor.set(0.5);
    text.position.set(150, 100);
    panel.addChild(text);

    return panel;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    const orientation = this.engine.getOrientation();

    if (orientation === Orientation.Portrait) {
      // Stack vertically in portrait mode
      this.leftPanel.position.set(width / 2 - 150, height / 4 - 100);
      this.rightPanel.position.set(width / 2 - 150, (height * 3) / 4 - 100);
    } else {
      // Side by side in landscape mode
      this.leftPanel.position.set(width / 4 - 150, height / 2 - 100);
      this.rightPanel.position.set((width * 3) / 4 - 150, height / 2 - 100);
    }
  }
}
```

### Pattern 2: Adaptive Content Scale

Scale content based on device type:

```typescript
class AdaptiveScaleScene extends Scene {
  private gameBoard: Container;
  private uiControls: Container;

  constructor() {
    super('adaptive-scale-demo');
    this.gameBoard = this.createGameBoard();
    this.uiControls = this.createUIControls();

    this.container.addChild(this.gameBoard);
    this.container.addChild(this.uiControls);
  }

  private createGameBoard(): Container {
    // Create a game board with fixed logical size (e.g., 800x800)
    const board = new Container();
    // Add game board content...
    return board;
  }

  private createUIControls(): Container {
    // Create UI controls
    const controls = new Container();
    // Add UI controls...
    return controls;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();

    // Center the game board
    this.gameBoard.position.set(width / 2, height / 2);

    // Scale based on device type and orientation
    let scale = 1.0;

    if (deviceType === DeviceType.Mobile) {
      scale = orientation === Orientation.Portrait ? 0.5 : 0.7;
    } else if (deviceType === DeviceType.Tablet) {
      scale = orientation === Orientation.Portrait ? 0.7 : 0.9;
    } else {
      scale = 1.0;
    }

    // Apply scale
    this.gameBoard.scale.set(scale);

    // Position UI controls based on orientation
    if (orientation === Orientation.Portrait) {
      this.uiControls.position.set(width / 2, height - 100);
    } else {
      this.uiControls.position.set(width - 100, height / 2);
    }
  }
}
```

## Device Information Display

Creating a device information display is useful for development and testing:

```typescript
class DeviceInfoDisplay extends Scene {
  private infoText: Text;
  private infoBackground: Graphics;

  constructor() {
    super('device-info-display');

    // Create background
    this.infoBackground = new Graphics();
    this.container.addChild(this.infoBackground);

    // Create text
    const style = new TextStyle({
      fontSize: 16,
      fill: 0xffffff,
      align: 'left',
    });

    this.infoText = new Text('', style);
    this.container.addChild(this.infoText);
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    // Keep device info updated in real-time
    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.infoText.text =
      `Device Type: ${deviceType}\n` +
      `Orientation: ${orientation}\n` +
      `Viewport Size: ${width}x${height}\n` +
      `Scale Factor: ${this.engine.viewportManager.scale.toFixed(2)}\n` +
      `Design Size: ${this.engine.viewportManager.designWidth}x${this.engine.viewportManager.designHeight}`;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    // Position info display in top-left corner
    this.infoText.position.set(10, 10);

    // Update background
    this.infoBackground.clear();
    this.infoBackground.beginFill(0x000000, 0.5);
    this.infoBackground.drawRect(5, 5, 250, 100);
    this.infoBackground.endFill();
  }
}
```

## Responsive Layout Grid

Create a responsive grid that adapts to different screen sizes:

```typescript
class ResponsiveGridScene extends Scene {
  private items: Container[] = [];
  private grid: Container;

  constructor() {
    super('responsive-grid-demo');

    // Create a container for the grid
    this.grid = new Container();
    this.container.addChild(this.grid);

    // Create grid items
    for (let i = 0; i < 12; i++) {
      const item = this.createGridItem(i);
      this.items.push(item);
      this.grid.addChild(item);
    }
  }

  private createGridItem(index: number): Container {
    const item = new Container();

    // Background
    const bg = new Graphics();
    bg.beginFill(0x3949ab + index * 500);
    bg.drawRoundedRect(0, 0, 150, 150, 10);
    bg.endFill();
    item.addChild(bg);

    // Label
    const text = new Text(`Item ${index + 1}`, {
      fontSize: 18,
      fill: 0xffffff,
    });
    text.anchor.set(0.5);
    text.position.set(75, 75);
    item.addChild(text);

    return item;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();

    // Determine grid configuration based on device and orientation
    let columns = 4; // Default for desktop
    let itemWidth = 170;
    let itemHeight = 170;
    let spacing = 20;

    if (deviceType === DeviceType.Mobile) {
      columns = orientation === Orientation.Portrait ? 2 : 3;
      itemWidth = 120;
      itemHeight = 120;
      spacing = 10;
    } else if (deviceType === DeviceType.Tablet) {
      columns = orientation === Orientation.Portrait ? 3 : 4;
      itemWidth = 150;
      itemHeight = 150;
      spacing = 15;
    }

    // Calculate grid layout
    const totalWidth = columns * itemWidth + (columns - 1) * spacing;
    const rows = Math.ceil(this.items.length / columns);
    const totalHeight = rows * itemHeight + (rows - 1) * spacing;

    // Center the grid
    this.grid.position.set((width - totalWidth) / 2, (height - totalHeight) / 2);

    // Position items
    for (let i = 0; i < this.items.length; i++) {
      const row = Math.floor(i / columns);
      const col = i % columns;

      const item = this.items[i];
      item.position.set(col * (itemWidth + spacing), row * (itemHeight + spacing));

      // Resize item content
      const bg = item.getChildAt(0) as Graphics;
      bg.width = itemWidth;
      bg.height = itemHeight;

      const text = item.getChildAt(1) as Text;
      text.position.set(itemWidth / 2, itemHeight / 2);
    }
  }
}
```

## Dynamic Asset Swapping

Load different assets based on device capabilities:

```typescript
class ResponsiveAssetScene extends Scene {
  private background: Sprite;
  private assetLoaded = false;

  constructor() {
    super('responsive-asset-demo');
  }

  async init(): Promise<void> {
    super.init();

    // We'll load assets in the loadAppropriateAssets method
    await this.loadAppropriateAssets();
  }

  private async loadAppropriateAssets(): Promise<void> {
    try {
      const deviceType = this.engine.getDeviceType();
      let textureUrl: string;

      // Select appropriate texture based on device type
      if (deviceType === DeviceType.Mobile) {
        textureUrl = 'assets/background-small.jpg';
      } else if (deviceType === DeviceType.Tablet) {
        textureUrl = 'assets/background-medium.jpg';
      } else {
        textureUrl = 'assets/background-large.jpg';
      }

      // Load the asset
      await this.engine.loadAssets([textureUrl]);

      // Create and position the background sprite
      this.background = Sprite.from(textureUrl);
      this.container.addChild(this.background);

      this.assetLoaded = true;
      this.resize(window.innerWidth, window.innerHeight);
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    if (this.assetLoaded) {
      // Scale background to cover the screen
      const scaleX = width / this.background.texture.width;
      const scaleY = height / this.background.texture.height;
      const scale = Math.max(scaleX, scaleY);

      this.background.scale.set(scale);

      // Center background
      this.background.position.set(
        (width - this.background.width) / 2,
        (height - this.background.height) / 2,
      );
    }
  }
}
```

## Responsive HUD Layout

Create a game HUD that adapts to different screen sizes:

```typescript
class ResponsiveHUDScene extends Scene {
  private topBar: Container;
  private bottomBar: Container;
  private leftPanel: Container;
  private rightPanel: Container;

  constructor() {
    super('responsive-hud-demo');

    // Create HUD elements
    this.topBar = this.createPanel(0x212121, 'Top Bar');
    this.bottomBar = this.createPanel(0x212121, 'Bottom Bar');
    this.leftPanel = this.createPanel(0x424242, 'Left Panel');
    this.rightPanel = this.createPanel(0x424242, 'Right Panel');

    // Add to scene
    this.container.addChild(this.topBar);
    this.container.addChild(this.bottomBar);
    this.container.addChild(this.leftPanel);
    this.container.addChild(this.rightPanel);
  }

  private createPanel(color: number, label: string): Container {
    const panel = new Container();

    // Background
    const bg = new Graphics();
    bg.beginFill(color, 0.8);
    bg.drawRect(0, 0, 100, 100);
    bg.endFill();
    panel.addChild(bg);

    // Label
    const text = new Text(label, {
      fontSize: 14,
      fill: 0xffffff,
    });
    text.anchor.set(0.5);
    text.position.set(50, 50);
    panel.addChild(text);

    return panel;
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    const deviceType = this.engine.getDeviceType();
    const orientation = this.engine.getOrientation();

    // Universal elements
    const topBarHeight = 60;
    const bottomBarHeight = 80;

    // Size and position the top bar
    this.topBar.getChildAt(0).width = width;
    this.topBar.getChildAt(0).height = topBarHeight;
    this.topBar.position.set(0, 0);
    (this.topBar.getChildAt(1) as Text).position.set(width / 2, topBarHeight / 2);

    // Size and position the bottom bar
    this.bottomBar.getChildAt(0).width = width;
    this.bottomBar.getChildAt(0).height = bottomBarHeight;
    this.bottomBar.position.set(0, height - bottomBarHeight);
    (this.bottomBar.getChildAt(1) as Text).position.set(width / 2, bottomBarHeight / 2);

    if (deviceType === DeviceType.Mobile && orientation === Orientation.Portrait) {
      // Mobile portrait: Hide side panels
      this.leftPanel.visible = false;
      this.rightPanel.visible = false;
    } else {
      // All other configurations: Show side panels
      this.leftPanel.visible = true;
      this.rightPanel.visible = true;

      const sidePanelWidth = deviceType === DeviceType.Mobile ? 60 : 100;

      // Left panel
      this.leftPanel.getChildAt(0).width = sidePanelWidth;
      this.leftPanel.getChildAt(0).height = height - topBarHeight - bottomBarHeight;
      this.leftPanel.position.set(0, topBarHeight);
      (this.leftPanel.getChildAt(1) as Text).position.set(
        sidePanelWidth / 2,
        (height - topBarHeight - bottomBarHeight) / 2,
      );

      // Right panel
      this.rightPanel.getChildAt(0).width = sidePanelWidth;
      this.rightPanel.getChildAt(0).height = height - topBarHeight - bottomBarHeight;
      this.rightPanel.position.set(width - sidePanelWidth, topBarHeight);
      (this.rightPanel.getChildAt(1) as Text).position.set(
        sidePanelWidth / 2,
        (height - topBarHeight - bottomBarHeight) / 2,
      );
    }
  }
}
```

## Orientation Change Handling

Handle orientation changes with animations:

```typescript
class OrientationChangeScene extends Scene {
  private message: Text;
  private arrow: Graphics;
  private animating: boolean = false;
  private currentOrientation: Orientation;

  constructor() {
    super('orientation-change-demo');

    // Create message text
    const style = new TextStyle({
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center',
    });

    this.message = new Text('', style);
    this.message.anchor.set(0.5);
    this.container.addChild(this.message);

    // Create rotation arrow
    this.arrow = new Graphics();
    this.arrow.lineStyle(5, 0xffffff);
    this.arrow.arc(0, 0, 50, 0, Math.PI * 1.5);
    this.arrow.lineTo(0, -50);
    this.arrow.lineTo(15, -40);
    this.container.addChild(this.arrow);

    // Store initial orientation
    this.currentOrientation = this.engine.getOrientation();
  }

  update(deltaTime: number): void {
    super.update(deltaTime);

    const orientation = this.engine.getOrientation();

    // Detect orientation change
    if (orientation !== this.currentOrientation) {
      this.animateOrientationChange(this.currentOrientation, orientation);
      this.currentOrientation = orientation;
    }

    // Subtle continuous rotation for the arrow
    if (!this.animating) {
      this.arrow.rotation += 0.01 * deltaTime;
    }
  }

  private animateOrientationChange(oldOrientation: Orientation, newOrientation: Orientation): void {
    this.animating = true;

    // Set appropriate message
    this.message.text =
      newOrientation === Orientation.Landscape
        ? 'Switching to Landscape Mode'
        : 'Switching to Portrait Mode';

    // Start with enlarged size
    this.message.scale.set(1.5);
    this.arrow.scale.set(1.5);

    // Animate arrow rotation
    const rotation = newOrientation === Orientation.Landscape ? Math.PI * 0.5 : 0;
    const startRotation = this.arrow.rotation;

    // Animation timing
    const duration = 60; // frames
    let currentFrame = 0;

    // Animation update function
    const animationUpdate = () => {
      currentFrame++;

      if (currentFrame <= duration) {
        // Animation still in progress
        const progress = currentFrame / duration;

        // Ease in-out interpolation
        const easeProgress =
          progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

        // Apply rotation and scale
        this.arrow.rotation = startRotation + (rotation - startRotation) * easeProgress;

        // Scale down to normal size
        const scale = 1.5 - 0.5 * easeProgress;
        this.message.scale.set(scale);
        this.arrow.scale.set(scale);

        // Continue animation on next frame
        requestAnimationFrame(animationUpdate);
      } else {
        // Animation complete
        this.animating = false;
        this.arrow.rotation = rotation;
        this.message.scale.set(1);
        this.arrow.scale.set(1);
      }
    };

    // Start animation
    animationUpdate();
  }

  resize(width: number, height: number): void {
    super.resize(width, height);

    // Center message and arrow
    this.message.position.set(width / 2, height / 2 - 50);
    this.arrow.position.set(width / 2, height / 2 + 50);
  }
}
```

## Conclusion

These examples demonstrate how to implement responsive layouts for different scenarios in the Prometheus Engine. By adapting your UI and gameplay elements to different device types and orientations, you can create games that provide a great experience across a wide range of devices.

Remember these key principles:

1. Always consider both device type and orientation
2. Use visual indicators during development
3. Test on actual devices whenever possible
4. Create layouts that adapt gracefully to changes
5. Consider using different assets for different device capabilities
