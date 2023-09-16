import { camelToDashed, showData } from "../helper.js";

const allowedAttributes = ["name", "placeholder", "title", "selected"];

/**
 * Represents a field for form input.
 * @constructor
 * @param {boolean} forEdit - Indicates if the field is for editing.
 * @param {Array<Function|Array>} validations - Array of validation functions or arrays with function and arguments.
 * @param {Object} props - Field properties.
 * @param {Array<string>} props.flags - Flags for the field.
 * @param {Object} props.attributes - Field attributes.
 * @param {string} props.attributes.name - Name of the field.
 * @param {Array<string>} props.classes - CSS classes for the field.
 */
class Field {

    constructor(forEdit, validations, props) {

        this.forEdit = forEdit;
        this.validations = validations;
        this.props = props;

        const { flags, attributes, classes } = props;
        const { name } = attributes;

        this.dashedName = camelToDashed(name);
        this.flags = flags || [];
        this.attributes = attributes;
        this.classes = classes || [];

        this.render();
    }

    /**
     * Cleans attributes by removing disallowed ones and converting them to from attribute: value -> attribute="value".
     * @returns {string} - An string array of cleaned attributes.
     */
    cleanAttributes() {
        return Object.entries(this.attributes)
            .filter(([key, value]) => !allowedAttributes.includes(key))
            .map(([key, value]) => `${camelToDashed(key)}="${value}"`).join(" ");
    }

    /**
     * Displays an error message for the field.
     * @param {string} message - The error message to display.
     */
    showError(message) {
        const inputElement = document.querySelector(`#${this.dashedName}-field__input`);
        const error = document.querySelector(`#${this.dashedName}-field__info__error`);

        inputElement.classList.add("invalid");
        error.textContent = message;
    }

    /**
     * Clears the error message for the field.
     */
    clearError() {
        const inputElement = document.querySelector(`#${this.dashedName}-field__input`);
        const error = document.querySelector(`#${this.dashedName}-field__info__error`);

        inputElement.classList.remove("invalid");
        error.textContent = '';
    }

    /**
     * Renders the label and error message for the field.
     * @returns {string} - A string containing the label and error message HTML.
     */
    renderLabelAndError() {
        const { title } = this.attributes;
        const label = title ? `<label id="${this.dashedName}-field__info__label" class="form-field__info__label">${title}</label>` : '';
        const error = `<p id="${this.dashedName}-field__info__error" class="form-field__info__error"></p>`;
        
        return `${label} ${error}`;
    }

    /**
     * Renders the specific field element.
     * @abstract
     * @throws {Error} - Throws an error if the method is not implemented by subclasses.
     * @returns {string} - A string containing the HTML for the field element.
     */
    renderField() {
        // This method should be implemented by subclasses (Input and Select)
        throw new Error("renderField method must be implemented by subclasses");
    }

    /**
     * Renders the complete field template.
     * @returns {string} - A string containing the HTML for the entire field.
     */
    render() {
        const labelAndError = this.renderLabelAndError();
        const field = this.renderField();
        
        const template = `
            <div id="${this.dashedName}-field" class="form-field">
                <div id="${this.dashedName}-field__info" class="form-field__info">
                    ${labelAndError}
                </div>
                ${field}
            </div>
        `;

        window.addEventListener("DOMContentLoaded", () => {

            setTimeout(() => {

                const inputElement = document.querySelector(`#${this.dashedName}-field__input`);
                
                inputElement.oninput = () => {

                    if (this.validations) {

                        for (const validate of this.validations) {

                            if (typeof validate === 'function') {

                                const result = validate(inputElement.value.trim());

                                if (result.passed === false) {
                                    this.showError(result.message);
                                    break;
                                } else {
                                    this.clearError();
                                }
                            } 
                            
                            if (Array.isArray(validate) && validate.length >= 2 && typeof validate[0] === 'function') {

                                const [validateFunction, ...args] = validate;

                                const result = validateFunction(...args, inputElement.value.trim());

                                if (result.passed === false) {
                                    this.showError(result.message);
                                    break;
                                } else {
                                    this.clearError();
                                }
                            }
                        }
                    }
                }            

            }, 0);

        });

        return template
    }
}

export { Field };