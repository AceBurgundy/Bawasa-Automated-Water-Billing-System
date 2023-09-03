const Client_Connection_Status = require("../../../models/Client_Connection_Status")
const ClientPhoneNumber = require("../../../models/Client_Phone_Number")
const Client_Address = require("../../../models/Client_Address")
const tryCatchWrapper = require("../view_helpers")
const Client = require("../../../models/Client")
const Response = require("../../IPCResponse")
const { ipcMain } = require("electron")

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
