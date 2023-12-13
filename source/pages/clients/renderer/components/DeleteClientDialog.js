// helpers
import {
  clearAndHideDialog,
  fillAndShowDialog,
  generateUniqueId,
  getById
} from '../../../../assets/scripts/helper.js';

// toast
import makeToastNotification from '../../../../assets/scripts/toast.js';

/**
 * class that when instantiated returns an innerHTML for a
 * <Dialog></Dialog> to delete client
 *
 * @name DeleteClientDialog
 * @class
 * @public
 */
export default class {
  /**
   * Creates an instance of the DeleteClientForm.
   * @class
   * @param {string} clientId - The ID of the client to be deleted.
   * @property {string} clientId - The ID of the client to be deleted.
   * @property {string} submitButtonId - The ID of the submit button in the form.
   * @property {string} closeButtonId - The ID of the close button in the form.
   * @property {string} template - The HTML template for the form.
   */
  constructor(clientId) {
    this.clientId = clientId;

    const deleteClient = `delete-client`;

    this.submitButtonId = generateUniqueId(`${deleteClient}-form-submit`);
    this.closeButtonId = generateUniqueId(`${deleteClient}-form-close`);

    this.template = /* html */`
      <div id='${deleteClient}-form'>
        <p id='${deleteClient}-form-title'>
          Delete Client?
        </p>
        <p id='${deleteClient}-form__input-box__warning'>
          Are you sure you want to delete this client?
          Doing so will completely remove their data.
          But an export will be attempted to save their records.
        </p>
        <div id='${deleteClient}-form-buttons'>
            <button class='button-primary' id='${this.closeButtonId}'>
              Cancel
            </button>
            <button class='button-primary' id='${this.submitButtonId}'>
              Delete
            </button>
        </div>
      </div>
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
   * Loads scripts with a delay, setting up event listeners for close and submit actions.
   * @method
   * @return {void}
   */
  loadScripts() {
    setTimeout(() => {
      const closeButton = getById(this.closeButtonId);
      const submitButton = getById(this.submitButtonId);

      closeButton.onclick = () => {
        clearAndHideDialog();
        return;
      };

      submitButton.onclick = async () => {
        clearAndHideDialog();
        // hides row first when deleting
        const clientRow = getById(`client-row-${this.clientId}`);
        if (clientRow) clientRow.style.display = 'none';

        const response = await window.ipcRenderer.invoke('delete-client', this.clientId);
        if (!response) return;

        if (response.toast) makeToastNotification(response.toast);
        // remove the hidden client row if delete succesfully
        if (response.status === 'success' && clientRow) clientRow.remove();
        return;
      };
    }, 0);
  }
}
