/* eslint-disable indent */

// helpers
import {formatDate, generateUniqueId, getById} from '../../../../assets/scripts/helper.js';

// icons
import {icons} from '../../../../assets/scripts/icons.js';
import makeToastNotification from '../../../../assets/scripts/toast.js';

// form
import BillForm from './BillForm.js';

/**
 *
 * @class BillingRow
 * @description A class component which returns a string html of a billing table
 */
export default class {
  /**
 * Represents a billing row in the table.
 * @class
 * @param {object} account - The account data associated with the billing row.
 * @param {boolean} isDisconnected - Indicates whether the client is disconnected.
 * @property {boolean} isDisconnected - Indicates whether the client is disconnected.
 * @property {object} account - The account data associated with the billing row.
 * @property {string} connectionStatus - The latest connection status of the account.
 * @property {boolean} clientHasBills - Indicates whether the client has bills.
 * @property {object} billData - The latest bill data associated with the client.
 * @property {boolean} hasEitherReadings - Indicates whether the client has either readings.
 * @property {boolean} hasBothReadings - Indicates whether the client has both readings.
 * @property {boolean} clientHasPaid - Indicates whether the client has paid bills.
 * @property {string} printBillButtonId - The unique ID for the print bill button.
 * @property {string} newBillButtonId - The unique ID for the new bill button.
 * @property {string} payBillButtonId - The unique ID for the pay bill button.
 * @property {string} rowMenuToggleId - The unique ID for the row menu toggle button.
 * @property {string} rowMenuId - The unique ID for the row menu.
 * @property {string} rowId - The unique ID for the table row.
 * @property {string} template - HTML template for the billing row.
 */
  constructor(account, isDisconnected) {
    this.isDisconnected = isDisconnected;
    this.account = account;
    this.accountId = account.id;

    const hasStatuses = account.connectionStatuses.length > 0;
    const latestStatus = account.connectionStatuses[0].status;

    this.connectionStatus = hasStatuses ? latestStatus : null;
    this.clientHasBills = account.bills.length > 0;
    this.billData = this.clientHasBills ? account.bills[0] : {};

    const {
      disconnectionDate,
      secondReading,
      firstReading,
      consumption,
      amountPaid,
      balance,
      penalty,
      dueDate,
      excess,
      status,
      total,
      id
    } = this.billData;

    this.billId = id;

    this.hasFirstReading = firstReading !== null && firstReading !== undefined;
    this.hasSecondReading = secondReading !== null && secondReading !== undefined;

    this.hasEitherReadings = this.hasFirstReading || this.hasSecondReading;
    this.hasBothReadings = this.hasFirstReading && this.hasSecondReading;

    this.clientHasPaid = status === 'paid' || status === 'overpaid';

    this.reconnectButtonId = generateUniqueId('billing-reconnect-button');
    this.printBillButtonId = generateUniqueId('billing-print-button');
    this.newBillButtonId = generateUniqueId('billing-new-button');
    this.payBillButtonId = generateUniqueId('billing-pay-button');

    this.rowMenuToggleId = generateUniqueId('billing-row-menu-toggle');
    this.rowId = generateUniqueId('billing-table-row');

    this.template = /* html */`
      <div id='${this.rowId}' class='table-info account'>

        <div class='table-info__options'>
            ${this.renderRowOptions()}
        </div>

        <div class='table-info__item'>
            <p>${account.accountNumber ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${account.fullName ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${account.meterNumber ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${firstReading ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${secondReading ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${consumption ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${total ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${formatDate(dueDate) ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${status ?? ''}</p>
        </div>
        <div class='table-info__item'>
            <p>${penalty ?? '0.0'}</p>
        </div>
        <div class='table-info__item'>
            <p>${excess ?? '0.0'}</p>
        </div>
        <div class='table-info__item'>
            <p>${balance ?? '0.0'}</p>
        </div>
        <div class='table-info__item'>
            <p>${amountPaid ?? '0.0'}</p>
        </div>
        <div class='table-info__item'>
            <p>${formatDate(disconnectionDate) || ''}</p>
        </div>

        <div
          id='${this.rowMenuToggleId}'
          class='table-info__item table-menu'>
            <div class='icon-box'>
              ${icons.menuIcon(null, 'menu')}
            </div>
        </div>

      </div>
    `;

    this.loadScript();
  }

   /**
   * Converts the billing row instance to its HTML string representation.
   * @method
   * @return {string} The HTML string representing the billing row.
   */
  toString() {
    return this.template;
  }

  /**
   * Renders the options for the row menu.
   * @method
   * @return {string} The HTML string representing the row menu options.
   */
  renderRowOptions() {
    return /* html */`
      <p>Menu</p>
      <div
        class='table-info__options-item-box account'
        data-client-has-bills='${this.clientHasBills}'
        data-client-has-paid='${this.clientHasPaid}'
        data-client-id='${this.account.id}'>
        ${
          this.isDisconnected ? this.disconnectedMessage() :
            [
              this.newBillButton(),
              this.payBillButton(),
              this.printBillButton()
            ].join('')
        }
      </div>
    `;
  }

  /**
   * Creates the HTML string for the "New Bill" button.
   * @method
   * @return {string} The HTML string representing the "New Bill" button.
   */
  newBillButton() {
    return this.clientHasPaid ||
          (!this.hasFirstReading && !this.hasSecondReading) ||
          (this.hasFirstReading && !this.hasSecondReading) ? /* html */`
      <div id='${this.newBillButtonId}' class='table-info__options-item'>
        ${icons.editIcon(null, 'edit-table-icon')}
        <p>New</p>
      </div>
    ` : '';
  }

  /**
   * Creates the HTML string for the "Pay Bill" button.
   * @method
   * @return {string} The HTML string representing the "Pay Bill" button.
   */
  payBillButton() {
    return !this.clientHasPaid && this.hasFirstReading && this.hasSecondReading ? `
      <div id='${this.payBillButtonId}' class='table-info__options-item'>
        ${icons.payIcon(null, 'table-pay-icon')}
        <p>Pay</p>
      </div>
    ` : '';
  }

  /**
   * Creates the HTML string for the "Print Bill" button.
   * @method
   * @return {string} The HTML string representing the "Print Bill" button.
   */
  printBillButton() {
    return !this.clientHasPaid && this.hasBothReadings ? /* html */`
      <div id='${this.printBillButtonId}' class='table-info__options-item'>
        ${icons.printIcon(null, 'print-bill-icon')}
        <p>Print Bill</p>
      </div>
    ` : '';
  }

  /**
   * Creates the HTML string for the "Disconnected" message.
   * @method
   * @return {string} The HTML string representing the "Disconnected" message.
   */
  disconnectedMessage() {
    return /* html */`
      <div id='${this.reconnectButtonId}' class='table-info__options-item'>
          <p>Disconnected</p>
      </div>
    `;
  }

  /**
   * Loads scripts with a delay, setting up event listeners for buttons and menu toggle.
   * @method
   * @return {void}
   */
  loadScript() {
    setTimeout(() => {
      const reconnectButton = getById(this.reconnectButtonId);
      const printBillButton = getById(this.printBillButtonId);
      const newBillButton = getById(this.newBillButtonId);
      const payBillButton = getById(this.payBillButtonId);
      const rowMenuToggle = getById(this.rowMenuToggleId);

      const rowMenu = rowMenuToggle
          .closest('.table-info')
          .querySelector('.table-info__options');

      if (newBillButton) {
        newBillButton.onclick = () => {
          rowMenu.classList.remove('active');
          new BillForm(this.rowId, 'new', this.account, this.clientHasPaid);
        };
      }

      if (payBillButton) {
        payBillButton.onclick = () => {
          rowMenu.classList.remove('active');
          new BillForm(this.rowId, 'pay', this.account, this.clientHasPaid);
        };
      }

      if (printBillButton) {
        printBillButton.onclick = async () => {
          if (!this.accountId && !hasBill) {
            makeToastNotification('Account and bill is missing');
            return;
          }
          rowMenu.classList.remove('active');
          makeToastNotification('Please wait while printing is in progress');

          const response = await window.ipcRenderer.invoke('print-bill', {
            accountId: this.accountId,
            billId: this.billId
          });

          makeToastNotification(response.toast);
        };
      }

      if (reconnectButton) {
        reconnectButton.onclick = () => {
          makeToastNotification('Reconnect client first at the client section');
        };
      }

      if (rowMenuToggle) {
        rowMenuToggle.onclick = () => {
          rowMenu.classList.toggle('active');
        };
      }
    }, 0);
  }
}

