const { app, BrowserWindow, Menu, ipcMain } = require('electron'); 
const { autoUpdater } = require('electron-updater');
const path = require('path');
const url = require('url');
const log = require('electron-log'); 

// 1. Setup Logging
log.transports.file.level = 'info'; 
log.info('App starting...');

// Function that runs when the 'Check for Updates' menu item is clicked
function manualCheckForUpdates(win) {
    if (!app.isPackaged) {
        log.info('Manual Check for Updates skipped: Not packaged.');
        win.webContents.send('update-status', 'skipped'); 
        return;
    }

    log.info('Manual check initiated...');
    autoUpdater.logger = log; 
    autoUpdater.removeAllListeners('update-available');
    autoUpdater.removeAllListeners('update-not-available');
    autoUpdater.removeAllListeners('error');
    autoUpdater.removeAllListeners('update-downloaded');
    
    // Configure where to check
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'DevanshMistry890', 
        repo: 'NeoTally'
    });
    
    // Set up Listeners to send status to the Renderer (App.tsx)
    autoUpdater.on('update-available', () => {
        log.info('Update available. Downloading...');
        win.webContents.send('update-status', 'available'); 
    });
    
    autoUpdater.on('update-not-available', () => {
        log.info('No update available.');
        win.webContents.send('update-status', 'not-available'); 
    });

    autoUpdater.on('update-downloaded', () => {
        log.info('Update downloaded; installing on quit.');
        win.webContents.send('update-status', 'downloaded'); 
    });

    autoUpdater.on('error', (err) => {
        log.error('Update check failed:', err);
        win.webContents.send('update-status', `error:${err.message}`); 
    });
    
    // Trigger the check and send a status immediately
    autoUpdater.checkForUpdates();
    win.webContents.send('update-status', 'checking'); 
}

function createAppMenu(mainWindow) {
    const template = [
        // 1. FILE Menu
        { label: 'File', submenu: [{ label: 'Exit', role: 'quit' }] },
        
        // 2. EDIT Menu
        { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }] },
        
        // 3. WINDOW Menu (Standard OS controls + DevTools)
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                // Manual DevTools Toggle
                { role: 'toggledevtools' } 
            ]
        },
        
        // 4. HELP Menu
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates',
                    click() {
                        manualCheckForUpdates(mainWindow); 
                    }
                },
                { type: 'separator' },
                // ABOUT Dialogue
                {
                    label: 'About NeoTally',
                    click() {
                        const { dialog } = require('electron');
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About NeoTally',
                            message: 'NeoTally',
                            detail: `Version: ${app.getVersion()}\nMade by Shivam Mistry`
                        });
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
    
    // DEVTOOLS IS NOW MANUAL VIA MENU
    // The previous automatic check is removed here

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