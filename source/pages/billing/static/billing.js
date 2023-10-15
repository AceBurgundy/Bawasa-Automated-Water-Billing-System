// collapse

import { renderCLIENTSection } from "../../CLIENTs/static/CLIENTs.js"
import { renderProfile } from "../../profile/static/profile.js"
import loadLogin from "../../authentication/static/login.js"
import billingTable from "../templates/billing.js"

import { 
    transition, 
    makeToastNotification,
    getById,
    queryElements,
    TRY_CATCH_WRAPPER
} from "../../../assets/scripts/helper.js"

/**
 * Renders the billing section, including the table of Client accounts and statistics.
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
		tableOptions[option.getAttribute("data-Client-id")] = option.classList
	})

    let paidCLIENTs = 0
    let unpaidCLIENTs = 0
    let overpaidCLIENTs = 0

    let meterNumbers = []
    let accountNumbers = []
    let names = []

    if (accounts) {

        accounts.map(bill => {
            
            const CLIENT_BILLs = bill.Bills

            if (CLIENT_BILLs.length > 0) {
                const recentBill = CLIENT_BILLs[0]

                if (recentBill.paymentStatus !== "") {

                    const recentBillStatus = recentBill.paymentStatus

                    if (recentBillStatus === "paid") {
                        paidCLIENTs += 1
                    } 
    
                    if (recentBillStatus === "unpaid") {
                        unpaidCLIENTs += 1
                    }    

                    if (recentBillStatus === "overpaid") {
                        overpaidCLIENTs += 1
                    }
                }

            }

            meterNumbers.push(bill.meterNumber)
            accountNumbers.push(bill.accountNumber)
            names.push(bill.fullName)
        })    

        const searchFilterOptions = ["Full Name", "Meter Number", "Account Number"]
        const searchFilter = getById("billing-search-box-filter")
        const searchElement = getById("billing-search-box-input")
        
        searchElement.oninput = () => {

            const tableRows = queryElements(".table-info")

            if (!tableRows) {
                makeToastNotification("No CLIENTs yet")
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
            const rerenderTable = (filteredCLIENTs, attribute) => {
                const tableRows = queryElements(".table-info")
                tableRows.forEach(row => {
                    if (!filteredCLIENTs.includes(row.getAttribute(attribute))) {
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
    
    setStatistics(paidCLIENTs, unpaidCLIENTs, overpaidCLIENTs)

    window.onclick = async event => {
        const targetId = event.target.getAttribute("id")
        if (targetId === "CLIENTs") transition(renderCLIENTSection)
        if (targetId === "profile") transition(renderProfile)
        if (targetId === "logout") loadLogin()
    }

}

/**
 * Sets the value for paid, unpaid, overpaid statistics element
 * 
 * @param {Number} paid - holds the value for the number of paid CLIENTs
 * @param {Number} unpaid - holds the value for the number of unpaid CLIENTs
 * @param {Number} overpaid - holds the value for the number of overpaid CLIENTs
 */
function setStatistics(paid, unpaid, overpaid) {
    const paidCustomersElement = getById("paid-CLIENTs")
    const unpaidCustomersElement = getById("unpaid-CLIENTs")
    const overpaidCustomersElement = getById("overpaid-CLIENTs")

    if (paidCustomersElement) paidCustomersElement.innerHTML = paid
    if (unpaidCustomersElement) unpaidCustomersElement.innerHTML = unpaid
    if (overpaidCustomersElement) overpaidCustomersElement.innerHTML = overpaid
}