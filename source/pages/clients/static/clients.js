import { transition } from "../../../helper.js"
import loadLogin from "../../authentication/static/login.js"
import { renderBillingSection } from "../../billing/static/billing.js"

export async function renderClientSection() {
            
    const user = await window.ipcRenderer.invoke("current_user")
    let clients = null
    let responseMessage = null

    async function fetchClientData() {

        try {

            const response = await window.ipcRenderer.invoke("clients")

            if (response.status === "success") {
                clients = response.data
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
                                    <button class="button-primary" id="print-all-client">
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
                    ${
                        responseMessage !== null ? `<p>${responseMessage}</p>` : 
                        
                        clients !== null &&
                            clients.map(client => `
                                <div class="client-info">
                                    <p>${client.firstName} ${client.middleName} ${client.lastName}</p>
                                    <p>${client.Meter_Number}</p>
                                </div>`
                            ).join("")
                      }
                    </div>
                </div>
            </section>

        </section>
    `
    
    document.getElementById("container").innerHTML += template

    window.onclick = event => {
        
        const elementId = event.target.getAttribute("id") 
        
        if (elementId === "billing") {
            transition(renderBillingSection)
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

    }

}