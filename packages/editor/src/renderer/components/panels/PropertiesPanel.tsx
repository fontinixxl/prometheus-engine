import React, { useState, useEffect } from 'react';
import PropertyField, { PropertyValue } from '../PropertyField';
import { loadGame } from '../../utils/games';

interface PropertiesPanelProps {
  selectedEntity: string | null;
  gameName: string;
}

// Helper function to get entity properties from game module
const getEntityProperties = async (
  selectedId: string | null,
  gameName: string,
): Promise<Record<string, PropertyValue>> => {
  if (!selectedId) return {};

  try {
    const gameModule = await loadGame(gameName);
    if (!gameModule || !gameModule.getEntities || !gameModule.getSceneInfo) {
      console.warn('Game module does not have entity or scene data');
      return {};
    }

    // Get entities and scene info
    const entities = gameModule.getEntities();
    const sceneInfo = gameModule.getSceneInfo();

    // Check if we're selecting a scene
    if (selectedId.startsWith('scene-')) {
      return {
        id: sceneInfo.id,
        type: 'Scene',
        name: sceneInfo.name,
        entityCount: entities.length,
        backgroundColor: sceneInfo.backgroundColor || '#000000',
      };
    }

    // Check if we're selecting an entity
    if (selectedId.startsWith('entity-')) {
      const entity = entities.find((e) => e.id === selectedId);
      if (entity) {
        // Extract safe properties without components array
        return {
          id: entity.id,
          name: entity.name,
          type: 'Entity',
          position: entity.position || { x: 0, y: 0 },
          rotation: entity.rotation || 0,
          scale: entity.scale || { x: 1, y: 1 },
          visible: entity.visible !== undefined ? entity.visible : true,
          componentCount: entity.components.length,
        };
      }
    }

    // Check if we're selecting a component
    if (selectedId.startsWith('comp-')) {
      for (const entity of entities) {
        const component = entity.components.find((c) => c.id === selectedId);
        if (component) {
          // Convert properties to a safe format
          const safeProps: Record<string, PropertyValue> = {
            id: component.id,
            name: component.name,
            type: component.type,
          };

          // Add component properties safely
          Object.entries(component.properties).forEach(([key, value]) => {
            if (typeof value !== 'function') {
              if (typeof value !== 'object' || value === null) {
                safeProps[key] = value as PropertyValue;
              } else {
                // For objects, we can display them if they're simple
                safeProps[key] = value as Record<string, unknown>;
              }
            }
          });

          return safeProps;
        }
      }
    }

    console.warn(`Could not find properties for ID: ${selectedId}`);
    return {};
  } catch (error) {
    console.error('Error getting entity properties:', error);
    return {};
  }
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedEntity, gameName }) => {
  const [properties, setProperties] = useState<Record<string, PropertyValue>>({});
  const [entityName, setEntityName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadProperties = async () => {
      if (!selectedEntity) {
        setEntityName('');
        setProperties({});
        return;
      }

      setIsLoading(true);
      try {
        const props = await getEntityProperties(selectedEntity, gameName);

        // Set the entity name (ensure it's a string)
        const entityNameValue =
          typeof props.name === 'string' ? props.name : String(selectedEntity);
        setEntityName(entityNameValue);

        setProperties(props);
      } catch (error) {
        console.error('Error loading properties:', error);
        setProperties({});
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, [selectedEntity, gameName]);

  const handlePropertyChange = (propertyPath: string, value: PropertyValue) => {
    // This function would typically update the actual entity in a global state/context
    console.log(`Property '${propertyPath}' changed to:`, value);
    setProperties((prev) => ({ ...prev, [propertyPath]: value }));
  };

  if (!selectedEntity) {
    return <div className="p-4 text-sm text-gray-400">Select an entity to see its properties.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4 text-sm flex items-center justify-center h-full">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="p-2 space-y-3 overflow-y-auto h-full">
      <h3 className="text-lg font-semibold border-b pb-1 mb-2">{entityName} Properties</h3>
      {Object.entries(properties).length > 0 ? (
        Object.entries(properties).map(([key, value]) => (
          <PropertyField
            key={key}
            name={key}
            value={value}
            onChange={(newValue) => handlePropertyChange(key, newValue)}
          />
        ))
      ) : (
        <div className="p-2 text-sm text-gray-400">No properties available.</div>
      )}
    </div>
  );
};

export default PropertiesPanel;
