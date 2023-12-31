// models
const ClientConnectionStatus = require('../../../../models/ClientConnectionStatus');
const PartialPayment = require('../../../../models/PartialPayment');
const ClientAddress = require('../../../../models/ClientAddress');
const ClientBill = require('../../../../models/ClientBill');
const Client = require('../../../../models/Client');

const {spawn} = require('child_process');
const ExcelJS = require('exceljs');
const {app} = require('electron');
const path = require('path');

// utilities
const {connectionStatusTypes} = require('../../../utilities/constants');
const Response = require('../../../utilities/response');
const {db} = require('../../../utilities/sequelize');
const {
  generateNextAccountOrBillNumber,
  logAndSave,
  formatDate,
  openFile,
  getMonth
} = require('../../../utilities/helpers');

const DOCUMENTS = app.getPath('documents');

/**
 * Retrieves all clients with their bills and connection statuses.
 *
 * @async
 * @param {Object} [whereClause={}] - the where clause for the
 * @return {Promise<Array<Client|null>>} Array of client objects
 * with bills and connection statuses.
 */
async function getAllClients(whereClause) {
  let clients = null;

  try {
    clients = await Client.findAll({
      where: whereClause,
      include: [
        {
          model: ClientBill,
          as: 'bills',
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1,
          include: [
            {
              model: PartialPayment,
              as: 'partialPayments'
            }
          ]
        },
        {
          model: ClientConnectionStatus,
          as: 'connectionStatuses',
          attributes: ['status'],
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ]
    });
  } catch (error) {
    logAndSave(error);
  }

  return clients;
}

/**
 * Retrieves the bill and connection status for a specific client.
 *
 * @async
 * @param {string} clientId - The ID of the client.
 * @return {Promise<Client|null>} Returns the client object
 * with bills and connection status, or null if not found.
 */
async function getBillAndStatus(clientId) {
  let client = null;

  try {
    client = await Client.findByPk(clientId, {
      include: [
        {
          model: ClientBill,
          as: 'bills',
          include: [
            {
              model: PartialPayment,
              as: 'partialPayments'
            }
          ]
        },
        {
          model: ClientConnectionStatus,
          as: 'connectionStatuses',
          attributes: ['status'],
          separate: true,
          order: [['createdAt', 'DESC']],
          limit: 1
        }
      ],
      order: [
        [
          {
            model: ClientBill,
            as: 'bills'
          },
          'createdAt', 'DESC'
        ]
      ]
    });
  } catch (error) {
    logAndSave(error);
  }

  return client;
}

/** Retrieves the bill and connection status for a specific client.
  *
  * @async
  * @param {Object} args  Holds data for clientId and billId
  * @param {string} args.accountId - The ID of the client.
  * @param {string} args.billId - The ID of the clients recent bill.
  * @return {Promise<Client|null>} Returns the client object
  * with bills and connection status, or null if not found.
 */
async function getCompleteData(args) {
  const {accountId, billId} = args;

  let client = null;

  try {
    client = await Client.findByPk(accountId, {
      include: [
        {
          model: ClientBill,
          where: {
            id: billId
          },
          as: 'bills'
        },
        {
          model: ClientAddress,
          as: 'mainAddress'
        }
      ]
    });
  } catch (error) {
    logAndSave(error);
  }

  return client;
}
/**
 * Retrieves a client bill by its ID.
 *
 * @async
 * @param {number} billId - The ID of the client bill to retrieve.
 * @return {Promise<ClientBill|null>} A promise that resolves to the
 * client bill data or null if not found.
 */
async function getBillById(billId) {
  let bill = null;

  try {
    bill = await ClientBill.findByPk(billId);
  } catch (error) {
    logAndSave(error);
  }

  return bill;
}

/**
 * Retrieves the payment excess from the previous bill.
 *
 * @async
 * @param {number} billId - The ID of the current bill.
 * @return {Promise<number|null>} A promise that resolves to the
 * previous bill's payment excess or null if not found.
 */
async function getPreviousBillExcess(billId) {
  let bill = null;

  try {
    bill = await ClientBill.findByPk(billId - 1, {
      attributes: ['excess']
    });

    bill = bill.excess || 0;
  } catch (error) {
    logAndSave(error);
  }

  return bill;
}

/**
 * Creates a new bill for a client with the specified first reading.
 *
 * @async
 * @param {number} clientId - The ID of the client for whom the bill is created.
 * @param {string} monthlyReading - The first reading value.
 * @return {Promise<Response>} A promise that resolves to the
 * created bill or null if creation fails.
 */
async function createNewBill(clientId, monthlyReading) {
  const whereClause = {
    clientId: clientId,
    billNumber: await generateNextAccountOrBillNumber(),
    firstReading: monthlyReading
  };

  try {
    const newBill = await db.transaction(async manager => {
      return await ClientBill.create(whereClause, {transaction: manager});
    });

    return new Response()
        .success()
        .addToast('New client bill created')
        .addObject('billId', newBill.id)
        .getResponse();
  } catch (error) {
    logAndSave(error);
    let message = 'Failed to create new client bill';

    if (error.name === 'SequelizeValidationError') {
      message = error.message.split(': ')[1];
    }
    return new Response().error(message);
  }
}

/**
 * Updates a bill with no payment and sets relevant fields.
 *
 * @async
 * @param {ClientBill} bill - The ClientBill object to update.
 * @return {Promise<Response>} A new Response() object with the result message and status.
 */
async function processZeroPaymentBill(bill) {
  try {
    bill.secondReading = bill.firstReading;
    bill.consumption = 0;
    bill.status = 'paid';
    bill.total = 0;

    await db.transaction(async manager => {
      return await bill.save({transaction: manager});
    });

    return new Response().ok('No payments as water consumption is 0');
  } catch (error) {
    logAndSave(error);
    return new Response().error('Failed to update to zero payment bill');
  }
}

/**
 * Updates a bill with the second reading and performs calculations.
 *
 * @async
 * @param {ClientBill} bill - The bill object to update.
 * @param {string} monthlyReading - The monthly reading value.
 * @return {Promise<Response>} A new Response() object with the result message and status.
 */
async function insertSecondReading(bill, monthlyReading) {
  try {
    const excess = await getPreviousBillExcess(bill.id);

    const hasExcess = excess !== null;
    let message = 'Client bill updated';

    bill.secondReading = monthlyReading;
    bill.consumption = monthlyReading - bill.firstReading;

    const consumptionPrice = bill.consumption * 5;

    bill.total = hasExcess ? consumptionPrice - excess : consumptionPrice;

    if (hasExcess) {
      message = `Client bill updated with ${excess} deduction from previous payment`;
    }

    const currentDate = new Date();
    const twoWeeks = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));

    bill.dueDate = twoWeeks;

    const fiveDaysAfterDue = new Date(twoWeeks.getTime() + (5 * 24 * 60 * 60 * 1000));
    bill.disconnectionDate = fiveDaysAfterDue;

    // const currentDate = new Date();

    // // Set dueDate to 1 minute from now
    // const oneMinute = new Date(currentDate.getTime() + (1 * 60 * 1000));
    // bill.dueDate = oneMinute;

    // // Set disconnectionDate to 3 minutes from now
    // const threeMinutes = new Date(currentDate.getTime() + (3 * 60 * 1000));
    // bill.disconnectionDate = threeMinutes;

    await db.transaction(async manager => {
      return await bill.save({transaction: manager});
    });

    return new Response().ok(message);
  } catch (error) {
    logAndSave(error);
    return new Response().error('Failed on updating clients 2nd reading');
  }
}

/**
 * Retrieves a client bill along with its associated partial payments.
 *
 * @param {number} billId - The ID of the client bill to retrieve.
 * @return {Promise<ClientBill|null>} A promise that resolves to the
 * client bill data with partial payments or null if not found.
 */
async function getBillWithPartialPayments(billId) {
  let client = null;

  try {
    client = await ClientBill.findByPk(billId, {
      include: [
        {
          model: PartialPayment,
          as: 'partialPayments'
        }
      ]
    });
  } catch (error) {
    logAndSave(error);
  }

  return client;
}


/**
 * Calculate the total amount paid from an array of partial payments.
 *
 * @function
 * @param {ClientBill} bill - The bill object containing partialPayments array.
 * @param {Array} bill.partialPayments - An array of partial payments.
 * @param {number} bill.partialPayments.amountPaid - The amount paid in each partial payment.
 * @return {float|number} The total amount paid formatted to two decimal places.
 * @example
 * const bill = {
 *   partialPayments: [
 *     {amountPaid: 50},
 *     {amountPaid: 30},
 *     // ... other partial payments
 *   ]
 *};
 * const totalAmountPaid = calculatePartialPaymentsTotal(bill);
 * console.log('Total Amount Paid:', totalAmountPaid);
 */
function calculatePartialPaymentsTotal(bill) {
  if (!bill.partialPayments) return 0;
  if (bill.partialPayments.length <= 0) return 0;

  let total = 0;

  bill.partialPayments.forEach(payment => {
    if (payment.amountPaid) total += payment.amountPaid;
  });

  return total;
}

/**
 * Handles underpaid bills and updates the bill status accordingly.
 *
 * @param {ClientBill} bill - The bill object.
 * @param {number} totalPartialPayments - Total partial payments received for the bill.
 * @param {number} amountPaid - The amount paid in the current transaction.
 * @return {Promise<Response>} A new Response() object with the result message and status.
 */
async function handleUnderpaidBill(bill, totalPartialPayments, amountPaid) {
  try {
    let message = '';

    const result = await db.transaction(async manager => {
      const client = await ClientConnectionStatus.findOne({
        where: {
          clientId: bill.clientId
        },
        attributes: ['status'],
        order: [
          ['createdAt', 'DESC']
        ]
      }, {transaction: manager});

      const clientStatus = client.status;
      const clientNotConnected = clientStatus !== connectionStatusTypes.Connected;

      const newPaymentAmount = totalPartialPayments + parseFloat(amountPaid);

      if (newPaymentAmount === bill.total) {
        const lastPartialPayment = createNewPartialPayment(bill, amountPaid, manager);

        if (!lastPartialPayment) {
          return new Response().error('Failed on creating bills last partial payment');
        }

        bill.status = 'paid';
        bill.balance = 0;

        message = 'Remaining balance paid';

        if (clientNotConnected) {
          const reconnected = await reconnectClient(bill.clientId, clientStatus, manager);

          if (reconnected) {
            message = 'Remaining balance paid and client reconnected';
          }
        }
      } else if (newPaymentAmount < bill.total) {
        const newPartialPayment = createNewPartialPayment(bill, amountPaid, manager);

        if (!newPartialPayment) {
          return new Response().error(`Failed on creating the bill's last partial payment`);
        }

        bill.balance = bill.total - newPaymentAmount;
        message = 'Remaining balance has been updated';
      } else if (newPaymentAmount > bill.total) {
        const lastPartialPayment = createNewPartialPayment(bill, amountPaid, manager);

        if (!lastPartialPayment) {
          return new Response().error(`Failed on creating the bill's last partial payment`);
        }

        bill.excess = newPaymentAmount - bill.total;
        bill.status = 'overpaid';
        bill.balance = 0;

        message = 'Remaining balance paid and excess amount saved';

        if (clientNotConnected) {
          const reconnected = await reconnectClient(bill.clientId, clientConnectionStatus, manager);

          if (reconnected) {
            message = 'Remaining balance paid, excess saved and client reconnected';
          }
        }
      } else {
        const error = new Error('Invalid payment amount');
        error['type'] = 'payment';
        throw error;
      }

      bill.amountPaid = newPaymentAmount;
      await bill.save({transaction: manager});

      return new Response().ok(message);
    });

    return result;
  } catch (error) {
    logAndSave(error);
    return new Response().error('Something went wrong when processing the bill');
  }
}

/**
 * Handles unpaid bills and updates the bill status accordingly.
 *
 * @param {Object} billQuery - The bill query object.
 * @param {Object} bill - The bill object.
 * @param {number} amountPaid - The amount paid in the current transaction.
 * @param {string} clientId - The ID of the client.
 * @return {Promise<Response>} An new Response() object with the result message and status.
 */
async function handleUnpaidBill(billQuery, bill, amountPaid, clientId) {
  try {
    let message = '';

    const result = await db.transaction(async manager => {
      const client = await ClientConnectionStatus.findOne({
        where: {
          clientId: clientId
        },
        attributes: ['status'],
        order: [
          ['createdAt', 'DESC']
        ]
      }, {transaction: manager});

      const clientConnectionStatus = client.status;
      const clientNotConnected = clientConnectionStatus !== connectionStatusTypes.Connected;

      if (bill.total === amountPaid) {
        billQuery.amountPaid = billQuery.total;
        billQuery.status = 'paid';
        billQuery.balance = 0;

        message = 'Bill successfully paid';

        if (clientNotConnected) {
          const reconnected = await reconnectClient(clientId, clientConnectionStatus, manager);

          if (reconnected) {
            message = 'Bill paid and client reconnected';
          }
        }
      } else if (amountPaid < bill.total) {
        const firstPartialPayment = await createNewPartialPayment(billQuery, amountPaid, manager);

        if (!firstPartialPayment) {
          return new Response().error('Failed creating new partial payment');
        }

        billQuery.balance = billQuery.total - amountPaid;
        billQuery.amountPaid = amountPaid;
        billQuery.status = 'underpaid';

        message = 'New remaining balance has been set';
      } else if (amountPaid > bill.total) {
        billQuery.excess = amountPaid - billQuery.total;
        billQuery.amountPaid = billQuery.total;
        billQuery.status = 'overpaid';

        message = 'Bill paid and excess saved';

        if (clientNotConnected) {
          const reconnected = await reconnectClient(clientId, clientConnectionStatus, manager);

          if (reconnected) {
            message = 'Bill paid, excess recorded and client reconnected';
          }
        }
      } else {
        const error = new Error('Invalid payment amount');
        error['type'] = 'payment';
        throw error;
      }

      await billQuery.save({transaction: manager});

      // returns from the transaction and will be assigned to new Response()
      return new Response().ok(message);
    });

    return result;
  } catch (error) {
    console.log(error.stack);

    const message = error.type === 'payment' ? error.message : 'Failed to process unpaid bill';
    return new Response().error(message);
  }
}

/**
 * Creates a new partial payment record.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} amountPaid - The payment amount for the current payment.
 * @param {Transaction|null} manager - Optional Sequelize transaction manager.
 * @return {Promise<PartialPayment|null>} A promise that resolves to the
 * created partial payment or null if creation fails.
 */
async function createNewPartialPayment(bill, amountPaid, manager) {
  const createArguments = [{
    clientBillId: bill.id,
    amountPaid: amountPaid
  }];

  if (manager) createArguments.push({transaction: manager});

  let partialPayment = null;

  try {
    partialPayment = await PartialPayment.create(...createArguments);
  } catch (error) {
    logAndSave(error);
  }

  return partialPayment;
}

/**
 * Reconnects a client based on the connection status.
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} connectionStatus - The connection status.
 * @param {Transaction|null} manager - Optional Sequelize transaction manager.
 * @return {Promise<boolean>} Returns true if reconnection is successful, false otherwise.
 */
async function reconnectClient(clientId, connectionStatus, manager = null) {
  const dueForDisconnection = connectionStatus === connectionStatusTypes.DueForDisconnection;

  if (!dueForDisconnection) return false;

  const createArguments = [{
    clientId: clientId,
    status: connectionStatusTypes.Connected
  }];

  if (manager) createArguments.push({transaction: manager});

  let reconnected = null;

  try {
    reconnected = await ClientConnectionStatus.create(...createArguments);
  } catch (error) {
    logAndSave(error);
  }

  return reconnected ? true : false;
}

/**
 * Prints the clients bill through excel
 * @param {Object} client - clients bill data
 */
async function startPrintByExcel(client) {
  if (!client) throw new Error('Missing client data');
  const bill = client.bills.length > 0 ? client.bills[0] : null;

  const workbook = new ExcelJS.Workbook();
  const worksheetName = `${client.firstName}-temporary-receipt`;

  const worksheet = workbook.addWorksheet(worksheetName);

  worksheet.columns = [
    {key: 'col1', width: 17},
    {key: 'col2', width: 17}
  ];

  let rowNumber = 0;

  /**
   * Inserts a new row data and increments rowNumber
   * @param {Array} data - the array to be inserted
   * @return {ExcelJS.Row} the inserted row
   */
  const insert = data => {
    rowNumber++;
    return worksheet.addRow(data ?? []);
  };

  /**
   * Inserts a new row with a centered bold text for the header.
   * @param {Array} data - the array to be inserted
   * @return {ExcelJS.Row} the inserted row
   */
  const insertHeader = data => {
    const row = insertAndMergeCenter(data);
    row.getCell(1).font = {bold: true};
    return row;
  };

  /**
   * Inserts a new row data with a reduced font
   * @param {Array} data - the array to be inserted
   * @param {number} [defaultSize=9] - The default font size of the row
   * @return {ExcelJS.Row} the inserted row
   */
  const insertBody = (data, defaultSize=9) => {
    const row = insert(data);
    row.font = {size: defaultSize};
    return row;
  };

  /**
   * Insert 2 rows where the first row has a thin bottom border.
   */
  const insertDivider = () => {
    const topMargin = insert();
    topMargin.height = 10;
    const row = worksheet.getRow(rowNumber);
    row.getCell(1).border = {bottom: {style: 'thin'}};
    row.getCell(2).border = {bottom: {style: 'thin'}};
    const bottomMargin = insert();
    bottomMargin.height = 10;
  };

  /**
   * Merges and centers the current row number
   */
  const mergeAndCenter = () => {
    worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
    worksheet.getCell(`A${rowNumber}`).alignment = {horizontal: 'center', wrapText: true};
  };

  /**
   * Inserts a new row data, increments the rowNumber,
   * then merges and centers the current row
   * @param {Array} data - the array to be inserted
   * @return {ExcelJS.Row} - the inserted row
   */
  const insertAndMergeCenter = data => {
    const row = insert(data);
    mergeAndCenter();
    return row;
  };

  insert();

  const title = insertHeader(['Barangay Water and Sanitation Association']);
  title.height = 30;

  insertHeader(['WATER BILL']);
  insertHeader([`MONTH OF ${getMonth(bill.createdAt) ?? ''}`]);

  insertHeader([client.fullName ?? '']);

  insertBody(['Account no: ', client.accountNumber ?? '']);
  const addressRow = insertBody(['Address: ', client.mainAddress.fullAddress ?? '']);
  addressRow.height = 30;
  // insertBody(['Meter Number: ', client.meterNumber ?? '']);

  insertDivider();

  insertBody(['Due Date: ', formatDate(bill.dueDate, 'long') ?? '']);
  insertBody(['Disonnection Date: ', formatDate(bill.disconnectionDate, 'long') ?? '']);
  insertBody(['Covered From: ', formatDate(bill.createdAt, 'long') ?? '']);
  insertBody(['Covered To: ', formatDate(bill.updatedAt, 'long') ?? '']);

  insertDivider();

  insertBody(['Pres Reading: ', bill.secondReading ?? '']);
  insertBody(['Prev Reading: ', bill.firstReading ?? '']);
  insertBody(['Consumption: ', bill.consumption ?? '']);

  insertDivider();

  insertBody(['Bill Amount: ', `₱${parseFloat(bill.total).toFixed(2) ?? 0.00}`]);

  insertDivider();

  insertBody(['Total Amount: ', `₱${parseFloat(bill.total).toFixed(2) ?? 0.00}`]);
  insertBody(['Penalty After Due: ', '5']);
  insertBody(['Total After Due: ', `₱${parseFloat(bill.total + 5).toFixed(2) ?? 0.00}`]);

  insertDivider();

  const messageRow = insertAndMergeCenter([
    'Kindly bring this statement when paying at the office.',
    'A penalty of 5 pesos penalty charge will be added to the bill',
    'after due date. You can pay your bill starting tomorrow'
  ].join(' '));

  messageRow.height = 77;
  messageRow.font = {size: 9};

  worksheet.pageSetup.printArea = `A1:B${rowNumber}`;
  const filePath = path.join(DOCUMENTS, `${worksheetName}.xlsx`);

  await workbook.xlsx.writeFile(filePath);

  const powershellCommand = `start-process -filepath '${filePath}' -verb print`;

  // Spawn a new PowerShell process
  const powershellProcess = spawn('powershell.exe', ['-command', powershellCommand]);

  powershellProcess.stderr.on('data', data => {
    logAndSave(error);
    openFile(filePath);
  });

  powershellProcess.on('error', error => {
    logAndSave(error);
    openFile(filePath);
  });
}

module.exports = {
  calculatePartialPaymentsTotal,
  getBillWithPartialPayments,
  createNewPartialPayment,
  createNewPartialPayment,
  processZeroPaymentBill,
  getPreviousBillExcess,
  insertSecondReading,
  handleUnderpaidBill,
  startPrintByExcel,
  getBillAndStatus,
  handleUnpaidBill,
  getCompleteData,
  getAllClients,
  createNewBill,
  getBillById
};

