import { camelToDashed, generateUniqueId, getById } from "../helper.js";

const allowedAttributes = ["name", "label", "selected"];

/**
 * Represents a field for form input.
 * @constructor
 * @param {Array<Function|Array>} validations - Array of validation functions or arrays with function and arguments.
 * @param {Object} props - Field properties.
 * @param {Array<string>} props.flags - Flags for the field.
 * @param {Object} props.attributes - Field attributes.
 * @param {string} props.attributes.name - Name of the field.
 * @param {Array<string>} props.classes - CSS classes for the field.
 */
class Field {

    constructor(validations, props) {

        this.validations = validations;
        this.props = props;

        const { flags, attributes, classes } = props;
        const { name, value } = attributes;

        this.value = value
        this.dashedName = camelToDashed(name);
        this.flags = flags || [];
        this.attributes = attributes;
        this.classes = classes || [];
        this.id = generateUniqueId()

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
        const inputElement = getById(this.id);
        const error = document.querySelector(`#${this.dashedName}-field__info__error`);

        inputElement.classList.add("invalid");
        error.textContent = message;
    }

    /**
     * Clears the error message for the field.
     */
    clearError() {
        const inputElement = getById(this.id);
        const error = document.querySelector(`#${this.dashedName}-field__info__error`);

        inputElement.classList.remove("invalid");
        error.textContent = '';
    }

    /**
     * Renders the label and error message for the field.
     * @returns {string} - A string containing the label and error message HTML.
     */
    renderLabelAndError() {
        const { label } = this.attributes;
        const title = label ? `<label id="${this.dashedName}-field__info__label" class="form-field__info__label">${label}</label>` : '';
        const error = `<p id="${this.dashedName}-field__info__error" class="form-field__info__error"></p>`;
        
        return `${title} ${error}`;
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
     * @abstract
     * @throws {Error} - Throws an error if the method is not implemented by subclasses.
     * @returns {string} - A string containing the HTML for the entire field.
     */
    render() {

        const labelAndError = this.renderLabelAndError()
        const field = this.renderField()

        const template = `
            <div id="${this.dashedName}-field" class="form-field">
                <div id="${this.dashedName}-field__info" class="form-field__info">
                    ${labelAndError}
                </div>
                ${field} 
            </div>
        `

        setTimeout(() => {

            const inputElement = getById(this.id)

            if (document.body.contains(inputElement)) {

                inputElement.oninput = () => {

                    if (this.validations) {

                        for (const validate of this.validations) {

                            if (typeof validate === "function") {

                                const result = validate(inputElement.value.trim())
                                
                                if (result.passed === false) {
                                    this.showError(result.message)
                                    break
                                } else {
                                    this.clearError()
                                }
                            }

                            if ( Array.isArray(validate) && validate.length >= 2 && typeof validate[0] === "function") {
                                const [validateFunction, ...args] = validate

                                const result = validateFunction( ...args, inputElement.value.trim())

                                if (result.passed === false) {
                                    this.showError(result.message)
                                    break
                                } else {
                                    this.clearError()
                                }
                            }
                        }
                    }
                }
            }
        }, 0)

        return template
    }

}

export { Field };
