# Prometheus Engine Documentation

## Project Overview

Prometheus Engine is a game development framework built on top of PixiJS, designed to help create 2D games with modern web technologies. The project is structured as a monorepo using PNPM workspaces, containing multiple packages that work together to provide a complete game development environment.

## Project Structure

```
prometheus-engine/
├── .husky/                  # Git hooks configuration
├── docs/                    # Documentation files (like this one)
├── games/                   # Game projects created with the engine
│   ├── bouncing-bunnies/    # Example: Physics-based bunny game
│   ├── game-test/           # Example: General test game
│   ├── prometheus-demo/     # Example: Showcasing engine features like Spine
│   └── test-game-fixed/     # Example: Another test game
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

The CLI package provides command-line tools for managing game projects, primarily focused on scaffolding new games and setting up import aliases. (See `packages/cli/src/init-game.ts` and `packages/cli/src/setup-imports.ts`).

#### Editor (`packages/editor`)

The Editor is an Electron-based application that provides a visual environment for developing and testing games created with the engine. It includes features like a scene hierarchy viewer, properties inspector, and a game preview panel.

#### Engine Core (`packages/engine-core`)

The core engine package that provides the fundamental game development functionality, including rendering, scene management, and asset loading. This is used by games as a dependency.

### Games

Games are standalone projects that use the `engine-core` package. They are located in the `games/` directory. Each game typically has an `app.ts` file that exports an `init` function and other methods conforming to the `GameModule` interface used by the editor.

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- PNPM package manager (check project's `package.json` for `packageManager` field, e.g., pnpm@8.x.x or newer)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url> # Replace with your repository URL
cd prometheus-engine
pnpm install
```

## CLI Usage

### Creating a New Game

To scaffold a new game project (ensure the CLI command is up-to-date with `packages/cli/package.json` scripts or direct execution via `pnpm --filter=cli exec <command>`):

```bash
# Example: pnpm --filter=@prometheus/cli exec init-game <game-name>
# Or if there's a root script:
pnpm init-game <game-name>
```

_(Verify the exact command to run `init-game` from `packages/cli`)_

This will create a new directory in the `games/` folder with a structure similar to:

```
games/<game-name>/
├── app.ts           # Main game application code (exports init, getEntities, etc.)
├── index.html       # HTML entry point for web serving
├── index.ts         # TypeScript entry point (often imports and runs app.ts)
├── package.json     # Game-specific package configuration
├── tsconfig.json    # TypeScript configuration for the game
└── vite.config.ts   # Vite configuration for the game
```

### Game Development Commands

Within your game directory, you can use these commands (or run them from the root using `--filter`):

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

From the root of the `prometheus-engine` directory:

```bash
# Run the editor in development mode (with hot reloading for the editor itself)
pnpm --filter @prometheus/editor dev

# To build the editor for production:
pnpm --filter @prometheus/editor build

# To start the production build of the editor:
pnpm --filter @prometheus/editor start
```

_(Note: The `pnpm dev` and `pnpm start` at the root might be configured to run the editor as well, check your root `package.json`)_

### Editor Features

- **File Menu**: Standard file operations.
- **Game Loading**: Select and load games from the `games/` directory. The editor lists available games based on their presence and structure.
- **Scene View Panel**: Renders the selected game for live preview and interaction.
- **Hierarchy Panel**: Displays the scene graph of the loaded game (scenes, entities, components).
- **Properties Panel**: Shows and allows editing of properties for the selected item in the Hierarchy Panel.
- **Development Environment**: Test and preview your games in a controlled environment.

### Opening a Game Project

1.  Launch the Editor using one of the commands above.
2.  The editor should automatically list available games from the `/games` directory.
3.  Select a game from the list (e.g., in a dropdown or sidebar).
4.  The Editor will load the game's metadata into the Hierarchy and Properties panels, and render the game in the Scene View panel.

## Game Structure and Development

### Game Project Structure

Each game project in the `games/` directory should generally follow this structure:

- `app.ts`: This is the core of your game logic. It must export functions that conform to the `GameModule` interface expected by the editor (typically `init(container: HTMLElement): Promise<void>`, `getEntities(): GameEntity[]`, `getSceneInfo(): SceneInfo`, and optionally `pause()`, `resume()`, `step()`).
- `index.html`: The HTML entry point, usually minimal, just loading the main script.
- `index.ts`: The TypeScript entry point that typically imports `init` from `app.ts` and calls it, often for running the game standalone in a browser.
- `package.json`: Dependencies (e.g., `@prometheus/engine-core`) and scripts for the game.
- `vite.config.ts`: Vite build and development server configuration for the game.
- `tsconfig.json`: TypeScript configuration.

### Key Concepts

Prometheus Engine is built around several core concepts:

- **Scene System**: Manages different states or levels of your game. (See [Scenes, Assets, and Responsive Layouts](./prometheus-engine-workflows.md))
- **Entity-Component System (ECS)**: A pattern for building flexible and reusable game objects. (See [Entity Component System](./prometheus-engine-entity-component-system.md))
- **Asset Management**: The engine core provides utilities for loading and managing game assets (images, sounds, data).
- **Responsive Layouts**: Tools and practices for making games adapt to various screen sizes. (See [Responsive Layout Examples](./prometheus-engine-responsive-examples.md))
- **GameModule Interface**: A contract between games and the editor, defined in `packages/editor/src/renderer/utils/games.ts`, ensuring the editor can correctly load, display metadata for, and render games.

For detailed guides on these concepts, check out the linked documentation.

### Creating a Basic Game (`app.ts`)

Here's a conceptual example of what an `app.ts` might look like for the editor and standalone play:

```typescript
// In games/your-game/app.ts
import { Engine } from '@prometheus/engine-core'; // Assuming Engine is your main class
import { GameEntity, SceneInfo } from '@editor/renderer/types'; // Path to editor types, adjust as needed

let engineInstance: Engine | null = null;

// Function to initialize and run the game (for standalone or editor preview)
export async function init(container: HTMLElement): Promise<void> {
  engineInstance = new Engine({
    // engine options...
    // designWidth: 1920,
    // designHeight: 1080,
  });
  await engineInstance.init(container); // Engine's init now takes the container

  // Load assets, create scenes, add entities, etc.
  // engineInstance.sceneManager.addScene(new MyMainScene(engineInstance));
  // engineInstance.switchScene('my-main-scene');

  console.log('Game initialized in container:', container);
}

// Function for the editor to get entities
export function getEntities(): GameEntity[] {
  if (!engineInstance || !engineInstance.sceneManager.activeScene) {
    return [];
  }
  // Adapt your engine's entity structure to the GameEntity interface
  // This is a placeholder example:
  return engineInstance.sceneManager.activeScene.entities.map((e) => ({
    id: e.id,
    name: e.name,
    type: 'entity',
    components: e.components.map((c) => ({
      id: c.id,
      name: c.type,
      type: c.type,
      properties: { ...c },
    })),
    // ... other properties like position, rotation, scale
  })) as GameEntity[];
}

// Function for the editor to get scene info
export function getSceneInfo(): SceneInfo {
  if (!engineInstance || !engineInstance.sceneManager.activeScene) {
    return { id: 'unknown-scene', name: 'Unknown Scene', type: 'scene' };
  }
  const activeScene = engineInstance.sceneManager.activeScene;
  // Adapt your engine's scene structure to the SceneInfo interface
  return {
    id: activeScene.id, // or a unique identifier
    name: activeScene.name, // or a display name
    type: 'scene',
    backgroundColor: engineInstance.backgroundColor.toHex(), // Example
  };
}

// Optional: for editor controls
export function pause(): void {
  engineInstance?.pause(); // Assuming your engine has pause
}

export function resume(): void {
  engineInstance?.resume(); // Assuming your engine has resume
}

export function step(): void {
  engineInstance?.step(); // Assuming your engine has step
}
```

## Development Workflow

1.  Create a new game using the CLI (or copy an existing example).
2.  Develop your game logic in `app.ts`, ensuring it exports the necessary functions for the `GameModule` interface if you intend to use it with the editor.
3.  Test your game:
    - Standalone via its Vite dev server: `pnpm --filter <game-name> dev`
    - Within the Prometheus Editor: Run `pnpm --filter @prometheus/editor dev`, then select your game.
4.  Build your game for production when ready: `pnpm --filter <game-name> build`.

## Git Hooks

The project uses Husky for Git hooks (e.g., `pre-commit`) to enforce code quality standards like linting.

## Testing

Tests are typically run using Jest or Vitest. To run tests for a specific package or across the workspace:

```bash
# Run tests for a specific package
pnpm --filter <package-name> test

# Run all tests (if a root test script is configured)
pnpm test
```

_(Check `package.json` scripts for specific test commands)_

## Tools and Technologies

- **TypeScript**: Primary programming language.
- **PixiJS**: Underlying 2D rendering library for `engine-core`.
- **Vite**: Build tool and development server for games and the editor's renderer process.
- **Electron**: Framework for the desktop editor application.
- **React**: UI library for the editor's renderer process.
- **Tailwind CSS**: CSS framework used in the editor.
- **ESLint**: Code linting.
- **PNPM**: Package manager with workspace support.

## Best Practices

1.  **`GameModule` Interface**: Adhere to the `GameModule` interface (defined in `packages/editor/src/renderer/utils/games.ts`) in your game's `app.ts` for compatibility with the editor. This includes `init`, `getEntities`, and `getSceneInfo`.
2.  **Clear Separation**: Keep game logic (`games/*`) separate from engine core logic (`packages/engine-core`) and editor logic (`packages/editor`).
3.  **Asset Management**: Utilize `engine-core`'s asset management capabilities.
4.  **Responsive Design**: Consider various screen sizes when designing game UI and layouts.
5.  **ECS Pattern**: Leverage the Entity-Component-System pattern for game object architecture.
6.  **TypeScript**: Use TypeScript's features for robust, maintainable code.
7.  **Testing**: Write unit and integration tests for critical parts of the engine and games.
8.  **Code Quality**: Follow ESLint rules and maintain clean code.

See the detailed workflow guides for more specific best practices.

## Troubleshooting

### Common Issues

- **Missing Dependencies**: Run `pnpm install` in the root directory. If issues persist, try `pnpm install --force` or remove `node_modules` and `pnpm-lock.yaml` and reinstall.
- **Build Errors**: Carefully read the error messages in the console. They often point to TypeScript errors, import issues, or configuration problems.
- **Editor Not Loading Games / "No games available"**:
  - Ensure your game is in the `games/` directory.
  - Verify that your game's `app.ts` correctly exports `init`, `getEntities`, and `getSceneInfo` functions as per the `GameModule` interface.
  - Check that `import.meta.glob` in `packages/editor/src/renderer/utils/games.ts` correctly patterns to find your game's `app.ts` files (e.g., `@games/*/app.ts`).
  - Ensure Vite aliases (`@games`, `@`, etc.) are correctly configured in `packages/editor/vite.config.ts` and that `fs.allow` includes the `games` directory.
- **"Cannot find module" errors**:
  - Check `tsconfig.json` paths and `baseUrl`.
  - Ensure PNPM workspaces are linking packages correctly.
  - Verify Vite aliases and `resolve.alias` configuration.
- **Type Errors related to `GameModule` or `GameEntity`**:
  - Ensure your game's implementation of `getEntities` and `getSceneInfo` returns data matching the interfaces defined in `packages/editor/src/renderer/utils/games.ts` (or a shared types location).

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Ensure your code lints (`pnpm lint`) and tests pass (`pnpm test`).
5.  Commit your changes (`git commit -am 'Add some feature'`).
6.  Push to the branch (`git push origin feature/your-feature-name`).
7.  Create a new Pull Request.

## License

ISC License
