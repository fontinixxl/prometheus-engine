import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/** Debug panel positions */
export enum DebugPanelPosition {
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
}

/** Configuration options for the debug overlay */
export interface DebugOverlayConfig {
  /** Position of the debug panel (default: TopLeft) */
  position?: DebugPanelPosition;
  /** Background color (default: black with 0.5 alpha) */
  backgroundColor?: number;
  /** Background alpha (default: 0.5) */
  backgroundAlpha?: number;
  /** Text color (default: white) */
  textColor?: number;
  /** Whether to show FPS counter (default: true) */
  showFPS?: boolean;
  /** Whether to show memory usage (default: false) */
  showMemory?: boolean;
  /** Whether to show GPU stats (default: false) */
  showGPU?: boolean;
  /** Whether the overlay is initially visible (default: true) */
  visible?: boolean;
}

/**
 * Manages the debug overlay with performance metrics
 */
export class DebugOverlay {
  /** Container for the debug overlay */
  container: Container;

  /** Background for the debug panel */
  private background: Graphics;

  /** Position of the debug panel */
  private position: DebugPanelPosition;

  /** Text style for debug information */
  private textStyle: TextStyle;

  /** Map of stat displays by name */
  private stats: Map<string, Text> = new Map();

  /** Frame counter for FPS calculation */
  private frames = 0;

  /** Last time FPS was calculated */
  private lastTime = 0;

  /** Current FPS value */
  private fps = 0;

  /** Whether FPS counter is enabled */
  private showFPS: boolean;

  /** Whether memory usage display is enabled */
  private showMemory: boolean;

  /** Whether GPU stats display is enabled */
  private showGPU: boolean;

  /** Panel padding */
  private padding = 10;

  /** Y position for next stat text */
  private nextY = this.padding;

  /** Minimum panel width */
  private minWidth = 150;

  /**
   * Creates a new debug overlay
   * @param config - Configuration options
   */
  constructor(config: DebugOverlayConfig = {}) {
    this.position = config.position || DebugPanelPosition.TopLeft;
    this.showFPS = config.showFPS !== false;
    this.showMemory = config.showMemory || false;
    this.showGPU = config.showGPU || false;

    // Create container
    this.container = new Container();
    this.container.eventMode = 'none';
    this.container.zIndex = 1000; // Ensure it's on top
    this.container.name = 'debug-overlay';
    this.container.visible = config.visible !== false;

    // Create text style
    this.textStyle = new TextStyle({
      fontSize: 14,
      fill: config.textColor || 0xffffff,
      fontFamily: 'monospace',
    });

    // Create background
    this.background = new Graphics();
    this.background.beginFill(config.backgroundColor || 0x000000, config.backgroundAlpha || 0.5);
    this.background.drawRect(0, 0, this.minWidth, 100); // Initial size
    this.background.endFill();
    this.container.addChild(this.background);

    // Set up stats
    this.setupStats();

    // Position the overlay
    this.positionOverlay();
  }

  /**
   * Set up the stat displays
   */
  private setupStats(): void {
    if (this.showFPS) {
      this.addStat('fps', 'FPS: 0');
    }

    if (this.showMemory) {
      this.addStat('memory', 'Memory: 0 MB');
    }

    if (this.showGPU) {
      this.addStat('drawCalls', 'Draw Calls: 0');
      this.addStat('triangles', 'Triangles: 0');
    }
  }

  /**
   * Add a stat display
   * @param name - Unique name for the stat
   * @param initialText - Initial text to display
   * @returns The created Text object
   */
  addStat(name: string, initialText: string): Text {
    if (this.stats.has(name)) {
      console.warn(`Stat '${name}' already exists in debug overlay. Replacing.`);
      this.removeStat(name);
    }

    const text = new Text(initialText, this.textStyle);
    text.position.set(this.padding, this.nextY);
    this.container.addChild(text);

    this.stats.set(name, text);

    // Update next Y position
    this.nextY += text.height + 5;

    // Update background height
    this.resizeBackground();

    return text;
  }

  /**
   * Remove a stat display
   * @param name - Name of the stat to remove
   */
  removeStat(name: string): void {
    const text = this.stats.get(name);
    if (text) {
      this.container.removeChild(text);
      this.stats.delete(name);

      // Recalculate positions
      this.recalculatePositions();
    }
  }

  /**
   * Update a stat display
   * @param name - Name of the stat to update
   * @param value - New value to display
   */
  updateStat(name: string, value: string): void {
    const text = this.stats.get(name);
    if (text) {
      text.text = value;

      // Check if width changed and resize background if needed
      this.resizeBackground();
    }
  }

  /**
   * Recalculate positions of all stats
   */
  private recalculatePositions(): void {
    this.nextY = this.padding;

    for (const text of this.stats.values()) {
      text.position.y = this.nextY;
      this.nextY += text.height + 5;
    }

    // Update background size
    this.resizeBackground();
  }

  /**
   * Resize the background to fit all stats
   */
  private resizeBackground(): void {
    let maxWidth = this.minWidth;

    // Find the widest text
    for (const text of this.stats.values()) {
      maxWidth = Math.max(maxWidth, text.width + this.padding * 2);
    }

    // Update background
    this.background.clear();
    this.background.beginFill(0x000000, 0.5);
    this.background.drawRect(0, 0, maxWidth, this.nextY + this.padding);
    this.background.endFill();
  }

  /**
   * Position the overlay based on the configured position
   */
  private positionOverlay(): void {
    switch (this.position) {
      case DebugPanelPosition.TopRight:
        this.container.position.set(window.innerWidth - this.background.width, 0);
        break;
      case DebugPanelPosition.BottomLeft:
        this.container.position.set(0, window.innerHeight - this.background.height);
        break;
      case DebugPanelPosition.BottomRight:
        this.container.position.set(
          window.innerWidth - this.background.width,
          window.innerHeight - this.background.height,
        );
        break;
      case DebugPanelPosition.TopLeft:
      default:
        this.container.position.set(0, 0);
        break;
    }
  }

  /**
   * Update the overlay with current performance metrics
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    if (!this.container.visible) return;

    // Update FPS counter
    if (this.showFPS) {
      this.frames++;

      const now = performance.now();
      if (now - this.lastTime >= 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
        this.updateStat('fps', `FPS: ${this.fps}`);
        this.frames = 0;
        this.lastTime = now;
      }
    }

    // Update memory stats if enabled
    if (this.showMemory && (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
      this.updateStat('memory', `Memory: ${usedMB}MB / ${totalMB}MB`);
    }
  }

  /**
   * Handle window resize
   */
  resize(): void {
    // Reposition the overlay
    this.positionOverlay();
  }

  /**
   * Toggle visibility of the overlay
   * @param visible - If provided, set to this value, otherwise toggle
   */
  toggleVisibility(visible?: boolean): void {
    if (visible !== undefined) {
      this.container.visible = visible;
    } else {
      this.container.visible = !this.container.visible;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.container.destroy({ children: true });
    this.stats.clear();
  }
}
