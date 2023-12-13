// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';

import {
  queryElements,
  getFormData,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// dialog
import ForgetPasswordDialog from '../components/ForgetPasswordDialog.js';

// main
import billing from '../../../billing/renderer/main/billing.js';
import register from './register.js';

// template
import loginTemplate from '../templates/login.js';

/**
 * @function login
 * @description Loads login template and events
 */
export default async function() {
  const template = loginTemplate();
  getById('container').innerHTML += template;

  window.onclick = async event => {
    switch (event.target.id) {
      case 'to-register-prompt':
        transition(register);
        return;

      case 'forgot-password':
        new ForgetPasswordDialog();
        return;

      case 'login-button':
        event.preventDefault();
        await loginUser();
        return;

      default:
        break;
    }
  };
}

/**
 * Logs in a user using the provided form data.
 *
 * @async
 * @return {Promise<void>} Resolves after the user login process is completed.
 */
async function loginUser() {
  const form = getById('login-form');
  const formData = getFormData(form);
  const invalidElements = queryElements('.invalid');

  if (invalidElements.length > 0) {
    makeToastNotification('Fix errors first');
    return;
  }

  const response = await window.ipcRenderer.invoke('login', formData);
  makeToastNotification(response.toast);

  if (response.status === 'success') {
    setTimeout(() => {
      /**
       * The timeout was added to fix issues where transition still doesnt happen
       * Despite response.status === 'success'
      */
      transition(billing);
    }, 500);
    return;
  }

  const responseHasFieldErrors = response.hasOwnProperty('fieldErrors');

  if (responseHasFieldErrors) {
    const {fieldErrors} = response;
    const fieldNames = Object.keys(fieldErrors);

    fieldNames.forEach(name => {
      const fieldElementErrorId = `${name}-field__info__error`;
      getById(fieldElementErrorId).textContent = fieldErrors[name];
    });
  }
}
