import {getById} from '../assets/scripts/helper.js';

const fileTypeIcons = {
  'application/pdf': 'pdf-icon.PNG',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx-icon.PNG',
  'application/msword': 'doc-icon.PNG',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'sheet-icon.PNG',
  'application/vnd.ms-excel': 'sheet-icon.PNG',
  'text/csv': 'sheet-icon.PNG'
};

const getFileIcon = fileType => {
  return Object.keys(fileTypeIcons).find(type => fileType.includes(type)) || 'default-icon.png';
};

/* eslint-disable max-len */
/**
 * Represents a file preview element.
 * @class
 */
export class FilePreview {
  /**
   * Creates a preview element for a file.
   * @constructor
   * @param {Object} props - An object containing the following properties:
   * @param {method} props.deletePreview - The method to delete the preview (From DocumentBoard).
   * @param {number} props.index - The index used to uniquely identify each instance of FilePreview.
   * @param {File} props.file - The file for which the preview is created.
   */
  constructor(props) {
    this.deletePreview = props.deletePreview;
    this.index = props.index;
    this.file = props.file;

    this.deleteButtonId = ['form-field-drop-preview-delete', this.index].join('-');
    this.imageId = ['form-field-drop-preview-image', this.index].join('-');
    this.previewId = ['form-field-drop-preview', this.index].join('-');

    this.template = /* html */`
      <div id='${this.previewId}' class='form-field__drop__preview' data-preview-file-name='${this.file.name}'>
        <div id='${this.deleteButtonId}' class='form-field__drop__preview__delete' data-file="${props.file.name}">
          Remove
        </div>
        <img id='${this.imageId}' class='form-field__drop__preview__image' src='' alt='${this.file.name}'>
        <p class='form-field__drop__preview__text'>${this.file.name}</p>
      </div>
    `;

    this.loadScript();
  }

  /**
   * Returns the HTML string representation of the FilePreview.
   * @method
   * @return {string} - The HTML string of the FilePreview.
   */
  toString = () => this.template;

  /**
   * Gets the icon file path for the file type.
   * @async
   * @method
   * @return {Promise<string>} - The icon file path.
   */
  async getFileIcon() {
    const fileIsImage = this.file.type.includes('image/');
    const iconFileName = getFileIcon(this.file.type);

    const getIconFilePath = async iconFileName => {
      return await window.ipcRenderer.invoke('get-icon-path', iconFileName);
    };

    // if image, return the file's path as the src for the image else, use an icon
    return fileIsImage ? this.file.path : await getIconFilePath(iconFileName);
  }

  /**
   * Loads scripts for the FilePreview element.
   * @method
   * @private
   */
  loadScript() {
    setTimeout(async () => {
      const image = getById(this.imageId);
      if (image) image.src = await this.getFileIcon();
    }, 0);
  }
}
