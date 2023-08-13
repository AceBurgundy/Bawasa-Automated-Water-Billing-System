import { transition, clearDOMHead, makeToastNotification } from "../../../helper.js"
import loadLogin from "../../authentication/static/login.js"
import { renderClientSection } from "../../clients/static/clients.js"
import { addNewBill } from "../templates/new_bill.js"

export async function renderBillingSection() {

        const element = (id) => document.getElementById(id)
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    
        const user = await window.ipcRenderer.invoke("current_user")
        let bills = null
        let responseMessage = null

        async function fetchBillingData() {

            try {
    
                const response = await window.ipcRenderer.invoke("bills")
    
                if (response.status === "success") {
                    bills = JSON.parse(response.data)
                    console.log(bills)
                } else {
                    responseMessage = response.message
                }
                
            } catch (error) {
                console.error("Error fetching billing data:", error)
            }
        }
          
        await fetchBillingData()

        const template = `

        <section id="section-type-container" class="page">

            <nav>
                <div id="nav-items">
                    <div id="clients" class="nav-item">Clients</div>
                    <div id="billing" class="nav-item">Billing</div>
                    <div id="logout" class="nav-item">Logout</div>
                </div>
            </nav>

            <section>
                <div id="clients-section" class="section-child">
                    <div class="section-child__top">
                        <div>
                            <img src="assets/images/Logo.png" alt="">
                            <p class="section-child__top-title">${user ? `Welcome, ${user.firstName}` : `Welcome User`}</p></p>
                        </div>
                        <img src="assets/images/Logo.png" alt="">
                    </div>
                    <div class="section-child__center">
                        <div class="section-child__center-left">
                            <p class="section-child__center-left__section-title">Billing</p>
                            <p class="section-child__center-left__section-description">Check the latest reports and updates</p>
                        </div>
                        <div class="section-child__center-right">
                            <div class="section-child__center-right__options">
                                
                            </div>
                        </div>
                    </div>
                    <div class="section-child__bottom">
                        <div id="table-data">
                            <div id="table-data-title">
                                <p>Billing</p>
                            </div>
                            <div id="table-data-headers" class="billing">
                                <div class="table-data-headers__item">
                                    <p>Account Number</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Name</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Meter Number</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>First Reading</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Second Reading</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Consumption</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Bill Ammount</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Billing Due</p>
                                </div>
                                <div class="table-data-headers__item">
                                    <p>Menu</p>
                                </div>
                            </div>
                            ${
                                responseMessage !== null ? `<p style="margin: 1rem">${responseMessage}</p>` :
                                
                                bills !== null &&
                                    bills.map((billing, index) => {

                                        const { firstReading, secondReading, consumption, billAmount, disconnectionDate } = 
                                        billing.Client_Bills.length > 0 ? billing.Client_Bills[0] : {};
                                                                    
                                        const date = disconnectionDate ? 
                                        new Date(disconnectionDate).toLocaleDateString("en-US", dateOptions) :
                                        ''

                                        return `

                                        <div class="table-info billing">
                                            <div class="table-info__options" data-client-id="${billing.id}">
                                                <p>Menu</p>
                                                <div class="table-info__options-item-box billing" data-client-id="${billing.id}">
                                                    <div class="table-info__options-item add" data-client-index="${index}">
                                                        <svg class="edit-table-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,18H9.24a1,1,0,0,0,.71-.29l6.92-6.93h0L19.71,8a1,1,0,0,0,0-1.42L15.47,2.29a1,1,0,0,0-1.42,0L11.23,5.12h0L4.29,12.05a1,1,0,0,0-.29.71V17A1,1,0,0,0,5,18ZM14.76,4.41l2.83,2.83L16.17,8.66,13.34,5.83ZM6,13.17l5.93-5.93,2.83,2.83L8.83,16H6ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>
                                                        <p>New</p>
                                                    </div>
                                                    <div class="table-info__options-item edit">
                                                        <svg class="table-pay-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M16 17c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-14c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6z"></path><path d="M16.4 13.2h-.8a2.613 2.613 0 0 1-2.493-1.864 1 1 0 1 1 1.918-.565c.075.253.312.43.575.43h.8a.6.6 0 0 0 0-1.201h-.8C14.166 10 13 8.833 13 7.4s1.166-2.6 2.6-2.6h.8c1.121 0 2.111.714 2.466 1.778a1 1 0 1 1-1.897.633.598.598 0 0 0-.569-.411h-.8a.6.6 0 0 0 0 1.2h.8c1.434 0 2.6 1.167 2.6 2.6s-1.166 2.6-2.6 2.6z"></path><path d="M16 6c-.271 0-.521-.11-.71-.29-.04-.05-.09-.1-.12-.16a.556.556 0 0 1-.09-.17.672.672 0 0 1-.061-.18C15.01 5.13 15 5.07 15 5c0-.26.109-.52.29-.71.37-.37 1.04-.37 1.42 0 .18.19.29.45.29.71 0 .07-.01.13-.021.2a.606.606 0 0 1-.06.18.578.578 0 0 1-.09.17c-.04.06-.08.11-.12.16-.189.18-.449.29-.709.29zm0 8c-.271 0-.521-.11-.71-.29-.04-.05-.09-.1-.12-.16a.556.556 0 0 1-.09-.17.672.672 0 0 1-.061-.18c-.009-.07-.019-.13-.019-.2 0-.26.109-.52.29-.71.37-.37 1.04-.37 1.42 0 .18.19.29.45.29.71 0 .07-.01.13-.021.2a.606.606 0 0 1-.06.18.578.578 0 0 1-.09.17c-.04.06-.08.11-.12.16-.189.18-.449.29-.709.29zm2 17H2a1 1 0 0 1-1-1v-9c0-.265.105-.52.293-.707C1.527 20.058 3.653 18 6 18c1.944 0 4.452 1.469 5.295 2H16a3.004 3.004 0 0 1 2.955 3.519l7.891-3.288a2.995 2.995 0 0 1 2.818.273A2.993 2.993 0 0 1 31 23a1 1 0 0 1-.496.864l-12 7A1.003 1.003 0 0 1 18 31zM3 29h14.729l11.14-6.498a1.01 1.01 0 0 0-.314-.334.984.984 0 0 0-.939-.091l-9.23 3.846A1.007 1.007 0 0 1 18 26h-8a1 1 0 1 1 0-2h6a1.001 1.001 0 0 0 0-2h-5c-.197 0-.391-.059-.555-.167C9.68 21.323 7.387 20 6 20c-1.09 0-2.347.88-3 1.439V29z"></path></svg>
                                                        <p>Pay</p>
                                                    </div>
                                                    <div class="table-info__options-item" print>
                                                        <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                                                        <p>Print Bill</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${billing.accountNumber}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${billing.fullName}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${billing.meterNumber}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${firstReading ? firstReading : ''}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${secondReading ? secondReading : ''}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${consumption ? consumption : ''}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${billAmount ? billAmount : ''}</p>
                                            </div>
                                            <div class="table-info__item">
                                                <p>${date}</p>
                                            </div>
                                            <div class="table-info__item table-menu" data-client-id="${billing.id}">
                                                <div class="icon-box">
                                                    <svg class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                        <path d="M12,7a2,2,0,1,0-2-2A2,2,0,0,0,12,7Zm0,10a2,2,0,1,0,2,2A2,2,0,0,0,12,17Zm0-7a2,2,0,1,0,2,2A2,2,0,0,0,12,10Z"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>`
                                    }).join("")
                            }
                        </div>
                    </div>
                </div>
            </section>

        </section>
    `
    
    element("container").innerHTML += template
    
    const tableOptions = {}

    document.querySelectorAll(".table-info__options").forEach(option => {
        tableOptions[option.getAttribute("data-client-id")] = option.classList
    })

    window.onclick = async event => {

        const elementId = event.target.getAttribute("id") 
        const classList = event.target.classList

        if (elementId === "clients") {
            transition(renderClientSection)
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

        if (classList.contains("add")) {
            document.body.innerHTML += addNewBill(bills[event.target.getAttribute("data-client-index")])
            element("new-bill-box").showModal()
        }

        if (elementId === "new-bill-form-close") {
            event.preventDefault()
		    element("new-bill-box").close()
            element("new-bill-box").remove()
		}

        if (elementId === "new-bill-form-submit") {

            event.preventDefault()

            const clientId = element("new-bill-form-submit").getAttribute("data-client-id")
            const billId = element("new-bill-form-submit").getAttribute("data-bill-id")
			const monthlyReadingInput = element("new-bill-form-input-box-input")
			const errorElement = element("new-bill-form-input-box-header-error")

			const monthlyReading = monthlyReadingInput.value

			if (isNaN(monthlyReading)) {
				errorElement.innerHTML = "Must be a number"
				return
			}

			if (!monthlyReading) {
				errorElement.innerHTML = "Monthly reading cannot be empty"
				return
			}

			if (clientId, monthlyReading) {
            
                const newBillResponse = await window.ipcRenderer.invoke("new-bill", {
                    clientId: clientId,
                    monthlyReading: monthlyReading,
                    billId: billId !== '' ? billId : null
                })

                const { response } = newBillResponse

                console.log(response);

                if (response.status === "success") {
                    makeToastNotification(response.toast[0])
                    element("new-bill-box").close()
                    element("new-bill-box").remove();

                    transition(renderBillingSection)
                } else {
                    makeToastNotification(response.toast[0])
                }
            
            }
        }
    }

}