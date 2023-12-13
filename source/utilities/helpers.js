// models
const ClientBill = require('../../models/ClientBill');
const Client = require('../../models/Client');

const {BrowserWindow} = require('electron');
const fsPromises = require('fs').promises;
const {months} = require('./constants');
const {exec} = require('child_process');
const winston = require('winston');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * The function throws an error and logs it, with an optional custom message.
 *
 * @param {Error} error - The error parameter is the error object that you want to log and throw.
 * @param {string|null} customMessage - The customMessage parameter is
 * an optional parameter that allows you to provide a custom error message.
 * @return {Error} If no custom message is provided,
 * the error message will be the same as the original error.
 *
 * ```
 * new Error(customMessage ?? error)
 * ```
 */
function throwAndLogError(error, customMessage = null) {
  console.log(error);
  return customMessage ? new Error(customMessage) : error;
}

/**
 * Formats a date to a string in 'MMM DD, YYYY' format.
 * @function
 * @param {Date | string | null | undefined} date - The date to be formatted.
 * @param {string} length - The length of the month display.
 * It can be 'short' or 'long'. Default is 'short'.
 * @return {string} - The formatted date string or an empty string if the input is falsy.
 */
function formatDate(date, length = 'short') {
  return date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: length,
    day: 'numeric'
  }) : null;
}

/**
 * Emits an event to the sender with a specified key and value.
 * @function
 * @param {Electron.IpcMainInvokeEvent} event - The event object from Electron.
 * @param {string} value - The value to be sent with the event.
 * @param {string|null} key - The key to identify the event.
 * default='toast'
 * @throws {Error} For missing arguments
 */
function emitEvent(event, value, key='toast') {
  if (!key && !value) {
    throw new Error('Cannot emit a blank message');
  }

  if (key && !value) {
    throw new Error('An emit even key must have a value');
  }

  if (!event) {
    console.log('Missing event for emit');
    return;
  }

  event.sender.send(key, value);
}

/**
 * Joins and resolves paths.
 *
 * @param {(string|Array<string>)} resolveParams - The path or paths to resolve.
 * @param {(string|Array<string> )} joinParams - The path or paths to join.
 * @return {string} The joined and resolved path.
 */
function joinAndResolve(resolveParams, joinParams) {
  return path.join(path.resolve(...[].concat(resolveParams)), ...[].concat(joinParams));
}

/**
 * Generates the next account/bill number based on the last client's account/bill number.
 * @async
 * @function
 * @param {String} type - checks the type of function that user it.
 * @return {Promise<string>} The generated account number.
 */
async function generateNextAccountOrBillNumber(type) {
  const isClient = type === 'Client';

  const latestRecord = isClient ?
await Client.findOne({order: [['createdAt', 'DESC']]}):
await ClientBill.findOne({order: [['createdAt', 'DESC']]});

  if (!latestRecord) {
    return isClient ? '0000-AA' : '000000000-AAAA';
  }

  let nextNumber = isClient ? '0000' : '000000000';
  let nextLetter = isClient ? 'AA' : 'AAAA';

  const latestNumber = isClient ? latestRecord.accountNumber : latestRecord.billNumber;
  const numberSection = parseInt(latestNumber.split('-')[0], 10);
  const letterSection = latestNumber.split('-')[1];

  if (numberSection === 9999 || numberSection === 999999999) {
    const lastLetterCharCode = letterSection.charCodeAt(letterSection.length - 1);

    if (lastLetterCharCode !== 90) {
      nextLetter = 'A' + String.fromCharCode(lastLetterCharCode + 1);
    }
  } else {
    const clientZeros = isClient ? '0000' : '000000000';
    nextNumber = String(clientZeros + (numberSection + 1)).slice(-nextNumber.length);
    nextLetter = letterSection;
  }

  return [nextNumber, nextLetter].join('-');
}

/**
 * Takes a date as input and returns the corresponding month in uppercase.
 * @param {Date} date - The `date` parameter is a string representing a
 * date in a valid format, such as
 * "2021-01-15" or "January 15, 2021".
 * @return {string} the uppercase name of the month corresponding to the given date.
 */
function getMonth(date) {
  if (!date) return null;
  const formattedDate = new Date(date);
  const monthIndex = formattedDate.getMonth();
  return months[monthIndex].toUpperCase();
};

/**
 * Prints a receipt using the provided HTML template and saves it as a PDF file.
 * @function
 * @async
 * @param {string} template - The HTML template for the receipt
 * @param {string} fileName - The name to use when saving the PDF file
 * @param {Electron.IpcMainInvokeEvent} event - Event passed from a handler
 * @throws {Error} - Throws an error if the filename is missing,
 * saving the file fails, or printing the receipt fails
 */
async function printReceipt(template, fileName, event) {
  if (!fileName) throw new Error('Missing filename');

  const window = new BrowserWindow({show: false});
  const receiptsFolderPath = path.join(os.homedir(), `receipts`);

  if (!fs.existsSync(receiptsFolderPath)) {
    fs.mkdirSync(receiptsFolderPath);
  }

  if (!fs.existsSync(receiptsFolderPath)) {
    throw new Error('Cannot create receipts folder');
  }

  const filePath = path.join(receiptsFolderPath, `${fileName}.pdf`);
  await window.loadURL('data:text/html;charset=utf-8,' + encodeURI(template));

  const fileSaved = saveToPdf(window, filePath, event);

  if (!fileSaved) {
    throw new Error('Failed in saving receipt');
  }

  emitEvent(event, 'Attempting to open file');
  openFile(filePath);
}

/**
 * The function `saveToPdf` saves the contents of a window as a PDF file
 * @param {Electron.window} window - Represents the browser window object
 * @param {string} filePath - path where the file will be saved
 * It is used to display the save dialog and access the web contents of the window
 * @param {Electron.IpcMainInvokeEvent|null} event - Event passed from a handler
 * @return {boolean} true if the file has been saved else false
 */
async function saveToPdf(window, filePath, event=null) {
  const data = await window.webContents.printToPDF({pageSize: 'Letter'});
  let saved = false;
  let message = `${filePath} saved`;

  try {
    await fsPromises.writeFile(filePath, data);
    saved = true;
  } catch (error) {
    console.log(!!event, error.code);
    if (event && error.code === 'EBUSY') {
      emitEvent(event, 'A different pdf file might have been opened');
    }
    message = `Save ${error}`;
    saved = false;
  }

  console.log(message);
  return saved;
}

/**
 * Opens a file using the default associated program based on the operating system.
 * @function
 * @async
 * @param {string} filePath - The path to the file to be opened.
 * @throws {Error} - Throws an error if no file path is provided,
 * the file is not found, or if there's an issue opening the file.
 */
async function openFile(filePath) {
  // Check if filePath is null
  if (!filePath) {
    throw new Error('No file path provided');
  }

  const fileExists = fs.existsSync(filePath);

  // Check if file exists
  if (!fileExists) {
    throw new Error('File not found');
  }

  // Determine the command to use based on the operating system
  let command;
  switch (os.platform()) {
    case 'win32':
      command = `start "" "${filePath}"`;
      break;
    case 'darwin':
      command = `open "${filePath}"`;
      break;
    case 'linux':
      command = `xdg-open "${filePath}"`;
      break;
    default:
      throw new Error('Unsupported platform');
  }

  // Execute the command
  exec(command, error => {
    if (error) {
      console.log(error);
      throw new Error(`Failed to open file ${filePath}`);
    } else {
      console.log(`File ${filePath} opened successfully`);
    }
  });
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({filename: 'error.log', level: 'error'})
  ]
});

module.exports = {
  generateNextAccountOrBillNumber,
  throwAndLogError,
  joinAndResolve,
  printReceipt,
  formatDate,
  emitEvent,
  openFile,
  getMonth,
  logger
};
