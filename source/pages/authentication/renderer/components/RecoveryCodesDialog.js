/* eslint-disable indent */
// icons
import {icons} from '../../../../assets/scripts/icons.js';

// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';

import {
  clearAndHideDialog,
  fillAndShowDialog,
  generateUniqueId,
  getById
} from '../../../../assets/scripts/helper.js';

/**
 *
 * @class RecoveryCodesDialog
 * @description shows a list of recovery codes for the user
 */
export default class {
  /**
  * Creates an instance of RecoveryCodesDialog.
  * @param {Array<string>} recoveryCodes
  * @constructor
  */
  constructor(recoveryCodes) {
    this.recoveryCodes = recoveryCodes;

    this.closeButtonId = generateUniqueId(`recovery-codes-form__buttons__close`);
    this.clipBoardBoxId = generateUniqueId(`clipboard-box`);
    this.dialogId = generateUniqueId(`recovery-codes-box`);

    this.template = /* html */`
      <form class='recovery-codes-form'>
        <p class='recovery-codes-form__title'>Recovery Codes</p>
        <div class='recovery-codes-form__center'>
          <div class='recovery-codes-form__center__list__header'>
            <p class='recovery-codes-form__center__warning'>
              This will be the recovery codes for your account.
              Without a recovery code you will never be able to recover your account.
              Click the icon to copy it and save it somewhere safe.
            </p>
            <div
              id='${this.clipBoardBoxId}'
              class='recovery-codes-form__center__list__header__clipboard-box'>
              ${ icons.clipboardIcon('clipboard') }
            </div>
          </div>
          <div class='recovery-codes-form__center__list'>
            <div class='recovery-codes-form__center__list__codes'>
              ${
                recoveryCodes.map(recoveryCode => {
                  return `<p>${recoveryCode}</p>`;
                }).join('')
              }
            </div>
          </div>
        </div>
        <div class='recovery-codes-form__buttons'>
          <button class='button-primary' id='${this.closeButtonId}'>Close</button>
        </div>
      </form>
    `;

    this.loadScripts();
    this.toString();
  }

  /**
   * Fills the global dialog element with the template and shows it
   * @method
   * @return {void}
   */
  toString() {
    fillAndShowDialog(this.template);
  }

  /**
   * Loads scripts with a delay,
   * setting up event listeners for close and clipboard copy actions.
   * @method
   * @return {void}
   */
  loadScripts() {
    setTimeout(() => {
      /**
       * Event handler for the close button click.
       * @param {Event} event - The click event.
       * @return {void}
       */
      const closeButtonHandler = event => {
        event.preventDefault();
        clearAndHideDialog();
      };

      /**
       * Event handler for the clipboard box click, copying recovery codes to the clipboard.
       * @async
       * @return {Promise<void>}
       */
      const clipboardBoxHandler = async () => {
        navigator.clipboard.writeText(this.recoveryCodes.join(', '))
          .then(() => makeToastNotification('Codes copied to clipboard.'))
          .catch(error => {
            makeToastNotification('Failed to copy codes');
            console.error(error);
          });
      };

      const closeButton = getById(this.closeButtonId);
      const clipBoardBox = getById(this.clipBoardBoxId);

      closeButton.onclick = closeButtonHandler;
      clipBoardBox.onclick = clipboardBoxHandler;
    }, 0);
  }
}
