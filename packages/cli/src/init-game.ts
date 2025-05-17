#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

function main(): void {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: pnpm --filter cli run exec <gameName>');
    process.exit(1);
  }

  const gameName = args[0];
  // Go three levels up from /packages/cli/src to /prometheus-engine:
  const projectRoot = path.join(__dirname, '..', '..', '..');
  const gamesDir = path.join(projectRoot, 'games');
  const gameDir = path.join(gamesDir, gameName);

  // 1) Ensure /games/<gameName>/ folder exists at the monorepo root
  if (!fs.existsSync(gameDir)) {
    fs.mkdirSync(gameDir, { recursive: true });
    console.log(`Created folder: ${gameDir}`);
  } else {
    console.log(`Updating existing folder: ${gameDir}`);
  }

  // 2) Create or update package.json
  const pkgJsonPath = path.join(gameDir, 'package.json');
  const packageJson = {
    name: gameName,
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      'engine-core': 'workspace:*',
    },
  };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Created/updated: ${pkgJsonPath}`);

  // 3) Create or update index.html (now references index.ts)
  const indexHtmlPath = path.join(gameDir, 'index.html');
  const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${gameName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./index.ts"></script>
  </body>
</html>
`;
  if (!fs.existsSync(indexHtmlPath)) {
    fs.writeFileSync(indexHtmlPath, indexHtmlContent);
    console.log(`Created: ${indexHtmlPath}`);
  } else {
    console.log('index.html already exists, skipping overwrite.');
  }

  // 4) Create or update index.ts (the new game entry point)
  const indexTsPath = path.join(gameDir, 'index.ts');
  const indexTsContent = `import { init } from './app';

const container = document.getElementById('app');
if (container) {
  init(container);
} else {
  console.warn('No #app element found!');
}
`;
  if (!fs.existsSync(indexTsPath)) {
    fs.writeFileSync(indexTsPath, indexTsContent);
    console.log(`Created: ${indexTsPath}`);
  } else {
    console.log('index.ts already exists, skipping overwrite.');
  }

  // 5) Create or update vite.config.ts
  const viteConfigPath = path.join(gameDir, 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    const viteConfigContent = `import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: __dirname,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Entry point for bundling
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});
`;
    fs.writeFileSync(viteConfigPath, viteConfigContent);
    console.log(`Created: ${viteConfigPath}`);
  } else {
    console.log('vite.config.ts already exists, skipping overwrite.');
  }

  console.log(`\nDone! Your '${gameName}' game is ready at: ${gameDir}`);
  console.log('You can now run:');
  console.log(`  pnpm --filter ${gameName} dev`);
  console.log(`  pnpm --filter ${gameName} build`);
}

main();
