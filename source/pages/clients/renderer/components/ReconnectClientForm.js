/* eslint-disable indent */

// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  clearAndHideDialog,
  fillAndShowDialog,
  generateUniqueId,
  getById
} from '../../../../assets/scripts/helper.js';

/**
 * @class
 * @name ReconnectClientForm
 * @description generates a reconnection form dialog for a client.
 * @return {string} The HTML template for the reconnection form.
 */
export default class {
  /**
   * Represents a form for reconnecting a client.
   * @class
   * @param {object} client - The client data for reconnection.
   * @property {string} closeButtonId - The unique ID for the close button.
   * @property {string} submitButtonId - The unique ID for the submit button.
   * @property {string} dialogId - The unique ID for the reconnection dialog.
   * @property {string} dialogErrorId - The unique ID for the error message in the dialog.
   * @property {string} dialogInputId - The unique ID for the input field in the dialog.
   * @property {string} template - HTML template for the reconnection form.
   */
  constructor(client) {
    this.clientId = client.id;
    const hasBill = client.bills && client.bills.length > 0;
    const billAmount = hasBill ? client.bills[0].total : 0;

    this.dialogErrorId = generateUniqueId(`reconnect-form-input-box-header-error`);
    this.dialogInputId = generateUniqueId(`reconnect-form-input-box-input`);
    this.dialogId = generateUniqueId(`reconnect-box`);

    this.submitButtonId = generateUniqueId(`reconnect-form-submit`);
    this.closeButtonId = generateUniqueId(`reconnect-form-close`);

    this.template = /* html */`
      <form id='reconnect-form'>
        <p id='reconnect-form-title'>Reconnection for Mr/Mrs ${client.fullName}</p>
        <div id='reconnect-form__input-box'>
          <p id='${this.dialogErrorId}'></p>
          <p id='reconnect-form__input-box__warning'>
            ${
              hasBill ?
              `total amount of ${billAmount} must be paid first to complete reconnection` : ``
            }
          </p>
          <input
              id='${this.dialogInputId}'
              type='number'
              name='reconnectAmount'
              data-total='${billAmount}'
              value=''
              required>
        </div>
        <div id='reconnect-form-buttons'>
            <button class='button-primary' id='${this.closeButtonId}'>Cancel</button>
            <button class='button-primary' id='${this.submitButtonId}'>Reconnect</button>
        </div>
      </form>
    `;

    this.loadScripts();
    this.toString();
  }

  /**
  * Converts the reconnection form instance to its HTML string representation.
  * @method
  * @return {void}
  */
  toString() {
    fillAndShowDialog(this.template);
  }

  /**
  * Processes the reconnection, handling validation and updating the UI.
  * @async
  * @method
  * @return {Promise<void>}
  */
  async processReconnection() {
    const reconnectFormInput = getById(this.dialogInputId);
    const errorMessage = getById(this.dialogErrorId);

    const expectedPayment = reconnectFormInput.dataset.total;
    const paidAmount = reconnectFormInput.value;

    if (paidAmount !== expectedPayment) {
      errorMessage.textContent = 'The full amount must be paid in order to continue';
      return;
    }

    this.setRowReconnected();
    clearAndHideDialog();

    const response = await window.ipcRenderer.invoke('reconnect-client', {
      clientId: this.clientId,
      paidAmount: paidAmount
    });

    if (response.status === 'failed') {
      makeToastNotification(response.toast);
      this.revertOriginalRow();
      return;
    }

    makeToastNotification(response.toast);
  }

  /**
  * Sets the UI to indicate that the client row has been reconnected.
  * @method
  * @return {void}
  */
  setRowReconnected() {
    const rowElement = getById(`client-row-${this.clientId}`);
    rowElement.children[7].firstElementChild.textContent = window.connectionStatusTypes.Connected;
    rowElement.removeAttribute(`id`);
    rowElement.querySelector('.table-info__options-item.reconnect').style.display = 'none';
  }

  /**
  * Reverts the client row to its original state if reconnection fails.
  * @method
  * @return {void}
  */
  revertOriginalRow() {
    const rowElement = getById(`client-row-${clientId}`);

    if (rowElement) {
      const statusColumn = rowElement.children[6].firstElementChild;
      statusColumn.textContent = window.connectionStatusTypes.Disconnected;
      rowElement.id = `client-row-${this.clientId}`;
      rowElement.querySelector('.table-info__options-item.reconnect').style.display = 'block';
    }
  }

  /**
  * Loads scripts with a delay, setting up event listeners for buttons.
  * @method
  * @return {void}
  */
  loadScripts() {
    setTimeout(() => {
      const closeButton = getById(this.closeButtonId);
      const submitButton = getById(this.submitButtonId);

      closeButton.onclick = event => {
        event.preventDefault();
        clearAndHideDialog();
      };

      submitButton.onclick = async event => {
        event.preventDefault();
        await this.processReconnection();
      };
    }, 0);
  }
}
