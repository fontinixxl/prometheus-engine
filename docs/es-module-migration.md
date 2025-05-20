# ES Module Migration Guide

This document explains the migration of the Prometheus Engine to ES Modules and how to handle path resolution in different contexts.

## Why ES Modules?

ES Modules (ESM) is the official standard format to package JavaScript code for reuse. Benefits include:

- Better static analysis
- Tree shaking
- Top-level await
- Better compatibility with modern tooling
- Standardized import/export syntax

## Key Changes

1. **Package Configuration**:

   - `"type": "module"` in package.json
   - Module imports with `.js` extensions

2. **Path Resolution**:

   - ES modules don't have `__dirname` or `__filename` by default
   - Using `import.meta.url` with `fileURLToPath` to get file paths

3. **TypeScript Config**:
   - Using `"module": "NodeNext"` with `"moduleResolution": "NodeNext"`
   - Explicit file extensions in imports (`.js`)

## Common Issues and Solutions

### Path Resolution in ES Modules

In ES modules, `__dirname` and `__filename` aren't available, so we use:

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get proper __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### Import Paths with Extensions

When using TypeScript with ES modules, imports need extensions:

```typescript
// Correct - includes .js extension
import { MainScene } from './MainScene.js';

// Incorrect - will fail at runtime
import { MainScene } from './MainScene';
```

### Working with Both CommonJS and ES Modules

For libraries that need to be consumed by both module systems:

```javascript
// Conditional export
export default imports;
module.exports = imports;
```

## CLI Tools and ES Modules

For CLI scripts:

1. Add the shebang line: `#!/usr/bin/env node`
2. Use proper path resolution with `fileURLToPath`
3. Make sure to include `.js` extensions in local imports
4. Update the TypeScript configuration to use `NodeNext`

## Testing ES Module Compatibility

To verify your module works correctly:

```bash
# Check for ES Module issues
node --trace-warnings your-script.js

# Run TypeScript compiler without emitting output
npx tsc --noEmit
```

## Additional Resources

- [Node.js ES Modules documentation](https://nodejs.org/api/esm.html)
- [TypeScript ESM Support](https://www.typescriptlang.org/docs/handbook/esm-node.html)
