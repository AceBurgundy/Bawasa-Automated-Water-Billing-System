// @collapse

import { renderClientBuilder } from "../../clientBuilder/static/clientBuilder.js"
import { reconnectClientForm } from "../templates/reconnectClientForm.js"
import renderBillingSection from "../../billing/static/billing.js"
import { renderProfile } from "../../profile/static/profile.js"
import loadLogin from "../../authentication/static/login.js"
import { clientTable } from "../templates/clients.js"

import { 
    makeToastNotification, 
    transition, 
    tryCatchWrapper,
	getById,
	queryElement,
	queryElements
} from "../../../assets/scripts/helper.js"

const dialogElement = queryElement("dialog")

/**
 * Renders the client section, including client data table, options, and event handlers.
 * 
 * @returns {Promise<void>} - Resolves when the client section is fully rendered.
 */
export async function renderClientSection() {

    const user = await window.ipcRenderer.invoke("current_user")
    let clients = null
    let responseMessage = null

    await tryCatchWrapper(async () => {
        const response = await window.ipcRenderer.invoke("clients")

        if (response.status === "success") {
            clients = JSON.parse(response.data)
        } else {
            responseMessage = response.message
        }
    })
    
    getById("container").innerHTML += clientTable(user, clients, responseMessage)

    setTimeout(() => {getById("section-type-container").classList.add("active")}, 500)

    const rowOptionsToggleList = {}

    queryElements(".table-info__options").forEach(option => {
        rowOptionsToggleList[option.getAttribute("data-client-id")] = option.classList
    })

    window.onclick = async event => {
        
        const elementId = event.target.getAttribute("id") 
        const classList = event.target.classList

        if (elementId === "billing") {
            transition(renderBillingSection)
        }

        if (elementId === "profile") {
            transition(renderProfile)
        }

        if (elementId === "new-connection") {
            transition(renderClientBuilder)
        }

        if (elementId === "client-options-toggle") {

            const optionsList = getById("client-options-toggle-options-list")

            if (optionsList.classList.contains("active")) {
                optionsList.classList.remove("active")
            } else {
                optionsList.classList.add("active")
            }
        }

        if (elementId === 'logout') {
            transition(loadLogin)
        }

        if (classList.contains("table-menu")) {
            toggleRowOptions(event)
        }

        if (classList.contains("edit")) {
            editClient(event)
        }

        if (classList.contains("reconnect")) {
            await renderReconnectForm(event)
        }

        if (elementId === "reconnect-form-close") {
            closeDialog(event)
        }

        if (elementId === "reconnect-form-submit") {
            await processReconnection(event)
        }

    }

    /**
     * Renders the reconnect form for a specific client based on the event target.
     * 
     * @param {Event} event - The event that triggered the rendering of the reconnect form.
     */
    async function renderReconnectForm(event) {

        const { target } = event
        
        const rowRootParent = target.parentElement.parentElement.parentElement

        const clientId = target.parentElement.getAttribute("data-client-id")
        if (!clientId) return makeToastNotification("Client id not found")

        if (rowRootParent.classList.contains("table-info")) {
            rowRootParent.id = `client-row-${clientId}`
        }

        const response = await window.ipcRenderer.invoke("get-client", { clientId: clientId })
        if (response.status === "failed") return makeToastNotification(response.toast[0])

        const client = JSON.parse(response.data)
        dialogElement.innerHTML = reconnectClientForm(client)
        dialogElement.id = "reconnect-form-box"
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
     * Shows the client builder section
     * 
     * @param {Event} event - The event that triggered the client edit action.
     */
    async function editClient(event) {
        const clientId = event.target.parentElement.getAttribute("data-client-id")
        const clientData = Object.values(clients).filter(client => client.id === parseInt(clientId))
        transition(() => { renderClientBuilder(true, clientData) })
    }

    /**
     * Processes the reconnection of a client.
     * 
     * @param {Event} event - The event that triggered the client reconnection.
     */
    async function processReconnection(event) {

        event.preventDefault()
        const clientId = event.target.dataset.clientId
        const reconnectFormInput = getById("reconnect-form-input-box-input")
        const errorMessage = getById("reconnect-form-input-box-header-error")
        const expectedPayment = reconnectFormInput.dataset.total
        const paidAmount = reconnectFormInput.value

        if (paidAmount !== expectedPayment) {
            errorMessage.textContent = "The full amount must be paid in order to continue"
            return
        }

        const response = await window.ipcRenderer.invoke("reconnect-client", {
            clientId: clientId,
            paidAmount: paidAmount
        })

        if (response.status === "failed") return makeToastNotification(response.toast[0])

        closeDialog(event)
        setTimeout(() => makeToastNotification(response.toast[0]), 200)
        const rowRootParent = getById(`client-row-${clientId}`)
        rowRootParent.children[6].firstElementChild.textContent = window.connectionStatusTypes.Connected
        rowRootParent.removeAttribute(`id`)
        rowRootParent.querySelector(".table-info__options-item.reconnect").remove()
    }

    /**
     * Processes showing and handling the option for a tables' row
     * 
     * @param {Event} event - The event that triggered the option.
     * @returns 
     */
    function toggleRowOptions(event) {
        const clientId = event.target.getAttribute("data-client-id")

        if (!rowOptionsToggleList) return

        Object.keys(rowOptionsToggleList).forEach(id => {
            if (id === clientId && rowOptionsToggleList[id].contains("active")) {
                rowOptionsToggleList[id].remove("active")
                return
            }
            if (id !== clientId) {
                rowOptionsToggleList[id].remove("active")
            } else {
                rowOptionsToggleList[id].add("active")
            }
        })
    }
}