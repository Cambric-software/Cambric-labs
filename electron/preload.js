/**
 * CAMBRIC LABS - Electron Preload Script
 * 
 * Exposes secure APIs to the renderer process.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Dialog APIs
  openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  
  // File APIs
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('file:write', filePath, content),
  
  // App APIs
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  
  // Menu event listeners
  onMenuNewProject: (callback) => {
    ipcRenderer.on('menu-new-project', callback);
    return () => ipcRenderer.removeListener('menu-new-project', callback);
  },
  onMenuOpenProject: (callback) => {
    ipcRenderer.on('menu-open-project', (event, filePath) => callback(filePath));
    return () => ipcRenderer.removeListener('menu-open-project', callback);
  },
  onMenuSaveProject: (callback) => {
    ipcRenderer.on('menu-save-project', callback);
    return () => ipcRenderer.removeListener('menu-save-project', callback);
  },
  onMenuExportProject: (callback) => {
    ipcRenderer.on('menu-export-project', callback);
    return () => ipcRenderer.removeListener('menu-export-project', callback);
  }
});

// Notify renderer that electron is ready
window.addEventListener('DOMContentLoaded', () => {
  window.dispatchEvent(new CustomEvent('electron-ready'));
});
