const Client_Connection_Status = require("../../../models/Client_Connection_Status")
const ClientPhoneNumber = require("../../../models/Client_Phone_Number")
const Client_Address = require("../../../models/Client_Address")
const Client_Bill = require("../../../models/Client_Bill")
const tryCatchWrapper = require("../view_helpers")
const Client = require("../../../models/Client")
const Response = require("../../IPCResponse")
const { ipcMain } = require("electron")

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
                    model: Client_Address, 
                    as: "mainAddress"
                },
				{ 
                    model: Client_Address, 
                    as: "presentAddress"
                },
                { 
                    model: Client_Connection_Status, 
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
                        model: Client_Connection_Status, 
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

    const client = await tryCatchWrapper(async () => {

		return await Client.findByPk(clientId, {

			include: [
				{
					model: Client_Bill,
					as: "Client_Bills",
					attributes: ["billAmount"],
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
    
    if (client) {
        return response.success().addObject("data", JSON.stringify(client)).getResponse()
    } else {
        return response.failed().addToast("Client not found").getResponse()
    }

})
