const Monthly_Reading = require("../../../models/Monthly_Reading")
const Client_Bill = require("../../../models/Client_Bill")
const { db } = require("../../../sequelize_init")
const Client = require("../../../models/Client")
const { ipcMain } = require("electron")

ipcMain.handle("bills", async (event, args) => {

    try {
        const bills = await Client.findAll({
			include: [
				{
					model: Client_Bill,
					include: [
						{
							model: Monthly_Reading,
							as: "previousReading",
							required: false,
						},
						{
							model: Monthly_Reading,
							as: "currentReading",
							required: false,
						},
					],
				},
			],
		});

        if (bills.length > 0) {
            return { status: "success", data: JSON.stringify(bills) }
        } else {
            return { status: "error", message: "No bills yet" }
        }
    } catch (error) {
        console.error("Error fetching client data:", error)
        throw error
    }
})
