// helpers
import {queryElements, getById, transition} from '../../../../assets/scripts/helper.js';
import makeToastNotification from '../../../../assets/scripts/toast.js';

// main
import clientBuilder from '../../../client-builder/renderer/main/client-builder.js';

// dialogs
import ReconnectClientForm from './ReconnectClientForm.js';

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
   * @param {number} index - The index of the client row.
   * @property {object} client - The client data associated with the row.
   * @property {string} clientId - The unique identifier of the client.
   * @property {string} connectionStatus - The connection status of the client.
   * @property {string} tableOptionsId - The unique ID for the table options.
   * @property {string} reconnectButtonId - The unique ID for the reconnect button.
   * @property {string} archiveButtonId - The unique ID for the archive button.
   * @property {string} exportButtonId - The unique ID for the export button.
   * @property {string} editButtonId - The unique ID for the edit button.
   * @property {string} rowMenuId - The unique ID for the row menu.
   * @property {string} template - HTML template for the client row.
   */
  constructor(client, index) {
    this.client = client;

    const {
      connectionStatuses,
      accountNumber,
      phoneNumbers,
      meterNumber,
      mainAddress,
      fullName,
      birthDate,
      id
    } = client;

    const {fullAddress} = mainAddress;

    this.clientId = id;

    const noStatuses = connectionStatuses.length === 0;
    this.connectionStatus = noStatuses ? 'Not Set' : connectionStatuses[0].status;

    this.tableOptionsId = ['table-info__options', index].join('-');
    this.reconnectButtonId = ['reconnect', index].join('-');
    this.archiveButtonId = ['archive', index].join('-');
    this.exportButtonId = ['export', index].join('-');
    this.rowMenuId = ['row-menu', index].join('-');
    this.editButtonId = ['edit', index].join('-');

    this.template = `
            <div class='table-info' id='client-row-${id}'>
                <div id='${this.tableOptionsId}' class='table-info__options'>
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
                        <div id='${this.archiveButtonId}' class='table-info__options-item'>
                            ${icons.archiveIcon(null, 'archive-table-icon')}
                            <p>Archive</p>
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
                    <p>${meterNumber ?? ''}</p>
                </div>
                <div class='table-info__item'>
                    <p>${this.connectionStatus ?? ''}</p>
                </div>
                <div id='${this.rowMenuId}' class='table-info__item row-menu'>
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
        <div id='${this.reconnectButtonId}' class='table-info__options-item'>
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
      const archiveButton = getById(this.archiveButtonId);
      const exportButton = getById(this.exportButtonId);
      const tableOptions = getById(this.tableOptionsId);
      const editButton = getById(this.editButtonId);
      const rowMenu = getById(this.rowMenuId);

      editButton.onclick = async () => {
        transition(async () => await clientBuilder(true, this.client));
      };

      exportButton.onclick = async () => {
        const exportDateResult = await window.ipcRenderer.invoke('export-record', {
          id: this.clientId
        });
        makeToastNotification(exportDateResult.toast[0]);
      };

      rowMenu.onclick = () => {
        if (tableOptions.classList.contains('active')) {
          tableOptions.classList.remove('active');
          return;
        }

        queryElements('.row-menu').forEach(element => {
          if (element.id !== rowMenu.id) {
            tableOptions.classList.remove('active');
            return;
          }
          tableOptions.classList.add('active');
        });
      };

      if (reconnectButton) {
        reconnectButton.onclick = async () => {
          const response = await window.ipcRenderer.invoke('get-client', {clientId: this.clientId});
          if (response.status === 'failed') return makeToastNotification(response.toast[0]);

          const client = JSON.parse(response.data);
          new ReconnectClientForm(client);
        };
      }

      archiveButton.onclick = () => console.log('archive clicked');
    }, 0);
  }
}
