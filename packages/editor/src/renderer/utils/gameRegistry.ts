/**
 * A simpler game registry with mock implementations
 * This avoids import resolution issues
 */

export interface GameModule {
  init(container: HTMLElement): void;
  pause?: () => void;
  resume?: () => void;
  step?: () => void;
}

// List of available games
const gameNames = ['bouncing-bunnies', 'prometheus-demo', 'game-test', 'test-game-fixed'];

/**
 * Get the list of available games
 */
export function getAvailableGames(): string[] {
  return gameNames;
}

/**
 * Create a mock game implementation that shows a message
 * This is a temporary solution until we resolve the import issues
 */
function createMockGame(gameName: string): GameModule {
  return {
    init: (container: HTMLElement) => {
      container.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: sans-serif;">
          <h2>Game: ${gameName}</h2>
          <p>This is a mock implementation of the game.</p>
          <p>The actual game module couldn't be loaded in the editor.</p>
          <div style="margin-top: 20px; padding: 10px; background: #333; color: #eee; border-radius: 5px;">
            <p>To run the actual game:</p>
            <code>cd /Users/gerard/Source/prometheus-engine/games/${gameName} && npm run dev</code>
          </div>
        </div>
      `;
    },
    pause: () => console.log(`${gameName}: pause called`),
    resume: () => console.log(`${gameName}: resume called`),
    step: () => console.log(`${gameName}: step called`),
  };
}

/**
 * Load a game module by name
 */
export async function loadGameModule(gameName: string): Promise<GameModule | null> {
  if (!gameNames.includes(gameName)) {
    console.error(`Game "${gameName}" not found in registry`);
    return null;
  }

  // For now, return a mock implementation
  // In the future, we can try to fix the import issues
  console.log(`Loading mock implementation for game: ${gameName}`);
  return createMockGame(gameName);
}
