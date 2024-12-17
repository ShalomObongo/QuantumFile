import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as path from 'path';
import { FileManager } from './fileManager';
import * as fs from 'fs';
import mammoth from 'mammoth';

const Store = require('electron-store');

export interface FileDetails {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface FolderContents {
  folderPath: string;
  files: FileDetails[];
}

export interface FileOperation {
  sourcePath: string;
  destinationPath: string;
}

const store = new Store({
  name: 'settings',
  encryptionKey: 'your-encryption-key',
});

export async function setupIpcHandlers(mainWindow: BrowserWindow) {
  const fileManager = new FileManager();

  // Folder selection and reading
  ipcMain.handle('select-folder', async () => {
    try {
      const result = dialog.showOpenDialogSync(mainWindow, {
        properties: ['openDirectory'],
        buttonLabel: 'Select Folder'
      });

      if (!result || result.length === 0) {
        return null;
      }

      const folderPath = result[0];
      console.log('Selected folder:', folderPath);
      return await fileManager.scanFolder(folderPath);
    } catch (error) {
      console.error('Error selecting folder:', error);
      throw error;
    }
  });

  // Apply file changes
  ipcMain.handle('apply-changes', async (_event, operations: FileOperation[]) => {
    try {
      // Validate changes first
      const isValid = await fileManager.validateChanges(operations);
      if (!isValid) {
        throw new Error('Validation failed');
      }

      // Create backup before applying changes
      const backupPath = await fileManager.createBackup(operations);

      // Apply changes
      await fileManager.applyChanges(operations);

      return { 
        success: true,
        backupPath 
      };
    } catch (error) {
      console.error('Error applying changes:', error);
      throw error;
    }
  });

  // Restore from backup
  ipcMain.handle('restore-backup', async (_event, backupPath: string) => {
    try {
      await fileManager.restoreFromBackup(backupPath);
      return { success: true };
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  });

  // Save API key securely
  ipcMain.handle('save-api-key', async (_event, apiKey: string) => {
    try {
      store.set('geminiApiKey', apiKey);
      return { success: true };
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  });

  // Get API key
  ipcMain.handle('get-api-key', async () => {
    try {
      return store.get('geminiApiKey', null);
    } catch (error) {
      console.error('Error getting API key:', error);
      throw error;
    }
  });

  // Add to existing IPC handlers
  ipcMain.handle('read-file', async (_event, filePath: string) => {
    try {
      const buffer = await fs.promises.readFile(filePath);
      const isText = filePath.match(/\.(txt|md|js|ts|html|css|json|xml)$/i);
      
      return {
        data: buffer,
        text: isText ? buffer.toString('utf-8') : null
      };
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });

  // Add to existing IPC handlers
  ipcMain.handle('extract-text', async (_event, { data, type }) => {
    try {
      const buffer = Buffer.from(data);
      
      if (type === '.docx') {
        const result = await mammoth.extractRawText({ buffer });
        return { text: result.value };
      }
      
      // Add handlers for other document types as needed
      return { text: null };
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  });
} 