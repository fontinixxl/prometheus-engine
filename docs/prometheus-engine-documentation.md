# Prometheus Engine Documentation

## Project Overview

Prometheus Engine is a game development framework built on top of PixiJS, designed to help create 2D games with modern web technologies. The project is structured as a monorepo using PNPM workspaces, containing multiple packages that work together to provide a complete game development environment.

## Project Structure

```
prometheus-engine/
├── .husky/                  # Git hooks configuration
├── docs/                    # Documentation files
├── games/                   # Game projects created with the engine
│   ├── pixi-example-basic/  # Basic example game
│   └── sample-spine/        # Spine animation example game
├── packages/                # Core packages of the engine
│   ├── cli/                 # Command-line tools for project management
│   ├── editor/              # Electron-based game editor
│   └── engine-core/         # Core game engine functionality
├── eslint.config.mjs        # ESLint configuration
├── package.json             # Root package configuration
├── pnpm-lock.yaml           # PNPM lock file
├── pnpm-workspace.yaml      # PNPM workspace configuration
└── tsconfig.base.json       # Base TypeScript configuration
```

### Packages

#### CLI (`packages/cli`)

The CLI package provides command-line tools for managing game projects, primarily focused on scaffolding new games.

#### Editor (`packages/editor`)

The Editor is an Electron-based application that provides a visual environment for developing and testing games created with the engine.

#### Engine Core (`packages/engine-core`)

The core engine package that provides the fundamental game development functionality. This is used by games as a dependency.

### Games

Games are standalone projects that use the engine-core package. They are located in the `games/` directory and follow a specific structure to work with both the CLI and Editor tools.

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- PNPM package manager (version 10.11.0)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd prometheus-engine
pnpm install
```

## CLI Usage

### Creating a New Game

To scaffold a new game project:

```bash
pnpm init-game <game-name>
```

This will create a new directory in the `games/` folder with the following structure:

```
games/<game-name>/
├── app.ts           # Main game application code
├── index.html       # HTML entry point
├── index.ts         # TypeScript entry point
├── package.json     # Game-specific package configuration
└── vite.config.ts   # Vite configuration for the game
```

### Game Development Commands

Within your game directory, you can use these commands:

```bash
# Start development server with hot reload
pnpm --filter <game-name> dev

# Build for production
pnpm --filter <game-name> build

# Preview production build
pnpm --filter <game-name> preview
```

## Editor Usage

The Editor provides a visual interface for developing and testing games.

### Starting the Editor

```bash
# Development mode
pnpm dev

# Production mode (after building)
pnpm build
pnpm start
```

### Editor Features

- **File Menu**: Access common functions like opening projects
- **Project Loading**: Select and load games from the `games/` directory
- **Development Environment**: Test and preview your games in a controlled environment

### Opening a Game Project

1. Launch the Editor
2. Click on "File" -> "Open Project..."
3. Navigate to and select your game folder within the `games/` directory
4. The Editor will load and run your game

## Game Structure and Development

### Game Project Structure

Each game project follows this basic structure:

- `app.ts`: The main game application code that exports an `init` function
- `index.html`: The HTML entry point that loads the game
- `index.ts`: The TypeScript entry point that imports from app.ts
- `package.json`: Dependencies and scripts for the game
- `vite.config.ts`: Build configuration for the game

### Key Concepts

Prometheus Engine is built around several core concepts:

- **Scene System**: Manages different states of your game (see [Scenes, Assets, and Responsive Layouts](/docs/prometheus-engine-workflows.md))
- **Entity-Component System**: Provides a modular way to build game objects (see [Entity Component System](/docs/prometheus-engine-entity-component-system.md))
- **Asset Management**: Handles efficient loading and management of game resources
- **Responsive Layouts**: Adapts to different device types and screen orientations

For detailed guides on these concepts, check out the following documentation:

- [Scenes, Assets, and Responsive Layouts](/docs/prometheus-engine-workflows.md)
- [Entity Component System](/docs/prometheus-engine-entity-component-system.md)
- [Responsive Layout Examples](/docs/prometheus-engine-responsive-examples.md)

### Creating a Basic Game

Here's an example of a minimal game implementation in `app.ts`:

```typescript
import { Application, Assets, Sprite } from 'pixi.js';

export async function init(container: HTMLElement) {
  // Create a PixiJS application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the canvas to the container
  container.appendChild(app.canvas);

  // Add your game objects and logic here
  // For example:
  const texture = await Assets.load('https://pixijs.com/assets/bunny.png');
  const sprite = new Sprite(texture);
  app.stage.addChild(sprite);

  // Game loop
  app.ticker.add((time) => {
    // Update logic here
    sprite.rotation += 0.1 * time.deltaTime;
  });
}
```

## Development Workflow

1. Create a new game using the CLI
2. Develop your game logic in `app.ts`
3. Test your game using either:
   - Direct development server: `pnpm --filter <game-name> dev`
   - The Editor: `pnpm dev` and then open your game
4. Build for production when ready: `pnpm --filter <game-name> build`

## Git Hooks

The project uses Husky for Git hooks to ensure code quality:

- **pre-commit**: Runs ESLint and tests before allowing commits

## Testing

Tests are run using Jest. To run tests:

```bash
pnpm test
```

## Tools and Technologies

- **TypeScript**: Primary programming language
- **PixiJS**: 2D rendering engine
- **Vite**: Build tool and development server
- **Electron**: Desktop application framework for the Editor
- **ESLint**: Code quality and style checking
- **Jest**: Testing framework
- **PNPM**: Package manager with workspace support

## Best Practices

1. **Module Structure**: Each game should export an `init` function in `app.ts`
2. **Asset Management**: Use the Engine's asset management system for loading resources
3. **Responsive Design**: Design your UI to work across different device types and orientations
4. **Entity-Component Pattern**: Build game objects using composable components
5. **TypeScript**: Leverage TypeScript's type system for better code quality
6. **Testing**: Write tests for core functionality
7. **Code Quality**: Follow the ESLint rules defined in the project

See the detailed workflow guides for more specific best practices:

- [Scenes, Assets, and Responsive Layouts](/docs/prometheus-engine-workflows.md)
- [Entity Component System](/docs/prometheus-engine-entity-component-system.md)
- [Responsive Layout Examples](/docs/prometheus-engine-responsive-examples.md)

## Troubleshooting

### Common Issues

- **Missing dependencies**: Run `pnpm install` in the root directory
- **Build errors**: Check the console for specific error messages
- **Editor not loading games**: Ensure the game structure follows the expected format with `app.ts` exporting an `init` function

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC License
