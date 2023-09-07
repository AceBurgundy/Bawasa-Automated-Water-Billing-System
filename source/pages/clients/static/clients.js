import { makeToastNotification, transition } from "../../../assets/scripts/helper.js"
import { renderClientBuilder } from "../../client_builder/static/client_builder.js"
import { reconnectClientForm } from "../templates/reconnectClientForm.js"
import { renderBillingSection } from "../../billing/static/billing.js"
import { connectionStatusTypes } from "../../../../constants.js"
import loadLogin from "../../authentication/static/login.js"
import { clientTable } from "../templates/clients.js"

const dialogElement = document.querySelector("dialog")

export async function renderClientSection() {

    const user = await window.ipcRenderer.invoke("current_user")
    let clients = null
    let responseMessage = null

    async function fetchClientData() {

        try {

            const response = await window.ipcRenderer.invoke("clients")

            if (response.status === "success") {
                clients = JSON.parse(response.data)
                console.log(clients)
            } else {
                responseMessage = response.message
            }
            
        } catch (error) {
            console.error("Error fetching client data:", error)
        }
    }
      
    await fetchClientData()
    
    document.getElementById("container").innerHTML += clientTable(user, clients, responseMessage)

    setTimeout(() => {document.getElementById("section-type-container").classList.add("active")}, 500)

    const tableOptions = {}

    document.querySelectorAll(".table-info__options").forEach(option => {
        tableOptions[option.getAttribute("data-client-id")] = option.classList
    })

    window.onclick = async event => {
        
        const elementId = event.target.getAttribute("id") 
        const classList = event.target.classList

        if (elementId === "billing") {
            transition(renderBillingSection)
        }

        if (elementId === "new-connection") {
            transition(renderClientBuilder)
        }

        if (elementId === "client-options-toggle") {

            const optionsList = document.getElementById("client-options-toggle-options-list")

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

        if (classList.contains("edit")) {

            const clientId = event.target.parentElement.getAttribute("data-client-id")
            const clientData = Object.values(clients).filter(client => client.id === parseInt(clientId))
            
            transition(() => {renderClientBuilder(true, clientData)})
        }

        if (classList.contains("reconnect")) {
            const clientId = event.target.parentElement.getAttribute("data-client-id")
            await renderReconnectForm(clientId)            
        }

        if (elementId === "reconnect-form-close") {
            closeDialog(event)
        }

        if (elementId === "reconnect-form-submit") {
            await processReconnection(event)
        }

    }

    async function renderReconnectForm(clientId) {
        if (!clientId) return makeToastNotification("Client id not found")
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

    async function processReconnection(event) {

        event.preventDefault()
        const clientId = event.target.dataset.clientId
        const reconnectFormInput = document.getElementById("reconnect-form-input-box-input")
        const expectedPayment = reconnectFormInput.dataset.total
        const paidAmount = reconnectFormInput.value

        if (paidAmount !== expectedPayment) {
            makeToastNotification("The full amount must be paid in order to continue")
        } else {
            
            const response = window.ipcRenderer.invoke("reconnect-client", {
                clientId: clientId,
                paidAmount: paidAmount
            })

            if (response.status === "failed") {
                makeToastNotification(response.toast[0])
            } else {
                closeDialog(event)
                setTimeout(() => {
                    makeToastNotification("Client reconnected")
                }, 200)
                const clientRow = document.getElementById(`client-row-${clientId}`)
                clientRow.children[7].firstElementChild.textContent = connectionStatusTypes.Connected
                event.target.remove()
            }
        }
    }
}