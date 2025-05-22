import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import HierarchyPanel from './panels/HierarchyPanel';
import SceneViewPanel from './panels/SceneViewPanel';
import PropertiesPanel from './panels/PropertiesPanel';

interface AppProps {
  availableGames: string[];
}

const App: React.FC<AppProps> = ({ availableGames }) => {
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Add some debug logging
  console.log('App component received available games:', availableGames);

  const selectedGame =
    availableGames && availableGames.length > 0
      ? availableGames[selectedGameIndex]
      : 'No games available';

  return (
    <div className="h-full flex flex-col bg-editor-bg text-editor-text">
      {/* Top toolbar */}
      <div className="flex items-center bg-editor-header p-2 border-b border-editor-border">
        <h1 className="text-lg font-semibold mr-4">Prometheus Engine</h1>

        <select
          value={selectedGameIndex}
          onChange={(e) => setSelectedGameIndex(parseInt(e.target.value))}
          className="px-2 py-1 bg-editor-panel border border-editor-border rounded mr-4"
        >
          {availableGames.map((game, index) => (
            <option key={game} value={index}>
              {game}
            </option>
          ))}
        </select>

        <span className="text-sm opacity-75 ml-auto">v0.1.0</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <PanelGroup direction="horizontal">
          {/* Left Panel - Hierarchy */}
          <Panel defaultSize={20} minSize={15}>
            <HierarchyPanel
              gameName={selectedGame}
              onSelectEntity={setSelectedEntity}
              selectedEntity={selectedEntity}
            />
          </Panel>

          <PanelResizeHandle className="vertical ResizeHandleOuter">
            <div className="ResizeHandleInner bg-editor-border hover:bg-editor-highlight" />
          </PanelResizeHandle>

          {/* Center Panel - Scene View */}
          <Panel defaultSize={60}>
            <SceneViewPanel gameName={selectedGame} />
          </Panel>

          <PanelResizeHandle className="vertical ResizeHandleOuter">
            <div className="ResizeHandleInner bg-editor-border hover:bg-editor-highlight" />
          </PanelResizeHandle>

          {/* Right Panel - Properties */}
          <Panel defaultSize={20} minSize={15}>
            <PropertiesPanel selectedEntity={selectedEntity} gameName={selectedGame} />
          </Panel>
        </PanelGroup>
      </div>

      {/* Status bar */}
      <div className="bg-editor-header p-1 border-t border-editor-border text-xs">
        {selectedEntity ? `Selected: ${selectedEntity}` : 'No selection'}
      </div>
    </div>
  );
};

export default App;
