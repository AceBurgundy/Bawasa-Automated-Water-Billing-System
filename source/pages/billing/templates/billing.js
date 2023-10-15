import BillingRow from "./classes/BillingRow.js";
import icons from "../../../assets/scripts/icons.js";

/**
 * Generate a billing table HTML based on the provided billing data.
 *
 * @param {Array<Object>} bills - An array of billing data objects.
 * @param {Object} user - User data object.
 * @param {string} responseMessage - Optional response message.
 * @returns {string} - Generated HTML for the billing table.
 */
export default function billingTable(bills, user, responseMessage) {
            
    const { usersIcon, billIcon, powerIcon, userIcon } = icons
    const navigationObject = [
        { title: "CLIENTs", icon: usersIcon },
        { title: "Billing", icon: billIcon },
        { title: "Logout", icon: powerIcon },
    ]

    return `
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
                        <p class="content__top-title">${user ? `Welcome, ${user.firstName}` : `Welcome User`}</p></p>
                    </div>
                    <img src="assets/images/Logo.png" alt="">
                </div>
                <div class="content__center">
                    <div class="content__center-left">
                        <p class="content__center-left__section-title">Billing</p>
                        <p class="content__center-left__section-description">Check the latest reports and updates</p>
                    </div>
                    <div class="content__center-right">

                        <div id="statistics">
                            ${
                                ["Paid", "Unpaid", "Overpaid"].map(statistic => {
                                    return `
                                        <div class="statistics__child">
                                            <p>
                                                <span id="${ statistic.toLowerCase() }-CLIENTs"></span>
                                                ${ statistic }
                                            </p>
                                        </div>    
                                    `
                                })
                            }
                        </div>
                        
                        <div id="search-box">
                            <input
                                id="billing-search-box-input"
                                type="text"
                                class="borderless-input search-box-input"
                                placeholder="Search recent bill by meter or account number">

                            <select id="billing-search-box-filter" class="search-box-filter">
                                <option selected disable>Search by</option>
                                ${
                                    [ "Account Number", "Meter Number", "Full Name" ].map(selectOption => {
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
                            <p>Billing</p>
                        </div>

                        <div id="table-data-headers" class="account">
                        ${
                            [ "Account #", "Name", "Meter Number", "1st Reading", "2nd Reading", "Consumed", "Bill", "Due Date", "Status", "Penalty", "Excess", "Balance", "Total Paid", "Disconnection Date", "Menu" ].map(header => {
                                return `
                                    <div class="table-data-headers__item">
                                        <p>${ header }</p>
                                    </div>
                                `
                            })
                        }
                        </div>
                        <div id="table-data-row">
                            ${
                                responseMessage !== null ? `<p style="margin: 1rem">${responseMessage}</p>` :
                                    bills.map((billing, index) => new BillingRow(billing, index)).join("")
                            }
                        </div>
                </div>
            </div>
        </section>
    `;
}

