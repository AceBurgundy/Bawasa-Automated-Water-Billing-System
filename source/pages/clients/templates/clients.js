import { formatDate, showData } from "../../../assets/scripts/helper.js"

/**
 * Generates an HTML template for the client table section.
 *
 * @param {Object} user - The user data.
 * @param {Array} clients - An array of client data.
 * @param {string|null} responseMessage - The response message (or null if there's no message).
 * @returns {string} - The HTML template for the client table section.
 */
export function clientTable(user, clients, responseMessage) {

    const template = `

    <section id="section-type-container" class="page">

        <nav>
            <div id="nav-items">
                <div id="clients" class="nav-item active">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" id="users-icon"><rect width="256" height="256" fill="none"></rect><circle cx="88" cy="108" r="52" fill="none" stroke="#000" stroke-miterlimit="10" stroke-width="16"></circle><path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" d="M155.41251 57.937A52.00595 52.00595 0 1 1 169.52209 160M15.99613 197.39669a88.01736 88.01736 0 0 1 144.00452-.00549M169.52209 160a87.89491 87.89491 0 0 1 72.00032 37.3912"></path></svg>
                    </div>
                    <p>Clients</p>
                </div>
                <div id="billing" class="nav-item">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" id="bill-icon">
                            <path fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m25 29-1.59-.8a6 6 0 0 0-4.91-.2L16 29l-2.5-1a6 6 0 0 0-4.91.2L7 29V3h18ZM11 7h8M11 11h6M11 15h10"></path>
                        </svg>
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
                    <div id="table-data">
                        <div id="table-data-title"><p>Clients</p></div>
                        <div id="table-data-headers">
                            <div class="table-data-headers__item">
                                <p>Name</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Address</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Contact</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Date</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Meter Number</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Status</p>
                            </div>
                            <div class="table-data-headers__item">
                                <p>Menu</p>
                            </div>
                        </div>
                        ${
                            responseMessage !== null ? `<p style="margin: 1rem;">${responseMessage}</p>` : 
                            
                            clients !== null &&
                            
                                clients.map(client => {

                                    const { fullName, birthDate, connectionStatuses, meterNumber, id, phoneNumbers } = client

                                    const address = [
                                        client.mainAddress.details,
                                        client.mainAddress.street ? client.mainAddress.street + ', ' : '',
                                        client.mainAddress.subdivision ? client.mainAddress.subdivision + ', ' : '',
                                        client.mainAddress.barangay
                                    ].join(" ")
                                                                        
                                    const connectionStatus = connectionStatuses.length === 0 ? "Not Set" : connectionStatuses[0].status

                                    const reconnectButton = connectionStatus === window.connectionStatusTypes.Disconnected ?
                                                            `
                                                            <div class="table-info__options-item reconnect">
                                                                <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                                                                <p>Reconnect</p>
                                                            </div>` : ''
                                                            
                                    return `
                                    <div class="table-info" id="client-row-${id}">
                                        <div class="table-info__options" data-client-id="${id}">
                                            <p>Menu</p>
                                            <div class="table-info__options-item-box" data-client-id="${id}">
                                                ${ reconnectButton }
                                                <div class="table-info__options-item edit">
                                                    <svg class="edit-table-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,18H9.24a1,1,0,0,0,.71-.29l6.92-6.93h0L19.71,8a1,1,0,0,0,0-1.42L15.47,2.29a1,1,0,0,0-1.42,0L11.23,5.12h0L4.29,12.05a1,1,0,0,0-.29.71V17A1,1,0,0,0,5,18ZM14.76,4.41l2.83,2.83L16.17,8.66,13.34,5.83ZM6,13.17l5.93-5.93,2.83,2.83L8.83,16H6ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>
                                                    <p>Edit</p>
                                                </div>
                                                <div class="table-info__options-item archive">
                                                    <svg class="archive-table-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,13h4a1,1,0,0,0,0-2H10a1,1,0,0,0,0,2ZM19,3H5A3,3,0,0,0,4,8.82V18a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V8.82A3,3,0,0,0,19,3ZM18,18a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V9H18ZM19,7H5A1,1,0,0,1,5,5H19a1,1,0,0,1,0,2Z"/></svg>
                                                    <p>Archive</p>
                                                </div>
                                                <div class="table-info__options-item print">
                                                    <svg class="print-bill-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17,11H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm0,4H16a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2ZM11,9h6a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2ZM21,3H7A1,1,0,0,0,6,4V7H3A1,1,0,0,0,2,8V18a3,3,0,0,0,3,3H18a4,4,0,0,0,4-4V4A1,1,0,0,0,21,3ZM6,18a1,1,0,0,1-2,0V9H6Zm14-1a2,2,0,0,1-2,2H7.82A3,3,0,0,0,8,18V5H20Zm-9-4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Zm0,4h1a1,1,0,0,0,0-2H11a1,1,0,0,0,0,2Z"/></svg>
                                                    <p>Print</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="table-info__item">
                                            <p>${fullName}</p>
                                        </div>
                                        <div class="table-info__item">
                                            <p>
                                                ${address}
                                            </p>
                                        </div>
                                        <div class="table-info__item">
                                            <p>+63${showData(phoneNumbers[0].phoneNumber)}</p>
                                        </div>
                                        <div class="table-info__item">
                                            <p>${formatDate(birthDate)}</p>
                                        </div>
                                        <div class="table-info__item">
                                            <p>${meterNumber}</p>
                                        </div>
                                        <div class="table-info__item">
                                            <p>${connectionStatus}</p>
                                        </div>
                                        <div class="table-info__item table-menu" data-client-id="${id}">
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

return template
}