// helpers
import {queryElements, transition, getById} from '../../../../assets/scripts/helper.js';
import makeToastNotification from '../../../../assets/scripts/toast.js';

// main
import clientBuilder from '../../../client-builder/renderer/main/client-builder.js';
import billing from '../../../billing/renderer/main/billing.js';
import login from '../../../authentication/renderer/main/login.js';
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
  getById('container').innerHTML += await clientTemplate();

  setUpTableSearch();
  setTimeout(() => getById('section-type-container').classList.add('active'), 500);

  window.onclick = async event => {
    switch (event.target.id) {
      case 'billing':
        transition(billing);
        break;

      case 'profile':
        transition(profile);
        break;

      case 'logout':
        transition(login);
        break;

      case 'new-connection':
        transition(clientBuilder);
        break;

      case 'client-options-toggle':
        getById('client-options-toggle-options-list').classList.toggle('active');
        break;

      case 'client-options-filter':
        getById('client-filter-toggle-filter-list').classList.toggle('active');
        break;

      case 'filter-button-disconnected-clients':
        await changeTableByFilter(elementId, 'Disconnected');
        break;

      case 'filter-button-due-clients':
        await changeTableByFilter(elementId, 'Due for Disconnection');
        break;

      case 'filter-button-connected-clients':
        await changeTableByFilter(elementId, 'Disconnected');
        break;
    }
  };
}

/**
 * Sets up the client table search functionality.
 * Listens for input changes in the search box and updates the table accordingly.
 */
function setUpTableSearch() {
  const filterValue = getById('client-search-box-filter').value;
  const search = getById('client-search-box-input');

  search.oninput = () => {
    const tableRows = queryElements('.table-info');
    const allowed = inputAllowed(tableRows, search.value, filterValue);
    if (allowed) updateTable(filterValue, search.value);
  };
}

/**
 * Validates the search value and updates the displayed table rows accordingly.
 *
 * @param {Element[]} tableRows - The table rows to be filtered.
 * @param {string} searchValue - The value to be searched.
 * @param {string} searchFilterValue - The selected filter for the search.
 * @return {boolean} True if validation passed, false otherwise.
 */
function inputAllowed(tableRows, searchValue, searchFilterValue) {
  const searchFilters = [
    'accountNumber',
    'relationshipStatus',
    'meterNumber',
    'fullName',
    'email',
    'age'
  ];

  if (!tableRows) {
    makeToastNotification('No clients yet');
    return false;
  }

  // cursor is still inside the input but empty
  if (searchValue.trim() === '') {
    tableRows.forEach(row => row.style.display = 'grid');
    return false;
  }

  if (!searchFilters.includes(searchFilterValue)) {
    makeToastNotification('Choose a filter first');
    return false;
  }

  return true;
}

/**
 * Updates the displayed table rows based on the specified column and data.
 *
 * @param {string} column - The column to filter by.
 * @param {string} data - The data to filter with.
 * @return {Promise<void>} Resolves when the table rows are updated.
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
    button.style.backgroundColor = button.id !== elementId ? 'var(--primary)' : 'var(--accent)';
  });
  await updateTable('connectionStatuses.status', filter);
}

/**
 * Retrieves clients based on the specified column and data.
 *
 * @param {string|null} columnName - The column to filter by or null.
 * @param {string|null} columnData - The data to filter with or null.
 * @return {Promise<Array<Object|null, string|null>>} An array containing the
 * retrieved clients and a message.
 */
async function retrieveClients(columnName, columnData) {
  const {status, data, message} = await window.ipcRenderer.invoke('clients', {
    columnName, columnData
  });

  const ok = status === 'success';

  const clients = ok ? JSON.parse(data) : null;
  const failedMessage = ok ? message : null;

  return [clients, failedMessage];
}
