// functions
const {getClientRecentBill, updatePaymentStatus, reconnectClient} = require('./functions');

// models
const ClientConnectionStatus = require('../../../../models/ClientConnectionStatus');
const ClientPhoneNumber = require('../../../../models/ClientPhoneNumber');
const ClientAddress = require('../../../../models/ClientAddress');
const Client = require('../../../../models/Client');

// utilities
const Response = require('../../../../source/utilities/Response');

const {ipcMain} = require('electron');

/**
 * Handles the 'clients' IPC request to retrieve a list of clients with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} table - The table object containing column name and column data for filtering.
 * @param {string} table.ColumnName - The name of the column to filter.
 * @param {string} table.columnData - The data to filter the specified column.
 * @returns {Promise<Response>} A promise that resolves with a new Response() object.
 */
ipcMain.handle('clients', async (event, table) => {
  try {
    const clientWhereClause = null;

    const columnMap = {
      fullName: '$fullName$',
      accountNumber: '$accountNumber$',
      meterNumber: '$meterNumber$',
      relationshipStatus: '$relationshipStatus$',
      age: '$age$',
      email: '$email$'
    };

    if (!table.ColumnName && table.columnData) {
      return new Response().errorWithData('message', 'Column data is needed');
    }

    if (table.ColumnName && !table.columnData) {
      return new Response().errorWithData('message', 'Column name is needed');
    }

    if (table.ColumnName && table.columnData) {
      clientWhereClause[columnMap[table.ColumnName]] = table.columnData;
    }

    const phoneNumberWhereClause = null;
    const connectionStatusWhereClause = null;

    if (table.ColumnName && table.ColumnName === 'phoneNumbers.phoneNumber') {
      phoneNumberWhereClause['$phoneNumbers.phoneNumber$'] = table.columnData;
    }

    if (table.ColumnName && table.ColumnName === 'connectionStatuses.status') {
      connectionStatusWhereClause['$connectionStatuses.status$'] = table.columnData;
    }

    const clients = await Client.findAll({
      where: clientWhereClause,
      include: [
        {
          model: ClientPhoneNumber,
          as: 'phoneNumbers',
          attributes: ['phoneNumber'],
          where: phoneNumberWhereClause
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
          model: ClientConnectionStatus,
          as: 'connectionStatuses',
          attributes: ['status'],
          where: connectionStatusWhereClause
        }
      ],
      order: [
        [
          {
            model: ClientPhoneNumber,
            as: 'phoneNumbers'
          },
          'createdAt',
          'DESC'
        ],
        [
          {
            model: ClientConnectionStatus,
            as: 'connectionStatuses'
          },
          'createdAt',
          'DESC'
        ]
      ]
    });

    if (clients.length <= 0) {
      return new Response().error('message', 'No clients yet');
    }

    const clientString = JSON.stringify(clients);
    return new Response().okWithData('data', clientString);
  } catch (error) {
    console.log(error);
    return new Response().error('Failed to retrieve clients');
  }
});


/**
 * Handles the 'get-client' IPC request to retrieve a specific client with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} args - Arguments passed with the request.
 * @property {number} args.clientId - Id of a client
 * @returns {Promise<Response>} A promise that resolves with a new Response() object.
 */
ipcMain.handle('get-client', async (event, args) => {
  const {clientId} = args;

  if (!clientId) {
    return new Response().error('Client id not found');
  }

  const client = await getClientRecentBill(clientId);

  if (!client) {
    return new Response().error('Client not found');
  }

  const clientStrings = JSON.stringify(client);
  return new Response().okWithData('data', clientStrings);
});

/**
 * Handles the 'reconnect-client' IPC event asynchronously.
 * @async
 * @function
 * @param {Object} event - The IPC event object.
 * @param {Object} args - The arguments passed to the event handler.
 * @param {string} args.clientId - The ID of the client to reconnect.
 * @param {number} args.paidAmount - The amount paid by the client.
 * @throws {Error} Throws an error if the client ID is not found,
 * there is an error in creating a new connection,
 * the payment amount does not match the recent bill, or the client reconnection fails.
 * @returns {Promise<Response>} Returns an object with either a success or
 * error new Response() for client reconnection.
 */
ipcMain.handle('reconnect-client', async (event, args) => {
  const {clientId, paidAmount} = args;

  if (!clientId) {
    return new Response().error('Client id not found');
  }

  if (!paidAmount) {
    return new Response().error('Payment is required for reconnection');
  }

  // Attempts to reconnect client first
  const reconnection = reconnectClient(clientId);

  if (reconnection.status === 'failed') {
    return new Response().error('Client reconnection failed');
  }

  // Attempts to process client bill if their now reconnected
  const client = await getClientRecentBill(clientId);

  if (!client) {
    return new Response().error('Client and their latest bill was not found');
  }

  const recentBill = client.Bills[0];

  if (recentBill.total !== parseFloat(paidAmount)) {
    return new Response().error('Payment amount must be the same as their bill');
  }

  try {
    const update = await updatePaymentStatus(recentBill.id, paidAmount, 0);

    const updated = update.status === 'success';

    if (updated) {
      return new Response().ok('Client reconnected');
    } else {
      return new Response().error('Client reconnection failed');
    }
  } catch (error) {
    console.log(error);
    return new Response().error('Failed in reconnecting client');
  }
});
