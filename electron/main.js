const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron');
const path = require('path');
const keytar = require('keytar');
const Store = require('electron-store').default;

const store = new Store();

const SERVICE = 'sistema-inventario-app';
const ACCOUNT = 'auth-token';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 680,
    maximizable: true,
    show: false,
    title: 'Electro POS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: false,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.webContents.closeDevTools();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
    const isDevToolsShortcut =
      input.key === 'F12' || (input.control && input.shift && input.key.toUpperCase() === 'I');

    if (isDevToolsShortcut) {
      event.preventDefault();
    }
  });

  mainWindow.loadFile(
    path.join(__dirname, '../dist/sistema-inventario-frontend/browser/index.html'),
  );

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// --- IPC handlers ---
ipcMain.handle('auth:saveToken', async (_event, token) => {
  await keytar.setPassword(SERVICE, ACCOUNT, token);
});

ipcMain.handle('auth:getToken', async () => {
  return await keytar.getPassword(SERVICE, ACCOUNT);
});

ipcMain.handle('auth:deleteToken', async () => {
  await keytar.deletePassword(SERVICE, ACCOUNT);
});

ipcMain.handle('settings:saveTheme', async (_, theme) => {
  store.set('theme', theme);
});

ipcMain.handle('settings:getTheme', async () => {
  return store.get('theme', 'light');
});

// --- Ciclo de vida de la app ---
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});
