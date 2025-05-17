import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onProjectOpened: (cb: (projectPath: string) => void) =>
    ipcRenderer.on('project-opened', (_e, projectPath) => cb(projectPath)),
});
