// helpers
import {queryElements, transition, getById} from '../../../assets/scripts/helper.js';
import makeToastNotification from '../../../../assets/scripts/toast.js';

// main
import client from '../../../clients/renderer/main/clients.js';
import login from '../../../authentication/renderer/main/login.js';
import profile from '../../../profile/renderer/main/profile.js';

// templates
import billingTemplate from '../templates/billing.js';

/**
 * @function billing
 * @description renders the billing section, including the table of client accounts and statistics.
 */
export default async function() {
  const [accounts, message] = await getAccounts();

  const template = await billingTemplate(accounts, message);
  getById('container').innerHTML += template;

  const tableOptions = {};

  queryElements('.table-info__options').forEach(option => {
    tableOptions[option.getAttribute('data-client-id')] = option.classList;
  });

  setSearchFunctionality(accounts);

  window.onclick = async event => {
    const targetId = event.target.getAttribute('id');

    switch (targetId) {
      case 'billing':
        transition(billing);
        break;

      case 'clients':
        transition(client);
        break;

      case 'profile':
        transition(profile);
        break;

      case 'logout':
        login();
        break;
    }
  };
}

/**
 * Retrieves all accounts from the database
 *
 * @function
 * @async
 * @return {Promise<[Array<accounts>, Array<string>]>}
 * an array where the first element is an array of accounts and message is the respose message
 */
async function getAccounts() {
  const {status, data, message} = await window.ipcRenderer.invoke('accounts');
  const ok = status === 'success';

  const accounts = ok ? JSON.parse(data) : [];
  const failedMessage = !ok ? message : null;

  return [accounts, failedMessage];
}

/**
 * Sets the value for paid, unpaid, overpaid statistics element
 *
 * @function
 * @param {Number} paid - holds the value for the number of paid clients
 * @param {Number} unpaid - holds the value for the number of unpaid clients
 * @param {Number} overpaid - holds the value for the number of overpaid clients
 */
function setStatistics(paid, unpaid, overpaid) {
  const paidCustomersElement = getById('paid-clients');
  const unpaidCustomersElement = getById('unpaid-clients');
  const overpaidCustomersElement = getById('overpaid-clients');

  if (paidCustomersElement) paidCustomersElement.innerHTML = paid;
  if (unpaidCustomersElement) unpaidCustomersElement.innerHTML = unpaid;
  if (overpaidCustomersElement) overpaidCustomersElement.innerHTML = overpaid;
}

/**
 * Sets search functionality
 * @param {Array<Object>} accounts - list of ClientBill objects
 */
function setSearchFunctionality(accounts) {
  let paidClients = 0;
  let unpaidClients = 0;
  let overpaidClients = 0;

  const meterNumbers = [];
  const accountNumbers = [];
  const names = [];

  if (accounts) {
    accounts.map(account => {
      const accountBills = account.bills;

      if (accountBills.length > 0) {
        const recentBill = accountBills[0];

        if (recentBill.paymentStatus !== '') {
          const recentBillStatus = recentBill.paymentStatus;

          if (recentBillStatus === 'paid') {
            paidClients += 1;
          }

          if (recentBillStatus === 'unpaid') {
            unpaidClients += 1;
          }

          if (recentBillStatus === 'overpaid') {
            overpaidClients += 1;
          }
        }
      }

      meterNumbers.push(account.meterNumber);
      accountNumbers.push(account.accountNumber);
      names.push(account.fullName);
    });

    setStatistics(paidClients, unpaidClients, overpaidClients);

    const searchFilterOptions = ['Full Name', 'Meter Number', 'Account Number'];
    const searchFilter = getById('billing-search-box-filter');
    const searchElement = getById('billing-search-box-input');

    /**
     * Updates the table while user changes the input
     * @return {void}
     */
    searchElement.oninput = () => {
      const tableRows = queryElements('.table-info');

      if (!tableRows) {
        makeToastNotification('No clients yet');
        return;
      }

      if (searchElement.value.trim() === '') {
        tableRows.forEach(row => row.style.display = 'grid');
        return;
      }

      if (!searchFilterOptions.includes(searchFilter.value)) {
        makeToastNotification('Choose a filter first');
        return;
      }

      /**
       * Finds a case-insensitive match of a value within a given data string.
       * @function
       * @param {string} data - The data string to search within.
       * @param {string} value - The value to find within the data string.
       * @return {boolean} True if the value is found in the data string, otherwise false.
       */
      const find = (data, value) => {
        return data.toLowerCase().includes(value.toLowerCase());
      };

      /**
       * Rerenders the table by toggling the display of table rows
       * based on the filtered clients and the specified attribute.
       * @function
       * @param {Array} filteredClients - The array of client identifiers to display in the table.
       * @param {string} attribute - The attribute used to filter and identify table rows.
       * @return {void}
       */
      const rerenderTable = (filteredClients, attribute) => {
        const tableRows = queryElements('.table-info');
        tableRows.forEach(row => {
          if (!filteredClients.includes(row.getAttribute(attribute))) {
            row.style.display = 'none';
          } else {
            row.style.display = 'grid';
          }
        });
      };

      if (searchFilter.value === 'Full Name') {
        rerenderTable(names.filter(data => find(data, searchElement.value)), 'data-full-name');
      }

      if (searchFilter.value === 'Meter Number') {
        const filteredClients = meterNumbers.filter(data => find(data, searchElement.value));
        rerenderTable(filteredClients, 'data-meter-number');
      }

      if (searchFilter.value === 'Account Number') {
        const filteredClients = accountNumbers.filter(data => find(data, searchElement.value));
        rerenderTable(filteredClients, 'data-accounts-number');
      }
    };
  }
}
