const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientBill = require("../../../models/ClientBill")
const Client = require("../../../models/Client")

const { connectionStatusTypes } = require("../../utilities/constants")
const response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")

/**
 * Retrieves a client with their most recent bill information.
 *
 * @async
 * @function
 * @param {number} clientId - The ID of the client to retrieve.
 * @returns {Promise<Client|null>} - A Promise that resolves to the client with recent bill data or null if not found.
 */
async function getClientRecentBill(clientId) {

    let client = null

    try {
        
        client = await Client.findByPk(clientId, {
			include: [
				{
					model: ClientBill,
					as: "Bills",
					attributes: ["id", "total", "status", "amountPaid", "balance"],
					order: [
                        ["createdAt", "DESC"]
                    ],
					limit: 1,
				},
			],

			order: [
                ["createdAt", "DESC"]
            ]
		})

    } catch (error) {
        console.log(error)
    }

    return client
}

/**
 * Reconnects a client by updating its connection status in the database.
 * @async
 * @function reconnectClient
 * @param {string} clientId - The unique identifier of the client.
 * @throws {Error} Throws an error if the database transaction or client creation fails.
 * @returns {Promise<Object>} A Promise that resolves to a success response object or rejects with a failure response object.
 */
async function reconnectClient(clientId) {

    try {

        await db.transaction(async manager => {
            await ClientConnectionStatus.create({
                clientId: clientId,
                status: connectionStatusTypes.Connected
            }, { transaction: manager })
        })

        return response.success()
    
    } catch (error) {
        console.log(error);
        return response.failed()
    }

}

/**
 * Updates the payment status, payment amount, and remaining balance for a client bill.
 *
 * @param {number} billId - The ID of the bill to update.
 * @param {number} amountPaid - The payment amount to set.
 * @param {number} balance - The remaining balance to set.
 * @returns {Promise<Response>} A Promise that resolves to an object indicating the status of the update operation.
 */
async function updatePaymentStatus(billId, amountPaid, balance) {

    const updatedCount = await db.transaction(async manager => {
            
        return await ClientBill.update({
            status: "paid",
            amountPaid: amountPaid,
            balance: balance
        },
        {
            where: {
                id: billId,
            },
        }, { transaction: manager })
    })

    return updatedCount > 0 ? response.success() : response.failed()
    
}

module.exports = {
    getClientRecentBill,
    updatePaymentStatus,
    reconnectClient
}