// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  generateUniqueId,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// main
import clientBuilder from '../../../client-builder/renderer/main/client-builder.js';

// dialogs
import ReconnectClientForm from './ReconnectClientForm.js';
import DeleteClientDialog from './DeleteClientDialog.js';

// icons
import {icons} from '../../../../assets/scripts/icons.js';

/**
 * @class ClientRow
 * @description a class that returns a table row for client table
 */
export default class {
  /**
   * Represents a table row for the client table.
   * @class
   * @param {object} client - The client data associated with the row.
   * @property {object} client - The client data associated with the row.
   * @property {string} clientId - The unique identifier of the client.
   * @property {string} connectionStatus - The connection status of the client.
   * @property {string} rowMenuId - The unique ID for the table options.
   * @property {string} reconnectButtonId - The unique ID for the reconnect button.
   * @property {string} exportButtonId - The unique ID for the export button.
   * @property {string} editButtonId - The unique ID for the edit button.
   * @property {string} rowMenuToggleId - The unique ID for the row menu.
   * @property {string} deleteButtonId - The unique ID for the delete button.
   * @property {string} template - HTML template for the client row.
   */
  constructor(client) {
    this.client = client;

    const {
      connectionStatuses,
      accountNumber,
      phoneNumbers,
      profilePicture,
      // meterNumber,
      mainAddress,
      fullName,
      birthDate,
      id
    } = client;

    const {fullAddress} = mainAddress;

    this.clientId = id;

    const noStatuses = connectionStatuses.length === 0;
    this.connectionStatus = noStatuses ? 'Not Set' : connectionStatuses[0].status;

    this.rowMenuToggleId = generateUniqueId('client-row-menu-toggle');
    this.deleteButtonId = generateUniqueId('client-delete');
    this.reconnectButtonId = generateUniqueId('reconnect');
    this.exportButtonId = generateUniqueId('export');
    this.editButtonId = generateUniqueId('edit');
    this.rowId = generateUniqueId('client-row');

    const profilePath = '../static/images/clients/profile';
    const backupProfilePath = `${profilePath}/user.webp`;
    const clientProfilePath = `${profilePath}/${profilePicture}`;
    const finalProfilePath = profilePicture ? clientProfilePath : backupProfilePath;

    this.template = /* html */`
      <div class='table-info' id='${this.rowId}'>
        <div class='table-info__profile'>
          <img src="${finalProfilePath}" alt="${fullName ?? 'Client'}">
        </div>
        <div class='table-info__options'>
          <p>Menu</p>
          <div class='table-info__options-item-box'>
            ${this.reconnectButton()}
            <div id='${this.editButtonId}' class='table-info__options-item'>
                ${icons.editIcon(null, 'edit-table-icon')}
                <p>Edit</p>
            </div>
            <div id='${this.exportButtonId}' class='table-info__options-item'>
                ${icons.printIcon(null, 'print-bill-icon')}
                <p>Export</p>
            </div>
            <div id='${this.deleteButtonId}' class='table-info__options-item'>
                ${icons.binIcon(null, 'bin-icon')}
                <p>Delete</p>
            </div>
          </div>
        </div>
        <div class='table-info__item'>
            <p>${accountNumber ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${fullName ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${fullAddress ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>+63${phoneNumbers[0]?.phoneNumber ?? 'XXXXXXXXXX'}</p>
        </div>
        <div class='table-info__item'>
            <p>${birthDate ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${this.connectionStatus ?? ''}</p>
        </div>
        <div id='${this.rowMenuToggleId}' class='table-info__item row-menu'>
            <div class='icon-box'>
                ${icons.menuIcon(null, 'menu')}
            </div>
        </div>
      </div>
    `;

    this.loadScripts();
  }

  /**
   * Converts the client row instance to its HTML string representation.
   * @method
   * @return {string} The HTML string representing the client row.
   */
  toString() {
    return this.template;
  }

  /**
   * Creates the HTML string for the Reconnect button based on the client's connection status.
   * @method
   * @return {string} The HTML string representing the Reconnect button.
   */
  reconnectButton() {
    return this.connectionStatus === window.connectionStatusTypes.Disconnected ?
      `
        <div id='${this.reconnectButtonId}' class='table-info__options-item reconnect'>
          ${icons.printIcon(null, 'print-bill-icon')}
          <p>Reconnect</p>
        </div>` : '';
  }

  /**
   * Loads scripts with a delay, setting up event listeners for buttons and menu toggle.
   * @method
   * @return {void}
   */
  loadScripts() {
    setTimeout(() => {
      const reconnectButton = getById(this.reconnectButtonId);
      const rowMenuToggle = getById(this.rowMenuToggleId);
      const deleteButton = getById(this.deleteButtonId);
      const exportButton = getById(this.exportButtonId);
      const editButton = getById(this.editButtonId);

      const row = getById(this.rowId);
      const profileDiv = row.querySelector('.table-info__profile');
      const rowMenu = row.querySelector('.table-info__options');

      row.onmouseover = event => {
        if (!profileDiv) return;
        if (rowMenuToggle && event.target === rowMenuToggle) {
          profileDiv.classList.remove('active');
          return;
        };

        const mouseX = event.clientX;
        profileDiv.style.left = `${mouseX - profileDiv.offsetWidth}px`;
        profileDiv.classList.add('active');
      };

      row.onmouseleave = () => {
        if (!profileDiv) return;
        profileDiv.classList.remove('active');
      };

      editButton.onclick = async () => {
        rowMenu.classList.remove('active');
        transition(async () => await clientBuilder(true, this.client));
        return;
      };

      exportButton.onclick = async () => {
        rowMenu.classList.remove('active');
        const exportDateResult = await window.ipcRenderer.invoke('export-record', {
          id: this.clientId
        });
        makeToastNotification(exportDateResult.toast);
      };

      rowMenuToggle.onclick = () => {
        rowMenu.classList.toggle('active');
      };

      if (reconnectButton) {
        reconnectButton.onclick = async () => {
          rowMenu.classList.remove('active');
          const response = await window.ipcRenderer.invoke('get-client', {clientId: this.clientId});
          if (response.status === 'failed') return makeToastNotification(response.toast);

          const client = JSON.parse(response.data);
          new ReconnectClientForm(client);
        };
      }

      deleteButton.onclick = () => new DeleteClientDialog(this.clientId);
    }, 0);
  }
}
