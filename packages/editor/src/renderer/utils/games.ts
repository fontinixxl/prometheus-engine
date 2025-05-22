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
  properties: Record<string, any>;
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
  init(container: HTMLElement): Promise<void> | void;
  pause?: () => void;
  resume?: () => void;
  step?: () => void;
  getEngine?: () => any;
  getEntities?: () => GameEntity[];
  getSceneInfo?: () => SceneInfo;
}

// Engine type no longer needed with mock-only implementation

// List of available games
const AVAILABLE_GAMES = ['bouncing-bunnies', 'prometheus-demo', 'game-test', 'test-game-fixed'];

/**
 * Get all available games
 */
export function getAvailableGames(): string[] {
  return AVAILABLE_GAMES;
}

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
    init: (container: HTMLElement) => {
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
                  color = spriteComp.properties.tint || '#ffffff';
                  shape = 'rect';
                } else if (colorComp) {
                  color = colorComp.properties.color || '#ff5500';
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
 * Load a game by name
 */
export async function loadGame(gameName: string): Promise<GameModule> {
  if (!AVAILABLE_GAMES.includes(gameName)) {
    console.warn(`Game "${gameName}" not found`);
    return createMockGame('test-game-fixed'); // Fallback to a mock game
  }

  // Always use mock games for now until we can properly integrate with real games
  console.log(`Loading enhanced mock implementation for ${gameName}`);
  return createMockGame(gameName);
}
