const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveToken: (token) => ipcRenderer.invoke('auth:saveToken', token),
  getToken: () => ipcRenderer.invoke('auth:getToken'),
  deleteToken: () => ipcRenderer.invoke('auth:deleteToken'),
  saveTheme: (theme) => ipcRenderer.invoke('settings:saveTheme', theme),
  getTheme: () => ipcRenderer.invoke('settings:getTheme'),
});
