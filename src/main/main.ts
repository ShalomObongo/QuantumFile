import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setupIpcHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  try {
    // Set up IPC handlers before loading the window
    await setupIpcHandlers(mainWindow);

    // Load the index.html file from the webpack output directory
    const indexPath = path.join(__dirname, '../renderer/index.html');
    console.log('Loading index from:', indexPath);
    await mainWindow.loadFile(indexPath);

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  } catch (error) {
    console.error('Error during window creation:', error);
    app.quit();
  }
}

// Handle app ready
app.whenReady().then(createWindow).catch((error) => {
  console.error('Failed to create window:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 