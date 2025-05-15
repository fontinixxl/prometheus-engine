import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // 1) wait for Vite’s HMR server
    await win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // 2) load the published build
    win.loadFile(path.join(__dirname, 'index.html'));
  }
}

app.whenReady().then(createWindow);
