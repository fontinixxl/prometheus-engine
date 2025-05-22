import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaExpand, FaCamera, FaCog } from 'react-icons/fa';
// Import getGameModule and initializeGame instead of loadGame
import { GameModule, getGameModule, initializeGame } from '../../utils/games';

interface SceneViewPanelProps {
  gameName: string;
}

const SceneViewPanel: React.FC<SceneViewPanelProps> = ({ gameName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<GameModule | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle play/pause
  const handlePlayPause = () => {
    const gameInstance = gameInstanceRef.current;
    if (!gameInstance) return;

    if (isPlaying) {
      if (gameInstance.pause) {
        gameInstance.pause();
      }
      setIsPlaying(false);
    } else {
      if (gameInstance.resume) {
        gameInstance.resume();
      }
      setIsPlaying(true);
    }
  };

  // Step forward one frame
  const handleStep = () => {
    const gameInstance = gameInstanceRef.current;
    if (!gameInstance || !gameInstance.step) return;

    gameInstance.step();
  };

  // Capture screenshot
  const handleCapture = () => {
    if (!containerRef.current) return;

    // Find canvas element in the container
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) {
      console.log('No canvas found to capture');
      return;
    }

    try {
      // Generate and download screenshot
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${gameName}-screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up any existing game instance
    if (gameInstanceRef.current) {
      // We would need to implement a proper cleanup method in the engine
      container.innerHTML = '';
      gameInstanceRef.current = null;
    }

    setIsLoading(true);
    setError(null);

    // Display loading message
    container.innerHTML = `<div class="p-4">Loading ${gameName}...</div>`;

    // Load and initialize the game
    const loadGameFn = async () => {
      try {
        console.log('Loading game module for:', gameName);

        // Load the game module using getGameModule
        const gameModule = await getGameModule(gameName);
        console.log(`Game module loaded for "${gameName}":`, gameModule);

        // Handle game not found or invalid module
        if (!gameModule || typeof gameModule.init !== 'function') {
          const errorMsg = `Game module "${gameName}" not found, failed to load, or is invalid.`;
          console.error(errorMsg);
          setError(errorMsg);
          if (container) container.innerHTML = `<div class="p-4 text-red-500">${errorMsg}</div>`;
          setIsLoading(false);
          return;
        }

        // Clear loading message and initialize the game
        if (container) container.innerHTML = '';
        console.log(`Initializing game "${gameName}" in container`);
        await initializeGame(gameModule, container); // Use initializeGame
        console.log(`Game "${gameName}" initialized successfully`);
        gameInstanceRef.current = gameModule;
        setIsPlaying(true);
      } catch (initError) {
        // Catch errors from both getGameModule and initializeGame
        console.error(`Error loading or initializing game "${gameName}":`, initError);
        const errorMessage = initError instanceof Error ? initError.message : String(initError);
        setError(`Error with game "${gameName}": ${errorMessage}`);
        if (container)
          container.innerHTML = `<div class="p-4 text-red-500">Error with game "${gameName}": ${errorMessage}</div>`;
      } finally {
        setIsLoading(false);
      }
    };

    if (gameName && container) {
      // Ensure gameName and container are present
      loadGameFn();
    }

    // Cleanup on unmount or when gameName changes
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      gameInstanceRef.current = null;
    };
  }, [gameName]);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-editor-header border-b border-editor-border">
        {/* Header with title */}
        <div className="p-2 font-medium flex items-center">
          <span>Scene View</span>
          <span className="ml-2 text-xs opacity-75">({gameName})</span>
        </div>

        {/* Toolbar */}
        <div className="px-2 py-1 border-t border-editor-border flex items-center">
          <button
            className={`p-1 mr-1 rounded hover:bg-editor-panel ${!isPlaying ? 'text-editor-highlight' : ''}`}
            onClick={handlePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
            disabled={isLoading || !!error}
          >
            {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} />}
          </button>

          <button
            className="p-1 mr-1 rounded hover:bg-editor-panel"
            onClick={handleStep}
            title="Step Forward"
            disabled={isPlaying || isLoading || !!error}
          >
            <FaStepForward size={14} />
          </button>

          <span className="mx-2 text-editor-border">|</span>

          <button
            className="p-1 mr-1 rounded hover:bg-editor-panel"
            onClick={handleCapture}
            title="Capture Screenshot"
            disabled={isLoading || !!error}
          >
            <FaCamera size={14} />
          </button>

          <button
            className="p-1 mr-1 rounded hover:bg-editor-panel"
            title="Fullscreen"
            disabled={isLoading || !!error}
            onClick={() => containerRef.current?.requestFullscreen?.()}
          >
            <FaExpand size={14} />
          </button>

          <button className="p-1 ml-auto rounded hover:bg-editor-panel" title="Scene Settings">
            <FaCog size={14} />
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden bg-black relative" />
    </div>
  );
};

export default SceneViewPanel;
