/* eslint-disable indent */

// user
import currentUser from '../../../../assets/scripts/current-user.js';

// icons
import {icons} from '../../../../assets/scripts/icons.js';

// row
import BillingRow from '../components/BillingRow.js';

// constants
import '../../../../utilities/constants.js';

/**
 * Generate a billing table string HTML template based on the provided billing data.
 *
 * @async
 * @function billingTemplate
 * @param {Array<Object>} bills - An array of billing data objects.
 * @param {string} noBillsMessage - Optional response message.
 * @return {Promise<string>} Generated HTML for the billing table.
 */
export default async function(bills, noBillsMessage) {
  const user = await currentUser();
  const userWelcome = user ? `Welcome, ${user.firstName}` : 'Welcome User';

  const navigationObject = [
    {title: 'Clients', icon: icons.usersIcon('users-icon')},
    {title: 'Billing', icon: icons.billIcon('bill-icon')},
    {title: 'Logout', icon: icons.powerIcon('power-icon')}
  ];

  const searchOptions = {
    accountNumber: 'Account Number',
    meterNumber: 'Meter Number',
    firstName: 'First Name',
    middleName: 'Middle Name',
    lastName: 'Last Name'
  };

  return /* html */`
    <section id='section-type-container' class='page billing-page' data-current-page='billing'>

      <nav>
        <div id='nav-items'>
          ${
            navigationObject.map(navigation => {
              const active = navigation.title === 'Billing' ? 'active' : '';
              return /* html */`
                <div id='${navigation.title.toLowerCase()}' class='nav-item ${active}'>
                    <div>${navigation.icon}</div>
                    <p>${navigation.title}</p>
                </div>
              `;
            }).join('\n')
          }
        </div>
        <div id='profile' class='nav-item'>
            <div>${icons.userIcon('user-icon')}</div>
            <p>Profile</p>
        </div>
      </nav>

      <section>

        <div id='clients-section' class='content'>

          <div class='content__top'>
            <div>
            <img src='assets/images/Logo.png' alt=''>
              <p class='content__top-title'>
                ${ userWelcome }
              </p>
            </div>
            <img src='assets/images/Logo.png' alt=''>
          </div>

          <div class='content__center'>

            <div class='content__center-left'>
              <p class='content__center-left__section-title'>
                Billing
              </p>
              <p class='content__center-left__section-description'>
                Check the latest reports and updates
              </p>
            </div>

            <div class='content__center-right'>

              <div id='statistics'>
                ${
                  ['Paid', 'Unpaid', 'Overpaid', 'Underpaid'].map(statistic => {
                    return /* html */`
                      <div class='statistics__child'>
                        <p>
                          <span id='${statistic.toLowerCase()}-clients'></span>
                          ${statistic}
                        </p>
                      </div>
                    `;
                  }).join('\n')
                }
              </div>

              <div id='search-box'>
                <input
                    id='billing-search-box-input'
                    type='text'
                    class='borderless-input search-box-input'
                    placeholder='Search recent bill by meter or account number'>

                <select id='billing-search-box-filter' class='search-box-filter'>
                  <option selected disable>Search by</option>
                  ${
                    Object.keys(searchOptions).map(option => {
                      return /* html */`
                        <option value='${option}'>
                          ${searchOptions[option]}
                        </option>
                      `;
                    }).join('\n')
                  }
                </select>
              </div>
            </div>
          </div>

          <div class='content__bottom'>
            <div id='table-data'>
              <div id='table-data-title'>
                <p>Billing</p>
              </div>
              <div id='table-data-headers' class='account'>
                ${
                  [
                    'Account #',
                    'Name',
                    'Meter Number',
                    '1st Reading',
                    '2nd Reading',
                    'Consumed',
                    'Bill',
                    'Due Date',
                    'Status',
                    'Penalty',
                    'Excess',
                    'Balance',
                    'Total Paid',
                    'Disconnection Date',
                    'Menu'
                  ].map(header => {
                    return /* html */`
                      <div class='table-data-headers__item'>
                        <p>${header}</p>
                      </div>
                    `;
                  }).join('\n')
                }
              </div>
              <div id='table-data-rows'>
                ${ renderTable(bills, noBillsMessage) }
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  `;
}

const disconnected = window.connectionStatusTypes.Disconnected;
const connected = window.connectionStatusTypes.Connected;

/**
 * Renders the billing table based on the provided billing data.
 *
 * @param {Array} bills - An array of billing data.
 * @param {string} noBillsMessage - The message to display when there are no billing records.
 * @return {string} The HTML representation of the billing table.
 */
export function renderTable(bills, noBillsMessage) {
  if (noBillsMessage) {
    return /* html */`<p style='margin: 1rem'>${noBillsMessage}</p>`;
  }

  return bills
      .map(billing => {
        const hasStatuses = billing.connectionStatuses.length > 0;
        const latest = billing.connectionStatuses[0].status;

        const status = hasStatuses ? latest : null;
        const statusNotDisconnected = status !== connected && status === disconnected;
        const clientDisconnected = status !== null && statusNotDisconnected;

        return new BillingRow(billing, clientDisconnected);
      })
      .join('');
}

