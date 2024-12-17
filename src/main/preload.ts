import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  selectFolder: async () => {
    return await ipcRenderer.invoke('select-folder');
  },
  applyChanges: async (operations: any) => {
    return await ipcRenderer.invoke('apply-changes', operations);
  },
  restoreBackup: async (backupPath: string) => {
    return await ipcRenderer.invoke('restore-backup', backupPath);
  },
  saveApiKey: async (apiKey: string) => {
    return await ipcRenderer.invoke('save-api-key', apiKey);
  },
  getApiKey: async () => {
    return await ipcRenderer.invoke('get-api-key');
  },
  readFile: async (filePath: string) => {
    return await ipcRenderer.invoke('read-file', filePath);
  },
  extractText: async (data: { data: number[], type: string }) => {
    return await ipcRenderer.invoke('extract-text', data);
  }
}); 