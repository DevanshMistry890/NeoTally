const { app, BrowserWindow, Menu, ipcMain } = require('electron'); // ADD Menu, ipcMain
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const log = require('electron-log'); // Assuming electron-log is installed

// 1. Setup Logging for Main Process
log.transports.file.level = 'info';
log.info('App starting...');

// Function that runs when the 'Check for Updates' menu item is clicked
function manualCheckForUpdates(win) {
    if (!app.isPackaged) {
        log.info('Manual Check for Updates skipped: Not packaged.');
        return;
    }

    log.info('Manual check initiated...');
    // Set logging to electron-log so we can see autoUpdater messages
    autoUpdater.logger = log; 
    
    // Clear old listeners before checking to prevent memory leaks/duplicate calls
    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('update-not-available');
    autoUpdater.removeAllListeners('error');
    
    // Configure where to check
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'DevanshMistry890', 
        repo: 'NeoTally'
    });

    // 2. Set up Listeners to log status to the main process console
    autoUpdater.on('update-available', () => {
        log.info('Update available. Downloading...');
        // We will send a message to the Renderer later to show a notification
    });
    
    autoUpdater.on('update-not-available', () => {
        log.info('No update available.');
    });

    autoUpdater.on('update-downloaded', () => {
        log.info('Update downloaded; installing on quit.');
    });

    autoUpdater.on('error', (err) => {
        log.error('Update check failed:', err);
    });
    
    // 3. Trigger the check
    autoUpdater.checkForUpdates();
}

function createAppMenu(mainWindow) {
    const template = [
        // Basic menus
        { label: 'File', submenu: [{ label: 'Exit', role: 'quit' }] },
        { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }] },
        
        // Help menu with update check
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates',
                    // This calls the update function when the user clicks the menu item
                    click() {
                        manualCheckForUpdates(mainWindow); 
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

function createWindow() {
    const isPackaged = app.isPackaged; 

    const win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    const startUrl = isPackaged
        ? url.pathToFileURL(path.join(__dirname, '../dist/index.html')).href 
        : 'http://localhost:5173'; 

    win.loadURL(startUrl);

    if (!isPackaged) {
        win.webContents.openDevTools({ mode: 'detach' });
    }
    
    // Return the window object so we can use it in other functions
    return win; 
}

// APP LIFECYCLE HANDLERS
app.whenReady().then(() => {
    const mainWindow = createWindow();
    createAppMenu(mainWindow);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        const mainWindow = createWindow();
        createAppMenu(mainWindow);
    }
});