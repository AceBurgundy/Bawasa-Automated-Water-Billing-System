// helpers
import { queryElements, transition, getById } from "../../../assets/scripts/helper.js"
import { makeToastNotification } from "../../../../assets/scripts/toast.js"

// main
import renderClientSection from "../../../clients/renderer/main/clients.js"
import renderLogin from "../../../authentication/renderer/main/login.js"
import renderProfile from "../../../profile/renderer/main/profile.js"

// templates
import billingTable from "../templates/billing.js"

/**
 * Renders the billing section, including the table of client accounts and statistics.
 */
export default async function renderBillingSection() {

    const [accounts, message] = await getAccounts()

    const template = await billingTable(accounts, message)

	getById("container").innerHTML += template

	const tableOptions = {}

	queryElements(".table-info__options").forEach(option => {
		tableOptions[option.getAttribute("data-client-id")] = option.classList
	})

    setSearchFunctionality(accounts)
        
    window.onclick = async event => {

        const targetId = event.target.getAttribute("id")

		switch (targetId) {

			case "billing":
				transition(renderBillingSection)
			    break
			
			case "clients":
				transition(renderClientSection)
			    break

            case "profile":
				transition(renderProfile)
			    break

            case "logout":
                renderLogin()
                break

		}

    }

}

/**
 * Retrieves all accounts from the database
 * 
 * @function
 * @async
 * @returns { Promise<[Array<accounts>, Array<string>]> } 
 * an array where the first element is an array of accounts and message is the respose message
 */
async function getAccounts() {

    const { status, data, message } = await window.ipcRenderer.invoke("accounts")
    const Ok = status === "success"

    const accounts = Ok ? JSON.parse(data) : []
    const failedMessage = !Ok ? message : null

    return [accounts, failedMessage]
}

/**
 * Sets the value for paid, unpaid, overpaid statistics element
 * 
 * @function
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

/**
 * Sets search functionality
 * 
 * 
 */
function setSearchFunctionality(accounts) {

    let paidClients = 0
    let unpaidClients = 0
    let overpaidClients = 0

    let meterNumbers = []
    let accountNumbers = []
    let names = []

    if (accounts) {

        accounts.map(account => {
            
            const accountBills = account.bills

            if (accountBills.length > 0) {
                const recentBill = accountBills[0]

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

            meterNumbers.push(account.meterNumber)
            accountNumbers.push(account.accountNumber)
            names.push(account.fullName)
        })    

        setStatistics(paidClients, unpaidClients, overpaidClients)
        
        const searchFilterOptions = ["Full Name", "Meter Number", "Account Number"]
        const searchFilter = getById("billing-search-box-filter")
        const searchElement = getById("billing-search-box-input")
        
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

}