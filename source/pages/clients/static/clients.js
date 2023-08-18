import { renderClientBuilder } from "../../client_builder/static/client_builder.js"
import { renderBillingSection } from "../../billing/static/billing.js"
import loadLogin from "../../authentication/static/login.js"
import { transition } from "../../../assets/scripts/helper.js"
import { clientTable } from "../templates/clients.js";

export async function renderClientSection() {

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
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

    setTimeout(() => {document.getElementById("section-type-container").classList.add("active")}, 500);

    const tableOptions = {}

    document.querySelectorAll(".table-info__options").forEach(option => {
        tableOptions[option.getAttribute("data-client-id")] = option.classList
    })

    window.onclick = event => {
        
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

    }

}