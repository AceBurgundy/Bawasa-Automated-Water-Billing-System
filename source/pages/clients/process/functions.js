// models
const ClientConnectionStatus = require('../../../../models/ClientConnectionStatus');
const ClientBill = require('../../../../models/ClientBill');
const Client = require('../../../../models/Client');

// contants
const {connectionStatusTypes} = require('../../../utilities/constants');

// utilities
const Response = require('../../../utilities/Response');
const {db} = require('../../../utilities/sequelize');

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
          as: 'Bills',
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
    console.log(error);
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

    return new Response().success();
  } catch (error) {
    console.log(error);
    return new Response().failed();
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

  return updatedCount > 0 ? new Response().success() : new Response().failed();
}

module.exports = {
  getClientRecentBill,
  updatePaymentStatus,
  reconnectClient
};
