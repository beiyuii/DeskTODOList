const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAlwaysOnTop: () => ipcRenderer.invoke('get-always-on-top'),
    toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
    setAlwaysOnTop: (alwaysOnTop) => ipcRenderer.invoke('set-always-on-top', alwaysOnTop),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    toggleWindow: () => ipcRenderer.invoke('toggle-window'),
    quitApp: () => ipcRenderer.invoke('quit-app')
});
