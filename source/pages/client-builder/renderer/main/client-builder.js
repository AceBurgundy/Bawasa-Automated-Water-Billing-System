// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  queryElements,
  queryElement,
  getFormData,
  transition,
  getById
} from '../../../../assets/scripts/helper.js';

// components
import DocumentBoard from '../../../../components/DocumentBoard.js';
import InputCapture from '../../../../components/InputCapture.js';

// templates
import clientBuilderTemplate from '../templates/client-builder.js';

// main
import login from '../../../authentication/renderer/main/login.js';
import billing from '../../../billing/renderer/main/billing.js';
import profile from '../../../profile/renderer/main/profile.js';
import client from '../../../clients/renderer/main/clients.js';

// utilities
import '../../../../utilities/constants.js';

/**
 * Renders and manages a client registration or edit form.
 *
 * @function clientBuilder
 * @param {boolean} edit - Indicates whether the form is in edit mode.
 * @param {object} clientObject - The client data for pre-filling the form in edit mode.
 */
export default async function(edit, clientObject) {
  const forEdit = edit || null;
  const clientData = clientObject || null;

  getById('container').innerHTML += clientBuilderTemplate(forEdit, clientData);
  setTimeout(() => getById('section-type-container').classList.add('active'), 500);

  document.onclick = async event => {
    const targetId = event.target.getAttribute('id');

    switch (targetId) {
      case 'billing':
        transition(billing);
        return;

      case 'clients':
        transition(client);
        return;

      case 'profile':
        transition(profile);
        return;

      // removed await as we dont need to wait for anything
      // when loging out, it can simply logout
      // while transitioning to the login page
      case 'logout':
        window.ipcRenderer.invoke('logout');
        transition(login);
        return;
    }
  };

  const clientId = forEdit && clientData ? clientData.id : null;

  const imageCaptureBox = queryElement('.content__form-box__group__left');
  const fileUploadBox = queryElement('.files');

  const title = 'Client Documents';
  const clipBoardComponent = new DocumentBoard('clientFiles', forEdit, clientId, title);
  const captureComponent = new InputCapture('clientProfile', forEdit, clientData?.profilePicture );

  imageCaptureBox.parentElement.innerHTML += captureComponent;
  fileUploadBox.innerHTML = clipBoardComponent;

  const mergePresentAndMainAddressToggle = getById('mergePresentAndMainPrompt');
  const submitButton = getById('client-register-submit-button');
  const clientBuilderForm = getById('client-form');

  // Handle form submission
  submitButton.onclick = event => {
    event.preventDefault();
    if ( forEdit && clientData !== null) {
      handleFormSubmit(forEdit, clientData.id);
    } else {
      handleFormSubmit();
    }
  };

  // Handle merging addresses
  let duplicateAddress = false;

  // clears all input if duplicate address was unchecked else refills their values
  mergePresentAndMainAddressToggle.onchange = event => {
    duplicateAddress = event.target.checked;

    const addressType = duplicateAddress ? 'present' : 'main';
    const inputFields = queryElements(`input[name^='${addressType}']`);

    inputFields.forEach(input => {
      const targetName = input.name.replace(addressType, 'main');
      const targetInput = queryElement(`input[name='${targetName}']`);
      targetInput.value = duplicateAddress ? input.value : '';
    });
  };

  clientBuilderForm.onkeyup = event => {
    const target = event.target;
    /*
      if duplicate address is checked,
      any values placed inside present address fields also duplicates to main address fields
    */
    if (duplicateAddress) {
      const targetName = target.getAttribute('name');
      console.log('target name is: ', targetName ?? 'Cannot be found');

      if (!targetName) return;
      const oppositeElement = targetName.replace('present', 'main');
      queryElement(`input[name='${oppositeElement}']`).value = target.value;
    }

    const isFieldInput = target.classList.contains('form-field__input');
    const isPhoneNumberInput = isFieldInput && target.name === 'phoneNumber';
    const hasSibling = !!target.previousElementSibling;
    const siblingHasChildren = hasSibling && target.previousElementSibling.children.length > 0;
    let errorElement = siblingHasChildren ? target.previousElementSibling.children[1] : null;

    const hasErrorElement = errorElement && errorElement.textContent.trim() !== '';
    const hasErrorMessage = !isPhoneNumberInput && hasErrorElement;

    if (!isPhoneNumberInput && isFieldInput && hasErrorMessage) {
      errorElement.textContent = '';
    }

    if (isPhoneNumberInput) {
      errorElement = target.parentElement.previousElementSibling.children[1];
      if (errorElement.textContent.trim() !== '') {
        errorElement.textContent = '';
      }
    }
  };

  /**
   * Handles the form submission for adding or editing a client.
   * @async
   * @function
   * @param {boolean} forEdit - Indicates whether the form is for editing an existing client.
   * @param {string} clientId - The ID of the client for editing.
   * @return {Promise<void>}
   */
  async function handleFormSubmit(forEdit = false, clientId = null) {
    const form = clientBuilderForm;
    const formData = getFormData(form);

    const invalidElements = queryElements('.invalid');

    if (invalidElements.length > 0) {
      makeToastNotification('Fix errors first');
      return;
    }

    const submittedFilesList = extractFileData(clipBoardComponent.getFiles());
    const capturedPhoto = captureComponent.imageData;

    try {
      let purpose = 'add-client';

      if (forEdit && clientId) {
        purpose = 'edit-client';
        formData['profilePicture'] = capturedPhoto.image ?? null;
        formData['files'] = submittedFilesList ?? null;
        formData['clientId'] = clientId;
      } else {
        formData['image'] = capturedPhoto.image ?? null;
        formData['files'] = submittedFilesList ?? null;
      }

      const {toast, status, fieldErrors} = await window.ipcRenderer.invoke(purpose,
          JSON.stringify(formData)
      );

      console.log(toast);

      makeToastNotification(toast);
      showErrors(fieldErrors);

      if (status === 'success') {
        clipBoardComponent.clear();
        transition(client);
        return;
      }
    } catch (error) {
      console.log(error);
      return;
    }
  }
}


/**
 * Updates the error messages for each field in the response object.
 *
 * @param {Object}fieldErrors - contains the error messages for each field.
 * @param {Object} fieldErrors.name - The key of the object represent the field names.
 * @param {Object} fieldErrors.errorMessage - The value of the object respresent the error message.
 */
function showErrors(fieldErrors) {
  if (!fieldErrors) return;

  Object.entries(fieldErrors).forEach(([name, errorMessage]) => {
    const fieldName = name.replace(' ', '').toLowerCase();
    const errorElementId = `${fieldName}-field__info__error`;
    getById(errorElementId).textContent = errorMessage;
  });
}

/**
 * Extracts file data from a FileList object.
 *
 * @param {FileList | null} inputFiles - The FileList object containing
 * selected files, or null if no files were selected.
 * @return {Array<Object>} An array of file data objects, each containing
 * 'name', 'size', and 'path' properties.
 */
function extractFileData(inputFiles) {
  if (!inputFiles) return [];

  return Array.from(inputFiles).map(file => ({
    name: file.name,
    size: file.size,
    path: file.path
  }));
};
