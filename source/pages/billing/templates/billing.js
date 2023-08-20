import { billingTableRow } from "./billingTableRow.js";

/**
 * Generate a billing table HTML based on the provided billing data.
 *
 * @param {Array<Object>} bills - An array of billing data objects.
 * @param {Object} user - User data object.
 * @param {string} responseMessage - Optional response message.
 * @returns {string} - Generated HTML for the billing table.
 */
export default function billingTable(bills, user, responseMessage) {
    
    return `
        <section id="section-type-container" class="page">

        <nav>
            <div id="nav-items">
                <div id="clients" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="users-icon"><rect width="256" height="256" fill="none"></rect><circle cx="88" cy="108" r="52" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M155.41251 57.937A52.00595 52.00595 0 1 1 169.52209 160M15.99613 197.39669a88.01736 88.01736 0 0 1 144.00452-.00549M169.52209 160a87.89491 87.89491 0 0 1 72.00032 37.3912"></path></svg>
                    </div>
                    <p>Clients</p>
                </div>
                <div id="billing" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" viewBox="0 0 32 32" id="bill-icon"><path d="M22 5H10a1 1 0 000 2H22a1 1 0 000-2zM22 9H10a1 1 0 000 2H22a1 1 0 000-2z"></path><path d="M6,31a1,1,0,0,0,.66-.25l3.26-1.6,2.52,1.68a1,1,0,0,0,1.1,0L16,29.23l2.45,1.6a1,1,0,0,0,1.1,0l2.52-1.68,3.26,1.6A1,1,0,0,0,27,30V9a1,1,0,0,0-2,0V28.36L22.44,27.1a1,1,0,0,0-1,.07L19,28.8l-2.44-1.6a1,1,0,0,0-1.09,0L13,28.8l-2.45-1.63a1,1,0,0,0-1-.07L7,28.36V3H25V5a1,1,0,0,0,2,0V2a1,1,0,0,0-1-1H6A1,1,0,0,0,5,2V30A1,1,0,0,0,6,31Z"></path></svg>
                    </div>
                    <p>Billing</p>
                </div>
                <div id="logout" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="power-icon"><rect width="256" height="256" fill="none"></rect><line x1="127.992" x2="127.992" y1="48.003" y2="124.003" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></line><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M176.00189,54.23268a88,88,0,1,1-96.00346-.00021"></path></svg>
                    </div>
                    <p>Logout</p>
                </div>
            </div>
            <div id="profile" class="nav-item">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="user-icon"><rect width="256" height="256" fill="none"></rect><circle cx="128" cy="96" r="64" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M30.989,215.99064a112.03731,112.03731,0,0,1,194.02311.002"></path></svg>
                </div>
                <p>Profile</p>
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
                        <div id="search-box">
                            <input
                                id="search-box-input"
                                type="text"
                                placeholder="Search recent bill by meter or account number">

                            <select id="search-box-filter">
                                <option selected disable>Search by</option>
                                <option value="Meter Number" >Meter Number</option>
                                <option value="Account Number" >Account Number</option>
                                <option value="Full Name" >Full Name</option>
                            </select>
                        </div>
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
                                <p>Account #</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Name</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Meter Number</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>1st Reading</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>2nd Reading</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Consumed</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Bill</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Due Date</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Status</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Excess</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Balance</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Total Paid</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Disconnection Date</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Menu</p>
                            </div>
                        </div>
                        <div id="table-data-row">
                            ${
                                responseMessage !== null ? `<p style="margin: 1rem">${responseMessage}</p>` :
                                    bills.map((billing, index) => billingTableRow(billing, index)).join("")
                            }
                        </div>
                </div>
            </div>
        </section>
    `;
}
