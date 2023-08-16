const Partial_Payment = require("../../../models/Partial_Payment")
const Client_Bill = require("../../../models/Client_Bill")
const tryCatchWrapper = require("../view_helpers")
const { db } = require("../../../sequelize_init")
const Client = require("../../../models/Client")
const Response = require("../../IPCResponse")
const { ipcMain } = require("electron")

// Client_Bill.destroy({
// 	where: {id: 40}
// })

/**
 * Retrieves a list of bills with associated client data.
 *
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler.
 * @returns {Promise<Object>} - A promise that resolves to the handler response.
 */
ipcMain.handle("bills", async (event, args) => {

	tryCatchWrapper(async () => {

		const bills = await tryCatchWrapper(async () => {
            return await Client.findAll({
                include: [
                    {
                        model: Client_Bill,
                        include: [Partial_Payment],
                        order: [['id', 'DESC']]
                    }
                ]
            })
        })

        if (bills.length > 0) {
			/**
			 * manually sorting each clients bill from latest bill to the first
			 * as order: [['id', 'DESC']] is not working
			 */
            bills.forEach(bill => bill.Client_Bills.sort((a, b) => b.id - a.id))
            return { status: "success", data: JSON.stringify(bills) }
        } else {
            return { status: "error", message: "No bills yet" }
        }

	})

})

/**
 * Handles the creation or update of a new bill for a client.
 *
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler.
 * @returns {Promise<Object>} - A promise that resolves to the handler response.
 */
ipcMain.handle("new-bill", async (event, args) => {

    const { clientId, monthlyReading, billId } = args
    const response = new Response()

    if (!clientId) {
        return response.failed().addToast("Missing client id").getResponse()
    }

    if (!monthlyReading) {
        return response.failed().addToast("Missing monthly reading").getResponse()
    }

    const client = await getClientWithBills(clientId)

    if (!client) {
        return response.failed().addToast("Cannot find client").getResponse()
    }

    const clientBill = await getClientBillById(billId)

    const previousBillExcess = await getPreviousBillExcess(billId)

    let latestBillAlreadyPaid = false

    if (clientBill) {
        const latestBill = clientBill.toJSON()
        latestBillAlreadyPaid = latestBill.paymentStatus === "paid" && latestBill.secondReading !== null
    }

    if (clientBill && !latestBillAlreadyPaid && clientBill.secondReading !== null) {
        return response.failed().addToast("Current bill must be paid first before proceeding").getResponse()
    }

    if (!clientBill || latestBillAlreadyPaid) {
        const newBill = await createNewBill(client.id, parseFloat(monthlyReading).toFixed(2))

		return newBill
			? response.success().addToast("New client bill created").getResponse()
			: response.failed().addToast("New client bill creation failed").getResponse();
	
    } else {

        if (!billId) {
            return response.failed().addToast("Bill id not found").getResponse()
        }

        const bill = await getClientBillById(billId)

        if (bill) {

			//Assumes that there is no water consumption thus, no bill
            if (parseFloat(monthlyReading) === bill.firstReading) {
                updateBillWithNoPayment(bill)
                return response.success().addToast("No payments as water consumption is 0").getResponse()
            }

			// Update bill with add it's second reading
            updateBillWithSecondReading(bill, parseFloat(monthlyReading).toFixed(2), previousBillExcess)
            return response.success().addToast(previousBillExcess !== null ? `Client bill updated with ${previousBillExcess} deduction from previous payment` : "Client bill updated").getResponse()
        }
    }
})

/**
 * Handles payment for a client's bill, including partial payments.
 *
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler.
 * @returns {Promise<Object>} - A promise that resolves to the handler response.
 */
ipcMain.handle("pay-bill", async (event, args) => {

    const { amount, billId } = args
    const response = new Response()

    const paymentAmount = parseFloat(amount)

    if (!paymentAmount) {
        return response.failed().addToast("Missing payment amount").getResponse()
    }

    if (!billId) {
        return response.failed().addToast("Bill id missing").getResponse()
    }

    const bill = await getClientBillWithPartialPayments(billId)

    if (!bill) {
        return response.failed().addToast("Cannot find bill").getResponse()
    }

    const billData = bill.toJSON()
    const totalPartialPayments = calculateTotalPartialPayments(billData)

    if (billData.paymentStatus === "paid") {
        return response.failed().addToast("Bill had already been paid").getResponse()
    }

    if (billData.paymentStatus === "underpaid") {
        handleUnderpaidBill(bill, totalPartialPayments, paymentAmount, response)
    }
	
	if (billData.paymentStatus === "unpaid") {

		if (billData.billAmount === paymentAmount) {
			handleFullyPaidBill(bill, response)
		} 
		
		if (paymentAmount < billData.billAmount) {
			handleUnderpaidBillFirstPayment(bill, paymentAmount, response)
		}
		
		if (paymentAmount > billData.billAmount) {
			handleOverpaidBill(bill, paymentAmount, response)
		}

	}

})

// utility functions

/**
 * Retrieves a client along with their associated bills.
 *
 * @param {number} clientId - The ID of the client to retrieve.
 * @returns {Promise<Object|null>} - A promise that resolves to the client data or null if not found.
 */
async function getClientWithBills(clientId) {
    return await tryCatchWrapper(async () => {
        return await Client.findByPk(clientId, {
            include: [
                { model: Client_Bill, as: "Client_Bills" }
            ]
        })
    })
}

/**
 * Retrieves a client bill by its ID.
 *
 * @param {number} billId - The ID of the client bill to retrieve.
 * @returns {Promise<Object|null>} - A promise that resolves to the client bill data or null if not found.
 */
async function getClientBillById(billId) {
    return await tryCatchWrapper(async () => {
        return await Client_Bill.findByPk(billId)
    })
}

/**
 * Retrieves the payment excess from the previous bill.
 *
 * @param {number} billId - The ID of the current bill.
 * @returns {Promise<number|null>} - A promise that resolves to the previous bill's payment excess or null if not found.
 */
async function getPreviousBillExcess(billId) {
    const bill = await getClientBillById(billId - 1)
    return bill ? bill.toJSON().paymentExcess : null
}

/**
 * Creates a new bill for a client with the specified first reading.
 *
 * @param {number} clientId - The ID of the client for whom the bill is created.
 * @param {string} firstReading - The first reading value.
 * @returns {Promise<Object|null>} - A promise that resolves to the created bill or null if creation fails.
 */
async function createNewBill(clientId, firstReading) {
    return await tryCatchWrapper(async () => {
        return await Client_Bill.create({
            clientId: clientId,
            firstReading: parseFloat(firstReading).toFixed(2)
        })
    })
}

/**
 * Updates a bill with no payment and sets relevant fields.
 *
 * @param {Object} bill - The bill object to update.
 */
function updateBillWithNoPayment(bill) {
    bill.secondReading = bill.firstReading
    bill.consumption = 0
    bill.billAmount = 0
    bill.paymentStatus = "paid"
    bill.save()
}

/**
 * Updates a bill with the second reading and performs calculations.
 *
 * @param {Object} bill - The bill object to update.
 * @param {string} monthlyReading - The monthly reading value.
 * @param {number|null} previousBillExcess - The payment excess from the previous bill.
 */
function updateBillWithSecondReading(bill, monthlyReading, previousBillExcess) {
    bill.secondReading = parseFloat(monthlyReading).toFixed(2)
    bill.consumption = parseFloat(monthlyReading).toFixed(2) - bill.firstReading
    bill.billAmount = previousBillExcess !== null ? (bill.consumption * 5) - previousBillExcess : bill.consumption * 5
    const currentDate = new Date()
    const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000))
    bill.disconnectionDate = twoWeeksFromNow
    bill.save()
}

/**
 * Retrieves a client bill along with its associated partial payments.
 *
 * @param {number} billId - The ID of the client bill to retrieve.
 * @returns {Promise<Object|null>} - A promise that resolves to the client bill data with partial payments or null if not found.
 */
async function getClientBillWithPartialPayments(billId) {
    return await tryCatchWrapper(async () => {
        return await Client_Bill.findByPk(billId, {
            include: [
                { model: Partial_Payment }
            ]
        })
    })
}

/**
 * Calculates the total amount of partial payments for a bill.
 *
 * @param {Object} billData - The client bill data.
 * @returns {number} - The total amount of partial payments.
 */
function calculateTotalPartialPayments(billData) {
    return billData.Partial_Payments.reduce((total, partialPayment) => total + partialPayment.amountPaid, 0)
}

/**
 * Handles underpaid bill scenarios for payment.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} totalPartialPayments - The total amount of partial payments.
 * @param {number} paymentAmount - The payment amount for the current payment.
 * @param {Object} response - The response object to update.
 */
function handleUnderpaidBill(bill, totalPartialPayments, paymentAmount, response) {
    const newPaymentAmount = totalPartialPayments + paymentAmount;

    if (newPaymentAmount === bill.billAmount) {
        createLastPartialPayment(bill, paymentAmount);
        bill.paymentStatus = "paid";
        bill.remainingBalance = 0;
        responseMessage = "Remaining balance paid";
    } 
	
	if (newPaymentAmount < bill.billAmount) {
        createNewPartialPayment(bill, paymentAmount);
        bill.remainingBalance = bill.billAmount - newPaymentAmount;
        responseMessage = "Remaining balance has been updated";
    }
	
	if (newPaymentAmount > bill.billAmount) {
        createLastPartialPayment(bill, paymentAmount);
        bill.paymentStatus = "overpaid";
        bill.paymentExcess = newPaymentAmount - bill.billAmount;
        responseMessage = "Excess amount saved";
    }

    bill.paymentAmount = newPaymentAmount;
    bill.save();
    response.success().addToast(responseMessage).getResponse();
}

/**
 * Handles fully paid bill scenario.
 *
 * @param {Object} bill - The client bill object.
 * @param {Object} response - The response object to update.
 */
function handleFullyPaidBill(bill, response) {
    bill.paymentAmount = bill.billAmount
    bill.paymentStatus = "paid"
    bill.remainingBalance = 0
    bill.save()
    response.success().addToast("Bill successfully paid").getResponse()
}

/**
 * Handles underpaid bill scenario with the first payment.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} paymentAmount - The payment amount for the first payment.
 * @param {Object} response - The response object to update.
 */
async function handleUnderpaidBillFirstPayment(bill, paymentAmount, response) {
    const firstPartialPayment = await createNewPartialPayment(bill, paymentAmount)
    if (firstPartialPayment) {
        bill.paymentStatus = "underpaid"
        bill.remainingBalance = bill.billAmount - paymentAmount
        bill.paymentAmount = paymentAmount
        bill.save()
    }
    response.success().addToast("New remaining balance has been set").getResponse()
}

/**
 * Handles overpaid bill scenario.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} paymentAmount - The payment amount for the current payment.
 * @param {Object} response - The response object to update.
 */
function handleOverpaidBill(bill, paymentAmount, response) {
    bill.paymentStatus = "overpaid"
    bill.paymentAmount = bill.billAmount
    bill.paymentExcess = paymentAmount - bill.billAmount
    bill.save()
    response.success().addToast("Bill paid and excess saved").getResponse()
}

/**
 * Creates a new partial payment record.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} paymentAmount - The payment amount for the current payment.
 * @returns {Promise<Object|null>} - A promise that resolves to the created partial payment or null if creation fails.
 */
async function createNewPartialPayment(bill, paymentAmount) {
    return await tryCatchWrapper(async () => {
        return await Partial_Payment.create({
            clientBillId: bill.id,
            amountPaid: paymentAmount
        })
    })
}

/**
 * Creates a last partial payment record for an underpaid bill.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} paymentAmount - The payment amount for the current payment.
 * @returns {Promise<Object|null>} - A promise that resolves to the created partial payment or null if creation fails.
 */
async function createLastPartialPayment(bill, paymentAmount) {
    return await tryCatchWrapper(async () => {
        return await Partial_Payment.create({
            clientBillId: bill.id,
            amountPaid: paymentAmount
        })
    })
}
