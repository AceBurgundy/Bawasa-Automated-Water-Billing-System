// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  queryElements,
  getFormData,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// dialog
import RecoveryCodesDialog from '../components/RecoveryCodesDialog.js';

// template
import registerTemplate from '../templates/register.js';

// main
import login from './login.js';

/**
 * @function register
 * @description Loads register template and events
 */
export default function() {
  const template = registerTemplate();
  getById('container').innerHTML += template;

  window.onclick = async event => {
    switch (event.target.id) {
      case 'to-login-prompt':
        transition(login);
        return;

      case 'register-button':
        event.preventDefault();
        await registerUser();
        return;

      default:
        break;
    }
  };
}

/**
 * Registers a new user based on the provided form data.
 *
 * @async
 * @return {Promise<void>} Resolves after the user registratiWon process is completed.
 */
async function registerUser() {
  const form = getById('register-form');
  const formData = getFormData(form);

  const invalidElements = queryElements('.invalid');

  if (invalidElements.length > 0) {
    makeToastNotification('Fix errors first');
    return;
  }

  const response = await window.ipcRenderer.invoke('register', formData);

  if (response.status === 'success') {
    new RecoveryCodesDialog(response.recoveryCodes);
    makeToastNotification(response.toast);
    transition(login);
    return;
  }

  makeToastNotification(response.toast);

  const hasFieldErrors = response.hasOwnProperty('fieldErrors');

  if (hasFieldErrors) {
    const {fieldErrors} = response;
    const fieldNames = Object.keys(fieldErrors);

    fieldNames.forEach(fieldName => {
      const fieldElementErrorId = `${fieldName.toLowerCase()}-field__info__error`;
      getById(fieldElementErrorId).textContent = fieldErrors[fieldName];
    });
  }
}
