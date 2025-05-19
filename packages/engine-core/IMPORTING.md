# Making Prometheus Engine Imports Developer-Friendly

To make it easier for developers to import from the Prometheus Engine, we've created a standardized import system that works with both TypeScript and bundlers like Vite. This eliminates the need to use complex relative paths like `../../../packages/engine-core/dist/index.js`.

## How to Set Up in Games and Projects

### For Vite-based Projects

1. Add the following to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import path from 'path';
import prometheusImports from '../../packages/engine-core/imports.js';

export default defineConfig({
  // other config...
  resolve: {
    alias: {
      ...prometheusImports,
    },
  },
});
```

2. Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@prometheus/engine-core": ["../../packages/engine-core/dist/"],
      "@prometheus/cli": ["../../packages/cli/dist/"],
      "@prometheus/editor": ["../../packages/editor/dist/"]
    }
  }
}
```

### For Non-Vite Projects

If you're not using Vite, you can still configure TypeScript path mappings:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@prometheus/engine-core": ["./node_modules/engine-core/dist/"],
      "@prometheus/cli": ["./node_modules/cli/dist/"],
      "@prometheus/editor": ["./node_modules/editor/dist/"]
    }
  }
}
```

## How to Use

After setting up, you can import from the engine like this:

```typescript
// Before - with relative paths
import { Entity, Component } from '../../../packages/engine-core/dist/index.js';
import { Scene, Engine } from '../../../packages/engine-core/dist/index.js';

// After - with path aliases
import { Entity, Component } from '@prometheus/engine-core';
import { Scene, Engine } from '@prometheus/engine-core';
```

### Advanced Usage Examples

**Creating a new Entity with Components:**

```typescript
import { Entity, EntityManager } from '@prometheus/engine-core';
import { PhysicsComponent } from './components/PhysicsComponent';

const entityManager = new EntityManager(container);
const entity = entityManager.createEntity('player');

// No complicated imports needed for the core classes
```

**Creating a new Scene:**

```typescript
import { Scene, Engine, Graphics, Text } from '@prometheus/engine-core';

export class MyCustomScene extends Scene {
  constructor(engine: Engine) {
    super('my-scene');
    // ...
  }
}
```

## Benefits

- **No Deep Import Paths**: Developers don't need to know the file structure
- **Consistent Import Style**: All projects use the same import syntax
- **Better Code Readability**: Clean imports make the code easier to understand
- **Future-Proof**: If the engine's file structure changes, the imports remain valid
- **IDE Support**: Better autocomplete and type checking with path aliases
- **Easier Onboarding**: New developers can quickly understand how to import engine features

## For Package Maintainers

When adding new packages to the Prometheus ecosystem, update the `imports.js` file to include the new package:

```javascript
// In imports.js
const imports = {
  '@prometheus/engine-core': path.resolve(projectRoot, 'packages/engine-core/dist/'),
  '@prometheus/your-new-package': path.resolve(projectRoot, 'packages/your-new-package/dist/'),
};
```
