import { renderClientBuilder } from "../../clientBuilder/static/clientBuilder.js"
import { makeToastNotification } from "../../../assets/scripts/toast.js"
import { clientTable, renderTable } from "../templates/clients.js"
import renderBillingSection from "../../billing/static/billing.js"
import { renderProfile } from "../../profile/static/profile.js"
import loadLogin from "../../authentication/static/login.js"

import { 
    transition, 
	getById,
	queryElements
} from "../../../assets/scripts/helper.js"

/**
 * Renders the client section, including client data table, options, and event handlers.
 * 
 * @returns {Promise<void>} - Resolves when the client section is fully rendered.
 */
export async function renderClientSection() {

    const user = await window.ipcRenderer.invoke("current_user")

    let [clients, responseMessage] = await retrieveClientsBy()

    getById("container").innerHTML += clientTable(user, clients, responseMessage)

    const searchFilterOptions = [
        "accountNumber",
        "relationshipStatus",
        "meterNumber",
        "fullName",
        "email",
        "age"
    ]

    const searchFilter = getById("client-search-box-filter")
    const searchElement = getById("client-search-box-input")
    
    searchElement.oninput = () => {

        const tableRows = queryElements(".table-info")
        const validationPassed = searchValueValidation(tableRows, searchElement.value, searchFilter.value)
    
        if (validationPassed) {
            updateTableRowsBy(searchFilter.value, searchElement.value)
        }
    }

    setTimeout(() => getById("section-type-container").classList.add("active"), 500)
    
    window.onclick = async event => {
        
        switch (event.target.getAttribute("id")) {

            case "billing":
                transition(renderBillingSection)
                break;
            
            case "profile":
                transition(renderProfile)
            break;
            
            case 'logout':
                transition(loadLogin)
            break;
            
            case "new-connection":
                transition(renderClientBuilder)
            break;
            
            case "client-options-toggle":
                getById("client-options-toggle-options-list").classList.toggle("active")
            break;
            
            case "client-options-filter":
                getById("client-filter-toggle-filter-list").classList.toggle("active")
            break;
            
            case "filter-button-disconnected-clients":
                await changeTableByFilter(elementId, "Disconnected")
            break;
            
            case "filter-button-due-clients":
                await changeTableByFilter(elementId, "Due for Disconnection")
            break;
            
            case "filter-button-connected-clients":
                await changeTableByFilter(elementId, "Disconnected")
            break;
        }
        
    }

    function searchValueValidation(tableRows, searchValue, searchFilterValue) {
        if (!tableRows) {
            makeToastNotification("No clients yet")
            return false
        }

        if (searchValue.trim() === '') {
            tableRows.forEach(row => row.style.display = "grid")
            return false
        }
        
        if (!searchFilterOptions.includes(searchFilterValue)) {
            makeToastNotification("Choose a filter first")
            return false
        }

        return true
    }

    async function updateTableRowsBy(column, data) {
        const [clients, message] = await retrieveClientsBy(column, data)
        getById("table-data-rows").innerHTML = renderTable(clients, message)
    }

    async function changeTableByFilter(elementId, filter) {
        const filterButtons = queryElements(".client-filter-toggle-filter-list__item")
        filterButtons.forEach(button => {
            button.style.backgroundColor = button.id !== elementId ? "var(--primary)" : "var(--accent)"
        })
        await updateTableRowsBy("connectionStatuses.status", filter)
    }
      
    async function retrieveClientsBy(columnName, columnData) {
        const response = await window.ipcRenderer.invoke("clients", { columnName, columnData })

        if (response.status === "failed") {
            return [null, response.message]
        } else {
            return [JSON.parse(response.data), null]
        }
    }

}