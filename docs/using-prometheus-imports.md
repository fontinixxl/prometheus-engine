# Using Prometheus Engine Import System

This guide explains how to use and integrate the standardized import system for Prometheus Engine in your games and applications.

## Why Use the New Import System?

- **Clean Code**: No more complex relative paths like `../../../packages/engine-core/dist/index.js`
- **Consistency**: All imports use the same `@prometheus/engine-core` syntax
- **Maintainability**: Your imports won't break if the internal file structure changes
- **IDE Support**: Better autocompletion and type checking

## For New Projects

If you're creating a new game using the Prometheus Engine CLI, the import system is already set up for you. You can simply:

```bash
# From the prometheus-engine root
pnpm --filter cli run exec my-new-game
```

This creates a new game with the proper import configuration already in place.

## For Existing Projects

If you have an existing game that uses relative imports, you can use the setup-imports tool to convert it:

```bash
# From the prometheus-engine root
pnpm --filter cli run setup-imports my-game
```

This tool:

1. Updates or creates a `tsconfig.json` with proper path mappings
2. Updates your `vite.config.ts` to use `prometheusImports`
3. Converts all relative imports in your TypeScript files to use the new syntax

## How to Import Engine Components

After setting up the import system, you can import any component from the engine using:

```typescript
// Before
import { Engine, Scene } from '../../../packages/engine-core/dist/index.js';

// After
import { Engine, Scene } from '@prometheus/engine-core';
```

### Example Imports

Here are some examples of using the new import syntax:

```typescript
// Import core classes
import { Engine, Scene, Entity, Component } from '@prometheus/engine-core';

// Import specific managers
import { AssetManager, SceneManager } from '@prometheus/engine-core';

// Import rendering types
import { Sprite, Graphics, Text } from '@prometheus/engine-core';
```

## How It Works

The import system uses:

1. **Path Aliases**: TypeScript path mappings in `tsconfig.json`
2. **Bundler Configuration**: Vite aliases in `vite.config.ts`
3. **Shared Configuration**: A central `imports.js` file in the engine-core package

## Troubleshooting

If you encounter issues with imports:

1. Ensure your `tsconfig.json` has the correct path mapping
2. Check that your `vite.config.ts` includes `prometheusImports`
3. Verify that the relative paths in your config files match your project structure

If imports still don't work, you can run the setup-imports tool again to fix any issues:

```bash
pnpm --filter cli run setup-imports my-game
```
