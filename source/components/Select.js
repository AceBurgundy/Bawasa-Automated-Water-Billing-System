import Field from './Field.js';

/**
 * Represents a Select field that extends the base Field class.
 * This class is used to create HTML select input fields with various options.
 * @name Select
 * @class
 * @extends Field
 * @example
 * new Select({}, {
 *   attributes: {
 *     name: 'mySelect',
 *     placeholder: 'Choose an option',
 *  },
 *   options: {
 *     option1: 'Option 1',
 *     option2: 'Option 2',
 *  },
 *   classes: ['input-type'],
 *   flags: ['required', 'readonly']
 *})
 */
export default class extends Field {
  /**
   * Create a Select field.
   * @param {object} validations - The validations to apply.
   * @param {object} props - The field's properties.
   */
  constructor(validations, props) {
    super(validations, props);
  }

  /**
   * Get a string representation of the Select field.
   * @return {string} The rendered HTML.
   */
  toString() {
    return this.render();
  }

  /**
   * Render the Select field.
   * @return {string} The rendered HTML.
   */
  renderField() {
    /**
     * Evaluation result object.
     * @property {boolean} evalStatus - The evaluation status.
     * @property {string} evalMessage - The evaluation message.
     */
    const {evalStatus, evalMessage} = this.evaluateProps();
    if (evalStatus === false) return evalMessage;

    const {name, placeholder} = this.attributes;
    const {options} = this.props;

    const selectAttributes = this.cleanAttributes(this.attributes);
    const cleanClasses = this.cleanClasses(this.classes);

    return /* html */`
      <select
        class='input-style form-field__input ${cleanClasses}'
        id='${this.id}'
        name='${name}'
        ${selectAttributes}
        ${this.flags}>
      <option disabled selected>
        ${placeholder !== undefined ? placeholder : 'Select'}
      </option>
        ${this.renderOptions(options)}
      </select>
    `;
  }

  /**
   * Evaluate the field's properties.
   * @return {EvaluationResult} The evaluation result.
   */
  evaluateProps() {
    /**
     * Error message.
     * @param {string} error - The error message.
     * @return {EvaluationResult} The evaluation result with an error message.
     */
    const error = error => {
      console.error(error);
      return {evalStatus: false, evalMessage: error};
    };

    if (this.props.hasOwnProperty('id')) {
      return error(`id is not required as name stands as id`);
    };

    const dataIsArray = data => Array.isArray(this.props[data]);
    const dataIsObject = data => typeof this.props[data] === 'object';

    for (const data of ['flags', 'attributes', 'options']) {
      if ([data !== 'attributes', data !== 'options'].every(Boolean) && !dataIsArray(data)) {
        return error(`${data} must be an array`);
      }

      if ([data === 'attributes', data === 'options'].some(Boolean) && !dataIsObject(data)) {
        return error(`${data} must be key value pairs`);
      }

      if (!this.props.hasOwnProperty(data)) {
        return error(`Missing ${data} for select attribute`);
      }
    }

    return {evalStatus: true, evalMessage: ''};
  }

  /**
   * Render the Select field's options.
   * @param {object} options - The field's options.
   * @return {string} The rendered options HTML.
   */
  renderOptions(options) {
    return Object.entries(options)
        .map(([key, value]) => {
          return this.attributes.selected &&
            this.attributes.selected === value ?
            `<option value='${key}' selected>${value}</option>` :
            `<option value='${key}'>${value}</option>`;
        })
        .join('\n');
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

