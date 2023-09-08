// @collapse

const { connectionStatusTypes } = require("../../../constants")
const tryCatchWrapper = require("../../utilities/helpers")
const Response = require("../../utilities/response")
const { ipcMain } = require("electron")

// models
const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/Client_Phone_Number")
const ClientAddress = require("../../../models/ClientAddress")
const ClientBill = require("../../../models/ClientBill")
const Client = require("../../../models/Client")

/**
 * Handles the "clients" IPC request to retrieve a list of clients with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} args - Arguments passed with the request.
 * @returns {Promise<Object>} A promise that resolves with a response object.
 */
ipcMain.handle("clients", async (event, args) => {

    return tryCatchWrapper(async () => {

        const response = new Response()

        const clients = await Client.findAll({
		
            include: [
				{ 
                    model: ClientPhoneNumber, 
                    as: "Client_Phone_Numbers",
                    attributes: ['phoneNumber']
                },
                { 
                    model: ClientAddress, 
                    as: "mainAddress"
                },
				{ 
                    model: ClientAddress, 
                    as: "presentAddress"
                },
                { 
                    model: ClientConnectionStatus, 
                    as: "Client_Connection_Statuses",
                    attributes: ['status']
                }
			],
            order: [
                [
                    {
                        model: ClientPhoneNumber, 
                        as: "Client_Phone_Numbers"
                    },
                    'createdAt', 'DESC'
                ],
                [
                    {
                        model: ClientConnectionStatus, 
                        as: "Client_Connection_Statuses"
                    },
                    'createdAt', 'DESC'
                ]
            ]
		})

        if (clients.length > 0) {
            return response.success().addObject("data", JSON.stringify(clients)).getResponse()
        } else {
            return response.failed().addObject("message", "No clients yet").getResponse()
        }
    })
})

/**
 * Handles the "get-client" IPC request to retrieve a specific client with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} args - Arguments passed with the request.
 * @returns {Promise<Object>} A promise that resolves with a response object.
 */
ipcMain.handle("get-client", async (event, args) => {

    const { clientId } = args

    const response = new Response()

    if (!clientId) {
        return response.failed().addToast("Client id not found").getResponse()
    }

    const client = await getClientWithRecentBill(clientId)
    
    if (client) {
        return response.success().addObject("data", JSON.stringify(client)).getResponse()
    } else {
        return response.failed().addToast("Client not found").getResponse()
    }

})

/**
 * Handles the reconnection of a client.
 *
 * @param {Electron.Event} event - The event object.
 * @param {Object} args - The arguments containing client ID and paid amount.
 * @returns {Object} - An object containing the response for the reconnection operation.
 */
ipcMain.handle("reconnect-client", async (event, args) => {

    const { clientId, paidAmount } = args
    const response = new Response()

    if (!clientId) {
        return response.failed().addToast("Client id not found").getResponse()
    }

    const newConnection = await tryCatchWrapper(async () => {
        return await ClientConnectionStatus.create({
            clientId: clientId,
            status: connectionStatusTypes.Connected
        })
    })

    if (!newConnection) {
        return response.failed().addToast("Error in creating new connection").getResponse()
    } 

    const client = await getClientWithRecentBill(clientId)

    if (client) {

        const recentBill = client.Client_Bills[0]

        if (recentBill.billAmount !== parseFloat(paidAmount)) {
            return response.failed().addToast("Payment amount must be the same as bill").getResponse()
        }

        const result = await updateClientPaymentStatus(recentBill.id, paidAmount, 0)

        if (result.status === "success") {
            return response.success().addToast("Client reconnected").getResponse()
        } else {
            return response.failed().addToast("Client reconnection failed").getResponse()
        }

    } else {
        return response.failed().addToast("Client reconnection failed").getResponse()
    }

})

/**
 * Retrieves a client with their most recent bill information.
 *
 * @param {number} clientId - The ID of the client to retrieve.
 * @returns {Promise<Object|null>} - A Promise that resolves to the client with recent bill data or null if not found.
 */
async function getClientWithRecentBill(clientId) {

    return await tryCatchWrapper(async () => {

		return await Client.findByPk(clientId, {
			include: [
				{
					model: ClientBill,
					as: "Client_Bills",
					attributes: ["id", "billAmount", "paymentStatus", "paymentAmount", "remainingBalance"],
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

	})
}

/**
 * Updates the payment status, payment amount, and remaining balance for a client bill.
 *
 * @param {number} billId - The ID of the bill to update.
 * @param {number} paymentAmount - The payment amount to set.
 * @param {number} remainingBalance - The remaining balance to set.
 * @returns {Promise<Object>} - A Promise that resolves to an object indicating the status of the update operation.
 */
async function updateClientPaymentStatus(billId, paymentAmount, remainingBalance) {

    return tryCatchWrapper(async () => {
        const [rowsUpdated] = await ClientBill.update(
            { 
                paymentStatus: "paid",
                paymentAmount: paymentAmount,
                remainingBalance: remainingBalance
            },
            {
                where: {
                    id: billId,
                },
            }
        );

        if (rowsUpdated > 0) {
           return { status: "success" }
        } else {
            return { status: "failed" }
        }
    })
}
