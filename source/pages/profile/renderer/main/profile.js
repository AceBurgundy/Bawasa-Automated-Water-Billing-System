// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  toSentenceCase,
  camelToDashed,
  queryElements,
  queryElement,
  getFormData,
  transition,
  getById,
  camelCaseToTitleCase
} from '../../../../assets/scripts/helper.js';

// user
import currentUser from '../../../../assets/scripts/current-user.js';

// main
import login from '../../../authentication/renderer/main/login.js';
import billing from '../../../billing/renderer/main/billing.js';
import client from '../../../clients/renderer/main/clients.js';

// templates
import profileTemplate from '../templates/profile.js';

// constants
import '../../../../utilities/constants.js';

/**
 * Renders and manages a user registration or edit form.
 *
 * @async
 * @function
 * @param {boolean} forEdit - Indicates whether the form is in edit mode.
*/
export default async function profile(forEdit = false) {
  const userData = await currentUser();

  if (!userData && forEdit) {
    console.error('Cannot find user for the profile');
    return;
  }

  getById('container').innerHTML += profileTemplate(forEdit, userData);

  // Handle merging addresses
  let duplicateAddress = false;

  window.onclick = async event => {
    const {target} = event;
    const targetText = target.textContent.trim();
    const elementId = target.id;

    switch (elementId) {
      case 'billing':
        transition(billing);
        return;

      case 'clients':
        transition(client);
        return;

      // removed await as we dont need to wait for anything
      // when loging out, it can simply logout
      // while transitioning to the login page
      case 'logout':
        window.ipcRenderer.invoke('logout');
        transition(login);
        return;

      case 'merge-addresses-checkbox':
        target.onchange = event => {
          duplicateAddress = event.target.checked;
          const addressType = duplicateAddress ? 'present' : 'main';
          const inputFields = queryElements(`input[name^='${addressType}']`);

          inputFields.forEach(input => {
            const targetName = input.name.replace(addressType, 'main');
            const targetInput = queryElement(`input[name='${targetName}']`);
            targetInput.value = duplicateAddress ? input.value : '';
          });
        };
        break;

      case 'user-register-submit-button':
        event.preventDefault();

        if (targetText === 'Edit') {
          transition(async () =>
            profile(true)
          );
        } else {
          handleFormSubmit(userData.id);
          return;
        }
        break;
    }
  };

  const userFormForEdit = getById('user-form-edit');

  if (userFormForEdit) {
    /**
     * if duplicate address is checked,
     * any values placed inside present address fields also duplicates to main address fields
    */
    userFormForEdit.oninput = ({target}) => {
      if (duplicateAddress) {
        const targetName = target.getAttribute('name').replace('present', 'main');
        queryElement(`input[name='${targetName}']`).value = target.value;
      }
    };
  }
  /**
   * Handles form submission
   * @param {Object} userId - user form data
   * @return {void}
   */
  async function handleFormSubmit(userId) {
    const formData = getFormData(userFormForEdit);

    const invalidElements = queryElements('.invalid');
    if (invalidElements.length > 0) {
      makeToastNotification('Fix errors first');
      return;
    };

    const filled = checkIfAddressAreFilled(formData);

    if (!filled) {
      makeToastNotification(`
        All fields for both addresses
        must be filled first especially for new users
      `);
      return;
    }

    let response = null;

    response = await window.ipcRenderer.invoke('edit-user', {
      formDataBuffer: {
        formData: formData
      },
      userId: userId
    });

    if (response.status === 'success') {
      makeToastNotification(response.toast);
      transition(profile);
      return;
    }

    if (response.fieldErrors) {
      Object.entries(response.fieldErrors).forEach(([name, error]) => {
        if (name.includes('mainAddress') || name.includes('presentAddress')) {
          const dashedName = camelToDashed(name);
          const cleanErrorMessage = [camelCaseToTitleCase(name), error[0]].join(' ');
          getById(`${dashedName}-field__info__error`).textContent = error[0];
          makeToastNotification(cleanErrorMessage);
          return;
        }

        const dashedName = camelToDashed(name);
        const cleanName = dashedName.includes('-') ? dashedName.split('-').join(' ') : dashedName;
        const cleanErrorMessage = toSentenceCase([cleanName, error[0]].join(' '));
        getById(`${dashedName}-field__info__error`).textContent = error[0];
        makeToastNotification(cleanErrorMessage);
      });
    }

    makeToastNotification(response.toast);
  }

  /**
   * The function checks if all address inputs in a form are filled.
   * @param {Object} formData - Contains key-value pairs representing
   * form data. The keys are the names of the form inputs,
   * and the values are the corresponding values
   * entered by the user.
   * @return {boolean} indicates whether all address
   * inputs in the formData object are filled or not.
   */
  function checkIfAddressAreFilled(formData) {
    const addressesSelector = '[name^="mainAddress"], [name^="presentAddress"]';
    const addressInputsCount = [...queryElements(addressesSelector)].length;
    let filledAddressesCount = 0;

    for (const [key, value] of Object.entries(formData)) {
      if (key.includes('mainAddress') || key.includes('presentAddress')) {
        if (value.trim() !== '') {
          filledAddressesCount++;
        }
      }
    }

    return filledAddressesCount === addressInputsCount;
  }
}
