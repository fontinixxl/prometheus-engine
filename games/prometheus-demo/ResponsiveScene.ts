import {
  Scene,
  Graphics,
  Text,
  TextStyle,
  Sprite,
  Container,
  Orientation,
  DeviceType,
  Engine,
} from '@prometheus/engine-core';

/**
 * A scene that demonstrates responsive layout capabilities
 */
export class ResponsiveScene extends Scene {
  // UI elements
  private title!: Text;
  private infoText!: Text;
  private bunny!: Sprite;
  private button!: Container;
  private deviceInfo!: Text;
  private deviceInfoContainer!: Container;
  private background!: Graphics;
  private mobileLayout!: Container;
  private desktopLayout!: Container;

  // Reference to the engine
  private engine: Engine;

  /**
   * Create a responsive demo scene
   */
  constructor(engine: Engine) {
    super('responsive-demo');
    this.engine = engine;

    // Initialize containers and UI elements
    this.setupScene();
  }

  /**
   * Set up the scene with all UI elements
   */
  private setupScene(): void {
    // Create background (drawing will be handled in updateLayout)
    this.background = new Graphics();
    this.container.addChild(this.background);

    // Create title
    const titleStyle = new TextStyle({
      fontSize: 32,
      fontWeight: 'bold',
      fill: 0xffffff,
    });
    this.title = new Text('Prometheus Engine Responsive Demo', titleStyle);
    this.title.anchor.set(0.5, 0);
    this.container.addChild(this.title);

    // Create info text
    const infoStyle = new TextStyle({
      fontSize: 18,
      fill: 0xffffff,
    });
    this.infoText = new Text('Resize the window to see responsive layout in action', infoStyle);
    this.infoText.anchor.set(0.5, 0);
    this.container.addChild(this.infoText);

    // Create device info text with background
    const deviceInfoStyle = new TextStyle({
      fontSize: 16,
      fill: 0xffffff,
      align: 'center',
    });

    // Create a background for the device info
    const deviceInfoBg = new Graphics();
    deviceInfoBg.beginFill(0x000000, 0.7); // Darker background for better readability
    deviceInfoBg.drawRoundedRect(-120, -15, 240, 70, 8); // Larger to fit multi-line text
    deviceInfoBg.endFill();

    this.deviceInfo = new Text('', deviceInfoStyle);
    this.deviceInfo.anchor.set(0.5, 0);

    // Create a container for the device info with background
    this.deviceInfoContainer = new Container();
    this.deviceInfoContainer.addChild(deviceInfoBg);
    this.deviceInfoContainer.addChild(this.deviceInfo);
    this.container.addChild(this.deviceInfoContainer);

    // Create a direct bunny sprite (assets should be preloaded)
    try {
      // Try to create the bunny directly
      this.bunny = Sprite.from('https://pixijs.com/assets/bunny.png');
      this.bunny.anchor.set(0.5);

      // Add a red outline to make the bunny more visible
      const outline = new Graphics();
      outline.lineStyle(4, 0xff0000);
      outline.drawRect(
        -this.bunny.width / 2,
        -this.bunny.height / 2,
        this.bunny.width,
        this.bunny.height,
      );
      this.bunny.addChild(outline);

      console.log(
        'Bunny created in setupScene, width:',
        this.bunny.width,
        'height:',
        this.bunny.height,
      );
    } catch (e) {
      // Fallback to a placeholder if there's an issue
      console.error('Failed to create bunny in setupScene:', e);
      this.bunny = new Sprite();
      this.bunny.anchor.set(0.5);

      // Create a placeholder
      const tempGraphics = new Graphics();
      tempGraphics.beginFill(0xff0000);
      tempGraphics.drawCircle(0, 0, 30);
      tempGraphics.endFill();
      this.bunny.addChild(tempGraphics);
    }

    this.container.addChild(this.bunny);

    // Create button
    this.button = this.createButton('Toggle Rotation', () => {
      // We'll implement this later
      this.bunny.scale.x *= -1;
    });
    this.container.addChild(this.button);

    // Create layout containers
    this.mobileLayout = new Container();
    this.desktopLayout = new Container();

    // Initially position elements
    this.updateLayout();
  }

  /**
   * Create a button with text and callback
   */
  private createButton(label: string, onClick: () => void): Container {
    const container = new Container();

    // Button background
    const bg = new Graphics();
    bg.beginFill(0x5555ff);
    bg.lineStyle(2, 0xffffff);
    bg.drawRoundedRect(0, 0, 200, 50, 10);
    bg.endFill();
    container.addChild(bg);

    // Button text
    const textStyle = new TextStyle({
      fontSize: 16,
      fill: 0xffffff,
    });
    const text = new Text(label, textStyle);
    text.anchor.set(0.5);
    text.position.set(100, 25);
    container.addChild(text);

    // Make button interactive
    container.eventMode = 'static';
    container.cursor = 'pointer';
    container.on('pointertap', onClick);

    return container;
  }

  /**
   * Update layout based on current device type and orientation
   */
  private updateLayout(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const orientation = width >= height ? Orientation.Landscape : Orientation.Portrait;
    const deviceType = this.getDeviceType(width, height);

    // Update device info text with more details
    this.deviceInfo.text =
      `Device: ${deviceType}\n` + `Orientation: ${orientation}\n` + `Viewport: ${width}×${height}`;

    // Position elements based on device type and orientation
    if (deviceType === DeviceType.Mobile || deviceType === DeviceType.Tablet) {
      this.applyMobileLayout(orientation);
    } else {
      this.applyDesktopLayout();
    }

    // Log the layout change
    console.log(`Layout updated: ${deviceType} in ${orientation} mode, size: ${width}x${height}`);
  }

  /**
   * Apply mobile/tablet layout
   */
  private applyMobileLayout(orientation: Orientation): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Position title and info
    this.title.position.set(width / 2, 20);
    this.infoText.position.set(width / 2, 70);
    this.deviceInfoContainer.position.set(width / 2, 100);

    // Set background color to indicate mobile/tablet layout
    this.background.clear();
    this.background.beginFill(orientation === Orientation.Portrait ? 0x6b4d7e : 0x4d7e6b);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();

    if (orientation === Orientation.Portrait) {
      // Portrait layout - elements stacked vertically
      this.bunny.position.set(width / 2, height / 2);
      this.bunny.scale.set(2, 2);

      this.button.position.set(width / 2 - 100, height - 70);
    } else {
      // Landscape layout - elements side by side
      this.bunny.position.set(width / 3, height / 2);
      this.bunny.scale.set(1.5, 1.5);

      this.button.position.set((width * 2) / 3 - 100, height / 2 - 25);
    }
  }

  /**
   * Apply desktop layout
   */
  private applyDesktopLayout(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Set background color to indicate desktop layout
    this.background.clear();
    this.background.beginFill(0x1099bb); // Original blue color for desktop
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();

    // Position title and info centered at the top
    this.title.position.set(width / 2, 50);
    this.infoText.position.set(width / 2, 100);
    this.deviceInfoContainer.position.set(width / 2, 130);

    // Center bunny with larger scale
    this.bunny.position.set(width / 2, height / 2);
    this.bunny.scale.set(3, 3);

    // Position button at the bottom center
    this.button.position.set(width / 2 - 100, height - 100);
  }

  /**
   * Determine device type based on dimensions
   */
  private getDeviceType(width: number, height: number): DeviceType {
    const longerDimension = Math.max(width, height);

    if (longerDimension < 768) {
      return DeviceType.Mobile;
    } else if (longerDimension < 1024) {
      return DeviceType.Tablet;
    } else {
      return DeviceType.Desktop;
    }
  }

  /**
   * Handle scene initialization
   */
  init(): void {
    super.init();
    console.log(
      'ResponsiveScene initialized, bunny sprite dimensions:',
      this.bunny.width,
      'x',
      this.bunny.height,
    );

    // Ensure layout is updated
    this.updateLayout();
  }

  /**
   * Handle scene activation
   */
  enter(): void {
    super.enter();

    // Animation will be handled by the engine's update loop
    console.log('Responsive demo scene activated');
  }

  /**
   * Handle scene deactivation
   */
  exit(): void {
    super.exit();

    console.log('Responsive demo scene deactivated');
  }

  /**
   * Update the scene each frame
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    // Rotate the bunny
    this.bunny.rotation += 1 * deltaTime;

    // Call the parent update method
    super.update(deltaTime);
  }

  /**
   * Handle window resize
   */
  resize(width: number, height: number): void {
    super.resize(width, height);

    // Update responsive layout (which will also update the background)
    this.updateLayout();
  }
}
