import { renderClientBuilder } from "../../client_builder/static/client_builder.js"
import { renderBillingSection } from "../../billing/static/billing.js"
import loadLogin from "../../authentication/static/login.js"
import { transition } from "../../../helper.js"

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

    const template = `

        <section id="section-type-container" class="page">

            <nav>
                <div id="nav-items">
                    <div id="clients" class="nav-item">
                        Clients
                    </div>
                    <div id="billing" class="nav-item">
                        Billing
                    </div>
                    <div id="logout" class="nav-item">
                        Logout
                    </div>
            </nav>

            <section>
                <div id="clients-section" class="section-child">
                    <div class="section-child__top">
                        <div>
                            <img src="assets/images/Logo.png" alt="">
                            <p class="section-child__top-title">${user ? `Welcome, ${user.firstName}` : `Welcome User`}</p>
                        </div>
                        <img src="assets/images/Logo.png" alt="">
                    </div>
                    <div class="section-child__center">
                        <div class="section-child__center-left">
                            <p class="section-child__center-left__section-title">Clients</p>
                            <p class="section-child__center-left__section-description">Check the latest reports and updates</p>
                        </div>
                        <div class="section-child__center-right">
                            <div class="section-child__center-right__options">
                                <button class="button-primary" id="client-options-toggle">Options</button>
                                <div id="client-options-toggle-options-list">
                                    <button class="button-primary" id="new-connection">
                                        New Connection
                                    </button>
                                    <button class="button-primary" id="save-to-csv">
                                        Save as CSV
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="section-child__bottom">
                        <div id="client-data">
                            <div id="client-data-title"><p>Clients</p></div>
                            <div id="client-data-headers">
                                <div class="client-data-headers__item">
                                    <p>Name</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Address</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Contact</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Date</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Meter Number</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Status</p>
                                </div>
                                <div class="client-data-headers__item">
                                    <p>Menu</p>
                                </div>
                            </div>
                            ${
                                responseMessage !== null ? `<p style="margin: 1rem;">${responseMessage}</p>` : 
                                
                                clients !== null &&
                                    clients.map(client => {

                                        const { fullName, createdAt, Client_Connection_Statuses, meterNumber, id, Client_Phone_Numbers } = client

                                        const address = [
                                            client.mainAddress.details,
                                            client.mainAddress.street ? client.mainAddress.street + ', ' : '',
                                            client.mainAddress.subdivision ? client.mainAddress.subdivision + ', ' : '',
                                            client.mainAddress.barangay
                                        ].join(" ")
                                        
                                        const birthdate = new Date(createdAt).toLocaleDateString("en-US", dateOptions)
                                        
                                        const connectionStatus = Client_Connection_Statuses.length === 0 ? "Not Set" : Client_Connection_Statuses[0].connectionStatus
                                        
                                        return `
                                        <div class="client-info" >
                                            <div class="client-info__options" data-client-id="${id}">
                                                <p>Menu</p>
                                                <div class="client-info__options-item-box" data-client-id="${id}">
                                                    <div class="client-info__options-item new">
                                                        <svg class="add-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z"/></svg>
                                                        <p>New</p>
                                                    </div>
                                                    <div class="client-info__options-item edit">
                                                        <svg class="edit-client-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,18H9.24a1,1,0,0,0,.71-.29l6.92-6.93h0L19.71,8a1,1,0,0,0,0-1.42L15.47,2.29a1,1,0,0,0-1.42,0L11.23,5.12h0L4.29,12.05a1,1,0,0,0-.29.71V17A1,1,0,0,0,5,18ZM14.76,4.41l2.83,2.83L16.17,8.66,13.34,5.83ZM6,13.17l5.93-5.93,2.83,2.83L8.83,16H6ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>
                                                        <p>Edit</p>
                                                    </div>
                                                    <div class="client-info__options-item" archive>
                                                        <svg class="archive-client-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,13h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2ZM19,3H5A3,3,0,0,0,4,8.82V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V8.82A3,3,0,0,0,19,3ZM18,18a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V9H18ZM19,7H5A1,1,0,0,1,5,5H19a1,1,0,0,1,0,2Z"/></svg>
                                                        <p>Archive</p>
                                                    </div>
                                                    <div class="client-info__options-item" print>
                                                        <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                                                        <p>Print</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="client-info__item">
                                                <p>${fullName}</p>
                                            </div>
                                            <div class="client-info__item">
                                                <p>
                                                    ${address}
                                                </p>
                                            </div>
                                            <div class="client-info__item">
                                                <p>+63${Client_Phone_Numbers[0]?.phoneNumber}</p>
                                            </div>
                                            <div class="client-info__item">
                                                <p>${birthdate}</p>
                                            </div>
                                            <div class="client-info__item">
                                                <p>${meterNumber}</p>
                                            </div>
                                            <div class="client-info__item">
                                                <p>${connectionStatus}</p>
                                            </div>
                                            <div class="client-info__item table-menu" data-client-id="${id}">
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
    
    document.getElementById("container").innerHTML += template

    const tableOptions = {}

    document.querySelectorAll(".client-info__options").forEach(option => {
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