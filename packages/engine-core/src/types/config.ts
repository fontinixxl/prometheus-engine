/**
 * Common configuration types for the Prometheus Engine
 */

/**
 * Position object with x and y coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size object with width and height
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Rectangle object with position and size
 */
export interface Rectangle extends Position, Size {}

/**
 * Represents an anchor point (0-1)
 */
export interface Anchor {
  x: number;
  y: number;
}

/**
 * Represents a transform with position, scale, and rotation
 */
export interface Transform {
  position: Position;
  scale: { x: number; y: number };
  rotation: number;
}

/**
 * Margin configuration for layouts
 */
export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Game area configuration for responsive layouts
 */
export interface GameArea {
  width: number;
  height: number;
  safeArea?: Margin;
}
