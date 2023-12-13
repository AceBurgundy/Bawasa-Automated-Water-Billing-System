// helpers
import {camelToDashed, getById, queryElement} from '../assets/scripts/helper.js';
import makeToastNotification from '../assets/scripts/toast.js';

// icons
import {icons} from '../assets/scripts/icons.js';

// components
import {FilePreview} from './FilePreview.js';

/**
 * Represents a document board for handling file uploads.
 *
 * @name DocumentBoard
 * @class
 * @public
 */
export default class {
  /**
     * Creates a file drop element.
     *
     * @constructor
     * @param {string} name - The name of the field input field.
     * @param {boolean|null} forEdit - Indicates whether the form is for editing.
     * @param {string|null} clientId - The id of the client (forEdit must be true).
     * @param {string} title - The title of the document board.
     */
  constructor(name, forEdit, clientId, title) {
    if (forEdit && !clientId) {
      console.error(`
        Client id must not be null when document board will be used for editing
      `);
      return;
    }

    if (!forEdit && clientId) {
      console.error(`
        For edit must be true when client id is present
        as this implies that the document board will be used for editing
      `);
      return;
    }

    if (!name) {
      console.error('Name is missing');
      return;
    }

    if (!title) {
      console.error('Title is missing');
      return;
    }

    this.name = name;
    this.title = title;
    this.forEdit = forEdit;
    this.clientId = clientId;

    this.uploadedFiles = [];
    this.fileNamesFromDatabase = [];
    this.dashedName = camelToDashed(name);

    this.documentBoardId = `${this.dashedName}-field`;
    this.documentBoardLabel = `${this.dashedName}-form-field-info-label`;
    this.documentBoardErrorId = `${this.dashedName}-form-field__info__error`;
    this.documentBoardInputLabelId = `${this.dashedName}-field__drop`;
    this.documentBoardInputId = `${this.dashedName}-field__drop__input`;
    this.documentBoardDropMessageId = `${this.dashedName}-field__drop__message`;

    this.template = /* html */`
      <div id='${this.documentBoardId}' class='form-field'>
        <div class='${this.dashedName}-form-field__info'>
          <label
            id='${this.documentBoardLabel}'
            class='form-field__info__label'>
            ${this.title}
          </label>
          <p
            id='${this.documentBoardErrorId}'
            class='form-field__info__error'>
          </p>
        </div>
        <div id='${this.documentBoardInputLabelId}' class='form-field__drop'>
          <input
            type='file'
            id='${this.documentBoardInputId}'
            hidden
            name='${this.name}'
            multiple>
          <div
            id='${this.documentBoardDropMessageId}'
            class='form-field__drop__message'>
            ${ icons.uploadIcon('upload') }
            <p>
              Drop files or click here to upload documents
            </p>
            <p>
              Upload any files from desktop
            </p>
          </div>
        </div>
      </div>
    `;

    this.loadScripts();
  }

  /**
   * Returns the document board template string
   * @return {string}
   */
  toString() {
    return this.template;
  }

  /**
   * Clears all arrays
   */
  clear() {
    this.uploadedFiles = [];
    this.fileNamesFromDatabase = [];
  }

  /**
   * Updates the uploadedFiles array from the input:type hidden element.
   *
   * @param {boolean} noThumbnails - Whether the icons must be updated or not.
   * False by default
   * @return {void}
   */
  updateInputFiles(noThumbnails = false) {
    const dataTransfer = new DataTransfer();

    this.uploadedFiles.forEach(uploadedFile => dataTransfer.items.add(uploadedFile));

    const input = getById(this.documentBoardInputId);
    input.files = dataTransfer.files;

    if (noThumbnails) return;

    const addNewFileMessage = getById(this.documentBoardDropMessageId);
    const dropElement = getById(this.documentBoardInputLabelId);
    this.displayThumbnail(addNewFileMessage, dropElement, dropElement);
  }

  /**
   * Displays thumbnails for uploaded files.
   *
   * @param {HTMLDivElement} addNewFileMessage - The element displaying the
   * 'Drop files or click here to upload documents' message.
   * @param {HTMLLabelElement} dropElement - The drop zone element.
   * @return {void}
  */
  displayThumbnail(addNewFileMessage, dropElement) {
    const didUpload = this.uploadedFiles.length > 0;
    addNewFileMessage.style.display = didUpload ? 'none' : 'flex';

    Array.from(this.uploadedFiles).forEach((file, index) => {
      const filePreviewProperties = {
        deletePreview: this.deletePreview.bind(this),
        index: index,
        file: file
      };

      const previewExists = queryElement(`[data-preview-file-name='${file.name}']`);
      if (!previewExists) dropElement.innerHTML += new FilePreview(filePreviewProperties);
    });
  }

  /**
   * Gets the uploaded files.
   *
   * @return {Array<File>} An array of File objects representing the uploaded files.
  */
  getFiles() {
    return this.uploadedFiles;
  }

  /**
   * Deletes a file preview.
   *
   * @async
   * @function
   * @param {string} fileName - The name of the file to be deleted.
   * @return {boolean} Returns true if the file is successfully deleted, false otherwise.
  */
  async deletePreview(fileName) {
    const fileIndex = this.uploadedFiles.findIndex(uploadFile => uploadFile.name === fileName);

    // when a user deleted a file but its not in the input list
    if (fileIndex === -1) return false;

    try {
      this.uploadedFiles.splice(fileIndex, 1);
      this.updateInputFiles();

      if (this.forEdit && this.clientId && this.fileNamesFromDatabase.includes(fileName)) {
        const fileDeleted = await window.ipcRenderer.invoke('delete-file', {
          fileName: fileName,
          clientId: this.clientId
        });
        makeToastNotification(fileDeleted.toast);

        const deleted = fileDeleted.status === 'success';
        if (deleted) {
          const indexOfFile = this.fileNamesFromDatabase.indexOf(fileName);
          this.fileNamesFromDatabase.splice(indexOfFile, 1);
        }

        return deleted;
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * @param {HTMLDivElement} addNewFileMessage - The element displaying the
   * 'Drop files or click here to upload documents' message.
   * @param {HTMLLabelElement} dropElement - The drop zone element.
   * Retrieves the client's files only if used for editing.
  */
  async loadFiles(addNewFileMessage, dropElement) {
    if (this.forEdit && this.clientId) {
      const filesResponse = await window.ipcRenderer.invoke('get-files', this.clientId);

      if (filesResponse.status === 'success') {
        const dataTransfer = new DataTransfer();
        const filesData = JSON.parse(filesResponse.files);
        filesData.forEach(file => {
          dataTransfer.items.add(new File([file.content || ''], file.name));
          this.fileNamesFromDatabase.push(file.name);
        });

        this.uploadedFiles.push(...dataTransfer.files);
        this.displayThumbnail(addNewFileMessage, dropElement);
      }
    }
  }


  /**
   * Loads scripts for the document board.
   *
   * @function
   * @private
  */
  loadScripts() {
    setTimeout(async () => {
      const addNewFileMessage = getById(this.documentBoardDropMessageId);
      const dropElement = getById(this.documentBoardInputLabelId);
      const input = getById(this.documentBoardInputId);

      await this.loadFiles(addNewFileMessage, dropElement);
      window.ondragover = event => event.preventDefault();

      dropElement.onclick = () => input.click();

      dropElement.addEventListener('drop', event => {
        const files = event.dataTransfer.files;

        const uploadedFilesNames = this.uploadedFiles.map(file => file.name);
        const fileNames = Array.from(files).map(file => file.name);

        fileNames.forEach((name, index) => {
          if (!uploadedFilesNames.includes(name)) {
            this.uploadedFiles.push(files[index]);
          } else {
            makeToastNotification(`${name} already exists`);
          }
        });
        this.updateInputFiles();
      });

      dropElement.onclick = event => {
        const element = event.target;
        const deleteButtonClassName = 'form-field__drop__preview__delete';
        const isDeleteButton = element.classList.contains(deleteButtonClassName);

        if (isDeleteButton) {
          element.parentElement.style.display = 'none';
          const deleted = this.deletePreview(element.dataset.file);

          if (deleted) {
            element.parentElement.remove();
          } else {
            element.parentElement.style.display = 'block';
          }
        }
      };

      input.addEventListener('change', () => {
        [...input.files].forEach(file => this.uploadedFiles.push(file));
        this.displayThumbnail(addNewFileMessage, dropElement);
      });
    }, 0);
  }
}
