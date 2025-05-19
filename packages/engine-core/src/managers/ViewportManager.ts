import { Application } from 'pixi.js';

/**
 * Screen orientation types
 */
export enum Orientation {
  Landscape = 'landscape',
  Portrait = 'portrait',
}

/**
 * Device type categories
 */
export enum DeviceType {
  Mobile = 'mobile',
  Tablet = 'tablet',
  Desktop = 'desktop',
}

/**
 * Viewport sizing configuration
 */
export interface ViewportConfig {
  /** Base design width (default: 1920) */
  designWidth?: number;

  /** Base design height (default: 1080) */
  designHeight?: number;

  /** Whether to maintain aspect ratio (default: true) */
  maintainAspectRatio?: boolean;

  /** Default orientation for the app (default: landscape) */
  defaultOrientation?: Orientation;

  /** Width threshold for detecting a tablet device (default: 768) */
  tabletThreshold?: number;

  /** Width threshold for detecting a desktop device (default: 1024) */
  desktopThreshold?: number;
}

/**
 * Manages the viewport and handles responsive layouts
 */
export class ViewportManager {
  /** Current viewport width */
  width: number;

  /** Current viewport height */
  height: number;

  /** Design width for calculations */
  designWidth: number;

  /** Design height for calculations */
  designHeight: number;

  /** Scale factor for X axis */
  scaleX: number = 1;

  /** Scale factor for Y axis */
  scaleY: number = 1;

  /** Uniform scale factor (min of scaleX and scaleY) */
  scale: number = 1;

  /** Current orientation */
  orientation: Orientation;

  /** Whether to maintain aspect ratio */
  maintainAspectRatio: boolean;

  /** Default orientation */
  defaultOrientation: Orientation;

  /** Reference to the PIXI application */
  private app: Application;

  /** Last detected device type */
  private _deviceType: DeviceType = DeviceType.Desktop;

  /** Width threshold for tablet detection */
  private tabletThreshold: number;

  /** Width threshold for desktop detection */
  private desktopThreshold: number;

  /**
   * Create a new ViewportManager
   * @param app - The PIXI application instance
   * @param config - Viewport configuration
   */
  constructor(app: Application, config: ViewportConfig = {}) {
    this.app = app;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.designWidth = config.designWidth || 1920;
    this.designHeight = config.designHeight || 1080;
    this.maintainAspectRatio = config.maintainAspectRatio !== false;
    this.defaultOrientation = config.defaultOrientation || Orientation.Landscape;
    this.tabletThreshold = config.tabletThreshold || 768;
    this.desktopThreshold = config.desktopThreshold || 1024;

    this.orientation = this.detectOrientation();
    this._deviceType = this.detectDeviceType();

    // Calculate initial scales
    this.calculateScales();

    // Set up resize listener
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Get the current device type
   */
  get deviceType(): DeviceType {
    return this._deviceType;
  }

  /**
   * Detect the current orientation
   */
  private detectOrientation(): Orientation {
    if (this.width >= this.height) {
      return Orientation.Landscape;
    } else {
      return Orientation.Portrait;
    }
  }

  /**
   * Detect the current device type
   */
  private detectDeviceType(): DeviceType {
    // Use the longer dimension for more reliable detection
    const longerDimension = Math.max(window.innerWidth, window.innerHeight);

    if (longerDimension < this.tabletThreshold) {
      return DeviceType.Mobile;
    } else if (longerDimension < this.desktopThreshold) {
      return DeviceType.Tablet;
    } else {
      return DeviceType.Desktop;
    }
  }

  /**
   * Calculate scale factors based on viewport size
   */
  private calculateScales(): void {
    this.scaleX = this.width / this.designWidth;
    this.scaleY = this.height / this.designHeight;

    if (this.maintainAspectRatio) {
      this.scale = Math.min(this.scaleX, this.scaleY);
    } else {
      this.scale = 1;
    }
  }

  /**
   * Handle window resize event
   */
  private handleResize(): void {
    this.resize(window.innerWidth, window.innerHeight);
  }

  /**
   * Resize the viewport
   * @param width - New viewport width
   * @param height - New viewport height
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;

    const newOrientation = this.detectOrientation();
    const newDeviceType = this.detectDeviceType();

    const orientationChanged = newOrientation !== this.orientation;
    const deviceTypeChanged = newDeviceType !== this._deviceType;

    this.orientation = newOrientation;
    this._deviceType = newDeviceType;

    // Recalculate scales
    this.calculateScales();

    // Emit events for orientation and device type changes
    if (orientationChanged) {
      this.onOrientationChange(this.orientation);
    }

    if (deviceTypeChanged) {
      this.onDeviceTypeChange(this._deviceType);
    }
  }

  /**
   * Called when the orientation changes
   * @param orientation - The new orientation
   */
  onOrientationChange(orientation: Orientation): void {
    console.log(`Orientation changed to ${orientation}`);
    // Override in subclass or register event listeners
  }

  /**
   * Called when the device type changes
   * @param deviceType - The new device type
   */
  onDeviceTypeChange(deviceType: DeviceType): void {
    console.log(`Device type changed to ${deviceType}`);
    // Override in subclass or register event listeners
  }

  /**
   * Convert design coordinates to screen coordinates
   * @param x - X coordinate in design space
   * @param y - Y coordinate in design space
   * @returns Coordinates in screen space
   */
  toScreenCoords(x: number, y: number): { x: number; y: number } {
    if (this.maintainAspectRatio) {
      // Calculate centered position when maintaining aspect ratio
      const scaledWidth = this.designWidth * this.scale;
      const scaledHeight = this.designHeight * this.scale;
      const offsetX = (this.width - scaledWidth) / 2;
      const offsetY = (this.height - scaledHeight) / 2;

      return {
        x: offsetX + x * this.scale,
        y: offsetY + y * this.scale,
      };
    } else {
      return {
        x: x * this.scaleX,
        y: y * this.scaleY,
      };
    }
  }

  /**
   * Convert screen coordinates to design coordinates
   * @param x - X coordinate in screen space
   * @param y - Y coordinate in screen space
   * @returns Coordinates in design space
   */
  toDesignCoords(x: number, y: number): { x: number; y: number } {
    if (this.maintainAspectRatio) {
      // Calculate from centered position when maintaining aspect ratio
      const scaledWidth = this.designWidth * this.scale;
      const scaledHeight = this.designHeight * this.scale;
      const offsetX = (this.width - scaledWidth) / 2;
      const offsetY = (this.height - scaledHeight) / 2;

      return {
        x: (x - offsetX) / this.scale,
        y: (y - offsetY) / this.scale,
      };
    } else {
      return {
        x: x / this.scaleX,
        y: y / this.scaleY,
      };
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}
