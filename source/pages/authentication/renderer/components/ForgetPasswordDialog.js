/* eslint-disable indent */

// components
import Input from '../../../../components/Input.js';

// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';

import {
  clearAndHideDialog,
  fillAndShowDialog,
  generateHTML,
  generateUniqueId,
  getById,
  getFormData
} from '../../../../assets/scripts/helper.js';

/**
 * @class ForgetPasswordDialog
 * @description represents a Forget Password Dialog for account recovery.
 */
export default class {
  /**
  * Creates an instance of ForgetPasswordDialog.
  * @constructor
  */
  constructor() {
    const {isEmail, isEmpty, isOverThan, hasNoSymbols} = window;

    /**
    * Enum representing different states of the Forget Password Dialog.
    * @enum {string}
    */
    this.states = {
      VERIFY: 'verify',
      RECOVER: 'recover'
    };

    /**
    * Current state of the Forget Password Dialog.
    * @member {string}
    */
    this.currentState = this.states.VERIFY;

    const formName = 'forget-password-form';

    this.dialogRecoveryCodeInputId = generateUniqueId(`${formName}-input-box-recovery-code-input`);
    this.dialogPasswordInputId = generateUniqueId(`${formName}-input-box-password-input`);
    this.dialogEmailInputId = generateUniqueId(`${formName}-input-box-email-input`);
    this.dialogErrorId = generateUniqueId(`${formName}-input-box-header-error`);
    this.submitButtonId = generateUniqueId(`${formName}-submit`);
    this.closeButtonId = generateUniqueId(`${formName}-close`);
    this.dialogId = generateUniqueId(`forget-password-box`);
    this.formId = generateUniqueId(formName);

    /**
    * Password input field for the Forget Password Dialog.
    * @member {Input}
    */
    this.dialogPasswordInput = new Input([isEmpty], {
      flags: ['required'],
      attributes: {
        id: this.dialogPasswordInputId,
        value: 'Adrian2001.',
        label: 'Password',
        name: 'password',
        type: 'password',
        maxlength: '255'
      }
    });

    /**
    * HTML template for the Forget Password Dialog.
    * @member {string}
    */
    this.template = `
      <form id='${this.formId}' class='${formName}'>
        <p id='${formName}-title'>
            Account Recovery
        </p>
        <p id='forget-password-form__input-box__warning'>
            A recovery code is required to proceed
        </p>
        <div id='forget-password-form__input-box'>
          ${
            [
              new Input([isEmpty, isEmail, [isOverThan, 0, 255]], {
                flags: ['required'],
                attributes: {
                  value: 'samadriansabalo99@gmail.com',
                  id: this.dialogEmailInputId,
                  maxlength: '255',
                  label: 'Email',
                  name: 'email'
                }
              }),
              new Input([isEmpty, hasNoSymbols, [isOverThan, 0, 8]], {
                flags: ['required'],
                attributes: {
                  id: this.dialogRecoveryCodeInputId,
                  label: 'Recovery Code',
                  name: 'recoveryCode',
                  value: 'AvkPIVI1',
                  maxlength: '8'
                }
              })
            ].join('')
          }
        </div>
        <div id='forget-password-form-buttons'>
            <button class='button-primary' id='${this.closeButtonId}'>
                Cancel
            </button>
            <button class='button-primary' id='${this.submitButtonId}'>
                Verify Code
            </button>
        </div>
      </form>
    `;

    this.loadScripts();
    this.toString();
  }

  /**
     * Converts the Forget Password Dialog instance to its string representation and displays it.
     * @method
     */
  toString() {
    fillAndShowDialog(this.template);
  }

  /**
     * Verifies the recovery code and updates the dialog state accordingly.
     * @async
     * @method
     * @param {Object} formData - The form data containing email and recovery code.
     * @param {HTMLButtonElement} submitButton - The submit button element.
     * @throws {Error} Throws an error if the verification fails.
     */
  async verifyRecoveryCode(formData, submitButton) {
    const warningElement = getById('forget-password-form__input-box__warning');
    const recoveryCodeInput = getById('forget-password-form__input-box').children[1];

    const passwordInput = generateHTML(this.dialogPasswordInput);

    const response = await window.ipcRenderer.invoke('reset-password', {
      email: formData.email,
      userRecoveryCode: formData.recoveryCode
    });

    if (response.toast) makeToastNotification(response.toast);
    console.log(response);

    if (response.status === 'success') {
      warningElement.textContent = 'Enter your new password';
      recoveryCodeInput.replaceWith(passwordInput);
      submitButton.textContent = 'Change Password';
      this.currentState = this.states.RECOVER;
    }
  }

  /**
     * Changes the user's password after successful recovery code verification.
     * @async
     * @method
     * @param {Object} formData - The form data containing email and new password.
     * @param {Event} event - The click event triggering the password change.
     * @throws {Error} Throws an error if the password change fails.
     */
  async changePassword(formData, event) {
    const response = await window.ipcRenderer.invoke('change-password', {
      email: formData.email,
      password: formData.password
    });

    if (response.toast) makeToastNotification(response.toast);

    if (response.status === 'success') {
      clearAndHideDialog();
      event.preventDefault();
    }
  }

  /**
     * Loads necessary scripts for the Forget Password Dialog.
     * @method
     * @private
     */
  loadScripts() {
    setTimeout(() => {
      const closeButton = getById(this.closeButtonId);
      const submitButton = getById(this.submitButtonId);

      closeButton.onclick = event => {
        clearAndHideDialog();
        event.preventDefault();
      };

      submitButton.onclick = async event => {
        event.preventDefault();
        const form = getById(this.formId);
        const formData = getFormData(form);

        switch (this.currentState) {
          case this.states.VERIFY:
            await this.verifyRecoveryCode(formData, submitButton);
            break;

          case this.states.RECOVER:
            await this.changePassword(formData, event);
            break;

          default:
            break;
        }
      };
    }, 0);
  }
}
