// helpers
import {camelToDashed, generateUniqueId, getById} from '../assets/scripts/helper.js';

const allowedAttributes = ['name', 'label', 'selected'];

/**
 * Represents a field for form input.
 * @name Field
 * @class
 * @public
 */
export default class {
  /**
   * Creates an instance of a form field.
   * @class
   * @constructor
   * @param {Array<Function|Array>} validations - Array of validation functions
   * or arrays with function and arguments.
   * @param {Object} props - Field properties.
   * @param {Array<string>} props.flags - Flags for the field.
   * @param {Object} props.attributes - Field attributes.
   * @param {string} props.attributes.name - Name of the field.
   * @param {Array<string>} props.classes - CSS classes for the field.
   */
  constructor(validations, props) {
    this.validations = validations;
    this.props = props;

    const {flags, attributes, classes} = props;
    const {name, value} = attributes;

    this.dashedName = camelToDashed(name);

    this.id = generateUniqueId(this.dashedName);
    this.classes = classes || [];
    this.attributes = attributes;
    this.flags = flags || [];
    this.value = value;

    this.render();
  }

  /**
   * Cleans attributes by removing disallowed ones and
   * converting them to from attribute: value -> attribute='value'.
   * @method
   * @return {string} An string array of cleaned attributes.
   */
  cleanAttributes() {
    return Object.entries(this.attributes)
        .filter(([key, value]) => !allowedAttributes.includes(key))
        .map(([key, value]) => `${camelToDashed(key)}='${value}'`).join(' ');
  }

  /**
   * Displays an error message for the field.
   * @method
   * @param {string} message - The error message to display.
   */
  showError(message) {
    const inputElement = getById(this.id);
    const error = document.querySelector(`#${this.dashedName}-field__info__error`);

    inputElement.classList.add('invalid');
    error.textContent = message;
  }

  /**
   * Clears the error message for the field.
   * @method
   */
  clearError() {
    const inputElement = getById(this.id);
    const error = document.querySelector(`#${this.dashedName}-field__info__error`);

    inputElement.classList.remove('invalid');
    error.textContent = '';
  }

  /**
   * Renders the label and error message for the field.
   * @method
   * @return {string} A string containing the label and error message HTML.
   */
  renderLabelAndError() {
    const {label} = this.attributes;
    const title = label ? `
      <label
        id='${this.dashedName}-field__info__label'
        class='form-field__info__label'>${label}
      </label>
    ` : '';
    const error = `
      <p
        id='${this.dashedName}-field__info__error'
        class='form-field__info__error'>
      </p>
    `;

    return `${title} ${error}`;
  }

  /**
   * Renders the specific field element.
   * @method
   * @abstract
   * @throws {Error} Throws an error if the method is not implemented by subclasses.
   * @return {string} A string containing the HTML for the field element.
   */
  renderField() {
    throw new Error('renderField method must be implemented by subclasses');
  }

  /**
   * Renders the complete field template.
   * @method
   * @abstract
   * @throws {Error} Throws an error if the method is not implemented by subclasses.
   * @return {string} A string containing the HTML for the entire field.
   */
  render() {
    const labelAndError = this.renderLabelAndError();
    const field = this.renderField();

    const template = /* html */`
      <div id='${this.dashedName}-field' class='form-field'>
        <div id='${this.dashedName}-field__info' class='form-field__info'>
          ${labelAndError}
        </div>
        ${field}
      </div>
    `;

    setTimeout(() => {
      const inputElement = getById(this.id);
      if (!inputElement) return;

      inputElement.oninput = () => {
        const trimmedValue = inputElement.value.trim();
        if (!this.validations) return;

        for (const validation of this.validations) {
          const validationIsAFunction = typeof validation === 'function';

          if (validationIsAFunction) {
            const {passed, message} = validation(trimmedValue);

            if (passed === false) {
              this.showError(message);
              break;
            }
            this.clearError();
          }

          if (!Array.isArray(validation)) return;

          if (validation.length >= 2 && typeof validation[0] === 'function') {
            const [validateFunction, ...args] = validation;
            const {passed, message} = validateFunction(...args, trimmedValue);

            if (passed === false) {
              this.showError(message);
              break;
            }

            this.clearError();
          }
        }
      };
    }, 0);

    return template;
  }
}
