/* eslint-disable max-len */
// utilties
const {formatDate, joinAndResolve, emitEvent} = require('./helpers');
const Response = require('./response');

const {ipcMain, dialog} = require('electron');
const ExcelJS = require('exceljs');
const fs = require('fs-extra');
const path = require('path');

// models
const ClientPhoneNumber = require('../../models/ClientPhoneNumber');
const UserPhoneNumber = require('../../models/UserPhoneNumber');
const PartialPayment = require('../../models/PartialPayment');
const ClientAddress = require('../../models/ClientAddress');
const UserAddress = require('../../models/UserAddress');
const ClientFile = require('../../models/ClientFile');
const ClientBill = require('../../models/ClientBill');
const Client = require('../../models/Client');
const User = require('../../models/User');

ipcMain.handle('export-record', async (event, args) => {
  const {id} = args;
  return await exportRecord(id, event);
});

const rowColor = backgroundColor => {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: backgroundColor
    }
  };
};

const thinCellBorder = {
  top: {style: 'thin'},
  left: {style: 'thin'},
  bottom: {style: 'thin'},
  right: {style: 'thin'}
};

/**
 * Adds a new row to a worksheet with specified cell values, background color, and optional inclusion of empty cells.
 * @function
 * @param {Worksheet} worksheet - The worksheet to which the row will be added.
 * @param {string[]} cellValues - An array of cell values for the new row.
 * @param {string} backgroundColor - The background color for the cells in the new row.
 * @param {boolean} [includeEmptyCells=true] - Indicates whether to include empty cells in the row.
 */
function newRow(worksheet, cellValues, backgroundColor, includeEmptyCells = true) {
  const tableRowCellData = worksheet.addRow(cellValues);

  cellValues.forEach((value, columnIndex) => {
    if (value !== '' || includeEmptyCells) {
      const cell = tableRowCellData.getCell(columnIndex + 1);
      cell.fill = rowColor(backgroundColor);
      cell.border = thinCellBorder;
    }
  });
}

const askDirectory = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
    title: 'Select Directory for XLSX File'
  });

  return !result.canceled && result.filePaths.length > 0 ? result.filePaths[0] : null;
};

ipcMain.handle('full-user-data', async (event, args) => {
  if (!args.id) {
    return new Response().error('User id not found');
  }

  let user = null;

  try {
    user = await User.findByPk(args.id, {
      include: [
        {
          model: UserPhoneNumber,
          as: 'phoneNumbers',
          attributes: ['phoneNumber']
        },
        {model: UserAddress, as: 'mainAddress'},
        {model: UserAddress, as: 'presentAddress'}
      ]
    });
  } catch (error) {
    console.log(error);
    return new Response().error('User not found');
  }

  return user;
});

const retrieveClientData = async id => {
  if (!id) return new Response().error('Client id if not found');

  let client = null;

  try {
    client = await Client.findByPk(id, {
      include: [
        {
          model: ClientPhoneNumber,
          as: 'phoneNumbers',
          attributes: ['phoneNumber'],
          order: [
            ['createdAt', 'DESC']
          ]
        },
        {
          model: ClientAddress,
          as: 'mainAddress'
        },
        {
          model: ClientAddress,
          as: 'presentAddress'
        },
        {
          model: ClientFile,
          as: 'files'
        },
        {
          model: ClientBill,
          as: 'bills',
          include: [
            {
              model: PartialPayment,
              as: 'partialPayments',
              order: [
                ['createdAt', 'DESC']
              ]
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.log(error);
    return new Response().error('Client not found');
  }

  return new Response().okWithData('clientData', client);
};

/**
 * Exports client data to an Excel file, including client details and
 * account history, and moves associated files to a specified directory.
 *
 * @param {number} id - The unique identifier of the client whose data will be exported.
 * @param {Electron.IpcMainInvokeEvent} event - The registered event listener
 * for the event in the Electron main process which may
 * come from a handler.
 * @param {boolean} [move=false] - If the files to be exported must be moved.
 * Default to false, which means that files will be copied.
 *
 * @return {Promise<Response>} a custom response promise.
 */
async function exportRecord(id, event, move=false) {
  if (!id) return new Response().error('Client id is required for export');

  try {
    const getClientData = await retrieveClientData(id);

    if (getClientData.status === 'failed' || !getClientData.clientData) {
      return new Response().error(getClientData.toast[0]);
    }

    const client = getClientData.clientData;

    const {
      fullName,
      age,
      relationshipStatus,
      accountNumber,
      meterNumber,
      birthDate,
      email,
      occupation
    } = client;

    const presentAddress = client.presentAddress ?? '';
    const mainAddress = client.mainAddress ?? '';
    const phoneNumber = client.phoneNumbers ? client.phoneNumbers[0].phoneNumber : '';
    const bills = client.bills;

    const directoryPath = await askDirectory();

    if (!directoryPath) return new Response().error('Directory selection canceled');

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(`${fullName}'s Data`);
    emitEvent(event, 'export', 'Creating new excel worksheet');

    worksheet.properties.defaultColWidth = 25.67;
    worksheet.properties.defaultRowHeight = 27.75;

    worksheet.addRow([]);
    worksheet.addRow(['Client Details']);
    worksheet.addRow([]);

    worksheet.addRow(['', 'Account Number', 'Meter Number', 'Full Name', 'Relationship Status', 'Birth Date', 'Age', 'Email', 'Occupation', 'Present Address', 'Main Address', 'Phone Numbers']);
    worksheet.addRow(['', accountNumber, meterNumber, fullName, relationshipStatus, formatDate(birthDate), age, email, occupation, presentAddress.fullAddress, mainAddress.fullAddress, phoneNumber ? ['0', phoneNumber].join('') : '']);

    // Additional data
    if (bills) {
      worksheet.addRow([]);
      worksheet.addRow(['Account History']);
      worksheet.addRow([]);

      let currentIndex = 0;

      const rowColors = ['FFFFE0', 'FFFACD', 'FFE4B5', 'FFDAB9'];
      const colorIndex = currentIndex % rowColors.length;
      const currentColor = rowColors[colorIndex];

      const clientBillHeaders = ['', 'Bill Number', 'First Reading', 'Second Reading', 'Consumption', 'Bill Amount', 'Payment Status', 'Paid Amount', 'Remaining Balance', 'Excess', 'Payment Date', 'Penalty', 'Due Date', 'Disconnection Date'];
      newRow(worksheet, clientBillHeaders, currentColor);
      emitEvent(event, 'export', 'Adding bills data');

      bills.forEach((bill, index) => {
        currentIndex = index;

        const {billNumber, firstReading, secondReading, consumption, total, status, amountPaid, balance, excess, penalty, dueDate, disconnectionDate, partialPayments} = bill;

        billRow = ['', billNumber, firstReading ?? 0, secondReading ?? 0, consumption ?? 0, total ?? 0, status, amountPaid ?? 0, balance ?? 0, excess ?? 0, penalty ?? 0, formatDate(dueDate), formatDate(disconnectionDate), ''];

        worksheet.addRow([]);

        newRow(worksheet, billRow, currentColor);

        if (partialPayments.length > 0) {
          worksheet.addRow([]);

          const partialPaymentHeaders = ['', '', '', '', '', 'Partial Payments', 'Amount Paid', 'Payment Date'];
          newRow(worksheet, partialPaymentHeaders, currentColor, false);

          // Add partial payment data rows with background color
          partialPayments.forEach(partialPayment => {
            const {amountPaid, paymentDate} = partialPayment;
            const rowValues = ['', '', '', '', '', '', amountPaid, paymentDate ? formatDate(paymentDate) : ''];
            newRow(worksheet, rowValues, currentColor, false);
          });
        }
      });
    }

    worksheet.eachRow({includeEmpty: false}, row => {
      row.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    const firstColumn = worksheet.getColumn(1);
    firstColumn.width = 10;

    firstColumn.eachCell({includeEmpty: true}, cell => {
      cell.style = {};
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };
    });

    const fullDirectoryPath = `${directoryPath}\\${fullName}'s record`;

    fs.ensureDir(fullDirectoryPath, error => {
      if (error) {
        console.log(error);
        return new Response().error(`Error in creating new folder for ${fullName}'s export data`);
      }
    });

    // Write the workbook to a file
    await workbook.xlsx.writeFile(`${fullDirectoryPath}\\${fullName}'s account history.xlsx`);

    if (client.files.length > 0) {
      const destinationFilePath = `${fullDirectoryPath}\\Files`;

      fs.ensureDir(destinationFilePath, error => {
        if (error) {
          console.log(error);
          return new Response().error(`Error in creating files folder for ${fullName}'s export data`);
        }
      });

      emitEvent(event, 'export', 'Moving client files');
      const filesToMove = client.files.map(async file => {
        const fileName = [client.fullName, file.name].join(' ');
        const currentFilePath = joinAndResolve([__dirname, '../../source/assets/files/'], fileName);
        const newFilePath = path.join(`${destinationFilePath}`, file.name);

        const fileExists = await fs.pathExists(currentFilePath).catch(() => false);

        if (!fileExists) {
          console.log(`File ${fileName} from ${currentFilePath} cannot be found`);
          return;
        }

        if (move) {
          await fs.move(currentFilePath, newFilePath);
        } else {
          await fs.copy(currentFilePath, newFilePath);
        }
      });

      await Promise.all(filesToMove);
    }

    return new Response().ok('Client data exported');
  } catch (error) {
    console.log(error);
    return new Response().error('Failed to export client data');
  }
}

module.exports = exportRecord;
