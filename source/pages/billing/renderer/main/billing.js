// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  queryElements,
  queryElement,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// templates
import billingTemplate, {renderTable} from '../templates/billing.js';

// main
import login from '../../../authentication/renderer/main/login.js';
import profile from '../../../profile/renderer/main/profile.js';
import clients from '../../../clients/renderer/main/clients.js';

/**
 * @function billing
 * @description renders the billing section, including the table of client accounts and statistics.
 */
export default async function() {
  const [accounts, message, statisticsObject] = await retrieveAccounts();

  const template = await billingTemplate(accounts, message);
  getById('container').innerHTML += template;

  queryElement('.billing-page').onclick = async event => {
    const targetId = event.target.id;

    switch (targetId) {
      case 'clients':
        transition(clients);
        return;

      case 'profile':
        transition(profile);
        return;

      case 'logout':
        await window.ipcRenderer.invoke('logout');
        transition(login);
        return;
    }
  };

  setStatistics(statisticsObject);
  const filterSelect = getById('billing-search-box-filter');
  const search = getById('billing-search-box-input');

  search.oninput = () => {
    const tableRows = queryElements('.table-info');
    const allowed = inputAllowed(tableRows, search.value, filterSelect);
    if (allowed) updateTable(filterSelect.value, search.value);
  };

  window.onkeyup = event => {
    if (event.key === 'Backspace' && document.activeElement === search) {
      if (search.value.length === 0) {
        updateTable();
      }
    }
  };

  /**
   * Validates the search value and updates the displayed table rows accordingly.
   *
   * @param {Element[]} tableRows - The table rows to be filtered.
   * @param {string} searchValue - The value to be searched.
   * @param {HTMLSelectElement} searchFilter - The filter element for the search.
   * @return {boolean} True if validation passed, false otherwise.
   */
  function inputAllowed(tableRows, searchValue, searchFilter) {
    const searchFilters = [
      'accountNumber',
      // 'meterNumber',
      'firstName',
      'middleName',
      'lastName'
    ];

    if (!tableRows) {
      makeToastNotification('No accounts yet');
      return false;
    }

    // cursor is still inside the input but empty
    if (searchValue.trim() === '') {
      tableRows.forEach(row => row.style.display = 'grid');
      return false;
    }

    if (!searchFilters.includes(searchFilter.value)) {
      makeToastNotification('Choose a filter first');
      return false;
    }

    return true;
  }

  /**
   * Updates the displayed table rows based on the specified column and data.
   *
   * @param {string} column - The column to filter by.
   * Defaults to an empty object
   * @param {string} data - The data to filter with.
   * Defaults to an empty object
   * @return {void} Resolves when the table rows are updated.
   */
  async function updateTable(column, data) {
    const [accounts, message] = await retrieveAccounts(column, data);
    const tableRowContainer = getById('table-data-rows');
    tableRowContainer.innerHTML = renderTable(accounts, message);
  }

  /**
   * Retrieves accounts and their recent bill based on the specified column name and data.
   *
   * @param {string|null} columnName - The column to filter by or null.
   * @param {string|null} columnData - The data to filter with or null.
   * @return {Promise<Array<Object|null, string|null>>} An array containing the
   * retrieved accounts and their recent bill and a message.
   */
  async function retrieveAccounts(columnName, columnData) {
    const {status, data, statistics, message} = await window.ipcRenderer.invoke('accounts', {
      columnName: columnName,
      columnData: columnData
    });

    const statisticsObject = status === 'success' ? JSON.parse(statistics) : null;
    const accounts = status === 'success' ? JSON.parse(data) : null;
    const failedMessage = status === 'failed' ? message : null;

    return [accounts, failedMessage, statisticsObject];
  }

  /**
   * Sets the value for paid, unpaid, overpaid and underpaid statistics element
   *
   * @function
   * @param {Object} statisticsObject - Data containing count for each statistic
   * @param {Number} statisticsObject.paid - holds the value for the number of paid accounts
   * @param {Number} statisticsObject.unpaid - holds the value for the number of unpaid accounts
   * @param {Number} statisticsObject.overpaid - holds the value for
   * the number of overpaid accounts
   * @param {Number} statisticsObject.underpaid - holds the value for
   * the number of underpaid accounts
   */
  function setStatistics(statisticsObject) {
    if (!statisticsObject) return;

    const statMapping = {
      'paid-clients': statisticsObject.paid ?? 0,
      'unpaid-clients': statisticsObject.unpaid ?? 0,
      'overpaid-clients': statisticsObject.overpaid ?? 0,
      'underpaid-clients': statisticsObject.underpaid ?? 0
    };

    const statIds = Object.keys(statMapping);
    statIds.forEach(id => {
      const statElement = document.getElementById(id);
      const statValue = statMapping[id];
      if (statElement) {
        if (statElement.innerHTML === statValue) return;
        statElement.innerHTML = statValue;
      }
    });
  }
}

