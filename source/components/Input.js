import Field from './Field.js';

/**
 * Represents an input field that extends the base Field class.
 * This class is used to create HTML input fields with various attributes and options.
 * @name Input
 * @class
 * @public
 * @extends Field
 * @example
 * new Input([], {
 *   attributes: {
 *     name: 'username',
 *     type: 'text',
 *     placeholder: 'Enter your username',
 *  },
 *   classes: ['input-type'],
 *   flags: ['required', 'readonly']
 *});
 */
export default class extends Field {
  /**
     * Creates an instance of Input.
     * @param {object} validations - Object containing validation rules.
     * @param {object} props - Additional properties for the input.
     */
  constructor(validations, props) {
    super(validations, props);
  }

  /**
     * Converts the input to its string representation.
     * @return {string} The rendered input as a string.
     */
  toString() {
    return this.render();
  }

  /**
     * Renders the input field.
     * @return {string} The HTML representation of the input field.
     */
  renderField() {
    const {name} = this.attributes;
    const inputAttributes = this.cleanAttributes(this.attributes);
    const cleanClasses = this.cleanClasses(this.classes);
    const isPhoneNumber = this.classes.includes('number-input');
    const isReadOnly = this.classes.includes('input-readonly');

    return /* html */`
      ${
        this.classes.includes('number-input') ? `
          <div class='input-style ${isPhoneNumber && isReadOnly ? 'input-readonly' : ''}'>
            <div class='country-code'>
              +63
            </div>
            <input
              class='form-field__input number-input ${cleanClasses}'
              ${inputAttributes}
              id='${this.id}'
              name='${name}'
              ${this.flags}>
          </div> ` :
        `
          <input
            class='form-field__input ${this.classes}'
            ${inputAttributes}
            id='${this.id}'
            name='${name}'
            ${this.flags}>
        `}
    `;
  }

  /**
     * Cleans and formats the input classes.
     * @param {string[]} classes - An array of classes to clean and format.
     * @return {string} The cleaned and formatted classes as a string.
     */
  cleanClasses(classes) {
    return classes.length > 0 ? classes.join(' ') : '';
  }
}
