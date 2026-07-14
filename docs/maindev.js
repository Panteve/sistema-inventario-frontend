const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const keytar = require('keytar');
const Store = require('electron-store').default;

const store = new Store();

const SERVICE = 'sistema-inventario-app';
const ACCOUNT = 'auth-token';

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 680,
    show: false,
    title: "Electro POS",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.once("ready-to-show", () => {
    win.show();
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) shell.openExternal(url);
    return { action: "deny" };
  });
  win.on("closed", () => {
    mainWindow = null;
  });
  win.loadURL('http://localhost:8080');
}

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

app.whenReady().then(createWindow);