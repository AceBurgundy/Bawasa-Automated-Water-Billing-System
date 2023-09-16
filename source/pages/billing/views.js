// @collapse

const { connectionStatusTypes } = require("../../utilities/constants")
const tryCatchWrapper = require("../../utilities/helpers")
const Response = require("../../utilities/response")
const { ipcMain } = require("electron")

const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const PartialPayment = require("../../../models/PartialPayment")
const ClientBill = require("../../../models/ClientBill")
const Client = require("../../../models/Client")

// ClientBill.destroy({
// 	where: {}
// })

/**
 * Retrieves a list of bills with associated client data.
 *
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler.
 * @returns {Promise<Object>} - A promise that resolves to the handler response.
 */
ipcMain.handle("bills", async (event, args) => {

    const response = new Response()

	return tryCatchWrapper(async () => {

		const bills = await tryCatchWrapper(async () => {
            return await Client.findAll({
                include: [
                    {
                        model: ClientBill,
                        as: "Bills",
                        include: [PartialPayment]
                    },
                    {
                        model: ClientConnectionStatus,
                        as: "connectionStatuses",
                        attributes: ["status"],
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    }
                ],
                order: [
                    [
                        {
                            model: ClientBill,
                            as: "Bills"
                        }, 
                        'createdAt', 'DESC'
                    ]
                ]
            })
        })

        if (bills.length > 0) {
            return response.success().addObject("data", JSON.stringify(bills)).getResponse()
        } else {
            return response.failed().addObject("message", "No bills yet").getResponse()
        }

	})

})

/**
 * Retrieves a the bill of a client.
 *
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler.
 * @returns {Promise<Object>} - A promise that resolves to the handler response.
 */
ipcMain.handle("get-bill", async (event, args) => {

    const response = new Response()

    const { billId, clientId } = args
    
    if (!billId) {
        return response.failed().addToast("Bill id not found").getResponse()
    }

    if (!clientId) {
        return response.failed().addToast("Client id not found").getResponse()
    }

    return tryCatchWrapper(async () => {

		const clientBill = await tryCatchWrapper(async () => {
            return await Client.findByPk(clientId, {
                include: [
                    {
                        model: ClientBill,
                        include: [PartialPayment]
                    },
                    {
                        model: ClientConnectionStatus,
                        attributes: ["status"],
                        separate: true,
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    }
                ],
                order: [
                    [
                        {
                            model: ClientBill,
                            as: "Bills"
                        }, 
                        'createdAt', 'DESC'
                    ]
                ]
            })
        })

        if (clientBill) {
            return response.success().addObject("data", JSON.stringify(clientBill)).getResponse()
        } else {
            return response.failed().addObject("message", "Cannot find clients bill").getResponse()
        }

	})

})

/**
 * Prints the bill of the client
 * 
 * @param {Electron.Event} event - The IPC event object.
 * @param {any} args - Arguments for the handler
 * @returns {Promise<Object>} - A promise that resolves to the handler response
 */
ipcMain.handle("print-bill", async (event, args) => {
    const { clientId } = args
    const response = new Response()

    if (!clientId) return response.failed().addToast("Missing client id").getResponse()

    const clientBill = await tryCatchWrapper(async () => {
        return await Client.findByPk(clientId)
    })

    if (!clientBill) {
        return response.failed().addObject("message", "Cannot find clients bill").getResponse()
    }

    console.log(clientBill)

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

    /**
     * return if the client doesn't have any connection status records yet or the latest connection status the client (if they have any) is not "connected" 
     * which indicates that the client may currently be "due for disconnection" or is "disconnected"
     */
    if (client.connectionStatuses.length > 0) {
        if (client.connectionStatuses[0].status !== connectionStatusTypes.Connected) {
            return response.failed().addToast(`Set the clients status to "Connected" first`).getResponse()
        }
    }

    const clientBill = await getClientBillById(billId)

    const previousBillExcess = await getPreviousBillExcess(billId)

    let latestBillAlreadyPaid = false

    if (clientBill) {
        const latestBill = clientBill.toJSON()
        latestBillAlreadyPaid = latestBill.paymentStatus === "paid" || latestBill.paymentStatus === "overpaid" && latestBill.secondReading !== null
    }

    if (clientBill && !latestBillAlreadyPaid && clientBill.secondReading !== null) {
        return response.failed().addToast("Current bill must be paid first before proceeding").getResponse()
    }

    if (!clientBill || latestBillAlreadyPaid) {
        const newBill = await createNewBill(client.id, parseFloat(monthlyReading).toFixed(2))

		return newBill
			? response.success().addToast("New client bill created").addObject("billId", newBill.id).getResponse()
			: response.failed().addToast("New client bill creation failed").getResponse()
	
    } else {

        if (!billId) {
            return response.failed().addToast("Bill id not found").getResponse()
        }

        const bill = await getClientBillById(billId)

        if (bill) {

			//Assumes that there is no water consumption thus, no bill
            if (parseFloat(monthlyReading) === bill.firstReading) {
                return updateBillWithNoPayment(bill, response)
			}

			// Update bill with it's second reading
            return updateBillWithSecondReading(bill, parseFloat(monthlyReading).toFixed(2), previousBillExcess, response)
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

    const billJSON = bill.toJSON()
    const totalPartialPayments = calculateTotalPartialPayments(billJSON)

    if (billJSON.paymentStatus === "paid") {
        return response.failed().addToast("Bill had already been paid").getResponse()
    }

    if (billJSON.paymentStatus === "underpaid") {
        return await handleUnderpaidBill(bill, totalPartialPayments, paymentAmount, response)
    }
	
	if (billJSON.paymentStatus === "unpaid") {
		return await handleUnpaidBill(bill, billJSON, paymentAmount, bill.clientId, response)
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
                { 
                    model: ClientBill, 
                    as: "Bills",
                    order: [ [ 'createdAt', 'DESC' ]]
                },
                { 
                    model: ClientConnectionStatus, 
                    as: "connectionStatuses",
                    order: [ [ 'createdAt', 'DESC' ]]
                }
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
        return await ClientBill.findByPk(billId)
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
        return await ClientBill.create({
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
function updateBillWithNoPayment(bill, response) {
    try {
		bill.secondReading = bill.firstReading
		bill.consumption = 0
		bill.billAmount = 0
		bill.paymentStatus = "paid"
		bill.save()
		return response.success().addToast("No payments as water consumption is 0").getResponse()
	} catch (error) {
		console.log(`Error at ${updateBillWithNoPayment.name}`)
		return response.success().addToast("Failed on updating clients bill").getResponse()
	}
}

/**
 * Updates a bill with the second reading and performs calculations.
 *
 * @param {Object} bill - The bill object to update.
 * @param {string} monthlyReading - The monthly reading value.
 * @param {number|null} previousBillExcess - The payment excess from the previous bill.
 */
function updateBillWithSecondReading(bill, monthlyReading, previousBillExcess, response) {

	try {
		bill.secondReading = parseFloat(monthlyReading).toFixed(2)
		bill.consumption = parseFloat(monthlyReading).toFixed(2) - bill.firstReading
		bill.billAmount = previousBillExcess !== null ? (bill.consumption * 5) - previousBillExcess : bill.consumption * 5
		const currentDate = new Date()
		// const twoWeeksFromNow = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000))
        bill.dueDate = currentDate
	
		// const fiveDaysFromDisconnectionDate = new Date(currentDate.getTime() + (19 * 24 * 60 * 60 * 1000))
		// bill.disconnectionDate = fiveDaysFromDisconnectionDate
	
        const oneDayFromNow = new Date(currentDate.getTime() + (1 * 24 * 60 * 60 * 1000)) // Add 1 day (24 hours)
        bill.disconnectionDate = oneDayFromNow // Set disconnection date to tomorrow

		bill.save()
		return response.success().addToast(previousBillExcess !== null ? `Client bill updated with ${previousBillExcess} deduction from previous payment` : "Client bill updated").getResponse()

	} catch(error) {
		console.log(`Error at ${updateBillWithSecondReading.name}`)
		return response.failed().addToast("Failed on updating clients 2nd reading").getResponse()
	}

}

/**
 * Retrieves a client bill along with its associated partial payments.
 *
 * @param {number} billId - The ID of the client bill to retrieve.
 * @returns {Promise<Object|null>} - A promise that resolves to the client bill data with partial payments or null if not found.
 */
async function getClientBillWithPartialPayments(billId) {
    return await tryCatchWrapper(async () => {
        return await ClientBill.findByPk(billId, {
            include: [
                { model: PartialPayment }
            ]
        })
    })
}

/**
 * Calculates the total amount of partial payments for a bill.
 *
 * @param {Object} billJSON - The client bill data.
 * @returns {number} - The total amount of partial payments.
 */
function calculateTotalPartialPayments(billJSON) {
    return billJSON.Partial_Payments.reduce((total, partialPayment) => total + partialPayment.amountPaid, 0)
}

/**
 * Handles underpaid bill scenarios for payment.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} totalPartialPayments - The total amount of partial payments.
 * @param {number} paymentAmount - The payment amount for the current payment.
 * @param {Object} response - The response object to update.
 */
async function handleUnderpaidBill(bill, totalPartialPayments, paymentAmount, response) {
    const newPaymentAmount = totalPartialPayments + paymentAmount

    if (newPaymentAmount === bill.billAmount) {
        const lastPartialPayment = createLastPartialPayment(bill, paymentAmount)

		if (!lastPartialPayment) {
			return response.failed().addToast("Failed on creating creating bills last partial payment").getResponse()
		}

        bill.paymentStatus = "paid"
        bill.remainingBalance = 0
        responseMessage = "Remaining balance paid"

        const clientRecentStatus = await tryCatchWrapper(async () => {
            return await ClientConnectionStatus.findOne({
                where: { 
                    clientId: bill.clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            })
        })

        if (clientRecentStatus.status !== connectionStatusTypes.Connected) {
            const reconnected = await reconnectClient(bill.clientId, clientRecentStatus.status)
            
            responseMessage = reconnected && "Remaining balance paid and client reconnected"
        }
    } 
	
	if (newPaymentAmount < bill.billAmount) {
        const newPartialPayment = createNewPartialPayment(bill, paymentAmount)
		
		if (!newPartialPayment) {
			return response.failed().addToast("Failed on creating creating the bills' last partial payment").getResponse()
		}

        bill.remainingBalance = bill.billAmount - newPaymentAmount
        responseMessage = "Remaining balance has been updated"
    }
	
	if (newPaymentAmount > bill.billAmount) {
        const lastPartialPayment = createLastPartialPayment(bill, paymentAmount)

		if (!lastPartialPayment) {
			return response.failed().addToast("Failed on creating creating the bills' last partial payment").getResponse()
		}
		
		bill.paymentStatus = "overpaid"
        bill.paymentExcess = newPaymentAmount - bill.billAmount
        bill.remainingBalance = 0
        responseMessage = "Remaining balance paid and excess amount saved"

        const clientRecentStatus = await tryCatchWrapper(async () => {
            return await ClientConnectionStatus.findOne({
                where: { 
                    clientId: bill.clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            })
        })

        if (clientRecentStatus.status !== connectionStatusTypes.Connected) {
            const reconnected = await reconnectClient(bill.clientId, clientRecentStatus.status)
            
            responseMessage = reconnected && "Remaining balance paid, excess saved and client reconnected"
        }
    }

    bill.paymentAmount = newPaymentAmount
    bill.save()
    return response.success().addToast(responseMessage).getResponse()
}

/**
 * Handles fully paid bill scenario.
 *
 * @param {Object} bill - The client bill object.
 * @param {Object} billJSON - The client bill objects toJSON version.
 * @param {number} paymentAmount - The payment amount for the first payment.
 * @param {Object} response - The response object to update.
*/
async function handleUnpaidBill(bill, billJSON, paymentAmount, clientId, response) {

	if (billJSON.billAmount === paymentAmount) {
		bill.paymentAmount = bill.billAmount
		bill.paymentStatus = "paid"
		bill.remainingBalance = 0

        responseMessage = "Bill successfully paid"

        const clientRecentStatus = await tryCatchWrapper(async () => {
            return await ClientConnectionStatus.findOne({
                where: { 
                    clientId: clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            })
        })

        if (clientRecentStatus.status !== connectionStatusTypes.Connected) {
            const reconnected = await reconnectClient(clientId, clientRecentStatus.status)

            console.log(clientRecentStatus, reconnected)
            responseMessage = reconnected && "Bill paid and client reconnected"
        }

	}
	
	if (paymentAmount < billJSON.billAmount) {
		const firstPartialPayment = await createNewPartialPayment(bill, paymentAmount)
			
		if (!firstPartialPayment) {
			return response.failed().addToast("Failed creating new partial payment").getResponse()
		}
		
		bill.paymentStatus = "underpaid"
		bill.remainingBalance = bill.billAmount - paymentAmount
		bill.paymentAmount = paymentAmount
		responseMessage = "New remaining balance has been set"
	}

	if (paymentAmount > billJSON.billAmount) {
		bill.paymentStatus = "overpaid"
		bill.paymentAmount = bill.billAmount
		bill.paymentExcess = paymentAmount - bill.billAmount
		responseMessage = "Bill paid and excess saved"

        const clientRecentStatus = await tryCatchWrapper(async () => {
            return await ClientConnectionStatus.findOne({
                where: { 
                    clientId: clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            })
        })

        if (clientRecentStatus.status !== connectionStatusTypes.Connected) {
            const reconnected = await reconnectClient(clientId, clientRecentStatus.status)
            
            responseMessage = reconnected && "Bill paid, excess recorded and client reconnected"
        }
	}

	bill.save()
	return response.success().addToast(responseMessage).getResponse()
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
        return await PartialPayment.create({
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
        return await PartialPayment.create({
            clientBillId: bill.id,
            amountPaid: paymentAmount
        })
    })
}

/**
 * Reconnects the client by adding a new "connected" status
 * @param {string} clientId - The id of the client to be reconnected
 * @param {string} connectionStatus - The connection status of the client
 * @returns {Object} - a status of success and a message
 */
async function reconnectClient(clientId, connectionStatus) {

    return await tryCatchWrapper(async () => {

        if (connectionStatus === connectionStatusTypes.DueForDisconnection) {

            await ClientConnectionStatus.create({
                clientId: clientId,
                status: connectionStatusTypes.Connected
            })

            return true
        } else {
            return false
        }
    })
}

