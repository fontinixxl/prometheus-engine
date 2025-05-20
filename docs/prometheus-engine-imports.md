# Prometheus Engine Import System

This document explains how the Prometheus Engine's import system works and provides guidelines for maintaining consistent imports across all projects in the ecosystem.

## Overview

The Prometheus Engine provides a standardized way to import packages using path aliases like `@prometheus/engine-core` instead of complex relative paths. This system:

1. Makes imports more readable and consistent
2. Shields developers from internal file structure changes
3. Works with both TypeScript and bundlers like Vite

## How It Works

The system uses two key components:

1. **imports.js** - A shared module that defines the mappings between package names and file paths
2. **Path aliases** - TypeScript and bundler configuration to recognize the import paths

## For Game Developers

When creating a game using the Prometheus Engine, follow these steps:

1. Update your `vite.config.ts` to include the aliases:

```typescript
import prometheusImports from '../../packages/engine-core/imports.js';

export default defineConfig({
  // ... other config
  resolve: {
    alias: {
      ...prometheusImports,
    },
  },
});
```

2. Create or update your `tsconfig.json` to include the path mappings:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@prometheus/engine-core": ["../../packages/engine-core/dist/"]
    }
  }
}
```

3. In your code, use the standardized import paths:

```typescript
// Import from the engine core
import { Entity, Component, Scene } from '@prometheus/engine-core';

// Import from other Prometheus packages
import { SomeUtility } from '@prometheus/cli';
```

## For Engine Maintainers

When creating new packages or updating existing ones:

1. Add the package to `imports.js`:

```javascript
const imports = {
  '@prometheus/engine-core': path.resolve(projectRoot, 'packages/engine-core/dist/'),
  '@prometheus/your-new-package': path.resolve(projectRoot, 'packages/your-new-package/dist/'),
};
```

2. Document the new import path in the package's README.md

## Benefits

- **Uniformity**: All projects use the same import style
- **Isolation**: Changes to internal file structure don't break imports
- **IDE Support**: Better autocomplete and type checking
- **Clarity**: Code is more readable and maintainable

## Usage in Production

For production applications that use the Prometheus Engine as a dependency:

1. Install the packages: `npm install @prometheus/engine-core`
2. Configure your build system to recognize the import aliases
3. Import using the standardized paths: `import { ... } from '@prometheus/engine-core'`
