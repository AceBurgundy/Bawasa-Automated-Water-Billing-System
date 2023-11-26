import Field from "./Field.js"

/**
 * Represents an input field that extends the base Field class.
 * This class is used to create HTML input fields with various attributes and options.
 * @extends Field
 * @constructor
 * @param {object} validations - The validation rules to apply to the input field.
 * @param {object} props - Additional properties for configuring the input field.
 * @throws {Error} Throws an error if invalid properties are provided.
 * @example
 * new Input([], {
 *   attributes: {
 *     name: 'username',
 *     type: 'text',
 *     placeholder: 'Enter your username',
 *   },
 *   classes: ["input-type"],
 *   flags: ["required", "readonly"]
 * });
 */
export default class Input extends Field {
    /**
     * Creates an instance of Input.
     * @param {object} validations - Object containing validation rules.
     * @param {object} props - Additional properties for the input.
     */
    constructor(validations, props) {
        super(validations, props)
    }

    /**
     * Converts the input to its string representation.
     * @returns {string} The rendered input as a string.
     */
    toString() {
        return this.render()
    }

    /**
     * Renders the input field.
     * @returns {string} The HTML representation of the input field.
     */
    renderField() {

        const { name } = this.attributes
        const inputAttributes = this.cleanAttributes(this.attributes)
        const cleanClasses = this.cleanClasses(this.classes)
        const isPhoneNumberFieldAndReadOnly = this.classes.includes("input-readonly") && this.classes.includes("number-input") 

        return `
            ${
                this.classes.includes("number-input") ? ` 
                    <div class="input-style ${isPhoneNumberFieldAndReadOnly ? "input-readonly" : ''}">
                        <div class="country-code">
                            +63
                        </div>
                        <input id="${this.id}" name="${name}" class="form-field__input number-input ${cleanClasses}" ${inputAttributes} ${this.flags}>
                    </div> `
                : `
                    <input id="${this.id}" name="${name}" class="form-field__input ${this.classes}" ${inputAttributes} ${this.flags}>
                `
            }
        `
    }

    /**
     * Cleans and formats the input classes.
     * @param {string[]} classes - An array of classes to clean and format.
     * @returns {string} The cleaned and formatted classes as a string.
     */
    cleanClasses(classes) {
        return classes.length > 0 ? classes.join(" ") : ""
    }

}
