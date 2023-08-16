import { transition, makeToastNotification } from "../../../helper.js"
import loadLogin from "../../authentication/static/login.js"
import { renderClientSection } from "../../clients/static/clients.js"
import billingTable from "../templates/billing.js"
import { newBillForm } from "../templates/newBillForm.js"
import { payBillForm } from "../templates/payBillForm.js"

const element = id => document.getElementById(id)
const dialogElement = document.querySelector("dialog")

export async function renderBillingSection() {

	const user = await window.ipcRenderer.invoke("current_user")
	let bills = null
	let responseMessage = null

    try {
        const { status, data, message } = await window.ipcRenderer.invoke("bills");
        const isSuccess = status === "success";

        bills = isSuccess ? JSON.parse(data) : [];
        console.log({ status, message, bills });
    } catch (error) {
        console.error("Error fetching billing data:", error)
    }

    const template = billingTable(bills, user, responseMessage)

	element("container").innerHTML += template

	const tableOptions = {}

	document.querySelectorAll(".table-info__options").forEach(option => {
		tableOptions[option.getAttribute("data-client-id")] = option.classList
	})

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
            openNewBillDialog(bills[event.target.getAttribute("data-client-index")])
            tableOptions[event.target.parentElement.getAttribute("data-client-id")].remove("active")
        }

        if (classList.contains("pay")) {
            !classList.contains("had-paid") ? 
                openPayBillDialog(bills[event.target.getAttribute("data-client-index")])
            :
                makeToastNotification("Client had already paid")

            tableOptions[event.target.parentElement.getAttribute("data-client-id")].remove("active")
        }

        // Add event listeners to close buttons
        if (elementId === "new-bill-form-close" || elementId === "pay-bill-form-close") {
            closeDialog(event)
        }

        if (elementId === "new-bill-form-submit" || elementId === "pay-bill-form-submit") {
            processForm(elementId === "new-bill-form-submit" ? "new" : "pay", event)
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
function openNewBillDialog(billObject) {
    dialogElement.innerHTML = newBillForm(billObject)
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

	const clientId = element(`${type}-bill-form-submit`).getAttribute("data-client-id")
	const billId = element(`${type}-bill-form-submit`).getAttribute("data-bill-id")
	const paymentAmountInput = element(`${type}-bill-form-input-box-input`)
	const errorElement = element(`${type}-bill-form-input-box-header-error`)

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
		} else {
			makeToastNotification(response.toast[0])
		}
	}

    return
}
