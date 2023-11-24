const { connectionStatusTypes } = require("../../utilities/constants")

const response = require("../../utilities/response")
const { ipcMain } = require("electron")

const Client = require("../../../models/Client")

const {
    calculatePartialPaymentsTotal,
    getBillWithPartialPayments,
    processZeroPaymentBill,
    getPreviousBillExcess,
    insertSecondReading,
    handleUnderpaidBill,
    getBillAndStatus,
    handleUnpaidBill,
    createNewBill,
    getAllClients,
    getBillById
} = require("./functions")

// ClientBill.destroy({
// 	where: {}
// })

// Retrieves a list of bills with associated client data.
ipcMain.handle("accounts", async event => {

    const accounts = await getAllClients()
        
    if (accounts && accounts.length > 0) {
        return response.success().addObject("data", JSON.stringify(accounts)).getResponse()
    } else {
        return response.Error("No accounts yet")
    }

})

// Retrieves the the bill of a client.
ipcMain.handle("get-bill", async (event, args) => {

    const { billId, clientId } = args
    
    if (!billId) {
        return response.Error("Bill id not found")
    }

    if (!clientId) {
        return response.Error("Client id not found")
    }

    const bill = await getBillAndStatus(clientId)

    if (!bill) {
        return response.Error("Cannot find clients bill")
    }

    return response.success().addObject("data", JSON.stringify(bill)).getResponse()
})

ipcMain.handle("print-bill", async (event, args) => {

    const { clientId } = args

    if (!clientId) return response.Error("Missing client id")

    let clientBill = null
    let message = "Cannot find clients bill"

    try {
        clientBill = await Client.findByPk(clientId)
    } catch (error) {
        console.log(error)
        return response.Error(message)
    }

    if (!clientBill) {
        return response.Error(message)
    }

    // MISSING CODE TO PRINT RECEIPT
})

ipcMain.handle("new-bill", async (event, args) => {

    const { clientId, monthlyReading, billId } = args

    if (!clientId) {
        return response.Error("Missing client id")
    }

    if (!monthlyReading) {
        return response.Error("Missing monthly reading")
    }

    const client = await getBillAndStatus(clientId)

    if (!client) {
        return response.Error("Cannot find client")
    }

    const hasConnectionStatus = client.connectionStatuses.length > 0
    const latestNotConnected = client.connectionStatuses[0].status !== connectionStatusTypes.Connected

    /**
     * return if the client doesn't have any connection status records yet or the latest connection status the client (if they have any) is not "connected" 
     * which indicates that the client may currently be "due for disconnection" or is "disconnected"
     */
    if (hasConnectionStatus && latestNotConnected) {
        return response.Error(`Set the clients status to "Connected" first`)
    }

    const clientBill = await getBillById(billId)

    const previousBillExcess = await getPreviousBillExcess(billId)

    let latestBillAlreadyPaid = false

    if (clientBill) {
        const latestBill = clientBill.toJSON()

        const billPaid = latestBill.status === "paid"
        const billOverpaid = latestBill.status === "overpaid"
        const hasSecondReading = latestBill.secondReading !== null

        const OverpaidWithSecondReading = billOverpaid && hasSecondReading

        latestBillAlreadyPaid = billPaid || OverpaidWithSecondReading
    }

    const NotPaidWithSecondReading = !latestBillAlreadyPaid && clientBill.secondReading !== null

    if (clientBill && NotPaidWithSecondReading) {
        return response.Error("Current bill must be paid first before proceeding")
    }

    const noBillOrAlreadyPaid = !clientBill || latestBillAlreadyPaid
    
    if (noBillOrAlreadyPaid) {

        const monthlyReading = parseFloat(monthlyReading).toFixed(2)
        
        let newBill = await createNewBill(client.id, monthlyReading)

        if (!newBill) {
            return response.Error("New client bill creation failed")
        }

        return response
                .success()
                .addToast("New client bill created")
                .addObject("billId", newBill.id)
                .getResponse()
    
    } else {

        // Bill updates for 2nd reading or exact payment

        if (!billId) {
            return response.Error("Bill id not found")
        }

        const bill = await getBillById(billId)

        if (!bill) {
            return response.Error("Bill not found")
        }

        //If first reading matches new reading, then there is nothing to pay
        const nothingToPay = bill.firstReading === parseFloat(monthlyReading)

        if (nothingToPay) {
            return await processZeroPaymentBill(bill)
        } else {
            return await insertSecondReading(bill, monthlyReading, previousBillExcess)
        }
            
    }

})

ipcMain.handle("pay-bill", async (event, args) => {

    const { amount, billId } = args

    if (!amount) {
        return response.Error("Missing payment amount")
    }
    
    if (!billId) {
        return response.Error("Bill id missing")
    }

    const amountPaid = parseFloat(amount)

    const billQuery = await getBillWithPartialPayments(billId)
    
    if (!billQuery) {
        return response.Error("Cannot find bill")
    }

    const bill = billQuery.toJSON()

    const totalPartialPayments = calculatePartialPaymentsTotal(bill)

    switch (bill.status) {
        
        case "paid":
            return response.Error("Bill had already been paid")
        
        case "underpaid":
            return await handleUnderpaidBill(bill, totalPartialPayments, amountPaid)
    
        case "unpaid":
            return await handleUnpaidBill(billQuery, bill, amountPaid, bill.clientId)
        
        default:
            return response.Error("Wrong bill status type");

    }

})
