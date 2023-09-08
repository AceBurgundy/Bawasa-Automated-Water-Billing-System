// @collapse

import { transition, makeToastNotification } from "../../../assets/scripts/helper.js"
import { renderClientSection } from "../../clients/static/clients.js"
import { updateBillingTableRow } from "./updateBillingTableRow.js"
import loadLogin from "../../authentication/static/login.js"
import { newBillForm } from "../templates/newBillForm.js"
import { payBillForm } from "../templates/payBillForm.js"
import billingTable from "../templates/billing.js"

const elementId = id => document.getElementById(id)
const dialogElement = document.querySelector("dialog")

let bills = null
let responseMessage = null

/**
 * Renders the billing section, including the table of client bills and statistics.
 */
export async function renderBillingSection() {

	const user = await window.ipcRenderer.invoke("current_user")

    await getBills()

    const template = billingTable(bills, user, responseMessage)

	elementId("container").innerHTML += template

	const tableOptions = {}

	document.querySelectorAll(".table-info__options").forEach(option => {
		tableOptions[option.getAttribute("data-client-id")] = option.classList
	})

    let paidClients = 0
    let unpaidClients = 0
    let overpaidClients = 0

    let meterNumbers = []
    let accountNumbers = []
    let names = []

    if (bills) {

        bills.map(bill => {
            
            const clientBills = bill.Client_Bills

            if (clientBills.length > 0) {
                const recentBill = clientBills[0]

                if (recentBill.paymentStatus !== "") {

                    const recentBillStatus = recentBill.paymentStatus

                    if (recentBillStatus === "paid") {
                        paidClients += 1
                    } 
    
                    if (recentBillStatus === "unpaid") {
                        unpaidClients += 1
                    }    

                    if (recentBillStatus === "overpaid") {
                        overpaidClients += 1
                    }
                }

            }

            meterNumbers.push(bill.meterNumber)
            accountNumbers.push(bill.accountNumber)
            names.push(bill.fullName)
        })    

        const searchFilterOptions = ["Full Name", "Meter Number", "Account Number"]
        const searchFilter = elementId("search-box-filter")
        const searchElement = elementId("search-box-input")
        
        searchElement.oninput = () => {

            const tableRows = document.querySelectorAll(".table-info")

            if (!tableRows) {
                makeToastNotification("No clients yet")
                return
            }

            if (searchElement.value.trim() === '') {
                tableRows.forEach(row => row.style.display = "grid")
                return
            }
            
            if (!searchFilterOptions.includes(searchFilter.value)) {
                makeToastNotification("Choose a filter first")
                return
            }

            const find = (data, value) => data.toLowerCase().includes(value.toLowerCase())
            const rerenderTable = (filteredClients, attribute) => {
                const tableRows = document.querySelectorAll(".table-info")
                tableRows.forEach(row => {
                    if (!filteredClients.includes(row.getAttribute(attribute))) {
                        row.style.display = "none"
                    } else {
                        row.style.display = "grid"
                    }
                })
            }

            if (searchFilter.value === "Full Name") {
                rerenderTable(names.filter(data => find(data, searchElement.value)), "data-full-name")
            }

            if (searchFilter.value === "Meter Number") {
                rerenderTable(meterNumbers.filter(data => find(data, searchElement.value)), "data-meter-number")
            }
            
            if (searchFilter.value === "Account Number") {
                rerenderTable(accountNumbers.filter(data => find(data, searchElement.value)), "data-account-number")
            }

        }
    
    }
    
    setStatistics(paidClients, unpaidClients, overpaidClients)

    // Event delegation
    window.onclick = async event => {
        const elementId = event.target.getAttribute("id")
        const classList = event.target.classList

        if (elementId === "clients") {
            transition(renderClientSection)
        }

        if (elementId === "logout") {
            loadLogin()
        }

        if (classList.contains("table-menu")) {
            handleTableMenuClick(tableOptions, event)
        }

        if (classList.contains("add")) {
            const clientHasPaid = event.target.parentElement.getAttribute("data-client-has-paid")
            openNewBillDialog(bills[event.target.getAttribute("data-client-index")], clientHasPaid)
            tableOptions[event.target.parentElement.getAttribute("data-client-id")].remove("active")
        }

        if (classList.contains("pay")) {

            const parent = event.target.parentElement
            const paymentStatus = parent.getAttribute("data-payment-status")

            if (parent.getAttribute("data-client-has-bills") === "false") 
                return makeToastNotification("Client has no bills yet")

            paymentStatus === "paid" || paymentStatus === "overpaid" ?
                makeToastNotification("Client had already paid")
            :
                openPayBillDialog(bills[event.target.getAttribute("data-client-index")])

            tableOptions[event.target.parentElement.getAttribute("data-client-id")].remove("active")
        }

        // Add event listeners to close buttons
        if (elementId === "new-bill-form-close" || elementId === "pay-bill-form-close") {
            closeDialog(event)
        }

        if (elementId === "new-bill-form-submit" || elementId === "pay-bill-form-submit") {
            processForm(elementId === "new-bill-form-submit" ? "new" : "pay", event)
        }

        if (classList.contains("print")) {
            const clientId = event.target.parentElement.getAttribute("data-client-id")
            const response = await window.ipcRenderer.invoke("print-bill", { clientId: clientId})

            if (response.status === "success") {
                makeToastNotification("success")
            } else {
                makeToastNotification(response.toast[0])
            }
        }

    }
}

/**
 * Handles the showing and hiding of menu options of each row
 * @typedef {Object<string, DOMTokenList>} TableOptions - Objects containing bill id as key and 
 * the elements classList as the value
 * 
 * ex:
 * 
 * div .active.hello.work
 * 
 * tableOptions = {
 *  1 : ["active", "hello", "work"]
 * }
 * 
 * @param {Event} event - The click event.
 */
function handleTableMenuClick(tableOptions, event) {
    const clientId = event.target.getAttribute("data-client-id")
    const clientDisconnected = event.target.dataset.clientDisconnected

    if (clientDisconnected === true) return makeToastNotification("Reconnect client first")

    if (tableOptions) {
        Object.keys(tableOptions).forEach(id => {
            if (id === clientId && tableOptions[id].contains("active")) {
                tableOptions[id].remove("active")
                return
            }
            if (id !== clientId) {
                tableOptions[id].remove("active")
            } else {
                tableOptions[id].add("active")
            }
        })
    }
}

/**
 * Opens a dialog with the new bill form.
 * @param {number} clientIndex - The index of the client.
 */
function openNewBillDialog(billObject, forNewBill) {
    dialogElement.innerHTML = newBillForm(billObject, JSON.parse(forNewBill))
    dialogElement.id = "new-bill-box"
    dialogElement.showModal()
}

/**
 * Opens a dialog with the pay bill form.
 * @param {number} clientIndex - The index of the client.
 */
async function openPayBillDialog(billObject) {
    dialogElement.innerHTML = await payBillForm(billObject)
    dialogElement.id = "pay-bill-box"
    dialogElement.showModal()
}

/**
 * Closes the dialog and clears its innerHTML leaving an empty dialog element.
 * @param {Event} event - The click event.
 */
function closeDialog(event) {
    event.preventDefault()
    dialogElement.close()
    dialogElement.innerHTML =
    dialogElement.id = ""
}

/**
 * Processes a form based on the action type.
 * @param {string} actionType - The type of action (e.g., "new" or "pay").
 * @param {Event} event - The form submission event.
 */
async function processForm(type, event) {
	event.preventDefault()

	const clientId = elementId(`${type}-bill-form-submit`).getAttribute("data-client-id")
	const billId = elementId(`${type}-bill-form-submit`).getAttribute("data-bill-id")
	const paymentAmountInput = elementId(`${type}-bill-form-input-box-input`)
	const errorElement = elementId(`${type}-bill-form-input-box-header-error`)

    const paymentAmount = paymentAmountInput.value

	if (isNaN(paymentAmount)) {
		errorElement.innerHTML = "Must be a number"
		return
	}

	if (!paymentAmount) {
		errorElement.innerHTML = "Payment amount cannot be empty"
		return
	}

	if (clientId, paymentAmount) {
		
        const data = type === "pay" ? {
                clientId: clientId,
				amount: paymentAmount,
				billId: billId !== "" ? billId : null,
			} : {
				clientId: clientId,
				monthlyReading: paymentAmount,
				billId: billId !== "" ? billId : null,
			}

		const response = await window.ipcRenderer.invoke(`${type}-bill`, data)
        
		if (response.status === "success") {
			makeToastNotification(response.toast[0])
            closeDialog(event)

            console.log(billId);

            // updates record in the table
            billId ?
                await renderUpdatedBill(billId, clientId)
            :
                await renderUpdatedBill(response.billId, clientId)

            getBills()

        } else {
			makeToastNotification(response.toast[0])
		}
	}

    return
}

/**
 * Update the column of the affected table row
 * 
 * @param {string} billId - the id used to get the clients bill
 * @param {string} clientId - the id used to get the client
*/
async function renderUpdatedBill(billId, clientId) {
    
	const response = await window.ipcRenderer.invoke("get-bill", { billId: billId, clientId: clientId })

    if (response.status === "failed") {
        response.toast[0] && makeToastNotification(response.toast[0])
        return
    }

    const newBill = JSON.parse(response.data)
	const rowToBeUpdated = document.querySelector(`[data-meter-number='${newBill.meterNumber}']`)
	const beforeOldRow = rowToBeUpdated !== null && rowToBeUpdated.previousElementSibling
	const afterOldRow = rowToBeUpdated !== null && rowToBeUpdated.nextElementSibling

    //current row is the first row in the table
    if (beforeOldRow === null && afterOldRow === null) updateBillingTableRow(newBill, 0, rowToBeUpdated)

    //row has no other row after it
	if (beforeOldRow && afterOldRow || beforeOldRow && afterOldRow === null) {
        console.log("called first if");
        updateBillingTableRow(newBill, parseInt(beforeOldRow.getAttribute("data-client-index")) + 1, rowToBeUpdated)
        return
    }

    //row has no other row before it
	if (beforeOldRow === null && afterOldRow) {
        console.log("called second if");
        updateBillingTableRow(newBill, parseInt(afterOldRow.getAttribute("data-client-index")) - 1, rowToBeUpdated)
        return
    }

}

/**
 * Retrieves billing data using the Electron IPC Renderer and sets the bills and responseMessage global variables values
 * @async
 * @function getBills
 * @throws {Error} If an error occurs while fetching billing data.
 * @returns {void}
 */
async function getBills() {

    try {
        
        const { status, data, message } = await window.ipcRenderer.invoke("bills")
        const isSuccess = status === "success"

        bills = isSuccess ? JSON.parse(data) : []
        
        if (message) {
            responseMessage = message
        }

    } catch (error) {
        console.error("Error fetching billing data:", error)
    }
}

/**
 * Sets the value for paid, unpaid, overpaid statistics element
 * 
 * @param {Number} paid - holds the value for the number of paid clients
 * @param {Number} unpaid - holds the value for the number of unpaid clients
 * @param {Number} overpaid - holds the value for the number of overpaid clients
 */
function setStatistics(paid, unpaid, overpaid) {
    const paidCustomersElement = elementId("paid-clients")
    const unpaidCustomersElement = elementId("unpaid-clients")
    const overpaidCustomersElement = elementId("overpaid-clients")

    if (paidCustomersElement) paidCustomersElement.innerHTML = paid
    if (unpaidCustomersElement) unpaidCustomersElement.innerHTML = unpaid
    if (overpaidCustomersElement) overpaidCustomersElement.innerHTML = overpaid
    
}