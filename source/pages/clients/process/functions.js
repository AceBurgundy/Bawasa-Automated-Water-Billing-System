// models
const ClientConnectionStatus = require('../../../../models/ClientConnectionStatus');
const ClientPhoneNumber = require('../../../../models/ClientPhoneNumber');
const ClientAddress = require('../../../../models/ClientAddress');
const ClientBill = require('../../../../models/ClientBill');
const Client = require('../../../../models/Client');

// contants
const {connectionStatusTypes} = require('../../../utilities/constants');

// utilities
const {emitEvent, logAndSave} = require('../../../utilities/helpers');
const exportRecord = require('../../../utilities/export');
const Response = require('../../../utilities/response');
const {db} = require('../../../utilities/sequelize');

/**
 * Retrieves clients based on the provided conditions.
 * @function
 * @param {Object} [clauses={}] - Object of objects that contains
 * conditions to filter the clients.
 * @return {Promise<Array<Client>>} - A promise that resolves to an array of client instances.
 */
async function getClients(clauses = {}) {
  const extractClause = key => clauses.hasOwnProperty(key) ? clauses[key] : {};

  return await Client.findAll({
    where: extractClause('whereClause'),
    include: [
      {
        model: ClientPhoneNumber,
        as: 'phoneNumbers',
        attributes: ['phoneNumber']
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
        where: extractClause('connectionStatusWhereClause')
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
}

/**
 * Retrieves a client with their most recent bill information.
 *
 * @async
 * @function
 * @param {number} clientId - The ID of the client to retrieve.
 * @return {Promise<Client|null>} A Promise that resolves to the client with
 * recent bill data or null if not found.
 */
async function getClientRecentBill(clientId) {
  let client = null;

  try {
    client = await Client.findByPk(clientId, {
      include: [
        {
          model: ClientBill,
          as: 'bills',
          attributes: ['id', 'total', 'status', 'amountPaid', 'balance'],
          order: [
            ['createdAt', 'DESC']
          ],
          limit: 1
        }
      ],

      order: [
        ['createdAt', 'DESC']
      ]
    });
  } catch (error) {
    logAndSave(error);
  }

  return client;
}

/**
 * Reconnects a client by updating its connection status in the database.
 * @async
 * @function reconnectClient
 * @param {string} clientId - The unique identifier of the client.
 * @return {Promise<Response>} A Promise that resolves to a success
 * new Response() object or rejects with a failure new Response() object.
 */
async function reconnectClient(clientId) {
  try {
    await db.transaction(async manager => {
      await ClientConnectionStatus.create({
        clientId: clientId,
        status: connectionStatusTypes.Connected
      }, {transaction: manager});
    });

    return new Response().ok();
  } catch (error) {
    logAndSave(error);
    return new Response().error();
  }
}

/**
 * Updates the payment status, payment amount, and remaining balance for a client bill.
 *
 * @param {number} billId - The ID of the bill to update.
 * @param {number} amountPaid - The payment amount to set.
 * @param {number} balance - The remaining balance to set.
 * @return {Promise<Response>} A Promise that resolves to an object
 * indicating the status of the update operation.
 */
async function updatePaymentStatus(billId, amountPaid, balance) {
  const updatedCount = await db.transaction(async manager => {
    return await ClientBill.update({
      status: 'paid',
      amountPaid: amountPaid,
      balance: balance
    },
    {
      where: {
        id: billId
      }
    }, {transaction: manager});
  });

  return updatedCount > 0 ? new Response().ok() : new Response().error();
}

/**
 * Deletes the client from the system
 * @param {number} clientId - the id of the client
 * @param {Electron.IpcMainInvokeEvent} event - The ipc invoke
 * event that called this function.
 */
async function deleteClient(clientId, event) {
  if (!clientId) {
    emitEvent('Cannot export client without id');
    throw new Error('Missing client id');
  };
  const exportResponse = await exportRecord(clientId, event, true);

  if (exportResponse.status === 'success') {
    const client = await Client.findByPk(clientId);
    if (client) await client.destroy();
  } else {
    emitEvent('Failed to export client data before deletion');
    throw new Error('Failed to export client');
  }
}

module.exports = {
  getClientRecentBill,
  updatePaymentStatus,
  reconnectClient,
  deleteClient,
  getClients
};
