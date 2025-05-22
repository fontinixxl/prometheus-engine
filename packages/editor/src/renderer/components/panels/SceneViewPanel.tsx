import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaPause, FaStepForward, FaExpand, FaCamera, FaCog } from 'react-icons/fa';
import { GameModule, loadGame } from '../../utils/games';

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
        console.log('Loading game:', gameName);

        // Load the game module from our utility
        const gameModule = await loadGame(gameName);

        // Handle game not found
        if (!gameModule) {
          const error = `Game "${gameName}" not found or failed to load`;
          console.error(error);
          setError(error);
          container.innerHTML = `<div class="p-4 text-red-500">${error}</div>`;
          setIsLoading(false);
          return;
        }

        if (typeof gameModule.init === 'function') {
          // Clear loading message
          container.innerHTML = '';

          // Initialize the game
          gameModule.init(container);
          gameInstanceRef.current = gameModule;
          setIsPlaying(true);
        } else {
          setError(`Game "${gameName}" has no init() export`);
          container.innerHTML = `<div class="p-4 text-red-500">Game "${gameName}" has no init() export.</div>`;
        }
      } catch (error) {
        console.error(`Error loading game "${gameName}":`, error);
        setError(`Error loading game "${gameName}"`);
        container.innerHTML = `<div class="p-4 text-red-500">Error loading game "${gameName}". See console for details.</div>`;
      } finally {
        setIsLoading(false);
      }
    };

    loadGameFn();

    // Cleanup on unmount
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
