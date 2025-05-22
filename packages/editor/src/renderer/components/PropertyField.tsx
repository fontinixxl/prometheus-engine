import React, { useState, useEffect } from 'react';

// Define the allowed property value types
type PropertyValue = string | number | boolean | Record<string, unknown> | null | undefined;

// Make sure this is exported
export { PropertyValue };

interface PropertyFieldProps {
  name: string;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  path?: string; // Path for nested properties
}

const PropertyField: React.FC<PropertyFieldProps> = ({ name, value, onChange, path = '' }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [expanded, setExpanded] = useState(false);

  const fullPath = path ? `${path}.${name}` : name;

  // Update input value when the prop value changes
  useEffect(() => {
    setInputValue(value !== null && value !== undefined ? String(value) : '');
  }, [value]);

  // Determine the type of the property for appropriate input rendering
  const getValueType = () => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const valueType = getValueType();

  const handleEdit = () => {
    if (valueType === 'object' || valueType === 'null') return; // Don't allow direct editing of objects yet
    setEditing(true);
  };

  const handleSave = () => {
    setEditing(false);

    try {
      let parsedValue: PropertyValue;

      if (valueType === 'number') {
        parsedValue = parseFloat(inputValue);
        if (isNaN(parsedValue as number)) throw new Error('Invalid number');
      } else if (valueType === 'boolean') {
        parsedValue = inputValue.toLowerCase() === 'true';
      } else {
        parsedValue = inputValue;
      }

      onChange(parsedValue);
    } catch (error) {
      console.error('Error parsing value:', error);
      setInputValue(value !== null && value !== undefined ? String(value) : ''); // Revert to original on error
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setInputValue(value !== null && value !== undefined ? String(value) : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleNestedPropertyChange = (nestedValue: PropertyValue) => {
    // For nested object properties, use the nested value directly
    // This is a simplified implementation for our current needs
    onChange(nestedValue);
  };

  // Toggle expanded state for objects
  const toggleExpanded = () => {
    if (valueType === 'object') {
      setExpanded(!expanded);
    }
  };

  // Render boolean as a checkbox
  if (valueType === 'boolean') {
    return (
      <div className="mb-2">
        <div className="text-xs uppercase opacity-75 mb-1">{name}</div>
        <label className="px-2 py-1 bg-editor-panel border border-editor-border rounded flex items-center">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => onChange(e.target.checked)}
            className="mr-2"
          />
          {String(value)}
        </label>
      </div>
    );
  }

  // Render object property with expandable interface
  if (valueType === 'object') {
    if (value === null) {
      return (
        <div className="mb-2">
          <div className="text-xs uppercase opacity-75 mb-1">{name}</div>
          <div className="px-2 py-1 bg-editor-panel border border-editor-border rounded italic">
            null
          </div>
        </div>
      );
    }

    return (
      <div className="mb-2">
        <div className="text-xs uppercase opacity-75 mb-1 flex items-center">
          <button
            className="mr-1 w-4 h-4 flex items-center justify-center text-xs"
            onClick={toggleExpanded}
          >
            {expanded ? '▼' : '►'}
          </button>
          {name}
        </div>

        {expanded ? (
          <div className="pl-3 border-l border-editor-border ml-1 mt-1">
            {Object.entries(value as Record<string, unknown>).map(([key, val]) => (
              <PropertyField
                key={key}
                name={key}
                value={val as PropertyValue}
                onChange={handleNestedPropertyChange}
                path={fullPath}
              />
            ))}
          </div>
        ) : (
          <div
            className="px-2 py-1 bg-editor-panel border border-editor-border rounded font-mono text-sm cursor-pointer hover:bg-opacity-70"
            onClick={toggleExpanded}
          >
            {Object.keys(value as Record<string, unknown>).length} properties
          </div>
        )}
      </div>
    );
  }

  // Render null or undefined value
  if (valueType === 'null') {
    return (
      <div className="mb-2">
        <div className="text-xs uppercase opacity-75 mb-1">{name}</div>
        <div className="px-2 py-1 bg-editor-panel border border-editor-border rounded italic text-editor-text opacity-50">
          {value === null ? 'null' : 'undefined'}
        </div>
      </div>
    );
  }

  // Default field rendering
  return (
    <div className="mb-2">
      <div className="text-xs uppercase opacity-75 mb-1">{name}</div>
      {editing ? (
        <div className="flex">
          <input
            className="px-2 py-1 bg-editor-panel border border-editor-border rounded flex-1"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button
            className="ml-1 px-2 bg-editor-header border border-editor-border rounded"
            onClick={handleCancel}
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className="px-2 py-1 bg-editor-panel border border-editor-border rounded cursor-pointer hover:bg-opacity-70"
          onClick={handleEdit}
        >
          {String(value)}
        </div>
      )}
    </div>
  );
};

export default PropertyField;
