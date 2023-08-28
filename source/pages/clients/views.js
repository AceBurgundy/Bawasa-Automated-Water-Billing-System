const Client_Connection_Status = require("../../../models/Client_Connection_Status");
const ClientPhoneNumber = require("../../../models/Client_Phone_Number");
const Client_Address = require("../../../models/Client_Address");
const { db } = require("../../../sequelize_init");
const Client = require("../../../models/Client");
const { ipcMain } = require("electron");

ipcMain.handle("clients", async (event, args) => {

    try {
        const clients = await Client.findAll({
			include: [
				{ 
                    model: ClientPhoneNumber, 
                    as: "Client_Phone_Numbers",
                    attributes: ['phoneNumber']
                },
                { model: Client_Address, as: "mainAddress" },
				{ model: Client_Address, as: "presentAddress" },
                { 
                    model: Client_Connection_Status, 
                    as: "Client_Connection_Statuses",
                    attributes: ['status']
                }
			],
		});

        if (clients.length > 0) {

            return { status: "success", data: JSON.stringify(clients) }
        } else {
            return { status: "error", message: "No clients yet" }
        }
    } catch (error) {
        console.error("Error fetching client data:", error)
        throw error
    }
});
