// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  clearAndHideDialog,
  fillAndShowDialog,
  generateHTML,
  generateUniqueId,
  getById
} from '../../../../assets/scripts/helper.js';

// row
import BillingRow from './BillingRow.js';

/**
 * Generates a ${this.billType} bill entry form template for a client's billing record.
 *
 * @name BillForm
 * @class
 * @public
 */
export default class {
  /**
  * Creates a billing form instance.
  * @class
  * @param {string} rowId - The ID of the row associated with the billing form.
  * @param {string} billType - The type of bill ('new' or 'pay').
  * @param {object} formData - The data containing information about the client and bills.
  * @param {boolean} forNewBill - Indicates whether the form is for a new bill.
  * @property {string} billType - The type of bill ('new' or 'pay').
  * @property {string} rowId - The ID of the row associated with the billing form.
  * @property {string} billId - The ID of the latest bill or null if not available.
  * @property {string} clientId - The ID of the client or null if not available.
  * @property {string} familyName - The formatted family name derived from the client's lastname.
  * @property {string} formPurpose - The purpose of the form ('new-bill' or 'pay-bill').
  * @property {string} dialogErrorId - The unique ID for the error element in the form.
  * @property {string} dialogInputId - The unique ID for the input element in the form.
  * @property {string} dialogId - The unique ID for the dialog box containing the form.
  * @property {string} submitButtonId - The unique ID for the form submit button.
  * @property {string} closeButtonId - The unique ID for the form close button.
  * @property {string} template - HTML template for the billing form.
  */
  constructor(rowId, billType, formData, forNewBill) {
    const latestBill = formData.bills ? formData.bills[0] : null;

    const {lastName, id} = formData;
    this.billType = billType;
    this.rowId = rowId;

    this.billId = latestBill ? latestBill.id : null;
    this.clientId = id ?? null;

    this.formPurpose = `${billType}-bill`;
    const familyName = `Mr/Mrs ${lastName}`;

    this.dialogErrorId = generateUniqueId(`${this.formPurpose}-form-input-box-header-error`);
    this.dialogInputId = generateUniqueId(`${this.formPurpose}-form-input-box-input`);
    this.dialogId = generateUniqueId(`${this.formPurpose}-box`);

    this.submitButtonId = generateUniqueId(`${this.formPurpose}-form-submit`);
    this.closeButtonId = generateUniqueId(`${this.formPurpose}-form-close`);

    const formInputLabel = this.billType === 'new' ? 'New Reading' : 'Bill Amount';
    const [warning, title] = this.getReadingWarningAndTitle(latestBill, forNewBill, familyName);
    /**
    * HTML template for the billing form.
    * @member {string}
    */
    this.template = /* html */`
      <form id='${this.formPurpose}-form'>
        <p id='${this.formPurpose}-form-title'>${title}</p>
        <div id='${this.formPurpose}-form__input-box'>
          <p id='${this.formPurpose}-form__input-box__warning'>${warning}</p>
          <div id='${this.formPurpose}-form-input-box-header'>
              <label>${formInputLabel}</label>
              <p id='${this.dialogErrorId}'></p>
          </div>
          <input id='${this.dialogInputId}' type='number' name='reading' value='12' required>
        </div>
        <div id='${this.formPurpose}-form-buttons'>
            <button class='button-primary' id='${this.closeButtonId}'>Cancel</button>
            <button class='button-primary' id='${this.submitButtonId}'>
                ${billType === 'new' ? 'Add' : 'Pay'}
            </button>
        </div>
      </form>
    `;

    this.loadScripts();
    this.toString();
  }

  /**
   * Displays the billing form using fillAndShowDialog.
   * @method
   * @return {void}
   */
  toString() {
    fillAndShowDialog(this.template);
  }

  /**
   * Retrieves the reading warning and title based on the bill type.
   * @method
   * @param {object} latestBill - The latest bill data.
   * @param {boolean} forNewBill - Indicates whether the form is for a new bill.
   * @param {string} familyName - The family name of the client.
   * @return {Array} An array containing the reading warning and title.
   */
  getReadingWarningAndTitle(latestBill, forNewBill, familyName) {
    let warning = null;
    let title = null;

    switch (this.billType) {
      case 'new':

        title = `New Reading for ${familyName}`;

        if (!latestBill || forNewBill) {
          warning = `This will be the client's new billing record`;
          break;
        }

        warning = `${familyName}'s previous reading is ${latestBill.firstReading || ''}`;
        break;

      case 'pay':

        if (!latestBill) break;

        title = `Bills payment for ${familyName}`;
        const paymentStatus = latestBill.status;

        switch (paymentStatus) {
          case 'unpaid':
            const billAmount = latestBill.total || 'unidentifiable';
            warning = `${familyName} current bill is ${billAmount}`;
            break;

          case 'underpaid':
            const balance = latestBill.balance || 'unidentifiable';
            warning = `${familyName} remaining balance is ${balance}`;
            break;

          default:
            warning = '';
            break;
        }
        break;

      default:
        break;
    }

    return [warning, title];
  }

  /**
   * Processes the form, handling validation and invoking IPC renderer.
   * @async
   * @method
   * @return {Promise<void>}
   */
  async processForm() {
    const errorElement = getById(this.dialogErrorId);
    const dialogInput = getById(this.dialogInputId);
    const inputValue = dialogInput.value;

    const isNumberOrFloat = /^[0-9]+(\.[0-9]+)?$/.test(inputValue);

    if (inputValue.trim() === '') {
      errorElement.textContent = 'Payment amount cannot be empty';
      return;
    }

    if (!this.clientId) {
      errorElement.textContent = 'Missing client id';
      return;
    }

    if (!isNumberOrFloat) {
      errorElement.textContent = 'Must be a number';
      return;
    }

    const newBillData = {
      monthlyReading: inputValue,
      clientId: this.clientId,
      billId: this.billId
    };

    const payBillData = {
      amount: inputValue,
      billId: this.billId
    };

    console.log(this.formPurpose);

    // process bill
    const processBillArguments = this.billType === 'new' ? newBillData : payBillData;
    const processBill = await window.ipcRenderer.invoke(this.formPurpose, processBillArguments);

    console.log(processBill);
    makeToastNotification(processBill.toast);

    if (processBill.status === 'failed') return;
    clearAndHideDialog();

    await this.updateRow(processBill);
  }

  /**
   * Updates the row with the latest billing data.
   * @async
   * @method
   * @param {object} processBill - The processed billing data.
   * @return {Promise<void>}
   */
  async updateRow(processBill) {
    const getBill = await window.ipcRenderer.invoke('get-bill', {
      billId: processBill.billId || this.billId,
      clientId: this.clientId
    });

    makeToastNotification(getBill.toast);

    if (getBill.status === 'failed') return;

    const updatedBillData = JSON.parse(getBill.data);

    const newRowTemplate = new BillingRow(updatedBillData);
    const newRowHTML = generateHTML(newRowTemplate);

    const originalRow = getById(this.rowId);
    originalRow.replaceWith(newRowHTML);
  }

  /**
   * Loads scripts with a delay, setting up event listeners for close and submit actions.
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
        await this.processForm();
      };
    }, 0);
  }
}
