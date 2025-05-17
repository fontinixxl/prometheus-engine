import { app, BrowserWindow, Menu, dialog } from 'electron';
import * as path from 'path';

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: true, // Recommended: true
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    console.log('Development mode, loading from Vite server');
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Production mode, loading from file system');
    // Corrected path for production build
    await mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'Open Project…',
            click: async () => {
              const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
              });
              if (!canceled && filePaths[0]) {
                mainWindow.webContents.send('project-opened', filePaths[0]);
              }
            },
          },
        ],
      },
    ]),
  );
}

app.whenReady().then(createWindow);
