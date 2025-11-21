const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url'); // <--- ADDED for robust file path handling

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
  }
});