/**
 * A utility module for dynamically loading game modules in the editor
 */

// Type definitions
export type GameModule = {
  init(container: HTMLElement): Promise<void> | void;
  pause?: () => void;
  resume?: () => void;
  step?: () => void;
};

export interface GameInfo {
  name: string;
  path: string;
  module: () => Promise<GameModule>;
}

/**
 * Load all available games using import.meta.glob
 * This approach allows us to handle different path formats and provide better error handling
 */
export function loadGames(): Record<string, GameInfo> {
  console.log('Loading available games...');

  // Try multiple path patterns to maximize the chance of finding games
  // Vite's import.meta.glob is resolved at build time, so we need to be comprehensive
  const imports = {
    // Try the @games alias from vite.config.ts
    ...import.meta.glob('@games/*/app.ts', { eager: false }),
    // Try relative paths (needed when running in production)
    ...import.meta.glob('../../../games/*/app.ts', { eager: false }),
    // Try one more level up (needed when running from a different context)
    ...import.meta.glob('../../../../games/*/app.ts', { eager: false }),
    // Try additional patterns for different project structures
    ...import.meta.glob('@games/*/src/app.ts', { eager: false }),
    ...import.meta.glob('@games/*/index.ts', { eager: false }),
  };

  console.log('Found game import paths:', Object.keys(imports));

  if (Object.keys(imports).length === 0) {
    console.warn(
      'No game imports found! Check the import.meta.glob patterns or the games folder location.',
    );
  }

  // Process imports into a more usable format
  const games: Record<string, GameInfo> = {};

  Object.entries(imports).forEach(([path, moduleLoader]) => {
    // Extract game name from path (should be the folder name)
    const segments = path.split('/');
    const nameIndex = segments.findIndex((segment) => segment === 'games') + 1;

    if (nameIndex > 0 && nameIndex < segments.length) {
      const name = segments[nameIndex];

      games[name] = {
        name,
        path,
        module: moduleLoader as () => Promise<GameModule>,
      };

      console.log(`Registered game: ${name} from path: ${path}`);
    } else {
      console.warn(`Could not extract game name from path: ${path}`);
    }
  });

  // Log success or failure
  if (Object.keys(games).length > 0) {
    console.log('Processed games:', Object.keys(games));
  } else {
    console.warn('No games were processed! Check the games folder structure.');
  }

  return games;
}

/**
 * Get a specific game by name
 */
export function getGame(gameName: string): GameInfo | null {
  const games = loadGames();
  return games[gameName] || null;
}
