const { contextBridge, ipcRenderer } = require("electron");

// The renderer talks to Firebase directly via the JS SDK (works fine in a
// standard web/Chromium context, no Node integration required). The only
// privileged bridge exposed is the auto-update flow, which needs Node/IPC.
contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  currentVersion: () => ipcRenderer.invoke("update:currentVersion"),
  checkForUpdate: () => ipcRenderer.invoke("update:check"),
  downloadUpdate: () => ipcRenderer.invoke("update:download"),
  quitAndInstall: () => ipcRenderer.invoke("update:install"),
  onUpdateStatus: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("update:status", listener);
    return () => ipcRenderer.removeListener("update:status", listener);
  },
});
