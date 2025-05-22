import React, { useState, useEffect } from 'react';
import { FaFolder, FaFolderOpen, FaCube, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { GameEntity, GameComponent, SceneInfo, getGameModule } from '../../utils/games';

interface HierarchyPanelProps {
  gameName: string;
  selectedEntity: string | null;
  onSelectEntity: (entityId: string | null) => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'scene' | 'entity' | 'component';
  children: TreeNode[];
  expanded?: boolean;
}

// Function to convert game entities to tree nodes
const convertEntitiesToTreeNodes = (entities: GameEntity[]): TreeNode[] => {
  return entities.map((entity) => ({
    id: entity.id,
    name: entity.name,
    type: 'entity',
    children: entity.components.map((component) => ({
      id: component.id,
      name: component.name,
      type: 'component',
      children: [],
    })),
  }));
};

// Function to get scene data from the game module
const getSceneData = async (gameName: string): Promise<TreeNode[]> => {
  try {
    // Use getGameModule instead of loadGame
    const gameModule = await getGameModule(gameName);
    if (!gameModule) {
      console.error(`Failed to load game module for ${gameName}`);
      return getEmptyScene();
    }

    // Get scene info from game module
    const sceneInfo = gameModule.getSceneInfo?.() || {
      id: `scene-${gameName}`,
      name: `${gameName}Scene`,
      type: 'scene',
    };

    // Get entities from game module
    const entities = gameModule.getEntities?.() || [];

    // Convert to TreeNode
    return [
      {
        id: sceneInfo.id,
        name: sceneInfo.name,
        type: 'scene',
        expanded: true,
        children: convertEntitiesToTreeNodes(entities),
      },
    ];
  } catch (error) {
    console.error('Error getting scene data:', error);
    return getEmptyScene();
  }
};

// Function to get an empty scene when no data is available
const getEmptyScene = (): TreeNode[] => {
  return [
    {
      id: 'scene-empty',
      name: 'EmptyScene',
      type: 'scene',
      expanded: true,
      children: [],
    },
  ];
};

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  selectedEntity: string | null;
  onSelectEntity: (entityId: string | null) => void;
  onToggleNode: (nodeId: string) => void;
}> = ({ node, selectedEntity, onSelectEntity, onToggleNode }) => {
  const isExpanded = node.expanded || false;
  const isSelected = node.id === selectedEntity;
  const hasChildren = node.children && node.children.length > 0;

  const getIcon = () => {
    if (node.type === 'scene') {
      return isExpanded ? (
        <FaFolderOpen className="text-yellow-400" />
      ) : (
        <FaFolder className="text-yellow-400" />
      );
    } else if (node.type === 'entity') {
      return <FaCube className="text-blue-400" />;
    } else {
      return <span className="w-4 h-4 inline-block"></span>;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-editor-panel cursor-pointer ${
          isSelected ? 'bg-editor-selection' : ''
        }`}
        onClick={() => onSelectEntity(node.id)}
      >
        {hasChildren ? (
          <div
            className="mr-1 w-4 h-4 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation();
              onToggleNode(node.id);
            }}
          >
            {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
          </div>
        ) : (
          <div className="mr-1 w-4" />
        )}

        <span className="mr-1">{getIcon()}</span>
        <span>{node.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <div className="pl-4">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              selectedEntity={selectedEntity}
              onSelectEntity={onSelectEntity}
              onToggleNode={onToggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HierarchyPanel: React.FC<HierarchyPanelProps> = ({
  gameName,
  selectedEntity,
  onSelectEntity,
}) => {
  const [sceneData, setSceneData] = useState<TreeNode[]>([]);
  const [newEntityName, setNewEntityName] = useState('');
  const [isAddingEntity, setIsAddingEntity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load scene data whenever the game changes
    const loadSceneData = async () => {
      setIsLoading(true);
      try {
        const data = await getSceneData(gameName);
        setSceneData(data);
      } catch (error) {
        console.error('Failed to load scene data:', error);
        setSceneData(getEmptyScene());
      } finally {
        setIsLoading(false);
      }
    };

    loadSceneData();
  }, [gameName]);

  const handleToggleNode = (nodeId: string) => {
    setSceneData((prevData) => {
      return prevData.map((scene) => toggleNodeExpanded(scene, nodeId));
    });
  };

  const toggleNodeExpanded = (node: TreeNode, nodeId: string): TreeNode => {
    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded };
    }

    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: node.children.map((child) => toggleNodeExpanded(child, nodeId)),
      };
    }

    return node;
  };

  const addEntity = () => {
    if (!newEntityName.trim() || !sceneData.length) return;

    // Generate a unique ID for the new entity
    const newId = `entity-${Date.now()}`;

    // Add the new entity to the first scene
    const updatedSceneData = [...sceneData];
    const firstScene = updatedSceneData[0];

    const newEntity: TreeNode = {
      id: newId,
      name: newEntityName.trim(),
      type: 'entity',
      children: [
        {
          id: `comp-${Date.now()}-1`,
          name: 'SpriteComponent',
          type: 'component',
          children: [],
        },
      ],
    };

    // Add the entity to the scene
    firstScene.children = [...firstScene.children, newEntity];

    setSceneData(updatedSceneData);
    setNewEntityName('');
    setIsAddingEntity(false);
  };

  const removeEntity = () => {
    if (!selectedEntity || !selectedEntity.startsWith('entity-')) return;

    const updatedSceneData = sceneData.map((scene) => ({
      ...scene,
      children: scene.children.filter((entity) => entity.id !== selectedEntity),
    }));

    setSceneData(updatedSceneData);
    onSelectEntity(null);
  };

  return (
    <div className="h-full flex flex-col border-r border-editor-border">
      <div className="p-2 font-medium bg-editor-header border-b border-editor-border flex justify-between items-center">
        <span>Hierarchy</span>
        <div className="flex items-center space-x-1">
          <button
            className="text-sm px-1.5 py-0.5 rounded hover:bg-editor-panel"
            title="Add Entity"
            onClick={() => setIsAddingEntity((prev) => !prev)}
          >
            +
          </button>
          <button
            className={`text-sm px-1.5 py-0.5 rounded hover:bg-editor-panel ${
              !selectedEntity || !selectedEntity.startsWith('entity-')
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            title="Remove Selected Entity"
            onClick={removeEntity}
            disabled={!selectedEntity || !selectedEntity.startsWith('entity-')}
          >
            -
          </button>
        </div>
      </div>

      {isAddingEntity && (
        <div className="p-2 bg-editor-panel border-b border-editor-border flex">
          <input
            type="text"
            className="flex-1 px-2 py-1 bg-editor-bg border border-editor-border rounded"
            placeholder="Entity name"
            value={newEntityName}
            onChange={(e) => setNewEntityName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEntity()}
            autoFocus
          />
          <button
            className="ml-2 px-3 py-1 bg-editor-header border border-editor-border rounded hover:bg-opacity-80"
            onClick={addEntity}
          >
            Add
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto p-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full opacity-60">
            <span>Loading scene hierarchy...</span>
          </div>
        ) : sceneData.length > 0 ? (
          sceneData.map((node) => (
            <TreeNodeComponent
              key={node.id}
              node={node}
              selectedEntity={selectedEntity}
              onSelectEntity={onSelectEntity}
              onToggleNode={handleToggleNode}
            />
          ))
        ) : (
          <div className="p-2 text-sm text-gray-400">No scene data available.</div>
        )}
      </div>
    </div>
  );
};

export default HierarchyPanel;
