import { transition, clearDOMHead } from "../../../helper.js"
import loadLogin from "../../authentication/static/login.js";
import { renderClientSection } from "../../clients/static/clients.js";

export async function renderBillingSection() {

        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    
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
                console.error("Error fetching client data:", error)
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
                        responseMessage !== null ? `<p style="margin: 1rem;">${responseMessage}</p>` : "hasData"
                        
                        // bills !== null &&
                        //     bills.map(client => `
                        //         <div class="client-info">
                        //             <div class="client-info__item">
                        //                 <p>${client.fullName}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>${client.mainAddress.details}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>+63${client.Client_Phone_Numbers[0]?.phoneNumber}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>${new Date(client.createdAt).toLocaleDateString("en-US", dateOptions)}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>${client.meterNumber}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>${client.Client_Connection_Statuses.length === 0 ? "Not Set" : client.Client_Connection_Statuses[0].connectionStatus}</p>
                        //             </div>
                        //             <div class="client-info__item">
                        //                 <p>Options</p>
                        //             </div>
                        //         </div>`
                        //     ).join("")
                      }
                    </div>
                </div>
            </section>

        </section>
    `
    
    document.getElementById("container").innerHTML += template
    
    window.onclick = event => {

        const elementId = event.target.getAttribute("id") 

        if (elementId === "clients") {
            transition(renderClientSection)
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