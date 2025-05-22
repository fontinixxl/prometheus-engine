import { app, BrowserWindow, Menu, dialog, shell } from 'electron';
import * as path from 'path';

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload script path:', preloadPath);

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath,
      devTools: true, // Enable DevTools in both dev and prod for debugging
    },
    minWidth: 800,
    minHeight: 600,
  });

  if (isDev) {
    console.log('Development mode, loading from Vite server');
    // Try to connect to Vite dev server with retry logic
    let retries = 0;
    const maxRetries = 5;
    const retryInterval = 1000; // ms

    const loadDevServer = async () => {
      try {
        // Try port 5174 first, then fall back to 5173
        try {
          await mainWindow.loadURL('http://localhost:5174');
        } catch {
          await mainWindow.loadURL('http://localhost:5173');
        }
        console.log('Successfully connected to Vite dev server');
        mainWindow.webContents.openDevTools();
      } catch {
        retries++;
        console.log(`Failed to connect to Vite dev server (attempt ${retries}/${maxRetries})`);

        if (retries < maxRetries) {
          console.log(`Retrying in ${retryInterval / 1000} seconds...`);
          setTimeout(loadDevServer, retryInterval);
        } else {
          console.error('Could not connect to Vite dev server after maximum retries');
          app.quit();
        }
      }
    };

    await loadDevServer();
  } else {
    console.log('Production mode, loading from file system');
    const indexPath = path.join(__dirname, 'index.html');
    console.log('Loading index.html from:', indexPath);
    try {
      await mainWindow.loadFile(indexPath);
      console.log('Successfully loaded index.html');
    } catch (error) {
      console.error('Failed to load index.html:', error);
    }
  }

  // Create application menu
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'Open Project…',
            accelerator: 'CmdOrCtrl+O',
            click: async () => {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
                title: 'Open Prometheus Engine Project',
              });
              if (!canceled && filePaths[0]) {
                mainWindow.webContents.send('project-opened', filePaths[0]);
              }
            },
          },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Documentation',
            click: async () => {
              await shell.openExternal('https://github.com/yourusername/prometheus-engine/docs');
            },
          },
          {
            label: 'Report Issue',
            click: async () => {
              await shell.openExternal('https://github.com/yourusername/prometheus-engine/issues');
            },
          },
        ],
      },
    ]),
  );
}

app.whenReady().then(createWindow);

// Handle macOS window activation behavior
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
