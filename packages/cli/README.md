# Prometheus Engine CLI

The CLI package provides tools and utilities for working with the Prometheus Engine ecosystem.

## Available Commands

### init-game

Creates a new game using the Prometheus Engine with proper project structure and import setup.

```bash
pnpm --filter cli run exec <game-name>
```

This will create a new game in the `/games/<game-name>` directory with the following features:

- Proper project structure with TypeScript support
- Vite configuration for fast development
- Standard import paths using `@prometheus/engine-core`
- Basic scene with a sprite

### setup-imports

Updates an existing game to use the standardized import system:

```bash
pnpm --filter cli run setup-imports <game-directory>
```

The setup-imports tool:

1. Updates or creates a `vite.config.ts` with proper path mappings
2. Updates or creates a `tsconfig.json` with proper path mappings
3. Updates import statements in TypeScript files to use the standardized format

This command will:

1. Update the vite.config.ts to use `prometheusImports`
2. Create or update tsconfig.json with the proper path mappings
3. Replace relative import statements in all TypeScript files with `@prometheus/engine-core` imports

## Benefits of using the CLI

- **Consistency** - All games use the same project structure and import patterns
- **Efficiency** - Quickly set up new game projects or update existing ones
- **Best Practices** - Automatically follows the recommended patterns for Prometheus Engine development

## Examples

### Creating a new game

```bash
pnpm --filter cli run exec my-awesome-game
cd games/my-awesome-game
pnpm dev
```

### Updating an existing game to use proper imports

```bash
pnpm --filter cli run setup-imports my-existing-game
```

## Troubleshooting

If you encounter issues with the import system:

### Paths are incorrect in setup-imports

If the CLI is not correctly resolving paths between your game and the engine:

```bash
# Run with an absolute path to the game directory
pnpm --filter cli run setup-imports /absolute/path/to/your/game
```

### Game won't build after setting up imports

1. Check that your `tsconfig.json` has the correct path mapping
2. Verify that your `vite.config.ts` includes the imports from the correct location
3. Run the setup-imports command again with the `--force` option (coming soon)

For more detailed information about the import system, see `/docs/using-prometheus-imports.md`.
