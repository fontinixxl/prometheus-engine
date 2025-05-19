#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * This script adds the proper import configuration to an existing Prometheus Engine game
 * It updates:
 * - vite.config.ts to use prometheusImports
 * - creates a proper tsconfig.json with path mappings
 * - updates import statements in all .ts files to use @prometheus/engine-core
 */

// Get proper __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main(): void {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: pnpm --filter cli run setup-imports <gameDir>');
    process.exit(1);
  }

  const gameDirArg = args[0];

  // In ES modules, we're using the fileURLToPath approach to get __dirname
  // __dirname will be /packages/cli/dist, need to go up to project root
  const projectRoot = path.resolve(path.join(__dirname, '..', '..', '..'));
  const gamesDir = path.join(projectRoot, 'games');

  console.log(`Project root: ${projectRoot}`);
  console.log(`Games directory: ${gamesDir}`);

  // If the gameDirArg is a relative path, resolve it relative to the games directory
  // Otherwise, use the argument as is (assume it's an absolute path)
  const gameDir = path.isAbsolute(gameDirArg) ? gameDirArg : path.join(gamesDir, gameDirArg);

  if (!fs.existsSync(gameDir)) {
    console.error(`Error: Directory ${gameDir} does not exist`);
    process.exit(1);
  }

  console.log(`Setting up proper imports for game at ${gameDir}`);

  // Update vite.config.ts
  updateViteConfig(gameDir, projectRoot);

  // Create or update tsconfig.json
  createTsConfig(gameDir, projectRoot);

  // Update import statements in all TypeScript files
  updateImportStatements(gameDir);

  console.log('\nDone! Your game now uses the Prometheus Engine import system.');
  console.log('You can now import from @prometheus/engine-core instead of using relative paths.');
}

function updateViteConfig(gameDir: string, projectRoot: string): void {
  const viteConfigPath = path.join(gameDir, 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    console.log(`Warning: vite.config.ts not found at ${viteConfigPath}`);
    return;
  }

  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');

  // Check if prometheusImports is already imported
  if (viteConfig.includes('prometheusImports')) {
    console.log('vite.config.ts already uses prometheusImports, skipping update');
    return;
  }

  // Calculate the relative path from the game directory to the engine-core imports.js file
  const relativePathToImports = path
    .relative(gameDir, path.join(projectRoot, 'packages/engine-core'))
    .replace(/\\/g, '/');
  const importsPath = `${relativePathToImports}/imports.js`;

  console.log(`Relative path to imports.js: ${importsPath}`);

  // Add import statement for prometheusImports with the correct relative path
  viteConfig = viteConfig.replace(
    /import\s+{\s*defineConfig\s*}\s+from\s+['"]vite['"];/,
    `import { defineConfig } from 'vite';\nimport prometheusImports from '${importsPath}';`,
  );

  // Add alias configuration
  if (viteConfig.includes('resolve: {')) {
    // If resolve block already exists, add prometheusImports to it
    if (!viteConfig.includes('alias: {')) {
      viteConfig = viteConfig.replace(
        /resolve:\s*{/,
        `resolve: {\n    alias: {\n      // Set up aliases for Prometheus Engine packages\n      ...prometheusImports\n    },`,
      );
    } else {
      // If alias block already exists, add prometheusImports to it
      viteConfig = viteConfig.replace(
        /alias:\s*{/,
        `alias: {\n      // Set up aliases for Prometheus Engine packages\n      ...prometheusImports,`,
      );
    }
  } else {
    // If no resolve block exists, add a new one before the closing bracket
    viteConfig = viteConfig.replace(
      /};\s*$/,
      `,\n  resolve: {\n    alias: {\n      // Set up aliases for Prometheus Engine packages\n      ...prometheusImports\n    }\n  }\n};`,
    );
  }

  fs.writeFileSync(viteConfigPath, viteConfig);
  console.log(`Updated ${viteConfigPath} to use prometheusImports`);
}

function createTsConfig(gameDir: string, projectRoot: string): void {
  const tsConfigPath = path.join(gameDir, 'tsconfig.json');

  // Calculate the relative path from the game directory to the engine-core dist folder
  const relativePathToEngineCore = path
    .relative(gameDir, path.join(projectRoot, 'packages/engine-core/dist'))
    .replace(/\\/g, '/');

  const tsConfigContent = {
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@prometheus/engine-core': [relativePathToEngineCore],
        '../../packages/engine-core/imports.js': ['../../packages/engine-core/imports.d.ts'],
      },
      allowSyntheticDefaultImports: true,
      resolveJsonModule: true,
    },
    include: ['./**/*.ts', './**/*.tsx'],
    exclude: ['node_modules', 'dist'],
  };

  if (!fs.existsSync(tsConfigPath)) {
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfigContent, null, 2));
    console.log(`Created ${tsConfigPath}`);
  } else {
    // If tsconfig.json already exists, update it to include our path mappings
    let tsConfig;
    try {
      tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    } catch (error) {
      console.error(`Error parsing ${tsConfigPath}: ${error}`);
      return;
    }

    // Add or update compilerOptions.paths
    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }

    if (!tsConfig.compilerOptions.paths) {
      tsConfig.compilerOptions.paths = {};
    }

    tsConfig.compilerOptions.baseUrl = '.';
    tsConfig.compilerOptions.paths['@prometheus/engine-core'] = [relativePathToEngineCore];
    tsConfig.compilerOptions.paths['../../packages/engine-core/imports.js'] = [
      '../../packages/engine-core/imports.d.ts',
    ];

    // Add additional compiler options
    tsConfig.compilerOptions.allowSyntheticDefaultImports = true;
    tsConfig.compilerOptions.resolveJsonModule = true;

    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log(`Updated ${tsConfigPath} with correct path: ${relativePathToEngineCore}`);
  }
}

function updateImportStatements(gameDir: string): void {
  // List all TypeScript files in the directory
  const tsFiles = findTsFiles(gameDir);
  console.log(`Found ${tsFiles.length} TypeScript files`);

  let updatedCount = 0;

  // Update import statements in each file
  for (const filePath of tsFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Replace relative path imports of engine-core with @prometheus/engine-core
    content = content.replace(
      /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/packages\/engine-core\/dist\/index\.js['"];/g,
      "import {$1} from '@prometheus/engine-core';",
    );

    // Replace other variations
    content = content.replace(
      /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/packages\/engine-core\/dist\/index\.js['"];/g,
      "import {$1} from '@prometheus/engine-core';",
    );

    // Update any other variations you might have in your codebase
    content = content.replace(
      /import\s+{([^}]+)}\s+from\s+['"]engine-core['"];/g,
      "import {$1} from '@prometheus/engine-core';",
    );

    // Match import statements with different levels of parent directories (more flexible pattern)
    content = content.replace(
      /import\s+{([^}]+)}\s+from\s+['"](?:\.\.\/)+packages\/engine-core\/dist(?:\/index\.js)?['"];/g,
      "import {$1} from '@prometheus/engine-core';",
    );

    // If content was updated, save the file
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      updatedCount++;
      console.log(`Updated imports in ${path.relative(gameDir, filePath)}`);
    }
  }

  console.log(`Updated import statements in ${updatedCount} files`);
}

function findTsFiles(dir: string): string[] {
  const results: string[] = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      // Recursively search directories
      results.push(...findTsFiles(filePath));
    } else if (
      stat.isFile() &&
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      !file.endsWith('.d.ts')
    ) {
      results.push(filePath);
    }
  }

  return results;
}

main();
