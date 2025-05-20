# Prometheus Engine Import System Implementation

This document outlines the implementation of the standardized import system for the Prometheus Engine, which allows developers to use consistent import paths across their games and tools.

## Overview

The import system allows developers to:

1. Import from Prometheus Engine packages using standardized paths like `@prometheus/engine-core`
2. Eliminate complex relative paths like `../../../packages/engine-core/dist/index.js`
3. Maintain consistent imports across different games and projects
4. Support proper TypeScript path resolution and intellisense

## Key Components

### 1. `imports.js` Module

Located in `packages/engine-core/imports.js`, this module exports path mappings that can be used in Vite and TypeScript configurations:

```javascript
const imports = {
  '@prometheus/engine-core': path.resolve(projectRoot, 'packages/engine-core/dist/'),
  '@prometheus/cli': path.resolve(projectRoot, 'packages/cli/dist/'),
  '@prometheus/editor': path.resolve(projectRoot, 'packages/editor/dist/'),
};
```

### 2. TypeScript Type Definitions

The `imports.d.ts` file provides TypeScript type definitions for the imports module:

```typescript
interface ImportPathMappings {
  '@prometheus/engine-core': string;
  '@prometheus/cli': string;
  '@prometheus/editor': string;
  [key: string]: string;
}
```

### 3. CLI Tools

Two CLI tools were implemented to support the import system:

- **init-game.ts**: Creates new games with the import system already configured
- **setup-imports.ts**: Updates existing games to use the new import system

### 4. Game Configuration

Each game requires two configuration files to use the import system:

#### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import path from 'path';
import prometheusImports from '../../packages/engine-core/imports.js';

export default defineConfig({
  // ...
  resolve: {
    alias: {
      // Set up aliases for Prometheus Engine packages
      ...prometheusImports,
    },
  },
  // ...
});
```

#### `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@prometheus/engine-core": ["../../packages/engine-core/dist/"]
    }
  }
}
```

## Usage in Code

Once configured, developers can import engine components using the standardized paths:

```typescript
// Old way (complex relative paths)
import { Engine, Scene } from '../../../packages/engine-core/dist/index.js';

// New way (clean standardized imports)
import { Engine, Scene } from '@prometheus/engine-core';
```

## Editor Integration

The Editor package was updated to use the import system for loading games:

```typescript
import prometheusImports from '../engine-core/imports.js';

export default defineConfig({
  // ...
  resolve: {
    alias: {
      '@games': path.resolve(__dirname, '../../games'),
      ...prometheusImports,
    },
  },
  // ...
});
```

## Testing the Import System

To test if the import system is working correctly in your game:

1. Run the development server:

   ```bash
   pnpm --filter your-game-name dev
   ```

2. Check for any import errors in the console
3. Verify that intellisense works correctly in your IDE for imports from `@prometheus/engine-core`

## Future Improvements

1. Add support for more Prometheus Engine packages as they are developed
2. Consider publishing packages to npm for use outside the monorepo
3. Add support for custom game-specific imports
