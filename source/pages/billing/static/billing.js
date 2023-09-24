// collapse

import { renderClientSection } from "../../clients/static/clients.js"
import { renderProfile } from "../../profile/static/profile.js"
import loadLogin from "../../authentication/static/login.js"
import billingTable from "../templates/billing.js"

import { 
    transition, 
    makeToastNotification,
    getById,
    queryElements,
    tryCatchWrapper
} from "../../../assets/scripts/helper.js"

/**
 * Renders the billing section, including the table of client accounts and statistics.
 */
export default async function renderBillingSection() {

	const user = await window.ipcRenderer.invoke("current_user")

    let accounts = null
    let responseMessage = null

    try {
        
        const { status, data, message } = await window.ipcRenderer.invoke("accounts")
        
        if (message) {
            responseMessage = message
        }

        accounts = status === "success" ? JSON.parse(data) : []

    } catch (error) {
        
    }

    const template = billingTable(accounts, user, responseMessage)

	getById("container").innerHTML += template

	const tableOptions = {}

	queryElements(".table-info__options").forEach(option => {
		tableOptions[option.getAttribute("data-client-id")] = option.classList
	})

    let paidClients = 0
    let unpaidClients = 0
    let overpaidClients = 0

    let meterNumbers = []
    let accountNumbers = []
    let names = []

    if (accounts) {

        accounts.map(bill => {
            
            const clientBills = bill.Bills

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
        const searchFilter = getById("search-box-filter")
        const searchElement = getById("search-box-input")
        
        searchElement.oninput = () => {

            const tableRows = queryElements(".table-info")

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
                const tableRows = queryElements(".table-info")
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
                rerenderTable(accountNumbers.filter(data => find(data, searchElement.value)), "data-accounts-number")
            }

        }
    
    }
    
    setStatistics(paidClients, unpaidClients, overpaidClients)

    window.onclick = async event => {
        const targetId = event.target.getAttribute("id")
        if (targetId === "clients") transition(renderClientSection)
        if (targetId === "profile") transition(renderProfile)
        if (targetId === "logout") loadLogin()
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
    const paidCustomersElement = getById("paid-clients")
    const unpaidCustomersElement = getById("unpaid-clients")
    const overpaidCustomersElement = getById("overpaid-clients")

    if (paidCustomersElement) paidCustomersElement.innerHTML = paid
    if (unpaidCustomersElement) unpaidCustomersElement.innerHTML = unpaid
    if (overpaidCustomersElement) overpaidCustomersElement.innerHTML = overpaid
}