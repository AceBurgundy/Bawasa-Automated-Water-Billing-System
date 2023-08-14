const Partial_Payment = require("../../../models/Partial_Payment")
const Client_Bill = require("../../../models/Client_Bill")
const tryCatchWrapper = require("../view_helpers")
const { db } = require("../../../sequelize_init")
const Client = require("../../../models/Client")
const Response = require("../../IPCResponse")
const { ipcMain } = require("electron")

	// Client_Bill.destroy({
	// 	where: {
	// 		id: 9
	// 	}
	// })

ipcMain.handle("bills", async (event, args) => {

    try {
        const bills = await Client.findAll({
			include: [ 
				{ 
					model: Client_Bill,
					include: Partial_Payment,
				} 
			]
		})

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

	if (!billId) {
		return response.failed().addToast("Bill id not found").getResponse()
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

	// gets the previous bills' excess
	const previousBillExcess = await tryCatchWrapper(async () => {
		const bill = await Client_Bill.findByPk(billId - 1)
		
		if (!bill) {
			return null
		}

		return bill.toJSON().paymentExcess
	})

	// returns true if the latest reading has both first and second reading filled else null
	let lastestBillAlreadyPaid = null

	if (clientBills.length > 0) {
		const latestBill = clientBills[clientBills.length - 1]	
		lastestBillAlreadyPaid = latestBill.firstReading !== null && latestBill.secondReading !== null && latestBill.paymentStatus === "paid"
	}

	// If client has bills but is yet to be paid.
	if (clientBills.length > 0 && !lastestBillAlreadyPaid) {
		return response.failed().addToast("Current bill must be paid first before proceeding")
	}

	// If no client bills yet or the recent client bill has been paid.
	if (clientBills.length === 0 || lastestBillAlreadyPaid) {
		
		//create the bill and add its first reading
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

		//update the bill and add the second reading
		const bill = await tryCatchWrapper(async () => {
			return await Client_Bill.findByPk(billId)
		})

		if (bill) {
			bill.secondReading = parseFloat(monthlyReading).toFixed(2)
			bill.consumption = parseFloat(monthlyReading).toFixed(2) - bill.firstReading

			//update the bill amount and subtract any previous bill excess
			bill.billAmount = previousBillExcess !== null ? (bill.consumption * 5) - previousBillExcess : bill.consumption * 5
					
			// disconnection date set to (2 weeks from current date)
			const currentDate = new Date()
			const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000)) // 14 days in milliseconds
			bill.disconnectionDate = twoWeeksFromNow
		}		

		bill.save()

		return response.success().addToast(previousBillExcess !== null ? `Client bill updated with ${previousBillExcess} deduction from previous payment` : "Client bill updated")

	}
})

ipcMain.handle("pay-bill", async (event, args) => {

	const { paymentAmount, billId } = args
	const response = new Response()

	if (!paymentAmount) {
		return response.failed().addToast("Missing monthly reading").getResponse()
	}

	if (!billId) {
		return response.failed().addToast("Bill id missing").getResponse()
	}

	const bill = await tryCatchWrapper(async () => {
		return await Client_Bill.findByPk(billId, {
			include: [
				{
					model: Partial_Payment
				}
			]
		})
	})

	if (!bill) {
		return response.failed().addToast("Cannot find bill")
	}

	const billData = bill.toJSON()
	const partialPayment = billData.Partial_Payments

	lastestBillAlreadyPaid = billData.firstReading !== null && billData.secondReading !== null && billData.paymentStatus === "paid"

	if (lastestBillAlreadyPaid) {
		return response.failed().addToast("Bill had already been paid").getResponse()
	}

	//HERE

	if (billData.billAmount === paymentAmount) {
		billData.paymentAmount = paymentAmount
		bill.save()
		return response.success().addToast("Bill successfully paid").getResponse()
	}

	if (billData.billAmount > paymentAmount) {

		const newPartialPayment = await tryCatchWrapper(async () => {
			return await Partial_Payment.create({
				clientBillId: bill.id,
				amountPaid: paymentAmount
			})
		})

		if (newPartialPayment) {
			const totalPartialPayments = billData.Partial_Payments.reduce((total, partialPayment) => {
				return total + partialPayment.amountPaid
			}, 0)
			
			bill.remainingBalance = billData.billAmount - totalPartialPayments
			bill.save()			
		}

		return response.success().addToast("New remaining balance had been set").getResponse()

	}

	if (paymentAmount > billData.billAmount) {
		
		bill.paymentAmount = billData.billAmount
		bill.paymentExcess = paymentAmount - billData.billAmount
		bill.save()

		return response.success().addToast("Bill paid and excess saved").getResponse()

	}

	console.log(billData)
})

ipcMain.handle("get-bill-excess", async (event, billId) => {

	if (!billId || billId < 1) {
		return null
	}

	// get the previous bill
	const bill = await tryCatchWrapper(async () => {
		return await Client_Bill.findByPk(billId - 1)
	})

	if (!bill) {
		return null
	}

	return bill.toJSON().paymentExcess

})