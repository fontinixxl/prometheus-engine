import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

// polyfill __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({ width: 1024, height: 768 });
  // main.js & index.html now side by side under dist/
  const htmlPath = path.join(__dirname, 'index.html');
  console.log('Loading from', htmlPath);
  win.loadFile(htmlPath);
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
