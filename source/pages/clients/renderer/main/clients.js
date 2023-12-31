// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  queryElements,
  queryElement,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// main
import clientBuilder from '../../../client-builder/renderer/main/client-builder.js';
import login from '../../../authentication/renderer/main/login.js';
import billing from '../../../billing/renderer/main/billing.js';
import profile from '../../../profile/renderer/main/profile.js';

// templates
import clientTemplate, {renderTable} from '../templates/clients.js';

/**
 * Renders the client section, including client data table, options, and event handlers.
 *
 * @async
 * @function clients
 * @return {Promise<void>} Resolves when the client section is fully rendered.
 */
export default async function() {
  const [clients, noClientsMessage] = await retrieveClients();
  const template = await clientTemplate(clients, noClientsMessage);
  getById('container').innerHTML += template;

  queryElement('.client-page').onclick = async event => {
    switch (event.target.id) {
      case 'billing':
        transition(billing);
        return;

      case 'profile':
        transition(profile);
        return;

      // removed await as we dont need to wait for anything
      // when loging out, it can simply logout
      // while transitioning to the login page
      case 'logout':
        window.ipcRenderer.invoke('logout');
        transition(login);
        return;

      case 'new-connection':
        transition(clientBuilder);
        return;

      case 'client-options-toggle':
        getById('client-options-toggle-options-list').classList.toggle('active');
        break;

      case 'client-options-filter':
        getById('client-filter-toggle-filter-list').classList.toggle('active');
        break;

      case 'filter-button-due-clients':
        await changeTableByFilter(event.target.id, 'Due for Disconnection');
        break;

      case 'filter-button-disconnected-clients':
        await changeTableByFilter(event.target.id, 'Disconnected');
        break;

      case 'filter-button-connected-clients':
        await changeTableByFilter(event.target.id, 'Connected');
        break;
    }
  };

  const filterSelect = getById('client-search-box-filter');
  const search = getById('client-search-box-input');

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
      'lastName',
      'email',
      'age'
    ];

    if (!tableRows) {
      makeToastNotification('No clients yet');
      return false;
    }

    // cursor is still inside the input but empty
    if (searchValue.trim() === '') {
      tableRows.forEach(row => {
        if (row) row.style.display = 'grid';
      });
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
    const [clients, message] = await retrieveClients(column, data);
    const tableRowContainer = getById('table-data-rows');
    tableRowContainer.innerHTML = renderTable(clients, message);
  }

  /**
   * Changes the displayed table rows based on the specified filter.
   *
   * @param {string} elementId - The ID of the clicked filter button.
   * @param {string} filter - The filter to be applied.
   * @return {Promise<void>} Resolves when the table rows are updated.
   */
  async function changeTableByFilter(elementId, filter) {
    const filterButtons = queryElements('.client-filter-toggle-filter-list__item');

    filterButtons.forEach(button => {
      const clickedButton = button.id !== elementId;
      button.style.backgroundColor = `'var(--${clickedButton ? 'primary' : 'accent'})'`;
    });
    updateTable('status', filter);
  }
}

/**
 * Retrieves clients based on the specified column and data.
 *
 * @param {string|null} columnName - The column to filter by or null.
 * @param {string|null} columnData - The data to filter with or null.
 * @return {Promise<Array<Object|null, string|null>>} An array containing the
 * retrieved clients and a message.
 */
export async function retrieveClients(columnName, columnData) {
  const {status, data, message} = await window.ipcRenderer.invoke('clients', {
    columnName: columnName,
    columnData: columnData
  });

  const clients = status === 'success' ? JSON.parse(data) : null;
  const failedMessage = status === 'failed' ? message : null;
  return [clients, failedMessage];
}
