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

ipcMain.handle("new-bill", async (event, args) => {
	const { clientId, monthlyReading, billId } = args
	const response = new Response()

	if (!clientId) {
		return response.failed().addToast("Missing client id").getResponse()
	}

	if (!monthlyReading) {
		return response.failed().addToast("Missing monthly reading").getResponse()
	}
	
	const client = await tryCatchWrapper(async () => {
		return await Client.findByPk(clientId, {
			include: [
				{  model: Client_Bill, as: "Client_Bills" }
			]
		})
	})

	if (!client) {
		return response.failed().addToast("Cannot find client")
	}

	const clientData = client.toJSON()
	const clientBills = clientData.Client_Bills

	// If no client bills yet
	if (clientBills.length === 0) {
		
		//create the first bill and add the first reading
		const newBill = await tryCatchWrapper(async () => {
			return await Client_Bill.create(
				{
					clientId: client.id,
					firstReading: parseFloat(monthlyReading).toFixed(2)
				}
			)
		})

		if (newBill) {
			return response.success().addToast("new client bill created")
		} else {
			return response.failed().addToast("new client bill creation failed")
		}

	} else {

		if (!billId) {
			return response.failed().addToast("Bill id not found").getResponse()
		}

		//update the bill and add the second reading
		const bill = await tryCatchWrapper(async () => {
			return await Client_Bill.findByPk(billId)
		})

		if (bill) {
			bill.secondReading = parseFloat(monthlyReading).toFixed(2)
			bill.consumption = parseFloat(monthlyReading).toFixed(2) - bill.firstReading
			bill.billAmount = bill.consumption * 5 // Format as decimal with two decimal places
		
			// disconnection date set to (2 weeks from current date)
			const currentDate = new Date()
			const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days in milliseconds
			bill.disconnectionDate = twoWeeksFromNow
		}		

		bill.save()

		return response.success().addToast("Client Bill updated")

	}
})
