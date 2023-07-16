const { app, BrowserWindow } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let icon;
switch (process.platform) {
  case 'win32': icon = path.resolve(__dirname, 'assets/images', 'Logo.ico'); break;
  case 'darwin': icon = path.resolve(__dirname, 'assets/images', 'Logo.icns'); break;
  case 'linux': icon = path.resolve(__dirname, 'assets/images', 'Logo.png'); break;
}

const createWindow = () => {

  const mainWindow = new BrowserWindow({
    minWidth: 720,
    minHeight: 1280,
    width: 1280,
    height: 720,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    // },
    icon
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

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
