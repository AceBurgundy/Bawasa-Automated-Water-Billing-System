// functions
const {
  getClientRecentBill,
  updatePaymentStatus,
  reconnectClient,
  getClients,
  deleteClient
} = require('./functions');

// utilities
const Response = require('../../../../source/utilities/response');

const {ipcMain} = require('electron');
const {Sequelize} = require('sequelize');

ipcMain.handle('clients', async (event, table) => {
  const whereClause = {};
  let searchForClientStatus = false;

  if (table.columnName && table.columnName !== 'status') {
    whereClause[table.columnName] = {
      [Sequelize.Op.like]: `%${table.columnData}%`
    };
  }

  const connectionStatusWhereClause = {};

  if (table.columnName && table.columnName === 'status') {
    searchForClientStatus = true;
    connectionStatusWhereClause[table.columnName] = table.columnData;
  }

  const clauses = {
    whereClause: whereClause,
    connectionStatusWhereClause: connectionStatusWhereClause
  };

  let clients = null;

  try {
    clients = await getClients(clauses);

    if (clients && clients.length <= 0) {
      // Returns none if no client for particular client status
      if (searchForClientStatus) {
        return new Response().errorWithData('message', 'No clients for this status');
      }

      // Returns all clients
      clients = await getClients();
      if (clients.length <= 0) {
        return new Response().errorWithData('message', 'No clients yet');
      }
    }
  } catch (error) {
    console.log(error);
    return new Response().errorWithData('message', 'Error in searching for clients');
  }

  const stringClients = JSON.stringify(clients);
  return new Response().okWithData('data', stringClients);
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

  const recentBill = client.bills[0];

  if (recentBill.total !== paidAmount) {
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

ipcMain.handle('delete-client', async (event, clientId) => {
  try {
    await deleteClient(clientId, event);
    return new Response().ok('Client succesfully deleted');
  } catch (error) {
    console.log(error);
    return new Response().error('Error in deleting client');
  }
});
