const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url'); // <--- ADDED for robust file path handling

function handleAutoUpdates() {
  if (app.isPackaged) {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: 'DevanshMistry890', 
      repo: 'NeoTally'
    });
    
    // Check for updates on startup
    autoUpdater.checkForUpdatesAndNotify();

    // Log update events (optional, useful for debugging)
    autoUpdater.on('update-available', () => console.log('Update available.'));
    autoUpdater.on('update-downloaded', () => console.log('Update downloaded; installing on quit.'));
  }
}

function createWindow() {
  // Check if the app is running from the packaged executable (production)
  const isPackaged = app.isPackaged; 

  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Load the app based on packaged status
  const startUrl = isPackaged
    ? url.pathToFileURL(path.join(__dirname, '../dist/index.html')).href // Robust production file path
    : 'http://localhost:5173'; // Development server

  win.loadURL(startUrl);

  // Open DevTools ONLY if we are running in the unpacked development environment
  if (!isPackaged) {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    handleAutoUpdates();
  }
});