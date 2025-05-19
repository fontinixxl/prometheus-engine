# Prometheus Engine

A modern, component-based game engine built on top of PixiJS, designed for creating high-performance 2D games and interactive applications.

## Features

- **Entity Component System**: Modular and reusable components for game objects
- **Scene Management**: Easily create and switch between different game scenes
- **Asset Management**: Simplified asset loading and caching
- **Responsive Design**: Built-in support for different screen sizes and orientations
- **Standardized Import System**: Clean and consistent import paths
- **ES Module Support**: Modern JavaScript module system for better compatibility

## Getting Started

### Prerequisites

- Node.js 16+
- pnpm

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/yourusername/prometheus-engine.git
cd prometheus-engine
pnpm install
```

### Creating a New Game

```bash
pnpm --filter cli run exec my-game
```

This creates a new game in the `games/my-game` directory with all the necessary configuration.

### Running a Game

```bash
pnpm --filter my-game dev
```

### Building a Game for Production

```bash
pnpm --filter my-game build
```

## Using the Standardized Import System

The Prometheus Engine uses a standardized import system that simplifies imports across your games and applications:

```typescript
// Import engine components using the standard import path
import { Engine, Scene, Entity } from '@prometheus/engine-core';

// Create and initialize the engine
const engine = new Engine();
```

For more information about the import system, see the [Using Prometheus Imports](docs/using-prometheus-imports.md) guide.

## Project Structure

- `packages/`: Core engine packages
  - `engine-core/`: The main engine package
  - `cli/`: Command-line tools for working with the engine
  - `editor/`: Visual editor for creating games
- `games/`: Example and demo games
  - `bouncing-bunnies/`: A simple demo with bouncing bunnies
  - `prometheus-demo/`: A more advanced demo showcasing responsive design

## Documentation

For more detailed documentation, see the `docs/` directory:

- [Prometheus Engine Documentation](docs/prometheus-engine-documentation.md)
- [Entity Component System](docs/prometheus-engine-entity-component-system.md)
- [Import System](docs/using-prometheus-imports.md)
- [ES Module Migration Guide](docs/es-module-migration.md)
- [Responsive Design Examples](docs/prometheus-engine-responsive-examples.md)

## License

[MIT](LICENSE)
