// helpers
import makeToastNotification from '../../../../assets/scripts/toast.js';
import {
  toSentenceCase,
  queryElements,
  camelToDashed,
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
import billing from '../../../billing/renderer/main/billing.js';
import client from '../../../clients/renderer/main/clients.js';
import profile from '../../../profile/renderer/main/profile.js';

// constants
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

  document.onclick = event => {
    const targetId = event.target.getAttribute('id');

    switch (targetId) {
      case 'billing':
        transition(billing);
        break;

      case 'clients':
        transition(client);
        break;

      case 'profile':
        transition(profile);
        break;
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
    const forEditingClient = forEdit && clientData !== null;
    const submitArguments = forEditingClient ? [...forEdit, clientData.id] : [];
    handleFormSubmit(submitArguments);
    event.preventDefault();
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

  /*
        if duplicate address is checked,
        any values placed inside present address fields also duplicates to main address fields
    */
  clientBuilderForm.onkeyup = ({target}) => {
    if (duplicateAddress) {
      const targetName = target.getAttribute('name').replace('present', 'main');
      queryElement(`input[name='${targetName}']`).value = target.value;
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

    let response = null;

    if (forEdit && clientId) {
      response = await window.ipcRenderer.invoke('edit-client', {
        formDataBuffer: {
          formData: formData,
          profilePicture: capturedPhoto.image
        },
        clientId: clientId
      });
    } else {
      response = await window.ipcRenderer.invoke('add-client', {
        formData: formData,
        image: capturedPhoto.image,
        files: submittedFilesList
      });
    }

    if (response.status === 'success') {
      response.toast.forEach(toast => makeToastNotification(toast));
      transition(client);
      return;
    }

    if (response.fieldErrors) {
      Object.entries(response.fieldErrors).forEach(([name, error]) => {
        const dashedName = camelToDashed(name);
        const cleanName = dashedName.includes('-') ? dashedName.split('-').join(' ') : dashedName;
        const cleanErrorMessage = toSentenceCase([cleanName, error[0]].join(' '));
        getById(`${dashedName}-field__info__error`).textContent = error[0];
        makeToastNotification(cleanErrorMessage);
      });
    }

    response.toast.forEach(toast => makeToastNotification(toast));
  }
}

/**
 * Extracts file data from a FileList object.
 *
 * @param {FileList | null} inputFiles - The FileList object containing
 * selected files, or null if no files were selected.
 * @return {Array<Object>} An array of file data objects, each containing
 * 'name', 'size', and 'path' properties.
 */
const extractFileData = inputFiles => {
  if (!inputFiles) return [];

  return Array.from(inputFiles).map(file => ({
    name: file.name,
    size: file.size,
    path: file.path
  }));
};
