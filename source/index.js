/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
const {connectionStatusTypes} = require('./utilities/constants.js');
const {emitEvent, logger} = require('./utilities/helpers.js');
const {app, BrowserWindow, ipcMain} = require('electron');
const {db} = require('./utilities/sequelize.js');
const session = require('./utilities/session.js');
const {resolve, join} = require('path');
const fs = require('fs-extra');

// views
require('./pages/client-builder/process/views.js');
require('./pages/authentication/process/views.js');
require('./pages/clients/process/views.js');
require('./pages/billing/process/views.js');
require('./pages/profile/process/views.js');
require('./utilities/export.js');

const ClientConnectionStatus = require('../models/ClientConnectionStatus');
const ClientPhoneNumber = require('../models/ClientPhoneNumber.js');
const UserPhoneNumber = require('../models/UserPhoneNumber');
const PartialPayment = require('../models/PartialPayment');
const RecoveryCode = require('../models/RecoveryCode.js');
const ClientAddress = require('../models/ClientAddress');
const UserAddress = require('../models/UserAddress');
const ClientFile = require('../models/ClientFile');
const ClientBill = require('../models/ClientBill');
const Client = require('../models/Client');
const User = require('../models/User');

/**
 * Deletes all files from the given path except for stated in array of filenames
 * @param {string} path - The path to the directory
 * @param {Array<string>|null} exceptFileNames - Array of files to be excempted
 */
function deleteAll(path, exceptFileNames=null) {
  const pathDoesntExists = !fs.pathExists(path);
  if (pathDoesntExists) {
    console.log(`${path} does not exist. Cannot delete it's files.`);
    return;
  }

  const folder = fs.readdirSync(path);

  if (folder.length > 0) {
    folder.forEach(file => {
      const fileIsExempted = exceptFileNames ? exceptFileNames.includes(file) : false;
      if (fileIsExempted) return;

      const filePath = join(path, file);
      const fileExists = fs.pathExistsSync(filePath);
      if (fileExists) fs.unlinkSync(filePath);
    });
  }
}

/**
 * Initializes the database connection and synchronizes models.
 * @async
 * @function
 * @return {Promise<void>} - A promise indicating the success or failure of the initialization.
 */
async function initializeDatabase() {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');

    await db.sync({force: true});
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

const clientsProfileFolderPath = resolve(__dirname, '../static/images/clients/profile');
const userProfileFolderPath = resolve(__dirname, '../static/images/admin/profile');
const filesFolderPath = resolve(__dirname, '../static/files');

/**
 * WATCH OUT THIS FUNCTION WILL CLEAR ALL THE DATA IN THE DATABASE
 */
function startFresh() {
  // Deleting all files in files folder
  deleteAll(clientsProfileFolderPath, ['user.webp']);
  deleteAll(userProfileFolderPath);
  deleteAll(filesFolderPath);

  // clears session (clears login)
  session.logout();

  // creates new database
  initializeDatabase();
}

/**
 * DELETES ALL DATA BE CAREFUL!
 */
// startFresh();

if (require('electron-squirrel-startup')) {
  app.quit();
}

let icon;

switch (process.platform) {
  case 'win32':
    icon = resolve(__dirname, '../static/images', 'Logo.ico');
    break;
  case 'darwin':
    icon = resolve(__dirname, '../static/images', 'Logo.icns');
    break;
  case 'linux':
    icon = resolve(__dirname, '../static/images', 'Logo.png');
    break;
}

const createWindow = async () => {
  try {
    const mainWindow = new BrowserWindow({
      minHeight: 720,
      minWidth: 1280,
      height: 720,
      width: 1280,
      // fullscreen: true,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: true,
        preload: join(__dirname, 'preload.js')
      },
      icon
    });

    // Menu.setApplicationMenu(null);
    // mainWindow.setMenuBarVisibility(true);
    mainWindow.loadFile(join(__dirname, 'index.html'));
    mainWindow.webContents.openDevTools();

    mainWindow.webContents.on('drop', event => {
      event.preventDefault();
    });

    mainWindow.webContents.on('dragover', event => {
      event.preventDefault();
    });

    const clients = await Client.findAll({
      include: [
        {
          model: ClientBill,
          as: 'bills',
          attributes: [
            'disconnectionDate',
            'createdAt',
            'penalty',
            'dueDate',
            'status',
            'total',
            'id'
          ],
          required: false,
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1
        },
        {
          model: ClientConnectionStatus,
          as: 'connectionStatuses',
          attributes: ['status', 'createdAt'],
          required: false,
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ]
    });

    if (clients && clients.length > 0) {
      const {Connected, DueForDisconnection, Disconnected} = connectionStatusTypes;

      for (const client of clients) {
        const latestBill = client.bills && client.bills.length > 0 ? client.bills[0] : null;
        const hasStatuses = client.connectionStatuses && client.connectionStatuses.length > 0;
        const connectionStatus = hasStatuses ? client.connectionStatuses[0].status : null;

        if (!latestBill) continue;
        if (!connectionStatus) continue;
        if (!latestBill.dueDate) continue;

        if (latestBill.status === 'paid') continue;

        const billDueDate = new Date(latestBill.dueDate);
        const billDisconnectionDate = new Date(latestBill.disconnectionDate);

        const current = {
          day: new Date().getDate(),
          month: new Date().getMonth(),
          year: new Date().getFullYear()
        };

        const due = {
          day: billDueDate.getDate(),
          month: billDueDate.getMonth(),
          year: billDueDate.getFullYear()
        };

        const disconnection = {
          day: billDisconnectionDate.getDate(),
          month: billDisconnectionDate.getMonth(),
          year: billDisconnectionDate.getFullYear()
        };

        // Checks if day and month went over their due.
        const dueDay = current.day >= due.day;
        const dueMonth = current.month >= due.month;

        /**
         * Checks if the due is in the current year or the previous year.
         * This helps avoid due where year is set next year to be recognized
         */
        const dueYear = current.year >= due.year;

        const dayOfDue = dueYear && dueMonth && dueDay;

        if (dayOfDue && connectionStatus === Connected) {
          await ClientConnectionStatus.create({
            clientId: client.id,
            status: DueForDisconnection
          });

          // Adds penalty to current bill
          const penalty = 5;

          await latestBill.update({
            penalty: penalty,
            total: latestBill.total + penalty
          });
        }

        const disconnectionDay = current.day >= disconnection.day;
        const disconnectionMonth = current.month >= disconnection.month;
        const disconnectionYear = current.year >= disconnection.year;

        const dayOfDisconnection = disconnectionYear && disconnectionMonth && disconnectionDay;

        console.log('Current date: ', JSON.stringify(current));
        console.log('Due date: ', JSON.stringify(due));
        console.log('Disconnection date: ', JSON.stringify(disconnection));
        console.log('Day of due: ', dayOfDue);
        console.log('Day of disconnection: ', dayOfDisconnection);

        if (dayOfDisconnection && connectionStatus === DueForDisconnection) {
          await ClientConnectionStatus.create({
            clientId: client.id,
            status: Disconnected
          });
        }
      }
    }

    setTimeout(() => {
      emitEvent('Server started');
    }, 2000);
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('logout', event => {
  session.logout();
});

ipcMain.handle('is_logged_in', async event => {
  return await session.isLoggedIn();
});

ipcMain.handle('current_user', async event => {
  return await session.currentUser();
});

app.on('before-quit', () => {
  session.logout();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

process.on('uncaughtException', error => {
  logger.error(`${new Date().toISOString()} - Uncaught Exception: ${error}`);
});
