import { renderCLIENTBuilder } from "../../CLIENTBuilder/static/CLIENTBuilder.js"
import { CLIENTTable, renderTable } from "../templates/CLIENTs.js"
import renderBillingSection from "../../billing/static/billing.js"
import { renderProfile } from "../../profile/static/profile.js"
import loadLogin from "../../authentication/static/login.js"

import { 
    makeToastNotification, 
    transition, 
	getById,
	queryElement,
	queryElements
} from "../../../assets/scripts/helper.js"

const dialogElement = queryElement("dialog")

/**
 * Renders the Client section, including Client data table, options, and event handlers.
 * 
 * @returns {Promise<void>} - Resolves when the Client section is fully rendered.
 */
export async function renderCLIENTSection() {

    const user = await window.ipcRenderer.invoke("current_user")

    let [CLIENTs, responseMessage] = await retrieveCLIENTsBy()

    getById("container").innerHTML += CLIENTTable(user, CLIENTs, responseMessage)

    const searchFilterOptions = [
        "accountNumber",
        "relationshipStatus",
        "meterNumber",
        "fullName",
        "email",
        "age"
    ]

    const searchFilter = getById("Client-search-box-filter")
    const searchElement = getById("Client-search-box-input")
    
    searchElement.oninput = () => {

        const tableRows = queryElements(".table-info")
        const validationPassed = searchValueValidation(tableRows, searchElement.value, searchFilter.value)
    
        if (validationPassed) {
            updateTableRowsBy(searchFilter.value, searchElement.value)
        }
    }

    setTimeout(() => {getById("section-type-container").classList.add("active")}, 500)
    
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
                transition(renderCLIENTBuilder)
                break;
            
            case "Client-options-toggle":
                getById("Client-options-toggle-options-list").classList.toggle("active")
                break;
            
            case "Client-options-filter":
                getById("Client-filter-toggle-filter-list").classList.toggle("active")
                break;
            
            case "filter-button-disconnected-CLIENTs":
                await changeTableByFilter(elementId, "Disconnected")
                break;
            
            case "filter-button-due-CLIENTs":
                await changeTableByFilter(elementId, "Due for Disconnection")
                break;
            
            case "filter-button-connected-CLIENTs":
                await changeTableByFilter(elementId, "Disconnected")
                break;

            default:
                break;
        }
        
    }

    function searchValueValidation(tableRows, searchValue, searchFilterValue) {
        if (!tableRows) {
            makeToastNotification("No CLIENTs yet")
            return false
        }

        if (searchValue.trim() === '') {
            tableRows.forEach(row => row.style.display = "grid")
            return false
        }
        
        if (!searchFilterOptions.includes(searchFilterValue)) {
            searchFilterValue = ''
            makeToastNotification("Choose a filter first")
            return false
        }

        return true
    }

    async function updateTableRowsBy(column, data) {
        const [CLIENTs, message] = await retrieveCLIENTsBy(column, data)
        getById("table-data-rows").innerHTML = renderTable(CLIENTs, message)
    }

    async function changeTableByFilter(elementId, filter) {
        const filterButtons = queryElements(".Client-filter-toggle-filter-list__item")
        filterButtons.forEach(button => {
            button.style.backgroundColor = button.id !== elementId ? "var(--primary)" : "var(--accent)"
        })
        await updateTableRowsBy("connectionStatuses.status", filter)
    }
      
    async function retrieveCLIENTsBy(columnName, columnData) {
        const response = await window.ipcRenderer.invoke("CLIENTs", { columnName, columnData })
        return [response.status === "failed" ? null : JSON.parse(response.data), response.message]
    }

}