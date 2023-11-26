// models
const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const ClientPhoneNumber = require("../../../models/ClientPhoneNumber")
const ClientAddress = require("../../../models/ClientAddress")
const Client = require("../../../models/Client")

const response = require("../../../source/utilities/response")
const { ipcMain } = require("electron")

const {     
    getClientRecentBill,
    updatePaymentStatus,
    reconnectClient 
} = require("./functions")

/**
 * Handles the "clients" IPC request to retrieve a list of clients with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} table - The table object containing column name and column data for filtering.
 * @param {string} table.ColumnName - The name of the column to filter.
 * @param {string} table.columnData - The data to filter the specified column.
 * @returns {Promise<Response>} A promise that resolves with a response object.
 */
ipcMain.handle("clients", async (event, table) => {

    try {
        
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
            return response.ErrorWithData("message", "Column data is needed")
        }

        if (table.ColumnName && !table.columnData) {
            return response.ErrorWithData("message", "Column name is needed")
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

        if (!clients) {
            return response.ErrorWithData("message", "No clients yet")
        }

        const clientString = JSON.stringify(clients)
        return response.OkWithData("data", clientString) 

    } catch (error) {
        console.log(error)
        return response.Error("Failed to retrieve clients")
    }
})
  

/**
 * Handles the "get-client" IPC request to retrieve a specific client with associated data.
 *
 * @param {Electron.IpcMainEvent} event - The IPC event object.
 * @param {Object} args - Arguments passed with the request.
 * @property {number} args.clientId - Id of a client
 * @returns {Promise<Response>} A promise that resolves with a response object.
 */
ipcMain.handle("get-client", async (event, args) => {

    const { clientId } = args

    if (!clientId) {
        return response.Error("Client id not found")
    }

    const client = await getClientRecentBill(clientId)
    
    if (!client) {
        return response.Error("Client not found")
    }

    const clientStrings = JSON.stringify(client)
    return response.OkWithData("data", clientStrings)

})

/**
 * Handles the "reconnect-client" IPC event asynchronously.
 * @async
 * @function
 * @param {Object} event - The IPC event object.
 * @param {Object} args - The arguments passed to the event handler.
 * @param {string} args.clientId - The ID of the client to reconnect.
 * @param {number} args.paidAmount - The amount paid by the client.
 * @throws {Error} Throws an error if the client ID is not found, there is an error in creating a new connection,
 * the payment amount does not match the recent bill, or the client reconnection fails.
 * @returns {Promise<Response>} Returns an object with either a success or error response for client reconnection.
 */
ipcMain.handle("reconnect-client", async (event, args) => {

    const { clientId, paidAmount } = args

    if (!clientId) {
        return response.Error("Client id not found")
    }

    if (!paidAmount) {
        return response.Error("Payment is required for reconnection")
    }

    // Attempts to reconnect client first
    const reconnection = reconnectClient(clientId)

    if (reconnection.status === "failed") {
        return response.Error("Client reconnection failed")
    }

    // Attempts to process client bill if their now reconnected
    const client = await getClientRecentBill(clientId)

    if (!client) {
        return response.Error("Client and their latest bill was not found")
    }
    
    const recentBill = client.Bills[0]

    if (recentBill.total !== parseFloat(paidAmount)) {
        return response.Error("Payment amount must be the same as their bill")
    }

    try {
        
        const update = await updatePaymentStatus(recentBill.id, paidAmount, 0)

        const updated = update.status === "success"

        if (updated) {
            return response.Ok("Client reconnected")
        } else {
            return response.Error("Client reconnection failed")
        }

    } catch (error) {
        console.log(error);
        return response.Error("Failed in reconnecting client")
    }
})