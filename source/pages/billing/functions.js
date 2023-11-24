const { generateNextAccountOrBillNumber } = require("../../utilities/helpers")
const { connectionStatusTypes } = require("../../utilities/constants")

const ClientConnectionStatus = require("../../../models/ClientConnectionStatus")
const PartialPayment = require("../../../models/PartialPayment")
const ClientBill = require("../../../models/ClientBill")
const Client = require("../../../models/Client")

const response = require("../../utilities/response")
const { db } = require("../../utilities/sequelize")

/**
 * Retrieves all clients with their bills and connection statuses.
 * 
 * @async
 * @returns {Promise<[Client]>} Array of client objects with bills and connection statuses.
 */
async function getAllClients() {
    
    let clients = null

    try {
        clients = await Client.findAll({
            
            include: [
                {
                    model: ClientBill,
                    as: "bills",
                    include: [
                        {
                            model: PartialPayment,
                            as: "partialPayments"
                        },
                    ],
                },
                {
                    model: ClientConnectionStatus,
                    as: "connectionStatuses",
                    attributes: ["status"],
                    separate: true,
                    order: [["createdAt", "DESC"]],
                    limit: 1
                },
            ],
            order: [
                [
                    {
                        model: ClientBill,
                        as: "bills"
                    },
                    "createdAt",
                    "DESC"
                ],
            ]
        })

    } catch (error) {
        console.log(error)
    }

    return clients
}

/**
 * Retrieves the bill and connection status for a specific client.
 *
 * @async
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Client|null>} - Returns the client object with bills and connection status, or null if not found.
 */
async function getBillAndStatus(clientId) {

    let client = null

    try {
        
        client = await Client.findByPk(clientId, {
            include: [
                {
                    model: ClientBill,
                    as: "bills",
                    include: [
                        { 
                            model: PartialPayment,
                            as: "partialPayments"
                        }
                    ]
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
                        as: "bills"
                    }, 
                    'createdAt', 'DESC'
                ]
            ]
        })
    
    } catch (error) {
        console.log(error)   
    }

    return client
}

/**
 * Retrieves a client bill by its ID.
 *
 * @async
 * @param {number} billId - The ID of the client bill to retrieve.
 * @returns {Promise<ClientBill|null>} - A promise that resolves to the client bill data or null if not found.
 */
async function getBillById(billId) {

    let bill = null

    try {
        bill = await ClientBill.findByPk(billId)
    } catch (error) {
        console.log(error)
    }

    return bill
}

/**
 * Retrieves the payment excess from the previous bill.
 *
 * @async
 * @param {number} billId - The ID of the current bill.
 * @returns {Promise<number|null>} - A promise that resolves to the previous bill's payment excess or null if not found.
 */
async function getPreviousBillExcess(billId) {
    const bill = await getBillById(billId - 1)
    return bill ? bill.toJSON().excess : null
}

/**
 * Creates a new bill for a client with the specified first reading.
 *
 * @async
 * @param {number} clientId - The ID of the client for whom the bill is created.
 * @param {string} monthlyReading - The first reading value.
 * @returns {Promise<ClientBill|null>} - A promise that resolves to the created bill or null if creation fails.
 */
async function createNewBill(clientId, monthlyReading) {
    
    let newBill = null

    const whereClause = {
        clientId: clientId,
        billNumber: await generateNextAccountOrBillNumber(),
        monthlyReading: parseFloat(monthlyReading).toFixed(2)
    }

    try {

        newBill = await db.transaction(async manager => {
            return await ClientBill.create(whereClause, { transaction: manager })
        })

    } catch (error) {
        console.log(error)
    }

    return newBill
}

/**
 * Updates a bill with no payment and sets relevant fields.
 *
 * @async
 * @param {ClientBill} bill - The ClientBill object to update.
 * @returns {Promise<Response>} A response object with the result message and status.
 */
async function processZeroPaymentBill(bill) {

    try {

		bill.secondReading = bill.firstReading
		bill.consumption = 0
		bill.status = "paid"
		bill.total = 0

		await db.transaction(async manager => {
            return await bill.save({ transaction: manager })
        })

		return response.Ok("No payments as water consumption is 0")

	} catch (error) {
        console.log(error)
        return response.Error("Failed to update to zero payment bill")
	}
}

/**
 * Updates a bill with the second reading and performs calculations.
 *
 * @async
 * @param {ClientBill} bill - The bill object to update.
 * @param {string} monthlyReading - The monthly reading value.
 * @param {number|null} previousBillExcess - The payment excess from the previous bill.
 * @returns {Promise<Response>} A response object with the result message and status.
 */
async function insertSecondReading(bill, monthlyReading, previousBillExcess) {

	try {

        const floatReading = parseFloat(monthlyReading).toFixed(2)
        const hasExcess = previousBillExcess !== null
        let message = "Client bill updated"

		bill.secondReading = floatReading 
		bill.consumption = floatReading - bill.firstReading

        const consumptionPrice = bill.consumption * 5

        bill.total = hasExcess ? consumptionPrice - previousBillExcess : consumptionPrice
		
        if (hasExcess) {
            message = `Client bill updated with ${previousBillExcess} deduction from previous payment`
        }

        const currentDate = new Date()
		const twoWeeks = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000))
        
        bill.dueDate = twoWeeks
	
		const fiveDaysAfterDue = new Date(twoWeeks.getTime() + (5 * 24 * 60 * 60 * 1000))
		bill.disconnectionDate = fiveDaysAfterDue
	
        await db.transaction(async manager => {
            return await bill.save({ transaction: manager })
        })

        return response.Ok(message)

	} catch(error) {
		console.log(error)
		return response.Error("Failed on updating clients 2nd reading")
	}

}

/**
 * Retrieves a client bill along with its associated partial payments.
 *
 * @param {number} billId - The ID of the client bill to retrieve.
 * @returns {Promise<ClientBill|null>} - A promise that resolves to the client bill data with partial payments or null if not found.
 */
async function getBillWithPartialPayments(billId) {
    
    let client = null

    try {
        
        client = await ClientBill.findByPk(billId, {
            include: [
                { 
                    model: PartialPayment,
                    as: "partialPayments" 
                }
            ]
        })

    } catch (error) {
        console.log(error)
    }

    return client

}


/**
 * Calculate the total amount paid from an array of partial payments.
 *
 * @function
 * @param {ClientBill} billJson - The bill object containing partialPayments array.
 * @param {Array} billJson.partialPayments - An array of partial payments.
 * @param {number} billJson.partialPayments.amountPaid - The amount paid in each partial payment.
 * @returns {string} The total amount paid formatted to two decimal places.
 * @example
 * const billJson = {
 *   partialPayments: [
 *     { amountPaid: 50 },
 *     { amountPaid: 30 },
 *     // ... other partial payments
 *   ]
 * };
 * const totalAmountPaid = calculatePartialPaymentsTotal(billJson);
 * console.log("Total Amount Paid:", totalAmountPaid);
 */
function calculatePartialPaymentsTotal(billJson) {

    const total = billJson.partialPayments.reduce((total, partialPayment) => {
        return total + partialPayment.amountPaid, 0
    })

    return parseFloat(total).toFixed(2)
}

/**
 * Handles underpaid bills and updates the bill status accordingly.
 *
 * @param {ClientBill} bill - The bill object.
 * @param {number} totalPartialPayments - Total partial payments received for the bill.
 * @param {number} amountPaid - The amount paid in the current transaction.
 * @returns {Promise<Response>} A response object with the result message and status.
 */
async function handleUnderpaidBill(bill, totalPartialPayments, amountPaid) {

    try {

        let message = ""

        const result = await db.transaction(async manager => {

            const client = await ClientConnectionStatus.findOne({
                where: { 
                    clientId: bill.clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            }, { transaction : manager })
            
            const clientNotConnected = clientConnectionStatus !== connectionStatusTypes.Connected
            const clientConnectionStatus = client.status
            
            const newPaymentAmount = totalPartialPayments + amountPaid

            if (newPaymentAmount === bill.total) {

                const lastPartialPayment = createNewPartialPayment(bill, amountPaid, manager)

                if (!lastPartialPayment) {
                    return response.Error("Failed on creating creating bills last partial payment")
                }

                bill.status = "paid"
                bill.balance = 0

                message = "Remaining balance paid"

                if (clientNotConnected) {

                    const reconnected = await reconnectClient(bill.clientId, clientConnectionStatus, manager)
                    
                    if (reconnected) {
                        message = "Remaining balance paid and client reconnected"
                    }
                }

            } else if (newPaymentAmount < bill.total) {

                const newPartialPayment = createNewPartialPayment(bill, amountPaid, manager)
                
                if (!newPartialPayment) {
                    return response.Error("Failed on creating creating the bills' last partial payment")
                }

                bill.balance = bill.total - newPaymentAmount
                message = "Remaining balance has been updated"
                
            } else if (newPaymentAmount > bill.total) {

                const lastPartialPayment = createNewPartialPayment(bill, amountPaid, manager)

                if (!lastPartialPayment) {
                    return response.Error("Failed on creating creating the bills' last partial payment")
                }
                
                bill.excess = newPaymentAmount - bill.total
                bill.status = "overpaid"
                bill.balance = 0

                message = "Remaining balance paid and excess amount saved"

                if (clientNotConnected) {

                    const reconnected = await reconnectClient(bill.clientId, clientConnectionStatus, manager)
                    
                    if (reconnected) {
                        message = "Remaining balance paid, excess saved and client reconnected"
                    }
                }

            } else {
                const error = new Error("Invalid payment amount")
                error["type"] = "payment"
                throw error
            }

            bill.amountPaid = newPaymentAmount
            await bill.save({ transaction : manager })
            
            return response.Ok(message)
        })
        
        return result

    } catch(error) {

    }
}

/**
 * Handles unpaid bills and updates the bill status accordingly.
 *
 * @param {Object} billQuery - The bill query object.
 * @param {Object} bill - The bill object.
 * @param {number} amountPaid - The amount paid in the current transaction.
 * @param {string} clientId - The ID of the client.
 * @returns {Promise<Response>} - An response object with the result message and status.
 */
async function handleUnpaidBill(billQuery, bill, amountPaid, clientId) {

    try {
        
        let message = ""

        const result = await db.transaction(async manager => {

            const client = await ClientConnectionStatus.findOne({
                where: { 
                    clientId: clientId
                },
                attributes: ['status'],
                order: [
                    ['createdAt', 'DESC']
                ]
            }, { transaction : manager })
            
            const clientNotConnected = clientConnectionStatus !== connectionStatusTypes.Connected
            const clientConnectionStatus = client.status
            
            if (bill.total === amountPaid) {

                billQuery.amountPaid = billQuery.total
                billQuery.status = "paid"
                billQuery.balance = 0
        
                message = "Bill successfully paid"
                
                if (clientNotConnected) {
        
                    const reconnected = await reconnectClient(clientId, clientConnectionStatus, manager)
                    
                    if (reconnected) {
                        message = "Bill paid and client reconnected"
                    }
                }
        
            } else if (amountPaid < bill.total) {
        
                const firstPartialPayment = await createNewPartialPayment(billQuery, amountPaid, manager)
                    
                if (!firstPartialPayment) {
                    return response.Error("Failed creating new partial payment")
                }
                
                billQuery.balance = billQuery.total - amountPaid
                billQuery.amountPaid = amountPaid
                billQuery.status = "underpaid"
        
                message = "New remaining balance has been set"
            
            } else if (amountPaid > bill.total) {
                
                billQuery.excess = amountPaid - billQuery.total
                billQuery.amountPaid = billQuery.total
                billQuery.status = "overpaid"
                
                message = "Bill paid and excess saved"
        
                if (clientNotConnected) {
        
                    const reconnected = await reconnectClient(clientId, clientConnectionStatus, manager)
        
                    if (reconnected) {
                        message = "Bill paid, excess recorded and client reconnected"
                    }
                }

            } else {
                const error = new Error("Invalid payment amount")
                error["type"] = "payment"
                throw error
            }
        
            await billQuery.save({ transaction: manager })

            // returns from the transaction and will be assigned to response
            return response.Ok(message)

        })

        return result

    } catch (error) {

        console.log(error.stack)

        const message = error.type === "payment" ? error.message : "Failed to process unpaid bill"    
        return response.Error(message)
    }

}

/**
 * Creates a new partial payment record.
 *
 * @param {Object} bill - The client bill object.
 * @param {number} amountPaid - The payment amount for the current payment.
 * @param {Transaction|null} manager - Optional Sequelize transaction manager.
 * @returns {Promise<PartialPayment|null>} A promise that resolves to the created partial payment or null if creation fails.
 */
async function createNewPartialPayment(bill, amountPaid, manager) {
    
    const createArguments = [{
        clientBillId: bill.id,
        amountPaid: amountPaid
    }]
    
    if (manager) createArguments.push({ transaction: manager })

    let partialPayment = null

    try {
        partialPayment = await PartialPayment.create(...createArguments)
    } catch (error) {
        console.log(error)
    }

    return partialPayment
}

/**
 * Reconnects a client based on the connection status.
 *
 * @param {string} clientId - The ID of the client.
 * @param {string} connectionStatus - The connection status.
 * @param {Transaction|null} manager - Optional Sequelize transaction manager.
 * @returns {Promise<boolean>} - Returns true if reconnection is successful, false otherwise.
 */
async function reconnectClient(clientId, connectionStatus, manager = null) {

    const dueForDisconnection = connectionStatus === connectionStatusTypes.DueForDisconnection

    if (!dueForDisconnection) return false

    const createArguments = [{
        clientId: clientId,
        status: connectionStatusTypes.Connected
    }]
    
    if (manager) createArguments.push({ transaction: manager })

    let reconnected = null
    
    try {
        reconnected = await ClientConnectionStatus.create(...createArguments)
    } catch (error) {
        console.log(error)
    }

    return reconnected ? true : false
}

module.exports = {
    calculatePartialPaymentsTotal,
    getBillWithPartialPayments,
    createNewPartialPayment,
    createNewPartialPayment,
    processZeroPaymentBill,
    getPreviousBillExcess,
    insertSecondReading,
    handleUnderpaidBill,
    getBillAndStatus,
    handleUnpaidBill,
    getAllClients,
    createNewBill,
    getBillById
}

