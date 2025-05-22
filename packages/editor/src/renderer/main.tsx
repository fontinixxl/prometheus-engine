/// <reference types="vite/client" />

// Import React
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import App from './components/App';

// Make TS aware of our preload‐exposed API
declare global {
  interface Window {
    electronAPI: {
      onProjectOpened: (callback: (projectPath: string) => void) => void;
    };
  }
}

// --- Renderer Entry Point ---

// Import our games utility
import { getAvailableGames } from './utils/games';

// Get the list of available games
const gameNames = getAvailableGames();

// Log available games for debugging
console.log('Available games:', gameNames);

// Initialize React app
const root = createRoot(document.getElementById('app')!);
root.render(<App availableGames={gameNames} />);

// Listen for File → Open Project events from the main process, if we're in Electron
if (window.electronAPI) {
  window.electronAPI.onProjectOpened((projectPath: string) => {
    const name = projectPath.split(/[/\\]/).pop()!;
    console.log(`Project opened: ${name} at ${projectPath}`);
  });
} else {
  console.log('Running in browser mode - electron APIs not available');
}
