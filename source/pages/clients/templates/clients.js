import { icons } from "../../../assets/scripts/icons.js"
import ClientRow from "./classes/ClientRow.js"

/**
 * Generates an HTML template for the client table section.
 *
 * @param {Object} user - The user data.
 * @param {Array} clients - An array of client data.
 * @param {string|null} responseMessage - The response message (or null if there's no message).
 * @returns {string} - Tclient-filter-toggle-filter-listhe HTML template for the client table section.
 */
export function clientTable(user, clients, responseMessage) {

    const { usersIcon, billIcon, powerIcon, userIcon } = icons
    const navigationObject = [
        { title: "Clients", icon: usersIcon },
        { title: "Billing", icon: billIcon },
        { title: "Logout", icon: powerIcon },
    ]

    const template = `

    <section id="section-type-container" class="page">

        <nav>
            <div id="nav-items">
                ${
                    navigationObject.map(navigation => {
                        return `
                            <div id="${ navigation.title.toLowerCase() }" class="nav-item ${ navigation.title === "Clients" ? "active" : "" }">
                                <div>${ navigation.icon }</div>
                                <p>${ navigation.title }</p>
                            </div>
                        `        
                    }).join("\n")
                }
            </div>
            <div id="profile" class="nav-item">
                <div>${ userIcon }</div>
                <p>Profile</p>
            </div>
        </nav>

        <section>
            <div id="clients-section" class="content">
                <div class="content__top">
                    <div>
                        <img src="assets/images/Logo.png" alt="">
                        <p class="content__top-title">${user ? `Welcome, ${user.firstName}` : `Welcome User`}</p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>
                <div class="content__center">
                    <div class="content__center-left">
                        <p class="content__center-left__section-title">Clients</p>
                        <p class="content__center-left__section-description">Check the latest reports and updates</p>
                    </div>
                    <div class="content__center-right">
                        
                        <div id="search-box">
                            <input
                                id="client-search-box-input"
                                type="text"
                                class="borderless-input search-box-input"
                                placeholder="Search client by meter/account number or full name">

                            <select id="client-search-box-filter" class="search-box-filter">
                                <option selected disable>Search by</option>
                                ${
                                    [ "Account Number", "Relationship Status", "Meter Number", "Full Name", "Email", "Age" ].map(selectOption => {
                                        const split = selectOption.split(' ')
                                        const newValue = split.length >= 2 ? [split[0].toLowerCase(), split[1]].join('') : selectOption
                                        return `
                                            <option value="${ newValue }">${ selectOption }</option>
                                        `
                                    }).join("\n")
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div class="content__bottom">
                    <div id="table-data">
                        <div id="table-data-title">
                            <p>Clients</p>
                            <div>
                                <div id="table-data-title-filter">
                                    <button class="button-primary" id="client-options-filter">Filter By</button>
                                    <div id="client-filter-toggle-filter-list">
                                        ${
                                            ["Connected", "Due", "Disconnected"].map(filter => {
                                                return `
                                                    <button class="button-primary client-filter-toggle-filter-list__item" id="filter-button-${ filter.toLowerCase() }-clients">
                                                        ${ filter }
                                                    </button>
                                                `
                                            }).join("\n")
                                        }
                                    </div>
                                </div>
                                <div id="table-data-title-options">
                                    <button class="button-primary" id="client-options-toggle">Options</button>
                                    <div id="client-options-toggle-options-list">
                                        ${
                                            ["New Connection", "Save as CSV"].map(option => {
                                                const id = option.replace(' ', '-').toLowerCase()
                                                return `
                                                    <button class="button-primary" id="${ id }">
                                                        ${ option }
                                                    </button>
                                                `
                                            }).join("\n")
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="table-data-headers">
                            ${
                                ["Account Number", "Name", "Main Address", "Contact", "Birth Date", "Meter Number", "Status", "Menu"].map(header => {
                                    return `
                                        <div class="table-data-headers__item">
                                            <p>${ header }</p>
                                        </div>
                                    `
                                }).join("\n")
                            }
                        </div>
                        <div id="table-data-rows">
                            ${ renderTable(clients, responseMessage) }
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </section>
`

return template
}

export function renderTable(clients, responseMessage) {
    return responseMessage !== null ? `
        <p style="margin: 1rem">${responseMessage}</p>` 
    :
        clients.map(client => new ClientRow(client)).join("")
}