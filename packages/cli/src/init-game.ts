#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get proper __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function main(): void {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: pnpm --filter cli run exec <gameName>');
    process.exit(1);
  }

  const gameName = args[0];
  // In ES modules, we're using the fileURLToPath approach to get __dirname
  // __dirname will be /packages/cli/dist, need to go up to project root
  const projectRoot = path.resolve(path.join(__dirname, '..', '..', '..'));
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
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>${gameName}</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #000;
      }
      #app {
        width: 100vw;
        height: 100vh;
      }
    </style>
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
// Import the engine paths correctly from the project root
import prometheusImports from '../../packages/engine-core/imports.js';

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
  resolve: {
    alias: {
      // Set up aliases for Prometheus Engine packages
      ...prometheusImports
    }
  }
});
`;
    fs.writeFileSync(viteConfigPath, viteConfigContent);
    console.log(`Created: ${viteConfigPath}`);
  } else {
    console.log('vite.config.ts already exists, skipping overwrite.');
  }

  // 6) Create or update app.ts (the main game implementation)
  const appTsPath = path.join(gameDir, 'app.ts');
  if (!fs.existsSync(appTsPath)) {
    const appTsContent = `import { Engine } from '@prometheus/engine-core';
import { MainScene } from './MainScene.js';

/**
 * Main application entry point
 */
export async function init(container: HTMLElement): Promise<void> {
  // Create and initialize the engine
  const engine = new Engine({
    debug: true, // Enable debug overlay
    backgroundColor: '#1099bb',
  });

  // Initialize the engine
  await engine.init(container);

  // Preload assets if needed
  // await engine.loadAssets(['your-asset-url.png']);

  // Create the main scene
  const mainScene = new MainScene();

  // Add scene to scene manager and switch to it
  engine.sceneManager.addScene(mainScene);
  engine.switchScene('main-scene');

  // Handle window resize
  window.addEventListener('resize', () => {
    engine.resize();
  });

  console.log('${gameName} initialized');
}`;
    fs.writeFileSync(appTsPath, appTsContent);
    console.log(`Created: ${appTsPath}`);
  } else {
    console.log('app.ts already exists, skipping overwrite.');
  }

  // 7) Create a MainScene.ts file with more detailed scene implementation
  const mainSceneTsPath = path.join(gameDir, 'MainScene.ts');
  if (!fs.existsSync(mainSceneTsPath)) {
    const mainSceneContent = `import { Scene, Sprite, Text, TextStyle, Graphics, Assets } from '@prometheus/engine-core';

/**
 * Main game scene with more detailed implementation
 */
export class MainScene extends Scene {
  // Scene elements
  private title!: Text;
  private sprite!: Sprite;
  private background!: Graphics;

  constructor() {
    super('main-scene');
    this.setupScene();
  }

  /**
   * Set up the scene with UI elements
   */
  private setupScene(): void {
    // Create background
    this.background = new Graphics();
    this.background.beginFill(0x1099bb);
    this.background.drawRect(0, 0, window.innerWidth, window.innerHeight);
    this.background.endFill();
    this.container.addChild(this.background);

    // Create title text
    const style = new TextStyle({
      fontSize: 36,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    this.title = new Text('${gameName}', style);
    this.title.anchor.set(0.5, 0);
    this.title.position.set(window.innerWidth / 2, 40);
    this.container.addChild(this.title);

    // Create a placeholder sprite
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(window.innerWidth / 2, window.innerHeight / 2);
    this.container.addChild(this.sprite);

    // Position elements
    this.resize(window.innerWidth, window.innerHeight);
  }

  /**
   * Called when the scene is initialized
   */
  async init(): Promise<void> {
    console.log('Main scene initialized');
    
    try {
      // Load assets when the scene is initialized
      await Assets.load('https://pixijs.com/assets/bunny.png');
      this.sprite.texture = Assets.get('https://pixijs.com/assets/bunny.png');
    } catch (error) {
      console.error('Failed to load assets:', error);
    }
  }

  /**
   * Called every frame
   */
  update(deltaTime: number): void {
    // Add animation or game logic here
    if (this.sprite) {
      this.sprite.rotation += 0.01 * deltaTime;
    }
    
    // Call parent update
    super.update(deltaTime);
  }

  /**
   * Called when the viewport is resized
   */
  resize(width: number, height: number): void {
    super.resize(width, height);
    
    // Update background
    this.background.clear();
    this.background.beginFill(0x1099bb);
    this.background.drawRect(0, 0, width, height);
    this.background.endFill();
    
    // Reposition elements
    if (this.title) {
      this.title.position.set(width / 2, 40);
    }
    
    if (this.sprite) {
      this.sprite.position.set(width / 2, height / 2);
    }
  }
}`;
    fs.writeFileSync(mainSceneTsPath, mainSceneContent);
    console.log(`Created: ${mainSceneTsPath}`);
  } else {
    console.log('MainScene.ts already exists, skipping overwrite.');
  }

  // 8) Create or update tsconfig.json
  const tsConfigPath = path.join(gameDir, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) {
    const tsConfigContent = `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@prometheus/engine-core": ["../../packages/engine-core/dist/"],
      "../../packages/engine-core/imports.js": ["../../packages/engine-core/imports.d.ts"]
    },
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  },
  "include": ["./**/*.ts", "./**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}`;
    fs.writeFileSync(tsConfigPath, tsConfigContent);
    console.log(`Created: ${tsConfigPath}`);
  } else {
    console.log('tsconfig.json already exists, skipping overwrite.');
  }

  // 9) Create or update README.md
  const readmePath = path.join(gameDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# ${gameName}

A game built with the Prometheus Engine.

## Importing from Prometheus Engine

This project uses the standardized import paths for Prometheus Engine:

\`\`\`typescript
// Import engine classes using the standard import path
import { Engine, Scene, Sprite } from '@prometheus/engine-core';
\`\`\`

This avoids relative path imports and makes the code more maintainable. 
See the \`IMPORTING.md\` file in the engine-core package for more details.

## Development

To run the development server:

\`\`\`bash
pnpm --filter ${gameName} dev
\`\`\`

To build for production:

\`\`\`bash
pnpm --filter ${gameName} build
\`\`\`

To preview the production build:

\`\`\`bash
pnpm --filter ${gameName} preview
\`\`\`
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`Created: ${readmePath}`);
  } else {
    console.log('README.md already exists, skipping overwrite.');
  }

  console.log(`\nDone! Your '${gameName}' game is ready at: ${gameDir}`);
  console.log('You can now run:');
  console.log(`  pnpm --filter ${gameName} dev`);
  console.log(`  pnpm --filter ${gameName} build`);
}

main();
