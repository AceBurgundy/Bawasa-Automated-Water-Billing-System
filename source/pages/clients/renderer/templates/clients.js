/* eslint-disable indent */

// helpers
import {sentenceToDashed} from '../../../../assets/scripts/helper.js';

// user
import currentUser from '../../../../assets/scripts/current-user.js';

// icons
import {icons} from '../../../../assets/scripts/icons.js';

// row
import ClientRow from '../components/ClientRow.js';

/**
 * Generates an HTML template for the client table section.
 *
 * @async
 * @function clientTemplate
 * @return {Promise<string>} the HTML template for the client table section.
 */
export default async function() {
  const [clients, noClientsMessage] = await retrieveClients();

  const navigationObject = [
    {title: 'Clients', icon: icons.usersIcon('users-icon')},
    {title: 'Billing', icon: icons.billIcon('bill-icon')},
    {title: 'Logout', icon: icons.powerIcon('power-icon')}
  ];

  const template = `
    <section id='section-type-container' class='page'>
      
      <nav>
        <div id='nav-items'>
          ${
            navigationObject.map(navigation => {
              const title = navigation.title === 'Clients' ? 'active' : '';
              return `
                <div id='${navigation.title.toLowerCase()}' class='nav-item ${title}'>
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
                ${
                  await currentUser() ?
                  `Welcome, ${await currentUser().firstName}` :
                  `Welcome User`
                }
              </p>
            </div>
            <img src='assets/images/Logo.png' alt=''>
          </div>
          
          <div class='content__center'>
            <div class='content__center-left'>
              <p class='content__center-left__section-title'>
                Clients
              </p>
              <p class='content__center-left__section-description'>
                Check the latest reports and updates
              </p>
            </div>
            <div class='content__center-right'>
              <div id='search-box'>
                <input
                  id='client-search-box-input'
                  type='text'
                  class='borderless-input search-box-input'
                  placeholder='Search client by meter/account number or full name'>

                <select id='client-search-box-filter' class='search-box-filter'>
                  <option selected disable>Search by</option>
                  ${
                    [
                      'Account Number',
                      'Relationship Status',
                      'Meter Number',
                      'Full Name',
                      'Email',
                      'Age'
                    ].map(selectOption => {
                      const newValue = sentenceToDashed(selectOption);
                      return `
                        <option value='${newValue}'>${selectOption}</option>
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
                <p>Clients</p>
                <div>
                  <div id='table-data-title-filter'>
                    <button class='button-primary' id='client-options-filter'>Filter By</button>
                    <div id='client-filter-toggle-filter-list'>
                      ${
                        [
                          'Connected',
                          'Due',
                          'Disconnected'
                        ].map(filter => {
                          return `
                            <button 
                              class='button-primary client-filter-toggle-filter-list__item' 
                              id='filter-button-${filter.toLowerCase()}-clients'>
                              ${filter}
                            </button>
                          `;
                        }).join('\n')
                      }
                    </div>
                  </div>
                  <div id='table-data-title-options'>
                    <button class='button-primary' id='client-options-toggle'>Options</button>
                    <div id='client-options-toggle-options-list'>
                      ${
                        [
                          'New Connection',
                          'Save as CSV'
                        ].map(option => {
                          const id = option.replace(' ', '-').toLowerCase();
                          return `
                            <button class='button-primary' id='${id}'>
                              ${option}
                            </button>
                          `;
                        }).join('\n')
                      }
                    </div>
                  </div>
                </div>
              </div>
              <div id='table-data-headers'>
                ${
                  [
                    'Account Number',
                    'Name',
                    'Main Address',
                    'Contact',
                    'Birth Date',
                    'Meter Number',
                    'Status',
                    'Menu'
                  ].map(header => {
                    return `
                      <div class='table-data-headers__item'>
                        <p>${header}</p>
                      </div>
                    `;
                  }).join('\n')
                }
              </div>
              <div id='table-data-rows'>
                ${renderTable(clients, noClientsMessage)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  `;

  return template;
}

/**
 * Renders a table with client information.
 *
 * @param {Array<Object>} clients - An array of client objects to be displayed in the table.
 * @param {string|null} noClientsMessage - A message to display when
 * there are no clients, or null if there are clients.
 * @return {string} The HTML representation of the client table.
 */
export function renderTable(clients, noClientsMessage) {
  if (noClientsMessage) {
    return `<p style='margin: 1rem'>${noClientsMessage}</p>`;
  }

  const clientRows = clients.map((client, index) => {
    return new ClientRow(client, index);
  }).join('');

  return clientRows;
}