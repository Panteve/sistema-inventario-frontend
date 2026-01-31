const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const keytar = require('keytar');

const SERVICE = 'sistema-inventario-app';
const ACCOUNT = 'auth-token';

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:4200');
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

app.whenReady().then(createWindow);

