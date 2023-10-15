import icons from "../../../assets/scripts/icons.js";
import CLIENTRow from "./classes/CLIENTRow.js"

/**
 * Generates an HTML template for the Client table section.
 *
 * @param {Object} user - The user data.
 * @param {Array} CLIENTs - An array of Client data.
 * @param {string|null} responseMessage - The response message (or null if there's no message).
 * @returns {string} - TCLIENT-filter-toggle-filter-listhe HTML template for the Client table section.
 */
export function CLIENTTable(user, CLIENTs, responseMessage) {

    const { usersIcon, billIcon, powerIcon, userIcon } = icons
    const navigationObject = [
        { title: "CLIENTs", icon: usersIcon },
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
                            <div id="${ navigation.title.toLowerCase() }" class="nav-item">
                                <div>${ navigation.icon }</div>
                                <p>${ navigation.title }</p>
                            </div>
                        `        
                    })
                }
            </div>
            <div id="profile" class="nav-item">
                <div>${ userIcon }</div>
                <p>Profile</p>
            </div>
        </nav>

        <section>
            <div id="CLIENTs-section" class="content">
                <div class="content__top">
                    <div>
                        <img src="assets/images/Logo.png" alt="">
                        <p class="content__top-title">${user ? `Welcome, ${user.firstName}` : `Welcome User`}</p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>
                <div class="content__center">
                    <div class="content__center-left">
                        <p class="content__center-left__section-title">CLIENTs</p>
                        <p class="content__center-left__section-description">Check the latest reports and updates</p>
                    </div>
                    <div class="content__center-right">
                        
                        <div id="search-box">
                            <input
                                id="Client-search-box-input"
                                type="text"
                                class="borderless-input search-box-input"
                                placeholder="Search Client by meter/account number or full name">

                            <select id="Client-search-box-filter" class="search-box-filter">
                                <option selected disable>Search by</option>
                                ${
                                    [ "Account Number", "Relationship Status", "Meter Number", "Full Name", "Email", "Age" ].map(selectOption => {
                                        const split = selectOption.split(' ')
                                        const newValue = split.length >= 2 ? [split[0].toLowerCase(), split[1]].join('') : selectOption
                                        return `
                                            <option value="${ newValue }">${ selectOption }</option>
                                        `
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
                <div class="content__bottom">
                    <div id="table-data">
                        <div id="table-data-title">
                            <p>CLIENTs</p>
                            <div>
                                <div id="table-data-title-filter">
                                    <button class="button-primary" id="Client-options-filter">Filter By</button>
                                    <div id="Client-filter-toggle-filter-list">
                                        ${
                                            ["Connected", "Due", "Disconnected"].map(filter => {
                                                return `
                                                    <button class="button-primary Client-filter-toggle-filter-list__item" id="filter-button-${ filter.toLowerCase() }-CLIENTs">
                                                        ${ filter }
                                                    </button>
                                                `
                                            })
                                        }
                                    </div>
                                </div>
                                <div id="table-data-title-options">
                                    <button class="button-primary" id="Client-options-toggle">Options</button>
                                    <div id="Client-options-toggle-options-list">
                                        ${
                                            ["New Connection", "Save as CSV"].map(option => {
                                                return `
                                                    <button class="button-primary" id="${ option.join('-').toLowerCase() }">
                                                        ${ option }
                                                    </button>
                                                `
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="table-data-headers">
                            ${
                                ["Name", "Address", "Contact", "Date", "Meter Number", "Status", "Menu"].map(header => {
                                    return `
                                        <div class="table-data-headers__item">
                                            <p>${ header }</p>
                                        </div>
                                    `
                                })
                            }
                        </div>
                        <div id="table-data-rows">
                            ${ renderTable(CLIENTs, responseMessage) }
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </section>
`

return template
}

export function renderTable(CLIENTs, responseMessage) {
    return responseMessage !== null ? `
        <p style="margin: 1rem">${responseMessage}</p>` 
    :
        CLIENTs.map(Client => new CLIENTRow(Client)).join("")
}