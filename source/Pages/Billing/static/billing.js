import { transition, clearDOMHead } from "../../../helper.js"
import loadLogin from "../../Authentication/static/login.js";
import { renderClientSection } from "../../Clients/static/clients.js";

export function renderBillingSection() {
            
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
                            <p class="section-child__top-title">Good morning, Sam</p>
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
                    <div class="section-child__bottom"></div>
                </div>
            </section>

        </section>
    `
    
    document.getElementById("container").innerHTML += template

    window.onclick = event => {

        const elementId = event.target.getAttribute("id") 

        if (elementId === "clients") {
            console.log("yes");
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