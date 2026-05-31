const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lockAPI', {
  getFingerprint: () => ipcRenderer.invoke('license:getFingerprint'),
  activate: (jsonStr) => ipcRenderer.invoke('license:activate', jsonStr),
  onReason: (callback) => ipcRenderer.on('lock:reason', (_event, value) => callback(value)),
});
