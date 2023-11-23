
const { connectionStatusTypes } = require("../../../source/utilities/constants")
const { tryCatchWrapper } = require("../../../source/utilities/helpers")
const response = require("../../../source/utilities/response")
const { ipcMain } = require("electron")

// models
const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
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
ipcMain.handle("clients", async (event, table) => {

    return tryCatchWrapper(async () => {

        const clientWhereClause = null

        const columnMap = {
            fullName: "$fullName$",
            accountNumber: "$accountNumber$",
            meterNumber: "$meterNumber$",
            relationshipStatus: "$relationshipStatus$",
            age: "$age$",
            email: "$email$"
        }

        if (!table.ColumnName && table.columnData) {
            return response.failed().addObject("message", "Column data is needed").getResponse()
        }

        if (table.ColumnName && !table.columnData) {
            return response.failed().addObject("message", "Column name is needed").getResponse()
        }

        if (table.ColumnName && table.columnData) {
            clientWhereClause[columnMap[table.ColumnName]] = table.columnData
        } 

        const phoneNumberWhereClause = null
        const connectionStatusWhereClause = null

        if (table.ColumnName && table.ColumnName === "phoneNumbers.phoneNumber") {
            phoneNumberWhereClause["$phoneNumbers.phoneNumber$"] = table.columnData
        }
        
        if (table.ColumnName && table.ColumnName === "connectionStatuses.status") {
            connectionStatusWhereClause["$connectionStatuses.status$"] = table.columnData
        }

        const clients = await Client.findAll({
            where: clientWhereClause,
            include: [
                {
                    model: ClientPhoneNumber,
                    as: "phoneNumbers",
                    attributes: ["phoneNumber"],
                    where: phoneNumberWhereClause
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
                    as: "connectionStatuses",
                    attributes: ["status"],
                    where: connectionStatusWhereClause
                }
            ],
            order: [
                [
                    {
                        model: ClientPhoneNumber,
                        as: "phoneNumbers"
                    },
                    "createdAt",
                    "DESC"
                ],
                [
                    {
                        model: ClientConnectionStatus,
                        as: "connectionStatuses"
                    },
                    "createdAt",
                    "DESC"
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

        const recentBill = client.Bills[0]

        if (recentBill.total !== parseFloat(paidAmount)) {
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

	})
}

/**
 * Updates the payment status, payment amount, and remaining balance for a client bill.
 *
 * @param {number} billId - The ID of the bill to update.
 * @param {number} amountPaid - The payment amount to set.
 * @param {number} balance - The remaining balance to set.
 * @returns {Promise<Object>} - A Promise that resolves to an object indicating the status of the update operation.
 */
async function updateClientPaymentStatus(billId, amountPaid, balance) {

    return tryCatchWrapper(async () => {

        const [rowsUpdated] = await ClientBill.update(
            { 
                status: "paid",
                amountPaid: amountPaid,
                balance: balance
            },
            {
                where: {
                    id: billId,
                },
            }
        );

        return { status: rowsUpdated > 0 ? "success" : "failed" }

    })
}
