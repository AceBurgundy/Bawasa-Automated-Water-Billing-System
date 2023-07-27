const Client_Connection_Status = require("../../../models/Client_Connection_Status");
const ClientPhoneNumber = require("../../../models/Client_Phone_Number");
const Client_Address = require("../../../models/Client_Address");
const Client = require("../../../models/Client");
const { ipcMain } = require("electron");

ipcMain.handle("clients", async (event, args) => {

    try {

        const clients = await Client.findAll({

            attributes: [
                "firstName",
                "middleName",
                "lastName",
                "createdAt",
                "meterNumber",
                [db.literal("fullName"), "fullName"]
            ],

            include: [
                {
                    model: Client_Address,
                    attributes: ["details"]
                },
                {
                    model: ClientPhoneNumber,
                    attributes: ["phoneNumber"],
                    order: [["createdAt", "DESC"]],
                    limit: 1
                },
                {
                    model: Client_Connection_Status,
                    attributes: ["connectionStatus"]
                }
            ]

        })

        if (clients.length > 0) {
            return { status: "success", data: clients }
        } else {
            return { status: "error", message: "No clients yet" }
        }
    } catch (error) {
        console.error("Error fetching client data:", error)
        throw error
    }
});
