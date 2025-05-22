/**
 * Game module utilities to load actual game implementations
 */

// Entity interface for tracking entities
export interface GameEntity {
  id: string;
  name: string;
  type: 'entity';
  components: GameComponent[];
  position?: { x: number; y: number };
  rotation?: number;
  scale?: { x: number; y: number };
  visible?: boolean;
}

// Component interface for entity components
export interface GameComponent {
  id: string;
  name: string;
  type: string;
  properties: Record<string, unknown>;
}

// Scene information interface
export interface SceneInfo {
  id: string;
  name: string;
  type: 'scene';
  backgroundColor?: string;
}

// Interface for enhanced game modules
export interface GameModule {
  init(container: HTMLElement): Promise<void>;
  pause?: () => void;
  resume?: () => void;
  step?: () => void;
  getEngine?: () => unknown;
  getEntities?: () => GameEntity[];
  getSceneInfo?: () => SceneInfo;
}

// Engine type no longer needed with mock-only implementation

// List of available games
// const AVAILABLE_GAMES = ['bouncing-bunnies', 'prometheus-demo', 'game-test', 'test-game-fixed'];
// find all app.ts under games/<name>/app.ts
const modules = import.meta.glob('@games/*/app.ts', { eager: false });

console.log('🏓 found game modules:', Object.keys(modules));

/**
 * Get all available games
 */
export function getAvailableGames(): string[] {
  return Object.keys(modules)
    .map((p) => {
      // p is like "../../../../games/bouncing-bunnies/app.ts" or "@games/bouncing-bunnies/app.ts"
      const m = p.match(/games\/([^\/]+)\/app\.ts$/);
      return m ? m[1] : '';
    })
    .filter(Boolean);
}

/**
 * Loads the game module but does not initialize it.
 * Used for accessing game metadata without rendering.
 */
export async function getGameModule(name: string): Promise<GameModule> {
  const gamePathSuffix = `/games/${name}/app.ts`;
  const moduleKey = Object.keys(modules).find((key) => key.endsWith(gamePathSuffix));

  if (!moduleKey) {
    console.error(
      `Game module key not found for game: ${name}. Available module keys: ${Object.keys(modules).join(', ')}`,
    );
    throw new Error(`Game module key not found for game: ${name}`);
  }

  const loader = modules[moduleKey];
  if (typeof loader !== 'function') {
    console.error(
      `Invalid loader for game ${name} (key: ${moduleKey}). Expected a function, got:`,
      loader,
    );
    throw new Error(`Invalid loader for game: ${name}`);
  }

  try {
    const mod = (await loader()) as GameModule; // Type assertion
    if (!mod || typeof mod.init !== 'function') {
      // Check if module and init are valid
      console.error(
        `Module for game ${name} (key: ${moduleKey}) is not a valid GameModule or does not have an init function.`,
      );
      throw new Error(`Module for game ${name} is not a valid GameModule.`);
    }
    // Check for other expected functions if necessary, e.g., getEntities, getSceneInfo
    if (typeof mod.getEntities !== 'function' || typeof mod.getSceneInfo !== 'function') {
      console.warn(`Game module ${name} is missing getEntities or getSceneInfo methods.`);
      // Depending on strictness, you might throw an error or allow it
    }
    return mod;
  } catch (error) {
    console.error(`Error loading game module ${name} (key: ${moduleKey}):`, error);
    throw error;
  }
}

/**
 * Initializes a previously loaded game module within a given HTML container.
 * This is typically called by the view component responsible for rendering the game.
 */
export async function initializeGame(
  gameModule: GameModule,
  container: HTMLElement,
): Promise<void> {
  if (!gameModule || typeof gameModule.init !== 'function') {
    console.error(`Invalid game module or init function provided for initialization.`);
    throw new Error(`Invalid game module or init function.`);
  }
  try {
    await gameModule.init(container);
  } catch (error) {
    console.error(`Error initializing game module in container:`, error);
    throw error;
  }
}

// The old loadGame function which combined loading and initialization is removed.
// Callers should now use getGameModule() and then initializeGame() separately.
// Example for a component that renders the game (like SceneViewPanel):
//
// const gameViewRef = useRef<HTMLDivElement>(null);
// useEffect(() => {
//   if (gameName && gameViewRef.current) {
//     let gameMod: GameModule;
//     getGameModule(gameName)
//       .then(mod => {
//         gameMod = mod;
//         return initializeGame(mod, gameViewRef.current!);
//       })
//       .then(() => {
//         console.log(`${gameName} initialized successfully.`);
//         // Potentially use gameMod for other operations like pause, resume
//       })
//       .catch(err => console.error(`Failed to load or initialize ${gameName}`, err));
//   }
// }, [gameName]);

// Mock entity and component data for different games
const MOCK_GAME_DATA: Record<
  string,
  {
    entities: GameEntity[];
    scene: SceneInfo;
  }
> = {
  'bouncing-bunnies': {
    entities: [
      {
        id: 'entity-1',
        name: 'bunny1',
        type: 'entity',
        position: { x: 150, y: 100 },
        rotation: 0,
        scale: { x: 1, y: 1 },
        visible: true,
        components: [
          {
            id: 'comp-1',
            name: 'SpriteComponent',
            type: 'SpriteComponent',
            properties: {
              texture: 'bunny.png',
              anchor: { x: 0.5, y: 0.5 },
              tint: '#FFFFFF',
            },
          },
          {
            id: 'comp-2',
            name: 'PhysicsComponent',
            type: 'PhysicsComponent',
            properties: {
              velocity: { x: 2.5, y: 1.5 },
              acceleration: { x: 0, y: 0.5 },
              bounce: 0.8,
            },
          },
        ],
      },
      {
        id: 'entity-2',
        name: 'bunny2',
        type: 'entity',
        position: { x: 300, y: 200 },
        rotation: 0.5,
        scale: { x: 1.2, y: 1.2 },
        visible: true,
        components: [
          {
            id: 'comp-3',
            name: 'SpriteComponent',
            type: 'SpriteComponent',
            properties: {
              texture: 'bunny.png',
              anchor: { x: 0.5, y: 0.5 },
              tint: '#FF9999',
            },
          },
          {
            id: 'comp-4',
            name: 'PhysicsComponent',
            type: 'PhysicsComponent',
            properties: {
              velocity: { x: -2, y: -1 },
              acceleration: { x: 0, y: 0.5 },
              bounce: 0.7,
            },
          },
        ],
      },
    ],
    scene: {
      id: 'scene-1',
      name: 'BouncingBunniesScene',
      type: 'scene',
      backgroundColor: '#1099bb',
    },
  },
  'prometheus-demo': {
    entities: [
      {
        id: 'entity-3',
        name: 'spineboy-entity',
        type: 'entity',
        position: { x: 400, y: 300 },
        scale: { x: 0.5, y: 0.5 },
        visible: true,
        components: [
          {
            id: 'comp-5',
            name: 'SpineComponent',
            type: 'SpineComponent',
            properties: {
              animation: 'run',
              autoUpdate: true,
              playing: true,
            },
          },
        ],
      },
    ],
    scene: {
      id: 'scene-2',
      name: 'SpineDemoScene',
      type: 'scene',
      backgroundColor: '#000000',
    },
  },
  'game-test': {
    entities: [
      {
        id: 'entity-4',
        name: 'test-entity',
        type: 'entity',
        position: { x: 250, y: 250 },
        scale: { x: 1, y: 1 },
        visible: true,
        components: [
          {
            id: 'comp-6',
            name: 'TestComponent',
            type: 'TestComponent',
            properties: {
              testProperty: 'test-value',
              enabled: true,
            },
          },
        ],
      },
    ],
    scene: {
      id: 'scene-3',
      name: 'TestScene',
      type: 'scene',
      backgroundColor: '#333333',
    },
  },
  'test-game-fixed': {
    entities: [
      {
        id: 'entity-5',
        name: 'fixed-entity',
        type: 'entity',
        position: { x: 200, y: 200 },
        scale: { x: 1, y: 1 },
        visible: true,
        components: [
          {
            id: 'comp-7',
            name: 'FixedComponent',
            type: 'FixedComponent',
            properties: {
              fixedProperty: 'fixed-value',
              enabled: true,
            },
          },
        ],
      },
    ],
    scene: {
      id: 'scene-4',
      name: 'FixedScene',
      type: 'scene',
      backgroundColor: '#444444',
    },
  },
};

/**
 * Create a mock implementation of a game when the real implementation fails to load
 */
function createMockGame(gameName: string): Promise<GameModule> {
  console.warn(`Creating mock implementation for ${gameName} as fallback`);

  const gameData = MOCK_GAME_DATA[gameName] || {
    entities: [],
    scene: { id: 'scene-empty', name: 'EmptyScene', type: 'scene' },
  };

  return Promise.resolve({
    init: async (container: HTMLElement): Promise<void> => {
      // Make init async and return Promise<void>
      // Create a styled container with game information and interactive entities
      container.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${gameData.scene.backgroundColor || '#222'};">
          <h2 style="margin: 0; color: #eee;">${gameData.scene.name}</h2>
          <div style="position: relative; width: 600px; height: 400px; margin: 20px; background: #333; border-radius: 8px; overflow: hidden;">
            ${gameData.entities
              .map((entity) => {
                // Get the entity's first sprite component if available
                const spriteComp = entity.components.find((c) =>
                  c.type.toLowerCase().includes('sprite'),
                );
                const colorComp = entity.components.find((c) =>
                  c.type.toLowerCase().includes('color'),
                );

                // Determine shape and color based on component type
                let shape = 'circle';
                let color = '#0078d4';

                if (spriteComp) {
                  color = (spriteComp.properties.tint as string) || '#ffffff';
                  shape = 'rect';
                } else if (colorComp) {
                  color = (colorComp.properties.color as string) || '#ff5500';
                }

                // Special case for spineboy
                if (entity.name.toLowerCase().includes('spine')) {
                  shape = 'spine';
                }

                // Calculate animation based on entity
                const moveX = Math.random() * 80 - 40;
                const moveY = Math.random() * 60 - 30;
                const duration = 2 + Math.random() * 3;

                return `
                <div style="
                  position: absolute;
                  left: ${entity.position?.x || 0}px;
                  top: ${entity.position?.y || 0}px;
                  width: ${shape === 'rect' ? '40px' : '30px'};
                  height: ${shape === 'rect' ? '40px' : '30px'};
                  background: ${color};
                  border-radius: ${shape === 'circle' ? '50%' : shape === 'spine' ? '0' : '4px'};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 10px;
                  transform: translate(-50%, -50%) rotate(${entity.rotation || 0}rad) scale(${entity.scale?.x || 1}, ${entity.scale?.y || 1});
                  ${!entity.visible ? 'opacity: 0.3;' : ''}
                  animation: move-${entity.id} ${duration}s infinite ease-in-out;
                  cursor: pointer;
                " data-entity-id="${entity.id}" title="${entity.name}">
                  ${shape === 'spine' ? '<div style="width: 30px; height: 60px; background: url(https://pixijs.com/assets/bunny.png) center/contain no-repeat;"></div>' : ''}
                </div>
                <style>
                  @keyframes move-${entity.id} {
                    0%, 100% { transform: translate(-50%, -50%) rotate(${entity.rotation || 0}rad) scale(${entity.scale?.x || 1}, ${entity.scale?.y || 1}) translate(0, 0); }
                    50% { transform: translate(-50%, -50%) rotate(${entity.rotation || 0}rad) scale(${entity.scale?.x || 1}, ${entity.scale?.y || 1}) translate(${moveX}px, ${moveY}px); }
                  }
                </style>
              `;
              })
              .join('')}
          </div>
          <p style="color: #aaa;">Enhanced mock implementation with ${gameData.entities.length} entities</p>
          <div class="controls" style="display: flex; gap: 10px; margin-top: 10px;">
            <button style="padding: 5px 10px; background: #333; color: white; border: none; border-radius: 4px;">Pause</button>
            <button style="padding: 5px 10px; background: #333; color: white; border: none; border-radius: 4px;">Step</button>
          </div>
        </div>
      `;
      // No explicit return needed for async Promise<void>
    },
    pause: () => console.log(`[${gameName}] Game paused`),
    resume: () => console.log(`[${gameName}] Game resumed`),
    step: () => console.log(`[${gameName}] Step forward`),
    getEngine: () => undefined,
    getEntities: () => gameData.entities,
    getSceneInfo: () => gameData.scene,
  });
}

/**
 * This function attempts to load a real game from the games folder.
 * If successful, it returns an enhanced version of the game module.
 * If unsuccessful, it falls back to the mock implementation.
 */
async function tryLoadRealGame(gameName: string): Promise<GameModule | null> {
  try {
    console.log(`Trying to load real game: ${gameName}`);

    // Use dynamic import to load the game module
    const gameModule = await import(/* @vite-ignore */ `@games/${gameName}/app.ts`);

    if (!gameModule || typeof gameModule.init !== 'function') {
      console.warn(`Game module ${gameName} doesn't have an init function`);
      return null;
    }

    console.log(`Real game module loaded successfully for ${gameName}`);

    // Create a wrapper with editor-specific methods
    return {
      init: gameModule.init,
      pause: gameModule.pause,
      resume: gameModule.resume,
      step: gameModule.step,
      getEntities: () => MOCK_GAME_DATA[gameName]?.entities || [],
      getSceneInfo: () =>
        MOCK_GAME_DATA[gameName]?.scene || {
          id: `scene-${gameName}`,
          name: `${gameName}Scene`,
          type: 'scene',
        },
    };
  } catch (error) {
    console.warn(`Failed to load real game ${gameName}:`, error);
    return null;
  }
}
