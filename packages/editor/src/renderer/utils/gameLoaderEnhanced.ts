/**
 * Enhanced game loader that works with the actual game files
 */
import { GameModule as BaseGameModule } from './gameLoader';
import { GameEntity, GameComponent, SceneInfo } from './games';

export interface GameModule extends BaseGameModule {
  getEngine?: () => unknown;
  getEntities?: () => GameEntity[];
  getSceneInfo?: () => SceneInfo;
}

/**
 * Load a game by name directly from the games folder
 */
export async function loadRealGame(gameName: string): Promise<GameModule> {
  try {
    console.log(`Loading real game: ${gameName} from games folder`);

    // Use dynamic import to load the game
    const gameModule = await import(`@games/${gameName}/app`);

    if (!gameModule || typeof gameModule.init !== 'function') {
      throw new Error(`Game module ${gameName} doesn't have an init function`);
    }

    // Create a wrapper around the game module to add our enhanced functionality
    const enhancedModule: GameModule = {
      // Call the original init function
      init: async (container: HTMLElement) => {
        container.innerHTML = '';
        await gameModule.init(container);
      },

      // Pass through any existing methods
      pause: gameModule.pause,
      resume: gameModule.resume,
      step: gameModule.step,

      // Add placeholder methods for editor integration
      // In a real implementation, these would access the actual game engine
      getEntities: () => [],
      getSceneInfo: () => ({
        id: `scene-${gameName}`,
        name: `${gameName}Scene`,
        type: 'scene' as const,
      }),
    };

    return enhancedModule;
  } catch (error) {
    console.error(`Error loading game ${gameName}:`, error);
    // Re-throw to let the caller handle the error
    throw error;
  }
}

/**
 * Get a list of available game names
 * This is a hardcoded list for now, but could be dynamically generated
 */
export function getRealGameNames(): string[] {
  // Return the names of games we know exist in the games folder
  return ['bouncing-bunnies', 'prometheus-demo', 'game-test', 'test-game-fixed'];
}
