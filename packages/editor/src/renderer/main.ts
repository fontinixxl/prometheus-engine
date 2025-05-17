/// <reference types="vite/client" />

// Make TS aware of our preload‐exposed API
declare global {
  interface Window {
    electronAPI: {
      onProjectOpened: (callback: (projectPath: string) => void) => void;
    };
  }
}

// --- Renderer Entry Point ---

// 1) Gather all game entry modules (each should export `init(container: HTMLElement)`)
type GameModule = { init(container: HTMLElement): void };
const games = import.meta.glob('@games/*/app.ts') as Record<string, () => Promise<GameModule>>;

// You can remove or comment out this console.log now
// console.log('Available game keys from import.meta.glob:', Object.keys(games));

// 2) Load + initialize a game by its folder name
function loadGame(name: string) {
  // Construct the key to match the output of import.meta.glob
  const key = `../../../../games/${name}/app.ts`;
  const loader = games[key];
  const appDiv = document.getElementById('app');
  if (!appDiv) {
    console.error('Could not find <div id="app"> in index.html');
    return;
  }
  appDiv.innerHTML = ''; // clear old content

  if (!loader) {
    appDiv.innerText = `Game '${name}' not found.`;
    return;
  }

  loader()
    .then((mod) => {
      if (typeof mod.init === 'function') {
        mod.init(appDiv);
      } else {
        appDiv.innerText = `Game '${name}' has no \`init()\` export.`;
      }
    })
    .catch((err: unknown) => {
      console.error(`Error loading game '${name}':`, err);
      appDiv.innerText = `Error loading game '${name}'. See console.`;
    });
}

// 3) On first load, show the default Pixi example
loadGame('pixi-example-basic');

// 4) Listen for File → Open Project… from the main process
window.electronAPI.onProjectOpened((projectPath: string) => {
  // extract just the folder name (must match a key under @games)
  const name = projectPath.split(/[/\\]/).pop()!;
  loadGame(name);
});
